import { ConfigService } from '@config/config.service'
import { BadRequestError } from '@lib/errors/bad-request.error'
import { NotFoundError } from '@lib/errors/not-found.error'
import { FileType } from '@lib/types/request.types'
import fs from 'node:fs'
import path from 'node:path'

export class StorageService {
    private static instance: StorageService
    private readonly folder: string

    private constructor(private readonly configService: ConfigService) {
        const config = this.configService.get('storage')

        this.folder = config.folder
    }

    public static resolve() {
        if (!StorageService.instance) {
            const config = ConfigService.resolve()

            StorageService.instance = new StorageService(config)
        }

        return StorageService.instance
    }

    public write(file: FileType) {
        fs.writeFileSync(path.join(this.folder, file.name), file.content)
    }

    public delete(fileName: string) {
        const filePath = path.join(this.folder, fileName)

        if (!fs.existsSync(filePath)) {
            throw new NotFoundError('File not found...')
        }

        fs.unlinkSync(filePath)
    }

    public async read(fileName: string) {
        const filePath = path.join(this.folder, fileName)

        if (!fs.existsSync(filePath)) {
            throw new NotFoundError('File not found...')
        }

        const data = await new Promise<Buffer>((resolve, reject) => {
            fs.readFile(filePath, (err, data) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(data)
                }
            })
        })

        return data
    }
}
