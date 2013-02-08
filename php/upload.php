<?php

$handle = fopen("php://input", "r");

$size = 0;
while (!feof($handle)) {
    $buffer = fread($handle, 1028);
    $size += strlen($buffer);
}

echo "File size: $size bytes";

