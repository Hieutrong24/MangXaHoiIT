
# 🎓 TDMU IT Social Platform

<p align="center">
  <img alt="TDMU IT Social Platform" src="https://img.shields.io/badge/TDMU-IT%20Social%20Platform-0a66c2?style=for-the-badge">
  <img alt="Architecture" src="https://img.shields.io/badge/Architecture-Microservices-success?style=for-the-badge">
  <img alt="Backend" src="https://img.shields.io/badge/Backend-.NET%20%2B%20Node.js-blueviolet?style=for-the-badge">
  <img alt="Frontend" src="https://img.shields.io/badge/Frontend-React-61dafb?style=for-the-badge">
  <img alt="Messaging" src="https://img.shields.io/badge/Messaging-RabbitMQ-ff8c00?style=for-the-badge">
  <img alt="Container" src="https://img.shields.io/badge/Container-Docker-2496ed?style=for-the-badge">
</p>

> 📚 Nền tảng mạng xã hội dành cho sinh viên Công nghệ Thông tin Trường Đại học Thủ Dầu Một, hỗ trợ kết nối cộng đồng, chia sẻ nội dung học thuật, nhắn tin thời gian thực, nhận thông báo và chấm bài lập trình tự động.

---

## 📑 Mục lục

- [1. 📖 Giới thiệu](#1--giới-thiệu)
- [2. 🎯 Mục tiêu hệ thống](#2--mục-tiêu-hệ-thống)
- [3. 🏗️ Kiến trúc tổng thể](#3--kiến-trúc-tổng-thể)
- [4. 🛠️ Công nghệ sử dụng](#4-️-công-nghệ-sử-dụng)
- [5. 📂 Cấu trúc thư mục dự án](#5--cấu-trúc-thư-mục-dự-án)
  - [5.1 🔐 auth-service](#51--auth-service)
  - [5.2 👤 user-service](#52--user-service)
  - [5.3 🧪 code-judge-service](#53--code-judge-service)
  - [5.4 💬 chat-service](#54--chat-service)
  - [5.5 🧠 content-service](#55--content-service)
  - [5.6 🔔 notification-service](#56--notification-service)
  - [5.7 🖥️ frontend](#57-️-frontend)
- [6. 🧩 Giải thích kiến trúc áp dụng](#6--giải-thích-kiến-trúc-áp-dụng)
  - [6.1 🏢 Microservices Architecture](#61--microservices-architecture)
  - [6.2 🧼 Clean Architecture](#62--clean-architecture)
  - [6.3 🐳 Docker](#63--docker)
  - [6.4 🐇 RabbitMQ](#64--rabbitmq)
- [7. 🔄 Luồng giao tiếp giữa các service](#7--luồng-giao-tiếp-giữa-các-service)
- [8. 📈 Sơ đồ kiến trúc hệ thống](#8--sơ-đồ-kiến-trúc-hệ-thống)
- [9. 📡 Sơ đồ event với RabbitMQ](#9--sơ-đồ-event-với-rabbitmq)
- [10. ✅ Lợi ích của mô hình này](#10--lợi-ích-của-mô-hình-này)
- [11. 🚀 Định hướng mở rộng](#11--định-hướng-mở-rộng)
- [12. 📝 Ghi chú](#12--ghi-chú)

---

## 1. 📖 Giới thiệu

**TDMU IT Social Platform** là hệ thống website mạng xã hội được xây dựng dành riêng cho sinh viên Công nghệ Thông tin của Trường Đại học Thủ Dầu Một.

Hệ thống hướng đến việc tạo ra một môi trường số giúp sinh viên:

- 🤝 Kết nối và giao lưu với nhau
- 📝 Chia sẻ bài viết, tài liệu và kinh nghiệm học tập
- 💬 Nhắn tin thời gian thực
- 🔔 Nhận thông báo từ hệ thống
- 💻 Thực hành lập trình và nộp bài trên nền tảng chấm code
- 👤 Quản lý hồ sơ cá nhân, quan hệ bạn bè và tùy chỉnh trải nghiệm cá nhân

Dự án được thiết kế theo hướng **Microservices**, kết hợp **Clean Architecture**, **Docker** và **RabbitMQ** để đảm bảo tính mở rộng, ổn định và phù hợp với mô hình phát triển phần mềm hiện đại.

---

## 2. 🎯 Mục tiêu hệ thống

- Xây dựng một nền tảng mạng xã hội học thuật cho sinh viên IT
- Tách biệt các chức năng nghiệp vụ thành các service độc lập
- Tăng khả năng mở rộng, bảo trì và triển khai
- Hỗ trợ giao tiếp đồng bộ và bất đồng bộ giữa các thành phần
- Định hướng hệ thống theo mô hình gần với doanh nghiệp thực tế

---

## 3. 🏗️ Kiến trúc tổng thể

Hệ thống được chia thành các service chính sau:

- 🔐 `auth-service`: xác thực và phân quyền
- 👤 `user-service`: quản lý người dùng, bạn bè, theo dõi, chặn
- 🧠 `content-service`: bài viết, bình luận, upload, AI nội dung
- 💬 `chat-service`: nhắn tin realtime
- 🔔 `notification-service`: gửi thông báo đa kênh
- 🧪 `code-judge-service`: quản lý bài tập và chấm code
- 🖥️ `frontend`: giao diện người dùng React

---

## 4. 🛠️ Công nghệ sử dụng

| Thành phần | Công nghệ |
|---|---|
| Frontend | ReactJS |
| Backend | .NET, Node.js |
| Database | SQL Server, MongoDB |
| Message Broker | RabbitMQ |
| Containerization | Docker, Docker Compose |
| Realtime | Socket.IO / WebSocket |
| Authentication | JWT, Refresh Token |

---

## 5. 📂 Cấu trúc thư mục dự án

## 5.1 🔐 auth-service

```text
auth-service/
├─ .dockerignore
├─ AuthService.sln
├─ docker-compose.yml
├─ database/
│  └─ init.sql
└─ src/
   ├─ Auth.API/
   │  ├─ Controllers/
   │  │  └─ AuthController.cs
   │  ├─ Extensions/
   │  │  ├─ ApplicationBuilderExtensions.cs
   │  │  └─ ServiceCollectionExtensions.cs
   │  ├─ Filters/
   │  │  └─ GlobalExceptionFilter.cs
   │  ├─ Middlewares/
   │  │  └─ RequestContextMiddleware.cs
   │  ├─ Properties/
   │  ├─ appsettings.Development.json
   │  ├─ appsettings.json
   │  ├─ Auth.API.csproj
   │  ├─ Auth.API.csproj.user
   │  ├─ Auth.API.http
   │  ├─ Dockerfile
   │  └─ Program.cs
   │
   ├─ Auth.Application/
   │  ├─ DTOs/
   │  │  ├─ LoginRequest.cs
   │  │  ├─ LoginResponse.cs
   │  │  ├─ RefreshTokenRequest.cs
   │  │  └─ RefreshTokenResponse.cs
   │  ├─ Interfaces/
   │  │  ├─ Repositories/
   │  │  ├─ IAuthService.cs
   │  │  ├─ IOutboxService.cs
   │  │  ├─ IPasswordHasher.cs
   │  │  └─ ITokenService.cs
   │  ├─ UseCases/
   │  │  ├─ LoginUseCase.cs
   │  │  ├─ LogoutUseCase.cs
   │  │  └─ RefreshTokenUseCase.cs
   │  └─ Auth.Application.csproj
   │
   ├─ Auth.Domain/
   │  ├─ Entities/
   │  │  ├─ AuthAccount.cs
   │  │  ├─ AuthRole.cs
   │  │  ├─ AuthUserRole.cs
   │  │  ├─ JwtOptions.cs
   │  │  ├─ LoginAuditLog.cs
   │  │  └─ RefreshToken.cs
   │  ├─ Enums/
   │  │  └─ AccountStatus.cs
   │  ├─ Events/
   │  │  └─ UserLoggedInEvent.cs
   │  ├─ ValueObjects/
   │  │  ├─ Email.cs
   │  │  └─ PasswordHash.cs
   │  └─ Auth.Domain.csproj
   │
   └─ Auth.Infrastructure/
      ├─ Configurations/
      │  └─ JwtSettings.cs
      ├─ Migrations/
      ├─ Outbox/
      │  ├─ OutboxEventPublisher.cs
      │  └─ OutboxService.cs
      ├─ Persistence/
      │  ├─ Configurations/
      │  ├─ AuthDbContext.cs
      │  └─ OutboxEvent.cs
      ├─ Repositories/
      ├─ Security/
      │  ├─ JwtTokenGenerator.cs
      │  └─ PasswordHasher.cs
      ├─ Auth.Infrastructure.csproj
      └─ DependencyInjection.cs
```
✨ Vai trò chính

- Đăng nhập, đăng xuất

- JWT và Refresh Token

- Phân quyền và audit đăng nhập

## 5.2 👤 user-service
```text
user-service/
├── .github
├── database/
│   └── init.sql
├── src/
│   ├── User.API
│   ├── User.Application
│   ├── User.Domain
│   └── User.Infrastructure
├── .dockerignore
├── .gitignore
├── docker-compose.yml
├── README.md
└── user-service.sln
```
✨ Vai trò chính

- Hồ sơ người dùng

- Bạn bè, theo dõi

- Chặn người dùng

- Cài đặt cá nhân

## 5.3 🧪 code-judge-service
```text
code-judge-service/
├── database/
│   └── init.sql
├── src/
│   ├── CodeJudge.API
│   ├── CodeJudge.Application
│   ├── CodeJudge.Domain
│   ├── CodeJudge.Infrastructure
│   └── CodeJudge.Runner.Node
├── .dockerignore
├── bootstrap.ps1
├── CodeJudgeService.sln
├── docker-compose.yml
├── fix-structure.bat
└── README.md
```
✨ Vai trò chính

- Quản lý bài tập

- Test case

- Nộp bài

- Chạy thử code

- Chấm code tự động

## 5.4 💬 chat-service
```text
chat-service/
├── node_modules
├── src
│   ├── config
│   │   └── db.js
│   ├── events
│   │   ├── message-sent.event.js
│   │   └── message-sent.handler.js
│   ├── modules
│   │   └── chat
│   │       ├── chat.controller.js
│   │       ├── chat.gateway.js
│   │       ├── chat.repository.js
│   │       ├── chat.service.js
│   │       └── message.model.js
│   ├── socket
│   │   └── socket.adapter.js
│   └── server.js
├── .env
├── chatcounters.json
├── docker-compose.yml
└── Dockerfile
```
✨ Vai trò chính

- Nhắn tin realtime

- Quản lý cuộc trò chuyện

- Phát event khi có tin nhắn mới

## 5.5 🧠 content-service
```text
content-service/
├── node_modules
├── src
│   ├── config
│   │   ├── constants.js
│   │   ├── db.js
│   │   └── env.js
│   ├── events
│   │   ├── handlers
│   │   ├── publishers
│   │   └── index.js
│   ├── integrations
│   │   ├── broker.js
│   │   └── http.js
│   ├── modules
│   │   ├── ai
│   │   ├── comment
│   │   ├── post
│   │   └── upload
│   ├── services
│   │   └── ai.service.js
│   ├── app.js
│   └── server.js
├── .env
├── comments.json
├── docker-compose.yml
└── Dockerfile
```
✨ Vai trò chính

- Quản lý bài viết

- Bình luận

- Upload nội dung

- AI hỗ trợ xử lý nội dung

## 5.6 🔔 notification-service
```text
notification-service/
└─ src/
   ├─ server.js
   ├─ app.js
   ├─ config/
   │  ├─ env.js
   │  ├─ constants.js
   │  └─ database.js
   ├─ common/
   │  ├─ errors/
   │  ├─ middlewares/
   │  └─ utils/
   ├─ modules/
   │  ├─ notification/
   │  │  ├─ notification.routes.js
   │  │  ├─ notification.controller.js
   │  │  ├─ notification.service.js
   │  │  ├─ notification.repository.js
   │  │  ├─ notification.model.js
   │  │  └─ notification.validator.js
   │  └─ preference/
   │     ├─ preference.routes.js
   │     ├─ preference.controller.js
   │     ├─ preference.service.js
   │     ├─ preference.repository.js
   │     └─ preference.model.js
   ├─ events/
   │  ├─ index.js
   │  ├─ event.names.js
   │  ├─ handlers/
   │  │  ├─ comment-created.handler.js
   │  │  ├─ friend-request-sent.handler.js
   │  │  ├─ message-sent.handler.js
   │  │  └─ code-result.handler.js
   │  └─ contracts/
   ├─ channels/
   │  ├─ email.channel.js
   │  ├─ push.channel.js
   │  ├─ inapp.channel.js
   │  └─ websocket.channel.js
   ├─ integrations/
   │  ├─ broker.js
   │  ├─ mailer.js
   │  ├─ push.js
   │  ├─ websocket.js
   │  └─ user.client.js
   └─ jobs/
      ├─ retry-failed-deliveries.job.js
      └─ cleanup-old-notifications.job.js
```
✨ Vai trò chính

- Thông báo trong ứng dụng

- Thông báo qua email, push, websocket

- Nhận event từ các service khác

## 5.7 🖥️ frontend
```text
frontend/
  public/
  src/
    app/
      routes/
        index.jsx
        ProtectedRoute.jsx
      layouts/
        MainLayout.jsx
        AuthLayout.jsx
      providers/
        QueryProvider.jsx
        StoreProvider.jsx
      store/
        index.js
      App.jsx
      main.jsx

    features/
      auth/
      feed/
      posts/
      profile/
      search/
      notifications/
      chat/
      tags/
      codejudge/
      settings/

    services/
      http.js
      tokenStorage.js
      interceptors.js

    shared/
      components/
      hooks/
      utils/
      constants/
      styles/

    assets/
      images/
      icons/

    index.css
```
✨ Vai trò chính

- Giao diện người dùng

- Tổ chức theo feature

- Gọi API và quản lý token

- Hiển thị feed, chat, hồ sơ, bài tập, thông báo

## 6. 🧩 Giải thích kiến trúc áp dụng
## 6.1 🏢 Microservices Architecture
📌 Khái niệm

Microservices là mô hình chia hệ thống lớn thành nhiều service nhỏ, mỗi service phụ trách một nghiệp vụ riêng và có thể phát triển, triển khai, mở rộng độc lập.

❓ Vì sao áp dụng

Hệ thống có nhiều nghiệp vụ khác nhau

Mỗi module có đặc điểm kỹ thuật riêng

Phù hợp với dự án lớn, nhiều nhóm cùng phát triển

✅ Lợi ích

Dễ mở rộng từng service

Dễ bảo trì và sửa lỗi

Tăng tính độc lập giữa các phần của hệ thống

Cho phép dùng nhiều công nghệ khác nhau

🚀 Tác dụng trong dự án

chat-service có thể scale riêng khi lượng tin nhắn tăng

code-judge-service có thể xử lý độc lập khối lượng chấm bài

notification-service có thể hoạt động riêng mà không làm ảnh hưởng các service khác

6.2 🧼 Clean Architecture
📌 Khái niệm

Clean Architecture là cách tổ chức mã nguồn theo nhiều lớp, giúp tách biệt:

nghiệp vụ cốt lõi

luồng xử lý ứng dụng

hạ tầng dữ liệu

lớp giao tiếp bên ngoài

🧱 Cấu trúc điển hình trong dự án

API

Application

Domain

Infrastructure

❓ Vì sao áp dụng

Dự án có nhiều logic nghiệp vụ

Cần code dễ hiểu, dễ test, dễ thay đổi

✅ Lợi ích

Tăng khả năng bảo trì

Giảm phụ thuộc framework

Dễ viết unit test

Dễ thay thế hạ tầng như database hoặc cơ chế xác thực

🚀 Tác dụng trong dự án

auth-service, user-service, code-judge-service được tổ chức rõ ràng

Domain được bảo vệ khỏi phụ thuộc kỹ thuật bên ngoài

Logic nghiệp vụ không bị nhồi vào controller

6.3 🐳 Docker
📌 Khái niệm

Docker là nền tảng đóng gói ứng dụng và môi trường chạy vào container để triển khai nhất quán trên mọi máy.

❓ Vì sao áp dụng

Dự án dùng nhiều công nghệ khác nhau

Có nhiều service, nhiều database, nhiều runtime

✅ Lợi ích

Môi trường chạy đồng nhất

Dễ khởi động toàn bộ hệ thống

Dễ triển khai lên server

Hạn chế lỗi do khác biệt máy phát triển

🚀 Tác dụng trong dự án

Mỗi service có thể có Dockerfile

Có thể dùng docker-compose để chạy cùng lúc API, database, RabbitMQ, frontend

6.4 🐇 RabbitMQ
📌 Khái niệm

RabbitMQ là message broker hỗ trợ giao tiếp bất đồng bộ giữa các service thông qua queue và event.

❓ Vì sao áp dụng

Hệ thống có nhiều sự kiện phát sinh

Cần giảm phụ thuộc trực tiếp giữa các service

Notification cần nhận dữ liệu từ nhiều service khác nhau

✅ Lợi ích

Giảm coupling

Tăng ổn định hệ thống

Dễ retry khi xử lý thất bại

Dễ mở rộng theo mô hình event-driven

🚀 Tác dụng trong dự án

chat-service phát event message-sent

content-service phát event comment-created, post-created

code-judge-service phát event kết quả chấm

notification-service subscribe các event này để gửi thông báo

7. 🔄 Luồng giao tiếp giữa các service
🌐 Giao tiếp đồng bộ

Sử dụng HTTP/REST cho các tác vụ cần phản hồi trực tiếp:

frontend gọi backend

service gọi service để truy vấn dữ liệu ngay

xác thực token

lấy thông tin hồ sơ

📡 Giao tiếp bất đồng bộ

Sử dụng RabbitMQ cho các tác vụ dạng sự kiện:

gửi tin nhắn

tạo bình luận

gửi lời mời kết bạn

hoàn tất chấm code

tạo bài viết


9. ✅ Lợi ích của mô hình này
👨‍💻 Đối với phát triển

Dễ chia việc theo module

Dễ code review

Dễ kiểm thử từng service

Dễ mở rộng theo từng giai đoạn

⚙️ Đối với vận hành

Có thể scale riêng service cần tải cao

Hệ thống ổn định hơn

Giảm nguy cơ lỗi dây chuyền

🎓 Đối với học thuật

Thể hiện tư duy thiết kế phần mềm hiện đại

Phù hợp đồ án, khóa luận, nghiên cứu ứng dụng

Gần với mô hình triển khai trong doanh nghiệp

11. 🚀 Định hướng mở rộng

Bổ sung API Gateway

Thêm Redis để cache

Tích hợp CI/CD

Thêm Centralized Logging

Thêm Distributed Tracing

Thêm Search Service

Thêm Recommendation Service

Triển khai bằng Kubernetes

12. 📝 Ghi chú

Trong tài liệu báo cáo kiến trúc, nên lược bỏ các thư mục build như bin, obj, node_modules
z`
Nên chuẩn hóa cấu hình môi trường giữa các service

Nên định nghĩa rõ event contract khi dùng RabbitMQ

Nên có tài liệu riêng cho API và luồng dữ liệu

Có thể tách thêm api-gateway thành một service độc lập nếu hệ thống mở rộng lớn hơn

📌 Tóm tắt

Dự án TDMU IT Social Platform áp dụng kết hợp:

🏢 Microservices Architecture

🧼 Clean Architecture

🐳 Docker

🐇 RabbitMQ

để xây dựng một hệ thống mạng xã hội học thuật hiện đại, dễ mở rộng, dễ bảo trì và phù hợp với đặc thù sinh viên Công nghệ Thông tin.
