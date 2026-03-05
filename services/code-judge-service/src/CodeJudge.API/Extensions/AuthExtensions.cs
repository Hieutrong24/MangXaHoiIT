namespace CodeJudge.API.Extensions;

// báº¡n cĂ³ thá»ƒ tĂ­ch há»£p JWT sau; hiá»‡n Ä‘á»ƒ stub cho Ä‘Ăºng cáº¥u trĂºc
public static class AuthExtensions
{
    public static IServiceCollection AddAuth(this IServiceCollection services) => services;
    public static IApplicationBuilder UseAuth(this IApplicationBuilder app) => app;
}
