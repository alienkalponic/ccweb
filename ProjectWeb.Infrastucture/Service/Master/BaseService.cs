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

        public async Task<T> SendAsync<T>(APIRequest apiRequest, bool withBearer = true)
        {
            try
            {
                var client = httpClient.CreateClient("NewProjectAPI");
                client.Timeout = TimeSpan.FromMinutes(30);

                var messageFactory = () =>
                {
                    return _apiMessageRequestBuilder.Build(apiRequest);
                };


                HttpResponseMessage httpResponseMessage = null;

                httpResponseMessage = await SendWithAccessTokenAsync(client, messageFactory, withBearer);

                APIResponse FinalApiResponse = new()
                {
                    Success = false
                };

                try
                {
                    switch (httpResponseMessage.StatusCode)
                    {
                        case HttpStatusCode.NotFound:
                            FinalApiResponse.ErrorMassage = new List<string>() { "Not Found" };
                            break;
                        case HttpStatusCode.Forbidden:
                            FinalApiResponse.ErrorMassage = new List<string>() { "Access Denied" };
                            break;
                        case HttpStatusCode.Unauthorized:
                            FinalApiResponse.ErrorMassage = new List<string>() { "Unauthorized" };
                            break;
                        case HttpStatusCode.InternalServerError:
                            FinalApiResponse.ErrorMassage = new List<string>() { "Internal Server Error" };
                            break;
                        default:
                            var apiContent = await httpResponseMessage.Content.ReadAsStringAsync();
                            FinalApiResponse.Success = true;
                            FinalApiResponse = JsonConvert.DeserializeObject<APIResponse>(apiContent);
                            break;
                    }
                }
                catch (Exception e)
                {

                    FinalApiResponse.ErrorMassage = new List<string>() { "Error Encountered", e.Message.ToString() };
                }
                var res = JsonConvert.SerializeObject(FinalApiResponse);
                var returnObj = JsonConvert.DeserializeObject<T>(res);
                return returnObj;
            }
            catch (AuthException)
            {
                throw;
            }
            catch (Exception e)
            {
                var dto = new APIResponse
                {
                    ErrorMassage = new List<string> { Convert.ToString(e.Message) },
                    Success = false
                };
                var res = JsonConvert.SerializeObject(dto);
                var APIResponse = JsonConvert.DeserializeObject<T>(res);
                return APIResponse;
            }
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
