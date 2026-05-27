from __future__ import annotations

import html
import zipfile
from pathlib import Path


OUT = Path(__file__).resolve().parents[1] / "Mo_ta_kich_ban_xac_thuc_kien_truc.docx"


def esc(text: str) -> str:
    return html.escape(text, quote=True)


def make_run(text: str, *, bold: bool = False, size: int = 26) -> str:
    props = [
        '<w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:eastAsia="Times New Roman"/>',
        '<w:color w:val="000000"/>',
        f'<w:sz w:val="{size}"/>',
        f'<w:szCs w:val="{size}"/>',
    ]
    if bold:
        props.append("<w:b/>")
    rpr = f"<w:rPr>{''.join(props)}</w:rPr>"

    if text == "":
        return f"<w:r>{rpr}</w:r>"

    parts = text.split("\n")
    body: list[str] = []
    for index, part in enumerate(parts):
        body.append(f'<w:t xml:space="preserve">{esc(part)}</w:t>')
        if index < len(parts) - 1:
            body.append("<w:br/>")
    return f"<w:r>{rpr}{''.join(body)}</w:r>"


def para(text: str = "", *, style: str | None = None, bold: bool = False, size: int = 26, align: str | None = None) -> str:
    ppr: list[str] = []
    if style:
        ppr.append(f'<w:pStyle w:val="{style}"/>')
    if align:
        ppr.append(f'<w:jc w:val="{align}"/>')
    ppr_xml = f"<w:pPr>{''.join(ppr)}</w:pPr>" if ppr else ""
    return f"<w:p>{ppr_xml}{make_run(text, bold=bold, size=size)}</w:p>"


def cell_para(text: str, *, bold: bool = False, size: int = 24, align: str | None = None) -> str:
    ppr: list[str] = []
    if align:
        ppr.append(f'<w:jc w:val="{align}"/>')
    ppr_xml = f"<w:pPr>{''.join(ppr)}</w:pPr>" if ppr else ""
    return f"<w:p>{ppr_xml}{make_run(text, bold=bold, size=size)}</w:p>"


def table(rows: list[list[str]], widths: list[int], *, header_rows: int = 1) -> str:
    grid = "".join(f'<w:gridCol w:w="{w}"/>' for w in widths)
    body: list[str] = []

    for r_index, row in enumerate(rows):
        cells: list[str] = []
        for c_index, cell in enumerate(row):
            align = "center" if c_index == 0 else None
            content = cell_para(cell, bold=r_index < header_rows, size=22 if r_index >= header_rows else 24, align=align)
            cells.append(
                "<w:tc>"
                f'<w:tcPr><w:tcW w:w="{widths[c_index]}" w:type="dxa"/><w:vAlign w:val="center"/></w:tcPr>'
                f"{content}"
                "</w:tc>"
            )
        body.append(f"<w:tr>{''.join(cells)}</w:tr>")

    return (
        "<w:tbl>"
        "<w:tblPr>"
        '<w:tblStyle w:val="TableGrid"/>'
        '<w:tblW w:w="0" w:type="auto"/>'
        '<w:tblLayout w:type="fixed"/>'
        "</w:tblPr>"
        f"<w:tblGrid>{grid}</w:tblGrid>"
        f"{''.join(body)}"
        "</w:tbl>"
    )


doc: list[str] = []

doc.append(para("2.5. Mô tả các kịch bản để xác thực (kiểm tra) bản thiết kế kiến trúc", style="Heading1"))
doc.append(
    para(
        "Việc xây dựng các kịch bản xác thực kiến trúc nhằm kiểm tra mức độ phù hợp giữa bản thiết kế kiến trúc và cách hệ thống IT Social Platform được hiện thực trong source code. Trên cơ sở khảo sát frontend, frontend-admin, API Gateway, các microservice, cơ sở dữ liệu, RabbitMQ, Docker Compose và các dịch vụ tích hợp ngoài, nhóm chúng em xác định rằng việc xác thực cần tập trung vào khả năng phối hợp giữa các thành phần chứ không chỉ dừng ở việc kiểm tra đầu ra chức năng theo góc nhìn người dùng."
    )
)
doc.append(
    para(
        "Các kịch bản dưới đây được xây dựng để đánh giá đồng thời nhiều khía cạnh kiến trúc như phân tách miền nghiệp vụ, bảo mật truy cập qua API Gateway, giao tiếp đồng bộ và bất đồng bộ giữa các service, xử lý realtime bằng Socket.IO, lưu trữ dữ liệu trên SQL Server và MongoDB, cũng như tích hợp với Cloudinary, Judge0, Google OAuth, MailHog và môi trường triển khai Docker Compose. Thông qua đó, nhóm chúng em có cơ sở nhận định khả năng mở rộng, bảo trì, cô lập lỗi và vận hành thực tế của mô hình microservices mà dự án đang áp dụng."
    )
)

