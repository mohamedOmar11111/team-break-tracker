# --- Build stage ---
FROM node:18 AS builder

WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build the frontend
RUN npm run build

# --- Production stage ---
FROM node:18

WORKDIR /usr/src/app

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy the server file
COPY server.cjs .

# Copy the built frontend from the builder stage
COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 8080

CMD [ "node", "server.cjs" ]