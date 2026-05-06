using ServiceCrmApi.Models;

public interface ITokenService
{
    string CreateToken(User user);
}