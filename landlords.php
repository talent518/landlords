<?php
header('Content-Type: text/paint; charset=utf-8');

define('TIMESTAMP', microtime(true));

try {
	$pdo=new PDO('mysql:host=localhost;dbname=landlords', 'root', '123456');
}catch(PDOException $e) {
    echo 'PDO-MySQL连接错误 : ', $e->getMessage();
    exit;
}

$pdo->exec('SET NAMES \'utf8\'');

if(isset($_POST['action']) && function_exists($action = 'action' . ucfirst($_POST['action']))) {
	session_start();

	$isNeedLogin = ($action !== 'actionLogin' && $action !== 'actionRegister');
	$isLogined = isset($_SESSION['landlords']);

	if(!$isNeedLogin && $isLogined) {
		renderJson(array(
			'msg' => '已登录过！',
			'addClass' => 'logined',
			'eval' => 'var self=this;this.message(json.msg, 0, function() {self.wrapperElem.addClass(json.addClass);});'
		));
	}

	if($isNeedLogin && !$isLogined) {
		renderJson($action === 'actionInit' ? '' : array(
			'msg' => '请先登录！',
			'removeClass' => 'logined started',
			'eval' => 'var self=this;this.message(json.msg, 0, function() {self.wrapperElem.removeClass(json.removeClass)});'
		));
	}

	if($isLogined) {
		if($_SESSION['regenerateDateline'] + 300 < TIMESTAMP) {
			session_regenerate_id(true);

			$_SESSION['regenerateDateline'] = TIMESTAMP;
		}
		$_POST = array_merge($_POST, $_SESSION['landlords']);
	}

	try {
		renderJson(runFunction($action, $_POST));
	} catch(Exception $e) {
		echo 'Error: ', $e->getMessage(), PHP_EOL;
		exit($e->getTraceAsString());
	}
} else {
	exit('无效的请求！');
}

function renderJson($json) {
	@header('Content-Type: application/json; charset=utf-8');

	exit(json_encode($json));
}

function prepare($sql, array $params = array()) {
	global $pdo;

	try {
		$stmt = $pdo->prepare($sql);
		if(!$stmt->execute($params)) {
			echo 'SQL: ', $sql, PHP_EOL, '错误代码: ', $stmt->errorCode(), PHP_EOL, '错误消息：', $stmt->errorInfo(), PHP_EOL, PHP_EOL;
			debug_print_backtrace();
			exit;
		}

		return $stmt;
	} catch(PDOException $e) {
		echo 'SQL: ', $sql, PHP_EOL, '错误代码: ', $e->getCode(), PHP_EOL, '错误消息：', $e->getMessage(), PHP_EOL, PHP_EOL, $e->getTraceAsString(), PHP_EOL, PHP_EOL;
		debug_print_backtrace();
		exit;
	}
}

function runFunction($funcName, array & $params = array()) {
	$method = new ReflectionFunction ( $funcName );

	if ($method->getNumberOfParameters () === 0) {
		return $funcName ();
	}

	$ps=array();
	foreach($method->getParameters() as $i=>$param) {
		$name=$param->getName();
		if(array_key_exists($name, $params)) {
			if($param->isArray()) {
				if($param->isPassedByReference()) {
					if(is_array($params[$name])) {
						$ps[] =  & $params[$name];
					} else {
						$ps[][] = & $params[$name];
					}
				} else
					$ps[] = is_array($params[$name]) ? $params[$name] : array($params[$name]);
			} elseif($param->isPassedByReference())
				$ps[] = & $params[$name];
			else
				$ps[] = $params[$name];
		} elseif($param->isDefaultValueAvailable()) {
			$params[$name] = $param->getDefaultValue();
			$ps[] = $param->getDefaultValue();
		} else {
			echo '没有指定函数 ', $funcName, ' 的参数 ', $name, ' 的值 !', PHP_EOL, PHP_EOL;
			debug_print_backtrace();
			exit;
		}
	}

	return $method->invokeArgs($ps);
}

/**
 * 表单验证
 * 
 * @param array $data 要验证的数据
 * @param array $rules 验证规则
 * @param array $labels $data的key的标签(字段说明文字)
 */
