import { HttpStatusMessages, HttpStatus } from '@lib/types/response.types'
import { HttpError } from './http-common.error'

export class NotFoundError extends HttpError {
    constructor(message: string = HttpStatusMessages[HttpStatus.NOT_FOUND]) {
        super(message, HttpStatus.NOT_FOUND)
    }
}
