# Use a specific version of Node.js Alpine for better reproducibility
FROM node:18-alpine AS build

# Set environment variables
ENV NODE_ENV=production
ENV NPM_CONFIG_LOGLEVEL=error
ENV NPM_CONFIG_FUND=false
ENV NPM_CONFIG_AUDIT=false

WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package.json ./

# Install only production dependencies first to leverage caching
RUN npm install --only=production --no-audit --no-fund --prefer-offline --progress=false

# Install dev dependencies needed for build
RUN npm install --only=dev --no-audit --no-fund --prefer-offline --progress=false

# Copy only the necessary files for the build
COPY public/ ./public/
COPY src/ ./src/
COPY index.html ./
COPY tsconfig.json ./
COPY vite.config.ts ./
COPY tailwind.config.js ./
COPY postcss.config.js ./

# Build the application with reduced memory usage
RUN npm run build

# Clean up to reduce image size
RUN npm prune --production && npm cache clean --force

# Use a specific version of Nginx Alpine for better reproducibility and smaller image size
FROM nginx:alpine-slim AS runtime

# Copy only the built files from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Remove default nginx config to save space
RUN rm -rf /etc/nginx/conf.d/default.conf.default

# Add health check with reduced frequency to save resources
HEALTHCHECK --interval=60s --timeout=3s --start-period=10s --retries=2 \
  CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
