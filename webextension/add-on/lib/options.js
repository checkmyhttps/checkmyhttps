CMH.options = {}

/**
 * @type {object}
 * Cache of extension options.
 */
CMH.options.settings = {
  checkOnPageLoad:               false,
  alertOnUnicodeIDNDomainNames:  true,
  checkServerUrl:                'https://checkmyhttps.net/',
  checkServerFingerprintsSha1:   'FF33641253DAA21E6C5CADEBF15430B2B7E498E6',
  checkServerFingerprintsSha256: '889F63E8E7F98F67E35750591CD66BC32A17A4B4FA2A44763DBEF8D756156165'
}

/**
 * @type {object}
 * Default check server (CheckMyHTTPS project server).
 */
CMH.options.defaultCheckServer = {
  url: 'https://checkmyhttps.net/',
  fingerprints: {
    sha1:   'FF33641253DAA21E6C5CADEBF15430B2B7E498E6',
    sha256: '889F63E8E7F98F67E35750591CD66BC32A17A4B4FA2A44763DBEF8D756156165'
  }
}

/**
 * @name getCertUrl
 * @function
 * @param {string} url - URL to check
 * Get the certificate of an URL (send request to native app).
 */
CMH.options.getCertUrl = (url) => {
  CMH.native.port.postMessage({'action': 'getFingerprints', 'params': { 'url': url }})
}

// Get settings values
browser.storage.local.get(['checkOnPageLoad', 'alertOnUnicodeIDNDomainNames', 'checkServerUrl', 'checkServerFingerprintsSha1', 'checkServerFingerprintsSha256']).then((settings) => {
  const settingsItems = Object.keys(settings)

  for (let item of settingsItems) {
    CMH.options.settings[item] = settings[item]
  }
}, (error) => { console.log(error) })

// Listen for settings changes
browser.storage.onChanged.addListener((changes, area) => {
  const changedItems = Object.keys(changes)
  let needRefreshNativeApp = false

  for (let item of changedItems) {
    CMH.options.settings[item] = changes[item].newValue
    if ((!needRefreshNativeApp) && (['checkServerUrl', 'checkServerFingerprintsSha1', 'checkServerFingerprintsSha256'].includes(item))) {
      needRefreshNativeApp = true
    }
  }

  if (needRefreshNativeApp) {
    CMH.native.port.postMessage({'action': 'setOptions', 'params': {
      checkServerUrl:                CMH.options.settings.checkServerUrl,
      checkServerFingerprintsSha1:   CMH.options.settings.checkServerFingerprintsSha1,
      checkServerFingerprintsSha256: CMH.options.settings.checkServerFingerprintsSha256
    }})
  }
})
