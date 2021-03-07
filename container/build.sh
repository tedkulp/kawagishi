#!/bin/sh

VERSION="4.3.2"

docker build --build-arg "version=${VERSION}" -f Dockerfile.node -t tedkulp/node-ffmpeg:latest -t tedkulp/node-ffmpeg:${VERSION} .

docker push tedkulp/node-ffmpeg:latest
docker push tedkulp/node-ffmpeg:${VERSION}
