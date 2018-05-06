#!/usr/bin/env python

###################################
# CheckMyHTTPS native application #
###################################

import sys
import os
import platform
import json
import struct
import socket
import ssl
import hashlib
import re
if sys.version_info.major >= 3: # Python 3
    import http.client as httplib
    import urllib.request as urllib2
    from urllib.parse import urlparse
else:                           # Python 2
    import httplib
    import urllib2
    from urlparse import urlparse

VERSION = '1.0.0'

ADDON_IDS = {
    'firefox': 'info@checkmyhttps.net',
    'chrome':  'chrome-extension://kloeailbbhkdfbaoaefkaajhgihpadke/',
    'opera':   'chrome-extension://fmbmhajicpidghmjmgkafenlmjeoogje/'
}

timeout = 3
defaultCheckServer = {
    'url': 'https://checkmyhttps.net/',
    'fingerprints': {
        'sha1':   'FF33641253DAA21E6C5CADEBF15430B2B7E498E6',
        'sha256': '889F63E8E7F98F67E35750591CD66BC32A17A4B4FA2A44763DBEF8D756156165'
    }
}
conf_checkServer = defaultCheckServer

# Check that OpenSSL version support TLSv1.2
if (ssl.OPENSSL_VERSION_INFO <= (1, 0, 1)):
    print('You need to update your OpenSSL version.')
    sys.exit(1)

# Check that OpenSSL version support SNI
if not ssl.HAS_SNI:
    print('Your OpenSSL does not support SNI.')
    sys.exit(1)

def install():
    """ Install agent to browsers """
    system = platform.system()

    if system == 'Windows':
        if sys.version_info.major >= 3: # Python 3
            import winreg
        else:                           # Python 2
            import _winreg as winreg

    currentFile = os.path.realpath(__file__)
    currentDir  = os.path.dirname(currentFile)


    manifest = {
        'name': 'checkmyhttps',
        'description': 'CheckMyHTTPS',
        'path': currentFile,
        'type': 'stdio',
    }

    if system == 'Windows':
        manifest['path'] = filename = os.path.join(currentDir, 'checkmyhttps_win.bat')

        try:
            with open(filename, 'w') as file:
                file.write('@echo off\r\ncall "%s" "%s" %%*\r\n' % (sys.executable, currentFile))
        except Exception as e:
            print('Cannot create file "%s"' % filename)
            print('  ' + str(e))

        locations = {
            'firefox': os.path.join('Software', 'Mozilla', 'NativeMessagingHosts'),         # Firefox
            'chrome':  os.path.join('Software', 'Google', 'Chrome', 'NativeMessagingHosts') # Chrome/Opera
        }
    else:
        homePath = os.getenv('HOME')
        os.chmod(currentFile, 0o755) # Set execute permission
        if system == 'Linux':
            locations = {
                'chrome':   os.path.join(homePath, '.config', 'google-chrome', 'NativeMessagingHosts'),
                'chromium': os.path.join(homePath, '.config', 'chromium', 'NativeMessagingHosts'),
                'firefox':  os.path.join(homePath, '.mozilla', 'native-messaging-hosts'),
            }
        else: # macos
            locations = {
                'chrome':   os.path.join(homePath, 'Library', 'Application Support', 'Google', 'Chrome', 'NativeMessagingHosts'),
                'chromium': os.path.join(homePath, 'Library', 'Application Support', 'Chromium', 'NativeMessagingHosts'),
                'firefox':  os.path.join(homePath, 'Library', 'Application Support', 'Mozilla', 'NativeMessagingHosts'),
            }

    for browser, location in locations.items():
        if system != 'Windows':
            if not os.path.exists(os.path.dirname(location)):
                continue
            if not os.path.exists(location):
                os.mkdir(location)

        browser_manifest = manifest.copy()
        if browser == 'firefox':
            browser_manifest['allowed_extensions'] = [ ADDON_IDS['firefox'] ]
        elif browser == 'chrome':
            browser_manifest['allowed_origins']    = [ ADDON_IDS['chrome'], ADDON_IDS['opera'] ]
        else:
            browser_manifest['allowed_origins']    = [ ADDON_IDS['chrome'] ]

        try:
            if system == 'Windows':
                filename = os.path.join(currentDir, 'checkmyhttps_%s.json' % browser)
            else:
                filename = os.path.join(location, 'checkmyhttps.json')
            with open(filename, 'w') as file:
                file.write(
                    json.dumps(browser_manifest, indent=2, separators=(',', ': '), sort_keys=True).replace('  ', '\t') + '\n'
                )
        except Exception as e:
            print('Cannot create file "%s"' % filename)
            print('  ' + str(e))

        if system == 'Windows':
            try:
                key = winreg.CreateKey(winreg.HKEY_CURRENT_USER, location)
                winreg.SetValue(key, 'checkmyhttps', winreg.REG_SZ, filename)
            except Exception as e:
                print('Cannot create registry key "%s"' % location)
                print('  ' + str(e))

