<?php
session_start();

// If user is not logged in, redirect to the login page
if (!isset($_SESSION['loggedin']) || $_SESSION['loggedin'] !== true) {
    header('location: login.php');
    exit;
}

// Function to read data from JSON file
function getData($filename) {
    $filePath = __DIR__ . '/data/' . $filename;
    if (file_exists($filePath)) {
        $json = file_get_contents($filePath);
        return json_decode($json, true);
    }
    return [];
}

$courses = getData('courses.json');
$team = getData('team.json');

?>

<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>后台管理</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>

<nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container">
        <a class="navbar-brand" href="#">管理面板</a>
        <div class="collapse navbar-collapse">
            <ul class="navbar-nav ms-auto">
                <li class="nav-item">
                    <a class="nav-link" href="logout.php">退出</a>
                </li>
            </ul>
        </div>
    </div>
</nav>

<div class="container mt-5">
    <h2>课程管理</h2>
    <a href="#" class="btn btn-success mb-3">+ 添加新课程</a>
    <table class="table table-bordered">
        <thead>
            <tr>
                <th>标题</th>
                <th>描述</th>
                <th>操作</th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($courses as $index => $course): ?>
            <tr>
                <td><?php echo htmlspecialchars($course['title']); ?></td>
                <td><?php echo htmlspecialchars($course['description']); ?></td>
                <td>
                    <a href="#" class="btn btn-primary btn-sm">编辑</a>
                    <a href="#" class="btn btn-danger btn-sm">删除</a>
                </td>
            </tr>
            <?php endforeach; ?>
        </tbody>
    </table>

    <h2 class="mt-5">团队管理</h2>
    <a href="#" class="btn btn-success mb-3">+ 添加新成员</a>
    <table class="table table-bordered">
        <thead>
            <tr>
                <th>姓名</th>
                <th>职位</th>
                <th>操作</th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($team as $index => $member): ?>
            <tr>
                <td><?php echo htmlspecialchars($member['name']); ?></td>
                <td><?php echo htmlspecialchars($member['title']); ?></td>
                <td>
                    <a href="#" class="btn btn-primary btn-sm">编辑</a>
                    <a href="#" class="btn btn-danger btn-sm">删除</a>
                </td>
            </tr>
            <?php endforeach; ?>
        </tbody>
    </table>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
