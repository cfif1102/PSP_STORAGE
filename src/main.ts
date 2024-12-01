import { ConfigService } from '@config/config.service'
import { createStorageRouter } from './storage/storage.router'
import { StorageServer } from '@lib/storage'

const main = async () => {
    process.setMaxListeners(0)

    const storageRouter = createStorageRouter()
    const configService = ConfigService.resolve()

    const server = new StorageServer(storageRouter)

    const config = configService.get('storage')

    server.start(config.port)
}

main()
