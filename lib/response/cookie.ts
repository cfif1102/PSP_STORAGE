export class Cookie {
    constructor(
        public readonly name: string,
        public readonly value: string,
        public readonly options: Record<string, any>
    ) {}

    toHeader() {
        let cookie = `${this.name} = ${this.value}`

        const withOptions = Object.entries(this.options)
            .map(([option, value]) =>
                value != undefined ? `; ${option} = ${value}` : `; ${option}`
            )
            .join('')

        if (withOptions.trim().length) {
            cookie += withOptions
        }

        return cookie
    }
}