rows = [
    [
        "STT",
        "Kịch bản xác thực",
        "Mục tiêu kiểm tra",
        "Thành phần tham gia",
        "Luồng kiểm tra",
        "Kết quả mong đợi",
        "Ý nghĩa đối với kiến trúc",
    ],
    [
        "1",
        "Đăng nhập và xác thực người dùng",
        "Kiểm tra luồng xác thực tập trung, bảo vệ API riêng tư và tính hợp lệ của JWT, refresh token, đăng nhập Google.",
        "Frontend User, API Gateway, Auth Service, Auth SQL Server, Google OAuth",
        "Người dùng gửi yêu cầu đăng nhập từ giao diện; API Gateway chuyển tiếp đến Auth Service; Auth Service kiểm tra dữ liệu trong Auth SQL Server hoặc xử lý Google callback; token được trả về và được dùng để gọi API riêng tư.",
        "Người dùng đăng nhập thành công; access token và refresh token hợp lệ; các API riêng tư chỉ phản hồi khi có JWT đúng.",
        "Kịch bản này xác thực vai trò trung tâm của Gateway trong bảo mật đầu vào và xác thực sự tách biệt rõ ràng của miền danh tính trong Auth Service.",
    ],
    [
        "2",
        "Quản lý hồ sơ cá nhân",
        "Kiểm tra khả năng xử lý dữ liệu hồ sơ phức hợp và tính nhất quán khi cập nhật lại thông tin người dùng.",
        "Frontend User, API Gateway, User Service, User SQL Server",
        "Người dùng chỉnh sửa hồ sơ, kỹ năng, liên kết ngoài, thông tin học tập; request đi qua Gateway đến User Service; dữ liệu được lưu vào User SQL Server và được truy vấn lại để hiển thị trên giao diện.",
        "Thông tin hồ sơ được lưu đúng, đọc lại đầy đủ và hiển thị nhất quán sau khi cập nhật.",
        "Kịch bản chứng minh User Service đang giữ vai trò miền dữ liệu người dùng độc lập, giúp kiến trúc dễ bảo trì và không làm lẫn logic hồ sơ với các service khác.",
    ],
    [
        "3",
        "Đăng bài viết và upload media",
        "Kiểm tra luồng phối hợp giữa nghiệp vụ nội dung và dịch vụ lưu trữ media bên ngoài.",
        "Frontend User, API Gateway, Content Service, Content MongoDB, Cloudinary",
        "Người dùng tạo bài viết có tệp đính kèm; file được gửi qua route upload tại Gateway sang Content Service; Content Service tải tệp lên Cloudinary, nhận URL rồi lưu metadata cùng bài viết vào Content MongoDB.",
        "Bài viết được tạo thành công; media được tải lên Cloudinary; URL trả về được gắn với bài viết và hiển thị đúng trên giao diện.",
        "Kịch bản này xác thực cách kiến trúc tách riêng luồng media ra khỏi xử lý nội dung cốt lõi, qua đó giảm phụ thuộc và thuận lợi mở rộng dung lượng lưu trữ.",
    ],
    [
        "4",
        "Bình luận bài viết và phát sinh thông báo",
        "Kiểm tra giao tiếp bất đồng bộ sau thao tác nội dung và khả năng phát tán thông báo.",
        "Content Service, RabbitMQ, Notification Service, Notification MongoDB, Socket.IO, Frontend User",
        "Người dùng gửi bình luận; Content Service lưu bình luận và phát sự kiện qua RabbitMQ; Notification Service tiêu thụ sự kiện, tạo notification trong MongoDB và đẩy realtime đến người nhận qua Socket.IO.",
        "Bình luận được lưu; thông báo mới được tạo; người nhận thấy thông báo gần như tức thời.",
        "Kịch bản cho thấy RabbitMQ giúp tách rời service phát sinh nghiệp vụ và service xử lý hậu sự kiện, từ đó tăng tính mềm dẻo của kiến trúc.",
    ],
    [
        "5",
        "Nhắn tin realtime",
        "Kiểm tra năng lực xử lý giao tiếp thời gian thực và lưu vết tin nhắn.",
        "Frontend User, Chat Service, Socket.IO, Chat MongoDB",
        "Người dùng kết nối socket, tham gia cuộc trò chuyện cá nhân hoặc nhóm, gửi tin nhắn; Chat Service phát tin nhắn tới các socket liên quan và đồng thời lưu dữ liệu vào Chat MongoDB.",
        "Tin nhắn được gửi và nhận gần thời gian thực; lịch sử tin nhắn được lưu để truy xuất lại.",
        "Kịch bản xác thực việc tách Chat Service thành một thành phần realtime chuyên biệt là phù hợp với yêu cầu hiệu năng và giảm tải cho các service HTTP truyền thống.",
    ],
    [
        "6",
        "Nhận thông báo realtime",
        "Kiểm tra việc hợp nhất dữ liệu notification, trạng thái chưa đọc và kênh realtime đến client.",
        "Notification Service, Socket.IO, RabbitMQ, Frontend User",
        "Khi hệ thống phát sinh sự kiện như comment, message hoặc friend request, Notification Service nhận event, lưu thông báo, cập nhật unread count và phát sự kiện notification:new đến client đang kết nối.",
        "Người dùng nhận thông báo tức thời; số lượng chưa đọc được cập nhật đúng với dữ liệu đã lưu.",
        "Kịch bản này cho thấy kiến trúc đã tách được tầng thông báo khỏi nghiệp vụ nguồn, đồng thời đáp ứng yêu cầu phản hồi nhanh của hệ thống mạng xã hội.",
    ],
    [
        "7",
        "Học lập trình và nộp bài Code Judge",
        "Kiểm tra chuỗi phối hợp từ giao diện học tập đến thực thi và chấm mã nguồn.",
        "Frontend User, API Gateway, Code Judge Service, Judge Runner, Judge0, Judge SQL Server, Judge MongoDB",
        "Người học viết mã trên Monaco Editor; nếu chạy thử thì Gateway chuyển đến Code Judge Service và tích hợp Judge0; nếu nộp bài thì Code Judge Service tạo submission, điều phối Judge Runner chấm testcase, lưu kết quả trong Judge SQL Server và log liên quan trong Judge MongoDB.",
        "Hệ thống trả về verdict như AC, WA, TLE, RE, CE, MLE; dữ liệu submission và log được lưu để truy vấn lại.",
        "Kịch bản xác thực sự cần thiết của việc tách Code Judge Service và Judge Runner thành các thành phần riêng, qua đó hỗ trợ mở rộng độc lập cho miền học lập trình.",
    ],
    [
        "8",
        "Quản trị hệ thống",
        "Kiểm tra cơ chế phân quyền và luồng điều phối tới đúng service nghiệp vụ.",
        "Frontend Admin, API Gateway, Auth Service, User Service, Content Service, Code Judge Service",
        "Admin đăng nhập và truy cập các chức năng quản trị; Gateway kiểm tra JWT và role admin; các thao tác như quản lý user, nội dung, nhóm, problem, submission được chuyển đến service tương ứng.",
        "Chỉ tài khoản admin truy cập được màn hình và API quản trị; dữ liệu được xử lý đúng ở service liên quan.",
        "Kịch bản này xác thực thiết kế phân quyền tập trung tại Gateway nhưng vẫn duy trì ranh giới nghiệp vụ độc lập ở từng service phía sau.",
    ],
    [
        "9",
        "API không có JWT hoặc JWT không hợp lệ",
        "Kiểm tra lớp phòng vệ truy cập đối với API riêng tư.",
        "API Gateway, middleware xác thực, Frontend User hoặc client kiểm thử",
        "Gửi request đến các route yêu cầu xác thực nhưng bỏ trống token hoặc dùng token sai định dạng, hết hạn hay sai chữ ký; middleware tại Gateway thực hiện từ chối trước khi request chạm vào service nội bộ.",
        "Request bị chặn với phản hồi unauthorized hoặc forbidden; dữ liệu riêng tư không bị rò rỉ.",
        "Kịch bản này chứng minh API Gateway đóng vai trò cửa bảo vệ tập trung, giúp giảm lặp logic bảo mật ở các service phía sau.",
    ],
    [
        "10",
        "Một service gặp lỗi tạm thời",
        "Kiểm tra khả năng cô lập lỗi và hạn chế lan truyền sự cố trong mô hình microservices.",
        "Chat Service hoặc Notification Service, API Gateway, các service còn lại",
        "Giả lập một service như Chat Service hoặc Notification Service không phản hồi trong thời gian ngắn; theo dõi xem các chức năng khác như hồ sơ, đăng bài, đăng nhập hoặc học lập trình còn hoạt động hay không.",
        "Lỗi được giới hạn trong service gặp sự cố; các chức năng không phụ thuộc trực tiếp vẫn tiếp tục sử dụng được.",
        "Kịch bản này xác thực một lợi ích cốt lõi của microservices là cô lập lỗi theo miền nghiệp vụ và giảm tác động dây chuyền trên toàn hệ thống.",
    ],
    [
        "11",
        "Gửi nhiều sự kiện đồng thời",
        "Kiểm tra khả năng tiếp nhận tải bất đồng bộ và tránh nghẽn ở luồng xử lý chính.",
        "RabbitMQ, Content Service, Chat Service, Notification Service, Frontend User",
        "Nhiều người dùng cùng lúc bình luận, gửi tin nhắn hoặc tạo ra các sự kiện xã hội; các service phát event lên RabbitMQ; Notification Service và các consumer liên quan xử lý dần theo hàng đợi.",
        "RabbitMQ tiếp nhận và phân phối event ổn định; request chính phản hồi nhanh hơn so với việc xử lý đồng bộ toàn bộ hậu quả nghiệp vụ.",
        "Kịch bản này xác thực giá trị của kiến trúc hướng sự kiện trong việc hỗ trợ mở rộng tải và giảm phụ thuộc thời gian giữa các thành phần.",
    ],
    [
        "12",
        "Triển khai toàn hệ thống bằng Docker Compose",
        "Kiểm tra khả năng khởi tạo đồng bộ môi trường chạy và kết nối giữa các container.",
        "Frontend, API Gateway, các Microservice, SQL Server, MongoDB, RabbitMQ, MailHog, Docker Compose, Docker Network",
        "Khởi chạy các file Docker Compose của dự án; theo dõi việc tạo container, network, volume; kiểm tra các service có kết nối được tới database, broker, gateway và runner theo cấu hình nội bộ hay không.",
        "Các container khởi động đúng; gateway và service giao tiếp được với nhau; database, RabbitMQ và MailHog sẵn sàng phục vụ cho hệ thống.",
        "Kịch bản này xác thực rằng kiến trúc không chỉ hợp lý về mặt lôgic mà còn có thể triển khai nhất quán trong môi trường tích hợp đa thành phần.",
    ],
]

