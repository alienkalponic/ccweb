using Newtonsoft.Json;
using ProjectWeb.Domain.Utility;
using System.Net;

namespace ProjectWeb.WEB.Middlewares
{
    public class ExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionMiddleware> _logger;
        private readonly IWebHostEnvironment _env;

        public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger, IWebHostEnvironment env)
        {
            _next = next;
            _logger = logger;
            _env = env;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, ex.Message);
                await HandleExceptionAsync(context, ex);
            }
        }

        private async Task HandleExceptionAsync(HttpContext context, Exception ex)
        {
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

            var response = new APIResponse
            {
                Success = false,
                StatusCode = HttpStatusCode.InternalServerError,
                Response = _env.IsDevelopment() ? ex.ToString() : "An internal server error occurred. Please contact the administrator."
            };

            response.ErrorMassage.Add(ex.Message);

            // If it's an AJAX request, return JSON
            if (IsAjaxRequest(context.Request))
            {
                var json = JsonConvert.SerializeObject(response);
                await context.Response.WriteAsync(json);
            }
            else
            {
                // For non-AJAX, we could redirect to an error page, 
                // but as per requirement, we want maximum visibility/standardized JSON for now.
                var json = JsonConvert.SerializeObject(response);
                await context.Response.WriteAsync(json);
            }
        }

        private bool IsAjaxRequest(HttpRequest request)
        {
            return request.Headers["X-Requested-With"] == "XMLHttpRequest" || 
                   request.Headers["Accept"].ToString().Contains("application/json");
        }
    }
}
