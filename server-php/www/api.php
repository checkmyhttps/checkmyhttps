<?php

include __DIR__ . '/config.php';

define('INSTANCE_TITLE', 'CheckMyHTTPS API server');
define('VERSION', '1.7.0');
define('SOCKET_TIMEOUT', ini_get('default_socket_timeout') / 10);
define('CMH_DEBUG', false);

header('Content-Type: application/json');

// DNS record found in cache ?
$cacheFound = false;
$insertInCache = true;
$canWrite = -1;

// Allow to check private IP addresses
$allowPrivateIp = false;

// Information page
if (isset($_GET['info'])) {
	$response = (object) [
		'version' => VERSION,
		'title'   => INSTANCE_TITLE
	];
	echo json_encode(hashAndEncrypt($response));
	exit();
}

// User inputs
$data = json_decode( file_get_contents("php://input") );

// For GET and POST requests
// === 1. HOST
$raw_host = filter_input(INPUT_GET, 'host', FILTER_SANITIZE_STRING) ?? (isset($data->host) ? filter_var($data->host, FILTER_SANITIZE_STRING) : null);

if ($raw_host !== null && $raw_host !== false && $raw_host !== '') {
    $request_host = $raw_host;
}

// === 2. PORT
$raw_port = filter_input(INPUT_GET, 'port', FILTER_SANITIZE_NUMBER_INT) ?? (isset($data->port) ? filter_var($data->port, FILTER_SANITIZE_NUMBER_INT) : null);

if ($raw_port !== null && $raw_port !== false && $raw_port !== '') {
    $request_port = $raw_port;
}

// === 3. IP
$raw_ip = filter_input(INPUT_GET, 'ip', FILTER_SANITIZE_STRING) ?? (isset($data->ip) ? filter_var($data->ip, FILTER_SANITIZE_STRING) : null);

if ($raw_ip !== null && $raw_ip !== false && $raw_ip !== '') {
    if (filter_var($raw_ip, FILTER_VALIDATE_IP)) {
        $request_ip = $raw_ip;
    }
}

// Service requested by the user
$service = (object) [
	'host' => null,
	'port' => null,
	'ip'   => null
];

// Check port
if (isset($request_port))
{
	if(is_numeric($request_port) && (0 <= intval($request_port) && intval($request_port) <= 65535))
		$service->port = intval($request_port);
}

if (empty($service->port))
{
	echo json_encode(hashAndEncrypt((object)['error' => 'UNKNOWN_PORT']));
	exit();
}

if (isset($request_ip))
{
	$service->ip = $request_ip;
}

// Check hostname
if (isset($request_host))
{
	// If not IDN then Punycode covertion will make the domain the same. If IDN then convert it to Punycode
	$request_host = unicodeToPunycode($request_host);

	if ($request_host !== false) {
		$service->host = $request_host;
	}

	// Get IP address
	if (!$allowPrivateIp && !empty($service->host))
	{
		if (filter_var($service->host, FILTER_VALIDATE_IP))
			$service->ip = $service->host;
		else
		{
			$host_fqdn = ((!preg_match('/\.$/', $service->host)) ? $service->host.'.' : $service->host); // prevent DNS requests with the local server domain suffixed
			
			if($use_cache === true)
			{
				if(isset($service->ip))
					$cachename = $path_to_cache.$host_fqdn."_".$request_port."_".$service->ip;
				else
					$cachename = $path_to_cache.$host_fqdn."_".$request_port;

				$curdate = time();

				// Looking for a DNS + fingerprints record in cache
				if (file_exists($cachename))
				{
					$cacheFound = true;
					$insertInCache = false;

					$cache = file_get_contents($cachename);

					$cache_exploded = explode("\n", $cache);

					$ip = $cache_exploded[0];
					$sha256cache = $cache_exploded[1];
					$sha256cacheissuers = $cache_exploded[2];

					$cachetimestamp = filemtime($cachename);

					$time_passed = $curdate - $cachetimestamp;
					if($time_passed > $cacheTTL) // Old cache, we need to update it
					{
						$files = glob($path_to_cache."*");
						foreach($files as $file)
						{
							if(is_file($file))
							{
								if($curdate - filemtime($file) > $cacheTTL)
									unlink($file);
							}
						}
						// We delete the old cache row and all the older records
						$insertInCache = true;
						$cacheFound = false;
					}
				}
			}

			// DNS record not found in cache, or it was too old, or ip@ already given by the client
			if($cacheFound === false && !isset($service->ip))
			{
				$insertInCache = true;
				// Request IPv4 of the domain name
				$ip = gethostbyname($host_fqdn);
				if($ip !== $host_fqdn)
					$service->ip = $ip;
				else
				{
					// Try with IPv6
					$ip = dns_get_record($host_fqdn, DNS_AAAA);
					if(($ip !== false) && (!empty($ip)) && isset($ip[0]['ipv6']))
						$service->ip = $ip[0]['ipv6'];
					else
						$insertInCache = false;
				}
			}
			else if (!isset($service->ip))
				$service->ip = $ip;
		}
	}
}