function validForm(array $data, array $rules, array $labels = array(), array &$messages = array()) {
	foreach($rules as $rule) {
		$keys = preg_split('/[,\s]+/', array_shift($rule));
		$valid = 'valid' . ucfirst(array_shift($rule));

		$rule['formData'] = & $data;
		$rule['labels'] = & $labels;
		$rule['messages'] = & $messages;

		foreach($keys as $k) {
			if(isset($messages[$k])) {
				continue;
			}

			$rule['data'] = (isset($data[$k]) ? $data[$k] : null);
			$rule['key'] = $k;

			$msg = runFunction($valid, $rule);

			if(is_string($msg)) {
				$replaces = array();
				foreach($rule as $_k => $_v) {
					$replaces['{' . $_k . '}'] = $_v;
				}
				$replaces['{label}'] = (isset($labels[$k]) ? $labels[$k] : $k);
				$messages[$k] = strtr($msg, $replaces);
			}
		}
	}

	return $messages;
}

/**
 * 是否为空
 * 
 * @param mixed $data 数据是否为空
 */
function isEmpty($data) {
	return $data === null || $data === '' || $data === array() || preg_match('/^\s+$/', $data);
}

/**
 * 验证不为空
 * 
 * @param mixed $data 要验证的数据
 * @param string $message 不通过消息
 */
function validRequired($data, $message = '{label} 不能为空') {
	if(isEmpty($data)) {
		return $message;
	}
}

/**
 * 验证在列表中
 * 
 * @param mixed $data 要验证的数据
 * @param array $in 列表数据
 * @param string $message 不通过消息
 */
function validIn($data, array $in, $message = '{label} 不在列表[{list}]中') {
	if(isEmpty($data)) return;

	if(!in_array($data, $in, true)) {
		return str_replace('{list}', implode(', ', $in), $message);
	}
}

/**
 * 验证不在列表中
 * 
 * @param mixed $data 要验证的数据
 * @param array $in 列表数据
 * @param string $message 不通过消息
 */
function validNotIn($data, array $in, $message = '{label} 在列表[{list}]中') {
	if(isEmpty($data)) return;

	if(in_array($data, $in, true)) {
		return str_replace('{list}', implode(', ', $in), $message);
	}
}

/**
 * 验证等于某值
 * 
 * @param mixed $data 要验证的数据
 * @param mixed $value 要等于的值
 * @param string $message 不通过消息
 */
function validEqual($data, $value, $message = '{label} 不等于 {value}') {
	if(isEmpty($data)) return;

	if($data !== $value) {
		return $message;
	}
}

/**
 * 验证等于某属性
 * 
 * @param mixed $data 要验证的数据
 * @param mixed $attr 要等于的属性
 * @param array $formData 表单数据(validForm的$data参数的值)
 * @param array $labels 表单数据(validForm的$labels参数的值)
 * @param string $message 不通过消息
 */
function validEqualTo($data, $attr, array & $formData, array &$labels, $message = '{label} 不等于 {attrLabel}') {
	if(isEmpty($data)) return;

	if((isset($formData[$attr]) && $data !== $formData[$attr]) || (!isset($formData[$attr]) && !isEmpty($data))) {
		return str_replace('{attrLabel}', isset($labels[$attr]) ? $labels[$attr] : $attr, $message);
	}
}

/**
 * 验证电子邮件
 * 
 * @param mixed $data 要验证的数据
 * @param string $message 不通过消息
 */
function validEmail($data, $message = '{label} 不是合法的邮件地址格式') {
	if(isEmpty($data)) return;

	if(!preg_match('/^[_\.0-9a-z-]+@([0-9a-z][0-9a-z-]+\.)+[a-z]{2,3}$/i', $data)) {
		return $message;
	}
}

/**
 * 验证整数
 * 
 * @param mixed $data 要验证的数据
 * @param string $message 不通过消息
 */
function validInteger($data, $message = '{label} 不是整数格式') {
	if(isEmpty($data)) return;

	if(!preg_match('/^[\+\-]?[0-9]+$/', $data)) {
		return $message;
	}
}

/**
 * 验证无符号整数
 * 
 * @param mixed $data 要验证的数据
 * @param string $message 不通过消息
 */
function validUinteger($data, $message = '{label} 不是正整数格式') {
	if(isEmpty($data)) return;

	if(!preg_match('/^[0-9]+$/', $data)) {
		return $message;
	}
}

/**
 * 验证浮点数
 * 
 * @param mixed $data 要验证的数据
 * @param string $message 不通过消息
 */
