using BiddingService;
using BiddingService.Consumers;
using MassTransit;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using MongoDB.Driver;
using MongoDB.Entities;
using Polly;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());
builder.Services.AddHostedService<CheckAuctionFinished>();
builder.Services.AddScoped<GrpcAuctionClient>();

builder.Services.AddMassTransit(x =>
{
    x.AddConsumersFromNamespaceContaining<AuctionCreatedConsumer>();
    x.SetEndpointNameFormatter(new KebabCaseEndpointNameFormatter("bids", false));
    x.UsingRabbitMq((context, cfg) =>
    {
        cfg.Host(builder.Configuration["RabbitMq:Host"], "/", host =>
        {
            host.Username(builder.Configuration.GetValue("RabbitMq:Username", "guest"));
            host.Password(builder.Configuration.GetValue("RabbitMq:Password", "guest"));
        });
        cfg.ConfigureEndpoints(context);
    });
});

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = builder.Configuration["IdentityServiceUrl"];
        options.RequireHttpsMetadata = false;
        options.TokenValidationParameters.ValidateAudience = false;
        options.TokenValidationParameters.NameClaimType = "username";
    });


var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Initialize MongoDB with retry logic
var retryPolicy = Policy
    .Handle<Exception>()
    .WaitAndRetryAsync(
        5,
        retryAttempt => TimeSpan.FromSeconds(5),
        onRetry: (exception, timeSpan, retry, ctx) =>
        {
            Console.WriteLine($"Failed to connect to MongoDB on attempt {retry}. Waiting {timeSpan} before next attempt.");
        });

await retryPolicy.ExecuteAsync(async () =>
{
    await DB.InitAsync("BidDB", MongoClientSettings.FromConnectionString(
        builder.Configuration.GetConnectionString("BidDbConnection")));
    Console.WriteLine("Successfully connected to MongoDB");
});

app.Run();