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
/*CMH.tabsManager.setTabUrl = (tabId, url) => {
  if (typeof CMH.tabsManager.tabsStatus[tabId] === 'undefined') {
    CMH.tabsManager.tabsStatus[tabId] = {}
  }

  const newUrl = CMH.common.parseURL(url)
  
  CMH.tabsManager.tabsStatus[tabId].lastHost = CMH.tabsManager.tabsStatus[tabId].host
  //CMH.tabsManager.tabsStatus[tabId].host = newUrl.host
  CMH.tabsManager.tabsStatus[tabId].port = newUrl.port
}*/


/**
 * @name setTabCertificates
 * @function
 * @param {number} tabId        - Tab ID
 * @param {number} certificates - Current certificates
 * @param {string} [url]        - Tab URL
 * Set the certificates of a tab.
 */
/*CMH.tabsManager.setTabCertificates = (tabId, certificates, url) => {
  if (typeof CMH.tabsManager.tabsStatus[tabId] === 'undefined') {
    CMH.tabsManager.tabsStatus[tabId] = {}
  }

  if (typeof url !== 'undefined') {
    CMH.tabsManager.setTabUrl(tabId, url)
  }
}*/


/**
 * @name setTabIp
 * @function
 * @param {number} tabId    - Tab ID
 * @param {string} ip       - Current IP address
 * @param {string} [url]    - Tab URL
 * Set the IP address of a tab.
 */
CMH.tabsManager.setTabIp = (tabId) => {
  if (typeof CMH.tabsManager.tabsStatus[tabId] === 'undefined') {
    CMH.tabsManager.tabsStatus[tabId] = {}
    
    CMH.tabsManager.tabsStatus[tabId].ips = []
    CMH.tabsManager.tabsStatus[tabId].hosts = []
    CMH.tabsManager.tabsStatus[tabId].certificates = []
  }
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
/*CMH.tabsManager.getTabIp = (tabId) => {
  if ((typeof CMH.tabsManager.tabsStatus[tabId] === 'undefined') || (typeof CMH.tabsManager.tabsStatus[tabId].ip === 'undefined') || CMH.tabsManager.tabsStatus[tabId].ip == null) {
    return ""
  }
  return CMH.tabsManager.tabsStatus[tabId].ip
}*/


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
/*CMH.tabsManager.onHeadersReceived = async (requestDetails) => {
  //CMH.tabsManager.tabsStatus[requestDetails.tabId].lastHost = (new URL(requestDetails.url)).hostname
  if ( (typeof CMH.tabsManager.tabsStatus[requestDetails.tabId] === 'undefined') || (CMH.tabsManager.tabsStatus[requestDetails.tabId].ip !== requestDetails.ip) ) {
    CMH.tabsManager.setTabIp(requestDetails.tabId, requestDetails.ip)
    console.log("setTabIp from onHeadersReceived:", requestDetails.ip)

    const securityInfo = await browser.webRequest.getSecurityInfo(requestDetails.requestId, { certificateChain: true })
    if (securityInfo.state === 'secure' || securityInfo.state === 'weak') {
      certificateFormatted = CMH.certificatesManager.formatCertificate(securityInfo.certificates)
      CMH.tabsManager.setTabCertificates(requestDetails.tabId, certificateFormatted, requestDetails.url)
    }
  }
}*/
//browser.webRequest.onHeadersReceived.addListener(CMH.tabsManager.onHeadersReceived,
  //{ urls: ['https://*/*'], types: ['main_frame'] },
  //['blocking']
//)


/**
 * @name onHeadersReceivedForIp
 * @function
 * @param {object} requestDetails - Request data
 * When event, setTabIp when originUrl hostname and real request hostname same
 * Get ip event when ip not in main_frame
 */ 
CMH.tabsManager.onHeadersReceivedForIp = async (requestDetails) => {
  if (requestDetails.tabId !== -1) { // Only requests coming from a tab
    console.log("onHeadersReceivedForIp:", requestDetails.ip)
    CMH.tabsManager.setTabIp(requestDetails.tabId)

    const securityInfo = await browser.webRequest.getSecurityInfo(requestDetails.requestId, { certificateChain: true })
    if (securityInfo.state === 'secure' || securityInfo.state === 'weak') {
      certificateFormatted = CMH.certificatesManager.formatCertificate(securityInfo.certificates)
      CMH.tabsManager.tabsStatus[requestDetails.tabId].certificates.push(certificateFormatted)
    }

    CMH.tabsManager.tabsStatus[requestDetails.tabId].hosts.push((new URL(requestDetails.url)).hostname)

    CMH.tabsManager.tabsStatus[requestDetails.tabId].ips.push(requestDetails.ip)
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
    CMH.tabsManager.setTabIp(tabId)
    if (CMH.options.settings.checkOnPageLoad) {
      CMH.certificatesChecker.checkTab(tabInfo, !CMH.options.settings.disableNotifications)
    }
    if (CMH.tabsManager.tabsStatus[tabId].status !== undefined && CMH.tabsManager.tabsStatus[tabId].lastCheckedHost === (new URL(tabInfo.url)).hostname) {
      CMH.ui.setStatus(CMH.tabsManager.tabsStatus[tabId].status, tabId) // Page has already been checked, display its status logo again if page was reloaded     
    }
  }
}
browser.tabs.onUpdated.addListener(CMH.tabsManager.onTabUpdated)
