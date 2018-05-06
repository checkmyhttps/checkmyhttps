/**
 * @file Common file.
 * @author CheckMyHTTPS's team
 * @license GPL-3.0
 */

CMH.certificatesManager = {}

/**
 * @name getCertUrl
 * @function
 * @param {string} urlTested - URL to check
 * Get the certificate of an URL.
 */
CMH.certificatesManager.getCertUrl = (urlTested) => {
  if (!CMH.native.nativeAppInfo.connected) {
    CMH.ui.setStatus(CMH.common.status.UNKNOWN)
    CMH.ui.showNotification(browser.i18n.getMessage('__nativeAppNotConnected__'))
    return
  }
  CMH.native.port.postMessage({'action': 'check', 'params': { 'url': urlTested }})
}

/**
 * @name getCertTab
 * @function
 * @param {object} tab - Tab to check
 * Get the certificate of a tab.
 */
CMH.certificatesManager.getCertTab = (tab) => {
  if (!CMH.native.nativeAppInfo.connected) {
    CMH.tabsManager.setTabStatus(tab, CMH.common.status.UNKNOWN)
    CMH.ui.showNotification(browser.i18n.getMessage('__nativeAppNotConnected__'))
    return
  }
  CMH.native.port.postMessage({'action': 'check', 'params': { 'url': tab.url, 'tabId': tab.id }})
}

/**
 * Listen native messages.
 */
CMH.native.onMessage((response) => {
  if (response.action === 'check') {
    if (response.result === 'OK') {
      if (response.tabId !== null) {
        CMH.tabsManager.setTabStatus({ id: response.tabId, url: response.url }, CMH.common.status.VALID)
      }
    } else if (response.result === 'IDN') {
      if (response.tabId !== null) {
        CMH.tabsManager.setTabStatus({ id: response.tabId, url: response.url }, CMH.common.status.VALID)
      }
      if (CMH.options.settings.alertOnUnicodeIDNDomainNames) {
        CMH.ui.showNotification(browser.i18n.getMessage('__IDNwarning__', response.url))
      }
    } else if (response.result === 'WL') {
      if (response.tabId !== null) {
        CMH.tabsManager.setTabStatus({ id: response.tabId, url: response.url }, CMH.common.status.WARNING)
        CMH.ui.showNotification(browser.i18n.getMessage('__severalCertificats__'))
      }
    } else if (response.result === 'ERR') {
      CMH.tabsManager.setTabStatus({ id: response.tabId, url: response.url }, CMH.common.status.UNKNOWN)
      CMH.ui.showNotification(browser.i18n.getMessage('__serverUnreachable__'))
    } else if (response.result === 'SSLP') {
      CMH.tabsManager.setTabStatus({ id: response.tabId, url: response.url }, CMH.common.status.INVALID)
      CMH.ui.showNotification(browser.i18n.getMessage('__danger__'), { 'priority': 2 })
    } else if (response.result === 'KO') {
      CMH.tabsManager.setTabStatus({ id: response.tabId, url: response.url }, CMH.common.status.INVALID)
      CMH.ui.showNotification(browser.i18n.getMessage('__danger__'), { 'priority': 2 })
    } else if (response.result === 'PRIVATE_HOST') {
      CMH.tabsManager.setTabStatus({ id: response.tabId, url: response.url }, CMH.common.status.UNKNOWN)
      CMH.ui.showNotification(browser.i18n.getMessage('__privateHost__'))
    } else {
      CMH.tabsManager.setTabStatus({ id: response.tabId, url: response.url }, CMH.common.status.UNKNOWN)
      CMH.ui.showNotification(browser.i18n.getMessage('__serverUnreachable__'))
    }
  }
})
