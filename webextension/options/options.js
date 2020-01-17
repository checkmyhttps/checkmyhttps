/**
 * @file Common file.
 * @author CheckMyHTTPS's team
 * @license GPL-3.0
 */

const page_title                 = document.querySelector('body > h1')
const title_general              = document.querySelector('div.form > h2:nth-of-type(1)')
const title_checkServer          = document.querySelector('div.form > h2:nth-of-type(2)')
const box_pageLoad               = document.querySelector('input[name="checkOnPageLoad"]')
const lbl_pageLoad               = document.querySelector('label[for="checkOnPageLoad"]')
const box_alertIDNDomains        = document.querySelector('input[name="alertOnUnicodeIDNDomainNames"]')
const lbl_alertIDNDomains        = document.querySelector('label[for="alertOnUnicodeIDNDomainNames"]')
const box_notifications          = document.querySelector('input[name="disableNotifications"]')
const lbl_notifications          = document.querySelector('label[for="disableNotifications"]')
const txt_server                 = document.querySelector('input[name="api_server"]')
const lbl_server                 = document.querySelector('label[for="api_server"]')
const txt_sha256                 = document.querySelector('input[name="api_sha256"]')
const lbl_sha256                 = document.querySelector('label[for="api_sha256"]')
const btn_save                   = document.getElementById('form-submit')
const btn_restoreDefault         = document.getElementById('restore-default')
const btn_getFingerprints        = document.getElementById('get-fingerprints')
const div_messageCheckServer     = document.querySelector('p.message-checkserver')


