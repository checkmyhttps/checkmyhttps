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
 * @name parseURL
 * @function
 * @param {string} urlStr - URL to parsed
 * @returns {object} - Host and port
 * Parse an URL.
 */
CMH.common.parseURL = (urlStr) => {
  const url = new URL(urlStr)
  const host = url.hostname
  const port = url.port || 443

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
