# User Service

User Service là microservice quản lý thông tin người dùng được xây dựng bằng ASP.NET Core và SQL Server.

## Requirements

Trước khi chạy project cần cài:

* Docker Desktop

## Run Project

Clone project:

```
git clone <repository-url>
cd user-service
```

Chạy hệ thống bằng Docker:

```
docker compose up --build
```

Sau khi chạy xong API sẽ hoạt động tại:

```
http://localhost:5002
```

## Stop Project

Dừng toàn bộ container:

```
docker compose down
```

## Project Structure

```
user-service
│
├─ docker-compose.yml
├─ README.md
│
└─ src
   ├─ User.API
   ├─ User.Application
   ├─ User.Domain
   └─ User.Infrastructure
```

## Database

Database sử dụng SQL Server chạy trong Docker container.

Connection string được cấu hình tự động trong docker-compose.

## Notes

* Không cần cài SQL Server trên máy local.
* Docker sẽ tự tạo database container khi chạy project.
