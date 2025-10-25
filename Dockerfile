# --- Build stage ---
FROM node:22 AS builder

WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build the frontend
RUN npm run build

# --- Production stage ---
FROM node:22

WORKDIR /usr/src/app

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy the server file
COPY server.cjs .

# Copy the built frontend from the builder stage
COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 8080

# Healthcheck to verify the application is listening
HEALTHCHECK --interval=5s --timeout=3s --start-period=5s --retries=3 CMD curl -f http://localhost:8080/ || exit 1

# Define the command to run your app
CMD [ "node", "server.cjs" ]
