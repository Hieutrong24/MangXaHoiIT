from __future__ import annotations

import html
import zipfile
from pathlib import Path


OUT = Path(__file__).with_name("Kien_truc_phan_mem_IT_Social_Platform.docx")


def esc(text: str) -> str:
    return html.escape(text, quote=True)


def run(text: str, bold: bool = False, italic: bool = False) -> str:
    props = []
    if bold:
        props.append("<w:b/>")
    if italic:
        props.append("<w:i/>")
    rpr = f"<w:rPr>{''.join(props)}</w:rPr>" if props else ""
    return f"<w:r>{rpr}<w:t xml:space=\"preserve\">{esc(text)}</w:t></w:r>"


def para(text: str = "", style: str | None = None, bullet: bool = False) -> str:
    ppr = []
    if style:
        ppr.append(f"<w:pStyle w:val=\"{style}\"/>")
    if bullet:
        ppr.append("<w:numPr><w:ilvl w:val=\"0\"/><w:numId w:val=\"1\"/></w:numPr>")
    ppr_xml = f"<w:pPr>{''.join(ppr)}</w:pPr>" if ppr else ""
    return f"<w:p>{ppr_xml}{run(text)}</w:p>"


def rich_para(parts: list[tuple[str, bool, bool]], style: str | None = None) -> str:
    ppr = f"<w:pPr><w:pStyle w:val=\"{style}\"/></w:pPr>" if style else ""
    return f"<w:p>{ppr}{''.join(run(text, bold, italic) for text, bold, italic in parts)}</w:p>"


def table(rows: list[list[str]]) -> str:
    grid = "".join("<w:gridCol w:w=\"3000\"/>" for _ in rows[0])
    body = []
    for row in rows:
        cells = []
        for cell in row:
            cells.append(
                "<w:tc>"
                "<w:tcPr><w:tcW w:w=\"3000\" w:type=\"dxa\"/></w:tcPr>"
                f"{para(cell)}"
                "</w:tc>"
            )
        body.append(f"<w:tr>{''.join(cells)}</w:tr>")
    return (
        "<w:tbl>"
        "<w:tblPr><w:tblStyle w:val=\"TableGrid\"/><w:tblW w:w=\"0\" w:type=\"auto\"/>"
        "<w:tblLook w:val=\"04A0\" w:firstRow=\"1\" w:lastRow=\"0\" w:firstColumn=\"1\" w:lastColumn=\"0\" w:noHBand=\"0\" w:noVBand=\"1\"/>"
        "</w:tblPr>"
        f"<w:tblGrid>{grid}</w:tblGrid>"
        f"{''.join(body)}"
        "</w:tbl>"
    )


doc: list[str] = []

doc.append(para("KIEN TRUC PHAN MEM DU AN IT SOCIAL PLATFORM", "Title"))
doc.append(para("Van ban hoc thuat phuc vu trinh chieu slide - nhom sinh vien thuc hien", "Subtitle"))
doc.append(para())

doc.append(para("1. Gioi thieu tong quan", "Heading1"))
doc.append(para(
    "IT Social Platform la mot he thong mang xa hoi hoc thuat huong den sinh vien cong nghe thong tin. "
    "Du an ket hop cac chuc nang cong dong, ho so nguoi dung, bai viet, nhom, viec lam, chat thoi gian thuc, "
    "thong bao va nen tang luyen tap lap trinh/code judge. Tu goc nhin kien truc phan mem, he thong duoc xay dung "
    "theo huong microservices, tach cac mien nghiep vu thanh nhieu dich vu doc lap va giao tiep thong qua API Gateway "
    "cung co che su kien bat dong bo."
))
doc.append(para(
    "Muc tieu kien truc cua du an la tang tinh mo rong, de bao tri, de thay the cong nghe, dong thoi dam bao moi "
    "chuc nang co the phat trien doc lap. Cach to chuc nay phu hop voi mot san pham co nhieu mien nghiep vu khac nhau "
    "nhu xac thuc, nguoi dung, noi dung, chat, thong bao va cham bai lap trinh."
))

