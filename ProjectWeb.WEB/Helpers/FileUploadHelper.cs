using Microsoft.AspNetCore.Http;
using System;
using System.IO;
using System.Linq;

namespace ProjectWeb.WEB.Helpers
{
    public static class FileUploadHelper
    {
        public static string UploadFile(IFormFile file, string folderPath)
        {
            if (file == null || file.Length == 0) return null;

            // Validate extension
            var supportedTypes = new[] { ".jpg", ".jpeg", ".png", ".webp" };
            var fileExt = Path.GetExtension(file.FileName).ToLower();
            if (!supportedTypes.Contains(fileExt))
            {
                throw new Exception("Invalid file type. Only JPG, JPEG, PNG, and WEBP are allowed.");
            }

            // Ensure directory exists
            if (!Directory.Exists(folderPath))
            {
                Directory.CreateDirectory(folderPath);
            }

            // Create unique filename
            var fileName = Guid.NewGuid().ToString() + fileExt;
            var path = Path.Combine(folderPath, fileName);

            using (var stream = new FileStream(path, FileMode.Create))
            {
                file.CopyTo(stream);
            }

            return fileName;
        }

        public static void DeleteFile(string fileName, string folderPath)
        {
            if (string.IsNullOrEmpty(fileName)) return;

            var path = Path.Combine(folderPath, fileName);
            if (File.Exists(path))
            {
                File.Delete(path);
            }
        }
    }
}
