# Stage 1: Build
FROM oven/bun:1 AS builder

WORKDIR /app

COPY package.json ./
COPY apps/web/package.json ./apps/web/

RUN bun install

COPY apps/web ./apps/web
COPY libs ./libs

RUN bun run --filter @impulsa/web build --configuration=production

# Stage 2: Serve
FROM nginx:alpine

COPY --from=builder /app/apps/web/dist/web/browser /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

RUN echo 'add_header X-Frame-Options "SAMEORIGIN" always;' >> /etc/nginx/conf.d/security.conf && \
    echo 'add_header X-Content-Type-Options "nosniff" always;' >> /etc/nginx/conf.d/security.conf && \
    echo 'add_header X-XSS-Protection "1; mode=block" always;' >> /etc/nginx/conf.d/security.conf && \
    echo 'add_header Referrer-Policy "strict-origin-when-cross-origin" always;' >> /etc/nginx/conf.d/security.conf

RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
