using Skytype.Api.Src;

var builder = WebApplication.CreateBuilder(args);

builder.ConfigureServices();

var app = builder.Build();

app.ConfigureMiddleware();
app.MapApiRoutes();

app.Run();
