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
 * Set the status of a the main frame URL of a tab.
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
 * @name initTab
 * @function
 * @param {number} tabId  - Tab ID
 * @param {boolean} force - If True, resets the values of ips, hosts and certificates in the current tabsStatus
 * Initialize 4 or reset 3 parameters in the tabStatus of a tab.
 */
CMH.tabsManager.initTab = (tabId, force) => {
  if (typeof CMH.tabsManager.tabsStatus[tabId] === 'undefined' || force) {
    if (!force) {
      CMH.tabsManager.tabsStatus[tabId] = {}
    }
    
    CMH.tabsManager.tabsStatus[tabId].ips = []
    CMH.tabsManager.tabsStatus[tabId].hosts = []
    CMH.tabsManager.tabsStatus[tabId].certificates = []

    if (!force) {
      CMH.tabsManager.tabsStatus[tabId].unique = [] // Array of array : each line represents 1 unique request when webpage loaded and contains [ip, host, certificate, status]
    }
  }
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
 * @name getIPFromDNSRequest
 * @function
 * @param {string} domain - Domain of host to check
 * @returns {string} - IP address or null
 * Get the IP address of a domain via DNS request.
 */
CMH.tabsManager.getIPFromDNSRequest = async (url) => {
  try {
    let _url = new URL(url)
    let domain = _url.hostname
    const result = await browser.dns.resolve(domain, ["disable_ipv6"])
    const ipAddress = result.addresses?.[0] || null
    return ipAddress
  } catch (error) {
    return null
  }
}


/**
 * @name processTab
 * @function
 * @param {object} tab - Tab to process
 * @param {boolean} showNotifications - Show notifications
 * Process the list of stored arrays: ips, hosts and certificates in a tab
 */
CMH.tabsManager.processTab = async (tab, showNotifications) => {
  CMH.tabsManager.initTab(tab.id)
  let url = new URL(tab.url)
  let domain = url.hostname
  if (CMH.tabsManager.tabsStatus[tab.id].lastCheckedHost === domain) // Do not check again if this host has already been. With 'Check when the page loads' setting, it prevents having to constantly check while browsing the same website.
    return

  CMH.tabsManager.tabsStatus[tab.id].lastCheckedHost = domain

  if (CMH.tabsManager.tabsStatus[tab.id].hosts.length === 0) // In case no request has been triggered, manually add the main frame url
    CMH.tabsManager.tabsStatus[tab.id].hosts.push(tab.url)
  // Build an array of unique entries
  const combined = [];
  for (let i = 0; i < CMH.tabsManager.tabsStatus[tab.id].hosts.length; i++) {
    if (!CMH.tabsManager.tabsStatus[tab.id].ips[i] || CMH.tabsManager.tabsStatus[tab.id].ips[i] === "") { // Replace null IPs
      CMH.tabsManager.tabsStatus[tab.id].ips[i] = await CMH.tabsManager.getIPFromDNSRequest(CMH.tabsManager.tabsStatus[tab.id].hosts[i])
    }
    combined.push([
      CMH.tabsManager.tabsStatus[tab.id].ips[i],
      CMH.tabsManager.tabsStatus[tab.id].hosts[i],
      CMH.tabsManager.tabsStatus[tab.id].certificates[i],
      CMH.common.status.VALID
    ]);
  }
  CMH.tabsManager.tabsStatus[tab.id].unique = [...new Set(combined.map(entry => JSON.stringify(entry)))].map(s => JSON.parse(s))
  console.log(CMH.tabsManager.tabsStatus[tab.id].unique)
 
  CMH.certificatesChecker.checkTab(tab, showNotifications, 0, CMH.tabsManager.tabsStatus[tab.id].unique[0]?.[0], CMH.tabsManager.tabsStatus[tab.id].unique[0]?.[1], CMH.tabsManager.tabsStatus[tab.id].unique[0]?.[2]) // Only checks the main frame URL (first in array)
  if (CMH.options.settings.deepInspection) {
    for (let i = 1; i < CMH.tabsManager.tabsStatus[tab.id].unique.length; i++) {
      if (CMH.certificatesChecker.checkTab(tab, false, i, CMH.tabsManager.tabsStatus[tab.id].unique[i]?.[0], CMH.tabsManager.tabsStatus[tab.id].unique[i]?.[1], CMH.tabsManager.tabsStatus[tab.id].unique[i]?.[2]) === 'stop')
        return
    }
  }
  CMH.tabsManager.initTab(tab.id, true)
}


/**
 * @name onHeadersReceived
 * @function
 * @param {object} requestDetails - Request data
 * Store ips, hosts and certificates of each request received in a tab
 */ 
CMH.tabsManager.onHeadersReceived = async (requestDetails) => {
  if (requestDetails.tabId !== -1) { // Only requests coming from a tab
    console.log("onHeadersReceived:", requestDetails.ip)
    CMH.tabsManager.initTab(requestDetails.tabId)

    const securityInfo = await browser.webRequest.getSecurityInfo(requestDetails.requestId, { certificateChain: true })
    if (securityInfo.state === 'secure' || securityInfo.state === 'weak') {
      certificateFormatted = CMH.certificatesManager.formatCertificate(securityInfo.certificates)
      CMH.tabsManager.tabsStatus[requestDetails.tabId].certificates.push(certificateFormatted)
    }

    let url = (new URL(requestDetails.url))
    CMH.tabsManager.tabsStatus[requestDetails.tabId].hosts.push(url.protocol+"//"+url.hostname)

    CMH.tabsManager.tabsStatus[requestDetails.tabId].ips.push(requestDetails.ip)
  }
}
browser.webRequest.onHeadersReceived.addListener(CMH.tabsManager.onHeadersReceived,
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
    CMH.tabsManager.initTab(tabId)
    if (CMH.options.settings.checkOnPageLoad) {
      CMH.tabsManager.processTab(tabInfo, !CMH.options.settings.disableNotifications)
    }
    if (CMH.tabsManager.tabsStatus[tabId].status !== undefined && CMH.tabsManager.tabsStatus[tabId].lastCheckedHost === (new URL(tabInfo.url)).hostname) {
      CMH.ui.setStatus(CMH.tabsManager.tabsStatus[tabId].status, tabId) // Page has already been checked, display its status logo again if page was reloaded     
    }
  }
}
browser.tabs.onUpdated.addListener(CMH.tabsManager.onTabUpdated)