browser.runtime.getBackgroundPage().then((backgroundPage) => {
  const CMH = backgroundPage.CMH

  let lastDomainSaved = ''

  document.title                       = browser.i18n.getMessage('__checkMyHttpsSettings__')
  page_title.textContent               = browser.i18n.getMessage('__checkMyHttpsSettings__')
  title_general.textContent            = browser.i18n.getMessage('__general__')
  title_checkServer.textContent        = browser.i18n.getMessage('__checkServerSettings__')
  lbl_pageLoad.textContent             = browser.i18n.getMessage('__checkOnPageLoad__')
  lbl_alertIDNDomains.textContent      = browser.i18n.getMessage('__alertOnUnicodeIDNDomainNames__')
  lbl_notifications.textContent        = browser.i18n.getMessage('__disableNotifications__')
  lbl_server.textContent               = browser.i18n.getMessage('__checkServerAddress__')
  lbl_sha256.textContent               = browser.i18n.getMessage('__checkServerSha256__')
  btn_save.textContent                 = browser.i18n.getMessage('__save__')
  btn_restoreDefault.textContent       = browser.i18n.getMessage('__restoreDefault__')
  btn_getFingerprints.textContent      = browser.i18n.getMessage('__getFingerprints__')

  box_pageLoad.checked = CMH.options.settings.checkOnPageLoad
  box_alertIDNDomains.checked = CMH.options.settings.alertOnUnicodeIDNDomainNames
  box_notifications.checked = CMH.options.settings.disableNotifications
  lastDomainSaved  = CMH.options.settings.checkServerUrl.match(/^https:\/\/([^:\/\s]+)/)[1]
  txt_server.value = CMH.options.settings.checkServerUrl
  txt_sha256.value = CMH.options.settings.checkServerFingerprintsSha256

  box_pageLoad.addEventListener('input', (e) => {
    browser.storage.local.set({
      checkOnPageLoad: box_pageLoad.checked,
    }).then(() => {
      div_messageCheckServer.dataset.type = 'success'
      div_messageCheckServer.textContent  = browser.i18n.getMessage('__settingsSaved__')
    }, (error) => {
      div_messageCheckServer.dataset.type = 'error'
      div_messageCheckServer.textContent  = 'Error!'
    })
  })

  box_alertIDNDomains.addEventListener('input', (e) => {
    browser.storage.local.set({
      alertOnUnicodeIDNDomainNames: box_alertIDNDomains.checked,
    }).then(() => {
      div_messageCheckServer.dataset.type = 'success'
      div_messageCheckServer.textContent  = browser.i18n.getMessage('__settingsSaved__')
    }, (error) => {
      div_messageCheckServer.dataset.type = 'error'
      div_messageCheckServer.textContent  = 'Error!'
    })
  })

  box_notifications.addEventListener('input', (e) => {
    browser.storage.local.set({
      disableNotifications: box_notifications.checked,
    }).then(() => {
      div_messageCheckServer.dataset.type = 'success'
      div_messageCheckServer.textContent  = browser.i18n.getMessage('__settingsSaved__')
    }, (error) => {
      div_messageCheckServer.dataset.type = 'error'
      div_messageCheckServer.textContent  = 'Error!'
    })
  })

  btn_save.addEventListener('click', async (event) => {
    btn_save.disabled = true
    div_messageCheckServer.textContent = ''
    if (txt_server.value.slice(-1) !== '/') {
      txt_server.value += '/'
    }

    const saveSettingsToBrowser = () => {
      browser.storage.local.set({
        checkServerUrl:                txt_server.value,
        checkServerFingerprintsSha256: txt_sha256.value.replace(/:/g, '').toUpperCase()
      }).then(() => {
        btn_save.disabled = false
        div_messageCheckServer.dataset.type = 'success'
        div_messageCheckServer.textContent  = browser.i18n.getMessage('__settingsSaved__')
      }, (error) => {
        btn_save.disabled = false
        div_messageCheckServer.dataset.type = 'error'
        div_messageCheckServer.textContent  = 'Error!'
      })
    }

    if (CMH.common.isWebExtTlsApiSupported()) {
      isValidCheckServer = await CMH.api.checkCheckServerApi({
        server: txt_server.value,
        sha256: txt_sha256.value.replace(/:/g, '').toUpperCase()
      })
      if (isValidCheckServer) {
        saveSettingsToBrowser()
      } else {
        btn_save.disabled = false
        div_messageCheckServer.dataset.type = 'error'
        div_messageCheckServer.textContent  = 'Error!'
      }
    }
  }, true)

  btn_restoreDefault.addEventListener('click', (event) => {
    const defaultCheckServer = CMH.options.defaultCheckServer
    if (defaultCheckServer !== null) {
      txt_server.value = defaultCheckServer.url
      txt_sha256.value = defaultCheckServer.fingerprints.sha256
      btn_getFingerprints.style.display = 'none'
    }
  }, true)

  btn_getFingerprints.addEventListener('click', (event) => {
    btn_getFingerprints.disabled = true
    div_messageCheckServer.textContent = ''
    if (txt_server.value.slice(-1) !== '/') {
      txt_server.value += '/'
    }

    CMH.options.getCertUrl(txt_server.value).then((response) => {
      btn_getFingerprints.disabled = false
      if (response.fingerprints !== null) {
        txt_sha256.value = response.fingerprints.sha256
        btn_getFingerprints.style.display = 'none'
      } else {
        div_messageCheckServer.dataset.type = 'error'
        div_messageCheckServer.textContent  = 'Error!'
      }
    })
  }, true)

  txt_sha256.addEventListener('blur', () => {
    txt_sha256.value = txt_sha256.value.replace(/:/g, '').toUpperCase()
  }, true)
  const onFingerprintChange = () => {
    if (txt_sha256.value.length === 0) {
      btn_getFingerprints.style.display = ''
    } else {
      btn_getFingerprints.style.display = 'none'
    }
  }
  txt_sha256.addEventListener('keyup', onFingerprintChange, true)
  txt_server.addEventListener('keyup', () => {
    const domainMatch = txt_server.value.match(/^https:\/\/([^:\/\s]+)/)
    if (domainMatch && (domainMatch[1] !== lastDomainSaved)) {
      txt_sha256.value = ''
      btn_getFingerprints.style.display = ''
    }
  }, true)

  onFingerprintChange()
  btn_save.disabled = false

  document.body.style.display = ''
}, (error) => { console.error(`Error: ${error}`) })
