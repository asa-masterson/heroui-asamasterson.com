# Build stage
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy package.json
COPY package.json ./

# Install dependencies
ENV NODE_ENV=development
RUN npm install

# Copy project files
COPY . .

# Build the app
ENV NODE_ENV=production
RUN NODE_OPTIONS="--max-old-space-size=2048" npm run build

# Runtime stage
FROM nginx:alpine AS runtime

# Copy built files
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]

