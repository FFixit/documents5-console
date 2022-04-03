# Documents 5 Console
This is a webapp through which you can view a live feed of logs/console messages which get output by a [otris documents 5 server](https://www.otris.de/wiki/aktenverwaltung/dokumenten-management-system-dms/).

It hosts a simple NodeJs Server, which in the backend communicates with documents 5 over [otris/node-sds](https://github.com/otris/node-sds) and to the frontend (your browser) using websockets.