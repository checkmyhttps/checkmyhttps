/**
 * @file API communications.
 * @author CheckMyHTTPS's team
 * @license GPLv3
 */

const CMH = {
    certificatesManager: require('./certificatesManager'),
    common:              require('./common')
};

/**
 * @name requestFromUrl
 * @function
 * @param {string}   urlTested - URL to check
 * @param {function} callback  - Callback on result
 * @returns {bool}
 * Request certificate info of an URL.
 */
const requestFromUrl = function (urlTested, callback) {
    const { host, port } = CMH.common.parseURL(urlTested);

    CMH.certificatesManager.getCertUrl('https://checkmyhttps.net/api.php?host='+encodeURIComponent(host)+'&port='+port, function (datas) {
        if (datas.xhr.status !== 200) { // Error in response
            callback({error: datas.xhr.statusText});
            return;
        }

        callback({cert: JSON.parse(datas.response)});
    })
};

exports.requestFromUrl = requestFromUrl;
