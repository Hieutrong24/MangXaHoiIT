Các thay đổi chính đã bổ sung cho giao diện community để đồng bộ với content-service và api-gateway mới:

1. API client
- Thêm join group trực tiếp / rời nhóm / xóa nhóm
- Thêm thống kê nhóm
- Thêm lời mời của tôi và yêu cầu tham gia của tôi
- Thêm danh sách yêu cầu tham gia của nhóm và phản hồi duyệt/từ chối
- Thêm ban / hủy ban thành viên
- Thêm chuyển quyền chủ nhóm
- Thêm tạo lại mã tham gia nhóm

2. CommunityPage
- Thêm khu vực inbox cá nhân cho lời mời và yêu cầu tham gia
- Có thể tham gia nhóm công khai trực tiếp ngay từ danh sách
- Với nhóm private sẽ gửi yêu cầu tham gia

3. GroupDetailPage
- Thêm hành động tham gia nhóm / rời nhóm / xóa nhóm
- Thêm tạo lại mã nhóm cho manager
- Thêm thẻ thống kê nhóm
- Thêm tab yêu cầu tham gia và lời mời đã gửi
- Thêm xử lý duyệt / từ chối join request
- Thêm ban / hủy ban / chuyển quyền chủ nhóm tại tab thành viên

4. Form tạo nhóm
- Đổi payload từ visibility sang privacy
- Bổ sung topics, rules, website, contactEmail để khớp backend mới