if (empty($service->host) || empty($service->ip))
{
	echo json_encode(hashAndEncrypt((object)['error' => 'UNKNOWN_HOST']));
	exit();
}

// Replace this array with your server's FQDNs and public IP addresses :
if (in_array($service->host, $TRUSTED_HOSTS)) $service->ip = '127.0.0.1';

// If not own server and IP address is invalid or private/reserved
if ((!$allowPrivateIp) && ($service->ip !== '127.0.0.1') && (!filter_var($service->ip, FILTER_VALIDATE_IP, ['flags' => (FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)])))
{
	echo json_encode(hashAndEncrypt((object)['error' => 'PRIVATE_HOST']));
	exit();
}

// No record found in cache, so, we can fetch the certificates chain
if ($cacheFound === false)
{
	$certificate = getCertificate($service);
	if($certificate === null || $certificate === '')
	{
		echo json_encode(hashAndEncrypt((object)['error' => 'HOST_UNREACHABLE']));
		exit();
	}
}
else
{
	// Write fingerprints from cache to send them to the client
	$certificate = (object) [
		'fingerprints' => (object) [
		'sha256' => $sha256cache
		]
	];
	$nbIssuers = strlen($sha256cacheissuers) / 64;
	$tmpIssuer = $certificate;

	$sha256_issuers_fingerprints_chain = $sha256cacheissuers;

	// Write issuers fingerprints
	while($nbIssuers > 0)
	{
		$tmpIssuer->issuer = (object) [
			'fingerprints' => (object) [
			'sha256' => null
			]
		];
		$tmpIssuer = $tmpIssuer->issuer;
		$tmpIssuer->fingerprints->sha256 = substr($sha256cacheissuers, 0, 64);
		$nbIssuers = $nbIssuers - 1;

		$sha256cacheissuers = substr($sha256cacheissuers, 64);
	}
}

$ip_formated = (strpos($service->ip, ':') !== false) ? '['.$service->ip.']' : $service->ip;
$certificate->host        = $service->host.':'.$service->port;
$certificate->host_ip     = $ip_formated.':'.$service->port;

if ($insertInCache === true && $use_cache === true)
{
	$sha256_issuers_fingerprints_chain = "";
	$tmpCert = $certificate;
	while (isset($tmpCert->issuer))
	{
		$sha256_issuers_fingerprints_chain = $sha256_issuers_fingerprints_chain.$tmpCert->issuer->fingerprints->sha256;
		$tmpCert = $tmpCert->issuer;
	}

	$canWrite = file_put_contents($cachename, $service->ip."\n".$certificate->fingerprints->sha256."\n".$sha256_issuers_fingerprints_chain."\n", FILE_APPEND | LOCK_EX);

	// Can't write in cache, probably full
	if($canWrite === false)
	{
		// Empty the cache
		$files = glob($path_to_cache."*");
		foreach($files as $file)
		{
			if(is_file($file))
				unlink($file);
		}
	}
}

