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
    CMH.tabsManager.tabsStatus[tabId] = {}
  }

  const newUrl = CMH.common.parseURL(url)
  
  CMH.tabsManager.tabsStatus[tabId].host = newUrl.host
  CMH.tabsManager.tabsStatus[tabId].port = newUrl.port
}


/**
 * @name setTabCertificates
 * @function
 * @param {number} tabId        - Tab ID
 * @param {number} certificates - Current certificates
 * @param {string} [url]        - Tab URL
 * Set the certificates of a tab.
 */
CMH.tabsManager.setTabCertificates = (tabId, certificates, url) => {
  if (typeof CMH.tabsManager.tabsStatus[tabId] === 'undefined') {
    CMH.tabsManager.tabsStatus[tabId] = {}
  }

  if (typeof url !== 'undefined') {
    CMH.tabsManager.setTabUrl(tabId, url)
  }
  CMH.tabsManager.tabsStatus[tabId].certificates = certificates
}


/**
 * @name setTabIp
 * @function
 * @param {number} tabId    - Tab ID
 * @param {string} ip       - Current IP address
 * @param {string} [url]    - Tab URL
 * Set the IP address of a tab.
 */
CMH.tabsManager.setTabIp = (tabId, ip) => {
  if (typeof CMH.tabsManager.tabsStatus[tabId] === 'undefined') {
    CMH.tabsManager.tabsStatus[tabId] = {}
  }

  CMH.tabsManager.tabsStatus[tabId].ip = ip
}


/**
 * @name getTabCertificate
 * @function
 * @param {number} tabId - Tab ID
 * @returns {object} - certificates chain
 * Get the certificate of a tab.
 */
CMH.tabsManager.getTabCertificate = (tabId) => {
  if ((typeof CMH.tabsManager.tabsStatus[tabId] === 'undefined') || (typeof CMH.tabsManager.tabsStatus[tabId].certificates === 'undefined')) {
    return null
  }
  return CMH.tabsManager.tabsStatus[tabId].certificates
}


/**
 * @name getTabIp
 * @function
 * @param {number} tabId - Tab ID
 * @returns {string} - IP address
 * Get the IP address of a tab.
 */
CMH.tabsManager.getTabIp = (tabId) => {
  if ((typeof CMH.tabsManager.tabsStatus[tabId] === 'undefined') || (typeof CMH.tabsManager.tabsStatus[tabId].ip === 'undefined') || CMH.tabsManager.tabsStatus[tabId].ip == null) {
    return ""
  }
  return CMH.tabsManager.tabsStatus[tabId].ip
}


/**
 * @name onTabClose
 * @function
 * @param {number} tabId - Tab ID
 * Event on tab close.
 */
CMH.tabsManager.onTabClose = (tabId) => {
  CMH.tabsManager.deleteTabStatus(tabId)
}
browser.tabs.onRemoved.addListener((tabId) => { CMH.tabsManager.onTabClose(tabId) })


/**
 * @name onHeadersReceived
 * @function
 * @param {object} requestDetails - Request data
 * Store certificates of each request received from main frame.
 */
CMH.tabsManager.onHeadersReceived = async (requestDetails) => {
  CMH.tabsManager.setTabIp(requestDetails.tabId, requestDetails.ip)

  const securityInfo = await browser.webRequest.getSecurityInfo(requestDetails.requestId, { certificateChain: true })
  if (securityInfo.state === 'secure' || securityInfo.state === 'weak') {
    certificateFormatted = CMH.certificatesManager.formatCertificate(securityInfo.certificates)
    CMH.tabsManager.setTabCertificates(requestDetails.tabId, certificateFormatted, requestDetails.url)
  }
}
browser.webRequest.onHeadersReceived.addListener(CMH.tabsManager.onHeadersReceived,
  { urls: ['https://*/*'], types: ['main_frame'] },
  ['blocking']
)


/**
 * @name onHeadersReceivedForIp
 * @function
 * @param {object} requestDetails - Request data
 * When event, setTabIp when originUrl hostname and real request hostname same
 * Get ip event when ip not in main_frame
 */ 
CMH.tabsManager.onHeadersReceivedForIp = async (requestDetails) => {
  if (typeof CMH.tabsManager.tabsStatus[requestDetails.tabId] === 'undefined') {
    if (CMH.tabsManager.tabsStatus[requestDetails.tabId].host == (new URL(requestDetails.url)).hostname) {
      if (CMH.tabsManager.tabsStatus[requestDetails.tabId].ip != requestDetails.ip) {
        CMH.tabsManager.setTabIp(requestDetails.tabId, requestDetails.ip)
      }
    }
  }
}
browser.webRequest.onHeadersReceived.addListener(CMH.tabsManager.onHeadersReceivedForIp,
  { urls: ['https://*/*'] },
  ['blocking']
)


/**
 * @name onTabUpdated
 * @function
 * @param {number} tabId      - Tab ID
 * @param {object} changeInfo - Tab info changed
 * @param {object} tabInfo    - Tab info
 * Event on tab update.
 */
CMH.tabsManager.onTabUpdated = (tabId, changeInfo, tabInfo) => {
  if (typeof changeInfo.url !== 'undefined' && !changeInfo.url.includes("about:") && !changeInfo.url.includes("moz-extension:")) {
    CMH.tabsManager.setTabUrl(tabId, tabInfo.url)
    if (CMH.options.settings.checkOnPageLoad) {
      if (CMH.tabsManager.tabsStatus[tabId].status === undefined) {
        // Check on page load
        CMH.tabsManager.tabsStatus[tabId].status = -1 // Set a default status so pages that already got checked don't show the same notification again
        CMH.certificatesChecker.checkTab(tabInfo, !CMH.options.settings.disableNotifications)
      } else if (CMH.tabsManager.tabsStatus[tabId].status !== -1) {
        CMH.ui.setStatus(CMH.tabsManager.tabsStatus[tabId].status, tabId) // Page has already been checked, display its status logo again if page was reloaded
      }
    }
  }
}
browser.tabs.onUpdated.addListener(CMH.tabsManager.onTabUpdated)