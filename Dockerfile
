# Usa Node 22 oficial
FROM node:22-alpine AS build

# Crea directorio de trabajo
WORKDIR /app

# Copia archivos de proyecto
COPY . .

# Instala dependencias y compila
RUN corepack enable && pnpm install --frozen-lockfile && pnpm run build

# Etapa final - servidor estático con nginx
FROM nginx:alpine AS serve
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
