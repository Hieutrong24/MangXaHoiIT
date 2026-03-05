using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CodeJudge.Application.DTOs
{
    public class RunRequestDto
    {
        public int LanguageId { get; set; }
        public string SourceCode { get; set; }
        public string? Stdin { get; set; }
    }
}
