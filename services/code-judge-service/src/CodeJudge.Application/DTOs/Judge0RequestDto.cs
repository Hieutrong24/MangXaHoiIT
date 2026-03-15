using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CodeJudge.Application.DTOs
{
    public class Judge0RequestDto
    {
        public int LanguageId { get; set; }
        public string SourceCode { get; set; } = string.Empty;
        public string? Stdin { get; set; }
        public string? ExpectedOutput { get; set; }

         
        public double? CpuTimeLimit { get; set; }      // seconds
        public int? MemoryLimit { get; set; }          // KB
    }
}
