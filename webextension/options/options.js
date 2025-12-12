/**
 * @file Options.
 * @author CheckMyHTTPS's team
 * @license GPL-3.0
 */

const box_pageLoad           = document.querySelector('input[name="checkOnPageLoad"]')
const box_alertIDNDomains    = document.querySelector('input[name="alertOnUnicodeIDNDomainNames"]')
const helpbtn                = document.getElementById("help-btn")
const box_notifications      = document.querySelector('input[name="disableNotifications"]')
const txt_server             = document.querySelector('input[name="api_server"]')
const txt_publicKey          = document.querySelector('textarea[name="api_publicKey"]')
const btn_save               = document.getElementById('form-submit')
const btn_restoreDefault     = document.getElementById('restore-default')
const btn_getPublicKey       = document.getElementById('get-publicKey')
const div_messageCheckServer = document.querySelector('p.message-checkserver')


browser.runtime.getBackgroundPage().then((backgroundPage) => {
  const CMH = backgroundPage.CMH

  document.querySelector('body > h1').textContent                                 = browser.i18n.getMessage('__checkMyHttpsSettings__')
  document.querySelector('div.form > h2:nth-of-type(1)').textContent              = browser.i18n.getMessage('__general__')
  document.querySelector('div.form > h2:nth-of-type(2)').textContent              = browser.i18n.getMessage('__checkServerSettings__')
  document.querySelector('label[for="checkOnPageLoad"]').textContent              = browser.i18n.getMessage('__checkOnPageLoad__')
  document.querySelector('label[for="alertOnUnicodeIDNDomainNames"]').textContent = browser.i18n.getMessage('__alertOnUnicodeIDNDomainNames__')
  document.querySelector('label[for="disableNotifications"]').textContent         = browser.i18n.getMessage('__disableNotifications__')
  document.querySelector('label[for="api_server"]').textContent                   = browser.i18n.getMessage('__checkServerAddress__')
	document.querySelector('label[for="api_publicKey"]').textContent                = browser.i18n.getMessage('__checkServerPublicKey__')
  btn_save.textContent           = browser.i18n.getMessage('__save__')
  btn_restoreDefault.textContent = browser.i18n.getMessage('__restoreDefault__')
  btn_getPublicKey.textContent   = browser.i18n.getMessage('__getPublicKey__')

  box_pageLoad.checked = CMH.options.settings.checkOnPageLoad
  box_alertIDNDomains.checked = CMH.options.settings.alertOnUnicodeIDNDomainNames
  helpbtn.onclick = function() {
    browser.tabs.create({ url: "https://wikipedia.org/wiki/IDN_homograph_attack" })
  };
  helpbtn.title = browser.i18n.getMessage('__infoUnicodeIDNDomainNames__');
  box_notifications.checked = CMH.options.settings.disableNotifications
  txt_server.value = CMH.options.settings.checkServerUrl
  txt_publicKey.value = CMH.options.settings.publicKey

  let lastDomainSaved  = CMH.options.settings.checkServerUrl.match(/^https:\/\/([^:\/\s]+)/)[1]

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
        checkServerUrl: txt_server.value,
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

    const isValidCheckServer = await CMH.options.verifyServerAtStartup(txt_server.value, txt_publicKey.value, "nostartup")
    if (isValidCheckServer.error === undefined) {
      saveSettingsToBrowser()
    } else {
      btn_save.disabled = false
      div_messageCheckServer.dataset.type = 'error'
      if (isValidCheckServer.error.includes('CHECK_SERVER_ERROR'))
      {
        parts = isValidCheckServer.error.split('.')
        error = parts[parts.length - 1]
        isValidCheckServer.error = 'CHECK_SERVER_ERROR'
      }
      switch (isValidCheckServer.error) {
        case 'PUBLIC_KEY':
          div_messageCheckServer.textContent = browser.i18n.getMessage('__invalidPublicKeyInOptions__')
          break;
        case 'CHECK_SERVER_UNREACHABLE':
          div_messageCheckServer.textContent = browser.i18n.getMessage('__checkServerUnreachable__')
          break;
        case 'CHECK_SERVER_ERROR':
          div_messageCheckServer.textContent = browser.i18n.getMessage('__checkServerError__', error)
          break;
        case 'SIGNATURE':
          div_messageCheckServer.textContent = browser.i18n.getMessage('__invalidServerSignature__')
          break;
        case 'UNKNOWN_ISSUE':
          div_messageCheckServer.textContent = browser.i18n.getMessage('__unknownIssue__');
          break;
        default:
          div_messageCheckServer.textContent = 'Error!'
          break;
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

    CMH.api.sendRequest(txt_server.value+'download/public_key').then(reponse => {
      btn_getPublicKey.disabled = false
      if (reponse.error === undefined) {
        txt_publicKey.value = reponse.data.slice(0,-1)
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