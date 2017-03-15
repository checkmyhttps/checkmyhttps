/**
 * @file Common file.
 * @author CheckMyHTTPS's team
 * @license GPLv3
 */

const systemXulApp = require('sdk/system/xul-app');
const urls         = require('sdk/url');

/**
 * @name status
 * @enum
 * Enum of check status.
 */
exports.status = {
    VALID:   0,
    INVALID: 1,
    UNKNOWN: 2,
    WARNING: 3,
    WORKING: 4
};

/**
 * @name statusCode
 * @type {array}
 * Array of check status code.
 */
exports.statusCode = [
    'valid',
    'invalid',
    'unknown',
    'warning',
    'working'
];

/**
 * @name isPlatform
 * @function
 * @param {string} platform - Platform name
 * @returns {bool}
 * Check the platform of the running add-on.
 */
const isPlatform = function (platform) {
    if (platform === 'desktop') {
        return (systemXulApp.name === 'Firefox');
    } else if (platform === 'mobile') {
        return (systemXulApp.name === 'Fennec');
    }
}

/**
 * @name parseURL
 * @function
 * @param {string} urlStr - URL to parsed
 * @returns {object} - Host and port
 * Parse an URL.
 */
const parseURL = function (urlStr) {
    const url = urls.URL(urlStr);
    const host = url.host;
    const port = url.port || 443;

    return { host: host, port: port };
};

exports.isPlatform = isPlatform;
exports.parseURL   = parseURL;
