import { HttpStatusMessages, HttpStatus } from '@lib/types/response.types'
import { HttpError } from './http-common.error'

export class ServerError extends HttpError {
    constructor(
        message: string = HttpStatusMessages[HttpStatus.INTERNAL_SERVER_ERROR]
    ) {
        super(message, HttpStatus.INTERNAL_SERVER_ERROR)
    }
}
