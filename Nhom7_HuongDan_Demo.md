# NHÓM 7 — THỨ TỰ MỞ GIAO DIỆN VÀ LỆNH DEMO

Thời lượng dự kiến: khoảng 6 phút 10 giây, chưa tính thời gian chờ Scheduled Task.

## 0. Chuẩn bị trước khi quay

| Máy | Vai trò trong demo | Giao diện cần mở sẵn |
|---|---|---|
| SEC-REMOTE01 | Kết nối VPN, truy cập SMB, tạo file thử | VPN, File Explorer, PowerShell thường |
| SEC-DC01 | NPS/RADIUS | Network Policy Server, Event Viewer |
| SEC-FILE01 | WSUS, FSRM, script bảo vệ SMB | WSUS, FSRM, Task Scheduler, log script, PowerShell quản trị |
| Máy trạm xuất hiện trong WSUS | Kiểm tra chính sách cập nhật | CMD quản trị, Registry Editor hoặc báo cáo GPO |

**Xác nhận tên máy trạm:** kịch bản gọi là CLIENT02. Hãy dùng đúng tên thực tế trong WSUS và trên máy đang quay; không thay bằng SEC-CLIENT01 nếu đó là hai máy khác nhau.

### Thông tin cần ghi lại từ cấu hình thực tế

- Tên Scheduled Task giám sát và vị trí của task trong Task Scheduler.
- Đường dẫn log mà script ghi kết quả BLOCK.
- Ngưỡng số file và cửa sổ thời gian mà script đang áp dụng.
- Danh sách share và thư mục thực sự được bảo vệ.
- NetBIOS domain: các lệnh dưới dùng `SEC\labuser01` theo phiên SMB đã dùng trong lab. Nếu môi trường hiện tại khác, thay đúng giá trị.

Không tự đoán tên task, đường dẫn log hoặc ngưỡng. Có thể xem **Actions** của task để tìm lệnh/script được gọi, rồi mở script bằng Notepad để đọc cấu hình.

### Kiểm tra trạng thái ban đầu

1. Bật các máy và kiểm tra giờ hệ thống khớp nhau.
2. Xác nhận labuser01 đang được phép ghi trên share VPN-LAB trước demo.
3. Nếu lần thử trước đã BLOCK tài khoản, hoàn nguyên theo quy trình của lab trước khi quay; không gỡ chặn trong đoạn đang chứng minh cơ chế tự động.
4. Kiểm tra thư mục thử nằm trong phạm vi script theo dõi.
5. Đóng file đang mở trong thư mục thử trước phần chặn SMB.
6. Chạy thử toàn bộ một lần để biết việc tạo file có kích hoạt đúng cơ chế không.
7. Đưa các cửa sổ về đúng trang cần quay, phóng to chữ và ẩn thông tin nhạy cảm.

**Quy ước:** lệnh ghi “Win + R” được nhập trong hộp Run. Lệnh PowerShell/CMD được chạy trong đúng cửa sổ ghi ở từng mục. Chưa chạy phần tạo file hàng loạt trong lúc chuẩn bị.

## 1. Giới thiệu luồng demo — 20 giây

**Máy:** máy đang mở slide/sơ đồ.

**Thứ tự:** mở slide mô hình → phóng to sơ đồ → chỉ đường kết nối từ máy ngoài qua VPN đến tài nguyên nội bộ.

**Lời nói:**

> Sau đây, nhóm xin minh họa quá trình người dùng từ xa kết nối vào hệ thống, truy cập dữ liệu và các cơ chế quản lý, bảo vệ tài nguyên mà nhóm đã triển khai.

## 2. Xác thực VPN bằng NPS/RADIUS — 1 phút 15 giây

### A. Trên SEC-REMOTE01: mở và kết nối VPN

Nhấn **Win + R**:

```text
rasphone.exe
```

Chọn `SEC-VPN-LAB` → **Connect** → nhập tài khoản miền `labuser01` và mật khẩu trực tiếp trong hộp thoại.

Nếu cần mở danh sách adapter, nhấn **Win + R**:

