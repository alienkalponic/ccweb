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
        /// Reflects a plain or nested DTO into a MultipartFormDataContent, handling:
        ///   - IFormFile → file stream part
        ///   - IEnumerable&lt;IFormFile&gt; → multiple file parts
        ///   - Nested complex objects & lists → indexed keys (e.g. AboutDetails[0].Title, AboutDetails[0].Image)
        ///   - Strings / Primitives → string content parts
        /// </summary>
        private static MultipartFormDataContent BuildMultipartFromDto(object data)
        {
            var content = new MultipartFormDataContent();
            AddObjectToContent(content, data, prefix: "");
            return content;
        }

        private static void AddObjectToContent(MultipartFormDataContent content, object data, string prefix)
        {
            if (data == null) return;

            foreach (var prop in data.GetType().GetProperties())
            {
                var value = prop.GetValue(data);
                if (value == null) continue;

                string key = string.IsNullOrEmpty(prefix) ? prop.Name : $"{prefix}.{prop.Name}";

                if (value is IFormFile singleFile)
                {
                    if (singleFile.Length > 0)
                    {
                        var st = singleFile.OpenReadStream();
                        if (st.CanSeek) st.Position = 0;
                        var fc = new StreamContent(st);
                        var ct = string.IsNullOrWhiteSpace(singleFile.ContentType) ? "application/octet-stream" : singleFile.ContentType;
                        fc.Headers.ContentType = new MediaTypeHeaderValue(ct);
                        content.Add(fc, key, singleFile.FileName ?? "file");
                    }
                }
                else if (value is IEnumerable<IFormFile> files)
                {
                    foreach (var f in files)
                    {
                        if (f != null && f.Length > 0)
                        {
                            var st = f.OpenReadStream();
                            if (st.CanSeek) st.Position = 0;
                            var fc = new StreamContent(st);
                            var ct = string.IsNullOrWhiteSpace(f.ContentType) ? "application/octet-stream" : f.ContentType;
                            fc.Headers.ContentType = new MediaTypeHeaderValue(ct);
                            content.Add(fc, key, f.FileName ?? "file");
                        }
                    }
                }
                else if (value is string strVal)
                {
                    content.Add(new StringContent(strVal), key);
                }
                else if (value is DateTime dtVal)
                {
                    content.Add(new StringContent(dtVal.ToString("o")), key);
                }
                else if (value.GetType().IsValueType)
                {
                    content.Add(new StringContent(Convert.ToString(value) ?? ""), key);
                }
                else if (value is IEnumerable enumerable)
                {
                    int index = 0;
                    foreach (var item in enumerable)
                    {
                        if (item == null) continue;
                        if (item is IFormFile itemFile)
                        {
                            if (itemFile.Length > 0)
                            {
                                var st = itemFile.OpenReadStream();
                                if (st.CanSeek) st.Position = 0;
                                var fc = new StreamContent(st);
                                var ct = string.IsNullOrWhiteSpace(itemFile.ContentType) ? "application/octet-stream" : itemFile.ContentType;
                                fc.Headers.ContentType = new MediaTypeHeaderValue(ct);
                                content.Add(fc, key, itemFile.FileName ?? "file");
                            }
                        }
                        else if (item is string || item.GetType().IsValueType)
                        {
                            content.Add(new StringContent(Convert.ToString(item) ?? ""), key);
                        }
                        else
                        {
                            string indexedPrefix = $"{key}[{index}]";
                            AddObjectToContent(content, item, indexedPrefix);
                        }
                        index++;
                    }
                }
                else
                {
                    AddObjectToContent(content, value, key);
                }
            }
        }
    }
}
