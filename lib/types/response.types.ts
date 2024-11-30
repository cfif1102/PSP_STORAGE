export enum ContentType {
    JSON = 'application/json; charset=utf-8',
    TEXT = 'text/plain',
    FORM_DATA = 'multipart/form-data'
}

export enum HttpStatus {
    OK = 200,
    CREATED = 201,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    INTERNAL_SERVER_ERROR = 500
}

export const HttpStatusMessages = {
    [HttpStatus.OK]: 'OK',
    [HttpStatus.CREATED]: 'CREATED',
    [HttpStatus.BAD_REQUEST]: 'BAD REQUEST',
    [HttpStatus.UNAUTHORIZED]: 'UNAUTHORIZED',
    [HttpStatus.FORBIDDEN]: 'FORBIDDEN',
    [HttpStatus.NOT_FOUND]: 'NOT FOUND',
    [HttpStatus.INTERNAL_SERVER_ERROR]: 'INTERNAL SERVER ERROR'
}