function validFloat($data, $message = '{label} 不是浮点数格式') {
	if(isEmpty($data)) return;

	if(!preg_match('/^[\+\-]?[0-9]+(\.[0-9]+)?$/', $data)) {
		return $message;
	}
}

/**
 * 验证无符号浮点数
 * 
 * @param mixed $data 要验证的数据
 * @param string $message 不通过消息
 */
function validUfloat($data, $message = '{label} 不是无符号浮点数格式') {
	if(isEmpty($data)) return;

	if(!preg_match('/^[0-9]+(\.[0-9]+)?$/', $data)) {
		return $message;
	}
}

/**
 * 验证最小
 * 
 * @param mixed $data 要验证的数据
 * @param mixed $min 最小值
 * @param string $message 不通过消息
 */
function validMin($data, $min, $message = '{label} 不能小于 {min}') {
	if(isEmpty($data)) return;

	if($data < $min) {
		return $message;
	}
}

/**
 * 验证最大
 * 
 * @param mixed $data 要验证的数据
 * @param mixed $max 最大值
 * @param string $message 不通过消息
 */
function validMax($data, $max, $message = '{label} 不能大于 {min}') {
	if(isEmpty($data)) return;

	if($data > $max) {
		return $message;
	}
}

/**
 * 验证在min和max之间的数
 * 
 * @param mixed $data 要验证的数据
 * @param mixed $min 最小值
 * @param mixed $max 最大值
 * @param string $message 不通过消息
 */
function validRange($data, $min, $max, $message = '{label} 只能区于 {min} 和 {max} 之间的数') {
	if(isEmpty($data)) return;

	if($data > $max || $data < $min) {
		return $message;
	}
}

/**
 * 验证手机
 * 
 * @param mixed $data 要验证的数据
 * @param string $message 不通过消息
 */
function validMobile($data, $message = '{label} 不是合法的手机号') {
	if(isEmpty($data)) return;

	if(!preg_match('/^1(3|5|8)[0-9]{9}$/', $data)) {
		return $message;
	}
}

/**
 * 验证电话号
 * 
 * @param mixed $data 要验证的数据
 * @param string $message 不通过消息
 */
function validPhone($data, $message = '{label} 不是合法的电话号码') {
	if(isEmpty($data)) return;

	if(!preg_match('/^([0-9]{3,4}-?)?[0-9]{5,9}(-[0-9]{1,4})?$/', $data)) {
		return $message;
	}
}

/**
 * 验证IP地址
 * 
 * @param mixed $data 要验证的数据
 * @param string $message 不通过消息
 */
function validIp($data, $message = '{label} 不是合法的IPV4格式') {
	if(isEmpty($data)) return;

	if(!preg_match('/^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$/', $data)) {
		return $message;
	}
}

/**
 * 验证字最小长度
 * 
 * @param mixed $data 要验证的数据
 * @param mixed $min 最小长度
 * @param string $message 不通过消息
 */
function validMinLength($data, $min, $charset = 'UTF-8', $message = '{label} 最少 {min} 个字') {
	if(isEmpty($data)) return;

	if(mb_strlen($data, $charset) < $min) {
		return $message;
	}
}

/**
 * 验证字最大长度
 * 
 * @param mixed $data 要验证的数据
 * @param mixed $max 最大长度
 * @param string $message 不通过消息
 */
function validMaxLength($data, $max, $charset = 'UTF-8', $message = '{label} 最多 {max} 个字') {
	if(isEmpty($data)) return;

	if(mb_strlen($data, $charset) > $max) {
		return $message;
	}
}

/**
 * 验证字长度范围
 * 
 * @param mixed $data 要验证的数据
 * @param mixed $min 最小长度
 * @param mixed $max 最大长度
 * @param string $message 不通过消息
 */
function validRangeLength($data, $min, $max, $charset = 'UTF-8', $message = '{label} 最少 {min} 个字，最多 {max} 个字') {
	if(isEmpty($data)) return;

	if(mb_strlen($data, $charset) > $max || mb_strlen($data, $charset) < $min) {
		return $message;
	}
}

/**
 * 验证字固定长度
 * 
 * @param mixed $data 要验证的数据
 * @param mixed $length 长度
 * @param string $message 不通过消息
 */
function validLength($data, $length, $charset = 'UTF-8', $message = '{label} 不是 {length} 个字') {
	if(isEmpty($data)) return;

	if(mb_strlen($data, $charset) !== $length) {
		return $message;
	}
}

