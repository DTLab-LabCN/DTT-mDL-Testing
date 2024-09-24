ARG NODE_VERSION=20
ARG OS_VERSION=bullseye-slim
# Content of this file derived from 
# https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md
FROM node:${NODE_VERSION}-${OS_VERSION}

WORKDIR /
# TODO: this currently prevent npm run build to work.
# ENV NODE_ENV=production

COPY . ./
RUN npm clean-install --force && \
    npm run build

# TODO: When running this docker, you need to use:
# --init (see https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md#handling-kernel-signals)
# -m "300M" --memory-swap "1G"
WORKDIR /dist
# USER node
CMD ["npm", "run", "host"]
