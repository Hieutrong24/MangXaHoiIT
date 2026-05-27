from __future__ import annotations

import html
import zipfile
from pathlib import Path


OUT = Path(__file__).resolve().parents[1] / "Bo_sung_Chuong_2_Muc_2_1_va_2_3.docx"


def esc(text: str) -> str:
    return html.escape(text, quote=True)


def run(text: str, *, bold: bool = False, size: int | None = None) -> str:
    props: list[str] = ['<w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:eastAsia="Times New Roman"/>']
    if bold:
        props.append("<w:b/>")
    if size:
        props.append(f'<w:sz w:val="{size}"/>')
    rpr = f"<w:rPr>{''.join(props)}</w:rPr>"
    if text == "":
        return f"<w:r>{rpr}</w:r>"
    parts = text.split("\n")
    inner: list[str] = []
    for index, part in enumerate(parts):
        inner.append(f'<w:t xml:space="preserve">{esc(part)}</w:t>')
        if index < len(parts) - 1:
            inner.append("<w:br/>")
    return f"<w:r>{rpr}{''.join(inner)}</w:r>"


def para(text: str = "", style: str | None = None, *, align: str | None = None, page_break: bool = False) -> str:
    ppr: list[str] = []
    if style:
        ppr.append(f'<w:pStyle w:val="{style}"/>')
    if align:
        ppr.append(f'<w:jc w:val="{align}"/>')
    ppr_xml = f"<w:pPr>{''.join(ppr)}</w:pPr>" if ppr else ""
    prefix = '<w:r><w:br w:type="page"/></w:r>' if page_break else ""
    return f"<w:p>{ppr_xml}{prefix}{run(text)}</w:p>"


def cell_paragraph(text: str, *, bold: bool = False, size: int = 20, align: str | None = None) -> str:
    ppr = []
    if align:
        ppr.append(f'<w:jc w:val="{align}"/>')
    ppr_xml = f"<w:pPr>{''.join(ppr)}</w:pPr>" if ppr else ""
    return f"<w:p>{ppr_xml}{run(text, bold=bold, size=size)}</w:p>"


def table(rows: list[list[str]], widths: list[int], *, header_rows: int = 1) -> str:
    grid = "".join(f'<w:gridCol w:w="{w}"/>' for w in widths)
    body: list[str] = []
    for row_index, row in enumerate(rows):
        cells: list[str] = []
        for col_index, cell in enumerate(row):
            shade = '<w:shd w:fill="D9E2F3"/>' if row_index < header_rows else ""
            align = "center" if col_index == 0 else None
            content = cell_paragraph(cell, bold=row_index < header_rows, size=18 if row_index >= header_rows else 20, align=align)
            cells.append(
                "<w:tc>"
                f'<w:tcPr><w:tcW w:w="{widths[col_index]}" w:type="dxa"/>{shade}<w:vAlign w:val="center"/></w:tcPr>'
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
        '<w:tblLook w:val="04A0" w:firstRow="1" w:lastColumn="0" w:firstColumn="1" w:noHBand="0" w:noVBand="1"/>'
        "</w:tblPr>"
        f"<w:tblGrid>{grid}</w:tblGrid>"
        f"{''.join(body)}"
        "</w:tbl>"
    )


doc: list[str] = []

doc.append(para("2.1. Danh sach cac chuc nang cua du an duoc hinh thanh tu cac yeu cau", "Heading1"))
doc.append(para(
    "Tu cac yeu cau nghiep vu da xac dinh o Chuong 1, nhom chung em doi chieu truc tiep voi ma nguon frontend, backend, API Gateway, cac microservice, co so du lieu va tep cau hinh de tong hop thanh danh sach chuc nang cua he thong. Cach trinh bay nay nham bao dam moi chuc nang duoc liet ke deu co co so thuc te trong source code, dong thoi phan anh muc do trien khai hien co cua du an."
))
doc.append(para(
    "Ket qua khao sat cho thay IT Social Platform duoc xay dung theo dinh huong mang xa hoi hoc tap cho sinh vien cong nghe thong tin, ket hop nhom chuc nang ve xac thuc, ho so, tuong tac xa hoi, cong dong, chat, thong bao, hoc lap trinh, cham bai, quan tri va trien khai he thong. Doi voi nhung phan moi duoc bo tri o mot lop kien truc hoac moi xuat hien o muc co ban, nhom chung em dien dat dung muc do thay vi khang dinh vuot qua pham vi source code."
))

