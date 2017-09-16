<?php
header('Content-Type: text/paint; charset=utf-8');

error_reporting(E_ALL & ~E_DEPRECATED & ~E_NOTICE & ~E_WARNING & ~E_STRICT);

define('TIMESTAMP', microtime(true));
define('ACTION_TYPE_ROB_LANDLORDS', 1); // 抢地主，isRobot(是否机器人处理)
define('ACTION_TYPE_NO_ROB', 2); // 不抢
define('ACTION_TYPE_LANDLORDS', 3); // 确定地主
define('ACTION_TYPE_SEED_CARDS', 4); // 明牌
define('ACTION_TYPE_DOUBLE', 5); // 加倍
define('ACTION_TYPE_NO_DOUBLE', 6); // 不加倍
define('ACTION_TYPE_LEAD', 7); // 出牌，字段：deskPosition(桌位)，beforeCards(出牌前手中的牌)，leads(出的牌)，isRobot(是否机器人处理)
define('ACTION_TYPE_NO_LEAD', 8); // 不出

if(!file_exists('./config.php')) {
	@copy('./config.sample', './config.php') or die('文件config.php没有写权限，请手动复制文件config.sample到config.php！');
}

include './config.php';

try {
	$pdo = new PDO(DB_DSN, DB_USR, DB_PWD);
} catch(PDOException $e) {
	echo 'PDO-MySQL连接错误 : ', $e->getMessage();
	exit();
}

$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$pdo->exec('SET NAMES \'utf8\'');