doc.append(para("2. Cac cong nghe da ap dung va ly do lua chon", "Heading1"))
doc.append(table([
    ["Cong nghe", "Vai tro trong du an", "Ly do lua chon"],
    ["React, Vite, Tailwind CSS", "Xay dung giao dien nguoi dung va trang quan tri", "Phat trien nhanh, component hoa tot, phu hop SPA, de tach module theo feature."],
    ["Node.js, Express", "API Gateway va cac service content/chat/notification/runner", "Nhe, phu hop I/O bat dong bo, xu ly proxy, realtime va tich hop nhanh."],
    [".NET 8, ASP.NET Core", "Auth, User va CodeJudge API", "Kieu du lieu manh, hieu nang tot, DI tich hop, phu hop Clean Architecture va nghiep vu co rang buoc."],
    ["Entity Framework Core", "ORM cho SQL Server trong cac service .NET", "Giam boilerplate truy van, ho tro migration, repository va unit of work."],
    ["SQL Server", "Luu du lieu co cau truc: auth, user, judge", "Dam bao consistency, transaction va rang buoc quan he cho du lieu cot loi."],
    ["MongoDB", "Luu du lieu document/log/realtime: chat, content, notification, judge logs", "Linh hoat schema, phu hop du lieu thay doi nhanh va log document."],
    ["RabbitMQ", "Event bus giua cac service", "Ho tro topic exchange, durable queue, pub/sub bat dong bo, giam phu thuoc truc tiep giua service."],
    ["Socket.IO", "Chat va thong bao realtime", "Giao tiep hai chieu, de quan ly room/user channel, trai nghiem realtime tot."],
    ["Docker, Docker Compose", "Dong goi va khoi chay he thong nhieu service", "Tao moi truong nhat quan, de chay DB, broker, API va runner rieng biet."],
    ["Judge0 va Node Runner", "Thuc thi va cham code", "Judge0 phu hop chay nhanh/external judge; Node Runner cho co che cham noi bo co the tuy bien."],
]))

doc.append(para("3. Kien truc tong the cua he thong", "Heading1"))
doc.append(para(
    "He thong duoc to chuc theo mo hinh client - API Gateway - microservices. Frontend khong goi truc tiep tung service "
    "ma di qua API Gateway. Gateway thuc hien viec dinh tuyen, gan correlation id, kiem tra JWT, truyen header nguoi dung "
    "va chuan hoa loi tu cac upstream service. Phia sau gateway la cac service doc lap, moi service quan ly database rieng."
))
doc.append(para("Cac thanh phan chinh:", "Heading2"))
for item in [
    "Frontend user: cung cap trai nghiem mang xa hoi, hoc lap trinh, code judge, chat va thong bao.",
    "Frontend admin: quan tri nguoi dung, bai viet, nhom, viec lam, bai tap lap trinh, submission va learning catalog.",
    "API Gateway: diem vao duy nhat cho client, chiu trach nhiem proxy, auth, rate limit, correlation id va forward header.",
    "Auth Service: dang ky, dang nhap, JWT, refresh token, Google OAuth, role va audit dang nhap.",
    "User Service: ho so nguoi dung, cai dat, ban be, follow, block va trust/safety score.",
    "Content Service: bai viet, binh luan, feed, nhom cong dong, viec lam, upload va tich hop AI.",
    "Chat Service: hoi thoai, tin nhan, group chat, presence va goi realtime.",
    "Notification Service: lang nghe su kien va tao thong bao realtime/email.",
    "Code Judge Service: quan ly problems, languages, submissions, test cases, learning path, quiz, badge va progress.",
    "Node Judge Runner: bien dich/chay code theo tung ngon ngu, so sanh output va tra ve verdict.",
]:
    doc.append(para(item, bullet=True))

doc.append(para("4. Cac kieu kien truc dang ap dung", "Heading1"))
doc.append(para("4.1. Microservices Architecture", "Heading2"))
doc.append(para(
    "Du an tach he thong thanh cac service doc lap theo mien nghiep vu. Moi service co source code, database, cau hinh va "
    "trach nhiem rieng. Cach tiep can nay giup nhom phat trien song song, giam do phuc tap trong tung module va cho phep "
    "scale rieng cac thanh phan co tai cao nhu chat, notification hoac code judge."
))
doc.append(para("Tac dung doi voi du an:", "Heading3"))
for item in [
    "Giam coupling giua cac mien nghiep vu.",
    "Cho phep thay doi cong nghe theo nhu cau tung service.",
    "Tang kha nang trien khai va mo rong rieng le.",
    "Khi mot service gap loi, cac service khac van co the tiep tuc hoat dong o muc do nhat dinh.",
]:
    doc.append(para(item, bullet=True))

doc.append(para("4.2. API Gateway / Backend for Frontend", "Heading2"))
doc.append(para(
    "API Gateway dong vai tro cua ngo vao he thong. Gateway an chi tiet topology noi bo, gom nhieu API ve mot dia chi, "
    "kiem tra token JWT va truyen ngu canh nguoi dung den service can thiet. Cach nay giup frontend don gian hon va "
    "giam viec de lo endpoint noi bo ra ben ngoai."
))

