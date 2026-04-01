using RabbitMQ.Client;
using System.Text;
using System.Text.Json;

namespace BookingService.Messaging
{
    public interface IMessageProducer
    {
        public Task SendingMessageAsync<T>(T message);
    }

    public class MessageProducer(IConnection connection, IChannel channel) : IMessageProducer, IAsyncDisposable
    {
        public static async Task<MessageProducer> CreateAsync(IConnectionFactory factory)
        {
            var connection = await factory.CreateConnectionAsync();
            var channel = await connection.CreateChannelAsync();

            await channel.QueueDeclareAsync(
                queue: "booking",
                durable: true,
                exclusive: false,
                autoDelete: false,
                arguments: null);

            return new MessageProducer(connection, channel);
        }

        public async Task SendingMessageAsync<T>(T message)
        {
            var body = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(message));

            await channel.BasicPublishAsync(
                exchange: string.Empty,
                routingKey: "booking",
                mandatory: true,
                basicProperties: new BasicProperties { Persistent = true },
                body: body);
        }

        public async ValueTask DisposeAsync()
        {
            await channel.CloseAsync();
            await connection.CloseAsync();
        }
    }
}
