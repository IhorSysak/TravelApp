using BookingService.Context;
using BookingService.Entities;
using BookingService.Hubs;
using BookingService.Mapper;
using BookingService.Models.Booking;
using Microsoft.AspNetCore.SignalR;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System.Text;
using System.Text.Json;

namespace BookingService.Messaging
{
    public class BookingConsumer(
        IConnectionFactory factory,
        IHubContext<BookingHub> hubContext,
        IServiceScopeFactory scopeFactory,
        ILogger<BookingConsumer> logger) : BackgroundService
    {
        protected override async Task ExecuteAsync(CancellationToken cancellation)
        {
            var connection = await factory.CreateConnectionAsync(cancellation);
            var channel = await connection.CreateChannelAsync(cancellationToken: cancellation);

            await channel.QueueDeclareAsync(
                queue: "booking",
                durable: true,
                exclusive: false,
                autoDelete: false,
                arguments: null,
                cancellationToken: cancellation);

            // Process max 10 messages at a time before acking
            await channel.BasicQosAsync(prefetchSize: 0, prefetchCount: 10, global: false);

            var consumer = new AsyncEventingBasicConsumer(channel);
            consumer.ReceivedAsync += async (sender, eventArgs) =>
            {
                try
                {
                    var json = Encoding.UTF8.GetString(eventArgs.Body.ToArray());
                    var bookingDto = JsonSerializer.Deserialize<BookingConsumerRequestDto>(json);
                    if (bookingDto is not null)
                    {
                        logger.LogInformation("New booking for driver {DriverId} — frim passanger {PassengerName}", bookingDto.DriverId, bookingDto.PassengerName);

                        using var scope = scopeFactory.CreateScope();
                        var dbContext = scope.ServiceProvider.GetRequiredService<BookingContext>();

                        var notification = bookingDto.ToEntity();

                        dbContext.Notifications.Add(notification);
                        await dbContext.SaveChangesAsync(cancellation);

                        await hubContext.Clients.Group($"driver-{bookingDto.DriverId}").SendAsync("NewBooking", notification.ToResponseDto(), cancellation);
                    }

                    // Acknowledge the message after processing
                    await channel.BasicAckAsync(eventArgs.DeliveryTag, multiple: false);
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Failed to process booking message");
                    await channel.BasicNackAsync(eventArgs.DeliveryTag, multiple: false, requeue: true);
                }
            };

            await channel.BasicConsumeAsync(queue: "booking", autoAck: false, consumer: consumer, cancellationToken: cancellation);

            logger.LogInformation("Booking consumer started, waiting for messages...");

            await Task.Delay(Timeout.Infinite, cancellation);
        }
    }
}
