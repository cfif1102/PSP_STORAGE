import { Socket } from 'net'
import { FileType, HttpMethod } from './types/request.types'
import { ServerHandler } from './server-handler'
import { v4 as uuid } from 'uuid'
import path from 'node:path'

export class StorageHandler {
    public static async sendFile(file: FileType) {
        const index = Math.floor(file.size / 2)

        const part1 = file.content.slice(0, index)
        const part2 = file.content.slice(index)

        const fileExt = path.extname(file.name)
        const request1 = this.prepareFormData(
            {
                name: `${uuid()}_1${fileExt}`,
                size: part1.length,
                content: part1
            },
            'files',
            HttpMethod.POST
        )
        const request2 = this.prepareFormData(
            {
                name: `${uuid()}_2${fileExt}`,
                size: part2.length,
                content: part2
            },
            'files',
            HttpMethod.POST
        )

        await this.sendToStorage(3001, '127.0.0.1', request1)
        await this.sendToStorage(3002, '127.0.0.1', request2)
    }

    public static sendToStorage(port: number, host: string, data: Buffer) {
        return new Promise<void>((resolve, reject) => {
            const storageSocket = new Socket()

            storageSocket.connect({ port, host }, async () => {
                await ServerHandler.send(data, storageSocket)

                resolve()
            })

            storageSocket.on('error', reject)
        })
    }

    public static prepareFormData(
        file: FileType,
        url: string,
        method: HttpMethod
    ) {
        const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'

        const bodyBuffer = Buffer.concat([
            Buffer.from(
                [
                    `--${boundary}`,
                    `Content-Disposition: form-data; name="file"; filename="${file.name}"`,
                    `Content-Type: application/octet-stream`,
                    '\r\n'
                ].join('\r\n')
            ),
            file.content,
            Buffer.from(`\r\n--${boundary}--`)
        ])

        const responseBuffer = Buffer.concat([
            Buffer.from(
                [
                    `${method} ${url} HTTP/1.1`,
                    `Content-Type: multipart/form-data; boundary=${boundary}`,
                    `Content-Length: ${Buffer.byteLength(bodyBuffer)}`,
                    `Connection: close`,
                    '\r\n'
                ].join('\r\n')
            ),
            bodyBuffer
        ])

        return responseBuffer
    }
}