if(isset($_REQUEST['action']) && function_exists($action = 'action' . ucfirst($_REQUEST['action']))) {
	session_start();
	
	$isNeedLogin = !in_array($_REQUEST['action'], array (
		'login',
		'register' 
	));
	$isLogined = isset($_SESSION['landlords']) && is_array($_SESSION['landlords']);
	
	if(!$isNeedLogin && $isLogined) {
		renderJson(array (
			'msg' => '已登录过！',
			'addClass' => 'logined',
			'eval' => 'var self=this;this.message(json.msg, 0, function() {self.wrapperElem.addClass(json.addClass);});' 
		));
	}
	
	if($isNeedLogin && !$isLogined) {
		renderJson($action === 'actionInit' ? '' : array (
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
		$_REQUEST = array_merge($_REQUEST, $_SESSION['landlords']);
	}
	
	try {
		$pdo->beginTransaction();
		$json = runFunction($action, $_REQUEST);
		$pdo->commit();
		
		renderJson($json);
	} catch(SQLException $e) {
		try {
			$pdo->rollBack();
		} catch(PDOException $e2) {
		}
		
		echo 'Error: ', $e->getMessage(), PHP_EOL, 'SQL: ', $e->sql, PHP_EOL, '错误代码: ', $e->errorCode, PHP_EOL, '错误消息：', var_export($e->errorInfo, true), PHP_EOL, PHP_EOL, $e->getTraceAsString(), PHP_EOL, PHP_EOL;
		debug_print_backtrace();
	} catch(Exception $e) {
		try {
			$pdo->rollBack();
		} catch(PDOException $e2) {
		}
		
		echo 'Error: ', $e->getMessage(), PHP_EOL, PHP_EOL, $e->getTraceAsString(), PHP_EOL, PHP_EOL;
		debug_print_backtrace();
	} catch(Error $e) {
		try {
			$pdo->rollBack();
		} catch(PDOException $e2) {
		}
		
		echo 'Error: ', $e->getMessage(), PHP_EOL, PHP_EOL, $e->getTraceAsString(), PHP_EOL, PHP_EOL;
		debug_print_backtrace();
	}
} else {
	exit('无效的请求！');
}

function renderJson($json) {
	@header('Content-Type: application/json; charset=utf-8');
	
	exit(json_encode($json));
}

class SQLException extends Exception {

	public $sql, $errorCode, $errorInfo;

	public function __construct($sql, $errorCode, $errorInfo, $message) {
		$this->sql = $sql;
		$this->errorCode = $errorCode;
		$this->errorInfo = $errorInfo;
		
		parent::__construct($message);
	}

}

function prepare($sql, array $params = array(), $isAll = false) {
	global $pdo;
	
	if(!$isAll && !strncasecmp($sql, 'SELECT ', 7) && stripos($sql, ' LIMIT ') === false) {
		$sql .= ' LIMIT 1';
	}
	
	try {
		$stmt = $pdo->prepare($sql);
		$stmt->execute($params);
		
		return $stmt;
	} catch(PDOException $e) {
		throw new SQLException($sql, $e->getCode(), $e->errorInfo, $e->getMessage());
	}
}

function runFunction($funcName, array & $params = array()) {
	$method = new ReflectionFunction($funcName);
	
	if($method->getNumberOfParameters() === 0) {
		return $funcName();
	}
	
	$ps = array ();
	foreach($method->getParameters() as $i => $param) {
		$name = $param->getName();
		if(array_key_exists($name, $params)) {
			if($param->isArray()) {
				if($param->isPassedByReference()) {
					if(is_array($params[$name])) {
						$ps[] = & $params[$name];
					} else {
						$ps[][] = & $params[$name];
					}
				} else
					$ps[] = is_array($params[$name]) ? $params[$name] : array (
						$params[$name] 
					);
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
			exit();
		}
	}
	
	return $method->invokeArgs($ps);
}

/**
 * 表单验证
 *
 * @param array $data
 *        	要验证的数据
 * @param array $rules
 *        	验证规则
 * @param array $labels
 *        	$data的key的标签(字段说明文字)
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
				$replaces = array ();
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
 * @param mixed $data
 *        	数据是否为空
 */
function isEmpty($data) {
	return $data === null || $data === '' || $data === array () || preg_match('/^\s+$/', $data);
}

/**
 * 验证不为空
 *
 * @param mixed $data
 *        	要验证的数据
 * @param string $message
 *        	不通过消息
 */
function validRequired($data, $message = '{label} 不能为空') {
	if(isEmpty($data)) {
		return $message;
	}
}

/**
 * 验证在列表中
 *
 * @param mixed $data
 *        	要验证的数据
 * @param array $in
 *        	列表数据
 * @param string $message
 *        	不通过消息
 */
function validIn($data, array $in, $message = '{label} 不在列表[{list}]中') {
	if(isEmpty($data))
		return;
	
	if(!in_array($data, $in, true)) {
		return str_replace('{list}', implode(', ', $in), $message);
	}
}

/**
 * 验证不在列表中
 *
 * @param mixed $data
 *        	要验证的数据
 * @param array $in
 *        	列表数据
 * @param string $message
 *        	不通过消息
 */
function validNotIn($data, array $in, $message = '{label} 在列表[{list}]中') {
	if(isEmpty($data))
		return;
	
	if(in_array($data, $in, true)) {
		return str_replace('{list}', implode(', ', $in), $message);
	}
}

/**
 * 验证等于某值
 *
 * @param mixed $data
 *        	要验证的数据
 * @param mixed $value
 *        	要等于的值
 * @param string $message
 *        	不通过消息
 */
function validEqual($data, $value, $message = '{label} 不等于 {value}') {
	if(isEmpty($data))
		return;
	
	if($data !== $value) {
		return $message;
	}
}

/**
 * 验证等于某属性
 *
 * @param mixed $data
 *        	要验证的数据
 * @param mixed $attr
 *        	要等于的属性
 * @param array $formData
 *        	表单数据(validForm的$data参数的值)
 * @param array $labels
 *        	表单数据(validForm的$labels参数的值)
 * @param string $message
 *        	不通过消息
 */
function validEqualTo($data, $attr, array & $formData, array &$labels, $message = '{label} 不等于 {attrLabel}') {
	if(isEmpty($data))
		return;
	
	if((isset($formData[$attr]) && $data !== $formData[$attr]) || (!isset($formData[$attr]) && !isEmpty($data))) {
		return str_replace('{attrLabel}', isset($labels[$attr]) ? $labels[$attr] : $attr, $message);
	}
}

/**
 * 验证电子邮件
 *
 * @param mixed $data
 *        	要验证的数据
 * @param string $message
 *        	不通过消息
 */
function validEmail($data, $message = '{label} 不是合法的邮件地址格式') {
	if(isEmpty($data))
		return;
	
	if(!preg_match('/^[_\.0-9a-z-]+@([0-9a-z][0-9a-z-]+\.)+[a-z]{2,3}$/i', $data)) {
		return $message;
	}
}

/**
 * 验证整数
 *
 * @param mixed $data
 *        	要验证的数据
 * @param string $message
 *        	不通过消息
 */
function validInteger($data, $message = '{label} 不是整数格式') {
	if(isEmpty($data))
		return;
	
	if(!preg_match('/^[\+\-]?[0-9]+$/', $data)) {
		return $message;
	}
}

/**
 * 验证无符号整数
 *
 * @param mixed $data
 *        	要验证的数据
 * @param string $message
 *        	不通过消息
 */
function validUinteger($data, $message = '{label} 不是正整数格式') {
	if(isEmpty($data))
		return;
	
	if(!preg_match('/^[0-9]+$/', $data)) {
		return $message;
	}
}

/**
 * 验证浮点数
 *
 * @param mixed $data
 *        	要验证的数据
 * @param string $message
 *        	不通过消息
 */
function validFloat($data, $message = '{label} 不是浮点数格式') {
	if(isEmpty($data))
		return;
	
	if(!preg_match('/^[\+\-]?[0-9]+(\.[0-9]+)?$/', $data)) {
		return $message;
	}
}

/**
 * 验证无符号浮点数
 *
 * @param mixed $data
 *        	要验证的数据
 * @param string $message
 *        	不通过消息
 */
function validUfloat($data, $message = '{label} 不是无符号浮点数格式') {
	if(isEmpty($data))
		return;
	
	if(!preg_match('/^[0-9]+(\.[0-9]+)?$/', $data)) {
		return $message;
	}
}

/**
 * 验证最小
 *
 * @param mixed $data
 *        	要验证的数据
 * @param mixed $min
 *        	最小值
 * @param string $message
 *        	不通过消息
 */
function validMin($data, $min, $message = '{label} 不能小于 {min}') {
	if(isEmpty($data))
		return;
	
	if($data < $min) {
		return $message;
	}
}

/**
 * 验证最大
 *
 * @param mixed $data
 *        	要验证的数据
 * @param mixed $max
 *        	最大值
 * @param string $message
 *        	不通过消息
 */
function validMax($data, $max, $message = '{label} 不能大于 {min}') {
	if(isEmpty($data))
		return;
	
	if($data > $max) {
		return $message;
	}
}

/**
 * 验证在min和max之间的数
 *
 * @param mixed $data
 *        	要验证的数据
 * @param mixed $min
 *        	最小值
 * @param mixed $max
 *        	最大值
 * @param string $message
 *        	不通过消息
 */
function validRange($data, $min, $max, $message = '{label} 只能区于 {min} 和 {max} 之间的数') {
	if(isEmpty($data))
		return;
	
	if($data > $max || $data < $min) {
		return $message;
	}
}

/**
 * 验证手机
 *
 * @param mixed $data
 *        	要验证的数据
 * @param string $message
 *        	不通过消息
 */
function validMobile($data, $message = '{label} 不是合法的手机号') {
	if(isEmpty($data))
		return;
	
	if(!preg_match('/^1(3|5|8)[0-9]{9}$/', $data)) {
		return $message;
	}
}

/**
 * 验证电话号
 *
 * @param mixed $data
 *        	要验证的数据
 * @param string $message
 *        	不通过消息
 */
function validPhone($data, $message = '{label} 不是合法的电话号码') {
	if(isEmpty($data))
		return;
	
	if(!preg_match('/^([0-9]{3,4}-?)?[0-9]{5,9}(-[0-9]{1,4})?$/', $data)) {
		return $message;
	}
}

/**
 * 验证IP地址
 *
 * @param mixed $data
 *        	要验证的数据
 * @param string $message
 *        	不通过消息
 */
function validIp($data, $message = '{label} 不是合法的IPV4格式') {
	if(isEmpty($data))
		return;
	
	if(!preg_match('/^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$/', $data)) {
		return $message;
	}
}

/**
 * 验证字最小长度
 *
 * @param mixed $data
 *        	要验证的数据
 * @param mixed $min
 *        	最小长度
 * @param string $message
 *        	不通过消息
 */
function validMinLength($data, $min, $charset = 'UTF-8', $message = '{label} 最少 {min} 个字') {
	if(isEmpty($data))
		return;
	
	if(mb_strlen($data, $charset) < $min) {
		return $message;
	}
}

/**
 * 验证字最大长度
 *
 * @param mixed $data
 *        	要验证的数据
 * @param mixed $max
 *        	最大长度
 * @param string $message
 *        	不通过消息
 */
function validMaxLength($data, $max, $charset = 'UTF-8', $message = '{label} 最多 {max} 个字') {
	if(isEmpty($data))
		return;
	
	if(mb_strlen($data, $charset) > $max) {
		return $message;
	}
}

/**
 * 验证字长度范围
 *
 * @param mixed $data
 *        	要验证的数据
 * @param mixed $min
 *        	最小长度
 * @param mixed $max
 *        	最大长度
 * @param string $message
 *        	不通过消息
 */
function validRangeLength($data, $min, $max, $charset = 'UTF-8', $message = '{label} 最少 {min} 个字，最多 {max} 个字') {
	if(isEmpty($data))
		return;
	
	if(mb_strlen($data, $charset) > $max || mb_strlen($data, $charset) < $min) {
		return $message;
	}
}

/**
 * 验证字固定长度
 *
 * @param mixed $data
 *        	要验证的数据
 * @param mixed $length
 *        	长度
 * @param string $message
 *        	不通过消息
 */
function validLength($data, $length, $charset = 'UTF-8', $message = '{label} 不是 {length} 个字') {
	if(isEmpty($data))
		return;
	
	if(mb_strlen($data, $charset) !== $length) {
		return $message;
	}
}

/**
 * 验证URL地址
 *
 * @param mixed $data
 *        	要验证的数据
 * @param string $message
 *        	不通过消息
 */
function validUrl($data, $message = '{label} 不是合法的URL地址') {
	if(isEmpty($data))
		return;
	
	if(!preg_match('/^(https?|ftp|rtsp|mms|gopher|mailto|ed2k|thunder|flashget|news):\/\/[a-z\-_0-9\.]+([a-z0-9]+)+.*$/i', $data)) {
		return $message;
	}
}

/**
 * 验证日期
 *
 * @param mixed $data
 *        	要验证的数据
 * @param string $message
 *        	不通过消息
 */
function validDate($data, $message = '{label} 不是标准的日期格式') {
	if(isEmpty($data))
		return;
	
	if(preg_match('/^[1-9][0-9]{3}\-[0-1]?[0-9]\-[0-3]?[0-9]$/', $data)) {
		list ( $year, $month, $day ) = explode('-', $data);
	} elseif(preg_match('/^[1-9][0-9]{3}\/[0-1][0-9]\/[0-3][0-9]$/', $data)) {
		list ( $year, $month, $day ) = explode('/', $data);
	} elseif(preg_match('/^[0-1][0-9]\/[0-3][0-9]\/[1-9][0-9]{3}$/', $data)) {
		list ( $month, $day, $year ) = explode('/', $data);
	} else {
		return $message;
	}
	
	$year = intval($year);
	$month = intval($month);
	$day = intval($day);
	
	if($month == 2) {
		if($year % 4 == 0 && ($year % 100 != 0 || $year % 400 == 0)) {
			if(!($day <= 29 && $day >= 1)) {
				return $message;
			}
		} else {
			if(!($day <= 28 && $day >= 1)) {
				return $message;
			}
		}
	} elseif(in_array($month, array (
		'1',
		'3',
		'5',
		'7',
		'8',
		'10',
		'12' 
	))) {
		if(!($day <= 31 && $day >= 1)) {
			return $message;
		}
	} else {
		if(!($day <= 30 && $day >= 1)) {
			return $message;
		}
	}
}

/**
 * 验证汉字
 *
 * @param mixed $data
 *        	要验证的数据
 * @param string $message
 *        	不通过消息
 */
function validChinese($data, $message = '{label} 只能包括汉字') {
	if(isEmpty($data))
		return;
	
	if(!preg_match('/^[\x21-\x7E\x{0391}-\x{FFE5}]+$/u', $data)) {
		return $message;
	}
}

/**
 * 验证英文
 *
 * @param mixed $data
 *        	要验证的数据
 * @param string $message
 *        	不通过消息
 */
function validEnglish($data, $message = '{label} 只能包括英文') {
	if(isEmpty($data))
		return;
	
	if(!preg_match('/^[\x21-\x7E]+$/', $data)) {
		return $message;
	}
}

/**
 * 验证用户名
 *
 * @param mixed $data
 *        	要验证的数据
 * @param string $message
 *        	不通过消息
 */
function validUsername($data, $message = '{label} 只能以英文和汉字开头，后面可以包括英文、数字、下划线、汉字') {
	if(isEmpty($data))
		return;
	
	if(!preg_match('/^[a-zA-Z\x{0391}-\x{FFE5}][a-zA-Z0-9_\x{0391}-\x{FFE5}]+$/u', $data)) {
		return $message;
	}
}

/**
 * 验证密码
 *
 * @param mixed $data
 *        	要验证的数据
 * @param string $message
 *        	不通过消息
 */
function validPassword($data, $message = '{label} 只能包括英文、数字、下划线') {
	if(isEmpty($data))
		return;
	
	if(!preg_match('/^[a-zA-Z0-9_]+$/i', $data)) {
		return $message;
	}
}

/**
 * 验证数据表记录唯一性验证
 *
 * @param mixed $key
 *        	要验证的属性
 * @param mixed $data
 *        	要验证的数据
 * @param array $formData
 *        	表单数据(validForm的$data参数的值)
 * @param string $table
 *        	表名
 * @param string $sql
 *        	查询SQL
 * @param string $where
 *        	条件
 * @param array $params
 *        	预处理SQL语句参数
 * @param array $attrs
 *        	属性作为数据：array('field1','field2'); array('field1'=>'value1','field2'=>'value2');
 * @param string $message
 *        	不通过消息
 */
function validUnique($key, $data, array & $formData, $table = null, $sql = null, $where = null, array $params = array(), array $attrs = array(), $message = '{label} 已有记录 “{data}”') {
	if(isEmpty($data))
		return;
	
	if($table && $sql === null) {
		$attrs[] = $key;
		$wheres = array ();
		
		foreach($attrs as $k => $v) {
			if(!is_string($k)) {
				$k = $v;
				$v = (array_key_exists($k, $formData) ? $formData[$k] : '');
			}
			
			$wheres[] = '`' . $k . '` = :' . $k;
			
			$params[':' . $k] = $v;
		}
		
		if($where) {
			$wheres[] = $where;
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
 * @param mixed $data
 *        	要验证的数据
 * @param string $pattern
 *        	正则表达式匹配规则
 * @param string $message
 *        	不通过消息
 */
function validCustom($data, $pattern, $message) {
	if(isEmpty($data))
		return;
	
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
	$messages = validForm(get_defined_vars(), array (
		array (
			'username, password, repassword',
			'required' 
		),
		array (
			'username',
			'minlength',
			'min' => 2 
		),
		array (
			'password, repassword',
			'minlength',
			'min' => 6 
		),
		array (
			'username',
			'username' 
		),
		array (
			'password',
			'password' 
		),
		array (
			'repassword',
			'equalTo',
			'attr' => 'password' 
		),
		array (
			'username',
			'unique',
			'table' => 'users' 
		) 
	), array (
		'username' => '帐号',
		'password' => '密码',
		'repassword' => '验密码' 
	));
	
	if(!empty($messages)) {
		return array (
			'status' => false,
			'messages' => $messages 
		);
	}
	
	$sql = 'INSERT INTO users (username, password, salt, dateline, createTime) VALUES (?, ?, ?, UNIX_TIMESTAMP(), NOW())';
	$salt = rand(111111, 999999);
	$params = array (
		$username,
		md5(md5($password) . $salt),
		$salt 
	);
	
	return array (
		'status' => prepare($sql, $params)->rowCount() 
	);
}

/**
 * 用户登录
 *
 * @param string $username
 * @param string $password
 */
function actionLogin($username, $password) {
	$messages = validForm(get_defined_vars(), array (
		array (
			'username, password',
			'required' 
		),
		array (
			'username',
			'minlength',
			'min' => 2 
		),
		array (
			'password',
			'minlength',
			'min' => 6 
		),
		array (
			'username',
			'username' 
		),
		array (
			'password',
			'password' 
		) 
	), array (
		'username' => '帐号',
		'password' => '密码' 
	));
	
	if(!empty($messages)) {
		return array (
			'status' => false,
			'messages' => $messages 
		);
	}
	
	$sql = 'SELECT uid, username, deskId, deskPosition, scores, isWoman FROM users WHERE `username` = ? AND `password` = MD5(CONCAT(md5(?), salt))';
	$params = array (
		$username,
		$password 
	);
	
	$_SESSION['regenerateDateline'] = TIMESTAMP;
	$_SESSION['landlords'] = prepare($sql, $params)->fetch(PDO::FETCH_ASSOC);
	
	if($_SESSION['landlords']) {
		$sql = 'UPDATE users SET lastLoginDateline=UNIX_TIMESTAMP(), lastLoginTime=NOW() WHERE uid=?';
		$params = array (
			$_SESSION['landlords']['uid'] 
		);
		prepare($sql, $params);
	}
	
	return array (
		'status' => !!$_SESSION['landlords'] 
	);
}

// 用户退出
function actionLogout($uid, $deskId, $deskPosition) {
	$landlords = $_SESSION['landlords'];
	
	unset($_SESSION['landlords']);
	
	if($deskId) {
		if(!getDeskById($deskId, 0, 'isPlaying')) {
			$sql = 'UPDATE users SET deskId=0,deskPosition=NULL WHERE uid=?';
			$params = array (
				$uid 
			);
			prepare($sql, $params);
			
			$sql = str_replace('{prefix}', $deskPosition, 'UPDATE desks SET players=players-1,{prefix}Uid=0,{prefix}GotReady=0,aCards=NULL,{prefix}Leads=NULL,{prefix}IsSeed=0,{prefix}IsRobot=0,{prefix}Dateline=0,{prefix}Time=\'0000-00-00 00:00:00\' WHERE deskId=? AND {prefix}Uid=?');
			$params = array (
				$deskId,
				$uid 
			);
			prepare($sql, $params);
		}
	}
	
	return array (
		'removeClass' => 'logined started',
		'eval' => 'this.wrapperElem.removeClass(json.removeClass).find("[style]").removeAttr("style");' 
	);
}

function arrayNumeric(array &$ret) {
	foreach($ret as $k => &$v) {
		if(is_numeric($v)) {
			$v = $v + 0;
		} elseif(is_array($v)) {
			arrayNumeric($v);
		}
	}
}

// @params $type 数值类型: fetchColumn($type), 布尔类型: OBJ(true)/ASSOC(false), 'n': NUM, 'raw': stmt
function getDeskById($deskId, $type = true, $fields = '*') {
	$sql = 'SELECT ' . $fields . ' FROM desks WHERE deskId=?';
	$params = array (
		$deskId 
	);
	
	if($type === 'raw') {
		return prepare($sql, $params);
	}
	
	if($type === 'n') {
		return prepare($sql, $params)->fetch(PDO::FETCH_NUM);
	}
	
	if(is_numeric($type)) {
		return prepare($sql, $params)->fetchColumn($type);
	}
	
	return prepare($sql, $params)->fetch($type ? PDO::FETCH_OBJ : PDO::FETCH_ASSOC);
}

function lastLeads($deskId, $openGames, & $weightPosition = '', & $leads = '', $leadName = '', & $leadLabel = '') {
	$sql = 'SELECT weightPosition, leads, leadName, leadLabel FROM desk_action_logs WHERE deskId=? AND openGames=? AND actionType = ? ORDER BY logId DESC';
	$params = array (
		$deskId,
		$openGames,
		ACTION_TYPE_LEAD 
	);
	$ret = prepare($sql, $params)->fetch(PDO::FETCH_NUM);
	if($ret) {
		list ( $weightPosition, $leads, $leadName, $leadLabel ) = $ret;
	}
	
	return $ret;
}

// 游戏初始化
function actionInit($uid, $username, $deskId, $deskPosition, $scores, $isWoman, $action) {
	$isPlaying = 0;
	$maxLogId = 0;
	$lastLeadPosition = $deskPosition;
	$lastLeads = '';
	$lastLeadName = '';
	$lastLeadLabel = '';
	
	if($deskId) {
		extract(getDeskById($deskId, false));
		
		if($aUid && $aUid !== $uid) {
			$sql = 'SELECT username, scores, isWoman FROM users WHERE uid=?';
			$params = array (
				$aUid 
			);
			list ( $aUsername, $aScores, $aIsWoman ) = prepare($sql, $params)->fetch(PDO::FETCH_NUM);
		}
		
		if($bUid && $bUid !== $uid) {
			$sql = 'SELECT username, scores, isWoman FROM users WHERE uid=?';
			$params = array (
				$bUid 
			);
			list ( $bUsername, $bScores, $bIsWoman ) = prepare($sql, $params)->fetch(PDO::FETCH_NUM);
		}
		
		if($cUid && $cUid !== $uid) {
			$sql = 'SELECT username, scores, isWoman FROM users WHERE uid=?';
			$params = array (
				$cUid 
			);
			list ( $cUsername, $cScores, $cIsWoman ) = prepare($sql, $params)->fetch(PDO::FETCH_NUM);
		}
		
		// 未开局，发牌并初始化开局参数
		if(!$isPlaying && $players == 3) {
			$isPlaying = 1;
			$pukes = array (
				'LW' 
			);
			foreach(array (
				'H',
				'D',
				'C',
				'S' 
			) as $k1) {
				foreach(array (
					'A',
					2,
					3,
					4,
					5,
					6,
					7,
					8,
					9,
					10,
					'J',
					'Q',
					'K' 
				) as $k2) {
					$pukes[] = $k1 . $k2;
				}
			}
			$pukes[] = 'BW';
			shuffle($pukes);
			
			$aCards = $bCards = $cCards = array ();
			
			for($i = 0; $i < 51; $i++) {
				switch($i % 3) {
					case 0:
						$aCards[] = array_shift($pukes);
						break;
					case 1:
						$bCards[] = array_shift($pukes);
						break;
					case 2:
						$cCards[] = array_shift($pukes);
						break;
				}
			}
			
			$cards = array_values($pukes);
			
			$aCards = implode(',', $aCards);
			$bCards = implode(',', $bCards);
			$cCards = implode(',', $cCards);
			$cards = implode(',', $pukes);
			
			unset($pukes, $i, $k1, $k2);
			
			mt_srand((int) (TIMESTAMP * 1000));
			$weightPosition = chr(ord('a') + rand() % 3); // 随机选取a,b,c其中之一
			$weightDateline = (int) TIMESTAMP;
			$weightTime = date('Y-m-d H:i:s', $weightDateline);
			
			$sql = 'UPDATE desks SET isPlaying=1, openGames=openGames+1, weightPosition=?, weightDateline=?, weightTime=?, aCards=?, bCards=?, cCards=?, cards=? WHERE deskId=?';
			$params = array (
				$weightPosition,
				$weightDateline,
				$weightTime,
				$aCards,
				$bCards,
				$cCards,
				$cards,
				$deskId 
			);
			prepare($sql, $params);
			
			$openGames = getDeskById($deskId, 0, 'openGames');
		}
		
		if($isPlaying) {
			foreach(array (
				'a',
				'b',
				'c' 
			) as $k) {
				if(${$k . 'Uid'} !== $uid && !${$k . 'IsSeed'}) {
					${$k . 'Cards'} = preg_replace('/[A-Z0-9]+/', 'NN', ${$k . 'Cards'});
				}
			}
			unset($k);
			
			$sql = 'SELECT MAX(logId) FROM desk_action_logs WHERE deskId=? AND openGames=?';
			$params = array (
				$deskId,
				$openGames 
			);
			$maxLogId = prepare($sql, $params)->fetchColumn();
			
			lastLeads($deskId, $openGames, $lastLeadPosition, $lastLeads, $lastLeadName, $lastLeadLabel);
			
			if($isPlaying <= 1) {
				$cards = preg_replace('/[A-Z0-9]+/', 'NN', $cards);
			}
		}
		
		unset($sql, $params);
	}
	
	$ret = get_defined_vars();
	
	arrayNumeric($ret);
	
	$ret['eval'] = 'this.renderInit(json);';
	
	return $ret;
}

// 游戏的准备或开始
function actionStart($uid, $username, $deskId, $deskPosition, $scores, $notDeskId = 0) {
	if($deskId) {
		$sql = 'UPDATE desks SET ' . $deskPosition . 'GotReady=1, ' . $deskPosition . 'Dateline=UNIX_TIMESTAMP(), ' . $deskPosition . 'Time=NOW() WHERE deskId=?';
		$params = array (
			$deskId 
		);
		prepare($sql, $params);
	} else {
		$sql = 'SELECT * FROM desks WHERE ' . ($notDeskId ? 'deskId<>? AND ' : null) . 'players<3 ORDER BY players DESC, deskId';
		$deskObj = prepare($sql, $notDeskId ? array (
			$notDeskId 
		) : array ())->fetchObject();
		
		$deskId = $deskObj->deskId;
		
		$deskPosition = null;
		foreach(array (
			'a',
			'b',
			'c' 
		) as $k) {
			$key = $k . 'Uid';
			if(!$deskObj->$key) {
				$deskPosition = $k;
				break;
			}
		}
		
		if(!$deskPosition) {
			return array (
				'eval' => 'this.message("开始游戏时由于冲突而导致失败！")' 
			);
		}
		
		$sql = 'UPDATE desks SET players=players+1, ' . $deskPosition . 'Uid=?, ' . $deskPosition . 'GotReady=1, ' . $deskPosition . 'Dateline=UNIX_TIMESTAMP(), ' . $deskPosition . 'Time=NOW() WHERE deskId=?';
		$params = array (
			$uid,
			$deskId 
		);
		prepare($sql, $params);
		
		$sql = 'UPDATE users SET deskId=?, deskPosition=? WHERE uid=?';
		$params = array (
			$deskId,
			$deskPosition,
			$uid 
		);
		prepare($sql, $params);
		
		$_SESSION['landlords']['deskId'] = $_REQUEST['deskId'] = $deskId;
		$_SESSION['landlords']['deskPosition'] = $_REQUEST['deskPosition'] = $deskPosition;
	}
	
	return runFunction('actionInit', $_REQUEST);
}

// 游戏的换桌
function actionChange($uid, $username, $deskId, $deskPosition, $scores) {
	if($deskId) {
		if(getDeskById($deskId, 0, 'isPlaying')) {
			return array (
				'eval' => 'this.message("游戏已开始！")' 
			);
		}
		
		$sql = 'UPDATE desks SET players=players-1, ' . $deskPosition . 'Uid=0, ' . $deskPosition . 'GotReady=0, ' . $deskPosition . 'Dateline=0, ' . $deskPosition . 'Time=NULL WHERE deskId=?';
		$params = array (
			$deskId 
		);
		prepare($sql, $params);
		
		$sql = 'UPDATE users SET deskId=0, deskPosition=NULL WHERE uid=?';
		$params = array (
			$uid 
		);
		prepare($sql, $params);
	}
	
	$_SESSION['landlords']['deskId'] = $_REQUEST['deskId'] = 0;
	$_SESSION['landlords']['deskPosition'] = $_REQUEST['deskPosition'] = null;
	
	$_REQUEST['notDeskId'] = $deskId;
	
	return runFunction('actionStart', $_REQUEST);
}

function nextWeightPosition($weightPosition) {
	$aOrd = ord('a');
	
	return chr($aOrd + (ord($weightPosition) - $aOrd + 1) % 3);
}

function updateNextWeightPosition($deskId, $deskPosition) {
	$sql = 'UPDATE desks SET weightPosition = ?, weightDateline=UNIX_TIMESTAMP(), weightTime=NOW() WHERE deskId = ?';
	$params = array (
		nextWeightPosition($deskPosition),
		$deskId 
	);
	return prepare($sql, $params);
}

function callLandlords($uid, $deskId, $openGames, $deskPosition, $cards, $isRob = 0) {
	$sql = 'INSERT INTO desk_action_logs (uid, deskId, openGames, actionType, weightPosition, dateline, createTime)VALUES(?, ?, ?, ?, ?, UNIX_TIMESTAMP(), NOW())';
	$params = array (
		$uid,
		$deskId,
		$openGames,
		$isRob ? ACTION_TYPE_ROB_LANDLORDS : ACTION_TYPE_NO_ROB,
		$deskPosition 
	);
	prepare($sql, $params);
	
	updateNextWeightPosition($deskId, $deskPosition);
	
	$sql = 'SELECT uid,actionType,weightPosition FROM desk_action_logs WHERE deskId=? AND openGames=? AND actionType IN(?,?) ORDER BY logId';
	$params = array (
		$deskId,
		$openGames,
		ACTION_TYPE_ROB_LANDLORDS,
		ACTION_TYPE_NO_ROB 
	);
	$stmt = prepare($sql, $params, true);
	
	$rowCount = $stmt->rowCount();
	if($rowCount < 3) {
		return false;
	}
	
	$lastRobRow = false;
	$robs = 0;
	while(($row = $stmt->fetchObject()) !== false) {
		if($row->actionType == ACTION_TYPE_ROB_LANDLORDS) {
			$lastRobRow = $row;
			$robs++;
		}
	}
	
	if($robs === 1 || ($robs > 1 && $rowCount === 4)) {
		$sql = 'INSERT INTO desk_action_logs (uid, deskId, openGames, actionType, weightPosition, beforeCards, dateline, createTime)VALUES(?, ?, ?, ?, ?, ?, UNIX_TIMESTAMP(), NOW())';
		$params = array (
			$lastRobRow->uid,
			$deskId,
			$openGames,
			ACTION_TYPE_LANDLORDS,
			$lastRobRow->weightPosition,
			$cards 
		);
		prepare($sql, $params);
		
		$sql = 'UPDATE desks SET isPlaying = 2, weightPosition = ?, weightDateline=UNIX_TIMESTAMP(), weightTime=NOW(), landlordPosition = ?, ' . $deskPosition . 'Cards=CONCAT(' . $deskPosition . 'Cards, \',\', cards)  WHERE deskId = ?';
		$params = array (
			$lastRobRow->weightPosition,
			$lastRobRow->weightPosition,
			$deskId 
		);
		prepare($sql, $params);
	} else {
		return false;
	}
	
	return true;
}

function actionCall($uid, $deskId, $deskPosition, $isRob) {
	list ( $isPlaying, $openGames, $weightPosition, $pUid, $cards ) = getDeskById($deskId, 'n', 'isPlaying, openGames, weightPosition, ' . $deskPosition . 'Uid, cards');
	if($isPlaying != 1 || $deskPosition !== $weightPosition || $pUid != $uid) {
		return array (
			'eval' => 'this.message("还没轮到你操作呢！")' 
		)/* + get_defined_vars()*/;
	}
	
	return array (
		'status' => callLandlords($uid, $deskId, $openGames, $deskPosition, $cards, $isRob),
		'eval' => 'this.btnElems.hide();this.playerDownTimer.clean();' 
	);
}

function actionSeedCards($uid, $deskId, $deskPosition) {
	list ( $isPlaying, $openGames, $weightPosition, $pUid, $pCards ) = getDeskById($deskId, 'n', 'isPlaying, openGames, weightPosition, ' . $deskPosition . 'Uid, ' . $deskPosition . 'Cards');
	if($isPlaying != 2 || $deskPosition !== $weightPosition || $pUid != $uid) {
		return array (
			'eval' => 'this.message("还没轮到你操作呢！")' 
		)/* + get_defined_vars()*/;
	}
	
	$sql = 'INSERT INTO desk_action_logs (uid, deskId, openGames, actionType, weightPosition, beforeCards, dateline, createTime)VALUES(?, ?, ?, ?, ?, ?, UNIX_TIMESTAMP(), NOW())';
	$params = array (
		$uid,
		$deskId,
		$openGames,
		ACTION_TYPE_SEED_CARDS,
		$weightPosition,
		$pCards 
	);
	prepare($sql, $params);
	
	$sql = 'UPDATE desks SET ' . $deskPosition . 'IsSeed=1 WHERE deskId=?';
	$params = array (
		$deskId 
	);
	prepare($sql, $params);
	
	updateNextWeightPosition($deskId, $deskPosition);
	
	return array (
		'status' => confirmDouble($deskId, $openGames),
		'eval' => 'this.btnElems.hide();this.playerDownTimer.clean();' 
	);
}

function actionDouble($uid, $deskId, $deskPosition, $isDouble) {
	list ( $isPlaying, $openGames, $weightPosition, $pUid ) = getDeskById($deskId, 'n', 'isPlaying, openGames, weightPosition, ' . $deskPosition . 'Uid');
	if($isPlaying != 2 || $deskPosition !== $weightPosition || $pUid != $uid) {
		return array (
			'eval' => 'this.message("还没轮到你操作呢！")' 
		)/* + get_defined_vars()*/;
	}
	
	$sql = 'INSERT INTO desk_action_logs (uid, deskId, openGames, actionType, weightPosition, dateline, createTime)VALUES(?, ?, ?, ?, ?, UNIX_TIMESTAMP(), NOW())';
	$params = array (
		$uid,
		$deskId,
		$openGames,
		$isDouble ? ACTION_TYPE_DOUBLE : ACTION_TYPE_NO_DOUBLE,
		$weightPosition 
	);
	prepare($sql, $params);
	
	updateNextWeightPosition($deskId, $deskPosition);
	
	return array (
		'status' => confirmDouble($deskId, $openGames),
		'eval' => 'this.btnElems.hide();this.playerDownTimer.clean();' 
	);
}

function actionLead($uid, $deskId, $deskPosition, $cards) {
	$desk = getDeskById($deskId);
	
	$lastLeadPosition = $deskPosition;
	$lastLeads = '';
	$lastLeadName = '';
	$lastLeadLabel = '';
	
	lastLeads($deskId, $desk->openGames, $lastLeadPosition, $lastLeads, $lastLeadName, $lastLeadLabel);
	
	$rule = LeadCardRule::get($cards);
	$status = $rule->valid() && ($lastLeadPosition === $deskPosition || $rule->greater($lastLeads));
	
	if($status) {
		$beforeCards = $desk->{$deskPosition . 'Cards'};
		$beforeLeads = $desk->{$deskPosition . 'Leads'};
		
		$afterCards = implode(',', array_diff(explode(',', $beforeCards), $rule->cards));
		$afterLeads = $beforeLeads . ($beforeLeads ? ',' : null) . $cards;
		
		$sql = 'INSERT INTO desk_action_logs (uid, deskId, openGames, actionType, weightPosition, beforeCards, leads, leadName, leadLabel, dateline, createTime)VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, UNIX_TIMESTAMP(), NOW())';
		$params = array (
			$uid,
			$deskId,
			$desk->openGames,
			ACTION_TYPE_LEAD,
			$deskPosition,
			$beforeCards,
			$cards,
			$rule->name,
			$rule->label 
		);
		prepare($sql, $params);
		
		$sql = 'UPDATE desks SET ' . $deskPosition . 'Cards=?, ' . $deskPosition . 'Leads=? WHERE deskId=?';
		$params = array (
			$afterCards,
			$afterLeads,
			$deskId 
		);
		prepare($sql, $params);
		
		updateNextWeightPosition($deskId, $deskPosition);
	}
	
	return array (
		'eval' => 'console.log(json);this.selectElems.remove();this.resizePlayer();this.playerElem.disabled(false);' 
	) + get_defined_vars();
}

function notLead($uid, $deskId, $openGames, $deskPosition) {
	$sql = 'INSERT INTO desk_action_logs (uid, deskId, openGames, actionType, weightPosition, dateline, createTime)VALUES(?, ?, ?, ?, ?, UNIX_TIMESTAMP(), NOW())';
	$params = array (
		$uid,
		$deskId,
		$openGames,
		ACTION_TYPE_NO_LEAD,
		$deskPosition 
	);
	prepare($sql, $params);
	
	updateNextWeightPosition($deskId, $deskPosition);
}

function actionNotLead($uid, $deskId, $deskPosition) {
	list ( $isPlaying, $openGames, $weightPosition, $pUid ) = getDeskById($deskId, 'n', 'isPlaying, openGames, weightPosition, ' . $deskPosition . 'Uid');
	if($isPlaying != 3 || $deskPosition !== $weightPosition || $pUid != $uid) {
		return array (
			'eval' => 'this.message("还没轮到你操作呢！")' 
		)/* + get_defined_vars()*/;
	}
	
	notLead($uid, $deskId, $openGames, $deskPosition);
	
	return array (
		'eval' => 'this.btnElems.hide();this.playerDownTimer.clean();' 
	);
}

function actionProcess($uid, $deskId, $maxLogId) {
	$desk = getDeskById($deskId);
	
	$sql = 'SELECT * FROM desk_action_logs WHERE deskId=? AND openGames=?';
	$params = array (
		$deskId,
		$desk->openGames 
	);
	if($maxLogId > 0) {
		$sql .= ' AND logId>?';
		$params[] = $maxLogId;
	}
	$stmt = prepare($sql . ' ORDER BY logId', $params, true);
	
	$ret = array ();
	$ret['actions'] = [ ];
	
	while(($row = $stmt->fetch(PDO::FETCH_ASSOC)) !== false) {
		arrayNumeric($row);
		$ret['actions'][] = $row;
	}
	
	$ret['isPlaying'] = $desk->isPlaying + 0;
	$ret['eval'] = 'this.renderProcess(json);';
	
	return $ret;
}

function confirmDouble($deskId, $openGames) {
	$sql = 'SELECT COUNT(1) FROM desk_action_logs WHERE deskId=? AND openGames=? AND actionType IN(?,?,?)';
	$params = array (
		$deskId,
		$openGames,
		ACTION_TYPE_SEED_CARDS,
		ACTION_TYPE_DOUBLE,
		ACTION_TYPE_NO_DOUBLE 
	);
	if(prepare($sql, $params)->fetchColumn() >= 3) {
		$sql = 'UPDATE desks SET isPlaying = 3 WHERE deskId = ?';
		$params = array (
			$deskId 
		);
		prepare($sql, $params);
		
		return true;
	}
	return false;
}

function actionTimeout($uid, $deskId, $deskPosition) {
	return array (
		'eval' => 'location.reload();' 
	);
	
	$desk = getDeskById($deskId);
	if($deskPosition !== $desk->weightPosition || $desk->{$deskPosition . 'Uid'} != $uid) {
		return array (
			'eval' => 'this.message("还没轮到你操作呢！")' 
		)/* + get_defined_vars()*/;
	}
	
	$status = NULL;
	if($desk->isPlaying == 1) {
		$status = callLandlords($uid, $deskId, $desk->openGames, $deskPosition, $desk->cards);
	} elseif($desk->isPlaying == 2) {
		$sql = 'INSERT INTO desk_action_logs (uid, deskId, openGames, actionType, weightPosition, dateline, createTime)VALUES(?, ?, ?, ?, ?, UNIX_TIMESTAMP(), NOW())';
		$params = array (
			$uid,
			$deskId,
			$desk->openGames,
			ACTION_TYPE_NO_DOUBLE,
			$deskPosition 
		);
		prepare($sql, $params);
		
		updateNextWeightPosition($deskId, $deskPosition);
		
		$status = confirmDouble($deskId, $desk->openGames);
	} elseif($desk->isPlaying == 3) {
		notLead($uid, $deskId, $desk->openGames, $deskPosition);
	}
	
	return array (
		'status' => $status,
		'eval' => 'this.btnElems.hide();' 
	);
}

class LeadCardRule {

	private $cards, $s, $m4, $m3, $m2, $s0;

	private $name, $label;

	const RE4 = '/(2222|AAAA|KKKK|QQQQ|JJJJ|1111|9999|8888|7777|6666|5555|4444|3333)/';

	const RE3 = '/(222|AAA|KKK|QQQ|JJJ|111|999|888|777|666|555|444|333)/';

	const RE2 = '/(WW|22|AA|KK|QQ|JJ|11|99|88|77|66|55|44|33)/';

	const charSortRule = '34567891JQKA2W';

	private $labels = array (
		'single' => '单', // 1张
		'pair' => '对子', // 2张
		'wangBomb' => '王炸', // 2张
		'three' => '三个n', // 3张
		'threeWithOne' => '三带一', // 4张
		'bomb' => '炸弹', // 4张
		'threeWithTwo' => '三带二', // 5张
		'straight' => '顺子', // >=5张
		'fourWithTwo' => '四带二', // 6张
		'continuityPair' => '连对', // >=6张
		'airplane' => '飞机'  // >=6张
	);

	public function __construct($s) {
		$this->cards = explode(',', $s);
		
		self::sortCards($this->cards);
		
		$this->s = preg_replace('/(H|D|C|S|B|L|0)/', '', implode('', $this->cards));
		
		$matches = null;
		preg_match_all(self::RE4, $this->s, $matches);
		$this->m4 = $matches[0];
		$this->s0 = preg_replace(self::RE4, '', $this->s);
		
		preg_match_all(self::RE3, $this->s0, $matches);
		$this->m3 = $matches[0];
		$this->s0 = preg_replace(self::RE3, '', $this->s0);
		
		preg_match_all(self::RE2, $this->s0, $matches);
		$this->m2 = $matches[0];
		$this->s0 = preg_replace(self::RE2, '', $this->s0);
	}

	public function __get($name) {
		return $this->$name;
	}

	public function valid() {
		foreach($this->labels as $k => &$label) {
			if($this->$k()) {
				$this->name = $k;
				$this->label = $label;
				return true;
			}
		}
		
		return false;
	}

	public function greater($cards) {
		if(!isset($this->labels[$this->name])) {
			return false;
		}
		
		$sortMethod = $this->name . 'Sort';
		
		return $this->$sortMethod(new static($cards));
	}

	public function single() { // 单
		return count($this->cards) === 1;
	}

	public function singleSort($o) {
		return $o->single() && strpos(self::charSortRule, $this->s) > strpos(self::charSortRule, $o->s);
	}

	public function straight() { // 顺子
		return !$this->m4 && !$this->m3 && !$this->m2 && strlen($this->s0) >= 5 && strpos('AKQJ19876543', $this->s0) !== false;
	}

	public function straightSort($o) {
		return strlen($this->s) === strlen($o->s) && $o->straight() && strpos(self::charSortRule, $this->s[0]) > strpos(self::charSortRule, $o->s[0]);
	}

	public function pair() { // 对子
		return !$this->m4 && !$this->m3 && strlen($this->s0) === 0 && $this->m2 && count($this->m2) === 1 && $this->m2[0] !== 'WW';
	}

	public function pairSort($o) {
		return $o->pair() && strpos(self::charSortRule, $this->s[0]) > strpos(self::charSortRule, $o->s[0]);
	}

	public function wangBomb() { // 王炸
		return !$this->m4 && !$this->m3 && strlen($this->s0) === 0 && $this->m2 && count($this->m2) === 1 && $this->m2[0] === 'WW';
	}

	public function wangBombSort($o) {
		return true;
	}

	public function three() { // 3个n：
		if(!$this->m4 && !$this->m2 && strlen($this->s0) === 0 && $this->m3 && count($this->m3) === 1) {
			$this->labels['three'] = '三个' + substr($this->cards[0], 1);
			
			return true;
		}
		
		return false;
	}

	public function threeSort($o) {
		return $o->three() && strpos(self::charSortRule, $this->s[0]) > strpos(self::charSortRule, $o->s[0]);
	}

	public function threeWithOne() { // 3背1
		return !$this->m4 && !$this->m2 && strlen($this->s0) === 1 && $this->m3 && count($this->m3) === 1;
	}

	public function threeWithOneSort($o) {
		return $o->threeWithOne() && strpos(self::charSortRule, $this->m3[0][0]) > strpos(self::charSortRule, $o->m3[0][0]);
	}

	public function bomb() { // 炸弹
		return !$this->m3 && !$this->m2 && strlen($this->s0) === 0 && $this->m4 && count($this->m4) === 1;
	}

	public function bombSort($o) {
		$t = $o->bomb();
		return (!$t && !$o->wangBomb()) || ($t && strpos(self::charSortRule, $this->m4[0][0]) > strpos(self::charSortRule, $o->m4[0][0]));
	}

	public function threeWithTwo() { // 3背2
		return !$this->m4 && strlen($this->s0) === 0 && $this->m3 && count($this->m3) === 1 && $this->m2 && count($this->m2) === 1 && $this->m2[0] !== 'WW';
	}

	public function threeWithTwoSort($o) {
		return $o->threeWithTwo() && strpos(self::charSortRule, $this->m3[0][0]) > strpos(self::charSortRule, $o->m3[0][0]);
	}

	public function fourWithTwo() { // 四带二, 四带两对
		if($this->m2 && count($this->m2) === 2) {
			$this->labels['fourWithTwo'] = '四带两对';
		} else {
			$this->labels['fourWithTwo'] = '四带二';
		}
		return !$this->m3 && $this->m4 && count($this->m4) === 1 && ((!$this->m2 && strlen($this->s0) === 2) || (strlen($this->s0) === 0 && $this->m2 && count($this->m2) <= 2 && $this->m2[0] !== 'WW'));
	}

	public function fourWithTwoSort($o) {
		return strlen($this->s) === strlen($o->s) && $o->fourWithTwo() && strpos(self::charSortRule, $this->m4[0][0]) > strpos(self::charSortRule, $o->m4[0][0]);
	}

	public function continuityPair() { // 连对: 最少3连对
		if(strlen($this->s) < 6 || strlen($this->s) % 2) {
			return false;
		}
		
		return strlen($this->s) >= 6 && strlen($this->s) % 2 === 0 && strpos('AAKKQQJJ1199887766554433', $this->s) !== false && $this->s[0] === $this->s[1];
	}

	public function continuityPairSort($o) {
		return strlen($this->s) === strlen($o->s) && $o->continuityPair() && strpos(self::charSortRule, $this->s[0]) > strpos(self::charSortRule, $o->s[0]);
	}

	public function airplane() { // 连对: 最少3连对
		if($this->m4 || !$this->m3 || count($this->m3) < 2 || ($this->m2 && strlen($this->s0) && count($this->m3) !== count($this->m2) * 2 + strlen($this->s0)) || ($this->m2 && !strlen($this->s0) && ($this->m2[0] === 'WW' || (count($this->m3) !== count($this->m2) && count($this->m3) !== count($this->m2) * 2))) || (!$this->m2 && strlen($this->s0) && count($this->m3) !== strlen($this->s0))) {
			return false;
		}
		
		return strpos('AAAKKKQQQJJJ111999888777666555444333', implode('', $this->m3)) !== false;
	}

	public function airplaneSort($o) {
		return strlen($this->s) === strlen($o->s) && $o->airplane() && strpos(self::charSortRule, $this->m3[0][0]) > strpos(self::charSortRule, $o->m3[0][0]);
	}

	public static function sortCards(&$cards) {
		$sorts = self::getSortWeigths();
		
		usort($cards, function ($a, $b) use ($sorts) {
			return $sorts[$a] > $sorts[$b] ? -1 : ($sorts[$a] == $sorts[$b] ? 0 : 1);
		});
	}

	private static $_cards = array (
		3,
		4,
		5,
		6,
		7,
		8,
		9,
		10,
		'J',
		'Q',
		'K',
		'A',
		2 
	);

	private static $_colors = array (
		'S',
		'C',
		'D',
		'H' 
	);

	private static $sorts;

	public static function getSortWeigths() {
		if(self::$sorts !== null) {
			return self::$sorts;
		}
		
		self::$sorts = array (
			'NN' => -1 
		);
		$i = 0;
		foreach(self::$_cards as $i2 => $k2) {
			foreach(self::$_colors as $i1 => $k1) {
				self::$sorts[$k1 . $k2] = $i++;
			}
		}
		
		self::$sorts['LW'] = 52;
		self::$sorts['BW'] = 53;
		
		return self::$sorts;
	}

	public static function get($s) {
		return new static($s);
	}

}