```text
ncpa.cpl
```

Chọn adapter VPN để hiển thị trạng thái kết nối. Có thể mở trang VPN bằng **Settings → Network & Internet → VPN** nếu phù hợp với phiên bản Windows đang dùng.

**Bằng chứng:** tên kết nối SEC-VPN-LAB và trạng thái Connected. Không quay mật khẩu.

### B. Trên SEC-DC01: mở NPS và Event Viewer

Nhấn **Win + R**:

```text
nps.msc
```

Đi theo:

```text
NPS (Local) → Policies → Network Policies → SEC-GROUP07-VPN
```

Sau đó mở **Win + R**:

```text
eventvwr.msc
```

Đi theo **Windows Logs → Security → Filter Current Log…** → nhập Event ID `6272` → **OK** → **Refresh** → mở sự kiện vừa phát sinh.

**Đối chiếu:** thời gian của lần kết nối, tài khoản labuser01, tên Network Policy SEC-GROUP07-VPN và kết quả cấp quyền. Không chọn sự kiện cũ rồi giới thiệu là kết quả vừa chạy.

Nếu cần tìm nhanh bằng PowerShell quản trị trên DC01:

```powershell
Get-WinEvent -FilterHashtable @{LogName='Security'; Id=6272} -MaxEvents 5 |
    Format-List TimeCreated, Id, Message
```

**Lời nói:**

> RRAS tiếp nhận kết nối từ xa và chuyển yêu cầu xác thực đến NPS. Trạng thái Connected cùng Event 6272 của đúng tài khoản và chính sách VPN cho thấy lần kết nối này đã được chấp nhận.

## 3. Truy cập dữ liệu qua VPN — 45 giây

**Máy:** SEC-REMOTE01.

### A. Thiết lập đúng phiên SMB

Mở **CMD thường**, cùng phiên người dùng sẽ mở File Explorer:

```bat
net use \\192.168.10.30\VPN-LAB /user:SEC\labuser01 *
```

Nhập mật khẩu khi được hỏi. Dấu `*` dùng để nhập mật khẩu mà không ghi mật khẩu vào câu lệnh.

Nếu báo lỗi 1219, kiểm tra `net use`, đóng cửa sổ/file đang truy cập server và ngắt riêng các kết nối tới server đó dùng tài khoản khác. Không chạy lệnh xóa toàn bộ kết nối mạng một cách tùy tiện trong lúc quay.

### B. Mở thư mục và thử ghi

Nhấn **Win + R**:

```text
\\192.168.10.30\VPN-LAB
```

**Thứ tự:** chuột phải vùng trống → **New → Text Document** → đặt tên `demo_vpn.txt` → mở file → nhập một dòng → **Ctrl + S** → đóng → mở lại.

Nếu menu New không có, dùng PowerShell thường:

```powershell
Set-Content -LiteralPath '\\192.168.10.30\VPN-LAB\demo_vpn.txt' `
    -Value 'Nhom 7 kiem tra ghi du lieu qua VPN.' -Encoding UTF8
