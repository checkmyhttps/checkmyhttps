/**
 * @file Options manager.
 * @author CheckMyHTTPS's team
 * @license GPL-3.0
 */

CMH.options = {}

/**
 * @name getCertUrl
 * @function
 * @param {string} url - URL to check
 * @returns {object} - fingerprints
 * Get the certificate fingerprints of an URL.
 */
CMH.options.getCertUrl = async (url) => {
    const { cert } = await CMH.certificatesManager.getCertUrl(url, true);
    return cert;
}

//Get the default checkserver's fingerprints
CMH.options.getCertUrl('https://checkmyhttps.net/').then((response) => {
  if(response != null){
    if(CMH.options.defaultCheckServer.fingerprints.sha256 != response.fingerprints.sha256){
      CMH.ui.showNotification(browser.i18n.getMessage('__defaultFingerprintsDontMatch__'));
    }
  }
  else{
    CMH.ui.showNotification(browser.i18n.getMessage('__defaultServerUnreachable__'));
  }
});

/**
 * @type {object}
 * Cache of extension options.
 */
CMH.options.settings = {
  checkOnPageLoad:               false,
  alertOnUnicodeIDNDomainNames:  true,
  disableNotifications:          false, 
  checkServerUrl:                'https://checkmyhttps.net/',
  checkServerFingerprintsSha256: '6D9BBB554CE7CD4420C26F60DD0831D40C34BB07F93E874CF631C24AB9F08F57'
}

/**
 * @type {object}
 * Default check server (CheckMyHTTPS project server).
 */
CMH.options.defaultCheckServer = {
  url: 'https://checkmyhttps.net/',
  fingerprints: {
    sha256: '6D9BBB554CE7CD4420C26F60DD0831D40C34BB07F93E874CF631C24AB9F08F57'
  }
}

// Get settings values
browser.storage.local.get(['checkOnPageLoad', 'alertOnUnicodeIDNDomainNames', 'disableNotifications', 'checkServerUrl', 'checkServerFingerprintsSha256']).then((settings) => {
  const settingsItems = Object.keys(settings)

  for (let item of settingsItems) {
    CMH.options.settings[item] = settings[item]
  }
}, (error) => { console.error(error) })

// Listen for settings changes
browser.storage.onChanged.addListener((changes, area) => {
  const changedItems = Object.keys(changes)

  for (let item of changedItems)
    CMH.options.settings[item] = changes[item].newValue
})
