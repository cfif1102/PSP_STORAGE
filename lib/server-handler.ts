import { Socket } from 'node:net'
import { Request } from './request/request'

export class ServerHandler {
    public static async read(socket: Socket) {
        const result = await new Promise<{
            headers: Record<string, string>
            body: Buffer | null
            raw: string
        }>((resolve, reject) => {
            let message = Buffer.alloc(0)
            let isHeadersRead = false
            let isBodyReading = false
            let length = 0
            let headers: Record<string, string> = {}
            let rawHeaders = ''

            socket.on('readable', () => {
                if (socket.readableLength === 0) {
                    return
                }

                if (isBodyReading) {
                    message = Buffer.concat([message, this.readBody(socket)])

                    if (message.length === length) {
                        isBodyReading = false

                        resolve({ headers, body: message, raw: rawHeaders })
                    }
                } else if (!isHeadersRead) {
                    while (!isHeadersRead) {
                        if (message.toString().includes('\r\n\r\n')) {
                            isHeadersRead = true
                            break
                        }

                        const chunk = socket.read(1)

                        if (!chunk) {
                            isHeadersRead = true
                            break
                        }

                        message = Buffer.concat([message, chunk])
                    }

                    rawHeaders = message.toString()
                    headers = Request.parseHeaders(rawHeaders)
                    length = +headers['Content-Length']

                    if (length) {
                        isBodyReading = true

                        message = this.readBody(socket)

                        if (message.length === length) {
                            resolve({ headers, body: message, raw: rawHeaders })
                        } else {
                            isBodyReading = true
                        }
                    } else {
                        resolve({ headers, body: null, raw: rawHeaders })
                    }
                }
            })

            socket.on('error', () => {
                reject()
            })
        })

        return result
    }

    public static readBody(socket: Socket) {
        let chunk
        let message = Buffer.alloc(0)

        while ((chunk = socket.read(socket.readableLength))) {
            message = Buffer.concat([message, chunk])
        }

        return message
    }

    public static send(data: Buffer, socket: Socket) {
        let offset = 0
        let chunkSize = 65000

        return new Promise<void>((resolve, reject) => {
            const sendChunk = () => {
                if (offset < data.length) {
                    const size = Math.min(data.length - offset, chunkSize)
                    const chunk = data.slice(offset, offset + size)

                    const success = socket.write(chunk, () => {
                        offset += size

                        if (offset < data.length) {
                            sendChunk()
                        } else {
                            resolve()
                        }
                    })

                    if (!success) {
                        socket.once('drain', sendChunk)
                    }
                }
            }

            sendChunk()
        })
    }
}
