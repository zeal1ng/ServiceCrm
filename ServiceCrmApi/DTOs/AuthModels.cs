class LoginRequest
{
    public string Email { get; set; }
    public string Password { get; set; }
}

class RegisterRequest
{
    public string Name { get; set; }
    public string Email { get; set; }
    public string Password { get; set; }
}

class AuthResponse
{
    public string Token { get; set; }
    public DateTime Expiration { get; set; }
}