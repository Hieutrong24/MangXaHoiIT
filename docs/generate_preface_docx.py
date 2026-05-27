from datetime import datetime, timezone
from html import escape
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "Loi_noi_dau_IT_Social_Platform_cap_nhat.docx"


PARAGRAPHS_BEFORE_TABLE = [
    {
        "text": "LỜI NÓI ĐẦU",
        "align": "center",
        "bold": True,
        "size": 32,
        "spacing_after": 360,
    },
    {
        "text": (
            "Trong quá trình xây dựng một hệ thống phần mềm, thiết kế kiến trúc giữ vai trò "
            "như bản định hướng tổng thể cho toàn bộ quá trình phân tích, phát triển, triển khai "
            "và bảo trì. Kiến trúc phần mềm giúp nhóm phát triển xác định rõ các thành phần chính "
            "của hệ thống, cách các thành phần giao tiếp với nhau, công nghệ được sử dụng, cũng như "
            "các yêu cầu quan trọng về hiệu năng, bảo mật, khả năng mở rộng và độ tin cậy. Nhờ đó, "
            "việc phát triển phần mềm trở nên có tổ chức hơn, hạn chế rủi ro khi hệ thống thay đổi "
            "hoặc phát triển thêm chức năng mới."
        ),
        "align": "both",
    },
    {
        "text": (
            "Đề tài IT Social Platform được thực hiện nhằm mô phỏng một nền tảng mạng xã hội dành "
            "cho cộng đồng công nghệ thông tin. Hệ thống hướng đến các chức năng quen thuộc như quản "
            "lý tài khoản, hồ sơ người dùng, bài viết, bình luận, thông báo, trò chuyện thời gian thực "
            "và hỗ trợ luyện tập lập trình thông qua Code Judge. Khi được ứng dụng trong thực tế, đề tài "
            "có thể mang lại một môi trường kết nối, chia sẻ kiến thức, trao đổi học tập và rèn luyện kỹ "
            "năng lập trình cho sinh viên, lập trình viên mới và những người quan tâm đến lĩnh vực IT."
        ),
        "align": "both",
    },
    {
        "text": (
            "Bên cạnh giá trị về mặt chức năng, đề tài còn giúp nhóm hiểu rõ hơn cách tổ chức một hệ "
            "thống phần mềm hiện đại theo hướng nhiều dịch vụ, có API Gateway, cơ chế xác thực, lưu trữ "
            "dữ liệu riêng theo từng miền nghiệp vụ, giao tiếp realtime bằng Socket.IO và xử lý sự kiện "
            "thông qua message broker. Việc xây dựng prototype và bổ sung công cụ Architecture Monitor "
            "cũng hỗ trợ nhóm quan sát trực quan luồng xử lý giữa frontend, backend, database và các dịch "
            "vụ ngoài, từ đó có cơ sở kiểm chứng thiết kế kiến trúc đã đề xuất."
        ),
        "align": "both",
    },
    {
        "text": (
            "Nhóm sinh viên thực hiện đề tài gồm 3 thành viên. Mỗi thành viên đảm nhận các phần việc "
            "khác nhau nhưng mức độ tham gia và khối lượng công việc được phân chia tương đương nhau. "
            "Trong đó, Ngô Trọng Hiếu giữ vai trò trưởng nhóm, trực tiếp điều phối tiến độ và phụ trách "
            "các hạng mục quan trọng nhất của đề tài."
        ),
        "align": "both",
    },
]


TEAM_ROWS = [
    ["STT", "Thành viên", "Vai trò", "Công việc thực hiện"],
    [
        "1",
        "Ngô Trọng Hiếu",
        "Trưởng nhóm",
        (
            "Điều phối tiến độ, định hướng kiến trúc tổng thể, phụ trách các hạng mục quan trọng nhất; "
            "tham gia thiết kế API Gateway, backend, frontend, prototype monitor và tổng hợp báo cáo."
        ),
    ],
    [
        "2",
        "Vũ Đức Thắng",
        "Thành viên",
        (
            "Khảo sát yêu cầu, phân tích nghiệp vụ, mô tả kịch bản sử dụng; tham gia xây dựng chức năng "
            "frontend, kiểm thử luồng người dùng và đóng góp nội dung tài liệu."
        ),
    ],
    [
        "3",
        "Nguyễn Duy Phúc",
        "Thành viên",
        (
            "Tham gia thiết kế và xây dựng các service backend, cơ sở dữ liệu, chức năng realtime; hỗ trợ "
            "kiểm thử, triển khai thử nghiệm và ghi nhận số liệu prototype."
        ),
    ],
]


