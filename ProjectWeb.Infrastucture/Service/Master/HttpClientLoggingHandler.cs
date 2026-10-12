using Microsoft.Extensions.Logging;

namespace ProjectWeb.Infrastucture.Service.Master
{
    /// <summary>
    /// DelegatingHandler that logs every outbound HttpClient request and response.
    /// Register in DI and attach to the "NewProjectAPI" named client in Program.cs.
    /// </summary>
    public class HttpClientLoggingHandler : DelegatingHandler
    {
        private readonly ILogger<HttpClientLoggingHandler> _logger;

        public HttpClientLoggingHandler(ILogger<HttpClientLoggingHandler> logger)
        {
            _logger = logger;
        }

        protected override async Task<HttpResponseMessage> SendAsync(
            HttpRequestMessage request, CancellationToken cancellationToken)
        {
            _logger.LogDebug(
                "[HttpClient] → {Method} {Uri}  Content-Type: {CT}",
                request.Method,
                request.RequestUri,
                request.Content?.Headers?.ContentType?.ToString() ?? "(none)");

            var response = await base.SendAsync(request, cancellationToken);

            if (response.IsSuccessStatusCode)
            {
                _logger.LogDebug(
                    "[HttpClient] ← {Status} from {Uri}",
                    (int)response.StatusCode, request.RequestUri);
            }
            else
            {
                var body = await response.Content.ReadAsStringAsync(cancellationToken);
                _logger.LogWarning(
                    "[HttpClient] ← {Status} from {Uri} — Body: {Body}",
                    (int)response.StatusCode, request.RequestUri, body);
            }

            return response;
        }
    }
}
