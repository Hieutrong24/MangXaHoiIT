from __future__ import annotations

import html
import zipfile
from pathlib import Path


OUT = Path(__file__).resolve().parents[1] / "Noi_dung_Chuong_4_IT_Social_Platform.docx"


def esc(text: str) -> str:
    return html.escape(text, quote=True)


def run(text: str, *, bold: bool = False, size: int = 26) -> str:
    props = [
        '<w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:eastAsia="Times New Roman"/>',
        f'<w:sz w:val="{size}"/>',
        f'<w:szCs w:val="{size}"/>',
        '<w:color w:val="000000"/>',
    ]
    if bold:
        props.append("<w:b/>")
    rpr = f"<w:rPr>{''.join(props)}</w:rPr>"
    return f'<w:r>{rpr}<w:t xml:space="preserve">{esc(text)}</w:t></w:r>'


def para(text: str = "", *, style: str | None = None, bold: bool = False, size: int = 26) -> str:
    ppr = f'<w:pPr><w:pStyle w:val="{style}"/></w:pPr>' if style else ""
    return f"<w:p>{ppr}{run(text, bold=bold, size=size)}</w:p>"


doc: list[str] = []

doc.append(para("4.1. Những nội dung đã học được qua dự án này", style="Heading1"))
doc.append(
    para(
        "Thông qua quá trình xây dựng và hoàn thiện dự án IT Social Platform, nhóm chúng em đã có cơ hội tiếp cận tương đối đầy đủ với quy trình phát triển một hệ thống phần mềm có quy mô lớn hơn so với các bài tập đơn lẻ. Điểm học được rõ nhất là cách chuyển hóa yêu cầu nghiệp vụ thành các thành phần kiến trúc cụ thể, trong đó mỗi dịch vụ đảm nhiệm một miền chức năng riêng như xác thực, người dùng, nội dung, trò chuyện, thông báo và chấm bài lập trình. Từ việc đọc và tổ chức source code, nhóm chúng em hiểu rõ hơn cách phân rã hệ thống theo hướng microservices để giảm phụ thuộc, tăng khả năng mở rộng và hỗ trợ phát triển song song."
    )
)
doc.append(
    para(
        "Bên cạnh đó, dự án giúp nhóm chúng em củng cố kiến thức về việc kết hợp nhiều công nghệ trong cùng một hệ thống. Ở phía giao diện, nhóm chúng em học được cách tổ chức frontend theo hướng module hóa với React, tách riêng giao diện người dùng và giao diện quản trị. Ở phía backend, nhóm chúng em hiểu sâu hơn về vai trò của API Gateway trong việc gom đầu vào, xác thực JWT, điều phối request và bảo vệ các API nội bộ. Việc triển khai đồng thời các service Node.js và .NET cũng giúp nhóm chúng em nhận thức rõ hơn về đặc điểm của từng nền tảng, từ đó biết lựa chọn công nghệ phù hợp với từng bài toán cụ thể."
    )
)
doc.append(
    para(
        "Một nội dung quan trọng khác mà nhóm chúng em học được là cách thiết kế và vận hành các cơ chế giao tiếp bất đồng bộ và thời gian thực. Qua RabbitMQ, nhóm chúng em hiểu rõ hơn về lợi ích của việc phát sinh và tiêu thụ sự kiện giữa các service, đặc biệt trong các luồng bình luận, thông báo và nhắn tin. Qua Socket.IO, nhóm chúng em học được cách hiện thực các chức năng realtime như chat, trạng thái online hoặc thông báo tức thời. Đồng thời, việc sử dụng đồng thời SQL Server và MongoDB cũng giúp nhóm chúng em nhận ra ý nghĩa của việc lựa chọn mô hình lưu trữ phù hợp với bản chất dữ liệu thay vì áp dụng một công nghệ duy nhất cho toàn hệ thống."
    )
)
doc.append(
    para(
        "Ngoài ra, dự án còn mang lại cho nhóm chúng em nhiều kinh nghiệm thực tiễn về tích hợp dịch vụ ngoài và triển khai hệ thống. Việc kết nối Cloudinary cho upload media, Judge0 cho chạy thử mã nguồn, Google OAuth cho đăng nhập ngoài và MailHog cho môi trường kiểm thử cho thấy một hệ thống hiện đại thường không hoạt động biệt lập mà cần tương tác với nhiều nền tảng bổ trợ. Đồng thời, việc đóng gói các thành phần bằng Docker và Docker Compose giúp nhóm chúng em hiểu rõ hơn về cách chuẩn hóa môi trường phát triển, chạy đồng thời nhiều container và xử lý các phụ thuộc giữa service, cơ sở dữ liệu và message broker."
    )
)

