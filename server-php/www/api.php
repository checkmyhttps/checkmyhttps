<?php

include __DIR__ . '/vendor/autoload.php';

define('INSTANCE_TITLE', '');
define('VERSION', '1.4.0');
define('SOCKET_TIMEOUT', ini_get('default_socket_timeout'));
define('CMH_DEBUG', false);

header('Content-Type: application/json');

// Max duree of cache (default: 21600 seconds = 6 hours)
$cacheTTL = 21600;

/*  Max number of records in database before resetting it. We let a margin, just in case (max value for BIGINT UNSIGNED is 2^64 - 1)
    Indeed, there are currently approximately 500 000 000 registered domain names. This way, the database will never be full    */
const DB_NB_MAX_RECORDS = 2**64 - 600000000;

// Boolean used to know if we can use the database or not. Must ALWAYS be false at startup
$databaseIsReachable = false;

// DNS record found in cache/database ?
$cacheFound = false;

// SQL DB user who must have sufficient privileges on database. Please do not use these login details
$user = 'root';
$pass = 'toor';

// Allow check private IP
$allowPrivateIp = false;

// Do not send a dedicated message for private domains
$privateDomainsHidden = false;

// List of private domains
$privateDomains = [
    // 'localhost'
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

// User inputs
if (isset($_GET['url']))  $request_url  = $_GET['url'];
if (isset($_GET['host'])) $request_host = $_GET['host'];
if (isset($_GET['port'])) $request_port = $_GET['port'];
if (isset($_GET['ip'])) $request_ip = $_GET['ip'];

// Service requested by the user
$service = (object) [
    'host' => null,
    'port' => null,
    'ip'   => null
];

// Parse host:port from URL
if ((isset($request_url)) && (!isset($request_host) && !isset($request_port))) {
    if ((!filter_var($request_url, FILTER_VALIDATE_URL)) && (!filter_var((new \Mso\IdnaConvert\IdnaConvert)->encode($request_url), FILTER_VALIDATE_URL))) {
        echo json_encode(['error' => 'INVALID_URL']);
        exit();
    } else {
        $url = parse_url($request_url);
        $request_host = isset($url['host']) ? $url['host'] : null;
        $request_port = isset($url['port']) ? $url['port'] : null;

        if (($request_port === null) && (isset($url['scheme']))) {
            $request_port = getPortFromScheme($url['scheme']);
        }
    }
}

if (isset($request_ip)) {
    $service->ip = $request_ip;
}

// Check hostname
if (isset($request_host)) {
    if (preg_match('/^[a-zA-Z0-9-_.]+$/', $request_host)) {
        $service->host = $request_host;
    } else {
        // Convert IDNA 2008
        $request_host = (new \Mso\IdnaConvert\IdnaConvert)->encode($request_host);

        if (preg_match('/^[a-zA-Z0-9-_.]+$/', $request_host)) {
            $service->host = $request_host;
        }
    }

    // Get IP address
    if (!$allowPrivateIp && !empty($service->host) && empty($service->ip)) {
        if (filter_var($service->host, FILTER_VALIDATE_IP)) {
            $service->ip = $service->host;
        } else {
            $host_fqdn = ((!preg_match('/\.$/', $service->host)) ? $service->host.'.' : $service->host); // prevent DNS requests with the local server domain suffixed
			
            try
            {
                // Connection to local database
                $pdo = new PDO ('mysql:host=localhost;dbname=cmh;charset=utf8', $user, $pass);

                // Avoid SQL injection
                $pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
                $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

                $databaseIsReachable = true;

                // Looking for a DNS + fingerprints record in cache
                $stmt = $pdo->prepare("SELECT id, ip, cache_timestamp, sha1_fingerprint, sha256_fingerprint, sha1_issuers_fingerprints_chain, sha256_issuers_fingerprints_chain from cache WHERE domain_name = :host and port = :port ;"); // and ip = :ip (planned for next update)
                $stmt->execute(array(':host' => $host_fqdn, ':port' => $request_port));
                $row = $stmt->fetchAll(\PDO::FETCH_ASSOC)[0];
                $id = $row['id'];
                $ip = $row['ip'];
                if(isset($row['ip']) && $row['ip'] !== null)
                    $cacheFound = true;
            }
            catch(PDOException $e)
            {
                /*  Could not connect to database : is the SQL server running ? Has the SQL user sufficient privileges ? Is this the correct database IP ? Correct table name ?
                    Let this commented if you want the server to continue running even if the database is not reachable. This way, everything will work, but without the cache.    */
                /*  exit(json_encode(['error' => 'SQL_SERVER_ERROR']));
                die;    */
            }

            $curdate = date("Y-m-d H:i:s");
            $insertInCache = false;

            // DNS record found in cache
            if($cacheFound === true)
            {
                $time_passed = strtotime($curdate) - strtotime($row['cache_timestamp']);
                if($time_passed > $cacheTTL) // Old cache, we need to update it
                {
                    // If database is (nearly) full, we delete everything and we reset AUTO_INCREMENT to 1
                    if($id > DB_NB_MAX_RECORDS)
                    {
                        $stmt = $pdo->prepare("DELETE FROM cache;");
                        $stmt->execute();

                        $stmt = $pdo->prepare("ALTER TABLE cache AUTO_INCREMENT = 1;");
                        $stmt->execute();
                    }

                    // Else, we just delete the old cache row and all the older records
                    else
                    {
                        $stmt = $pdo->prepare("DELETE FROM cache WHERE id <= :id;");
                        $stmt->execute(array(':id' => $id));
                    }
                    
                    $insertInCache = true;
                    $cacheFound = false;
                }
            }
            
            // No record found OR no record up to date
            if($cacheFound === false)
            {
                $insertInCache = true;
                // Request IPv4 of the domain name
                $ip = gethostbyname($host_fqdn);

                if ($ip !== $host_fqdn) {
                    $service->ip = $ip;
                } else {
                    // Try with IPv6
                    $ip = dns_get_record($host_fqdn, DNS_AAAA);
                    if (($ip !== false) && (!empty($ip)) && isset($ip[0]['ipv6'])) {
                        $service->ip = $ip[0]['ipv6'];
                    }
                    else
                        $insertInCache = false;
                }
            }
            else
                $service->ip = $ip;
        }
    }
}

// Check port
if (isset($request_port)) {
    if (is_numeric($request_port) && (0 <= intval($request_port) && intval($request_port) <= 65535)) {
        $service->port = intval($request_port);
    }
}

if (empty($service->host) || empty($service->ip)) {
    exit(json_encode(['error' => 'UNKNOWN_HOST']));
}
if (empty($service->port)) {
    exit(json_encode(['error' => 'UNKNOWN_PORT']));
}

if ((!$allowPrivateIp) && (!filter_var($service->ip, FILTER_VALIDATE_IP, ['flags' => (FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)]))) {
    if (($privateDomainsHidden) && ($service->ip !== $service->host)) {
        exit(json_encode(['error' => 'HOST_UNREACHABLE']));
    } else {
        exit(json_encode(['error' => 'PRIVATE_HOST']));
    }
}

if (in_array($service->host, $privateDomains)) {
    if ($privateDomainsHidden) {
        exit(json_encode(['error' => 'HOST_UNREACHABLE']));
    } else {
        exit(json_encode(['error' => 'PRIVATE_HOST']));
    }
}

// No record found in cache, so, we can fetch the certificates chain
if($cacheFound === false)
{
    $certificate = getCertificate($service);
    if ($certificate === null) {
        echo json_encode(['error' => 'HOST_UNREACHABLE']);
        exit();
    }
}
else
{
    // Write fingerprints from cache to send them to the client
    $certificate = (object) [
        'fingerprints' => (object) [
            'sha1'   => $row['sha1_fingerprint'],
            'sha256' => $row['sha256_fingerprint']
        ]
    ];
    $nbIssuers = strlen($row['sha1_issuers_fingerprints_chain']) / 40;
    $tmpIssuer = $certificate;

    $sha1_issuers_fingerprints_chain = $row['sha1_issuers_fingerprints_chain'];
    $sha256_issuers_fingerprints_chain = $row['sha256_issuers_fingerprints_chain'];

    // Write issuers fingerprints
    while($nbIssuers > 0)
    {
        $tmpIssuer->issuer = (object) [
            'fingerprints' => (object) [
                'sha1'   => null,
                'sha256' => null
            ]
        ];
        $tmpIssuer = $tmpIssuer->issuer;
        $tmpIssuer->fingerprints->sha1 = substr($row['sha1_issuers_fingerprints_chain'], 0, 40);
        $tmpIssuer->fingerprints->sha256 = substr($row['sha256_issuers_fingerprints_chain'], 0, 64);
        $nbIssuers = $nbIssuers - 1;

        $row['sha1_issuers_fingerprints_chain'] = substr($row['sha1_issuers_fingerprints_chain'], 40);
        $row['sha256_issuers_fingerprints_chain'] = substr($row['sha256_issuers_fingerprints_chain'], 64);
    }
}

$ip_formated = (strpos($service->ip, ':') !== false) ? '['.$service->ip.']' : $service->ip;
$certificate->host     = $service->host.':'.$service->port;
$certificate->host_raw = $ip_formated  .':'.$service->port;
$certificate->whitelisted = checkHostWhitelisted($service->host);

if($insertInCache === true && $databaseIsReachable === true)
{
    $sha1_issuers_fingerprints_chain = "";
    $sha256_issuers_fingerprints_chain = "";
    $tmpCert = $certificate;
    while (isset($tmpCert->issuer))
    {
        $sha1_issuers_fingerprints_chain = $sha1_issuers_fingerprints_chain . $tmpCert->issuer->fingerprints->sha1;
        $sha256_issuers_fingerprints_chain = $sha256_issuers_fingerprints_chain . $tmpCert->issuer->fingerprints->sha256;
        $tmpCert = $tmpCert->issuer;
    }
    $stmt = $pdo->prepare("INSERT INTO cache (ip, domain_name, port, cache_timestamp, sha1_fingerprint, sha256_fingerprint, sha1_issuers_fingerprints_chain, sha256_issuers_fingerprints_chain) VALUES(:ip, :host, :port, :curdate, :sha1_fingerprint, :sha256_fingerprint, :sha1_issuers_fingerprints_chain, :sha256_issuers_fingerprints_chain );");
    $stmt->execute(array(':ip' => $service->ip, ':host' => $host_fqdn, ':port' => $request_port, ':curdate' => $curdate, 'sha1_fingerprint' => $certificate->fingerprints->sha1, 'sha256_fingerprint' => $certificate->fingerprints->sha256,  'sha1_issuers_fingerprints_chain' => $sha1_issuers_fingerprints_chain, 'sha256_issuers_fingerprints_chain' => $sha256_issuers_fingerprints_chain));    
}

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
 * Get certificate of a service.
 *
 * @param object $service service to test
 * @return object Returns certificate or null if not found
 */
function getCertificate($service) {
    $certificate = null;

    $context = stream_context_create(['ssl' => ['capture_peer_cert_chain' => true, 'verify_peer' => false, 'verify_peer_name' => false, 'SNI_enabled' => true, 'peer_name' => $service->host]]);
    $ip_formated = (strpos($service->ip, ':') !== false) ? '['.$service->ip.']' : $service->ip;
    $socketClient = @stream_socket_client("ssl://$ip_formated:{$service->port}", $errno, $errstr, SOCKET_TIMEOUT, STREAM_CLIENT_CONNECT, $context);
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
?>
