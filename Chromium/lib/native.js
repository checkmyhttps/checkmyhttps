/**
 * @file Native messaging manager.
 * @author CheckMyHTTPS's team
 * @license GPL-3.0
 */

CMH.native = {}

/**
 * @type {object}
 * Connection to native application.
 */
CMH.native.port = null

/**
 * @type {object}
 * Connection to native application for testing.
 */
CMH.native.portTesting = null

/**
 * @type {object}
 * Information about native application.
 */
CMH.native.nativeAppInfo = {
  connected: false,
  version:   null,
  filepath:  null
}

/**
 * @type {string}
 * Minimum required version of native application.
 */
CMH.native.minimumAppVersion = '1.2.0'

 /**
  * @name connect
  * @function
  * Connect to the native application.
  */
CMH.native.connect = () => {
  CMH.native.port = browser.runtime.connectNative('checkmyhttps')

  const listener_ping = CMH.native.port.onMessage.addListener((response) => {
    if (response.action === 'PONG') {
      CMH.native.port.onMessage.removeListener(listener_ping)
      CMH.native.nativeAppInfo.connected = true
      CMH.native.nativeAppInfo.version   = response.version
      CMH.native.nativeAppInfo.filepath  = response.filepath

      // Check native application version
      if (CMH.common.compareVersion(CMH.native.nativeAppInfo.version, CMH.native.minimumAppVersion) < 0) {
        CMH.native.nativeAppInfo.connected = false
        CMH.native.port.disconnect()
        CMH.native.port = null
        return
      }

      CMH.native.port.postMessage({ action: 'setOptions', params: {
        checkServerUrl:                CMH.options.settings.checkServerUrl,
        checkServerFingerprintsSha256: CMH.options.settings.checkServerFingerprintsSha256
      }})
    }
  })

  CMH.native.port.onDisconnect.addListener((p) => {
    CMH.native.nativeAppInfo.connected = false
    CMH.native.port = null
    let reason = ''
    if (browser.runtime.lastError !== null) {
      reason += ' ('+browser.runtime.lastError.message+')'
    }
    console.log('Native disconnected' + reason)
    CMH.native.port = null
  })
}

/**
 * @name testConnection
 * @function
 * @returns {Promise}
 * Test connection to the native application.
 */
CMH.native.testConnection = () => {
  return new Promise((resolve, reject) => {
    if (CMH.native.portTesting !== null) {
      return resolve(null)
    }

    CMH.native.portTesting = browser.runtime.connectNative('checkmyhttps')
    CMH.native.portTesting.onDisconnect.addListener((p) => {
      let reason = ''
      if (browser.runtime.lastError !== null) {
        reason += ' ('+browser.runtime.lastError.message+')'
      }
      console.log('Native (testing) disconnected' + reason)

      CMH.native.portTesting = null
      if (typeof timeout !== 'undefined') {
        clearTimeout(timeout)
      }
      return resolve({ res: false })
    })

    if (CMH.native.portTesting === null) {
      return resolve({ res: false })
    }

    const listener = (response) => {
      if (response.action === 'PONG') {
        clearTimeout(timeout)
        CMH.native.portTesting.onMessage.removeListener(listener)
        CMH.native.portTesting.disconnect()
        CMH.native.portTesting = null

        return resolve({ res: true, response })
      }
    }

    CMH.native.portTesting.onMessage.addListener(listener)

    CMH.native.portTesting.postMessage({ action: 'PING' })

    const timeout = setTimeout(() => {
      CMH.native.portTesting = null
      return resolve({ res: false })
    }, 5000)
  })
}

/**
 * @name postMessageAndWaitResponse
 * @function
 * @param {object} request        - Request object
 * @param {string} responseAction - Response action name
 * @returns {Promise}
 * .
 */
CMH.native.postMessageAndWaitResponse = (request, responseAction) => {
  return new Promise((resolve, reject) => {
    if (CMH.native.port === null) {
      return reject(new Error('not_connected'))
    }

    const listener = (response) => {
      if (response.action === responseAction) {
        // Fix potential requests/responses not linked
        // IDEA : add unique transaction ID to link request/result? (todo if native script need to be upgraded)
        if (response.action === 'check') {
          if (request.params.url !== response.url) {
            return
          } else if ((typeof request.params.tabId !== 'undefined') && (request.params.tabId !== response.tabId)) {
            return
          }
        } else if (response.action === 'getFingerprints') {
          if (request.params.url !== response.url) {
            return
          }
        }

        clearTimeout(timeout)
        CMH.native.port.onMessage.removeListener(listener)

        return resolve(response)
      }
    }
    CMH.native.port.onMessage.addListener(listener)

    CMH.native.port.postMessage(request)

    const timeout = setTimeout(() => {
      return reject(new Error('timeout'))
    }, 10000)
  })
}

if (!CMH.common.isWebExtTlsApiSupported()) {
  CMH.native.connect()
}
