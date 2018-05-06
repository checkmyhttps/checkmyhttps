/**
 * @file Common file.
 * @author CheckMyHTTPS's team
 * @license GPL-3.0
 */

CMH.certificatesChecker = {}

/**
 * @name isCheckableUrl
 * @function
 * @param {string} urlTested         - URL to check
 * @param {bool}   showNotifications - Show notifications
 * @returns {bool}
 * Check if an URL is checkable.
 */
CMH.certificatesChecker.isCheckableUrl = (urlTested, showNotifications) => {
  const [ , scheme, host, port ] = urlTested.match(/^(\w+):\/\/?([a-zA-Z0-9_\-\.]+)(?::([0-9]+))?\/?.*?$/)

  if (scheme !== 'https') {
    if (showNotifications) {
      CMH.ui.showNotification(browser.i18n.getMessage('__noHttps__'))
    }
    return false
  }

  if (host.match(/^((127\.)|(10\.)|(172\.1[6-9]\.)|(172\.2[0-9]\.)|(172\.3[0-1]\.)|(192\.168\.))+[0-9\.]+$/)) { // Check private IP
    if (showNotifications) {
      CMH.ui.showNotification(browser.i18n.getMessage('__privateHost__'))
    }
    return false
  }

  return true
}

/**
 * @name checkTab
 * @function
 * @param {object} tab               - Tab to check
 * @param {bool}   showNotifications - Show notifications
 * Check a tab.
 */
CMH.certificatesChecker.checkTab = (tab, showNotifications) => {
  const urlTested = tab.url

  if (!CMH.certificatesChecker.isCheckableUrl(tab.url, showNotifications)) {
    return
  }

  CMH.tabsManager.setTabStatus(tab, CMH.common.status.WORKING)

  CMH.certificatesManager.getCertTab(tab)
}

/**
 * @name checkUrl
 * @function
 * @param {string} urlTested         - URL to check
 * @param {bool}   showNotifications - Show notifications
 * Check an URL.
 */
CMH.certificatesChecker.checkUrl = (urlTested, showNotifications) => {
  if (!CMH.certificatesChecker.isCheckableUrl(urlTested, showNotifications)) {
    return
  }

  CMH.tabsManager.setTabStatus(CMH.common.status.WORKING)

  CMH.certificatesManager.getCertUrl(urlTested)
}
