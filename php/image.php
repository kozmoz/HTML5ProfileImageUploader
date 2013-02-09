<?php

/**
 * Bypass Cross-Origin Resource Sharing.
 */

$imageUrl = isset($_GET['url']) ? $_GET['url'] : '';

if (empty($imageUrl)) {
    header('HTTP/1.1 404 Not Found');
    header("Content-Type: text/plain");
    return;
}

try {

    $imageType = @exif_imagetype($imageUrl);
    if ($imageType != IMAGETYPE_GIF && $imageType != IMAGETYPE_JPEG && $imageType != IMAGETYPE_PNG) {
        throw new Exception('The URL does not contain an image');
    }

    $mimeTypes = array();
    $mimeTypes[IMAGETYPE_GIF] = 'image/gif';
    $mimeTypes[IMAGETYPE_JPEG] = 'image/jpeg';
    $mimeTypes[IMAGETYPE_PNG] = 'image/png';

    header('Content-Type: ' . $mimeTypes[$imageType]);

    // Caching, image jaar geldig.
    define('ONE_YEAR_SECONDS', 31536000);

    header('Pragma: public');
    header('Cache-Control: public,maxage=' . ONE_YEAR_SECONDS);
    header('Date: ' . gmdate('D, d M Y H:i:s', time()) . ' GMT');
    header('Expires: ' . gmdate('D, d M Y H:i:s', (time() + ONE_YEAR_SECONDS)) . ' GMT');

    header_remove('Set-Cookie');

    readfile($imageUrl);

} catch (Exception $e) {
    $message = $e->getMessage();
    $cause = $e->getPrevious() ? $e->getPrevious()->getMessage() : '';
    header("HTTP/1.1 501 Internal Server Error");
    header("Content-Type: text/plain");
    echo $message;
    echo $cause;
}

