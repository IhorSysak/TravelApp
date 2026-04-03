using BookingService.Context;
using BookingService.Hubs;
using BookingService.Models.Booking;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore.ValueGeneration.Internal;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System.Text;
using System.Text.Json;

namespace BookingService.Messaging
{
    public class BookingConsumer(
        IConnectionFactory factory,
        IHubContext<BookingHub> hubContext,
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
                    var bookingDto = JsonSerializer.Deserialize<BookingRequestDto>(json);
                    if (bookingDto is not null)
                    {
                        logger.LogInformation("New booking for trip {TripId} — passanger {PassengerName}", bookingDto.TripId, bookingDto.PassengerName);

                        await hubContext.Clients
                            .Group($"driver-{bookingDto.DriverId}")
                            .SendAsync("NewBooking",
                            new
                            {
                                bookingDto.TripId,
                                bookingDto.PassengerName,
                                bookingDto.PassengerEmail,
                                bookingDto.From,
                                bookingDto.To,
                                bookingDto.Seats,
                                bookingDto.TotalPrice
                            }, cancellation);
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
