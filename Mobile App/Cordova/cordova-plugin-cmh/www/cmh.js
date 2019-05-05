// Empty constructor
function cmhPlugin() {}


cmhPlugin.prototype.getFingerprints = async function(urlTested){
  //synchronous function with promise to get Fingerprints from URL
  return new Promise((resolve, reject) => {
    if (cordova.platformId === 'android') {
      cordova.exec((fingerprintsJSON) => {
        resolve(fingerprintsJSON)
      }, (errorUser) => {
        reject(errorUser)
      }, "cmhPlugin", "getFingerprints", [urlTested]);
      return;
    }

    cordova.exec((data) => {
      let fingerprints = {}
      for (let i = 0; i < data.fingerprints.length; i++) {
        fingerprints['cert'+i] = data.fingerprints[i]
      }
      resolve(fingerprints)
    }, (errorUser) => {
      reject(errorUser)
    }, "cmhPlugin", "openHTTPSRequest", [urlTested, false]);
  });
};

cmhPlugin.prototype.getFingerprintsFromCheckServer = function(checkServerURL, host, port){
  const urlPort = port || 443;
  const URL = checkServerURL+'/api.php?host='+host+'&port='+urlPort;

  //synchronous function with promise to get Fingerprints from check server
  return new Promise((resolve, reject) => {
    if (cordova.platformId === 'android') {
      cordova.exec((CmhServerCert) => {
        resolve(CmhServerCert)
      }, (errorUser) => {
        reject(errorUser)
      }, "cmhPlugin", "getFingerprintsFromCheckServer", [checkServerURL, host, urlPort]);
      return;
    }

    cordova.exec((data) => {
      let fingerprints = {}
      for (let i = 0; i < data.fingerprints.length; i++) {
        fingerprints['cert'+i] = data.fingerprints[i]
      }
      CmhServerCert = {
        APIInfo: JSON.parse(data.data),
        fingerprints: fingerprints
      }
      resolve(CmhServerCert)
    }, (errorServer) => {
      reject(errorServer)
    }, "cmhPlugin", "openHTTPSRequest", [URL, true]);
  });
};


// Install of constructor that binds CMH plugin to window
cmhPlugin.install = function() {
  if (!window.plugins) {
    window.plugins = {};
  }
  window.plugins.cmhPlugin = new cmhPlugin();
  return window.plugins.cmhPlugin;
};
cordova.addConstructor(cmhPlugin.install);