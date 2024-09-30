<?php

include __DIR__ . '/vendor/autoload.php';

include __DIR__ . '/config.php';

define('INSTANCE_TITLE', 'CheckMyHTTPS API server');
define('VERSION', '1.6.0');
define('SOCKET_TIMEOUT', ini_get('default_socket_timeout'));
define('CMH_DEBUG', false);

header('Content-Type: application/json');

//DNS record found in cache ?
$cacheFound = false;
$insertInCache = true;
$canWrite = -1;

// Allow check private IP
$allowPrivateIp = false;

// Do not send a dedicated message for private domains
$privateDomainsHidden = false;

// List of private domains
$privateDomains = [
    // 'localhost'
];

$sign = false;

if (isset($_GET['sign'])) $sign = true;

// Information page
if (isset($_GET['info'])) {
	$response = (object) [
		'version' => VERSION,
		'title'   => INSTANCE_TITLE
	];
	echo json_encode(hashAndEncrypt($response, $sign));
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
if ((isset($request_url)) && (!isset($request_host) && !isset($request_port)))
{
	if ((!filter_var($request_url, FILTER_VALIDATE_URL)) && (!filter_var((new \Mso\IdnaConvert\IdnaConvert)->encode($request_url), FILTER_VALIDATE_URL)))
	{
		echo json_encode(hashAndEncrypt((object)['error' => 'INVALID_URL'], $sign));
		exit();
	}
	else
	{
		$url = parse_url($request_url);
		$request_host = isset($url['host']) ? $url['host'] : null;
		$request_port = isset($url['port']) ? $url['port'] : null;

		if (($request_port === null) && (isset($url['scheme'])))
		{
			$request_port = getPortFromScheme($url['scheme']);
		}
	}
}

if(isset($request_ip))
{
	if (filter_var($request_ip, FILTER_VALIDATE_IP) && strpos($request_ip, ':') === false)
		$service->ip = $request_ip;
}

// Check hostname
if (isset($request_host))
{
	if (preg_match('/^[a-zA-Z0-9-_.]+$/', $request_host))
		$service->host = $request_host;
	else
	{
		// Convert IDNA 2008
		$request_host = (new \Mso\IdnaConvert\IdnaConvert)->encode($request_host);

		if (preg_match('/^[a-zA-Z0-9-_.]+$/', $request_host))
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

				//Looking for a DNS + fingerprints record in cache
				if (file_exists($cachename))
				{
					$cacheFound = true;
					$insertInCache = false;

					$cache = file_get_contents($cachename);

					$cache_exploded = explode("\n", $cache);

					$ip = $cache_exploded[0];
					$sha1cache = $cache_exploded[1];
					$sha256cache = $cache_exploded[2];
					$sha1cacheissuers = $cache_exploded[3];
					$sha256cacheissuers = $cache_exploded[4];

					$cachetimestamp = filemtime($cachename);

					$time_passed = $curdate - $cachetimestamp;
					if($time_passed > $cacheTTL) //Old cache, we need to update it
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
						//We delete the old cache row and all the older records
						$insertInCache = true;
						$cacheFound = false;
					}
				}
			}
			//DNS record not found in cache, or it was too old, or ip@ already given by the client
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

// Check port
if (isset($request_port))
{
	if(is_numeric($request_port) && (0 <= intval($request_port) && intval($request_port) <= 65535))
		$service->port = intval($request_port);
}

if(empty($service->host) || empty($service->ip))
	exit(json_encode(hashAndEncrypt((object)['error' => 'UNKNOWN_HOST'], $sign)));

if(empty($service->port))
	exit(json_encode(hashAndEncrypt((object)['error' => 'UNKNOWN_PORT'], $sign)));

// Replace this array with your server's FQDNs and public IP addresses :
if (in_array($service->host, $TRUSTED_HOSTS)) $service->ip = '127.0.0.1';

if((!$allowPrivateIp) && ($service->ip !== '127.0.0.1') && (!filter_var($service->ip, FILTER_VALIDATE_IP, ['flags' => (FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)])))
{
	if(($privateDomainsHidden) && ($service->ip !== $service->host))
		exit(json_encode(hashAndEncrypt((object)['error' => 'HOST_UNREACHABLE'], $sign)));
	else
		exit(json_encode(hashAndEncrypt((object)['error' => 'PRIVATE_HOST'], $sign)));
}

if(in_array($service->host, $privateDomains))
{
	if($privateDomainsHidden)
		exit(json_encode(hashAndEncrypt((object)['error' => 'HOST_UNREACHABLE'], $sign)));
	else
		exit(json_encode(hashAndEncrypt((object)['error' => 'PRIVATE_HOST'], $sign)));
}

//No record found in cache, so, we can fetch the certificates chain
if($cacheFound === false)
{
	$certificate = getCertificate($service);
	if($certificate === null)
	{
		echo json_encode(hashAndEncrypt((object)['error' => 'HOST_UNREACHABLE'], $sign));
		exit();
	}
}
else
{
	//Write fingerprints from cache to send them to the client
	$certificate = (object) [
		'fingerprints' => (object) [
		'sha1'   => $sha1cache,
		'sha256' => $sha256cache
		]
	];
	$nbIssuers = strlen($sha1cacheissuers) / 40;
	$tmpIssuer = $certificate;

	$sha1_issuers_fingerprints_chain = $sha1cacheissuers;
	$sha256_issuers_fingerprints_chain = $sha256cacheissuers;

	//Write issuers fingerprints
	while($nbIssuers > 0)
	{
		$tmpIssuer->issuer = (object) [
			'fingerprints' => (object) [
			'sha1'   => null,
			'sha256' => null
			]
		];
		$tmpIssuer = $tmpIssuer->issuer;
		$tmpIssuer->fingerprints->sha1 = substr($sha1cacheissuers, 0, 40);
		$tmpIssuer->fingerprints->sha256 = substr($sha256cacheissuers, 0, 64);
		$nbIssuers = $nbIssuers - 1;

		$sha1cacheissuers = substr($sha1cacheissuers, 40);
		$sha256cacheissuers = substr($sha256cacheissuers, 64);
	}
}

$ip_formated = (strpos($service->ip, ':') !== false) ? '['.$service->ip.']' : $service->ip;
$certificate->host        = $service->host.':'.$service->port;
$certificate->host_raw    = $ip_formated  .':'.$service->port;
$certificate->whitelisted = checkHostWhitelisted($service->host);

if($insertInCache === true && $use_cache === true)
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

	$canWrite = file_put_contents($cachename, $service->ip."\n".$certificate->fingerprints->sha1."\n".$certificate->fingerprints->sha256."\n".$sha1_issuers_fingerprints_chain."\n".$sha256_issuers_fingerprints_chain."\n", FILE_APPEND | LOCK_EX);

	//Can't write in cache, probably full
	if($canWrite === false)
	{
		//Empty the cache
		$files = glob($path_to_cache."*");
		foreach($files as $file)
		{
			if(is_file($file))
				unlink($file);
		}
	}
}

echo json_encode(hashAndEncrypt($certificate, $sign));
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
		'sha1'   => strtoupper(openssl_x509_fingerprint($cert, 'sha1')),
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
			echo json_encode(hashAndEncrypt((object)['error' => true, 'errno' => $errno, 'errstr' => utf8_encode($errstr)], $sign), JSON_UNESCAPED_UNICODE);
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
 * @param string $sign set to true if the client wants the server's signature
 * @return object Returns response with its encrypted hash if the parameter $sign is true
 */
function hashAndEncrypt($response, $sign)
{
	global $PRIVATE_KEY, $CERT_SHA256;
	if(!$sign)
		return $response;

	$private_key = file_get_contents($PRIVATE_KEY);

	$response->cmh_sha256 = $CERT_SHA256;

	$response_to_sign = "";

	//Concatenates all the fields of the response to a single string
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

/**
 * Check if a host is whitelisted.
 *
 * @param string $host Host
 * @return bool
 */
function checkHostWhitelisted($host)
{
	$whitelist = include 'api_whitelist.php';

	if(in_array($host, $whitelist['domains']))
		return true;

	foreach ($whitelist['domains_re'] as $regex)
	{
		if(preg_match("/$regex/", $host))
			return true;
	}
	return false;
}
?> 
