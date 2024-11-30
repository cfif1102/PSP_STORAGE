import { HttpError } from '@lib/errors/http-common.error'
import { Router } from '@lib/request/router'
import { ServerHandler } from '@lib/server-handler'
import { Request } from '@lib/request/request'
import { Response } from '@lib/response/response'
import { HttpStatus } from '@lib/types/response.types'
import { createServer, Socket } from 'node:net'
import { StorageHandler } from '@lib/storage-handler'

export class StorageServer {
    constructor(private readonly router: Router) {}

    public start(port: number) {
        const server = createServer(async (socket) => {
            try {
                const { body, headers, raw } = await ServerHandler.read(socket)
                const request = Request.parse(headers, body, raw)

                const response = await this.router.handle(request)

                await ServerHandler.send(response, socket)
            } catch (exception: unknown) {
                const response = new Response()

                let data: Buffer

                if (exception instanceof HttpError) {
                    data = response.text(
                        exception.statusCode,
                        exception.message
                    )
                } else if (exception instanceof Error) {
                    data = response.text(
                        HttpStatus.BAD_REQUEST,
                        `${exception.message}, ${exception.stack}`
                    )
                } else {
                    data = response.text(
                        HttpStatus.INTERNAL_SERVER_ERROR,
                        'Some error occured...'
                    )
                }

                await ServerHandler.send(data, socket)
            } finally {
                socket.end()
            }
        })

        server.listen(port)
    }
}
