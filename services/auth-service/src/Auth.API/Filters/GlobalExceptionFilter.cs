using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace Auth.API.Filters
{
    public class GlobalExceptionFilter : IExceptionFilter
    {
        private readonly IWebHostEnvironment _env;

        public GlobalExceptionFilter(IWebHostEnvironment env)
        {
            _env = env;
        }

        public void OnException(ExceptionContext context)
        {
            var ex = context.Exception;

            if (ex is UnauthorizedAccessException)
            {
                context.Result = new ObjectResult(new ProblemDetails
                {
                    Title = "Unauthorized",
                    Detail = ex.Message,
                    Status = StatusCodes.Status401Unauthorized
                })
                { StatusCode = StatusCodes.Status401Unauthorized };

                context.ExceptionHandled = true;
                return;
            }

            if (ex is ArgumentException)
            {
                context.Result = new ObjectResult(new ProblemDetails
                {
                    Title = "Bad Request",
                    Detail = ex.Message,
                    Status = StatusCodes.Status400BadRequest
                })
                { StatusCode = StatusCodes.Status400BadRequest };

                context.ExceptionHandled = true;
                return;
            }

          
            context.Result = new ObjectResult(new ProblemDetails
            {
                Title = "Internal Server Error",
                Detail = _env.IsDevelopment() ? ex.ToString() : "Unexpected error.",
                Status = StatusCodes.Status500InternalServerError
            })
            { StatusCode = StatusCodes.Status500InternalServerError };

            context.ExceptionHandled = true;
        }
    }
}
