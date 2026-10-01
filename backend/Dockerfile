FROM node:22-bookworm-slim AS dependencies
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

FROM node:22-bookworm-slim
ENV NODE_ENV=production
WORKDIR /app/backend
COPY --from=dependencies --chown=node:node /app/backend/node_modules ./node_modules
COPY --chown=node:node backend/ ./
COPY --chown=node:node dsa/ /app/dsa/
COPY --chown=node:node database/ /app/database/
COPY --chown=node:node data/ /app/data/
USER node
EXPOSE 5000
HEALTHCHECK --interval=15s --timeout=7s --start-period=30s --retries=3 CMD node -e "fetch('http://127.0.0.1:'+process.env.PORT+'/ready').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "--import", "tsx", "server.js"]