doc.append(para("4.2. Những vấn đề còn hạn chế và chưa thực hiện được trong dự án này", style="Heading1"))
doc.append(
    para(
        "Mặc dù dự án đã hình thành được một kiến trúc tương đối đầy đủ, nhóm chúng em nhận thấy hệ thống vẫn còn một số hạn chế cả về kỹ thuật lẫn mức độ hoàn thiện. Trước hết, một số chức năng đã được thiết kế hoặc hiện thực ở mức cơ bản nhưng chưa đạt tới độ chặt chẽ của một sản phẩm triển khai thực tế. Chẳng hạn, một số luồng giao diện vẫn còn đơn giản, một số phần tìm kiếm và gợi ý nội dung mới dừng ở mức nền tảng ban đầu, trong khi các cơ chế tối ưu trải nghiệm người dùng vẫn cần tiếp tục hoàn thiện."
    )
)
doc.append(
    para(
        "Ở góc độ backend, một số thành phần vẫn còn mang tính chuyển tiếp giữa môi trường học tập và môi trường triển khai thực tế. Content Service hiện có cơ chế fallback sang file storage khi MongoDB không sẵn sàng, điều này thuận tiện cho phát triển nhưng chưa thật sự tối ưu cho sản phẩm quy mô lớn. Tương tự, Code Judge Service đang sử dụng hàng đợi trong bộ nhớ cho một số luồng chấm bài nền, vì vậy khi service khởi động lại có thể phát sinh rủi ro mất trạng thái đang xử lý. Đây là những điểm mà nhóm chúng em chưa có đủ thời gian để chuyển sang một cơ chế bền vững hơn như hàng đợi phân tán chuyên dụng."
    )
)
doc.append(
    para(
        "Một hạn chế khác là mức độ quan sát và kiểm thử toàn hệ thống vẫn chưa thật sự sâu. Dự án đã có các health check, logging và một số job nền, tuy nhiên chưa hình thành đầy đủ một giải pháp giám sát tập trung, tracing liên dịch vụ hoặc bộ kiểm thử tích hợp có độ phủ cao cho toàn bộ các luồng nghiệp vụ quan trọng. Điều này khiến việc phát hiện lỗi xuyên suốt nhiều service hoặc đánh giá hiệu năng dưới tải lớn chưa được thực hiện một cách đầy đủ như mong muốn."
    )
)
doc.append(
    para(
        "Ngoài ra, xét trên phương diện bảo mật và vận hành, hệ thống vẫn còn một số điểm cần cải thiện. Một số cấu hình trong môi trường phát triển còn mang tính minh họa, chưa được chuẩn hóa hoàn toàn theo hướng production. Bên cạnh đó, dự án chưa triển khai đầy đủ các cơ chế như phân tầng quyền chi tiết hơn, chiến lược sao lưu và phục hồi dữ liệu, giới hạn tài nguyên chặt chẽ cho toàn bộ các luồng thực thi mã nguồn, cũng như các chính sách triển khai liên tục. Những nội dung này vượt quá phạm vi thời gian của học phần nên nhóm chúng em mới chỉ dừng ở mức nền tảng."
    )
)

