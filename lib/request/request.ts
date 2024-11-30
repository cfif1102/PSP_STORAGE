import { BadRequestError } from '@lib/errors/bad-request.error'
import { FileType } from '@lib/types/request.types'
import { ContentType } from '@lib/types/response.types'
import { FormDataParser } from './form-data-parser'

export class Request {
    public params: Record<string, string> = {}
    public body: Record<string, string> = {}
    public files: FileType[] = []

    private constructor(
        public url: string,
        public method: string,
        public headers: Record<string, string>,
        public cookie: Record<string, string> = {},
        public query: Record<string, string> = {}
    ) {}

    public static parse(
        headers: Record<string, string>,
        body: Buffer | null,
        raw: string
    ) {
        const { url, method } = Request.parseUrl(raw)
        const cookies = Request.parseCookies(headers)
        const queryParams = Request.parseQueryParams(url)

        const request = new Request(url, method, headers, cookies, queryParams)

        Request.parseBody(request, headers, body)

        return request
    }

    public static parseHeaders(rawRequest: string) {
        const lines = rawRequest.split('\r\n')
        const headerEndIndex = lines.indexOf('')
        const headerLines = lines.slice(1, headerEndIndex)
        const headers = Request.processHeaders(headerLines)

        return headers
    }

    public static parseQueryParams(url: string) {
        const queryParamsIndex = url.indexOf('?')

        if (queryParamsIndex == -1) {
            return {}
        }

        const queryParamsLine = url.slice(queryParamsIndex + 1)
        const queryParamsRaw = queryParamsLine.split('&')

        const queryParams: Record<string, string> = {}

        for (let queryParamRaw of queryParamsRaw) {
            const [name, value] = queryParamRaw.split('=')

            queryParams[name] = value
        }

        return queryParams
    }

    public static parseBody(
        request: Request,
        headers: Record<string, string>,
        body: Buffer | null
    ) {
        try {
            const contentType = headers['Content-Type']

            if (!body) {
                return {}
            }

            if (contentType.includes(ContentType.JSON)) {
                request.body = JSON.parse(body.toString())
            } else if (contentType.includes(ContentType.FORM_DATA)) {
                const { formData, files } = FormDataParser.parseFormData(
                    headers,
                    body
                )

                request.body = formData
                request.files = files
            }

            return {}
        } catch (e: unknown) {
            console.log(e)
        }
    }

    public static parseCookies(headers: Record<string, string>) {
        try {
            const cookies: Record<string, string> = {}
            const cookieHeaderValue = headers['Cookie']

            if (cookieHeaderValue) {
                const rawCookies = cookieHeaderValue.split(';')

                for (let rawCookie of rawCookies) {
                    const equalIndex = rawCookie.indexOf('=')
                    const cookieName = rawCookie.slice(0, equalIndex).trim()
                    const cookieVal = rawCookie.slice(equalIndex + 1).trim()

                    cookies[cookieName] = cookieVal
                }
            }

            return cookies
        } catch (e: unknown) {
            throw new BadRequestError("Can't parse request body...")
        }
    }

    public static processHeaders(rawHeadersLines: string[]) {
        const headers: Record<string, string> = {}

        rawHeadersLines.forEach((headerLine) => {
            const index = headerLine.indexOf(':')

            const header = headerLine
                .slice(0, index)
                .split('-')
                .map(
                    (word) =>
                        `${word[0].toUpperCase()}${word.slice(1).toLowerCase()}`
                )
                .join('-')

            const value = headerLine.slice(index + 1).trim()

            headers[header] = value
        })

        return headers
    }

    public static parseParams(requestUrl: string, url: string) {
        const params: Record<string, string> = {}
        const requestUrlSplit = requestUrl
            .split('/')
            .filter((val) => val.trim() != '')
        const urlSplit = url.split('/').filter((val) => val.trim() != '')

        for (let i = 0; i < requestUrlSplit.length; i++) {
            if (
                requestUrlSplit[i] != urlSplit[i] &&
                urlSplit[i].includes(':')
            ) {
                const paramName = urlSplit[i].split(':')[1]

                params[paramName] = requestUrlSplit[i]
            }
        }

        return params
    }

    private static parseUrl(rawRequest: string) {
        const lines = rawRequest.split('\r\n')
        const data = lines[0].split(' ')

        return { method: data[0], url: data[1] }
    }
}
