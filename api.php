<?php
header('Content-Type: application/json');

$type = $_GET['type'] ?? '';

$filePath = '';

if ($type === 'courses') {
    $filePath = __DIR__ . '/admin/data/courses.json';
} elseif ($type === 'team') {
    $filePath = __DIR__ . '/admin/data/team.json';
}

if (file_exists($filePath)) {
    echo file_get_contents($filePath);
} else {
    http_response_code(404);
    echo json_encode(['error' => 'Data not found']);
}
