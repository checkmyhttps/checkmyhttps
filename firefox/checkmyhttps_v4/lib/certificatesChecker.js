/**
 * @file Certificates checker.
 * @author CheckMyHTTPS's team
 * @license GPLv3
 */

const _    = require('sdk/l10n').get;
const tabs = require('sdk/tabs');
const urls = require('sdk/url');

const CMH = {
    api:                 require('./api'),
    certificatesManager: require('./certificatesManager'),
    common:              require('./common'),
    tabsManager:         require('./tabsManager'),
    ui:                  require('./ui')
};

/**
 * @name isCheckableUrl
 * @function
 * @param {string} urlTested         - URL to check
 * @param {bool}   showNotifications - Show notifications
 * @returns {bool}
 * Check if an URL is checkable.
 */
const isCheckableUrl = function (urlTested, showNotifications) {
    if (!urls.isValidURI(urlTested)) {
        return false;
    }

    const url = urls.URL(urlTested);

    if (url.scheme !== 'https') {
        if (showNotifications) {
            CMH.ui.notification.show(_('l_noHttps'), _('l_view'));
        }
        return false;
    }

    const regex_privateIp = /^(127\.)|(10\.)|(172\.1[6-9]\.)|(172\.2[0-9]\.)|(172\.3[0-1]\.)|(192\.168\.)/;
    if (url.host.match(regex_privateIp)) {
        if (showNotifications) {
            CMH.ui.notification.show(_('l_privateIp'));
        }
        return false;
    }

    return true;
};

/**
 * @name checkTab
 * @function
 * @param {object} tab               - Tab to check
 * @param {bool}   showNotifications - Show notifications
 * Check a tab.
 */
const checkTab = function (tab, showNotifications) {
    const tabId     = tab.id;
    const urlTested = CMH.tabsManager.getTabUrl(tab);

    if (!isCheckableUrl(urlTested, showNotifications)) {
        return;
    }

    CMH.tabsManager.setTabStatus(tab, CMH.common.status.WORKING);
    const cert = CMH.certificatesManager.getCertTab(tabId);
    if (cert === null) {
        CMH.tabsManager.setTabStatus(tab, CMH.common.status.UNKNOWN);
        return;
    }
    CMH.api.requestFromUrl(urlTested, function (datas_api) {
        verifyCertificate(cert, datas_api.cert, showNotifications, tab, urlTested);
    });
};

/**
 * @name checkUrl
 * @function
 * @param {string} urlTested         - URL to check
 * @param {bool}   showNotifications - Show notifications
 * Check an URL.
 */
const checkUrl = function (urlTested, showNotifications) {
    if (!isCheckableUrl(urlTested, showNotifications)) {
        return;
    }

    // status: CMH.common.status.WORKING
    CMH.certificatesManager.getCertUrl(urlTested, function (datas_url) {
        if (datas_url.cert === null) {
            // status: CMH.common.status.UNKNOWN
            return;
        }
        CMH.api.requestFromUrl(urlTested, function (datas_api) {
            verifyCertificate(datas_url.cert, datas_api.cert, showNotifications, null, urlTested);
        });
    });
};

/**
 * @name verifyCertificate
 * @function
 * @param {object} userCertificate   - Certificate from the user
 * @param {object} CmhCertificate    - Certificate from the CheckMyHTTPS server
 * @param {bool}   showNotifications - Show notifications
 * @param {object} [tab]             - Tab to check
 * @param {string} urlTested         - URL to check
 * Check if the user's certificate is valid.
 */
const verifyCertificate = function (userCertificate, CmhCertificate, showNotifications, tab, urlTested) {
    if (CMH.certificatesManager.compareCertificateFingerprints(userCertificate, CmhCertificate)) {
        if (tab !== null) {
            CMH.tabsManager.setTabStatus(tab, CMH.common.status.VALID);
        }
    } else {
        if (CmhCertificate.whitelisted) { // Certificate whitelisted
            if (tab !== null) {
                CMH.tabsManager.setTabStatus(tab, CMH.common.status.WARNING);
            }
            if (showNotifications) {
                CMH.ui.notification.show(_('l_severalCertificats'));
            }
        } else {
            if (tab !== null) {
                CMH.tabsManager.setTabStatus(tab, CMH.common.status.INVALID);
            }
            CMH.ui.notification.show(_('l_danger'), _('l_view'), function (data) {
                const { host, port } = CMH.common.parseURL(urlTested);
                tabs.open('https://checkmyhttps.net/result.php?host='+encodeURIComponent(host)+'&port='+port+'&fingerprints[sha1]='+userCertificate.fingerprints.sha1+'&fingerprints[sha256]='+userCertificate.fingerprints.sha256);
            });
        }
    }
};

exports.checkTab = checkTab;