rows_21 = [
    ["STT", "Yeu cau tu Chuong 1", "Chuc nang hinh thanh", "Tac nhan su dung", "Module/Service xu ly", "Mo ta ngan gon"],
    ["1", "He thong can quan ly tai khoan va xac thuc an toan cho sinh vien.", "Dang ky, dang nhap, dang xuat, refresh token, xac thuc JWT va dang nhap Google.", "Sinh vien, admin", "Frontend User; API Gateway; Auth Service", "Da co route register/login/refresh/logout, JWT middleware tai gateway va luong Google callback o frontend va auth-service."],
    ["2", "Nguoi dung can co trang ho so hoc tap va nghe nghiep de gioi thieu ban than.", "Quan ly ho so day du gom avatar, cover, thong tin sinh vien, ky nang, hoc van, kinh nghiem, du an, CV va lien ket ngoai.", "Sinh vien", "Frontend User; API Gateway; User Service; SQL Server UserDB", "Trang sua ho so va User Service cho phep doc/cap nhat profile-full, settings va cac thanh phan mo rong cua ho so."],
    ["3", "He thong can ho tro ket noi nguoi dung voi nhau.", "Danh sach nguoi dung, gui va xu ly loi moi ket ban, theo doi; chuc nang chan nguoi dung da duoc thiet ke o backend.", "Sinh vien", "Frontend User; API Gateway; User Service", "Co friend request, friends, suggestions, follow/unfollow; block/unblock xuat hien trong user-service nhung chua thay ro luong giao dien day du."],
    ["4", "Nguoi dung can dang va tim thay noi dung hoc tap trong he thong.", "Dang bai viet, xem bang tin, xem chi tiet bai viet va tim kiem noi dung o muc co ban.", "Sinh vien", "Frontend User; API Gateway; Content Service", "Content Service cung cap feed, posts, search, recommendations, trending; frontend co cac trang feed, post list, post detail va post editor."],
    ["5", "He thong can tao tuong tac xa hoi tren bai viet.", "Binh luan, thich va chia se bai viet.", "Sinh vien", "Frontend User; API Gateway; Content Service; Notification Service", "Da co route tao comment, toggle like, share post; thong bao co event comment moi va cac thanh phan hien thi tren giao dien bai viet."],
    ["6", "Can co khong gian cong dong de hoc tap va trao doi theo nhom.", "Tao nhom/cong dong, tham gia nhom, moi thanh vien, duyet bai, xu ly yeu cau tham gia va quan ly thanh vien nhom.", "Sinh vien, quan tri vien nhom", "Frontend User; API Gateway; Content Service", "Group module co create, join, join-by-code, invitation, moderation, promote, ban/unban, transfer ownership va group posts."],
    ["7", "Nguoi dung can trao doi truc tiep theo thoi gian thuc.", "Chat realtime, chat ca nhan, chat nhom, trang thai online/offline; co them luong goi thong qua socket o muc trien khai bo sung.", "Sinh vien", "Frontend User; API Gateway; Chat Service; Socket.IO; MongoDB", "Chat page, socket client, presence API va chat gateway da ho tro tin nhan moi, room chat, group chat va presence realtime."],
    ["8", "He thong can thong bao kip thoi cho cac su kien quan trong.", "Thong bao realtime, danh dau da doc, danh dau da doc tat ca, dem thong bao chua doc va cai dat thong bao.", "Sinh vien, admin", "Frontend User; API Gateway; Notification Service; RabbitMQ; Socket.IO", "Notification Service luu MongoDB, phat notification:new qua websocket, co unread count, mark read, preferences va job retry/cleanup."],
    ["9", "Nen tang can bo sung khong gian hoc lap trinh truc tuyen.", "Lo trinh hoc, bai hoc, quiz, dashboard tien do, XP, badge, streak va daily challenge.", "Sinh vien", "Frontend User; API Gateway; Code Judge Service; SQL Server JudgeDB", "LearnController va cac trang LearnHome, PathDetail, Lesson, Quiz da hien thuc hoa hoc truc tuyen va gamification."],
    ["10", "Nguoi hoc can viet, chay thu va nop bai lap trinh tren cung mot he thong.", "Monaco Editor, chay thu code, nop bai, theo doi ket qua cham bai va ket qua testcase.", "Sinh vien", "Frontend User; API Gateway; Code Judge Service; Judge Runner; Judge0", "Frontend su dung Monaco Editor; he thong co run nhanh qua Judge0 va submission cham bai qua Runner/BackgroundService."],
    ["11", "He thong can co cong cu quan tri de dieu hanh va kiem soat noi dung.", "Quan tri nguoi dung, vai tro, tai khoan, bai viet, binh luan, nhom, viec lam, thong bao, chat, problem, testcase, submission va dashboard hoc tap.", "Admin", "Frontend Admin; API Gateway; Auth Service; User Service; Content Service; Chat Service; Notification Service; Code Judge Service", "Frontend-admin va admin routes cho thay mot mat quan tri rieng voi nhieu dashboard va thao tac moderation/quan ly du lieu."],
    ["12", "Nguoi dung can tai len tai nguyen phuc vu bai viet va ho so.", "Upload anh/tai lieu; tich hop Cloudinary da duoc trien khai.", "Sinh vien, admin", "Frontend User; API Gateway Upload Route; Content Service Upload Module; Cloudinary", "Gateway nhan file qua multer va chuyen den content-service; upload.service su dung cloudinary.uploader.upload."],
    ["13", "He thong can co co che goi y thong minh ho tro trai nghiem nguoi dung.", "Tich hop AI goi y noi dung da duoc trien khai o muc co ban.", "Sinh vien", "Frontend User; API Gateway AI Route; Content Service AI Module", "AI module lay bai viet gan day, tag va thong tin nguoi dung de sinh suggestion; source code chua cho thay mot he goi y hoc tap tach biet."],
    ["14", "He thong can de dang trien khai, khoi tao va van hanh nhieu thanh phan.", "Dong goi va van hanh bang Docker/Docker Compose, tach service, CSDL va message broker.", "Nhom phat trien, quan tri he thong", "Dockerfile; docker-compose.yml; services/docker-compose.yml", "Cau hinh Docker cho frontend, gateway, service .NET/Node, SQL Server, MongoDB, RabbitMQ, MailHog va network rieng."],
]