def uninstall():
    """ Uninstall agent to browsers """
    system = platform.system()

    if system == 'Windows':
        if sys.version_info.major >= 3: # Python 3
            import winreg
        else:                           # Python 2
            import _winreg as winreg

    currentFile = os.path.realpath(__file__)
    currentDir  = os.path.dirname(currentFile)


    manifest = {
        'name': 'checkmyhttps',
        'description': 'CheckMyHTTPS',
        'path': currentFile,
        'type': 'stdio',
    }

    if system == 'Windows':
        manifest['path'] = filename = os.path.join(currentDir, 'checkmyhttps_win.bat')

        try:
            if os.path.exists(filename):
                os.remove(filename)
        except Exception as e:
            print('Cannot delete file "%s"' % filename)
            print('  ' + str(e))

        locations = {
            'firefox': os.path.join('Software', 'Mozilla', 'NativeMessagingHosts'),         # Firefox
            'chrome':  os.path.join('Software', 'Google', 'Chrome', 'NativeMessagingHosts') # Chrome/Opera
        }
    elif system == 'Linux':
        homePath = os.getenv('HOME')
        locations = {
            'firefox':  os.path.join(homePath, '.mozilla', 'native-messaging-hosts'),
            'chrome':   os.path.join(homePath, '.config', 'google-chrome', 'NativeMessagingHosts'),
            'chromium': os.path.join(homePath, '.config', 'chromium', 'NativeMessagingHosts')
        }
    else:
        homePath = os.getenv('HOME')
        locations = {
            'firefox':  os.path.join(homePath, 'Library', 'Application Support', 'Mozilla', 'NativeMessagingHosts'),
            'chrome':   os.path.join(homePath, 'Library', 'Application Support', 'Google', 'Chrome', 'NativeMessagingHosts'),
            'chromium': os.path.join(homePath, 'Library', 'Application Support', 'Chromium', 'NativeMessagingHosts')
        }

    for browser, location in locations.items():
        if system != 'Windows':
            if not os.path.exists(os.path.dirname(location)):
                continue

        try:
            if system == 'Windows':
                filename = os.path.join(currentDir, 'checkmyhttps_%s.json' % browser)
            else:
                filename = os.path.join(location, 'checkmyhttps.json')
            if os.path.exists(filename):
                os.remove(filename)
        except Exception as e:
            print('Cannot delete file "%s"' % filename)
            print('  ' + str(e))

        if system == 'Windows':
            try:
                key = winreg.OpenKey(winreg.HKEY_CURRENT_USER, '', 0, winreg.KEY_ALL_ACCESS)
                winreg.DeleteKey(key, location)
            except Exception as e:
                print('Cannot delete registry key "%s"' % os.path.join('HKEY_CURRENT_USER', location))
                print('  ' + str(e))

def getMessage():
    """ Receive (and decode) message from the browser """
    if sys.version_info.major >= 3: # Python 3
        stdin = sys.stdin.buffer
    else:                           # Python 2
        stdin = sys.stdin
    rawLength = stdin.read(4)
    if len(rawLength) == 0:
        sys.exit(0)
    messageLength = struct.unpack('@I', rawLength)[0]
    message = stdin.read(messageLength)
    if sys.version_info.major >= 3: # Python 3
        message = message.decode('utf-8')
    return json.loads(message)

def sendMessage(messageContent):
    """ Send (and encode) message to the browser """
    if sys.version_info.major >= 3: # Python 3
        stdout = sys.stdout.buffer
    else:                           # Python 2
        stdout = sys.stdout
    encodedContent = json.dumps(messageContent)
    if sys.version_info.major >= 3: # Python 3
        encodedContent = encodedContent.encode('utf-8')
    encodedLength  = struct.pack('@I', len(encodedContent))
    encodedMessage = {
        'length':  encodedLength,
        'content': encodedContent
    }

    stdout.write(encodedMessage['length'])
    stdout.write(encodedMessage['content'])
    stdout.flush()

class SSLPinningException(Exception):
    """ SSL Pinning exception (MITM SSL) """
    pass

def compareFingerprints(userCertificate, checkServerCertificate):
    """ Compare two SSL certificates """
    return ((userCertificate['sha1'] == checkServerCertificate['sha1']) and (userCertificate['sha256'] == checkServerCertificate['sha256']))

