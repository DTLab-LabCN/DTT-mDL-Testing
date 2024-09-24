ARG NODE_VERSION=20
ARG OS_VERSION=bullseye-slim
# Content of this file derived from 
# https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md
FROM node:${NODE_VERSION}-${OS_VERSION}

# Build/Run time args
ARG APP_DIR=mDL-Testing
ARG NODE_USER=node
ARG NODE_HOME=/home/${NODE_USER}

# TODO: this currently prevent npm run build to work.
# ENV NODE_ENV=production

COPY . ${NODE_HOME}/${APP_DIR}
WORKDIR ${NODE_HOME}/${APP_DIR}
RUN npm clean-install --force && \
    npm run build && \
    chown -R "${NODE_USER}:${NODE_USER}" "${NODE_HOME}/${APP_DIR}"

# TODO: When running this docker, you need to use:
# --init (see https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md#handling-kernel-signals)
# -m "300M" --memory-swap "1G"
# Run the server process as (preferably) non-root unix user
USER ${NODE_USER}

EXPOSE 5173/tcp

CMD ["npm", "run", "host"]