/**
 * 验证URL地址
 * 
 * @param mixed $data 要验证的数据
 * @param string $message 不通过消息
 */
function validUrl($data, $message = '{label} 不是合法的URL地址') {
	if(isEmpty($data)) return;

	if(!preg_match('/^(https?|ftp|rtsp|mms|gopher|mailto|ed2k|thunder|flashget|news):\/\/[a-z\-_0-9\.]+([a-z0-9]+)+.*$/i', $data)) {
		return $message;
	}
}

/**
 * 验证日期
 * 
 * @param mixed $data 要验证的数据
 * @param string $message 不通过消息
 */
function validDate($data, $message = '{label} 不是标准的日期格式') {
	if(isEmpty($data)) return;

	if(preg_match('/^[1-9][0-9]{3}\-[0-1]?[0-9]\-[0-3]?[0-9]$/', $data)) {
		list($year, $month, $day) = explode('-', $data);
	} elseif(preg_match('/^[1-9][0-9]{3}\/[0-1][0-9]\/[0-3][0-9]$/', $data)) {
		list($year, $month, $day) = explode('/', $data);
	} elseif(preg_match('/^[0-1][0-9]\/[0-3][0-9]\/[1-9][0-9]{3}$/', $data)) {
		list($month, $day, $year) = explode('/', $data);
	} else {
		return $message;
	}

	$year = intval($year);
	$month = intval($month);
	$day = intval($day);

	if($month==2) {
		if($year%4==0 && ($year%100!=0 || $year%400==0)) {
			if(!($day<=29 && $day>=1)) {
				return $message;
			}
		} else {
			if(!($day<=28 && $day>=1)) {
				return $message;
			}
		}
	} elseif(in_array($month,array('1','3','5','7','8','10','12'))) {
		if(!($day<=31 && $day>=1)) {
			return $message;
		}
	} else {
		if(!($day<=30 && $day>=1)) {
			return $message;
		}
	}
}

/**
 * 验证汉字
 * 
 * @param mixed $data 要验证的数据
 * @param string $message 不通过消息
 */
function validChinese($data, $message = '{label} 只能包括汉字') {
	if(isEmpty($data)) return;

	if(!preg_match('/^[\x21-\x7E\x{0391}-\x{FFE5}]+$/u', $data)) {
		return $message;
	}
}

/**
 * 验证英文
 * 
 * @param mixed $data 要验证的数据
 * @param string $message 不通过消息
 */
function validEnglish($data, $message = '{label} 只能包括英文') {
	if(isEmpty($data)) return;

	if(!preg_match('/^[\x21-\x7E]+$/', $data)) {
		return $message;
	}
}

/**
 * 验证用户名
 * 
 * @param mixed $data 要验证的数据
 * @param string $message 不通过消息
 */
function validUsername($data, $message = '{label} 只能以英文和汉字开头，后面可以包括英文、数字、下划线、汉字') {
	if(isEmpty($data)) return;

	if(!preg_match('/^[a-zA-Z\x{0391}-\x{FFE5}][a-zA-Z0-9_\x{0391}-\x{FFE5}]+$/u', $data)) {
		return $message;
	}
}

/**
 * 验证密码
 * 
 * @param mixed $data 要验证的数据
 * @param string $message 不通过消息
 */
function validPassword($data, $message = '{label} 只能包括英文、数字、下划线') {
	if(isEmpty($data)) return;

	if(!preg_match('/^[a-zA-Z0-9_]+$/i', $data)) {
		return $message;
	}
}

/**
 * 验证数据表记录唯一性验证
 * 
 * @param mixed $key 要验证的属性
 * @param mixed $data 要验证的数据
 * @param array $formData 表单数据(validForm的$data参数的值)
 * @param string $table 表名
 * @param string $sql 查询SQL
 * @param string $where 条件
 * @param array $params 预处理SQL语句参数
 * @param array $attrs 属性作为数据：array('field1','field2'); array('field1'=>'value1','field2'=>'value2');
 * @param string $message 不通过消息
 */
