using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using ProjectWeb.Application.Common.Repository.Master;
using ProjectWeb.Domain.Utility;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Headers;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using static ProjectWeb.Domain.Utility.StaticDetails;

namespace ProjectWeb.Infrastucture.Service.Master
{
    public class ApiMessageRequestBuilder : IApiMessageRequestBuilder
    {
        public HttpRequestMessage Build(APIRequest apiRequest)
        {
            HttpRequestMessage message = new();
            if (apiRequest.ContentType == ContentType.MultipartFormData)
            {
                message.Headers.Add("Accept", "*/*");
            }
            else
            {
                message.Headers.Add("Accept", "application/json");
            }
            message.RequestUri = new Uri(apiRequest.Url);

            if (apiRequest.Data != null)
            {
                if (apiRequest.ContentType == ContentType.MultipartFormData)
                {
                    var content = new MultipartFormDataContent();

                    foreach (var prop in apiRequest.Data.GetType().GetProperties())
                    {
                        var value = prop.GetValue(apiRequest.Data);
                        if (value is IFormFile file)
                        {
                            if (file != null)
                            {
                                var fileContent = new StreamContent(file.OpenReadStream());
                                fileContent.Headers.ContentType = new MediaTypeHeaderValue(file.ContentType);
                                content.Add(fileContent, prop.Name, file.FileName);
                            }
                        }
                        else if (value is IEnumerable<IFormFile> files)
                        {
                            if (files != null)
                            {
                                foreach (var f in files)
                                {
                                    var fileContent = new StreamContent(f.OpenReadStream());
                                    fileContent.Headers.ContentType = new MediaTypeHeaderValue(f.ContentType);
                                    content.Add(fileContent, prop.Name, f.FileName);
                                }
                            }
                        }
                        else
                        {
                            content.Add(new StringContent(Convert.ToString(value) ?? ""), prop.Name);
                        }
                    }
                    message.Content = content;
                }
                else
                {
                    message.Content = new StringContent(JsonConvert.SerializeObject(apiRequest.Data),
                        Encoding.UTF8, "application/json");
                }
            }

            switch (apiRequest.ApiType)
            {
                case StaticDetails.ApiType.POST:
                    message.Method = HttpMethod.Post;
                    break;
                case StaticDetails.ApiType.PUT:
                    message.Method = HttpMethod.Put;
                    break;
                case StaticDetails.ApiType.DELETE:
                    message.Method = HttpMethod.Delete;
                    break;
                default:
                    message.Method = HttpMethod.Get;
                    break;

            }

            return message;
        }
    }
}
