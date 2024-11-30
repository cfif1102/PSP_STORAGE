import { Router } from '@lib/request/router'
import { StorageController } from './storage.controller'

export const createStorageRouter = () => {
    const router = new Router()
    const controller = StorageController.resolve()

    router.post('/files', controller.writeFile.bind(controller), [])
    router.delete('/files/:name', controller.deleteFile.bind(controller), [])
    router.get('/files/:name', controller.readFile.bind(controller), [])

    return router
}
