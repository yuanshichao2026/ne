<?php
session_start();

// If user is already logged in, redirect to the admin dashboard
if (isset($_SESSION['loggedin']) && $_SESSION['loggedin'] === true) {
    header('location: index.php');
    exit;
}

$username = 'admin';
$password = 'password'; // In a real application, use password_hash()
$login_error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!empty($_POST['username']) && !empty($_POST['password'])) {
        if ($_POST['username'] === $username && $_POST['password'] === $password) {
            $_SESSION['loggedin'] = true;
            $_SESSION['username'] = $username;
            header('location: index.php');
        } else {
            $login_error = '无效的用户名或密码。';
        }
    } else {
        $login_error = '请输入用户名和密码。';
    }
}
?>

<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>后台登录</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            background-color: #f8f9fa;
        }
        .login-form {
            width: 100%;
            max-width: 400px;
            padding: 15px;
        }
    </style>
</head>
<body>
    <div class="login-form text-center">
        <h1 class="h3 mb-3 fw-normal">后台管理登录</h1>
        <form action="<?php echo htmlspecialchars($_SERVER['PHP_SELF']); ?>" method="post">
            <div class="form-floating mb-3">
                <input type="text" class="form-control" id="username" name="username" placeholder="用户名">
                <label for="username">用户名</label>
            </div>
            <div class="form-floating mb-3">
                <input type="password" class="form-control" id="password" name="password" placeholder="密码">
                <label for="password">密码</label>
            </div>
            <button class="w-100 btn btn-lg btn-primary" type="submit">登录</button>
            <?php if(!empty($login_error)): ?>
                <div class="alert alert-danger mt-3"><?php echo $login_error; ?></div>
            <?php endif; ?>
        </form>
    </div>
</body>
</html>
