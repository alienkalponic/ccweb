using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using ProjectWeb.Application.Common.Repository.Master;
using ProjectWeb.Domain.Utility;
using System.Collections;
using System.Net.Http.Headers;
using System.Text;
using static ProjectWeb.Domain.Utility.StaticDetails;

namespace ProjectWeb.Infrastucture.Service.Master
{
    public class ApiMessageRequestBuilder : IApiMessageRequestBuilder
    {
        public HttpRequestMessage Build(APIRequest apiRequest)
        {
            var message = new HttpRequestMessage();

            // Set HTTP method
            message.Method = apiRequest.ApiType switch
            {
                StaticDetails.ApiType.POST   => HttpMethod.Post,
                StaticDetails.ApiType.PUT    => HttpMethod.Put,
                StaticDetails.ApiType.DELETE => HttpMethod.Delete,
                _                            => HttpMethod.Get
            };

            message.RequestUri = new Uri(apiRequest.Url);

            if (apiRequest.ContentType == ContentType.MultipartFormData)
            {
                message.Headers.Add("Accept", "*/*");
            }
            else
            {
                message.Headers.Add("Accept", "application/json");
            }

            if (apiRequest.Data == null)
                return message;

            if (apiRequest.ContentType == ContentType.MultipartFormData)
            {
                // If the caller already built a MultipartFormDataContent (Update flow),
                // use it directly — do NOT re-reflect it.
                if (apiRequest.Data is MultipartFormDataContent preBuilt)
                {
                    message.Content = preBuilt;
                }
                else
                {
                    // Reflect the DTO into multipart (Create flow / Banner flow)
                    message.Content = BuildMultipartFromDto(apiRequest.Data);
                }
            }
            else
            {
                message.Content = new StringContent(
                    JsonConvert.SerializeObject(apiRequest.Data),
                    Encoding.UTF8,
                    "application/json");
            }

            return message;
        }

        /// <summary>
        /// Reflects a plain DTO into a MultipartFormDataContent, handling:
        ///   - IFormFile  → file stream part
        ///   - IEnumerable&lt;IFormFile&gt; → multiple file parts (same field name)
        ///   - IEnumerable (non-string, e.g. List&lt;long&gt;) → repeated string parts (same field name)
        ///   - Everything else → string part
        /// </summary>
        private static MultipartFormDataContent BuildMultipartFromDto(object data)
        {
            var content = new MultipartFormDataContent();

            foreach (var prop in data.GetType().GetProperties())
            {
                var value = prop.GetValue(data);
                if (value == null) continue;

                if (value is IFormFile singleFile)
                {
                    var fc = new StreamContent(singleFile.OpenReadStream());
                    fc.Headers.ContentType = new MediaTypeHeaderValue(singleFile.ContentType);
                    content.Add(fc, prop.Name, singleFile.FileName);
                }
                else if (value is IEnumerable<IFormFile> files)
                {
                    foreach (var f in files)
                    {
                        var fc = new StreamContent(f.OpenReadStream());
                        fc.Headers.ContentType = new MediaTypeHeaderValue(f.ContentType);
                        content.Add(fc, prop.Name, f.FileName);
                    }
                }
                else if (value is not string && value is IEnumerable enumerable)
                {
                    // Handles List<long>, List<int>, List<string>, etc.
                    // Each item becomes a separate form field with the same name.
                    foreach (var item in enumerable)
                        content.Add(new StringContent(Convert.ToString(item) ?? ""), prop.Name);
                }
                else
                {
                    content.Add(new StringContent(Convert.ToString(value) ?? ""), prop.Name);
                }
            }

            return content;
        }
    }
}
