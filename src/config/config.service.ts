import { ConfigType } from '@app-types/config.types'
import fs from 'node:fs'
require('dotenv').config()

export class ConfigService {
    private static instance: ConfigService
    private readonly params: ConfigType

    private constructor() {
        this.params = {
            storage: {
                port: parseInt(process.env.PORT || '8080'),
                folder: process.env.FOLDER || ''
            }
        }
    }

    public static resolve() {
        if (!ConfigService.instance) {
            ConfigService.instance = new ConfigService()
        }

        return ConfigService.instance
    }

    public get<T extends keyof ConfigType>(key: T) {
        return this.params[key]
    }
}
