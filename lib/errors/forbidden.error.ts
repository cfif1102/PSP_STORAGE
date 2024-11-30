import { HttpStatusMessages, HttpStatus } from '@lib/types/response.types'
import { HttpError } from './http-common.error'

export class ForbiddenError extends HttpError {
    constructor(message: string = HttpStatusMessages[HttpStatus.FORBIDDEN]) {
        super(message, HttpStatus.FORBIDDEN)
    }
}