echo json_encode(hashAndEncrypt($certificate));
exit();

/**
 * Format the certificate chain.
 *
 * @param array $certificateChain certificate chain
 * @return object Returns formatted certificate chain
 */
function formatCertificateChain($certificateChain)
{
	if(($certificateChain === null) || empty($certificateChain))
		return null;

	$cert = array_shift($certificateChain);

	$certificate = (object) [
		'fingerprints' => (object) [
		'sha256' => strtoupper(openssl_x509_fingerprint($cert, 'sha256'))
		]
	];

	if(!empty($certificateChain))
		$certificate->issuer = formatCertificateChain($certificateChain);

	return $certificate;
}

/**
 * Get certificate of a service.
 *
 * @param object $service service to test
 * @return object Returns certificate or null if not found
 */
function getCertificate($service)
{
	$certificate = null;

	$context = stream_context_create(['ssl' => ['capture_peer_cert_chain' => true, 'verify_peer' => false, 'verify_peer_name' => false, 'SNI_enabled' => true, 'peer_name' => $service->host]]);
	$ip_formated = (strpos($service->ip, ':') !== false) ? '['.$service->ip.']' : $service->ip;
	$socketClient = @stream_socket_client("ssl://$ip_formated:{$service->port}", $errno, $errstr, SOCKET_TIMEOUT, STREAM_CLIENT_CONNECT, $context);
	if(!$socketClient)
	{
		if(CMH_DEBUG)
		{
			echo json_encode(hashAndEncrypt((object)['error' => true, 'errno' => $errno, 'errstr' => utf8_encode($errstr)]), JSON_UNESCAPED_UNICODE);
			exit();
		}
	}
	else
	{
		$ctx  = stream_context_get_params($socketClient);
		fclose($socketClient);

		$certificate = formatCertificateChain($ctx['options']['ssl']['peer_certificate_chain']);
	}

	return $certificate;
}

/**
 * Fills a string with all the fields of an object.
 *
 * @param object $obj the object we want to make a string with
 * @param string &$str the string where the result will be put
 */
function objToString($obj, &$str)
{
	foreach ($obj as $member => $val)
	{
		if(is_object($val))
		{
			if(get_class($val) === 'stdClass')
				objToString($val, $str);
			else
				$str = $str.$val;
		}
		else if ($val === false)
			$str = $str."0";
		else
			$str = $str.$val;
	}
}

/**
 * Hashes the response and encrypts the hash.
 *
 * @param object $response response of the server
 * @return object Returns response with its encrypted hash
 */
function hashAndEncrypt($response)
{
	global $PRIVATE_KEY;
	
	$private_key = file_get_contents($PRIVATE_KEY);

	$response_to_sign = "";

	// Concatenates all the fields of the response to a single string
	objToString($response, $response_to_sign);

	$signature = "";

	if(!openssl_sign($response_to_sign, $signature, $private_key, "RSA-SHA256"))
		return ['error' => 'ENCRYPTION_IMPOSSIBLE'];

	$response->signature = base64_encode($signature);

	return $response;
}

/**
 * Get port from scheme.
 *
 * @param string $protocol protocol
 * @return int Returns port number or null if not found
 */
function getPortFromScheme($protocol)
{
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

function unicodeToPunycode($input) {
    $normalized = \Normalizer::normalize($input, \Normalizer::FORM_C);
	if ($normalized === false || $normalized === '') {
        return false;
    }
    $punycode = idn_to_ascii($normalized, IDNA_DEFAULT, INTL_IDNA_VARIANT_UTS46);
    return $punycode !== false ? $punycode : false;
}

function punycodeToUnicode($input) {
    $unicode = idn_to_utf8($input, IDNA_DEFAULT, INTL_IDNA_VARIANT_UTS46);
    $normalized = \Normalizer::normalize($unicode, \Normalizer::FORM_C);
    return $normalized;
}

?>