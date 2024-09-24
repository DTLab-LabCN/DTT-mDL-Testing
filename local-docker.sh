#! /usr/bin/env bash

IMAGE_NAME=dtt-mdl-testing
IMAGE_VERSION="local-$(git describe --abbrev=0 --tags || echo "alpha-v0.0.0")"

set -e
# Run only if run flag is passed an image is not available
if [ "$1" == "run" ] && \
   [ "$1" != "build" ] && \
   (docker image ls | grep -F "${IMAGE_NAME}" | grep -F "${IMAGE_VERSION}"); then
    echo "$0: run flag passed, skipping build step"
else
    set -x
    docker build . -t "${IMAGE_NAME}:${IMAGE_VERSION}"
fi

# docker run --rm -it --init -e NODE_ENV=production --name ${IMAGE_NAME} "${IMAGE_NAME}:${IMAGE_VERSION}"
docker run --rm --init -it -p 5173:5173 --name ${IMAGE_NAME} "${IMAGE_NAME}:${IMAGE_VERSION}"