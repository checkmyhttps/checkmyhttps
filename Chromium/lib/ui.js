/**
 * @file UI manager.
 * @author CheckMyHTTPS's team
 * @license GPL-3.0
 */

CMH.ui = {}

/**
 * @name setStatus
 * @function
 * @param {number} status - Tab check status
 * @param {number} tabId  - Tab ID
 * Set status of the action button.
 */
CMH.ui.setStatus = (status, tabId) => {
  if (CMH.common.isDesktopPlatform()) {
    let details = { path: `./images/${CMH.common.statusCode[status]}.png` }
    if ((typeof tabId !== 'undefined') && (tabId !== null)) {
      details.tabId = tabId
    }
    chrome.action.setIcon(details)
    chrome.action.setTitle({tabId: tabId, title: chrome.i18n.getMessage(`__${CMH.common.statusCode[status]}__`)})
  } else {
    let details = { title: 'CheckMyHTTPS (' + chrome.i18n.getMessage(`__${CMH.common.statusCode[status]}__`) + ')' }
    if ((typeof tabId !== 'undefined') && (tabId !== null)) {
      details.tabId = tabId
    }
    chrome.action.setTitle(details)
  }
}


/**
 * @name openOptionsPageListener
 * @function
 * Open the options page if the user clicks on a notification concerned with it.
 * For now, only the "Invalid Public Key" notification redirects to this page.
 */
CMH.ui.openOptionsPageListener = () => {
  if (CMH.ui.openOptionsPage === 1) {
    const tabs = document.querySelectorAll("[data-tab-target]")
    const tabContents = document.querySelectorAll("[data-tab-content]")

    tabs.forEach(tab => {
      const target = document.querySelector(tab.dataset.tabTarget)

      tabContents.forEach(tabContent => {
        tabContent.classList.remove("active")
      })

      tabs.forEach(tab => {
        tab.classList.remove("active")
      })

      tab.classList.add("active")
      target.classList.add("active")
    })
  }
}


/**
 * @name openIDNInfoLinkPageListener
 * @function
 * Open the wikipedia IDN homograph attack page if the user clicks on IDNWarning notification.
 */
CMH.ui.openIDNInfoLinkPageListener = () => {
  if (CMH.ui.openIDNInfoLinkPage === 1) {
    chrome.tabs.create({ url: "https://wikipedia.org/wiki/IDN_homograph_attack" })
  }
}


/**
 * @name showNotification
 * @function
 * @param {string} message - Message
 * @param {object} options - Options
 * Show a notification.
 */
CMH.ui.showNotification = (message, options) => {
  CMH.ui.openOptionsPage = 0
  let notificationOptions = {
    type:     'basic',
    iconUrl:  chrome.runtime.getURL('./images/icon.png'),
    title:    chrome.i18n.getMessage('__alertTitle__'),
    message:  message,
    priority: 1
  }
  if (typeof options !== 'undefined') {
    for (option of ['title', 'message', 'priority']) {
      if (options.hasOwnProperty(option)) {
        notificationOptions[option] = options[option]
      }
    }
    if (options.hasOwnProperty('openOptionsPage') && options['openOptionsPage'] === 1)
      CMH.ui.openOptionsPage = 1
    if (options.hasOwnProperty('openIDNInfoLinkPage') && options['openIDNInfoLinkPage'] === 1)
      CMH.ui.openIDNInfoLinkPage = 1
  }

  chrome.notifications.create('cakeNotification', notificationOptions, () => {
    setTimeout(() => {
        chrome.notifications.clear('cakeNotification');
    }, 5000);
  })

  // Listener to open the options page or link, if the user clicks on a corresponding notification (Ex: "Invalid Public Key")
  chrome.notifications.onClicked.addListener(CMH.ui.openOptionsPageListener)
  chrome.notifications.onClicked.addListener(CMH.ui.openIDNInfoLinkPageListener)
}