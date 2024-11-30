import { HttpStatusMessages, HttpStatus } from '@lib/types/response.types'
import { HttpError } from './http-common.error'

export class BadRequestError extends HttpError {
    constructor(message: string = HttpStatusMessages[HttpStatus.BAD_REQUEST]) {
        super(message, HttpStatus.BAD_REQUEST)
    }
}
