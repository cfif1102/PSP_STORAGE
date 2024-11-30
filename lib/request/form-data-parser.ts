import { FileType } from '@lib/types/request.types'
import fs from 'node:fs'
export class FormDataParser {
    public static parseFormData(headers: Record<string, string>, body: Buffer) {
        const contentType = headers['Content-Type']
        const boundarySplit = contentType.split(';')[1]
        const equalIndex = boundarySplit.indexOf('=')
        const boundary = boundarySplit.slice(equalIndex + 1)

        const formData: Record<string, string> = {}
        const files: FileType[] = []

        const parts = FormDataParser.splitIntoParts(body, boundary)

        for (let part of parts) {
            let formItem = FormDataParser.processPart(part)

            if (formItem.isFile) {
                files.push({
                    name: formItem.name,
                    content: formItem.content,
                    size: formItem.content.length
                })
            } else {
                formData[formItem.name] = formItem.content.toString('utf-8')
            }
        }

        return {
            formData,
            files
        }
    }

    public static splitIntoParts(body: Buffer, boundary: string) {
        const boundaryBuffer = Buffer.from(`--${boundary}`)
        const endBoundaryBuffer = Buffer.from(`--${boundary}--`)

        const parts = []
        let start = 0

        while (start < body.length) {
            const boundaryIndex = body.indexOf(boundaryBuffer, start)
            if (boundaryIndex === -1) break

            const nextBoundaryIndex = body.indexOf(
                boundaryBuffer,
                boundaryIndex + boundaryBuffer.length
            )
            const endBoundaryIndex = body.indexOf(
                endBoundaryBuffer,
                boundaryIndex
            )

            if (nextBoundaryIndex === -1) {
                const part = body.slice(
                    boundaryIndex + boundaryBuffer.length,
                    endBoundaryIndex
                )

                if (part.toString().trim()) {
                    parts.push(part)
                }

                break
            } else {
                const part = body.slice(
                    boundaryIndex + boundaryBuffer.length,
                    nextBoundaryIndex
                )

                if (part.toString().trim()) {
                    parts.push(part)
                }

                start = nextBoundaryIndex
            }
        }

        return parts
    }

    public static processPart(buffer: Buffer) {
        let header = ''
        let index = 0

        while (index < buffer.length) {
            let byte = buffer[index]

            header += String.fromCharCode(byte)

            if (header.includes('\r\n\r\n')) {
                break
            }

            index++
        }

        const lines = header.trim().split('\r\n')
        const fileInfoRaw = lines[0].split(':')[1].split(';')
        const formItemName = fileInfoRaw[1]
            .split('=')[1]
            .trim()
            .replace(/"/g, '')

        if (lines.length == 2) {
            const fileName = fileInfoRaw[2]
                .split('=')[1]
                .trim()
                .replace(/"/g, '')

            return {
                name: fileName,
                content: buffer.slice(index + 1, buffer.length - 2),
                isFile: true
            }
        } else {
            return {
                name: formItemName,
                content: buffer.slice(index),
                isFile: false
            }
        }
    }
}
