using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using ProjectWeb.Application.Common.Repository.Master;
using ProjectWeb.Domain.DTO;
using ProjectWeb.Domain.DTO.LoginDto;
using ProjectWeb.Domain.Utility;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace ProjectWeb.Infrastucture.Service.Master
{
    public class BaseService : IBaseService
    {
        public APIResponse apiResponse { get; set; }

        public IHttpClientFactory httpClient { get; set; }
        private readonly ITokenProvider _tokenProvider;
        private readonly IApiMessageRequestBuilder _apiMessageRequestBuilder;
        protected readonly string projectUrl;
        private IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger<BaseService> _logger;

        public BaseService(
            IHttpClientFactory httpClient,
            ITokenProvider tokenProvider,
            IConfiguration configuration,
            IHttpContextAccessor httpContextAccessor,
            IApiMessageRequestBuilder apiMessageRequestBuilder,
            ILogger<BaseService> logger)
        {
            _httpContextAccessor = httpContextAccessor;
            _tokenProvider = tokenProvider;
            this.apiResponse = new();
            this.httpClient = httpClient;
            _apiMessageRequestBuilder = apiMessageRequestBuilder;
            _logger = logger;

            // Read ASPNETCORE_ENVIRONMENT from configuration (set by hosting or env var).
            // Avoids hostname sniffing which breaks behind reverse proxies.
            var envName = configuration["ASPNETCORE_ENVIRONMENT"] ?? "Production";
            var isProduction = !envName.Equals("Development", StringComparison.OrdinalIgnoreCase);

            projectUrl = isProduction
                        ? configuration.GetValue<string>("LiveServerServiceUrls:ProjectAPI")!
                        : configuration.GetValue<string>("ServiceUrls:ProjectAPI")!;

            _logger.LogInformation("[BaseService] Resolved API URL: {Url} (Environment: {Env})",
                projectUrl, envName);
        }

        //public async Task<T> SendAsync<T>(APIRequest apiRequest, bool withBearer = true)
        //{
        //    try
        //    {
        //        var client = httpClient.CreateClient("NewProjectAPI");
        //        client.Timeout = TimeSpan.FromMinutes(1);

        //        var messageFactory = () =>
        //        {
        //            return _apiMessageRequestBuilder.Build(apiRequest);
        //        };

        //        HttpResponseMessage httpResponseMessage = null;

        //        try
        //        {
        //            httpResponseMessage = await SendWithAccessTokenAsync(client, messageFactory, withBearer);
        //        }
        //        catch (Exception ex)
        //        {
        //            // Catch failures during the actual send (e.g. DNS, connection refused)
        //            return CreateErrorResponse<T>(apiRequest.Url, ex.Message, HttpStatusCode.ServiceUnavailable);
        //        }

        //        APIResponse FinalApiResponse = new()
        //        {
        //            Success = false
        //        };

        //        try
        //        {
        //            switch (httpResponseMessage.StatusCode)
        //            {
        //                case HttpStatusCode.NotFound:
        //                    FinalApiResponse.StatusCode = HttpStatusCode.NotFound;
        //                    FinalApiResponse.ErrorMassage = new List<string>() { $"API Endpoint Not Found: {apiRequest.Url}" };
        //                    break;
        //                case HttpStatusCode.Forbidden:
        //                    FinalApiResponse.StatusCode = HttpStatusCode.Forbidden;
        //                    FinalApiResponse.ErrorMassage = new List<string>() { "Access Denied / Forbidden" };
        //                    break;
        //                case HttpStatusCode.Unauthorized:
        //                    FinalApiResponse.StatusCode = HttpStatusCode.Unauthorized;
        //                    FinalApiResponse.ErrorMassage = new List<string>() { "Unauthorized - Token may be invalid or expired" };
        //                    break;
        //                case HttpStatusCode.InternalServerError:
        //                    FinalApiResponse.StatusCode = HttpStatusCode.InternalServerError;
        //                    var serverContent = await httpResponseMessage.Content.ReadAsStringAsync();
        //                    FinalApiResponse.ErrorMassage = new List<string>() { "Internal Server Error from API", serverContent };
        //                    break;
        //                case HttpStatusCode.BadRequest:
        //                    FinalApiResponse.StatusCode = HttpStatusCode.BadRequest;
        //                    var badReqContent = await httpResponseMessage.Content.ReadAsStringAsync();
        //                    FinalApiResponse.ErrorMassage = new List<string>() { "Bad Request (400)", badReqContent };
        //                    break;
        //                default:
        //                    var apiContent = await httpResponseMessage.Content.ReadAsStringAsync();
        //                    if (httpResponseMessage.IsSuccessStatusCode)
        //                    {
        //                        FinalApiResponse.Success = true;
        //                        FinalApiResponse = JsonConvert.DeserializeObject<APIResponse>(apiContent);
        //                    }
        //                    else
        //                    {
        //                        FinalApiResponse.StatusCode = httpResponseMessage.StatusCode;
        //                        FinalApiResponse.ErrorMassage = new List<string>() { $"Error: {httpResponseMessage.StatusCode}", apiContent };
        //                    }
        //                    break;
        //            }
        //        }
        //        catch (Exception e)
        //        {
        //            FinalApiResponse.ErrorMassage = new List<string>() { "Response Parsing Error", e.Message.ToString() };
        //        }

        //        var res = JsonConvert.SerializeObject(FinalApiResponse);
        //        return JsonConvert.DeserializeObject<T>(res);
        //    }
        //    catch (AuthException)
        //    {
        //        throw;
        //    }
        //    catch (Exception e)
        //    {
        //        return CreateErrorResponse<T>(apiRequest.Url, e.Message, HttpStatusCode.InternalServerError);
        //    }
        //}

        //public async Task<T> SendAsync<T>(APIRequest apiRequest, bool withBearer = true)
        //{
        //    try
        //    {
        //        var client = httpClient.CreateClient("NewProjectAPI");
        //        // Increased to 5 minutes to support large multi-file uploads
        //        client.Timeout = TimeSpan.FromMinutes(5);

        //        _logger.LogDebug("[SendAsync] → {Method} {Url} ContentType={CT}",
        //            apiRequest.ApiType, apiRequest.Url, apiRequest.ContentType);

        //        // Build is called by the factory on every send attempt (including the 401 retry).
        //        // The builder handles both DTO reflection and pre-built MultipartFormDataContent correctly.
        //        // DO NOT add any message.Content assignment here — that was Bug 1 (overwrote builder output with null).
        //        var messageFactory = () => _apiMessageRequestBuilder.Build(apiRequest);

        //        HttpResponseMessage httpResponseMessage;

        //        try
        //        {
        //            httpResponseMessage = await SendWithAccessTokenAsync(client, messageFactory, withBearer);
        //        }
        //        catch (Exception ex)
        //        {
        //            _logger.LogError(ex, "[SendAsync] Connection failure to {Url}", apiRequest.Url);
        //            return CreateErrorResponse<T>(apiRequest.Url, ex.Message, HttpStatusCode.ServiceUnavailable);
        //        }

        //        APIResponse finalApiResponse = new()
        //        {
        //            Success = false
        //        };

        //        try
        //        {
        //            switch (httpResponseMessage.StatusCode)
        //            {
        //                case HttpStatusCode.NotFound:
        //                    finalApiResponse.StatusCode = HttpStatusCode.NotFound;
        //                    finalApiResponse.ErrorMassage = new List<string>
        //            {
        //                $"API Endpoint Not Found: {apiRequest.Url}"
        //            };
        //                    break;

        //                case HttpStatusCode.Forbidden:
        //                    finalApiResponse.StatusCode = HttpStatusCode.Forbidden;
        //                    finalApiResponse.ErrorMassage = new List<string>
        //            {
        //                "Access Denied / Forbidden"
        //            };
        //                    break;

        //                case HttpStatusCode.Unauthorized:
        //                    finalApiResponse.StatusCode = HttpStatusCode.Unauthorized;
        //                    finalApiResponse.ErrorMassage = new List<string>
        //            {
        //                "Unauthorized - Token may be invalid or expired"
        //            };
        //                    break;

        //                case HttpStatusCode.InternalServerError:
        //                    finalApiResponse.StatusCode = HttpStatusCode.InternalServerError;
        //                    var serverContent = await httpResponseMessage.Content.ReadAsStringAsync();
        //                    _logger.LogError("[SendAsync] API 500 from {Url}: {Body}", apiRequest.Url, serverContent);
        //                    finalApiResponse.ErrorMassage = new List<string>
        //            {
        //                "Internal Server Error from API",
        //                serverContent
        //            };
        //                    break;

        //                case HttpStatusCode.BadRequest:
        //                    finalApiResponse.StatusCode = HttpStatusCode.BadRequest;
        //                    var badReqContent = await httpResponseMessage.Content.ReadAsStringAsync();
        //                    _logger.LogWarning("[SendAsync] API 400 from {Url}: {Body}", apiRequest.Url, badReqContent);
        //                    finalApiResponse.ErrorMassage = new List<string>
        //            {
        //                "Bad Request (400)",
        //                badReqContent
        //            };
        //                    break;

        //                default:
        //                    var apiContent = await httpResponseMessage.Content.ReadAsStringAsync();

        //                    if (httpResponseMessage.IsSuccessStatusCode)
        //                    {
        //                        finalApiResponse = JsonConvert.DeserializeObject<APIResponse>(apiContent);
        //                        finalApiResponse.Success = true;
        //                    }
        //                    else
        //                    {
        //                        _logger.LogWarning("[SendAsync] API {Status} from {Url}: {Body}",
        //                            httpResponseMessage.StatusCode, apiRequest.Url, apiContent);
        //                        finalApiResponse.StatusCode = httpResponseMessage.StatusCode;
        //                        finalApiResponse.ErrorMassage = new List<string>
        //                {
        //                    $"Error: {httpResponseMessage.StatusCode}",
        //                    apiContent
        //                };
        //                    }
        //                    break;
        //            }
        //        }
        //        catch (Exception ex)
        //        {
        //            _logger.LogError(ex, "[SendAsync] Response parsing error from {Url}", apiRequest.Url);
        //            finalApiResponse.ErrorMassage = new List<string>
        //    {
        //        "Response Parsing Error",
        //        ex.Message
        //    };
        //        }

        //        var res = JsonConvert.SerializeObject(finalApiResponse);
        //        return JsonConvert.DeserializeObject<T>(res);
        //    }
        //    catch (AuthException)
        //    {
        //        throw;
        //    }
        //    catch (Exception ex)
        //    {
        //        _logger.LogError(ex, "[SendAsync] Unhandled exception for {Url}", apiRequest.Url);
        //        return CreateErrorResponse<T>(apiRequest.Url, ex.Message, HttpStatusCode.InternalServerError);
        //    }
        //}

        public async Task<T> SendAsync<T>(APIRequest apiRequest, bool withBearer = true)
        {
            try
            {
                var client = httpClient.CreateClient("NewProjectAPI");
                client.Timeout = TimeSpan.FromMinutes(5);

                _logger.LogDebug("[SendAsync] → {Method} {Url} ContentType={CT}",
                    apiRequest.ApiType, apiRequest.Url, apiRequest.ContentType);

                // Factory দিয়ে message তৈরি হবে (important)
                var messageFactory = () =>
                {
                    var message = _apiMessageRequestBuilder.Build(apiRequest);

                    // 🔥 TOKEN ATTACH (MAIN FIX)
                    if (withBearer)
                    {
                        var token = _httpContextAccessor.HttpContext?.Session.GetString("JWToken");

                        if (!string.IsNullOrEmpty(token))
                        {
                            message.Headers.Authorization =
                                new AuthenticationHeaderValue("Bearer", token);
                        }
                        else
                        {
                            _logger.LogWarning("[SendAsync] Token missing for {Url}", apiRequest.Url);
                        }
                    }

                    return message;
                };

                HttpResponseMessage httpResponseMessage;

                try
                {
                    httpResponseMessage = await client.SendAsync(messageFactory());
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "[SendAsync] Connection failure to {Url}", apiRequest.Url);
                    return CreateErrorResponse<T>(apiRequest.Url, ex.Message, HttpStatusCode.ServiceUnavailable);
                }

                APIResponse finalApiResponse = new()
                {
                    Success = false
                };

                try
                {
                    var apiContent = await httpResponseMessage.Content.ReadAsStringAsync();

                    switch (httpResponseMessage.StatusCode)
                    {
                        case HttpStatusCode.NotFound:
                            finalApiResponse.StatusCode = HttpStatusCode.NotFound;
                            finalApiResponse.ErrorMassage = new List<string>
                    {
                        $"API Endpoint Not Found: {apiRequest.Url}"
                    };
                            break;

                        case HttpStatusCode.Forbidden:
                            finalApiResponse.StatusCode = HttpStatusCode.Forbidden;
                            finalApiResponse.ErrorMassage = new List<string>
                    {
                        "Access Denied / Forbidden",
                        apiContent // 🔥 extra debug info
                    };
                            break;

                        case HttpStatusCode.Unauthorized:
                            finalApiResponse.StatusCode = HttpStatusCode.Unauthorized;
                            finalApiResponse.ErrorMassage = new List<string>
                    {
                        "Unauthorized - Token invalid or expired",
                        apiContent
                    };
                            break;

                        case HttpStatusCode.InternalServerError:
                            _logger.LogError("[SendAsync] API 500 from {Url}: {Body}", apiRequest.Url, apiContent);

                            finalApiResponse.StatusCode = HttpStatusCode.InternalServerError;
                            finalApiResponse.ErrorMassage = new List<string>
                    {
                        "Internal Server Error from API",
                        apiContent
                    };
                            break;

                        case HttpStatusCode.BadRequest:
                            _logger.LogWarning("[SendAsync] API 400 from {Url}: {Body}", apiRequest.Url, apiContent);

                            finalApiResponse.StatusCode = HttpStatusCode.BadRequest;
                            finalApiResponse.ErrorMassage = new List<string>
                    {
                        "Bad Request (400)",
                        apiContent
                    };
                            break;

                        default:
                            if (httpResponseMessage.IsSuccessStatusCode)
                            {
                                finalApiResponse = JsonConvert.DeserializeObject<APIResponse>(apiContent);
                                finalApiResponse.Success = true;
                            }
                            else
                            {
                                _logger.LogWarning("[SendAsync] API {Status} from {Url}: {Body}",
                                    httpResponseMessage.StatusCode, apiRequest.Url, apiContent);

                                finalApiResponse.StatusCode = httpResponseMessage.StatusCode;
                                finalApiResponse.ErrorMassage = new List<string>
                        {
                            $"Error: {httpResponseMessage.StatusCode}",
                            apiContent
                        };
                            }
                            break;
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "[SendAsync] Response parsing error from {Url}", apiRequest.Url);

                    finalApiResponse.ErrorMassage = new List<string>
            {
                "Response Parsing Error",
                ex.Message
            };
                }

                var res = JsonConvert.SerializeObject(finalApiResponse);
                return JsonConvert.DeserializeObject<T>(res);
            }
            catch (AuthException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[SendAsync] Unhandled exception for {Url}", apiRequest.Url);
                return CreateErrorResponse<T>(apiRequest.Url, ex.Message, HttpStatusCode.InternalServerError);
            }
        }

        private T CreateErrorResponse<T>(string url, string message, HttpStatusCode status)
        {
            var dto = new APIResponse
            {
                ErrorMassage = new List<string> { message, $"URL: {url}" },
                Success = false,
                StatusCode = status
            };
            var res = JsonConvert.SerializeObject(dto);
            return JsonConvert.DeserializeObject<T>(res);
        }
        private async Task<HttpResponseMessage> SendWithAccessTokenAsync(HttpClient httpClient, Func<HttpRequestMessage> httpRequestMessageFactory, bool withBearer = true)
        {

            if (!withBearer)
            {
                return await httpClient.SendAsync(httpRequestMessageFactory());
            }
            else
            {
                TokenDTO tokenDTO = _tokenProvider.GetToken();
                if (tokenDTO != null && !string.IsNullOrEmpty(tokenDTO.AccessToken))
                {
                    httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", tokenDTO.AccessToken);
                }

                try
                {
                    var response = await httpClient.SendAsync(httpRequestMessageFactory());
                    if (response.IsSuccessStatusCode)
                        return response;

                    // IF this fails then we can pass token!
                    if (!response.IsSuccessStatusCode && response.StatusCode == HttpStatusCode.Unauthorized)
                    {
                        if (_httpContextAccessor.HttpContext.User.Identity.IsAuthenticated)
                        {
                            var userId = Convert.ToInt64(_httpContextAccessor.HttpContext.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value);
                            //Create new JwtToken
                            await InvokeAccessTokenEndpoint(httpClient, userId);
                            return await httpClient.SendAsync(httpRequestMessageFactory());
                        }
                        else
                        {
                            await _httpContextAccessor.HttpContext.SignOutAsync();
                            _tokenProvider.ClearToken();
                            throw new AuthException();
                        }
                    }
                    return response;

                }
                catch (AuthException)
                {
                    throw;
                }
                catch (HttpRequestException httpRequestException)
                {
                    if (httpRequestException.StatusCode == System.Net.HttpStatusCode.Unauthorized)
                    {
                        // refresh token and retry the request
                        //await InvokeAccessTokenEndpoint(httpClient, tokenDTO.AccessToken);
                        //return await httpClient.SendAsync(httpRequestMessageFactory());
                        if (_httpContextAccessor.HttpContext.User.Identity.IsAuthenticated)
                        {
                            var userId = Convert.ToInt64(_httpContextAccessor.HttpContext.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value);
                            //Create new JwtToken
                            await InvokeAccessTokenEndpoint(httpClient, userId);
                            return await httpClient.SendAsync(httpRequestMessageFactory());
                        }
                        else
                        {
                            await _httpContextAccessor.HttpContext.SignOutAsync();
                            _tokenProvider.ClearToken();
                            throw new AuthException();
                        }
                    }
                    throw;
                }



            }


        }

        private async Task InvokeAccessTokenEndpoint(HttpClient httpClient, long userId)
        {
            HttpRequestMessage message = new()
            {
                Method = HttpMethod.Get,
                RequestUri = new Uri($"{projectUrl}/api/HomeAPI/generate-new-token/" + userId),
            };
            message.Headers.Add("Accept", "application/json");

            var response = await httpClient.SendAsync(message);
            var content = await response.Content.ReadAsStringAsync();
            var apiResponse = JsonConvert.DeserializeObject<APIResponse>(content);

            if (apiResponse?.Success != true)
            {
                await _httpContextAccessor.HttpContext.SignOutAsync();
                _tokenProvider.ClearToken();
                throw new AuthException();
            }
            else
            {
                LoginResponseDTO model = JsonConvert.DeserializeObject<LoginResponseDTO>(Convert.ToString(apiResponse.Response));

                if (!string.IsNullOrEmpty(model.AccessToken))
                {
                    //New method to sign in with the new token that we receive
                    await SignInWithNewTokens(model);
                    httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", model.AccessToken);
                }
            }
        }

        private async Task SignInWithNewTokens(LoginResponseDTO model)
        {
            var handler = new JwtSecurityTokenHandler();
            var jwt = handler.ReadJwtToken(model.AccessToken);

            var identity = new ClaimsIdentity(CookieAuthenticationDefaults.AuthenticationScheme);
            identity.AddClaim(new Claim(ClaimTypes.Name, jwt.Claims.FirstOrDefault(u => u.Type == "unique_name").Value));
            identity.AddClaim(new Claim(ClaimTypes.NameIdentifier, jwt.Claims.FirstOrDefault(u => u.Type == "nameid").Value));
            identity.AddClaim(new Claim(ClaimTypes.Role, jwt.Claims.FirstOrDefault(u => u.Type == "role").Value));
            var principal = new ClaimsPrincipal(identity);

            var authProperties = new AuthenticationProperties
            {
                IsPersistent = true,
                /*ExpiresUtc = DateTimeOffset.UtcNow.AddHours(4)*/ // This matches your ExpireTimeSpan setting
                ExpiresUtc = DateTimeOffset.UtcNow.AddDays(6)
            };

            await _httpContextAccessor.HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, principal, authProperties);

            //await _httpContextAccessor.HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, principal);

            _tokenProvider.SetToken(model.AccessToken);
        }
    }
}
