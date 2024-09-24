#! /usr/bin/env bash

IMAGE_NAME=dtt-mdl-testing
IMAGE_VERSION="local-$(git describe --abbrev=0 --tags || echo "alpha-v0.0.0")"

set -e
set -x
docker build . -t "${IMAGE_NAME}:${IMAGE_VERSION}"
# docker run --rm -it --init -e NODE_ENV=production --name ${IMAGE_NAME} "${IMAGE_NAME}:${IMAGE_VERSION}"
docker run --rm --init -it --name ${IMAGE_NAME} "${IMAGE_NAME}:${IMAGE_VERSION}"