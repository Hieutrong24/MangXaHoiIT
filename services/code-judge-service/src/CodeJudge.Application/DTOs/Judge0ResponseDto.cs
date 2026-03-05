using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CodeJudge.Application.DTOs
{
    public class Judge0ResponseDto
    {
        public string? Stdout { get; set; }
        public string? Stderr { get; set; }
        public string? CompileOutput { get; set; }
        public int? Time { get; set; }
        public int? Memory { get; set; }
        public JudgeStatus? Status { get; set; }
    }

    public class JudgeStatus
    {
        public int Id { get; set; }
        public string Description { get; set; } = default!;
    }
}
