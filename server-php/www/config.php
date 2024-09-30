<?php

$PRIVATE_KEY='/path/to/your/private/key';
$CERT_SHA256='SHA256_FINGERPRINT_OF_YOUR_SERVER_S_HTTPS_CERTIFICATE';
$TRUSTED_HOSTS=['checkmyhttps.net','www.checkmyhttps.net','185.235.207.57'];

//Set this variable to false if you don't want to use the cache
$use_cache = true;

$path_to_cache = "/var/tmp/cmh_cache/";

//Max duree of cache (default: 21600 seconds = 6 hours)
$cacheTTL = 21600;