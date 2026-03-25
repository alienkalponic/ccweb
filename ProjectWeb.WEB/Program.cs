using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Server.Kestrel.Core;
using ProjectWeb.Application.Common.Repository.Master;
using ProjectWeb.Infrastucture;
using ProjectWeb.Infrastucture.Service.Master;

var builder = WebApplication.CreateBuilder(args);

// ── Upload size limits (must be before AddControllersWithViews) ──────────────
// Kestrel limit — controls what the .NET web server accepts before ASP.NET sees it.
// Default is 30MB. Set to 500MB (or null for unlimited).
builder.WebHost.ConfigureKestrel(options =>
{
    options.Limits.MaxRequestBodySize = 524_288_000; // 500 MB
    options.Limits.KeepAliveTimeout  = TimeSpan.FromMinutes(10);
    options.Limits.RequestHeadersTimeout = TimeSpan.FromMinutes(1);
});

builder.Services.AddControllersWithViews();
builder.Services.AddInfrastructureService();
builder.Services.AddDistributedMemoryCache();

// ── Antiforgery — read token from form body as well as header ────────────────
// This ensures the token works even if the custom header is stripped by Nginx/IIS.
builder.Services.AddAntiforgery(options =>
{
    options.HeaderName    = "RequestVerificationToken";  // legacy header name your JS sends
    options.FormFieldName = "__RequestVerificationToken"; // also read from form body (Bug 6 fix)
});

// ── Form body size limits at the ASP.NET Core middleware level ───────────────
builder.Services.Configure<FormOptions>(options =>
{
    options.MultipartBodyLengthLimit  = 524_288_000; // 500 MB
    options.ValueLengthLimit          = int.MaxValue;
    options.MultipartHeadersLengthLimit = int.MaxValue;
});

// ── Outbound HttpClient logging handler ─────────────────────────────────────
// Logs every outbound API request and response (status + error body) to the app log.
builder.Services.AddTransient<HttpClientLoggingHandler>();
builder.Services.AddHttpClient("NewProjectAPI")
    .AddHttpMessageHandler<HttpClientLoggingHandler>();

// Enable Response Compression
builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
    options.Providers.Add<Microsoft.AspNetCore.ResponseCompression.BrotliCompressionProvider>();
    options.Providers.Add<Microsoft.AspNetCore.ResponseCompression.GzipCompressionProvider>();
});

builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
              .AddCookie(options =>
              {
                  options.Cookie.Name = "ClimbersCircleWeb";
                  options.Cookie.HttpOnly = true;
                  //options.ExpireTimeSpan = TimeSpan.FromHours(4);
                  options.ExpireTimeSpan = TimeSpan.FromDays(6);
                  options.LoginPath = "/Home/Index";
                  options.AccessDeniedPath = "/Home/UnauthorizedAccess";
                  options.SlidingExpiration = true;

                  options.Events = new CookieAuthenticationEvents
                  {
                      OnRedirectToLogin = context =>
                      {
                          if (context.Request.Headers["X-Requested-With"] == "XMLHttpRequest")
                          {
                              context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                          }
                          else
                          {
                              context.Response.Redirect(context.RedirectUri);
                          }
                          return Task.CompletedTask;
                      },
                      OnRedirectToAccessDenied = context =>
                      {
                          if (context.Request.Headers["X-Requested-With"] == "XMLHttpRequest")
                          {
                              context.Response.StatusCode = StatusCodes.Status403Forbidden;
                          }
                          else
                          {
                              context.Response.Redirect(context.RedirectUri);
                          }
                          return Task.CompletedTask;
                      }
                  };
              });

builder.Services.AddSession(options =>
{
    //options.IdleTimeout = TimeSpan.FromHours(4);
    options.IdleTimeout = TimeSpan.FromHours(4);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
});

var app = builder.Build();

app.UseMiddleware<ProjectWeb.WEB.Middlewares.ExceptionMiddleware>();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();

// Use Response Compression
app.UseResponseCompression();

// Configure Static Files with Caching
app.UseStaticFiles(new StaticFileOptions
{
    OnPrepareResponse = ctx =>
    {
        const int durationInSeconds = 60 * 60 * 24 * 365; // 365 days
        ctx.Context.Response.Headers["Cache-Control"] = "public,max-age=" + durationInSeconds + ",immutable";
    }
});

app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();
app.UseSession();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();
