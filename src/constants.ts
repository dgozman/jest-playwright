import { LaunchOptions } from 'playwright-core/lib/server/browserType'
import { BrowserContextOptions } from 'playwright-core/lib/browserContext'
import { JestDevServerOptions } from 'jest-dev-server'

export const CORE = 'core'
export const PLAYWRIGHT = 'playwright'

export const CHROMIUM = 'chromium'
export const FIREFOX = 'firefox'
export const WEBKIT = 'webkit'

export type BrowserType = typeof CHROMIUM | typeof FIREFOX | typeof WEBKIT

export type SelectorType = {
  script: string | Function | { path?: string; content?: string }
  name: string
}

export type PlaywrightRequireType =
  | BrowserType
  | typeof PLAYWRIGHT
  | typeof CORE

export const PARALLEL = '--parallel'

export interface Config {
  launchBrowserApp?: LaunchOptions
  context?: BrowserContextOptions
  exitOnPageError: boolean
  browser?: BrowserType
  browsers?: BrowserType[]
  device?: string
  devices?: string[]
  server?: JestDevServerOptions
  selectors?: SelectorType[]
}

export const DEFAULT_CONFIG: Config = {
  launchBrowserApp: {},
  context: {},
  browser: CHROMIUM,
  exitOnPageError: true,
}

// Utils
export type InitializerProps = {
  browser: BrowserType
  device?: string
}

export type RootProxy = {
  [key: string]: any
}

export type Initializer = (args: InitializerProps) => Promise<any>
export type Args = (string | Function)[]