def getFingerprintsFromCheckServer(host, port, checkServer=conf_checkServer):
    """ Get fingerprints from the check server (API) """
    global fingerprints
    fingerprints = None
    data = None

    class CertValidatingHTTPSConnection(httplib.HTTPConnection):
        default_port = httplib.HTTPS_PORT

        if sys.version_info.major >= 3: # Python 3
            def __init__(self, host, port=None, timeout=socket._GLOBAL_DEFAULT_TIMEOUT, source_address=None, **kwargs):
                httplib.HTTPConnection.__init__(self, host, port, timeout, source_address, **kwargs)
        else:                           # Python 2
            def __init__(self, host, port=None, strict=None, **kwargs):
                httplib.HTTPConnection.__init__(self, host, port, strict, **kwargs)


        def connect(self):
            s = socket.create_connection((self.host, self.port))
            s.settimeout(timeout)
            self.sock = ssl.SSLSocket(s, server_hostname=self.host.split(':', 0)[0])
            certRaw = self.sock.getpeercert(True)
            global fingerprints
            fingerprints = {
                'sha1':   hashlib.sha1(certRaw).hexdigest().upper(),
                'sha256': hashlib.sha256(certRaw).hexdigest().upper()
            }

    class VerifiedHTTPSHandler(urllib2.HTTPSHandler):
        def __init__(self, **kwargs):
            urllib2.AbstractHTTPHandler.__init__(self)
            self._connection_args = kwargs

        def https_open(self, req):
            def http_class_wrapper(host, **kwargs):
                full_kwargs = dict(self._connection_args)
                full_kwargs.update(kwargs)
                return CertValidatingHTTPSConnection(host, **full_kwargs)

            return self.do_open(http_class_wrapper, req)

        https_request = urllib2.HTTPSHandler.do_request_

    req = urllib2.build_opener(VerifiedHTTPSHandler()).open(checkServer['url'] + 'api.php?host=' + host + '&port=' + str(port))

    # SSL pinning on check server
    if ((fingerprints is not None) and (host == (urlparse(checkServer['url']).hostname)) and (port == (urlparse(checkServer['url']).port)) and (not compareFingerprints(fingerprints, checkServer['fingerprints']))):
        raise SSLPinningException()

    data =  {
        'fingerprints': fingerprints,
        'data': json.loads(req.read())
    }

    return data

def getFingerprints(host, port):
    """ Get fingerprint (from client) """
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.settimeout(timeout)
    ssl_sock = ssl.SSLSocket(s, server_hostname=host)

    ssl_sock.connect((host, port))

    certRaw = ssl_sock.getpeercert(True)

    res = {
        'sha1':   hashlib.sha1(certRaw).hexdigest().upper(),
        'sha256': hashlib.sha256(certRaw).hexdigest().upper()
    }

    ssl_sock.close()

    return res

def parseURL(url):
    """ Parse an URL """
    scheme = urlparse(url).scheme
    host   = urlparse(url).hostname
    port   = urlparse(url).port if urlparse(url).port else httplib.HTTPS_PORT # TODO: support other protocols

    return {
        'host':   host,
        'port':   port,
        'scheme': scheme
    }

def isCheckableUrl(url):
    """ Check if an URL is valid """
    urlParsed = None

    try:
        urlParsed = parseURL(url)
    except:
        return False

    if not re.match(r'^((\w+):\/\/)?([a-zA-Z0-9_\-\.]+)(?::([0-9]+))?\/?.*?$', urlParsed['host']):
        return False

    if urlParsed['scheme'] == 'http':
        return False

    # Test private ip address
    if re.match(r'^((127\.)|(10\.)|(172\.1[6-9]\.)|(172\.2[0-9]\.)|(172\.3[0-1]\.)|(192\.168\.))+[0-9\.]$', urlParsed['host']):
        return False

    return True


def checkUrl(url):
    """ Check an URL """
    if not isCheckableUrl(url):
        return 'ERR'

    urlParsed = parseURL(url)

    userCert        = None
    checkServerCert = None

    try:
        userCert        = getFingerprints(urlParsed['host'], urlParsed['port'])
        checkServerCert = getFingerprintsFromCheckServer(urlParsed['host'], urlParsed['port'])['data']
    except SSLPinningException as e:
        # print('SSL pinning failed')
        return 'SSLP'
    except socket.gaierror as e:
        # print('Address-related error connecting to server: %s' % e)
        return 'ERR'
    except socket.error as e:
        # print('Connection error: %s' % e)
        return 'ERR'
    except urllib2.URLError as e:
        # print('Connection error: %s' % e)
        return 'ERR'

    try:
        if (checkServerCert['error']):
            return checkServerCert['error']
    except KeyError as e:
        pass

    return verifyCertificate(urlParsed['host'], userCert, checkServerCert)