doc.append(table(rows, [700, 1900, 2100, 2000, 3100, 2200, 2300]))
doc.append(
    para(
        "Từ các kịch bản xác thực nêu trên, nhóm chúng em nhận thấy bản thiết kế kiến trúc microservices của IT Social Platform phù hợp với đặc thù của dự án. API Gateway đã thể hiện rõ vai trò điểm vào tập trung, vừa hỗ trợ điều phối request vừa tăng cường bảo vệ API thông qua cơ chế JWT và phân quyền. Các service như Auth Service, User Service, Content Service, Chat Service, Notification Service và Code Judge Service được tách theo miền nghiệp vụ tương đối rõ ràng, nhờ đó giảm phụ thuộc chéo và thuận lợi cho bảo trì. RabbitMQ hỗ trợ hiệu quả cho giao tiếp bất đồng bộ, đặc biệt trong các luồng comment, message và notification. Socket.IO đáp ứng tốt yêu cầu realtime của chat và thông báo. SQL Server được dùng phù hợp cho dữ liệu có cấu trúc chặt chẽ, trong khi MongoDB phục vụ hiệu quả cho dữ liệu nội dung, tin nhắn, notification và log. Bên cạnh đó, Cloudinary, Judge0, Google OAuth và MailHog cho thấy kiến trúc đã sẵn sàng tích hợp với các dịch vụ ngoài theo từng nhu cầu chuyên biệt. Cuối cùng, Docker Compose góp phần chuẩn hóa môi trường triển khai, qua đó hỗ trợ tốt cho vận hành, kiểm thử tích hợp và mở rộng hệ thống trong tương lai."
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
      <w:color w:val="000000"/>
      <w:sz w:val="26"/>
      <w:szCs w:val="26"/>
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
      <w:color w:val="000000"/>
      <w:b/>
      <w:sz w:val="28"/>
      <w:szCs w:val="28"/>
    </w:rPr>
  </w:style>
  <w:style w:type="table" w:styleId="TableGrid">
    <w:name w:val="Table Grid"/>
    <w:tblPr>
      <w:tblBorders>
        <w:top w:val="single" w:sz="8" w:space="0" w:color="000000"/>
        <w:left w:val="single" w:sz="8" w:space="0" w:color="000000"/>
        <w:bottom w:val="single" w:sz="8" w:space="0" w:color="000000"/>
        <w:right w:val="single" w:sz="8" w:space="0" w:color="000000"/>
        <w:insideH w:val="single" w:sz="8" w:space="0" w:color="000000"/>
        <w:insideV w:val="single" w:sz="8" w:space="0" w:color="000000"/>
      </w:tblBorders>
    </w:tblPr>
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
      <w:pgSz w:w="16838" w:h="11906" w:orient="landscape"/>
      <w:pgMar w:top="720" w:right="720" w:bottom="720" w:left="720" w:header="708" w:footer="708" w:gutter="0"/>
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
