using Contracts;
using MassTransit;
using MongoDB.Entities;

namespace BiddingService.Consumers;

public class AuctionCreatedConsumer : IConsumer<AuctionCreated>
{
    public async Task Consume(ConsumeContext<AuctionCreated> context)
    {
        Console.WriteLine("=== AUCTION CREATED CONSUMER HIT ===");
        Console.WriteLine($"Auction ID: {context.Message.Id}");
        Console.WriteLine($"Seller: {context.Message.Seller}");
        
        try
        {
            var auction = new Auction
            {
                ID = context.Message.Id.ToString(),
                Seller = context.Message.Seller,
                AuctionEnd = context.Message.AuctionEnd,
                ReservePrice = context.Message.ReservePrice
            };

            await auction.SaveAsync();
            Console.WriteLine($"=== SUCCESSFULLY SAVED AUCTION {auction.ID} ===");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"=== ERROR SAVING AUCTION: {ex.Message} ===");
            throw;
        }
    }
}