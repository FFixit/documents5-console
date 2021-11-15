import { WebSocket } from 'ws'
import node_sds from '@otris/node-sds'

export class ConsoleConnection {
    /**@type Array<WebSocket> */
    #clients = []
    /**@type number */
    #lastSeen
    /**@type typeof node_sds.SDSConnection */
    #connection
    /**@type string */
    #host
    /**@type number */
    #port

    /**
     * @param {string} documentsHost
     * @param {string} documentsPort
     */
    constructor(documentsHost, documentsPort) {
        this.#host = documentsHost
        this.#port = documentsPort
    }

    get isConnected() {
        return this.#connection && this.#connection.isConnected
    }

    get host() {
        return this.#host
    }

    get port() {
        return this.#port
    }

    addClient(client) {
        this.#clients.push(client)
    }

    async connect() {
        console.log(`ConsoleConnection: connecting to server ${this.#host}:${this.#port}`)
        this.#connection = new node_sds.SDSConnection()
        this.#connection.timeout = 6000
        await this.#connection.connect('server-console', this.#host, this.#port)

        console.log(`ConsoleConnection: connected to server ${this.getHostString()}`)

        let previousMessages = await this.#connection.ServerGui.getLogMessages(-1)
        this.#lastSeen = previousMessages.lastSeen
    }

    async disconnect() {
        if (this.isConnected) {
            console.log(`ConsoleConnection: disconnecting from server ${this.getHostString()}`)
            await this.#connection.disconnect()
        } else {
            throw new Error('ConsoleConnection: cannot disconnect from server, not connected')
        }
    }

    async #getLinesFromServer() {
        if (!this.isConnected) {
            throw new Error('ConsoleConnection: error while fetching lines: Documents Console not connected.')
        }
        try {
            let messages = await this.#connection.ServerGui.getLogMessages(this.#lastSeen)
            let lines = messages.messages
            if (typeof lines[0] === 'string' && lines[0] === '') {
                lines = lines.slice(1)
            }
            this.#lastSeen = messages.lastSeen
            return lines
        } catch (error) {
            let errString = `ConsoleConnection: error while fetching lines: ${error.toString()}`
            console.error(errString)
            throw new Error(errString)
        }
    }

    #broadcastData(data) {
        this.#clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN && client.connectMessageRecieved === true) {
                client.send(JSON.stringify(data))
            } else if (client.readyState === WebSocket.CLOSED) {
                console.log(
                    `ConsoleConnection: client ${client._socket.remoteAddress}:${
                        client._socket.remotePort
                    } disconnected, removing client from connection ${this.getHostString()}`
                )
                this.#clients.splice(this.#clients.indexOf(client), 1)
            }
        })
    }

    getHostString() {
        return `${this.host}:${this.port} (${this.#connection.socket.remoteAddress}:${
            this.#connection.socket.remotePort
        })`
    }

    sendLines() {
        this.#getLinesFromServer().then(
            (lines) => {
                this.#broadcastData({ lines })
            },
            (error) => {
                let errorMessage = error.toString()
                console.error(errorMessage)
                this.#broadcastData({ error: errorMessage })
            }
        )
    }
}
