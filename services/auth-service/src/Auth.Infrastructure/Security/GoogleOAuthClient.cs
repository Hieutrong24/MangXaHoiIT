using System.Net.Http.Json;
using System.Text.Json.Serialization;
using auth_service.src.Auth.Application.Interfaces;
using auth_service.src.Auth.Infrastructure.Configurations;
using Microsoft.Extensions.Options;

namespace auth_service.src.Auth.Infrastructure.Security
{
    public sealed class GoogleOAuthClient : IGoogleOAuthClient
    {
        private readonly HttpClient _http;
        private readonly GoogleSettings _settings;

        public GoogleOAuthClient(HttpClient http, IOptions<GoogleSettings> settings)
        {
            _http = http;
            _settings = settings.Value;
        }

        public async Task<GoogleUserInfo> GetUserInfoAsync(string code, string redirectUri, CancellationToken cancellationToken = default)
        {
            var clientId = Environment.GetEnvironmentVariable("GOOGLE_CLIENT_ID") ?? _settings.ClientId;
            var clientSecret = Environment.GetEnvironmentVariable("GOOGLE_CLIENT_SECRET") ?? _settings.ClientSecret;

            if (string.IsNullOrWhiteSpace(clientId) || string.IsNullOrWhiteSpace(clientSecret))
                throw new InvalidOperationException("Missing Google OAuth client configuration.");

            using var tokenContent = new FormUrlEncodedContent(new Dictionary<string, string>
            {
                ["code"] = code,
                ["client_id"] = clientId,
                ["client_secret"] = clientSecret,
                ["redirect_uri"] = redirectUri,
                ["grant_type"] = "authorization_code"
            });

            using var tokenResponse = await _http.PostAsync("https://oauth2.googleapis.com/token", tokenContent, cancellationToken);
            if (!tokenResponse.IsSuccessStatusCode)
                throw new UnauthorizedAccessException("Google token exchange failed.");

            var token = await tokenResponse.Content.ReadFromJsonAsync<GoogleTokenResponse>(cancellationToken: cancellationToken);
            if (string.IsNullOrWhiteSpace(token?.IdToken))
                throw new UnauthorizedAccessException("Google did not return an id_token.");

            var tokenInfo = await _http.GetFromJsonAsync<GoogleTokenInfo>(
                $"https://oauth2.googleapis.com/tokeninfo?id_token={Uri.EscapeDataString(token.IdToken)}",
                cancellationToken);

            if (tokenInfo is null || tokenInfo.Audience != clientId)
                throw new UnauthorizedAccessException("Google id_token is invalid.");

            var emailVerified = string.Equals(tokenInfo.EmailVerified, "true", StringComparison.OrdinalIgnoreCase);
            return new GoogleUserInfo(tokenInfo.Email ?? string.Empty, emailVerified, tokenInfo.Name, tokenInfo.Picture);
        }

        private sealed class GoogleTokenResponse
        {
            [JsonPropertyName("id_token")]
            public string? IdToken { get; set; }
        }

        private sealed class GoogleTokenInfo
        {
            [JsonPropertyName("aud")]
            public string? Audience { get; set; }

            [JsonPropertyName("email")]
            public string? Email { get; set; }

            [JsonPropertyName("email_verified")]
            public string? EmailVerified { get; set; }

            [JsonPropertyName("name")]
            public string? Name { get; set; }

            [JsonPropertyName("picture")]
            public string? Picture { get; set; }
        }
    }
}
