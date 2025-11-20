# Dockerfile
FROM node:20-alpine

# Crear carpeta de trabajo
WORKDIR /usr/src/app

# Copiar package.json y package-lock
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Construir la app Nest (dist/)
RUN npm run build

# Exponer el puerto de Nest
EXPOSE 3000

# Comando de arranque en modo producción
CMD ["npm", "run", "start:prod"]