notepad.exe '\\192.168.10.30\VPN-LAB\demo_vpn.txt'
```

**Bằng chứng:** file lưu được và nội dung vẫn có khi mở lại.

**Lời nói:**

> Sau khi kết nối VPN, tài khoản được cấp quyền có thể truy cập thư mục chia sẻ, tạo và mở lại file thử trên máy chủ nội bộ.

## 4. Chính sách NPS và quản lý cập nhật WSUS — 1 phút

### A. SEC-DC01: giới thiệu hai policy — khoảng 10 giây

Mở `nps.msc` → **Policies → Network Policies** → hiển thị policy VPN và policy 802.1X đã cấu hình.

Chỉ giới thiệu điều kiện/chính sách đang có. Màn hình này chưa chứng minh máy trạm đã xác thực 802.1X qua switch/AP.

### B. SEC-FILE01: mở WSUS

Nhấn **Win + R**:

```text
wsus.msc
```

Nếu không mở được theo tên ngắn, dùng **Server Manager → Tools → Windows Server Update Services**.

**Thứ tự:** mở máy chủ WSUS → **Computers → All Computers** hoặc nhóm chứa client → đặt bộ lọc để client hiện ra → chọn đúng máy trạm → xem trạng thái và thời gian liên lạc/báo cáo.

Tên cột và chi tiết có thể khác theo giao diện; chọn những thông tin thực sự đang xuất hiện. Không gọi trạng thái liên lạc hoặc quét là “đã cài bản vá thành công”.

### C. Trên máy trạm tương ứng: hiển thị chính sách WSUS

Mở **CMD quản trị**:

```bat
reg query "HKLM\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate"
reg query "HKLM\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate\AU"
```

**Đối chiếu:** WUServer, WUStatusServer và UseWUServer với cấu hình thực tế của lab. Không tự đổi URL hoặc cổng trong lúc demo.

Muốn trình bày bằng báo cáo GPO, chạy trong **CMD quản trị**:

```bat
gpresult /scope computer /h "%TEMP%\Nhom7_GPO.html" /f
start "" "%TEMP%\Nhom7_GPO.html"
```

Tìm chính sách chỉ định dịch vụ cập nhật nội bộ trong báo cáo. Chọn **registry hoặc báo cáo GPO** để quay, tránh dành thời gian cho cả hai nếu không cần.

**Lời nói:**

> Nhóm tách chính sách VPN và 802.1X để quản lý từng loại truy cập. Với WSUS, máy trạm đã nhận cấu hình trỏ về máy chủ nội bộ; nhóm đối chiếu cấu hình này với thông tin liên lạc và báo cáo tại console.

## 5. FSRM chặn phần mở rộng không được phép — 1 phút

### A. SEC-FILE01: mở cấu hình FSRM

Nhấn **Win + R**:

```text
fsrm.msc
```

Nếu không mở được, dùng **Server Manager → Tools → File Server Resource Manager**.

**Thứ tự:**

1. **File Screening Management → File Groups** → mở group đang dùng → chỉ `*.crypt`, `*.locky`.
2. **File Screening Management → File Screens** → mở screen áp dụng cho thư mục thử.
3. Hiển thị đúng đường dẫn và chế độ **Active screening**.

### B. SEC-REMOTE01: đổi đuôi file thử

Mở thư mục share thuộc phạm vi Active File Screen. Nếu screen đang áp dụng cho VPN-LAB thì dùng đường dẫn VPN-LAB; nếu screen ở thư mục khác thì dùng share thực tế tương ứng.

Trong File Explorer, bật **View → File name extensions**. Trên Windows 11 có thể là **View → Show → File name extensions**.

Tạo `demo_fsrm.txt` → đóng file → đổi tên thành `demo_fsrm.crypt` → xác nhận đổi phần mở rộng.

**Bằng chứng:** thông báo thao tác bị từ chối. Nếu đổi đuôi vẫn thành công, dừng kết luận và kiểm tra phạm vi screen, chế độ Active và File Group.

### C. SEC-FILE01: mở sự kiện tương ứng

Mở `eventvwr.msc` → **Windows Logs → Application → Filter Current Log…** → Event ID `8215` → **Refresh** → mở sự kiện khớp lần thử.

Đối chiếu nguồn FSRM/SRMSVC, thời gian, tài khoản và tên file. Mã 8215 theo kịch bản phải được kiểm tra trước trên máy thật; không bảo đảm sự kiện xuất hiện nếu cấu hình ghi Event Log chưa bật.

**Lời nói:**

> Active File Screen chặn thao tác tạo hoặc đổi tên file sang phần mở rộng bị cấm. Nhóm đối chiếu thông báo từ chối với sự kiện ghi nhận đúng file và tài khoản kiểm thử.

## 6. Phát hiện ghi hàng loạt và chặn SMB — 1 phút 30 giây

**Câu chuyển:**

> Phần vừa rồi chặn theo phần mở rộng. Tiếp theo, nhóm thử hành vi ghi hàng loạt bằng các file txt vô hại vẫn thuộc loại được phép.

### A. SEC-FILE01: cho thấy task và log trước khi kích hoạt

Nhấn **Win + R**:

```text
taskschd.msc
```

Đi theo **Task Scheduler Library → thư mục chứa task → task giám sát thực tế**.

- **Triggers:** hiển thị chu kỳ chạy đang cấu hình.
- **Actions:** hiển thị script được gọi.
- **History:** xem nếu tính năng lịch sử đã được bật.

Mở log bằng **File Explorer → đường dẫn log thực tế → Open with Notepad**. Chưa có đường dẫn xác nhận nên tài liệu này không đặt một tên log giả.

Muốn theo dõi log trực tiếp, nhập đường dẫn khi được hỏi trong **PowerShell quản trị**:

```powershell
$logPath = Read-Host 'Nhap duong dan log thuc te cua script'
Get-Content -LiteralPath $logPath -Tail 20 -Wait
```

Dùng cửa sổ PowerShell riêng vì lệnh trên chờ bản ghi mới; nhấn **Ctrl + C** khi muốn dừng theo dõi.

### B. SEC-REMOTE01: tạo file thử trong share được giám sát

Dùng **PowerShell thường** cùng phiên đã kết nối SMB bằng labuser01. Đoạn dưới chỉ tạo file txt mới trong thư mục riêng; không mã hóa và không sửa file sẵn có.

```powershell
$root = '\\192.168.10.30\VPN-LAB'
$folder = Join-Path $root ('DEMO_BATCH_' + (Get-Date -Format 'yyyyMMdd_HHmmss'))
$count = [int](Read-Host 'So file da thu truoc de vuot nguong giam sat')
if ($count -lt 1 -or $count -gt 1000) {
    throw 'Dung so file tu 1 den 1000 cho luot thu nay.'
}
New-Item -ItemType Directory -Path $folder -ErrorAction Stop | Out-Null
1..$count | ForEach-Object {
    $file = Join-Path $folder ('demo_{0:D4}.txt' -f $_)
    Set-Content -LiteralPath $file -Value "Nhom7 demo $_" `
        -Encoding UTF8 -ErrorAction Stop
}
Write-Host "Da tao $count file tai $folder"
```

**Điều kiện:** `$root` phải đúng share thuộc phạm vi script; nếu script không theo dõi thư mục con, dùng phương án thử đã xác nhận trong lab. Số file phải vượt ngưỡng thực tế trong cửa sổ thời gian của script; không có một số cố định bảo đảm kích hoạt mọi cấu hình.

### C. Chờ cơ chế tự động và hiển thị BLOCK

Quay về SEC-FILE01 → cửa sổ log → chờ lượt task theo lịch → chỉ bản ghi **BLOCK mới** có đúng tài khoản và thời gian.

**Trong lúc chờ:**

> Task chạy theo lịch đã cấu hình. Nhóm hiển thị lịch chạy và nguồn nhật ký được script sử dụng trong lúc chờ lượt xử lý tiếp theo.

Nếu nhấn **Run** để kích hoạt task thủ công, phải nói rõ đây là chạy thủ công; không giới thiệu như bằng chứng task tự chạy đúng lịch.

### D. SEC-FILE01: kiểm tra quyền Deny

Mở **PowerShell quản trị**:

```powershell
Get-SmbShareAccess -Name 'VPN-LAB' |
    Format-Table Name, AccountName, AccessControlType, AccessRight -AutoSize
```

Nếu cần xem tất cả share người dùng đang có:

```powershell
Get-SmbShare | Where-Object { -not $_.Special } | ForEach-Object {
    Get-SmbShareAccess -Name $_.Name
} | Format-Table Name, AccountName, AccessControlType, AccessRight -AutoSize
```

**Bằng chứng:** dòng Deny của đúng tài khoản trên share mà script bảo vệ. Lệnh trên chỉ đọc quyền; không tự thêm Deny để tạo kết quả demo.

Muốn mở bằng giao diện: **Win + R → `fsmgmt.msc` → Shares → chuột phải share → Properties → Share Permissions**. Đối chiếu quyền chia sẻ, không nhầm với tab quyền NTFS.

### E. SEC-REMOTE01: thử ghi mới sau xử lý

Dùng chính phiên SMB của labuser01, chạy trong **PowerShell thường**:

```powershell
$probe = '\\192.168.10.30\VPN-LAB\after_block_' +
         (Get-Date -Format 'yyyyMMdd_HHmmss') + '.txt'
try {
    Set-Content -LiteralPath $probe -Value 'Kiem tra sau BLOCK' `
        -Encoding UTF8 -ErrorAction Stop
    Write-Host 'Van ghi duoc: can kiem tra lai hieu qua chan.'
} catch {
    Write-Host ('Khong ghi duoc: ' + $_.Exception.Message)
}
```

**Đánh giá:** chỉ kết luận cơ chế chặn có hiệu quả khi log, quyền Deny và kết quả truy cập thực tế phù hợp. Nếu lỗi do mất VPN hoặc sai đường dẫn thì chưa chứng minh được chặn theo tài khoản. Nếu vẫn ghi được, kiểm tra phiên/kết nối SMB còn tồn tại và cơ chế xử lý của script; không che kết quả đó.

**Lời nói:**

> Khi hành vi đạt ngưỡng đã cấu hình, script ghi BLOCK và áp dụng Deny trên các share được bảo vệ. Nhóm đối chiếu nhật ký, quyền share và thao tác ghi mới sau xử lý để đánh giá hiệu quả phản ứng.

## 7. Kết thúc — 20 giây

Trở lại sơ đồ hoặc slide tổng kết.

> Qua demo, nhóm đã minh họa xác thực VPN qua NPS, truy cập dữ liệu theo quyền, client liên lạc với WSUS, chặn file theo mẫu và phản ứng trước hành vi ghi hàng loạt. Hướng hoàn thiện tiếp theo là kiểm thử 802.1X qua switch/AP và xác nhận cài đặt thành công bản cập nhật qua WSUS.

## 8. Bảng lệnh mở nhanh để đặt cạnh màn hình

| Mở gì | Máy | Win + R |
|---|---|---|
| Danh sách kết nối VPN | SEC-REMOTE01 | `rasphone.exe` |
| Network Connections | SEC-REMOTE01 | `ncpa.cpl` |
| Thư mục chia sẻ | SEC-REMOTE01 | `\\192.168.10.30\VPN-LAB` |
| Network Policy Server | SEC-DC01 | `nps.msc` |
| Event Viewer | DC01 / FILE01 | `eventvwr.msc` |
| WSUS console | SEC-FILE01 | `wsus.msc` |
| FSRM | SEC-FILE01 | `fsrm.msc` |
| Task Scheduler | SEC-FILE01 | `taskschd.msc` |
| Shared Folders | SEC-FILE01 | `fsmgmt.msc` |
| Registry Editor | Máy trạm WSUS | `regedit` |

Các console quản trị cần được cài trên máy tương ứng và mở bằng tài khoản có quyền phù hợp. Nếu lệnh mở console không có, dùng Server Manager → Tools để kiểm tra công cụ đã cài.

## 9. Tài liệu lệnh tham khảo

- Microsoft Learn — Get-SmbShareAccess: https://learn.microsoft.com/en-us/powershell/module/smbshare/get-smbshareaccess
- Microsoft Learn — FSRM overview: https://learn.microsoft.com/en-us/windows-server/storage/fsrm/fsrm-overview
- Microsoft Learn — Windows commands: https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/windows-commands
- Microsoft Learn — Remote Server Administration Tools: https://learn.microsoft.com/en-us/troubleshoot/windows-server/system-management-components/remote-server-administration-tools

Hướng dẫn được soạn theo kịch bản và thông tin mô hình đã cung cấp. Tên task, đường dẫn log, ngưỡng giám sát và trạng thái thực tế cần đối chiếu trên các VM trước khi quay.
