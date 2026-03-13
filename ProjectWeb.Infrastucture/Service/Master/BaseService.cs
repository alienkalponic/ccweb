using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
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

        public BaseService(IHttpClientFactory httpClient, ITokenProvider tokenProvider, IConfiguration configuration
            , IHttpContextAccessor httpContextAccessor, IApiMessageRequestBuilder apiMessageRequestBuilder)
        {
            _httpContextAccessor = httpContextAccessor;
            _tokenProvider = tokenProvider;
            this.apiResponse = new();
            this.httpClient = httpClient;
            _apiMessageRequestBuilder = apiMessageRequestBuilder;

            var hostName = _httpContextAccessor.HttpContext?.Request.Host.Host!;
            projectUrl = hostName.Contains("localhost")
                        ? configuration.GetValue<string>("ServiceUrls:ProjectAPI")
                        : configuration.GetValue<string>("LiveServerServiceUrls:ProjectAPI");
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

        public async Task<T> SendAsync<T>(APIRequest apiRequest, bool withBearer = true)
        {
            try
            {
                var client = httpClient.CreateClient("NewProjectAPI");
                client.Timeout = TimeSpan.FromMinutes(1);

                var messageFactory = () =>
                {
                    var message = _apiMessageRequestBuilder.Build(apiRequest);

                    // 🔥 Handle MultipartFormData
                    if (apiRequest.Data != null &&
                        apiRequest.ContentType == StaticDetails.ContentType.MultipartFormData)
                    {
                        message.Content = apiRequest.Data as MultipartFormDataContent;
                    }

                    return message;
                };

                HttpResponseMessage httpResponseMessage;

                try
                {
                    httpResponseMessage = await SendWithAccessTokenAsync(client, messageFactory, withBearer);
                }
                catch (Exception ex)
                {
                    return CreateErrorResponse<T>(apiRequest.Url, ex.Message, HttpStatusCode.ServiceUnavailable);
                }

                APIResponse finalApiResponse = new()
                {
                    Success = false
                };

                try
                {
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
                        "Access Denied / Forbidden"
                    };
                            break;

                        case HttpStatusCode.Unauthorized:
                            finalApiResponse.StatusCode = HttpStatusCode.Unauthorized;
                            finalApiResponse.ErrorMassage = new List<string>
                    {
                        "Unauthorized - Token may be invalid or expired"
                    };
                            break;

                        case HttpStatusCode.InternalServerError:
                            finalApiResponse.StatusCode = HttpStatusCode.InternalServerError;
                            var serverContent = await httpResponseMessage.Content.ReadAsStringAsync();
                            finalApiResponse.ErrorMassage = new List<string>
                    {
                        "Internal Server Error from API",
                        serverContent
                    };
                            break;

                        case HttpStatusCode.BadRequest:
                            finalApiResponse.StatusCode = HttpStatusCode.BadRequest;
                            var badReqContent = await httpResponseMessage.Content.ReadAsStringAsync();
                            finalApiResponse.ErrorMassage = new List<string>
                    {
                        "Bad Request (400)",
                        badReqContent
                    };
                            break;

                        default:
                            var apiContent = await httpResponseMessage.Content.ReadAsStringAsync();

                            if (httpResponseMessage.IsSuccessStatusCode)
                            {
                                finalApiResponse = JsonConvert.DeserializeObject<APIResponse>(apiContent);
                                finalApiResponse.Success = true;
                            }
                            else
                            {
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
