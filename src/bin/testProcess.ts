import { spawn, spawnSync, SpawnSyncOptions } from 'child_process'
import {
  checkBrowserEnv,
  getBrowserType,
  readConfig,
  readPackage,
} from '../utils'
import { checkCommand, getDisplayName, getExitCode } from './utils'
import { BrowserType, IMPORT_KIND_PLAYWRIGHT } from '../constants'

const getSpawnOptions = (
  browser: BrowserType,
  device: string | null,
): SpawnSyncOptions => ({
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    BROWSER: browser,
    ...(device ? { DEVICE: device } : {}),
  },
})

const exec = ({
  sequence,
  browser,
  device = null,
  params,
}: {
  sequence: string
  browser: BrowserType
  device?: string | null
  params: string[]
}): Promise<number | null> =>
  new Promise((resolve) => {
    const options = getSpawnOptions(browser, device)
    const displayName = getDisplayName(browser, device)
    if (sequence === '--parallel') {
      const process = spawn(
        'node',
        [
          `node_modules/jest/bin/jest.js --displayName="${displayName}" ${params}`,
        ],
        options,
      )
      process.on('close', (status) => {
        resolve(status)
      })
    } else {
      const { status } = spawnSync(
        'node',
        [
          `node_modules/jest/bin/jest.js --displayName="${displayName}" ${params}`,
        ],
        options,
      )
      resolve(status)
    }
  })

const runner = async (sequence: string, params: string[]): Promise<void> => {
  // TODO Work only if we pass config through package.json
  const rootDir = `${process.cwd()}/${
    process.env.npm_package_jest_rootDir || ''
  }/`
  const config = await readConfig(rootDir)
  const { devices = [], browser } = config
  let browsers = config.browsers
  if (!browsers) {
    browsers = browser ? [browser] : []
  }
  let exitCodes: (number | null)[] = []
  checkCommand(browsers, devices)
  if (!browsers.length && devices.length) {
    let browserType: BrowserType
    const browser = await readPackage()
    if (browser === IMPORT_KIND_PLAYWRIGHT) {
      browserType = getBrowserType(config)
      checkBrowserEnv(browserType)
    } else {
      browserType = browser
    }
    exitCodes = await Promise.all(
      devices.map((device) =>
        exec({ sequence, browser: browserType, device, params }),
      ),
    )
  }
  if (browsers.length) {
    if (devices.length) {
      const multipleCodes = await Promise.all(
        browsers.map((browser) =>
          Promise.all(
            devices.map((device) =>
              exec({ sequence, browser, device, params }),
            ),
          ),
        ),
      )
      exitCodes = multipleCodes.reduce((acc, val) => acc.concat(val), [])
    } else {
      exitCodes = await Promise.all(
        browsers.map((browser) => exec({ sequence, browser, params })),
      )
    }
  }
  getExitCode(exitCodes)
}

export default runner