function validUnique($key, $data, array & $formData, $table = null, $sql = null, $where = null, array $params = array(), array $attrs = array(), $message = '{label} 已有记录 “{data}”') {
	if(isEmpty($data)) return;

	if($table && $sql === null) {
		$attrs[] = $key;
		$wheres = array();

		foreach($attrs as $k => $v) {
			if(!is_string($k)) {
				$k = $v;
				$v = (array_key_exists($k, $formData) ? $formData[$k] : '');
			}

			$wheres[] = '`' . $k . '` = :' . $k;

			$params[':' . $k] = $v;
		}

		if($where) {
			$wheres[] =  $where;
		}

		$sql = 'SELECT COUNT(1) FROM ' . $table . ' WHERE ' . implode(' AND ', $wheres);
	}

	if(!$sql) {
		return 'unique验证器没有指定table或sql参数';
	}

	if(prepare($sql, $params)->fetchColumn()) {
		return $message;
	}
}

/**
 * 验证自定义
 * 
 * @param mixed $data 要验证的数据
 * @param string $pattern 正则表达式匹配规则
 * @param string $message 不通过消息
 */
function validCustom($data, $pattern, $message) {
	if(isEmpty($data)) return;

	if(!preg_match('/' . $pattern . '/', $data)) {
		return $message;
	}
}

/**
 * 用户注册
 * 
 * @param string $username
 * @param string $password
 * @param string $repassword
 */
function actionRegister($username, $password, $repassword) {
	$messages = validForm(get_defined_vars(), array(
		array('username, password, repassword', 'required'),
		array('username', 'minlength', 'min'=>2),
		array('password, repassword', 'minlength', 'min'=>6),
		array('username', 'username'),
		array('password', 'password'),
		array('repassword', 'equalTo', 'attr'=>'password'),
		array('username', 'unique', 'table'=>'users'),
	), array(
		'username' => '帐号',
		'password' => '密码',
		'repassword' => '验密码'
	));

	if(!empty($messages)) {
		return array(
			'status'=>false,
			'messages'=>$messages
		);
	}

	$sql = 'INSERT INTO users (username, password, salt, dateline, createTime) VALUES (?, ?, ?, UNIX_TIMESTAMP(), NOW())';
	$salt = rand(111111, 999999);
	$params = array(
		$username,
		md5(md5($password) . $salt),
		$salt
	);

	return array(
		'status'=>prepare($sql, $params)->rowCount()
	);
}

/**
 * 用户登录
 * 
 * @param string $username
 * @param string $password
 */
function actionLogin($username, $password) {
	$messages = validForm(get_defined_vars(), array(
		array('username, password', 'required'),
		array('username', 'minlength', 'min'=>2),
		array('password', 'minlength', 'min'=>6),
		array('username', 'username'),
		array('password', 'password'),
	), array(
		'username' => '帐号',
		'password' => '密码'
	));

	if(!empty($messages)) {
		return array(
			'status'=>false,
			'messages'=>$messages
		);
	}

	$sql = 'SELECT uid, username, deskId, deskPosition, scores, isWoman FROM users WHERE `username` = ? AND `password` = MD5(CONCAT(md5(?), salt))';
	$params = array(
		$username,
		$password
	);

	$_SESSION['regenerateDateline'] = TIMESTAMP;
	$_SESSION['landlords'] = prepare($sql, $params)->fetch(PDO::FETCH_ASSOC);

	return array(
		'status'=>true
	);
}

// 用户退出
function actionLogout() {
	$landlords = $_SESSION['landlords'];

	unset($_SESSION['landlords']);

	return array(
		'removeClass' => 'logined started',
		'eval' => 'this.wrapperElem.removeClass(json.removeClass).find("[style]").removeAttr("style");'
	);
}

