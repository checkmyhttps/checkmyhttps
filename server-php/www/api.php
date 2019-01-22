<?php

include __DIR__ . '/vendor/autoload.php';

define('INSTANCE_TITLE', '');
define('VERSION', '1.2.0');
define('SOCKET_TIMEOUT', ini_get('default_socket_timeout'));
define('CMH_DEBUG', false);

header('Content-Type: application/json');

// Allow check private IP
$allowPrivateIp = false;

// Do not send a dedicated message for private domains
$privateDomainsHidden = false;

// List of private domains
$privateDomains = [
    'localhost'
];

// Information page
if (isset($_GET['info'])) {
    $response = [
        'version' => VERSION,
        'title'   => INSTANCE_TITLE
    ];
    echo json_encode($response);
    exit();
}

// Get host:port to check
if (isset($_GET['url'])) {
    if (!filter_var($_GET['url'], FILTER_VALIDATE_URL, ['flags' => (FILTER_FLAG_HOST_REQUIRED)])) {
        echo json_encode(['error' => 'INVALID_URL']);
        exit();
    } else {
        $url = parse_url($_GET['url']);
        $host = isset($url['host']) ? $url['host'] : null;
        $port = isset($url['port']) ? $url['port'] : null;

        if (($port === null) && (isset($url['scheme']))) {
            $port = getPortFromScheme($url['scheme']);
        }
    }
} else {
    if (isset($_GET['host'])) {
        if (preg_match('/^[a-zA-Z0-9-.]+$/', $_GET['host'])) {
            $host = $_GET['host'];
        } else {
            // Convert IDNA 2008
            $_GET['host'] = (new \Mso\IdnaConvert\IdnaConvert)->encode($_GET['host']);

            if (preg_match('/^[a-zA-Z0-9-.]+$/', $_GET['host'])) {
                $host = $_GET['host'];
            }
        }
    }

    if (isset($_GET['port'])) {
        if (is_numeric($_GET['port']) && (0 <= intval($_GET['port']) && intval($_GET['port']) <= 65535)) {
            $port = intval($_GET['port']);
        }
    }
}

if (empty($host)) {
    exit(json_encode(['error' => 'UNKNOWN_HOST']));
}
if (empty($port)) {
    exit(json_encode(['error' => 'UNKNOWN_PORT']));
}

if ((!$allowPrivateIp) && (preg_match('/^(127\.)|(10\.)|(172\.1[6-9]\.)|(172\.2[0-9]\.)|(172\.3[0-1]\.)|(192\.168\.)+[0-9\.]+$/', $host))) {
    exit(json_encode(['error' => 'PRIVATE_HOST']));
}

if (in_array($host, $privateDomains)) {
    if (!$privateDomainsHidden) {
        exit(json_encode(['error' => 'PRIVATE_HOST']));
    } else {
        exit(json_encode(['error' => 'HOST_UNREACHABLE']));
    }
}


$certificate = getCertificate($host, $port);
if ($certificate === null) {
    echo json_encode(['error' => 'HOST_UNREACHABLE']);
    exit();
}

$certificate->host = $host.':'.$port;
$certificate->whitelisted = checkHostWhitelisted($host);

echo json_encode($certificate);
exit();



/**
 * Format the certificate chain.
 *
 * @param array $certificateChain certificate chain
 * @return object Returns formatted certificate chain
 */
function formatCertificateChain($certificateChain) {
    if (($certificateChain === null) || empty($certificateChain)) {
        return null;
    }

    $cert = array_shift($certificateChain);

    $certificate = (object) [
        'fingerprints' => (object) [
            'sha1'   => strtoupper(openssl_x509_fingerprint($cert, 'sha1')),
            'sha256' => strtoupper(openssl_x509_fingerprint($cert, 'sha256'))
        ]
    ];

    if (!empty($certificateChain)) {
        $certificate->issuer = formatCertificateChain($certificateChain);
    }

    return $certificate;
}

/**
 * Get certificate of a host and port.
 *
 * @param string $host host of service
 * @param int    $port port of service
 * @return object Returns certificate or null if not found
 */
function getCertificate($host, $port) {
    $certificate = null;

    $context = stream_context_create(['ssl' => ['capture_peer_cert_chain' => true, 'verify_peer' => false, 'verify_peer_name' => false, 'SNI_enabled' => true]]);
    $socketClient = @stream_socket_client("ssl://$host:$port", $errno, $errstr, SOCKET_TIMEOUT, STREAM_CLIENT_CONNECT, $context);
    if (!$socketClient) {
        if (CMH_DEBUG) {
            echo json_encode(['error' => true, 'errno' => $errno, 'errstr' => utf8_encode($errstr)], JSON_UNESCAPED_UNICODE);
            exit();
        }
    } else {
        $ctx  = stream_context_get_params($socketClient);
        fclose($socketClient);

        $certificate = formatCertificateChain($ctx['options']['ssl']['peer_certificate_chain']);
    }

    return $certificate;
}

/**
 * Get port from scheme.
 *
 * @param string $protocol protocol
 * @return int Returns port number or null if not found
 */
function getPortFromScheme($protocol) {
    // Port of protocols
    $portsByProtocol = [
        'ftps'  =>  21,
        'ssh'   =>  22,
        'https' => 443,
        'smtps' => 465,
        'imaps' => 993,
        'pop3s' => 995
    ];

    return isset($portsByProtocol[$protocol]) ? $portsByProtocol[$protocol] : null;
}

/**
 * Check if a host is whitelisted.
 *
 * @param string $host Host
 * @return bool
 */
function checkHostWhitelisted($host) {
    $whitelist = include 'api_whitelist.php';

    if (in_array($host, $whitelist['domains'])) {
        return true;
    }

    foreach ($whitelist['domains_re'] as $regex) {
        if (preg_match("/$regex/", $host)) {
            return true;
        }
    }

    return false;
}
