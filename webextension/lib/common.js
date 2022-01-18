/**
 * @file Common file.
 * @author CheckMyHTTPS's team
 * @license GPL-3.0
 */

var CMH = {}

CMH.common = {}

/**
 * @name status
 * @enum
 * Enum of check status.
 */
CMH.common.status = {
  VALID:   0,
  INVALID: 1,
  UNKNOWN: 2,
  WARNING: 3,
  WORKING: 4
}

/**
 * @name statusCode
 * @type {array}
 * Array of check status code.
 */
CMH.common.statusCode = [
  'valid',
  'invalid',
  'unknown',
  'warning',
  'working'
]


/**
 * @name getIP
 * @function
 * @returns {string} - ip
 * Event on headers received.
 */
var ip = ""
CMH.common.getIP = () => {
  return ip
}
browser.webRequest.onHeadersReceived.addListener(headersDetails => {ip = headersDetails.ip},{urls: ['*://*/*']});


/**
 * @name parseURL
 * @function
 * @param {string} urlStr - URL to parsed
 * @returns {object} - Host and port
 * Parse an URL.
 */
CMH.common.parseURL = (urlStr) => {
  const url = new URL(urlStr)
  const host = url.hostname
  let   port = url.port

  if (port == '') {
    const protocol = url.protocol.slice(0, -1)
    if (protocol === 'http') {
      port = 80
    } else if (protocol === 'ftp') {
      port = 21
    } else {
      port = 443
    }
  }

  return { host: host, port: port }
}


/**
 * @name compareVersion
 * @function
 * @param {string} versionA - version "A"
 * @param {string} versionB - version "B"
 * @returns {number} - 1 (A>B), 0 (A=B) or -1 (A<B)
 * Compare two version numbers.
 */
CMH.common.compareVersion = function (versionA, versionB) {
  if (versionA === versionB) {
      return 0
  }

  const versionA_array = versionA.split('.')
  const versionB_array = versionB.split('.')

  const versionLength = Math.min(versionA_array.length, versionB_array.length)

  for (let i = 0; i < versionLength; i++) {
    if (parseInt(versionA_array[i]) > parseInt(versionB_array[i])) {
      return 1
    }
    if (parseInt(versionA_array[i]) < parseInt(versionB_array[i])) {
      return -1
    }
  }

  if (versionA_array.length > versionB_array.length) {
    return 1
  }
  if (versionA_array.length < versionB_array.length) {
    return -1
  }

  return 0
}

/**
 * @name isWebExtTlsApiSupported
 * @function
 * @returns {boolean} - TLS API supported or not
 * Check if WebExtension TLS API is supported.
 */
CMH.common.isWebExtTlsApiSupported = () => {
  return (typeof browser.webRequest.getSecurityInfo !== 'undefined')
}

/**
 * @name platform
 * @type {string}
 * Current platform
 */
CMH.common.platform = undefined
if (typeof browser.runtime.getBrowserInfo !== 'undefined') {
  browser.runtime.getBrowserInfo().then((details) => {
    if ((details.vendor === 'Mozilla') && (details.name === 'Fennec')) {
      CMH.common.platform = 'mobile'
    } else {
      CMH.common.platform = 'desktop'
    }
  })
} else {
  CMH.common.platform = 'desktop'
}

/**
 * @name isDesktopPlatform
 * @function
 * @returns {boolean} - Is desktop platform
 * Check if the current platform is desktop.
 */
CMH.common.isDesktopPlatform = () => {
  if (typeof CMH.common.platform !== 'undefined') {
    return (CMH.common.platform === 'desktop')
  }
}