PARAGRAPHS_AFTER_TABLE = [
    {
        "text": (
            "Nhìn chung, ba thành viên cùng phối hợp trong các giai đoạn phân tích, thiết kế, cài đặt, "
            "kiểm thử và hoàn thiện báo cáo. Sự phân công trên thể hiện vai trò chính của từng thành viên, "
            "đồng thời khối lượng công việc thực hiện trong toàn bộ đề tài là tương đương nhau."
        ),
        "align": "both",
    },
    {
        "text": (
            "Trong quá trình thực hiện, nhóm chúng em đã cố gắng vận dụng các kiến thức đã học về kiến "
            "trúc phần mềm, phát triển ứng dụng web và thiết kế hệ thống phân tán để xây dựng một sản phẩm "
            "prototype có tính minh họa rõ ràng. Do thời gian và kinh nghiệm còn hạn chế, bài làm khó tránh "
            "khỏi thiếu sót. Nhóm rất mong nhận được góp ý từ giảng viên để có thể hoàn thiện đề tài tốt hơn."
        ),
        "align": "both",
    },
]


def run_xml(text, bold=False, size=26):
    bold_xml = "<w:b/>" if bold else ""
    return f"""
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:eastAsia="Times New Roman"/>
          {bold_xml}
          <w:sz w:val="{size}"/>
        </w:rPr>
        <w:t>{escape(text)}</w:t>
      </w:r>
    """


def paragraph_xml(item):
    align = item.get("align", "both")
    size = item.get("size", 26)
    spacing_after = item.get("spacing_after", 180)
    return f"""
    <w:p>
      <w:pPr>
        <w:jc w:val="{align}"/>
        <w:spacing w:after="{spacing_after}" w:line="360" w:lineRule="auto"/>
      </w:pPr>
      {run_xml(item["text"], item.get("bold", False), size)}
    </w:p>
    """


def table_cell_xml(text, width, bold=False):
    fill = '<w:shd w:fill="EAF2F8"/>' if bold else ""
    return f"""
      <w:tc>
        <w:tcPr>
          <w:tcW w:w="{width}" w:type="dxa"/>
          {fill}
        </w:tcPr>
        <w:p>
          <w:pPr>
            <w:spacing w:after="80"/>
          </w:pPr>
          {run_xml(text, bold=bold, size=24)}
        </w:p>
      </w:tc>
    """


def team_table_xml():
    widths = [650, 2200, 1700, 5200]
    rows_xml = []
    for row_index, row in enumerate(TEAM_ROWS):
        cells = "".join(table_cell_xml(value, widths[index], bold=row_index == 0) for index, value in enumerate(row))
        rows_xml.append(f"<w:tr>{cells}</w:tr>")

    return f"""
    <w:tbl>
      <w:tblPr>
        <w:tblW w:w="9750" w:type="dxa"/>
        <w:tblBorders>
          <w:top w:val="single" w:sz="6" w:space="0" w:color="A6A6A6"/>
          <w:left w:val="single" w:sz="6" w:space="0" w:color="A6A6A6"/>
          <w:bottom w:val="single" w:sz="6" w:space="0" w:color="A6A6A6"/>
          <w:right w:val="single" w:sz="6" w:space="0" w:color="A6A6A6"/>
          <w:insideH w:val="single" w:sz="6" w:space="0" w:color="A6A6A6"/>
          <w:insideV w:val="single" w:sz="6" w:space="0" w:color="A6A6A6"/>
        </w:tblBorders>
        <w:tblCellMar>
          <w:top w:w="100" w:type="dxa"/>
          <w:left w:w="100" w:type="dxa"/>
          <w:bottom w:w="100" w:type="dxa"/>
          <w:right w:w="100" w:type="dxa"/>
        </w:tblCellMar>
      </w:tblPr>
      {"".join(rows_xml)}
    </w:tbl>
    """


def build_document_xml():
    body = "\n".join(paragraph_xml(item) for item in PARAGRAPHS_BEFORE_TABLE)
    body += team_table_xml()
    body += "\n".join(paragraph_xml(item) for item in PARAGRAPHS_AFTER_TABLE)
    return f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
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
    {body}
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="708" w:footer="708" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>
"""


CONTENT_TYPES = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>
"""

RELS = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>
"""

WORD_RELS = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"/>
"""

APP_PROPS = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"
  xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>Microsoft Word</Application>
</Properties>
"""


def core_props():
    now = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")
    return f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:dcterms="http://purl.org/dc/terms/"
  xmlns:dcmitype="http://purl.org/dc/dcmitype/"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>Lời nói đầu - IT Social Platform</dc:title>
  <dc:creator>Nhóm sinh viên thực hiện đề tài</dc:creator>
  <cp:lastModifiedBy>Codex</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">{now}</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">{now}</dcterms:modified>
</cp:coreProperties>
"""


def main():
    with ZipFile(OUTPUT, "w", ZIP_DEFLATED) as docx:
        docx.writestr("[Content_Types].xml", CONTENT_TYPES)
        docx.writestr("_rels/.rels", RELS)
        docx.writestr("word/_rels/document.xml.rels", WORD_RELS)
        docx.writestr("word/document.xml", build_document_xml())
        docx.writestr("docProps/app.xml", APP_PROPS)
        docx.writestr("docProps/core.xml", core_props())
    print(OUTPUT)


if __name__ == "__main__":
    main()
