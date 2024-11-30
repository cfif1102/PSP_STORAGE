import { Request } from '@lib/request/request'
import { StorageService } from './storage.service'
import { BadRequestError } from '@lib/errors/bad-request.error'
import { Response } from '@lib/response/response'
import { HttpStatus } from '@lib/types/response.types'

export class StorageController {
    private static instance: StorageController

    private constructor(private readonly storageService: StorageService) {}

    public static resolve() {
        if (!StorageController.instance) {
            const storageService = StorageService.resolve()

            StorageController.instance = new StorageController(storageService)
        }

        return StorageController.instance
    }

    public async writeFile(request: Request) {
        const file = request.files[0]

        if (!file) {
            throw new BadRequestError('No file attached...')
        }

        this.storageService.write(file)

        return new Response().text(HttpStatus.OK, 'File is written...')
    }

    public async deleteFile(request: Request) {
        const fileName = request.params.name

        this.storageService.delete(fileName)

        return new Response().text(HttpStatus.OK, 'File is deleted...')
    }

    public async readFile(request: Request) {
        const fileName = request.params.name
        const data = await this.storageService.read(fileName)

        return new Response().file(data, 'application/octet-stream')
    }
}
