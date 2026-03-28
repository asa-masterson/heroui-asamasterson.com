# Build stage
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./

# Prefer deterministic install when lockfile exists; fallback keeps build working.
# Also limit npm memory to prevent OOM kills on smaller servers
RUN NODE_OPTIONS="--max-old-space-size=1024" npm ci --legacy-peer-deps 2>/dev/null || NODE_OPTIONS="--max-old-space-size=1024" npm install --legacy-peer-deps

COPY . .

# Build the app
ENV NODE_ENV=production
RUN NODE_OPTIONS="--max-old-space-size=2048" npm run build

# Runtime stage
FROM nginx:alpine AS runtime

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]