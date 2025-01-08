/**
 * @file Common file.
 * @author CheckMyHTTPS's team
 * @license GPL-3.0
 */

const page_title                 = document.getElementById('options-title');
const title_general              = document.querySelector('div.form > h2:nth-of-type(1)');
const title_checkServer          = document.querySelector('div.form > h2:nth-of-type(2)');
const box_pageLoad               = document.querySelector('input[name="checkOnPageLoad"]');
const lbl_pageLoad               = document.querySelector('label[for="checkOnPageLoad"]');
const box_alertIDNDomains        = document.querySelector('input[name="alertOnUnicodeIDNDomainNames"]');
const lbl_alertIDNDomains        = document.querySelector('label[for="alertOnUnicodeIDNDomainNames"]');
const box_notifications          = document.querySelector('input[name="disableNotifications"]');
const lbl_notifications          = document.querySelector('label[for="disableNotifications"]');
const txt_server                 = document.querySelector('input[name="api_server"]');
const lbl_server                 = document.querySelector('label[for="api_server"]');
const txt_publicKey              = document.querySelector('input[name="api_publicKey"]');
const lbl_publicKey              = document.querySelector('label[for="api_publicKey"]');
const btn_save                   = document.getElementById('form-submit');
const btn_restoreDefault         = document.getElementById('restore-default');
const btn_getPublicKey           = document.getElementById('get-publicKey');
const div_messageCheckServer     = document.querySelector('p.message-checkserver');

async function askServiceWorkerAboutDataVariableInLocalStorage(variableMapStruct) {

  const response = await chrome.runtime.sendMessage({dataVariable : variableMapStruct});

  return response.response
}

let lastDomainSaved = ''

//document.title                       = chrome.i18n.getMessage('__checkMyHttpsSettings__')
page_title.textContent               = chrome.i18n.getMessage('__checkMyHttpsSettings__')
title_general.textContent            = chrome.i18n.getMessage('__general__')
title_checkServer.textContent        = chrome.i18n.getMessage('__checkServerSettings__')
lbl_alertIDNDomains.textContent      = chrome.i18n.getMessage('__alertOnUnicodeIDNDomainNames__')
lbl_notifications.textContent        = chrome.i18n.getMessage('__disableNotifications__')
lbl_server.textContent               = chrome.i18n.getMessage('__checkServerAddress__')
lbl_publicKey.textContent            = chrome.i18n.getMessage('__checkServerPublicKey__')
btn_save.textContent                 = chrome.i18n.getMessage('__save__')
btn_restoreDefault.textContent       = chrome.i18n.getMessage('__restoreDefault__')
btn_getPublicKey.textContent         = chrome.i18n.getMessage('__getPublicKey__')

// Get user Data information
askServiceWorkerAboutDataVariableInLocalStorage(["alertOnUnicodeIDNDomainNames", "boolean"]).then( (response) => {
  box_alertIDNDomains.checked = response.toString() == "true" ? true : false
});

askServiceWorkerAboutDataVariableInLocalStorage(["disableNotifications", "boolean"]).then( (response) => {
  box_notifications.checked = response.toString() == "true" ? true : false;
});

askServiceWorkerAboutDataVariableInLocalStorage(["checkServerUrl", "string"]).then( (response) => {
  txt_server.value = response
});

askServiceWorkerAboutDataVariableInLocalStorage(["publicKey", "string"]).then( (response) => {
  txt_publicKey.value = response
});


lastDomainSaved  = CMH.options.settings.checkServerUrl.match(/^https:\/\/([^:\/\s]+)/)[1]

box_alertIDNDomains.addEventListener('input', (e) => {
  askServiceWorkerAboutDataVariableInLocalStorage(["alertOnUnicodeIDNDomainNames", "boolean", box_alertIDNDomains.checked])
  .then(() => {
    console.log("Je rentre dans la condition")
    div_messageCheckServer.dataset.type = 'success'
    div_messageCheckServer.textContent  = chrome.i18n.getMessage('__settingsSaved__')
  }, (error) => {
    div_messageCheckServer.dataset.type = 'error'
    div_messageCheckServer.textContent  = 'Error!'
  })
})

box_notifications.addEventListener('input', (e) => {
  askServiceWorkerAboutDataVariableInLocalStorage(["disableNotifications", "boolean", box_notifications.checked])
  .then(() => {
    div_messageCheckServer.dataset.type = 'success'
    div_messageCheckServer.textContent  = chrome.i18n.getMessage('__settingsSaved__')
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
    chrome.storage.local.set({
      checkServerUrl: txt_server.value,
      publicKey: txt_publicKey.value
    }).then(() => {
      btn_save.disabled = false
      div_messageCheckServer.dataset.type = 'success'
      div_messageCheckServer.textContent  = chrome.i18n.getMessage('__settingsSaved__')
    }, (error) => {
      btn_save.disabled = false
      div_messageCheckServer.dataset.type = 'error'
      div_messageCheckServer.textContent  = 'Error!'
    })
  }
  
  isValidCheckServer = await CMH.options.verifyServerAtStartup(txt_server.value, txt_publicKey.value)
  if (isValidCheckServer === 1) {
    saveSettingsToBrowser()
  } 
  else {
    btn_save.disabled = false
    div_messageCheckServer.dataset.type = 'error'
    switch (isValidCheckServer) {
      case -1:
        div_messageCheckServer.textContent  = chrome.i18n.getMessage('__serverUnreachable__')
        break;
        case -2:
          div_messageCheckServer.textContent  = chrome.i18n.getMessage('__invalidPublicKeyInOptions__')
          break;
          case 0:
            div_messageCheckServer.textContent  = chrome.i18n.getMessage('__publicKeyNotCorresponding__')
        break;
        case -3:
          div_messageCheckServer.textContent  = chrome.i18n.getMessage('__serverHardcodedFingerprintNotCorresponding__');
          break;
          default:
            div_messageCheckServer.textContent  = 'Error!'
            break;
    }
  }
})

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
      } 
      else 
      {
        div_messageCheckServer.dataset.type = 'error'
        div_messageCheckServer.textContent  = chrome.i18n.getMessage('__publicKeyUnreachable__')
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
