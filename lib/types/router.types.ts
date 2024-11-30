import { HttpMethod } from './request.types'
import { Request } from '@lib/request/request'

export type RouteAction = (request: Request) => Promise<Buffer>
export type Middleware = (request: Request) => Promise<boolean>

export class Route {
    constructor(
        public readonly method: HttpMethod,
        public readonly url: string,
        public readonly action: RouteAction,
        public readonly middleware: Middleware[] = []
    ) {}
}
