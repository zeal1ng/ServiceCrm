var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.Run(async(context) => 
{
    context.Response.ContentType = "text/html; charset=utf-8";
    await context.Response.SendFileAsync("../Front");
});

app.Run();
