CMH.tabsManager = {}


/**
 * @type {object}
 * Check status of tabs.
 */
CMH.tabsManager.tabsStatus = {}

/**
 * @name setTabStatus
 * @function
 * @param {object} tab    - Tab
 * @param {number} status - Check status
 * Set the status of a tab.
 */
CMH.tabsManager.setTabStatus = (tab, status) => {
  const urlParsed = CMH.common.parseURL(tab.url)
  CMH.tabsManager.tabsStatus[tab.id] = {
    status: status,
    host:   urlParsed.host,
    port:   urlParsed.port
  }
  CMH.ui.setStatus(status/*, tab.id*/)
}

/**
 * @name deleteTabStatus
 * @function
 * @param {object} tabId - Tab ID
 * Delete the status of a tab.
 */
CMH.tabsManager.deleteTabStatus = (tabId) => {
  if (typeof CMH.tabsManager.tabsStatus[tabId] !== 'undefined') {
    delete CMH.tabsManager.tabsStatus[tabId]
  }
  CMH.ui.setStatus(CMH.common.status.UNKNOWN/*, tabId*/)
}

/**
 * @name onTabActivate
 * @function
 * @param {object} tabId - Tab ID
 * Event on tab switch.
 */
CMH.tabsManager.onTabActivate = (tabId) => {
  if (typeof CMH.tabsManager.tabsStatus[tabId] !== 'undefined') {
    CMH.ui.setStatus(CMH.tabsManager.tabsStatus[tabId].status/*, tabId*/)
  } else {
    CMH.ui.setStatus(CMH.common.status.UNKNOWN/*, tabId*/)
  }
}
browser.tabs.onActivated.addListener((activeInfo) => { CMH.tabsManager.onTabActivate(activeInfo.tabId) })

/**
 * @name onTabClose
 * @function
 * @param {object} tabId - Tab ID
 * Event on tab close.
 */
CMH.tabsManager.onTabClose = (tabId) => {
  CMH.tabsManager.deleteTabStatus(tabId)
}
browser.tabs.onRemoved.addListener((tabId, removeInfo) => { CMH.tabsManager.onTabClose(tabId) })

/**
 * @name onRequest
 * @function
 * @param {object} requestDetails - Request data
 * Event on request event.
 */
CMH.tabsManager.onRequest = (requestDetails) => {
  if ((typeof requestDetails.originUrl === 'undefined') && (typeof requestDetails.initiator !== 'undefined')) { // Chrome/Opera compatibility
    requestDetails.originUrl = requestDetails.initiator
  }
  if (typeof requestDetails.originUrl === 'undefined') {
    if (CMH.options.settings.checkOnPageLoad) {
      // Check on page load
      CMH.certificatesChecker.checkTab({ id: requestDetails.tabId, url: requestDetails.url }, true)
    } else {
      // Host has changed
      CMH.tabsManager.deleteTabStatus(requestDetails.tabId)
    }
  } else {
    newUrl = CMH.common.parseURL(requestDetails.url)
    oldUrl = CMH.common.parseURL(requestDetails.originUrl)
    if ((newUrl.host !== oldUrl.host) || (newUrl.port !== oldUrl.port)) {
      if (CMH.options.settings.checkOnPageLoad) {
        // Check on page load
        CMH.certificatesChecker.checkTab({ id: requestDetails.tabId, url: requestDetails.url }, true)
      } else {
        // Host has changed
        CMH.tabsManager.deleteTabStatus(requestDetails.tabId)
      }
    }
  }
}
browser.webRequest.onBeforeRequest.addListener(CMH.tabsManager.onRequest,
  { urls: ['https://*/*'], types: ['main_frame'] }
)
