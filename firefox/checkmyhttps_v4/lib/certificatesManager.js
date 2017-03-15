/**
 * @file Certificates manager.
 * @author CheckMyHTTPS's team
 * @license GPL-3.0
 */

const { Ci }             = require('chrome');
const _                  = require('sdk/l10n').get;
const tabs               = require('sdk/tabs');
const tabsUtils          = require('sdk/tabs/utils');
const urls               = require('sdk/url');
const { XMLHttpRequest } = require('sdk/net/xhr');

const CMH = {
    common:      require('./common'),
    tabsManager: require('./tabsManager'),
    ui:          require('./ui')
};

/**
 * @type {object}
 * Finguerprints of the CheckMyHTTPS server.
 */
const CMHServerFinguerprints = {
    sha1:   'FF33641253DAA21E6C5CADEBF15430B2B7E498E6',
    sha256: '889F63E8E7F98F67E35750591CD66BC32A17A4B4FA2A44763DBEF8D756156165'
};

/**
 * @name getCertTab
 * @function
 * @param {string} tabId - ID of the tab to check
 * @returns {object} - certificate
 * Get the certificate of a tab.
 */
const getCertTab = function (tabId) {
    const tab = tabsUtils.getTabForId(tabId);
    if (tab === null) {
        return;
    }

    const secInfo = tabsUtils.getBrowserForTab(tab).securityUI;
    try {
        secInfo.QueryInterface(Ci.nsISSLStatusProvider);
        if (!secInfo.SSLStatus) {
            return null;
        }
        return formatCertificate(secInfo.SSLStatus.serverCert);
    } catch (err) {
        console.debug('Error: ' + err);
        return null;
    }
};

/**
 * @name getCertUrl
 * @function
 * @param {string}   urlTested - URL to check
 * @param {function} callback  - Callback on result
 * Get the certificate of an URL.
 */
const getCertUrl = function (urlTested, callback) {
    const httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', urlTested, true);
    httpRequest.addEventListener('error', function (e) {
        callback({cert: null, response: httpRequest.responseText, xhr: httpRequest});
    }, false);
    httpRequest.addEventListener('load', function (e) {
        const secInfo = httpRequest.channel.securityInfo;
        let cert = null;

        try {
            if (secInfo instanceof Ci.nsITransportSecurityInfo) {
                secInfo.QueryInterface(Ci.nsITransportSecurityInfo);
                if (secInfo instanceof Ci.nsISSLStatusProvider)  {
                    secInfo.QueryInterface(Ci.nsISSLStatusProvider);
                    if (!secInfo.SSLStatus) {
                        return;
                    }
                    cert = secInfo.SSLStatus.serverCert;
                }
            }
        } catch (err) {
            console.debug('Error: ' + err);
        }

        cert = formatCertificate(cert);

        // SSL pinning
        if (urls.URL(urlTested).host === 'checkmyhttps.net') {
            if ((cert !== null) && (!compareCertificateFingerprints(cert, { fingerprints: CMHServerFinguerprints }))) {
                CMH.tabsManager.setTabStatus(tabs.activeTab, CMH.common.status.INVALID);
                CMH.ui.notification.show(_('l_danger'), _('view'), function (data) {
                    const { host, port } = CMH.common.parseURL(urlTested);
                    tabs.open('https://checkmyhttps.net/result.php?host='+encodeURIComponent(host)+'&port='+port+'&fingerprints[sha1]='+userCertificate.fingerprints.sha1+'&fingerprints[sha256]='+userCertificate.fingerprints.sha256);
                });
                return;
            }
        }

        callback({cert: cert, response: httpRequest.responseText, xhr: httpRequest});
    }, false);
    httpRequest.send();
};

/**
 * @name formatCertificate
 * @function
 * @param {object} certificate - Certificate unformatted
 * @returns {object} - certificate formatted
 * Format a certificate.
 */
const formatCertificate = function (certificate) {
    if (certificate === null) {
        return null;
    }

    return {
        fingerprints: {
            sha1:   certificate.sha1Fingerprint.replace(/:/g, '').toUpperCase(),
            sha256: certificate.sha256Fingerprint.replace(/:/g, '').toUpperCase()
        }
    };
};

/**
 * @name compareCertificateFingerprints
 * @function
 * @param {object} userCertificate - Certificate from the user
 * @param {object} CmhCertificate  - Certificate from the server
 * @returns {bool}
 * Compare Finguerprints of two certificates.
 */
const compareCertificateFingerprints = function (userCertificate, CmhCertificate) {
    return ((userCertificate.fingerprints.sha1 === CmhCertificate.fingerprints.sha1) && (userCertificate.fingerprints.sha256 === CmhCertificate.fingerprints.sha256));
};

exports.getCertTab = getCertTab;
exports.getCertUrl = getCertUrl;
exports.compareCertificateFingerprints = compareCertificateFingerprints;
