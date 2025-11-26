# loans-frontend/Dockerfile

# ===================================
# STAGE 1: Dependencies
# ===================================
FROM node:20-alpine AS dependencies

WORKDIR /app

# Instalar dependencias primero (se cachea)
COPY package*.json ./
RUN npm ci && npm cache clean --force

# ===================================
# STAGE 2: Build
# ===================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar node_modules de la etapa anterior
COPY --from=dependencies /app/node_modules ./node_modules

# Copiar código y compilar
COPY . .
RUN npm run build

# ===================================
# STAGE 3: Production
# ===================================
FROM nginx:alpine

# ✅ CRÍTICO: Copiar configuración nginx personalizada para SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar build desde builder
COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]