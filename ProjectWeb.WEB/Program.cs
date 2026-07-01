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

// ── Global no-cache filter for all MVC/API actions ──────────────────────────
// Prevents browsers and proxies from caching any JSON data responses.
// This is a defensive best-practice for an admin panel.
builder.Services.AddControllersWithViews(options =>
{
    options.Filters.Add(new Microsoft.AspNetCore.Mvc.ResponseCacheAttribute
    {
        NoStore  = true,
        Location = Microsoft.AspNetCore.Mvc.ResponseCacheLocation.None
    });
});
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
builder.Services.AddHttpClient("NewProjectAPI", client =>
{
    // Fix: Add User-Agent. Many hosting providers (like eukhost) block requests without it.
    client.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) ProjectWeb/1.0");
    client.DefaultRequestHeaders.Add("Accept", "application/json");
})
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

// Configure Static Files — Split Caching Strategy
// ─────────────────────────────────────────────────────────────────────────────
// ROOT CAUSE FIX: The original config set 365-day "immutable" for ALL static
// files. This caused browsers to cache Admin.js for a year and NEVER check for
// updates, resulting in stale data behavior on all admin pages.
//
// New strategy:
//   • JS / CSS  → 1 hour + must-revalidate (browser must check server on each visit)
//   • Images / Fonts → 30 days (these change rarely and at different URLs)
//   • Everything else → no-cache (force revalidation every time)
// ─────────────────────────────────────────────────────────────────────────────
app.UseStaticFiles(new StaticFileOptions
{
    OnPrepareResponse = ctx =>
    {
        var path = ctx.File.Name.ToLowerInvariant();
        var headers = ctx.Context.Response.Headers;

        if (path.EndsWith(".js") || path.EndsWith(".css"))
        {
            // 1 hour + must-revalidate: browser caches for performance but MUST
            // check server (via ETag/Last-Modified) before using cached copy.
            // This means a normal F5 refresh will always get fresh JS/CSS.
            headers["Cache-Control"] = "public, max-age=3600, must-revalidate";
        }
        else if (path.EndsWith(".jpg")  || path.EndsWith(".jpeg") ||
                 path.EndsWith(".png")  || path.EndsWith(".webp") ||
                 path.EndsWith(".gif")  || path.EndsWith(".ico")  ||
                 path.EndsWith(".svg")  || path.EndsWith(".woff") ||
                 path.EndsWith(".woff2"))
        {
            // Images and fonts: 30 days. These are typically served from
            // the API server (different origin) and are safe to cache.
            headers["Cache-Control"] = "public, max-age=2592000";
        }
        else
        {
            // Everything else (HTML, JSON, etc.): no caching
            headers["Cache-Control"] = "no-cache, no-store, must-revalidate";
            headers["Pragma"]        = "no-cache";
            headers["Expires"]       = "0";
        }
    }
});


app.UseRouting();
app.UseSession();

app.UseAuthentication();
app.UseAuthorization();


app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();
