# 1. Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy source code
COPY . .

# Build app cho production
RUN npm run build

# 2. Production stage: serve bằng nginx
FROM nginx:alpine

# Copy file build từ stage trước vào thư mục nginx phục vụ
COPY --from=build /app/dist /usr/share/nginx/html

# Copy config nginx (nếu có) hoặc giữ default

# Expose port 80 (mặc định nginx)
EXPOSE 80

# Start nginx server
CMD ["nginx", "-g", "daemon off;"]
