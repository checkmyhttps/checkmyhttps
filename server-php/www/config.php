<?php

$PRIVATE_KEY='/path/to/your/private/key';
$TRUSTED_HOSTS=['checkmyhttps.net','www.checkmyhttps.net','185.235.207.57'];

//Set this variable to false if you don't want to use the cache
$use_cache = true;

$path_to_cache = "/var/tmp/cmh_cache/";

//Max duration of cache (default: 21600 seconds = 6 hours)
$cacheTTL = 21600;
