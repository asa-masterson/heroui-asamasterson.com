# Build stage
FROM node:18-alpine AS build

WORKDIR /app

COPY package.json ./

# Install ALL deps (including devDeps needed for build) but signal production intent
RUN yarn install --frozen-lockfile

COPY . .

# Build the app
ENV NODE_ENV=production
RUN NODE_OPTIONS="--max-old-space-size=2048" yarn build

# Runtime stage
FROM nginx:alpine AS runtime

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]