doc.append(table(rows_21, [700, 2500, 2600, 1400, 2600, 4600]))
doc.append(para(
    "Nhu vay, cac chuc nang cua du an duoc hinh thanh thanh nhieu nhom nghiep vu ro rang, tu nghiep vu cot loi ve tai khoan va ho so den cac nghiep vu mo rong nhu cong dong, chat, thong bao, hoc lap trinh va quan tri. Day la co so truc tiep de nhom chung em tiep tuc phan chia he thong thanh cac module kien truc o muc 2.3."
))

doc.append(para("2.3. Liet ke cac module chuc nang cua du an", "Heading1"))
doc.append(para(
    "Qua phan tich source code, nhom chung em nhan thay he thong duoc to chuc theo huong module hoa va microservices, trong do moi thanh phan dam nhiem mot pham vi trach nhiem tuong doi doc lap. Cach to chuc nay giup thuan loi cho bao tri, mo rong, thay doi cong nghe theo tung mien nghiep vu va han che su phu thuoc chat giua cac thanh phan."
))

rows_23 = [
    ["STT", "Module/Service", "Vai tro trong he thong", "Chuc nang chinh", "Cong nghe/thanh phan lien quan", "Dau vao/Dau ra chinh"],
    ["1", "Frontend User Module", "Cung cap giao dien cho sinh vien va nguoi dung thong thuong.", "Dang nhap, ho so, feed, bai viet, cong dong, chat, thong bao, hoc lap trinh, nop bai.", "React 19, Vite, React Router, React Query, Redux Toolkit, Socket.IO Client, Monaco Editor", "Nhan thao tac UI va JWT; tra ve trang thai giao dien, request HTTP va su kien realtime."],
    ["2", "Frontend Admin Module", "Cung cap giao dien quan tri rieng cho admin.", "Dashboard, quan ly user, auth, content, groups, jobs, notifications, code va learning.", "React, Vite, React Router, Axios", "Nhan thao tac quan tri; goi API admin va hien thi bao cao/moderation."],
    ["3", "API Gateway", "Diem vao duy nhat cho client va lop dieu phoi request.", "Dinh tuyen API, xac thuc JWT, rate limit, correlation id, proxy den cac service.", "Node.js, Express, jsonwebtoken, morgan, helmet, cors", "Nhan HTTP tu frontend; tra JSON da tong hop/uy quyen toi service dich."],
    ["4", "Auth Service", "Quan ly danh tinh va phien dang nhap.", "Register, login, refresh token, logout, Google login, role, login audit.", ".NET 8, ASP.NET Core, EF Core, SQL Server", "Nhan yeu cau auth; tra access token, refresh token, thong tin tai khoan."],
    ["5", "User Service", "Quan ly ho so va quan he nguoi dung.", "Profile, settings, links, trust-safety, friends, follows, blocks, admin users.", ".NET 8, ASP.NET Core, EF Core, SQL Server", "Nhan yeu cau ho so/quan he; tra du lieu user va ket qua cap nhat."],
    ["6", "Content Service", "Quan ly noi dung xa hoi va cong dong.", "Feed, posts, comments, groups, jobs, moderation co ban.", "Node.js, Express, MongoDB hoac file fallback, RabbitMQ", "Nhan request noi dung; tra bai viet, binh luan, nhom, viec lam va su kien content."],
    ["7", "Chat Service", "Xu ly trao doi tin nhan theo thoi gian thuc.", "Chat 1-1, group chat, luu tin nhan, presence, call signaling.", "Node.js, Express, Socket.IO, MongoDB, RabbitMQ", "Nhan HTTP va websocket event; tra lich su tin nhan, room, presence va event moi."],
    ["8", "Notification Service", "Tiep nhan su kien va phat thong bao.", "Luu notification, unread count, mark read, preferences, realtime socket, email dev.", "Node.js, Express, MongoDB, Socket.IO, RabbitMQ, MailHog", "Nhan event broker va request notification; tra danh sach thong bao va day su kien realtime."],
    ["9", "Code Judge Service", "Quan ly nghiep vu hoc lap trinh va cham bai.", "Languages, problems, testcases, submissions, learning paths, lessons, quizzes, dashboard learning.", ".NET 8, ASP.NET Core, EF Core, SQL Server, MongoDB logs", "Nhan request run/submit/learn/admin; tra ket qua cham, tien do hoc va du lieu problem."],
    ["10", "Judge Runner va Judge0 Integration", "Lop thuc thi ma nguon va cham ket qua.", "Run nhanh qua Judge0, cham bai qua runner noi bo, compile/run nhieu ngon ngu, verdict AC/WA/TLE/MLE/RE/CE.", "Node.js Runner, process execution, Judge0 HTTP API", "Nhan source code, language, test case; tra token run hoac ket qua thuc thi chi tiet."],
    ["11", "AI Integration Module", "Bo sung goi y thong minh cho trai nghiem nguoi dung.", "Sinh goi y tu bai viet gan day, tag va ngu canh user.", "Route /api/ai, ai.service.js, mo hinh cau hinh qua env", "Nhan yeu cau suggestion; tra ve noi dung goi y dang van ban."],
    ["12", "Upload/Cloudinary Module", "Xu ly tai len tep phuc vu bai viet va ho so.", "Nhan file, kiem tra co ban, day tep len Cloudinary va tra metadata.", "multer, Cloudinary SDK, API Gateway upload route", "Nhan multipart/form-data; tra URL, secureUrl, publicId, bytes, resourceType."],
    ["13", "Database Module (SQL Server va MongoDB)", "Luu tru du lieu theo tinh chat nghiep vu.", "SQL Server cho auth, user, judge; MongoDB cho content, chat, notification, judge logs.", "SQL Server 2022, MongoDB 7, EF Core, Mongoose/driver", "Nhan thao tac CRUD/noi bo; tra ban ghi giao dich, document va log."],
    ["14", "Message Broker Module (RabbitMQ)", "Truyen su kien bat dong bo giua cac service.", "Phat/nhan event cho notification, chat, content va cac luong tich hop.", "RabbitMQ, exchange events, publisher/consumer", "Nhan event pub/sub; tra ack va kich hoat xu ly tiep theo o service nghe."],
    ["15", "Docker/Deployment Module", "Dong goi va khoi tao moi truong chay da thanh phan.", "Build image, tao network, khoi dong service, DB, broker, mail test.", "Dockerfile, Docker Compose, bridge network, volume", "Nhan lenh build/up; tra container dang chay va moi truong tich hop thong nhat."],
]

