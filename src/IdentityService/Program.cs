using IdentityService;
using Polly;
using Serilog;

Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateBootstrapLogger();

Log.Information("Starting up");

try
{
    var builder = WebApplication.CreateBuilder(args);

    builder.Host.UseSerilog((ctx, lc) => lc
        .WriteTo.Console(outputTemplate: "[{Timestamp:HH:mm:ss} {Level}] {SourceContext}{NewLine}{Message:lj}{NewLine}{Exception}{NewLine}")
        .Enrich.FromLogContext()
        .ReadFrom.Configuration(ctx.Configuration));

    var app = builder
        .ConfigureServices()
        .ConfigurePipeline();

    //! Add retry logic for database seeding using Polly</span>
    var retryPolicy = Policy
        .Handle<Exception>()
        .WaitAndRetryAsync(
            5,
            retryAttempt => TimeSpan.FromSeconds(10),
            onRetry: (exception, timeSpan, retry, ctx) =>
            {
                Log.Warning(exception, "Failed to seed database on attempt {Retry}. Waiting {TimeSpan} before next attempt.", retry, timeSpan);
            });

    await retryPolicy.ExecuteAsync(async () =>
    {
        SeedData.EnsureSeedData(app);
        await Task.CompletedTask;
    });

    app.Run();
}
catch (Exception ex) when (
                            // https://github.com/dotnet/runtime/issues/60600
                            ex.GetType().Name is not "StopTheHostException"
                            // HostAbortedException was added in .NET 7, but since we target .NET 6 we
                            // need to do it this way until we target .NET 8
                            && ex.GetType().Name is not "HostAbortedException"
                        )
{
    Log.Fatal(ex, "Unhandled exception");
}
finally
{
    Log.Information("Shut down complete");
    Log.CloseAndFlush();
}