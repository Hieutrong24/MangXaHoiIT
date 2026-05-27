FROM mcr.microsoft.com/dotnet/sdk:8.0-jammy

RUN apt-get update && apt-get install -y curl python3 g++ && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
  && apt-get update && apt-get install -y nodejs && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm i --omit=dev
COPY . .
EXPOSE 5001
CMD ["node","src/server.js"]
