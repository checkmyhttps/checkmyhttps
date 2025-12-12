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
  WORKING: 3
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
  'working'
]


/**
 * @name parseURL
 * @function
 * @param {string} urlStr - URL to parse
 * @returns {object} - Host and port
 * Parse an URL.
 */
CMH.common.parseURL = (urlStr) => {
  const url = new URL(urlStr)
  const host = url.hostname
  let port = url.port

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