// 游戏初始化
function actionInit($uid, $username, $deskId, $deskPosition, $scores, $isWoman) {
	$isPlaying = false;

	$eval = <<<EOD
var self = this;

self.wrapperElem.addClass('logined');

$('.name', self.playerNameElem).attr('title', json.username).text(json.username);
self.playerScoreElem.text(json.scores);
if(json.isWoman) {
	self.playerAvatarElem.addClass('g-landlords-avatar-woman');
}
EOD;

	if($deskId) {
		$sql = 'SELECT * FROM desks WHERE deskId=?';
		$params = array($deskId);

		extract(prepare($sql, $params)->fetch(PDO::FETCH_ASSOC));

		if($aUid && $aUid !== $uid) {
			$sql = 'SELECT username, scores, isWoman FROM users WHERE uid=?';
			$params = array($aUid);
			list($aUsername, $aScores, $aIsWoman) = prepare($sql, $params)->fetch(PDO::FETCH_NUM);
		}

		if($bUid && $bUid !== $uid) {
			$sql = 'SELECT username, scores, isWoman FROM users WHERE uid=?';
			$params = array($bUid);
			list($bUsername, $bScores, $bIsWoman) = prepare($sql, $params)->fetch(PDO::FETCH_NUM);
		}

		if($cUid && $cUid !== $uid) {
			$sql = 'SELECT username, scores, isWoman FROM users WHERE uid=?';
			$params = array($cUid);
			list($cUsername, $cScores, $cIsWoman) = prepare($sql, $params)->fetch(PDO::FETCH_NUM);
		}

		$eval .= PHP_EOL;
		$eval .= PHP_EOL;

		$eval .= <<<EOD
if(json.aUid === json.uid) {
	if(json.bUid) {
		self.rightAvatarElem.show();
		self.rightNameElem.show();

		$('.name', self.rightNameElem).attr('title', json.bUsername).text(json.bUsername);
		self.rightScoreElem.text(json.bScores);

		if(json.bIsWoman) {
			self.rightAvatarElem.addClass('g-landlords-avatar-woman');
		} else {
			self.rightAvatarElem.removeClass('g-landlords-avatar-woman');
		}
	}
	if(json.cUid) {
		self.leftAvatarElem.show();
		self.leftNameElem.show();

		$('.name', self.leftNameElem).attr('title', json.cUsername).text(json.cUsername);
		self.leftScoreElem.text(json.cScores);

		if(json.cIsWoman) {
			self.leftAvatarElem.addClass('g-landlords-avatar-woman');
		} else {
			self.leftAvatarElem.removeClass('g-landlords-avatar-woman');
		}
	}
} else if(json.bUid === json.uid) {
	if(json.cUid) {
		self.rightAvatarElem.show();
		self.rightNameElem.show();

		$('.name', self.rightNameElem).attr('title', json.cUsername).text(json.cUsername);
		self.rightScoreElem.text(json.cScores);

		if(json.cIsWoman) {
			self.rightAvatarElem.addClass('g-landlords-avatar-woman');
		} else {
			self.rightAvatarElem.removeClass('g-landlords-avatar-woman');
		}
	}
	if(json.aUid) {
		self.leftAvatarElem.show();
		self.leftNameElem.show();

		$('.name', self.leftNameElem).attr('title', json.aUsername).text(json.aUsername);
		self.leftScoreElem.text(json.aScores);

		if(json.aIsWoman) {
			self.leftAvatarElem.addClass('g-landlords-avatar-woman');
		} else {
			self.leftAvatarElem.removeClass('g-landlords-avatar-woman');
		}
	}
} else {
	if(json.aUid) {
		self.rightAvatarElem.show();
		self.rightNameElem.show();

		$('.name', self.rightNameElem).attr('title', json.aUsername).text(json.aUsername);
		self.rightScoreElem.text(json.aScores);

		if(json.aIsWoman) {
			self.rightAvatarElem.addClass('g-landlords-avatar-woman');
		} else {
			self.rightAvatarElem.removeClass('g-landlords-avatar-woman');
		}
	}
	if(json.bUid) {
		self.leftAvatarElem.show();
		self.leftNameElem.show();

		$('.name', self.leftNameElem).attr('title', json.bUsername).text(json.bUsername);
		self.leftScoreElem.text(json.bScores);

		if(json.bIsWoman) {
			self.leftAvatarElem.addClass('g-landlords-avatar-woman');
		} else {
			self.leftAvatarElem.removeClass('g-landlords-avatar-woman');
		}
	}
}
if(json.{$deskPosition}GotReady) {
	self.isStarted = true;
	self.wrapperElem.addClass('started');
}
EOD;

		unset($sql, $params);
	}

	unset($deskId);

	$ret = get_defined_vars();

	foreach($ret as $k => $v) {
		if(is_numeric($v)) {
			$ret[$k] = $v + 0;
		}
	}

	return $ret;
}

// 游戏的准备或开始
function actionStart($uid, $username, $deskId, $deskPosition, $scores) {
	if($deskId) {
		$sql = 'UPDATE desks SET ' . $deskPosition . 'GotReady=1 WHERE deskId=?';
		$params = array($deskId);
		prepare($sql, $params);
	} else {
		$sql = 'SELECT * FROM desks WHERE players<3 ORDER BY deskId';
		$deskRow = prepare($sql)->fetchObject();
	}

	return $deskRow;
}
