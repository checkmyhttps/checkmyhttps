/**
 * @file Tabs manager.
 * @author CheckMyHTTPS's team
 * @license GPL-3.0
 */

CMH.tabsManager = {}


/**
 * @type {object}
 * Check status of tabs.
 */
CMH.tabsManager.tabsStatus = {}

/**
 * @name setTabStatus
 * @function
 * @param {number} tabId  - Tab ID
 * @param {number} status - Check status
 * Set the status of a tab.
 */
CMH.tabsManager.setTabStatus = (tabId, status) => {
  if (typeof CMH.tabsManager.tabsStatus[tabId] === 'undefined') {
    CMH.tabsManager.tabsStatus[tabId] = {}
  }
  CMH.tabsManager.tabsStatus[tabId].status = status
  CMH.ui.setStatus(status, tabId)
}

/**
 * @name deleteTabStatus
 * @function
 * @param {number} tabId - Tab ID
 * Delete the status of a tab.
 */
CMH.tabsManager.deleteTabStatus = (tabId) => {
  if (typeof CMH.tabsManager.tabsStatus[tabId] !== 'undefined') {
    delete CMH.tabsManager.tabsStatus[tabId]
  }
}

/**
 * @name setTabUrl
 * @function
 * @param {number} tabId - Tab ID
 * @param {string} url   - Tab URL
 * Set the current URL of a tab.
 */
CMH.tabsManager.setTabUrl = (tabId, url) => {
  if (typeof CMH.tabsManager.tabsStatus[tabId] === 'undefined') {
    CMH.tabsManager.tabsStatus[tabId] = {
      status: CMH.common.status.UNKNOWN
    }
  }

  const newUrl = CMH.common.parseURL(url)
  if (typeof CMH.tabsManager.tabsStatus[tabId].host !== 'undefined') {
    const oldUrl = CMH.tabsManager.tabsStatus[tabId]
    if ((newUrl.host !== oldUrl.host) || (newUrl.port !== oldUrl.port)) {
      CMH.tabsManager.tabsStatus[tabId].certificates = null
      CMH.tabsManager.tabsStatus[tabId].status       = CMH.common.status.UNKNOWN
    }
  } else {
    CMH.tabsManager.tabsStatus[tabId].certificates = null
    CMH.tabsManager.tabsStatus[tabId].status       = CMH.common.status.UNKNOWN
  }

  CMH.tabsManager.tabsStatus[tabId].host = newUrl.host
  CMH.tabsManager.tabsStatus[tabId].port = newUrl.port
}

/**
 * @name setTabCertificates
 * @function
 * @param {number} tabId        - Tab ID
 * @param {number} certificates - Current certificates
 * @param {string} [url]        - Tab URL
 * Set the status of a tab.
 */
CMH.tabsManager.setTabCertificates = (tabId, certificates, url) => {
  if (typeof CMH.tabsManager.tabsStatus[tabId] === 'undefined') {
    CMH.tabsManager.tabsStatus[tabId] = {
      status: CMH.common.status.UNKNOWN
    }
  }
  if (typeof url !== 'undefined') {
    CMH.tabsManager.setTabUrl(tabId, url)
  }
  CMH.tabsManager.tabsStatus[tabId].certificates = certificates
}

/**
 * @name getTabCertificate
 * @function
 * @param {number} tabId - Tab ID
 * @returns {object} - certificates chain
 * Set the certificate of a tab.
 */
CMH.tabsManager.getTabCertificate = (tabId) => {
  if ((typeof CMH.tabsManager.tabsStatus[tabId] === 'undefined') || (typeof CMH.tabsManager.tabsStatus[tabId].certificates === 'undefined')) {
    return null
  }
  return CMH.tabsManager.tabsStatus[tabId].certificates
}

/**
 * @name onTabActivated
 * @function
 * @param {number} tabId - Tab ID
 * Event on tab switch.
 */
CMH.tabsManager.onTabActivated = (tabId) => {
  if (typeof CMH.tabsManager.tabsStatus[tabId] !== 'undefined') {
    CMH.ui.setStatus(CMH.tabsManager.tabsStatus[tabId].status, tabId)
  } else {
    CMH.ui.setStatus(CMH.common.status.UNKNOWN, tabId)
  }
}
chrome.tabs.onActivated.addListener((activeInfo) => { CMH.tabsManager.onTabActivated(activeInfo.tabId) })

/**
 * @name onTabClose
 * @function
 * @param {number} tabId - Tab ID
 * Event on tab close.
 */
CMH.tabsManager.onTabClose = (tabId) => {
  CMH.tabsManager.deleteTabStatus(tabId)
}
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => { CMH.tabsManager.onTabClose(tabId) })

/**
 * @name onHeadersReceived
 * @function
 * @param {object} requestDetails - Request data
 * Event on request event.
 */
CMH.tabsManager.onHeadersReceived = async (requestDetails) => {
  const securityInfo = await browser.webRequest.getSecurityInfo(requestDetails.requestId, { certificateChain: true })
  if (securityInfo.state === 'secure' || securityInfo.state === 'weak') {
    certificateFormatted = CMH.certificatesManager.formatCertificate(securityInfo.certificates)
    CMH.tabsManager.setTabCertificates(requestDetails.tabId, certificateFormatted, requestDetails.url)
  }
}
if (CMH.common.isWebExtTlsApiSupported()) {
  chrome.webRequest.onHeadersReceived.addListener(CMH.tabsManager.onHeadersReceived,
    { urls: ['https://*/*'], types: ['main_frame'] },
    ['blocking']
  )
}

/**
 * @name onTabUpdated
 * @function
 * @param {number} tabId      - Tab ID
 * @param {object} changeInfo - Tab info changed
 * @param {object} tabInfo    - Tab info
 * Event on tab update.
 */
CMH.tabsManager.onTabUpdated = (tabId, changeInfo, tabInfo) => {
  if (typeof changeInfo.url !== 'undefined') {
    CMH.tabsManager.setTabUrl(tabId, tabInfo.url)

    if (CMH.options.settings.checkOnPageLoad) {
      if ((CMH.tabsManager.tabsStatus[tabId].status === CMH.common.status.UNKNOWN) && CMH.certificatesChecker.isCheckableUrl(tabInfo.url, false)) {
        // Check on page load
        CMH.certificatesChecker.checkTab(tabInfo, !CMH.options.settings.disableNotifications)
      }
    }
  }
  if ((typeof changeInfo.status !== 'undefined') && (changeInfo.status === 'loading')) {
    // Fix browser action icon reset to default
    if (typeof CMH.tabsManager.tabsStatus[tabId] !== 'undefined') {
      CMH.ui.setStatus(CMH.tabsManager.tabsStatus[tabId].status, tabId)
    } else {
      CMH.ui.setStatus(CMH.common.status.UNKNOWN, tabId)
    }
  }
}
chrome.tabs.onUpdated.addListener(CMH.tabsManager.onTabUpdated)
