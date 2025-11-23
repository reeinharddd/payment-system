FROM oven/bun:1

WORKDIR /app

COPY package.json bun.lock ./
COPY services/mcp-server/package.json ./services/mcp-server/

RUN bun install

COPY . .

RUN bun run --filter mcp-server build

EXPOSE 8080

CMD ["bun", "services/mcp-server/dist/server.js"]