doc.append(table(rows_23, [700, 2200, 2400, 2700, 2600, 3800]))

module_notes = [
    ("Frontend User Module", "Module nay dam nhiem toan bo trai nghiem nguoi dung dau cuoi, tu dang nhap, cap nhat ho so, theo doi bang tin den hoc lap trinh va chat realtime. Viec tach rieng module giao dien nguoi dung giup giao tiep voi gateway thong qua mot lop client ro rang, dong thoi tao mot diem trien khai doc lap cho cac thay doi ve giao dien va trai nghiem su dung."),
    ("Frontend Admin Module", "Module nay phuc vu nhom quan tri he thong voi cac man hinh dashboard, moderation va quan ly du lieu nghiep vu. Su tach biet giua giao dien user va giao dien admin lam giam ruoi ro lan luong su dung, dong thoi cho phep bo tri phan quyen va quy trinh van hanh ro rang hon."),
    ("API Gateway", "Gateway dam nhiem vai tro trung gian giua client va cac microservice, thuc hien xac thuc JWT, gioi han tan suat va chuan hoa dia chi API. Tach module nay giup frontend khong phai biet chi tiet topology noi bo, dong thoi giam coupling khi he thong tiep tuc mo rong them service moi."),
    ("Auth Service", "Auth Service tap trung xu ly danh tinh, cap token, refresh token, role va audit dang nhap. Viec tach rieng service xac thuc giup nghiep vu bao mat duoc quan ly tap trung, de thay doi co che dang nhap ma khong lam anh huong truc tiep den cac mien nghiep vu khac."),
    ("User Service", "User Service quan ly ho so, cai dat rieng tu, lien ket ngoai va cac quan he xa hoi nhu ket ban, theo doi va chan nguoi dung. Module nay giao tiep voi gateway qua HTTP va dong vai tro nen tang danh tinh nghiep vu cho cac module content, chat va notification."),
    ("Content Service", "Content Service dam nhiem phan nghiep vu bai viet, binh luan, nhom cong dong va viec lam, do do co tan suat thay doi va mo rong cao. Tach service nay giup nhom chung em bo tri rieng mo hinh luu tru document, co the dung MongoDB hoac co che fallback phu hop voi du lieu noi dung linh hoat."),
    ("Chat Service", "Chat Service xu ly tin nhan, room chat, presence va tin hieu goi thong qua websocket, la thanh phan co tinh realtime ro net nhat cua he thong. Viec tach module chat giup toi uu rieng cho ket noi dai han, luu tru tin nhan va cac luong su kien ma khong anh huong den API giao dich thong thuong."),
    ("Notification Service", "Notification Service tiep nhan event tu broker, tao thong bao, cap nhat trang thai da doc va phat su kien realtime den nguoi dung. Tach thanh phan nay giup he thong xu ly bat dong bo tot hon, dong thoi cho phep bo sung kenh gui email hoac push ma khong chen nghiep vu vao cac service khac."),
    ("Code Judge Service", "Code Judge Service la trung tam cua mien nghiep vu hoc lap trinh, bao gom quan ly de bai, testcase, submission va lo trinh hoc gamification. Service nay can duoc tach rieng vi logic cham bai, tien do hoc va dashboard phuc tap hon ro ret so voi cac nghiep vu xa hoi thong thuong."),
    ("Judge Runner va Judge0 Integration", "Module nay dong vai tro thuc thi ma nguon mot cach tach biet khoi API nghiep vu, bao gom runner noi bo va ket noi Judge0 de chay thu nhanh. Cach tach nay giam rui ro an toan khi xu ly source code do nguoi dung nop len, dong thoi cho phep mo rong them ngon ngu va chien luoc cham bai trong tuong lai."),
    ("AI Integration Module", "Module AI hien duoc trien khai o muc co ban de sinh goi y noi dung dua tren bai viet gan day va tap tag hien co. Viec de module AI tach rieng giup nhom chung em co the thay doi nha cung cap mo hinh, cau hinh quota hoac pham vi goi y ma khong xam lan vao logic content cot loi."),
    ("Upload/Cloudinary Module", "Upload module chiu trach nhiem nhan tep tu client, chuyen tep den Cloudinary va tra lai metadata can thiet cho cac module khac su dung. Su tach biet nay lam ro bien xu ly tep, tranh viec nghiep vu bai viet hoac ho so phai tu xu ly luu tru media."),
    ("Database Module", "Module co so du lieu duoc to chuc theo huong polyglot persistence, trong do SQL Server phuc vu du lieu giao dich va MongoDB phuc vu du lieu document va log. Cach tach nay phu hop voi tinh chat khac nhau cua tung mien nghiep vu, gop phan nang cao kha nang mo rong va toi uu luu tru."),
    ("Message Broker Module", "RabbitMQ giup cac service trao doi du lieu theo co che su kien thay vi phu thuoc dong bo hoan toan vao HTTP. Module nay giam su rang buoc truc tiep giua ben phat sinh va ben xu ly su kien, dac biet huu ich cho chat, notification va cac tich hop mo rong."),
    ("Docker/Deployment Module", "Module trien khai bao dam toan bo he thong co the duoc dong goi va khoi tao nhat quan tren moi truong phat trien hoac demo. Nhieu service, database va broker duoc ghep noi qua Docker Compose, tu do ho tro nhom chung em tai lap moi truong nhanh va giam sai lech cau hinh."),
]