def verifyCertificate(host, userCert, checkServerCert):
    """ Checks the client's certificate with the one received by the check server """
    res = None

    if (compareFingerprints(userCert, checkServerCert['fingerprints'])):
        res = 'OK'
        if True:
            names = host.split('.')
            for name in names:
                if name.startswith('xn--'):
                    res = 'IDN'
                    break

    elif (checkServerCert['whitelisted']):
        res = 'WL'
    else:
        res = 'KO'

    return res

def verifyCheckServerApi(checkServer):
    """ Verify a check server API """
    if not isCheckableUrl(checkServer['url']):
        return 'ERR'

    urlParsed = parseURL(defaultCheckServer['url'])

    checkServerCert = None
    try:
        checkServerCert = getFingerprintsFromCheckServer(urlParsed['host'], urlParsed['port'], checkServer=checkServer)
    except SSLPinningException:
        # print('SSL pinning failed')
        return 'SSLP'
    except socket.gaierror as e:
        # print('Address-related error connecting to server: %s' % e)
        return 'ERR'
    except socket.error as e:
        # print('Connection error: %s' % e)
        return 'ERR'
    except urllib2.URLError as e:
        # print('Connection error: %s' % e)
        return 'ERR'

    if not compareFingerprints(checkServerCert['fingerprints'], checkServer['fingerprints']):
        return 'KO'

    if not compareFingerprints(checkServerCert['data']['fingerprints'], defaultCheckServer['fingerprints']):
        return 'KO'

    return 'OK'

def printUsage():
    print('Usage: '+sys.argv[0]+' [install|uninstall|version|check <url>]')

if __name__ == '__main__':
    if len(sys.argv) == 1:
        printUsage()
    elif (ADDON_IDS['firefox'] in sys.argv) or (ADDON_IDS['chrome'] in sys.argv) or (ADDON_IDS['opera'] in sys.argv) or (sys.argv[1].endswith('/checkmyhttps.json')):
        sendMessage({ 'action': 'PONG', 'version': VERSION, 'filepath': os.path.realpath(__file__), 'checkServer': conf_checkServer })
        while True:
            try:
                receivedMessage = getMessage()
                if receivedMessage['action'] == 'check':
                    urlParsed = parseURL(receivedMessage['params']['url'])
                    res = checkUrl(receivedMessage['params']['url'])
                    sendMessage({ 'action': 'check', 'result': res, 'tabId': receivedMessage['params']['tabId'], 'url': receivedMessage['params']['url'] })
                elif receivedMessage['action'] == 'getFingerprints':
                    urlParsed = parseURL(receivedMessage['params']['url'])
                    sendMessage({ 'action': 'resFingerprints', 'fingerprints': getFingerprints(urlParsed['host'], urlParsed['port']), 'url': receivedMessage['params']['url'] })
                elif receivedMessage['action'] == 'setOptions':
                    if ('checkServerUrl' in receivedMessage['params']) and ('checkServerFingerprintsSha1' in receivedMessage['params']) and ('checkServerFingerprintsSha256' in receivedMessage['params']):
                        res = verifyCheckServerApi({ 'url': receivedMessage['params']['checkServerUrl'], 'fingerprints': { 'sha1': receivedMessage['params']['checkServerFingerprintsSha1'], 'sha256': receivedMessage['params']['checkServerFingerprintsSha256'] } })
                        if res == 'OK':
                            conf_checkServer['url']                    = receivedMessage['params']['checkServerUrl']
                            conf_checkServer['fingerprints']['sha1']   = receivedMessage['params']['checkServerFingerprintsSha1']
                            conf_checkServer['fingerprints']['sha256'] = receivedMessage['params']['checkServerFingerprintsSha256']
                        sendMessage({ 'action': 'setOptionsRes', 'res': res })
                    else:
                        sendMessage('OK')
                elif receivedMessage['action'] == 'PING':
                    sendMessage({ 'action': 'PONG', 'version': VERSION, 'filepath': os.path.realpath(__file__), 'checkServer': conf_checkServer })
            except Exception as e:
                sendMessage({ 'action': 'error', 'error': str(e) })
    else:
        if len(sys.argv) >= 2:
            try:
                if sys.argv[1] == 'install':
                    install()
                elif sys.argv[1] == 'uninstall':
                    uninstall()
                elif sys.argv[1] == 'version':
                    print(VERSION)
                elif sys.argv[1] == 'check':
                    print(checkUrl(sys.argv[2]))
            except Exception as e:
                print('Error: ' + str(e))