doc.append(para("4.3. Trình bày mong muốn và hướng phát triển cho dự án này", style="Heading1"))
doc.append(
    para(
        "Trong giai đoạn tiếp theo, nhóm chúng em mong muốn tiếp tục phát triển IT Social Platform theo hướng trở thành một nền tảng học tập và kết nối chuyên biệt cho sinh viên công nghệ thông tin với mức độ hoàn thiện cao hơn. Trước hết, nhóm chúng em muốn củng cố thêm các chức năng cốt lõi như hồ sơ học thuật, cộng đồng, trò chuyện, thông báo và hệ thống bài viết để bảo đảm trải nghiệm sử dụng được đồng bộ, ổn định và thân thiện hơn trên cả giao diện người dùng lẫn giao diện quản trị."
    )
)
doc.append(
    para(
        "Về kiến trúc, nhóm chúng em mong muốn hoàn thiện hơn các thành phần hạ tầng theo hướng gần với môi trường triển khai thực tế. Cụ thể, nhóm chúng em muốn thay thế hoặc mở rộng các cơ chế tạm thời bằng các giải pháp bền vững hơn, chẳng hạn cải tiến hàng đợi xử lý nền cho Code Judge, bổ sung cơ chế giám sát và tracing tập trung, tăng cường kiểm thử tích hợp giữa các microservice và chuẩn hóa quản lý cấu hình môi trường. Đây là bước quan trọng để hệ thống có thể phát triển ổn định khi số lượng người dùng và dữ liệu tăng lên."
    )
)
doc.append(
    para(
        "Ở mức tính năng, nhóm chúng em mong muốn mở rộng sâu hơn phần học lập trình trực tuyến. Hướng phát triển dự kiến bao gồm đa dạng hóa loại bài tập, cải thiện dashboard học tập, làm rõ hơn hệ thống lộ trình học, badge, streak, daily challenge và cá nhân hóa tiến trình học cho từng người dùng. Bên cạnh đó, nhóm chúng em cũng mong muốn phát triển thêm các công cụ hỗ trợ học tập thông minh, trong đó AI không chỉ dừng ở gợi ý nội dung cơ bản mà có thể tham gia gợi ý tài liệu, định hướng luyện tập hoặc hỗ trợ giải thích lỗi lập trình ở mức phù hợp."
    )
)
doc.append(
    para(
        "Cuối cùng, về lâu dài, nhóm chúng em mong muốn dự án có thể được hoàn thiện theo hướng một sản phẩm có khả năng vận hành thực tế trong phạm vi trường học hoặc cộng đồng sinh viên. Để đạt được điều đó, hệ thống cần tiếp tục được tối ưu về bảo mật, hiệu năng, khả năng sao lưu dữ liệu, độ ổn định của realtime và mức độ tự động hóa khi triển khai. Nhóm chúng em xem dự án này không chỉ là sản phẩm của học phần mà còn là nền tảng để tiếp tục nghiên cứu, thực hành và phát triển năng lực thiết kế phần mềm trong các đồ án và công việc sau này."
    )
)


styles = """
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:qFormat/>
    <w:pPr><w:spacing w:after="120" w:line="300" w:lineRule="auto"/></w:pPr>
    <w:rPr>
      <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:eastAsia="Times New Roman"/>
      <w:sz w:val="26"/>
      <w:szCs w:val="26"/>
      <w:color w:val="000000"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading1">
    <w:name w:val="heading 1"/>
    <w:basedOn w:val="Normal"/>
    <w:next w:val="Normal"/>
    <w:qFormat/>
    <w:pPr><w:spacing w:before="180" w:after="120"/></w:pPr>
    <w:rPr>
      <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:eastAsia="Times New Roman"/>
      <w:b/>
      <w:sz w:val="26"/>
      <w:szCs w:val="26"/>
      <w:color w:val="000000"/>
    </w:rPr>
  </w:style>
</w:styles>
"""


document_xml = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas"
 xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
 xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"
 xmlns:v="urn:schemas-microsoft-com:vml"
 xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing"
 xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
 xmlns:w10="urn:schemas-microsoft-com:office:word"
 xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
 xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml"
 xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup"
 xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk"
 xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml"
 xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape"
 mc:Ignorable="w14 wp14">
  <w:body>
    {''.join(doc)}
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" w:header="708" w:footer="708" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>
"""

content_types = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>
"""

rels = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>
"""

document_rels = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>
"""

with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED) as zf:
    zf.writestr("[Content_Types].xml", content_types)
    zf.writestr("_rels/.rels", rels)
    zf.writestr("word/_rels/document.xml.rels", document_rels)
    zf.writestr("word/document.xml", document_xml)
    zf.writestr("word/styles.xml", styles)

print(OUT)