doc.append(para("4.3. Clean Architecture trong cac service .NET", "Heading2"))
doc.append(para(
    "Auth Service, User Service va Code Judge Service duoc to chuc thanh Domain, Application, Infrastructure va API. "
    "Domain chua entity va quy tac cot loi; Application chua use case va interface; Infrastructure cai dat repository, "
    "database va external adapter; API chi lam nhiem vu tiep nhan request va tra response. Huong phu thuoc di tu ngoai vao trong, "
    "giup nghiep vu it phu thuoc framework."
))

doc.append(para("4.4. Event-Driven Architecture", "Heading2"))
doc.append(para(
    "Ngoai giao tiep HTTP dong bo, du an su dung RabbitMQ de phat tan su kien. Vi du khi co friend request, comment moi, "
    "tin nhan moi hoac dang nhap, service phat su kien len exchange `events`; Notification Service lang nghe cac routing key "
    "tuong ung de tao thong bao. Co che nay lam giam phu thuoc truc tiep giua service phat sinh su kien va service xu ly thong bao."
))

doc.append(para("4.5. Polyglot Persistence", "Heading2"))
doc.append(para(
    "Du an khong dung mot database duy nhat cho tat ca. SQL Server duoc dung cho du lieu co cau truc va can transaction nhu "
    "tai khoan, nguoi dung, problem, submission. MongoDB duoc dung cho du lieu document, chat, notification, content va execution log. "
    "Day la cach tiep can polyglot persistence: chon cong cu luu tru phu hop voi tinh chat du lieu."
))

doc.append(para("4.6. Background Processing", "Heading2"))
doc.append(para(
    "Code Judge Service ap dung background worker de cham submission. Khi nguoi dung nop bai, API chi tao submission voi trang thai Queued "
    "va dua vao queue. Worker lay submission ra, chay test case, tinh diem, luu ket qua va cap nhat learning progress. Cach nay giup request "
    "nop bai phan hoi nhanh va tranh viec client phai cho qua lau."
))

doc.append(para("5. Cac design pattern tieu bieu", "Heading1"))
doc.append(table([
    ["Design pattern", "Noi ap dung", "Tac dung"],
    ["Repository Pattern", "Auth/User/CodeJudge Infrastructure", "An chi tiet truy cap database, giup Application lam viec voi interface thay vi EF Core truc tiep."],
    ["Unit of Work", "User Service, CodeJudge Service", "Gom nhieu thay doi thanh mot transaction logic, dam bao save changes co kiem soat."],
    ["Dependency Injection", "ASP.NET Core va cac service Node theo factory", "Dao nguoc phu thuoc, de test, de thay the implementation."],
    ["Adapter Pattern", "Judge0Service, NodeRunnerClient, GoogleOAuthClient, User client trong notification", "Boc ngoai he thong ben ngoai bang interface noi bo, giam coupling."],
    ["Outbox Pattern", "Auth Service va User Service", "Dam bao event chi duoc publish sau khi du lieu da commit, giam mat su kien khi service loi."],
    ["Publisher/Subscriber", "RabbitMQ events", "Mot service phat su kien, nhieu service khac co the lang nghe ma khong can biet nhau truc tiep."],
    ["Background Worker", "JudgeBackgroundService, OutboxPublisher, notification jobs", "Xu ly tac vu dai hoac lap lai ngoai request-response."],
    ["DTO Pattern", "Application DTOs, API response normalization", "Tach model noi bo khoi du lieu tra ve client, giam ro ri cau truc domain."],
    ["Middleware Pattern", "Gateway Express, ASP.NET Core middleware", "Xu ly cross-cutting concerns nhu auth, correlation id, error handling, rate limit."],
    ["Factory/Builder Function", "Content Service buildApp, createRepository, createService", "Tao module Node ro rang, co the thay driver mongo/file hoac broker in-memory/rabbitmq."],
]))

doc.append(para("6. Chuc nang chinh cua du an", "Heading1"))
doc.append(para("6.1. Xac thuc va quan ly tai khoan", "Heading2"))
for item in [
    "Dang ky, dang nhap, dang xuat, refresh token.",
    "Dang nhap bang Google OAuth.",
    "JWT authentication va phan quyen role.",
    "Admin auth, audit dang nhap va quan ly trang thai tai khoan.",
]:
    doc.append(para(item, bullet=True))

