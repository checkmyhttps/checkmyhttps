const page_title           = document.querySelector('body > h1');
const txt_server           = document.querySelector('input[name="api_server"]');
const lbl_server           = document.querySelector('label[for="api_server"]');
const txt_sha1             = document.querySelector('input[name="api_sha1"]');
const lbl_sha1             = document.querySelector('label[for="api_sha1"]');
const txt_sha256           = document.querySelector('input[name="api_sha256"]');
const lbl_sha256           = document.querySelector('label[for="api_sha256"]');
const btn_save             = document.getElementById('form-submit');
const btn_restoreDefault   = document.getElementById('restore-default');
const btn_getFingerprints  = document.getElementById('get-fingerprints');
const lbl_message          = document.querySelector('p.message');

let defaultCheckServer = null;
let lastDomainSaved = '';

btn_save.addEventListener('click', function onClick(event) {
    btn_save.disabled = true;
    lbl_message.textContent = '';
    if (txt_server.value.slice(-1) !== '/') {
        txt_server.value += '/';
    }
    self.port.emit('save', {
        server: txt_server.value,
        sha1:   txt_sha1.value.replace(/:/g, '').toUpperCase(),
        sha256: txt_sha256.value.replace(/:/g, '').toUpperCase()
    });
}, false);

btn_restoreDefault.addEventListener('click', function onClick(event) {
    if (defaultCheckServer !== null) {
        txt_server.value = defaultCheckServer.url;
        txt_sha1.value   = defaultCheckServer.fingerprints.sha1;
        txt_sha256.value = defaultCheckServer.fingerprints.sha256;
        btn_getFingerprints.style.display = 'none';
    }
}, false);

btn_getFingerprints.addEventListener('click', function onClick(event) {
    btn_getFingerprints.disabled = true;
    lbl_message.textContent = '';
    if (txt_server.value.slice(-1) !== '/') {
        txt_server.value += '/';
    }
    self.port.emit('getFingerprints', {
        server: txt_server.value
    });
}, false);

txt_sha1.addEventListener('blur', function () {
    txt_sha1.value   = txt_sha1.value.replace(/:/g, '').toUpperCase()
}, false);
txt_sha256.addEventListener('blur', function () {
    txt_sha256.value = txt_sha256.value.replace(/:/g, '').toUpperCase()
}, false);
const onFingerprintChange = function () {
    if ((txt_sha1.value.length === 0) && (txt_sha256.value.length === 0)) {
        btn_getFingerprints.style.display = null;
    } else {
        btn_getFingerprints.style.display = 'none';
    }
}
txt_sha1.addEventListener('keyup', onFingerprintChange);
txt_sha256.addEventListener('keyup', onFingerprintChange);
txt_server.addEventListener('keyup', function () {
    const domainMatch = txt_server.value.match(/^https:\/\/([^:\/\s]+)/);
    if (domainMatch && (domainMatch[1] !== lastDomainSaved)) {
        txt_sha1.value   = '';
        txt_sha256.value = '';
        btn_getFingerprints.style.display = null;
    }
}, false);

self.port.on('init', function (data) {
    document.title                  = data.locale.checkServerSettings;
    page_title.textContent          = data.locale.checkServerSettings;
    lbl_server.textContent          = data.locale.checkServerAddress;
    lbl_sha1.textContent            = data.locale.checkServerSha1;
    lbl_sha256.textContent          = data.locale.checkServerSha256;
    btn_save.textContent            = data.locale.save;
    btn_restoreDefault.textContent  = data.locale.restoreDefault;
    btn_getFingerprints.textContent = data.locale.getFingerprints;
    defaultCheckServer = data.defaultCheckServer;
    lastDomainSaved    = data.values.server.match(/^https:\/\/([^:\/\s]+)/)[1];
    txt_server.value = data.values.server;
    txt_sha1.value   = data.values.sha1;
    txt_sha256.value = data.values.sha256;
    onFingerprintChange();
    btn_save.disabled = false;
    document.body.style.display = null;
});

self.port.on('onHide', function () {
    document.body.style.display = 'none';
});

self.port.on('result', function (data) {
    if (!data.result) {
        lbl_message.textContent = 'Error!';
    }

    btn_save.disabled = false;
});

self.port.on('fingerprints', function (data) {
    btn_getFingerprints.disabled = false;

    if (data.fingerprints !== null) {
        txt_sha1.value   = data.fingerprints.sha1;
        txt_sha256.value = data.fingerprints.sha256;
        btn_getFingerprints.style.display = 'none';
    } else {
        lbl_message.textContent = 'Error!';
    }
});