for title, content in module_notes:
    doc.append(para(title, "Heading2"))
    doc.append(para(content))


styles = """
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:qFormat/>
    <w:pPr><w:spacing w:after="120" w:line="300" w:lineRule="auto"/></w:pPr>
    <w:rPr>
      <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:eastAsia="Times New Roman"/>
      <w:sz w:val="24"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading1">
    <w:name w:val="heading 1"/>
    <w:basedOn w:val="Normal"/>
    <w:next w:val="Normal"/>
    <w:qFormat/>
    <w:pPr><w:spacing w:before="240" w:after="120"/></w:pPr>
    <w:rPr>
      <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:eastAsia="Times New Roman"/>
      <w:b/>
      <w:sz w:val="28"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading2">
    <w:name w:val="heading 2"/>
    <w:basedOn w:val="Normal"/>
    <w:next w:val="Normal"/>
    <w:qFormat/>
    <w:pPr><w:spacing w:before="160" w:after="80"/></w:pPr>
    <w:rPr>
      <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:eastAsia="Times New Roman"/>
      <w:b/>
      <w:sz w:val="24"/>
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
        <w:insideH w:val="single" w:sz="6" w:space="0" w:color="000000"/>
        <w:insideV w:val="single" w:sz="6" w:space="0" w:color="000000"/>
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
