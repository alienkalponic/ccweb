using Microsoft.AspNetCore.Authentication.Cookies;
using ProjectWeb.Application.Common.Repository.Master;
using ProjectWeb.Infrastucture;
using ProjectWeb.Infrastucture.Service.Master;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllersWithViews();
builder.Services.AddInfrastructureService();
builder.Services.AddDistributedMemoryCache();

builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
              .AddCookie(options =>
              {
                  options.Cookie.Name = "ClimbersCircle";
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

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();
app.UseSession();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();
