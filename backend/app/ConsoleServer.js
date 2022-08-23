import { WebSocket, WebSocketServer } from 'ws'
import * as http from 'http'
import node_static from 'node-static'
import assert from 'assert'
import { ConsoleConnection } from './ConsoleConnection.js'

export default class ConsoleServer {
    /**@type Array<ConsoleConnection> */
    #connections = []
    /**@type http.Server */
    #httpServer
    /**@type WebSocketServer */
    #webSocketServer

    constructor() {
        const staticDir = process.env.FRONTEND_DIST_DIR
        const staticFiles = new node_static.Server(staticDir)
        this.#httpServer = http
            .createServer((req, res) => {
                staticFiles.serve(req, res)
            })
            .listen(8001,()=>{
                console.log("backend started")
            })
        this.#webSocketServer = new WebSocketServer({
            server: this.#httpServer,
            clientTracking: true,
        })

        this.#webSocketServer.on('connection', this.#handleConnection.bind(this))
    }

    /**
     *
     * @param {WebSocket} client
     * @param {IncomingMessage} req
     */
    #handleConnection(client, req) {
        console.log(
            `ConsoleServer: client connected from ${req.socket.remoteAddress}:${
                req.socket.remotePort
            }; Active clients: ${this.#webSocketServer.clients.size}`
        )
        client.isAlive = true
        client.on('pong', function () {
            this.isAlive = true
        })
        client.on('message', (data) => {
            let parsed
            try {
                parsed = JSON.parse(data)
            } catch (error) {
                console.error('ConsoleServer: on message: error while parsing data:', error)
            }

            try {
                if (parsed.action === 'connect' && this.#validateConnectData(parsed)) {
                    this.#connectClientToConsole(client, parsed.hostname, parsed.port)
                }
            } catch (error) {
                client.send(JSON.stringify({ error: `${error.toString()}` }))
            }
        })
    }

    #validateConnectData(data) {
        assert(typeof data.hostname === 'string', 'ConsoleServer: on message: connect: invalid/no hostname')
        assert(typeof data.port === 'number', 'ConsoleServer: on message: connect: invalid/no port')
        return true
    }

    #connectClientToConsole(client, host, port) {
        let connection = this.#getOpenConnection(host, port)
        if (connection) {
            console.log(
                `ConsoleServer: adding client to existing Documents Connection with ${connection.getHostString()}`
            )
            connection.addClient(client)
            client.connectMessageRecieved = true
        } else {
            console.log(`ConsoleServer: making new Documents Connection with host ${host} and port ${port}`)
            connection = new ConsoleConnection(host, port)
            connection.connect().then(
                () => {
                    connection.addClient(client)
                    this.#connections.push(connection)
                    client.connectMessageRecieved = true
                },
                (error) => {
                    let errorMessage = `ConsoleServer: error while trying to open connection to Documents Server with host ${host} and port ${port}: ${error.toString()}`
                    console.error(errorMessage)
                    client.send(JSON.stringify({ error: errorMessage }))
                }
            )
        }
    }

    #getOpenConnection(host, port) {
        for (const connection of this.#connections) {
            if (connection.host === host && connection.port === port) {
                return connection
            }
        }
    }

    fetchLines() {
        this.#connections.forEach((connection) => {
            if (connection.isConnected) {
                connection.sendLines()
            } else {
                console.log(
                    `ConsoleServer: connection ${connection.host}:${connection.port} disconnected, removing connection`
                )
                this.#connections.splice(this.#connections.indexOf(connection), 1)
            }
        })
    }

    // checkForDisconnectedClients() {
    //   this.#webSocketServer.clients.forEach(function each(client) {
    //     if (client.isAlive === false) {
    //       console.error(
    //         `checkForDisconnectedClients: inactive client found. terminating ${client._socket.remoteAddress}:${client._socket.remotePort}`
    //       );
    //       if (client.connectMessageRecieved) {
    //         client.documentsConnection.disconnect().catch((error) => {
    //           console.error(
    //             `checkForDisconnectedClients: cannot disconnect Documents Console: ${error.toString()}`
    //           );
    //         });
    //       }
    //       return client.terminate();
    //     }

    //     client.isAlive = false;
    //     client.ping();
    //   });
    // }
}