doc.append(para("6.2. Ho so va mang xa hoi", "Heading2"))
for item in [
    "Quan ly profile, avatar, cover, bio, lop, nganh, email truong.",
    "Follow, unfollow, ban be, loi moi ket ban, chap nhan/tu choi/cancel request.",
    "Block/unblock nguoi dung.",
    "Goi y ban be dua tren mutual friend, nganh, lop va do gan social graph.",
    "Trust/safety score dua tren tuoi tai khoan, email truong, bao cao va hanh dong moderation.",
]:
    doc.append(para(item, bullet=True))

doc.append(para("6.3. Noi dung cong dong", "Heading2"))
for item in [
    "Tao, sua, xoa, hien thi bai viet va binh luan.",
    "Feed, tim kiem, tag, sap xep va ranking noi dung.",
    "Nhom cong dong, thanh vien, loi moi, yeu cau tham gia va moderation.",
    "Module viec lam, ung tuyen va dashboard lien quan.",
    "Upload anh/tai lieu qua content service.",
]:
    doc.append(para(item, bullet=True))

doc.append(para("6.4. Chat va realtime", "Heading2"))
for item in [
    "Chat mot-mot va group chat.",
    "Socket.IO cho tin nhan realtime.",
    "Presence online/offline.",
    "Su kien goi/call invitation.",
    "Publish event tin nhan de notification service tao thong bao.",
]:
    doc.append(para(item, bullet=True))

doc.append(para("6.5. Thong bao", "Heading2"))
for item in [
    "Nhan event tu RabbitMQ nhu comment.created, friend_request.sent, message.sent.",
    "Tao notification va gui realtime qua Socket.IO.",
    "Ho tro preference thong bao.",
    "Job retry failed deliveries va cleanup old notifications.",
    "MailHog dung trong moi truong dev cho email notification.",
]:
    doc.append(para(item, bullet=True))

doc.append(para("6.6. Code Judge va hoc lap trinh", "Heading2"))
for item in [
    "Quan ly ngon ngu lap trinh, problems, test cases va submissions.",
    "Run code nhanh qua Judge0.",
    "Submit bai va cham bat dong bo qua Node Runner.",
    "Tinh verdict: AC, WA, TLE, MLE, RE, CE.",
    "Luu execution log vao MongoDB va ket qua chinh vao SQL Server.",
    "Learning path, lesson, quiz, daily challenge, badge, XP, streak va progress.",
    "Admin dashboard cho problem, testcase, submission va learning catalog.",
]:
    doc.append(para(item, bullet=True))

doc.append(para("7. Docker, Docker Compose va moi truong trien khai", "Heading1"))
doc.append(para(
    "Du an su dung Docker Compose de khoi tao mot moi truong chay gan voi thuc te. Thay vi cai dat thu cong SQL Server, MongoDB, "
    "RabbitMQ, MailHog va tung API, nhom co the dung compose de chay tat ca container trong cung network. Dieu nay giup giam loi "
    "khac biet moi truong giua cac may thanh vien."
))
for item in [
    "Moi service co Dockerfile rieng, cho phep dong goi doc lap.",
    "Docker network giup cac service goi nhau bang ten container nhu auth-api, user-api, judge-runner.",
    "Volume duoc dung de giu du lieu SQL Server va MongoDB qua cac lan restart.",
    "RabbitMQ management UI giup quan sat exchange, queue va routing key.",
    "MailHog giup test email trong dev ma khong gui email that.",
]:
    doc.append(para(item, bullet=True))

doc.append(para("8. Bao mat, quan sat va do tin cay", "Heading1"))
for item in [
    "JWT duoc gateway xac thuc va forward thong tin nguoi dung xuong service noi bo qua header.",
    "Correlation ID duoc gan vao request de truy vet loi qua nhieu service.",
    "Rate limiting tai gateway giup han che abuse API.",
    "Error middleware giup chuan hoa loi va tranh lam lo stack trace cho client.",
    "Outbox Pattern tang do tin cay khi phat su kien sau transaction.",
    "Retry khi ket noi RabbitMQ trong chat/content/notification giup service khoi dong ben bi hon.",
    "Health endpoint o cac service giup kiem tra trang thai khi deploy.",
]:
    doc.append(para(item, bullet=True))

doc.append(para("9. Danh gia uu diem va han che", "Heading1"))
doc.append(para("Uu diem:", "Heading2"))
for item in [
    "Kien truc module ro rang, phu hop de nhieu thanh vien phat trien song song.",
    "Tach database theo service giup giam phu thuoc va tang kha nang mo rong.",
    "Event-driven architecture phu hop voi notification, chat va cac hanh dong social.",
    "Code judge duoc tach runner rieng, giam rui ro khi thuc thi ma nguoi dung.",
    "Docker Compose giup tai lap moi truong day du nhanh chong.",
]:
    doc.append(para(item, bullet=True))
