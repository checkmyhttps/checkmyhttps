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
const txt_publicKey              = document.querySelector('input[name="api_publicKey"]')
const lbl_publicKey              = document.querySelector('label[for="api_publicKey"]')
const btn_save                   = document.getElementById('form-submit')
const btn_restoreDefault         = document.getElementById('restore-default')
const btn_getPublicKey           = document.getElementById('get-publicKey')
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
	lbl_publicKey.textContent               = browser.i18n.getMessage('__checkServerPublicKey__')
  btn_save.textContent                 = browser.i18n.getMessage('__save__')
  btn_restoreDefault.textContent       = browser.i18n.getMessage('__restoreDefault__')
  btn_getPublicKey.textContent      = browser.i18n.getMessage('__getPublicKey__')

  box_pageLoad.checked = CMH.options.settings.checkOnPageLoad
  box_alertIDNDomains.checked = CMH.options.settings.alertOnUnicodeIDNDomainNames
  box_notifications.checked = CMH.options.settings.disableNotifications
  lastDomainSaved  = CMH.options.settings.checkServerUrl.match(/^https:\/\/([^:\/\s]+)/)[1]
  txt_server.value = CMH.options.settings.checkServerUrl
  txt_publicKey.value = CMH.options.settings.publicKey

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
        publicKey: txt_publicKey.value
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
      isValidCheckServer = await CMH.options.verifyServerAtStartup(txt_server.value, txt_publicKey.value)
      if (isValidCheckServer === 1) {
        saveSettingsToBrowser()
      } else {
        btn_save.disabled = false
        div_messageCheckServer.dataset.type = 'error'
        switch (isValidCheckServer) {
          case -1:
            div_messageCheckServer.textContent  = browser.i18n.getMessage('__serverUnreachable__')
            break;
          case -2:
            div_messageCheckServer.textContent  = browser.i18n.getMessage('__invalidPublicKeyInOptions__')
            break;
          case 0:
            div_messageCheckServer.textContent  = browser.i18n.getMessage('__publicKeyNotCorresponding__')
            break;
          default:
            div_messageCheckServer.textContent  = 'Error!'
            break;
        }
      }
    }
  }, true)

  btn_restoreDefault.addEventListener('click', (event) => {
    const defaultCheckServer = CMH.options.defaultCheckServer
    if (defaultCheckServer !== null) {
      txt_server.value = defaultCheckServer.url
      txt_publicKey.value = defaultCheckServer.publicKey
      btn_getPublicKey.style.display = 'none'
    }
  }, true)

  btn_getPublicKey.addEventListener('click', (event) => {
    btn_getPublicKey.disabled = true
    div_messageCheckServer.textContent = ''
    if (txt_server.value.slice(-1) !== '/') {
      txt_server.value += '/'
    }

    CMH.certificatesManager.getCertUrl(txt_server.value+'download/public_key').then((response) => {
      btn_getPublicKey.disabled = false
      if (response.data !== null) {
        txt_publicKey.value = response.data
        btn_getPublicKey.style.display = 'none'
      } else {
        div_messageCheckServer.dataset.type = 'error'
        div_messageCheckServer.textContent  = browser.i18n.getMessage('__publicKeyUnreachable__')
      }
    })
  }, true)
  
  const onPublicKeyChange = () => {
    if (txt_publicKey.value.length === 0) {
      btn_getPublicKey.style.display = ''
    } else {
      btn_getPublicKey.style.display = 'none'
    }
  }
  txt_publicKey.addEventListener('keyup', onPublicKeyChange, true)
  txt_server.addEventListener('keyup', () => {
    const domainMatch = txt_server.value.match(/^https:\/\/([^:\/\s]+)/)
    if (domainMatch && (domainMatch[1] !== lastDomainSaved)) {
      txt_publicKey.value = ''
      btn_getPublicKey.style.display = ''
    }
  }, true)

  onPublicKeyChange()
  btn_save.disabled = false

  document.body.style.display = ''
}, (error) => { console.error(`Error: ${error}`) })
