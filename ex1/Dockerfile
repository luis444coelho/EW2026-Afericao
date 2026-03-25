# Imagem base
FROM node:22

# Diretório de trabalho
WORKDIR /app

# Copiar ficheiros de dependências
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar o resto do código (incluindo o myServer_sel_proj.js)
COPY . .

# Expor a porta definida no teu código
EXPOSE 16025

# Comando para iniciar (ajusta se o nome do ficheiro for diferente)
CMD ["node", "repairs_api.js"]