doc.append(para("Han che/can cai tien:", "Heading2"))
for item in [
    "In-memory judge queue co the mat du lieu khi service restart; nen thay bang RabbitMQ/Redis queue cho production.",
    "Mot so service Node co fallback file storage, tot cho dev nhung can chuan hoa khi production.",
    "Can bo sung distributed tracing chuan nhu OpenTelemetry de quan sat lien service tot hon.",
    "Can bo sung circuit breaker/retry policy chuan cho cac HTTP client.",
    "Can chuan hoa schema event va versioning event khi he thong lon hon.",
]:
    doc.append(para(item, bullet=True))

doc.append(para("10. Ket luan", "Heading1"))
doc.append(para(
    "IT Social Platform khong chi la mot ung dung web don le ma la mot he sinh thai nhieu dich vu duoc thiet ke theo tu duy "
    "kien truc hien dai. Viec ap dung microservices, API Gateway, Clean Architecture, event-driven communication, Outbox Pattern, "
    "polyglot persistence va containerization cho thay nhom da tiep can bai toan theo huong co kha nang mo rong va bao tri lau dai. "
    "Nhung lua chon cong nghe nhu .NET 8, Node.js, React, SQL Server, MongoDB, RabbitMQ, Socket.IO va Docker deu gan voi nhu cau "
    "cu the cua tung mien nghiep vu, tao nen mot kien truc phu hop cho mot nen tang social-learning-code judge."
))


styles = """
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/><w:pPr><w:spacing w:after="160" w:line="276" w:lineRule="auto"/></w:pPr><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="24"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:qFormat/><w:pPr><w:jc w:val="center"/><w:spacing w:after="240"/></w:pPr><w:rPr><w:b/><w:sz w:val="34"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Subtitle"><w:name w:val="Subtitle"/><w:qFormat/><w:pPr><w:jc w:val="center"/><w:spacing w:after="300"/></w:pPr><w:rPr><w:i/><w:color w:val="666666"/><w:sz w:val="24"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:spacing w:before="360" w:after="160"/></w:pPr><w:rPr><w:b/><w:color w:val="1F4E79"/><w:sz w:val="30"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:spacing w:before="220" w:after="120"/></w:pPr><w:rPr><w:b/><w:color w:val="2F5597"/><w:sz w:val="26"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Heading3"><w:name w:val="heading 3"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:spacing w:before="180" w:after="100"/></w:pPr><w:rPr><w:b/><w:sz w:val="24"/></w:rPr></w:style>
  <w:style w:type="table" w:styleId="TableGrid"><w:name w:val="Table Grid"/><w:tblPr><w:tblBorders><w:top w:val="single" w:sz="4" w:space="0" w:color="auto"/><w:left w:val="single" w:sz="4" w:space="0" w:color="auto"/><w:bottom w:val="single" w:sz="4" w:space="0" w:color="auto"/><w:right w:val="single" w:sz="4" w:space="0" w:color="auto"/><w:insideH w:val="single" w:sz="4" w:space="0" w:color="auto"/><w:insideV w:val="single" w:sz="4" w:space="0" w:color="auto"/></w:tblBorders></w:tblPr></w:style>
</w:styles>
"""

numbering = """
<w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:abstractNum w:abstractNumId="0">
    <w:multiLevelType w:val="hybridMultilevel"/>
    <w:lvl w:ilvl="0">
      <w:start w:val="1"/>
      <w:numFmt w:val="bullet"/>
      <w:lvlText w:val="•"/>
      <w:lvlJc w:val="left"/>
      <w:pPr><w:ind w:left="720" w:hanging="360"/></w:pPr>
      <w:rPr><w:rFonts w:ascii="Symbol" w:hAnsi="Symbol" w:hint="default"/></w:rPr>
    </w:lvl>
  </w:abstractNum>
  <w:num w:numId="1"><w:abstractNumId w:val="0"/></w:num>
</w:numbering>
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
  <Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/>
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
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/>
</Relationships>
"""

with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED) as z:
    z.writestr("[Content_Types].xml", content_types)
    z.writestr("_rels/.rels", rels)
    z.writestr("word/_rels/document.xml.rels", document_rels)
    z.writestr("word/document.xml", document_xml)
    z.writestr("word/styles.xml", styles)
    z.writestr("word/numbering.xml", numbering)

print(OUT)
