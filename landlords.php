<?php
header('Content-Type: text/paint; charset=utf-8');

try {
	$pdo=new PDO('mysql:host=localhost;dbname=landlords', 'root', '123456');
}catch(PDOException $e){
    echo 'PDO-MySQL连接错误 : ',$e->getMessage();
    exit;
}

$pdo->exec('SET NAMES \'utf8\'');

print_r(prepare('SHOW TABLES')->fetchAll(PDO::FETCH_COLUMN, 0));

function prepare($sql, array $params = array()) {
	global $pdo;

	try {
		$stmt = $pdo->prepare($sql);
		if(!$stmt->execute($params)) {
			echo 'SQL: ', $sql, PHP_EOL, '错误代码: ', $stmt->errorCode(), PHP_EOL, '错误消息：', $stmt->errorInfo();
			exit;
		}

		return $stmt;
	} catch(PDOException $e) {
		echo 'SQL: ', $sql, PHP_EOL, '错误代码: ', $e->getCode(), PHP_EOL, '错误消息：', $e->getMessage(), PHP_EOL, PHP_EOL, $e->getTraceAsString();

		exit;
	}
}

function renderJson($json) {
	@header('Content-Type: application/json; charset=utf-8');

	echo json_encode($json);

	exit;
}
