# Documents 5 Console

This is a webapp through which you can view a live feed of logs/console messages which get output by a [otris documents 5 server](https://www.otris.de/wiki/aktenverwaltung/dokumenten-management-system-dms/).

It hosts a simple NodeJs Server, which in the backend communicates with documents 5 over [otris/node-sds](https://github.com/otris/node-sds) and to the frontend (your browser) using websockets.

## How to install

-   Have the latest version of NodeJS and Npm installed
-   Pull using `git pull https://github.com/FFixit/documents5-console.git`
-   Navigate to the root directory of this project
-   Do one of the following:

### Run from directory

-   Install by running `npm install`
-   Run by executing `npm run build`, then `npm run prod`.

### Run as a systemd service

-   Install by running `npm install`
-   Run `bash install_service.sh` to install a systemd service, which you can start by running `systemctl start documentsConsole` and stop by using `systemctl stop documentsConsole`.

### Run as a docker container

-   Run `docker build -t documents-console .` to build a docker image.
-   Run `docker run -d --name documents-console -p 8001:8001 documents-console` to start a docker container running the server.

## How to use

-   Open a browser and navigate to `localhost:8001`
-   Use the UI to enter hostname and port of a documents 5 server and click 'Connect'
-   Alternatively you can specify hostname and port over url query parameters e.g `http://localhost:8001/?hostname=localhost&port=11000`
