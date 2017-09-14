(function($) {
	const ACTION_TYPE_ROB_LANDLORDS = 1; // 抢地主，isRobot(是否机器人处理)
	const ACTION_TYPE_NO_ROB = 2; // 不抢
	const ACTION_TYPE_LANDLORDS = 3; // 确定地主
	const ACTION_TYPE_SEED_CARDS = 4; // 明牌
	const ACTION_TYPE_DOUBLE = 5; // 加倍
	const ACTION_TYPE_NO_DOUBLE = 6; // 不加倍
	const ACTION_TYPE_LEAD = 7; // 出牌，字段：deskPosition(桌位)，beforeCards(出牌前手中的牌)，leads(出的牌)，isRobot(是否机器人处理)
	const ACTION_TYPE_NO_LEAD = 8; // 不出

	/**
	 * 反转数组
	 * 
	 * @return Object {val1:key1,val2:key2,...}
	 */
	Array.prototype.flip = function() {
		var obj = {};

		$.each(this, function(k, v) {
			obj[v] = k;
		});

		return obj;
	};

	/**
	 * 初始化多维数组
	 * 
	 * @param defArray Array 多维数组的定义: [z,y,x]
	 * @param defaultValue mixed 默认值可以是回调函数(function(z,y,x){return z*3+y*2+x;})或其它类型的值
	 * @return Array
	 */
	$.initArray = function(defArray, defaultValue, defIndex, callbackArgs) {
		if(isNaN(defIndex) || !$.isArray(callbackArgs)) {
			defIndex = 0;
			callbackArgs = [];
		}
		
		if(!$.isArray(defArray) || defArray.length <= defIndex) {
			if($.isFunction(defaultValue)) {
				return defaultValue.apply(this, callbackArgs);
			} else {
				return defaultValue;
			}
		}
		
		var retArr = [];
		var i;
		
		for(i=0; i<defArray[defIndex]; i++) {
			callbackArgs[defIndex] = i;
			
			retArr.push($.initArray(defArray, defaultValue, defIndex+1, callbackArgs));
		}
		
		return retArr;
	};
	
	/**
	 * 全局选项
	 */
	$.landlordsGlobalOptions = {
		puke54Object: {}, // 54张牌的样式索引
		puke54BackgroundStyleArray: [], // 54张牌的样式
		// 牌的选项
		puke54Options: {
			width: 82,
			height: 105,
			positionX: 90,
			positionY: 110,
			leftAndRightPlayerPercent: 0.60
		},
		paddingLeftOrTop: '53px', // 牌的左边距或右边距
		paddingLeftOrTopPercent: '32px' // 牌的左边距或右边距(缩放百分)
	};

	// 牌的标题数组
	var pukeTitleArray = ['红桃(hearts)', '方块(diamonds)', '梅花(club)', '黑桃(spade)'];
	// 牌的Y坐标数组
	var pukeYArray = ['H', 'D', 'C', 'S'];
	// 牌的X坐标数组
	var pukeXArray = ['A', 2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K'];
	// 右旋转牌的X偏移量
	var r90PositionX = $.landlordsGlobalOptions.puke54Options.positionY - $.landlordsGlobalOptions.puke54Options.height;
	var pointsString = '   3456789ABCDEFGH';

	$.landlordsGlobalOptions.puke54BackgroundStyleArray = $.initArray([5,13], function(y, x) {
		if(y == 4) {
			if(x == 0) {
				$.landlordsGlobalOptions.puke54Object.BW = {
					title: '大王(big wang)',
					Y: 4,
					X: 0,
					sort: 47,
					points: pointsString.charAt(17)
				};
				// console.log($.landlordsGlobalOptions.puke54Object.BW);
			} else if(x == 1) {
				$.landlordsGlobalOptions.puke54Object.LW = {
					title: '小王(little wang)',
					Y: 4,
					X: 1,
					sort: 46,
					points: pointsString.charAt(16)
				};
				// console.log($.landlordsGlobalOptions.puke54Object.LW);
			} else if(x == 2) {
				$.landlordsGlobalOptions.puke54Object.NN = {
					title: '背面',
					Y: 4,
					X: 2,
					sort: 48,
					points: ' '
				};
				// console.log($.landlordsGlobalOptions.puke54Object.NN);
			} else {
				return false;
			}
		} else {
			$.landlordsGlobalOptions.puke54Object[pukeYArray[y] + pukeXArray[x]] = {
				title: pukeTitleArray[y].replace('(', (x == 0 ? '尖儿' : pukeXArray[x]) + '(').replace(')', ' ' + (x == 0 ? 'Ace' : pukeXArray[x]) + ')'),
				Y: y,
				X: x,
				sort: (x == 0 ? 44 : (x == 1 ? 45 : (x - 2) * 4 + (3-y))),
				points: x > 1 ? pointsString.charAt(x + 1) : pointsString.charAt(15 - x)
			};
			// console.log($.landlordsGlobalOptions.puke54Object[pukeYArray[y] + pukeXArray[x]]);
		}

		return {
			// 正常
			normal: {
				background: 'transparent url(images/puke54.png) no-repeat',
				backgroundPositionX: (-$.landlordsGlobalOptions.puke54Options.positionX * x) + 'px',
				backgroundPositionY: (-$.landlordsGlobalOptions.puke54Options.positionY * y) + 'px'
			},
			// 右旋转90度
			r90: {
				background: 'transparent url(images/puke54-r90.png) no-repeat',
				backgroundPositionY: (-$.landlordsGlobalOptions.puke54Options.positionX * x) + 'px',
				backgroundPositionX: (-$.landlordsGlobalOptions.puke54Options.positionY * (4-y) - r90PositionX ) + 'px'
			},
			// 正常(缩放百分)
			normalPercent: {
				position: 'absolute',
				width: $.landlordsGlobalOptions.puke54Options.positionX * 13 * $.landlordsGlobalOptions.puke54Options.leftAndRightPlayerPercent + 'px',
				height: $.landlordsGlobalOptions.puke54Options.positionY * 5 * $.landlordsGlobalOptions.puke54Options.leftAndRightPlayerPercent + 'px',
				left: -$.landlordsGlobalOptions.puke54Options.positionX * x * $.landlordsGlobalOptions.puke54Options.leftAndRightPlayerPercent + 'px',
				top: -$.landlordsGlobalOptions.puke54Options.positionY * y * $.landlordsGlobalOptions.puke54Options.leftAndRightPlayerPercent + 'px'
			},
			// 右旋转90度(缩放百分)
			r90Percent: {
				position: 'absolute',
				height: $.landlordsGlobalOptions.puke54Options.positionX * 13 * $.landlordsGlobalOptions.puke54Options.leftAndRightPlayerPercent + 'px',
				width: $.landlordsGlobalOptions.puke54Options.positionY * 5 * $.landlordsGlobalOptions.puke54Options.leftAndRightPlayerPercent + 'px',
				top: -$.landlordsGlobalOptions.puke54Options.positionX * x * $.landlordsGlobalOptions.puke54Options.leftAndRightPlayerPercent + 'px',
				left: (-$.landlordsGlobalOptions.puke54Options.positionY * (4-y) - r90PositionX) * $.landlordsGlobalOptions.puke54Options.leftAndRightPlayerPercent + 'px'
			}
		};
	});

	// 54张牌的基本样式显示Demo
	$.landlordsDemo = function() {
		var zIndex = 54;
		var wrapperElem = $('<div style="padding-left:' + $.landlordsGlobalOptions.paddingLeftOrTop + ';"></div>').appendTo(document.body);
		var wrapperRightElem = $('<div style="float:right;padding-left:20px;padding-top:' + $.landlordsGlobalOptions.paddingLeftOrTop + '"></div>').appendTo(document.body);
		var wrapperLeftElem = $('<div style="padding-left:20px;padding-top:' + $.landlordsGlobalOptions.paddingLeftOrTop + '"></div>').appendTo(document.body);
		var wrapper2Elem = $('<div style="margin-top:10px;padding-left:' + $.landlordsGlobalOptions.paddingLeftOrTopPercent + ';"></div>').appendTo(document.body);
		var wrapper2RightElem = $('<div style="float:right;padding-left:20px;padding-top:' + $.landlordsGlobalOptions.paddingLeftOrTopPercent + ';padding-bottom:10px;"></div>').appendTo(document.body);
		var wrapper2LeftElem = $('<div style="padding-left:20px;padding-top:' + $.landlordsGlobalOptions.paddingLeftOrTopPercent + ';padding-bottom:10px;"></div>').appendTo(document.body);
		var i, k, puke54Array = [];

		for(k in $.landlordsGlobalOptions.puke54Object) {
			puke54Array.push(k);
		}

		while(puke54Array.length > 0) {
			if(puke54Array.length > 1) {
				i = $.landlords.prototype.randInt(puke54Array.length);
				k = puke54Array[i];
				puke54Array.splice(i, 1);
			} else {
				k = puke54Array.pop();
			}

			$.landlords.prototype.getPukeElemForNormal(k).css({
				marginTop: '20px',
				marginBottom: '10px',
				marginTop: '20px'
			}).appendTo(wrapperElem).click(function() {
				$(this).css('marginTop', $(this).css('marginTop') == '0px' ? '20px' : '0px');
			});

			$.landlords.prototype.getPukeElemForR90(k).css({
				marginLeft:'-20px'
			}).appendTo(wrapperLeftElem).click(function() {
				$(this).css('marginLeft', $(this).css('marginLeft') == '0px' ? '-20px' : '0px');
			}).clone().css({
				position: 'relative',
				zIndex: zIndex--
			}).appendTo(wrapperRightElem).click(function() {
				$(this).css('marginLeft', $(this).css('marginLeft') == '0px' ? '-20px' : '0px');
			});

			$.landlords.prototype.getPukeElemForNormalPercent(k).css({
				marginTop: '20px'
			}).appendTo(wrapper2Elem).click(function() {
				$(this).css('marginTop', $(this).css('marginTop') == '0px' ? '20px' : '0px');
			});

			$.landlords.prototype.getPukeElemForR90Percent(k).css({
				marginLeft:'-20px',
				marginBottom: '10px'
			}).appendTo(wrapper2LeftElem).click(function() {
				$(this).css('marginLeft', $(this).css('marginLeft') == '0px' ? '-20px' : '0px');
			}).clone().css({
				position: 'relative',
				zIndex: zIndex--
			}).appendTo(wrapper2RightElem).click(function() {
				$(this).css('marginLeft', $(this).css('marginLeft') == '0px' ? '-20px' : '0px');
			});
		}

		$('<div style="clear:both;"></div>').appendTo(wrapperElem).clone().appendTo(wrapper2Elem);
	};

	/**
	 * 斗地主游戏主函数 必须使用 new方法调用
	 * 
	 * @param elem 游戏容器
	 * @param options 游戏选项
	 * @return $.landlords Object
	 */
	$.landlords = function(elem, options) {
		this.wrapperElem = $(elem);
		this.options = $.extend(true, {}, this.options, options);
		this.init();
	};
	// 游戏对象方法或默认属性的定义
	$.landlords.prototype = {
		options: {
			isRobot: false,
			ajaxUrl: 'landlords.php?action={action}'
		},

		wrapperElem: $([]), // 游戏的主容器

		cardsElem: $([]), // 底牌容器
		cardsArray: [], // 底牌的数组的索引

		playerArray: [], // 主玩家牌的数组的索引
		playerElem: $([]), // 主玩家容器
		playerAvatarElem: $([]), // 主玩家头像
		playerScoreElem: $([]), // 主玩家积分
		playerNameElem: $([]), // 主玩家名字
		playerTimerElem: $([]), // 主玩家等待计时器

		leftArray: [], // 左玩家牌的数组的索引
		leftElem: $([]), // 左玩家容器
		leftAvatarElem: $([]), // 左玩家头像
		leftScoreElem: $([]), // 左玩家积分
		leftNameElem: $([]), // 左玩家名字
		leftNumberElem: $([]), // 左玩家牌的个数
		leftTimerElem: $([]), // 左玩家等待计时器

		rightArray: [], // 右玩家牌的数组的索引
		rightElem: $([]), // 右玩家容器
		rightAvatarElem: $([]), // 右玩家头像
		rightScoreElem: $([]), // 右玩家积分
		rightNameElem: $([]), // 右玩家名字
		rightNumberElem: $([]), // 右玩家牌的个数
		rightTimerElem: $([]), // 右玩家等待计时器

		btnStartElem: $([]), // 开始按钮

		btnCallElem: $([]), // 叫地主按钮
		btnNotCallElem: $([]), // 不叫按钮

		btnNotLeadElem: $([]), // 不出按钮
		btnPromptElem: $([]), // 提示按钮
		btnLeadElem: $([]), // 出牌按钮

		loadingElem: $([]), // Ajax加载图标

		isStarted: false, // 是否已开始游戏

		init: function() {
			var self = this;

			if(self.isInited) {
				alert('$.landlords.init() 不能重复执行！');
				return;
			}

			self.isInited = true; // 已初始化过游戏对象

			self.loadingElem = $('<div class="g-landlords-loading g-landlords-shadow">加载中…</div>').appendTo(self.wrapperElem);
			self.messageMaskElem = $('<div class="g-landlords-message-mask"></div>').appendTo(self.wrapperElem);
			self.messageElem = $('<div class="g-landlords-message g-landlords-shadow"></div>').appendTo(self.wrapperElem);
			self.messageCloseElem = $('<div class="g-landlords-icons g-close"></div>').appendTo(self.messageElem);
			self.messageBodyElem = $('<div class="g-body"></div>').appendTo(self.messageElem);

			self.loginAndRegsiterForm();

			self.cardsElem = $('<div class="g-landlords-cards" style="padding-left:' + $.landlordsGlobalOptions.paddingLeftOrTopPercent + ';"></div>').appendTo(self.wrapperElem);

			self.playerElem = $('<div class="g-landlords-player" style="padding-left:' + $.landlordsGlobalOptions.paddingLeftOrTop + ';"></div>').appendTo(self.wrapperElem);
			self.playerAvatarElem = $('<div class="g-landlords-icons g-landlords-avatar g-landlords-player-avatar"></div>').appendTo(self.wrapperElem);
			self.playerLandholderElem = $('<div class="g-landholder" title="地主"></div>').appendTo(self.playerAvatarElem);
			self.playerScoreElem = $('<div class="g-score"></div>').appendTo(self.playerAvatarElem);
			self.playerNameElem = $('<div class="g-landlords-name g-landlords-player-name"><span class="mask"></span><a class="name" href="#" title="玩家一">玩家一</a></div>').appendTo(self.wrapperElem);
			self.playerNumberElem = $('<div class="g-landlords-icons g-landlords-number g-landlords-player-number">0</div>').appendTo(self.wrapperElem);
			self.playerTimerElem = $('<div class="g-landlords-icons g-landlords-timer g-landlords-player-timer">30</div>').appendTo(self.wrapperElem);
			self.playerMsgElem = $('<div class="g-landlords-msg g-landlords-player-msg"></div>').appendTo(self.wrapperElem);

			self.leftElem = $('<div class="g-landlords-left" style="padding-top:' + $.landlordsGlobalOptions.paddingLeftOrTopPercent + ';"></div>').appendTo(self.wrapperElem);
			self.leftAvatarElem = $('<div class="g-landlords-icons g-landlords-avatar g-landlords-left-avatar"></div>').appendTo(self.wrapperElem);
			self.leftLandholderElem = $('<div class="g-landholder" title="地主"></div>').appendTo(self.leftAvatarElem);
			self.leftScoreElem = $('<div class="g-score"></div>').appendTo(self.leftAvatarElem);
			self.leftNameElem = $('<div class="g-landlords-name g-landlords-left-name"><span class="mask"></span><a class="name" href="#" title="玩家三">玩家三</a></div>').appendTo(self.wrapperElem);
			self.leftNumberElem = $('<div class="g-landlords-icons g-landlords-number g-landlords-left-number">0</div>').appendTo(self.wrapperElem);
			self.leftTimerElem = $('<div class="g-landlords-icons g-landlords-timer g-landlords-left-timer">30</div>').appendTo(self.wrapperElem);
			self.leftMsgElem = $('<div class="g-landlords-msg g-landlords-left-msg"></div>').appendTo(self.wrapperElem);

			self.rightElem = $('<div class="g-landlords-right" style="padding-top:' + $.landlordsGlobalOptions.paddingLeftOrTopPercent + ';"></div>').appendTo(self.wrapperElem);
			self.rightAvatarElem = $('<div class="g-landlords-icons g-landlords-avatar g-landlords-right-avatar"></div>').appendTo(self.wrapperElem);
			self.rightLandholderElem = $('<div class="g-landholder" title="地主"></div>').appendTo(self.rightAvatarElem);
			self.rightScoreElem = $('<div class="g-score"></div>').appendTo(self.rightAvatarElem);
			self.rightNameElem = $('<div class="g-landlords-name g-landlords-right-name"><span class="mask"></span><a class="name" href="#" title="玩家二">玩家二</a></div>').appendTo(self.wrapperElem);
			self.rightNumberElem = $('<div class="g-landlords-icons g-landlords-number g-landlords-right-number">0</div>').appendTo(self.wrapperElem);
			self.rightTimerElem = $('<div class="g-landlords-icons g-landlords-timer g-landlords-right-timer">30</div>').appendTo(self.wrapperElem);
			self.rightMsgElem = $('<div class="g-landlords-msg g-landlords-right-msg"></div>').appendTo(self.wrapperElem);

			self.btnStartElem = $('<button class="g-landlords-icons g-landlords-button g-landlords-btn-start">开始</button>').appendTo(self.wrapperElem);
			self.btnCallElem = $('<button class="g-landlords-icons g-landlords-button g-landlords-btn-call">叫地主</button>').appendTo(self.wrapperElem);
			self.btnNotCallElem = $('<button class="g-landlords-icons g-landlords-button g-landlords-btn-not-call">不叫</button>').appendTo(self.wrapperElem);
			self.btnNotLeadElem = $('<button class="g-landlords-icons g-landlords-button g-landlords-btn-not-lead">不出</button>').appendTo(self.wrapperElem);
			self.btnPromptElem = $('<button class="g-landlords-icons g-landlords-button g-landlords-btn-prompt">提示</button>').appendTo(self.wrapperElem);
			self.btnLeadElem = $('<button class="g-landlords-icons g-landlords-button g-landlords-btn-lead">出牌</button>').appendTo(self.wrapperElem);
			self.btnChangeElem = $('<button class="g-landlords-icons g-landlords-button g-landlords-btn-change">换桌</button>').disabled(true).appendTo(self.wrapperElem);
			self.btnLogoutElem = $('<button class="g-landlords-icons g-landlords-button g-landlords-btn-logout">退出</button>').appendTo(self.wrapperElem);
			self.btnSeedCardsElem = $('<button class="g-landlords-icons g-landlords-button g-landlords-btn-seed-cards">明牌</button>').appendTo(self.wrapperElem);
			self.btnDoubleElem = $('<button class="g-landlords-icons g-landlords-button g-landlords-btn-double">加倍</button>').appendTo(self.wrapperElem);
			self.btnNoDoubleElem = $('<button class="g-landlords-icons g-landlords-button g-landlords-btn-no-double">不加倍</button>').appendTo(self.wrapperElem);
			self.btnElems = $('.g-landlords-button', self.wrapperElem);

			$('.g-landlords-name,.g-landlords-button,.g-close', self.wrapperElem).hover(function(){
				$(this).addClass('hover');
			},function(){
				$(this).removeClass('hover');
			});

			self.btnLogoutElem.click(function() {
				self.post('logout');
			});

			self.btnStartElem.click(function() {
				self.btnStartElem.disabled(true);
				self.btnChangeElem.disabled(false);

				self.post('start');
			});

			self.btnChangeElem.click(function() {
				self.post('change');
			});

			self.btnCallElem.click(function() {
				self.post('call', {isRob:1});
			});

			self.btnNotCallElem.click(function() {
				self.post('call', {isRob:0});
			});

			self.btnLeadElem.click(function() {
				var cards = [];
				var rules = {
					straight: function() { // 顺子
					},
					continuityPair: function() { // 连对
					},
					pair: function() { // 对子
					},
					pair3Carrying: function() { // 3背2
					},
					one3Carrying: function() { // 3背1
					},
					friedKing: function() { // 王炸
					},
					single: function() {
					}
				};
				self.playerElem.children('.selected').each(function() {
					cards.push($(this).attr('k'));
				});
				console.log(cards);

				// self.message('lead',0,1);
			});

			self.btnNotLeadElem.click(function() {
				self.post('notLead');
			});

			self.btnPromptElem.click(function() {
				self.message('prompt',0,1);
			});

			self.btnSeedCardsElem.click(function() {
				self.post('seedCards');
			});

			self.btnDoubleElem.click(function() {
				self.post('double', {isDouble:1});
			});

			self.btnNoDoubleElem.click(function() {
				self.post('double', {isDouble:0});
			});

			$(window).unload(function() {
				if(!self.isStarted) {
					return;
				}

				self.post('unload', {}, function() {}, {async: false});
			});

			self.post('init');
		},

		loginAndRegsiterForm: function() {
			var self = this;

			var formElem = $('<form class="g-landlords-icons login-and-register-form">' +
				'<span class="login" title="用户登录">用户登录</span>' +
				'<span class="register" title="用户注册">用户注册</span>' +

				'<input class="username" name="username" type="text" value=""/>' +
				'<input class="password" name="password" type="password" value=""/>' +
				'<input class="repassword" name="repassword" type="password" value=""/>' +
				
				'<button class="g-landlords-icons g-landlords-button login-btn">立即登录</button>' +
				'<button class="g-landlords-icons g-landlords-button register-btn">立即登录</button>' +

				'<div class="g-landlords-icons g-landlords-avatar selected" title="男"></div>' +
				'<div class="g-landlords-icons g-landlords-avatar g-landlords-avatar-woman" title="女"></div>' +
			'</form>').appendTo(self.wrapperElem);

			$('span.login,span.register', formElem).click(function() {
				if($(this).is('.login')) {
					formElem.removeClass('register');
				} else {
					formElem.addClass('register');
				}
			});

			$('button,.g-landlords-avatar', formElem).hover(function(){
				$(this).addClass('hover');
			},function(){
				$(this).removeClass('hover');
			});

			var avatarElems = $('.g-landlords-avatar', formElem).click(function() {
				avatarElems.removeClass('selected');
				$(this).addClass('selected');
			});

			formElem.submit(function() {
				var action = 'login', data = {
					username: $('.username', this).val(),
					password: $('.password', this).val()
				};
				
				if(data.username.length == 0) {
					alert('帐号不能为空！');

					$('.username', this).focus();

					return false;
				}
				
				if(data.password.length == 0) {
					alert('密码不能为空！');

					$('.password', this).focus();

					return false;
				}
				
				if(data.password.length < 6) {
					alert('密码长度最短6位！');

					$('.password', this).focus();

					return false;
				}

				if($(this).is('.register')) {
					data.repassword = $('.repassword', this).val();

					if(data.repassword.length == 0) {
						alert('密码不能为空！');

						$('.repassword', this).focus();

						return false;
					}

					if(data.password !== data.repassword) {
						alert('密码与验密码不一至！');

						$('.repassword', this).focus();

						return false;
					}

					data.isWoman = $('.g-landlords-avatar-woman.selected', formElem).size();

					action = 'register';
				}

				self.post(action, data, function(json) {
					if(json.status) {
						self.post('init');
					} else {
						self.message($('button:visible', formElem).text() + '失败！', 0, 1);
					}
				});

				return false;
			});
		},

		message: function(cont, isHtml, isClosable) {
			var self = this;

			self.messageCloseElem.unbind('click');
			if(isClosable) {
				self.messageCloseElem.click(function() {
					self.messageMaskElem.hide();
					self.messageElem.hide();

					if($.isFunction(isClosable)) {
						isClosable.call(self);
					}
				});
				self.messageCloseElem.show();
			} else {
				self.messageCloseElem.hide();
			}

			if(isHtml) {
				self.messageBodyElem.html(cont);
			} else {
				self.messageBodyElem.text(cont);
			}

			self.messageElem.show().css({
				left: '0px',
				top: '0px',
				visibility: 'hidden'
			});

			setTimeout(function() {
				self.messageMaskElem.show();
				self.messageElem.css({
					left: '50%',
					top: '50%',
					marginLeft: -self.messageElem.outerWidth() / 2 + 'px',
					marginTop: -self.messageElem.outerHeight() / 2 + 'px',
					visibility: 'visible'
				});
			}, 10);
		},

		post: function(action, data, callback, settings) {
			var self = this;

			if($.isFunction(data)) {
				settings = callback;
				callback = data;
				data = {};
			}

			if(!$.isPlainObject(data)) {
				data = {};
			}

			if(!$.isFunction(callback)) {
				callback = function(json) {
					if($.isPlainObject(json) && json.callback) {
						json.callback = new Function('json', json.callback);
						json.callback.call(self, json);
					}
				};
				settings = {};
			}
			
			if(self.loadingCounter) {
				self.loadingCounter++;
			} else {
				self.loadingCounter = 1;
				self.loadingElem.show();
			}

			$.ajax({
				global: false,
				url: self.options.ajaxUrl.replace('{action}', action),
				data: data,
				type: 'POST',
				success: function(response) {
					try {
						var json = ($.inArray('json', this.dataTypes) > -1 ? response : $.parseJSON(response));
						if(typeof(json.eval) === 'string') {
							callback = new Function('json', json.eval);
						}
						callback.call(self, json);
					} catch (e) {
						if(window.console && window.console.log) {
							window.console.log(e);
							window.console.log('response = ', response);
						}
						self.message(e.message);
					}
				},
				error: function(xhr) {
					self.message(xhr.responseText);
				},
				complete: function() {
					self.loadingCounter--;
					if(!self.loadingCounter) {
						self.loadingElem.hide();
					}
				}
			});
		},
		
		/**
		 * 倒计时(单位：秒)
		 * 
		 * @param elems jQuery 计时器显示的jQuery对象
		 * @param callback Function 超时回调函数
		 * @param seconds integer 倒计时的秒数
		 */
		downTimer: function(elems, callback, seconds) {
			var self = this;
			var timer = 0;
			var retTimer;
			var cleanCall = function(isTimeout) {
				elems.hide();
				clearTimeout(timer);
				clearInterval(retTimer);
				if(isTimeout && $.isFunction(callback)) {
					callback.call(self);
				}
			};
			
			if(isNaN(seconds)) {
				seconds = self.isPlaying === 2 ? 10 : 30;
			}
			elems.text(seconds);

			retTimer = setInterval(function() {
				seconds--;
				if(!seconds) {
					cleanCall(true);
					return;
				}
				if(seconds<=5) {
					if(!timer) {
						var i = 0;
						timer = setInterval(function() {
							if(i%2) {
								elems.removeClass('g-landlords-timer3').addClass('g-landlords-timer2');
							} else {
								elems.removeClass('g-landlords-timer2').addClass('g-landlords-timer3');
							}
							i++;
						}, 250);
					}
				} else {
					elems.removeClass('g-landlords-timer2 g-landlords-timer3');
					clearTimeout(timer);
					timer = 0;
				}
				elems.text(seconds);
			}, 1000);

			return {
				timer: retTimer,
				itimer: timer,
				clean: cleanCall
			};
		},
		renderInit: function(json) {
			var self = this;

			self.wrapperElem.addClass('logined');

			$('.name', self.playerNameElem).attr('title', json.username).text(json.username);
			self.playerScoreElem.text(json.scores);
			if(json.isWoman) {
				self.playerAvatarElem.addClass('g-landlords-avatar-woman');
			}

			if(json.deskId) {
				$.each(['a', 'b', 'c'], function(k, v) {
					if(json[v + 'Uid'] === json.uid) {
						self.playerPosition = v;
					}
				});
				if(self.playerPosition === 'b') {
					self.rightPosition = 'c';
					self.leftPosition = 'a';
				} else if(self.playerPosition === 'c') {
					self.rightPosition = 'a';
					self.leftPosition = 'b';
				} else {
					self.rightPosition = 'b';
					self.leftPosition = 'c';
				}
				var cards, username;

				cards = json[self.playerPosition + 'Cards'];
				if(cards && cards.length) {
					self.playerArray = cards.split(',');
				}
				if(self.playerPosition === json.landlordPosition) {
					self.playerLandholderElem.show();
				} else {
					self.playerLandholderElem.hide();
				}
				if(json[self.rightPosition + 'Uid']) {
					self.rightAvatarElem.show();
					self.rightNameElem.show();

					username = json[self.rightPosition + 'Username']

					$('.name', self.rightNameElem).attr('title', username).text(username);
					self.rightScoreElem.text(json[self.rightPosition + 'Scores']);

					if(json[self.rightPosition + 'IsWoman']) {
						self.rightAvatarElem.addClass('g-landlords-avatar-woman');
					} else {
						self.rightAvatarElem.removeClass('g-landlords-avatar-woman');
					}

					cards = json[self.rightPosition + 'Cards'];
					if(cards && cards.length) {
						self.rightArray = cards.split(',');
					}

					if(self.rightPosition === json.landlordPosition) {
						self.rightLandholderElem.show();
					} else {
						self.rightLandholderElem.hide();
					}
				}
				if(json[self.leftPosition + 'Uid']) {
					self.leftAvatarElem.show();
					self.leftNameElem.show();

					username = json[self.leftPosition + 'Username']

					$('.name', self.leftNameElem).attr('title', username).text(username);
					self.leftScoreElem.text(json[self.leftPosition + 'Scores']);

					if(json[self.leftPosition + 'IsWoman']) {
						self.leftAvatarElem.addClass('g-landlords-avatar-woman');
					} else {
						self.leftAvatarElem.removeClass('g-landlords-avatar-woman');
					}

					cards = json[self.leftPosition + 'Cards'];
					if(cards && cards.length) {
						self.leftArray = cards.split(',');
					}

					if(self.leftPosition === json.landlordPosition) {
						self.leftLandholderElem.show();
					} else {
						self.leftLandholderElem.hide();
					}
				}

				if(json.cards) {
					self.cardsArray = json.cards.split(',');
				}

				if(json[json.deskPosition + 'GotReady']) {
					self.isStarted = true;
					self.wrapperElem.addClass('started');
					self.btnStartElem.disabled(true);
					self.btnChangeElem.disabled(false);
				} else {
					self.isStarted = false;
					self.wrapperElem.removeClass('started');
					self.btnStartElem.disabled(false);
					self.btnChangeElem.disabled(true);
				}

				self.weightPosition = json.weightPosition;
				self.isPlaying = json.isPlaying;
				self.maxLogId = json.maxLogId;

				if(json.isPlaying) {
					clearTimeout(self.initTimer);

					self.btnStartElem.hide();
					self.btnChangeElem.hide();
					self.btnLogoutElem.hide();
					self.start();
				} else {
					clearTimeout(self.initTimer);

					self.initTimer = setTimeout(function() {
						self.post('init', {isTimer:1});
					}, 1000);
				}
			}
		},
		renderProcess: function(json) {
			var self = this

			$.each(json.actions, function(k, v) {
				var msg = '';
				var isKeep = false;

				switch(v.actionType) {
					case ACTION_TYPE_ROB_LANDLORDS:
						msg = '叫地主';
						break;
					case ACTION_TYPE_NO_ROB:
						msg = '不抢';
						break;
					case ACTION_TYPE_LANDLORDS:
						var cards = v.beforeCards.split(',');
						var nCards = 'NN,NN,NN'.split(',');

						if(self.playerPosition === v.weightPosition) {
							self.playerLandholderElem.show();

							self.playerArray = self.playerArray.concat(cards);
							self.playerArray.sort(function(a, b) {
								return $.landlordsGlobalOptions.puke54Object[b].sort - $.landlordsGlobalOptions.puke54Object[a].sort;
							});
							self.renderPlayer();
							self.resizePlayer();

							self.playerNumberElem.text(self.playerArray.length);
						} else {
							self.playerLandholderElem.hide();
						}

						if(self.rightPosition === v.weightPosition) {
							self.rightLandholderElem.show();

							self.rightArray = self.rightArray.concat((self.rightArray[0] === 'NN') ? nCards : cards);
							if(self.rightArray[0] !== 'NN') {
								self.rightArray.sort(function(a, b) {
									return $.landlordsGlobalOptions.puke54Object[b].sort - $.landlordsGlobalOptions.puke54Object[a].sort;
								});
							}
							self.renderRight();

							self.rightNumberElem.text(self.rightArray.length);
						} else {
							self.rightLandholderElem.hide();
						}

						if(self.leftPosition === v.weightPosition) {
							self.leftLandholderElem.show();

							self.leftArray = self.leftArray.concat((self.leftArray[0] === 'NN') ? nCards : cards);
							if(self.leftArray[0] !== 'NN') {
								self.leftArray.sort(function(a, b) {
									return $.landlordsGlobalOptions.puke54Object[b].sort - $.landlordsGlobalOptions.puke54Object[a].sort;
								});
							}
							self.renderLeft();

							self.leftNumberElem.text(self.leftArray.length);
						} else {
							self.leftLandholderElem.hide();
						}

						self.cardsArray = cards;
						self.cardsArray.sort(function(a, b) {
							return $.landlordsGlobalOptions.puke54Object[b].sort - $.landlordsGlobalOptions.puke54Object[a].sort;
						});
						self.renderCards();

						isKeep = true;
						break;

					case ACTION_TYPE_SEED_CARDS:
						if(self.rightPosition === v.weightPosition) {
							self.rightArray = v.beforeCards.split(',');
							self.rightArray.sort(function(a, b) {
								return $.landlordsGlobalOptions.puke54Object[b].sort - $.landlordsGlobalOptions.puke54Object[a].sort;
							});
							self.renderRight();
						}
						if(self.leftPosition === v.weightPosition) {
							self.leftArray = v.beforeCards.split(',');
							self.leftArray.sort(function(a, b) {
								return $.landlordsGlobalOptions.puke54Object[b].sort - $.landlordsGlobalOptions.puke54Object[a].sort;
							});
							self.renderLeft();
						}
						break;
					case ACTION_TYPE_DOUBLE:
						msg = '加倍';
						break;
					case ACTION_TYPE_NO_DOUBLE:
						msg = '不加倍';
						break;
					case ACTION_TYPE_LEAD:
						msg = '出牌';
						break;
					case ACTION_TYPE_NO_LEAD:
						msg = '不出';
						break;
				}
				switch(v.weightPosition) {
					case self.playerPosition:
						self.btnElems.hide().disabled(false);

						self.playerMsgElem.text(msg);
						self.playerDownTimer.clean();
						
						if(isKeep) {
							self.rightDownTimer.clean();
							self.leftDownTimer.clean();

							self.playerDownTimer = self.downTimer(self.playerTimerElem.show(), function(){self.post('timeout');});
							self.renderBtn(json.isPlaying);
						} else {
							self.rightMsgElem.text('');
							self.rightDownTimer = self.downTimer(self.rightTimerElem.show());
						}
						break;
					case self.rightPosition:
						self.rightMsgElem.text(msg);
						self.rightDownTimer.clean();

						if(isKeep) {
							self.playerDownTimer.clean();
							self.leftDownTimer.clean();

							self.rightDownTimer = self.downTimer(self.rightTimerElem.show());
						} else {
							self.leftMsgElem.text('');
							self.leftDownTimer = self.downTimer(self.leftTimerElem.show());
						}
						break;
					case self.leftPosition:
						self.leftMsgElem.text(msg);
						self.leftDownTimer.clean();

						if(isKeep) {
							self.playerDownTimer.clean();
							self.rightDownTimer.clean();

							self.leftDownTimer = self.downTimer(self.leftTimerElem.show());
						} else {
							self.playerMsgElem.text('');
							self.playerDownTimer = self.downTimer(self.playerTimerElem.show(), function(){self.post('timeout');});

							self.renderBtn(json.isPlaying);
						}
						break;
				}
				self.maxLogId = Math.max(self.maxLogId, v.logId);
			});

			clearTimeout(self.processTimer);
			self.processTimer = setTimeout(function() {
				self.post('process', {maxLogId: self.maxLogId});
			}, 1000);
		},
		start: function() {
			var self = this;
			
			self.isStarted = true;

			var zIndex = 1;
			var k;
			var timer = setInterval(function() {
				k = self.playerArray[zIndex-1];
				self.renderPlayer(k);
				self.resizePlayer();
				self.playerNumberElem.show().text(zIndex);

				k = self.rightArray[zIndex-1];
				self.renderRight(k, zIndex);
				self.rightNumberElem.show().text(zIndex);

				k = self.leftArray[zIndex-1];
				self.renderLeft(k);
				self.leftNumberElem.show().text(zIndex);

				if(zIndex == self.playerArray.length) {
					clearInterval(timer);

					self.renderCards();

					setTimeout(function() {
						self.sortRender();
					}, 60);
				}

				zIndex++;
			}, 60);

			self.wrapperElem.addClass('started');
		},
		sortRender: function() {
			var self = this;

			self.cardsArray.sort(function(a, b) {
				return $.landlordsGlobalOptions.puke54Object[b].sort - $.landlordsGlobalOptions.puke54Object[a].sort;
			});

			self.playerArray.sort(function(a, b) {
				return $.landlordsGlobalOptions.puke54Object[b].sort - $.landlordsGlobalOptions.puke54Object[a].sort;
			});

			self.leftArray.sort(function(a, b) {
				return $.landlordsGlobalOptions.puke54Object[b].sort - $.landlordsGlobalOptions.puke54Object[a].sort;
			});

			self.rightArray.sort(function(a, b) {
				return $.landlordsGlobalOptions.puke54Object[b].sort - $.landlordsGlobalOptions.puke54Object[a].sort;
			});

			self.playerNumberElem.text(self.playerArray.length);
			self.leftNumberElem.text(self.leftArray.length);
			self.rightNumberElem.text(self.rightArray.length);

			self.renderCards();
			self.renderPlayer();
			self.renderLeft();
			self.renderRight();
			self.resizePlayer();

			self.renderProcess({actions:[]});

			if(self.playerPosition === self.weightPosition) {
				self.renderBtn(self.isPlaying);
				self.playerDownTimer = self.downTimer(self.playerTimerElem.show(), function(){self.post('timeout');});
			} else if(self.rightPosition === self.weightPosition) {
				self.rightDownTimer = self.downTimer(self.rightTimerElem.show());
			} else if(self.leftPosition === self.weightPosition) {
				self.leftDownTimer = self.downTimer(self.leftTimerElem.show());
			}
		},
		renderBtn: function(isPlaying) {
			var self = this;

			self.btnElems.hide().disabled(false);

			switch(isPlaying) {
				case 1: {
					self.btnCallElem.show();
					self.btnNotCallElem.show();
					break;
				}
				case 2: { // 明牌、加倍、不加倍
					self.btnSeedCardsElem.show();
					self.btnDoubleElem.show();
					self.btnNoDoubleElem.show();
					break;
				}
				case 3: {
					self.btnLeadElem.show();
					self.btnNotLeadElem.show();
					self.btnPromptElem.show();
					break;
				}
			}
		},
		renderCards: function(k) {
			var self = this;

			if(typeof(k) == 'undefined') {
				var i;

				self.cardsElem.empty();
				for(i=0; i<3; i++) {
					self.renderCards(self.cardsArray[i]);
				}
				$('<div style="clear:both;"></div>').appendTo(self.cardsElem)
			} else {
				return self.getPukeElemForNormalPercent(k).appendTo(self.cardsElem);
			}
		},
		renderPlayer: function(k) {
			var self = this;

			if(typeof(k) == 'undefined') {
				var i, isDowned = false;

				self.playerElem.empty();
				for(i=0; i<self.playerArray.length; i++) {
					self.renderPlayer(self.playerArray[i]);
				}

				var X = 0;
				var Y = 0;
				var rects = [];
				var downElem = $([]);
				var selectBoxElem = $([]);

				self.playerElem.children().mousedown(function(e) {
					if(isDowned || e.button === 2) {
						return;
					}

					isDowned = true;
					rects = [];
					X = e.clientX + $(window).scrollLeft();
					Y = e.clientY + $(window).scrollTop();
					downElem = $(this);
					selectBoxElem = $('<div style="position:absolute;left:-100px;top:-100px;width:0px;height:0px;overflow:hidden;border:1px dotted gray;"></div>').appendTo(document.body);

					self.playerElem.children().each(function() {
						var pos = $(this).offset();
						rects.push({
							elem: $(this),
							selected: $(this).is('.selected'),
							x: pos.left,
							x2: pos.left + $.landlordsGlobalOptions.puke54Options.width - parseInt($.landlordsGlobalOptions.paddingLeftOrTop)
						});
					});

					var i = rects.length - 1;
					rects[i].x2 = rects[i].x + $.landlordsGlobalOptions.puke54Options.width;
				});
				$(window).unbind('mousemove.landlords').bind('mousemove.landlords', function(e) {
					if(!isDowned) {
						return;
					}

					var pageX = e.clientX + $(window).scrollLeft();
					var pageY = e.clientY + $(window).scrollTop();

					var minX = Math.min(X, pageX), maxX = Math.max(X, pageX);
					var minY = Math.min(Y, pageY), maxY = Math.max(Y, pageY);

					selectBoxElem.width(maxX-minX).height(maxY-minY).css({
						left: minX + 'px',
						top: minY + 'px'
					});
				}).unbind('mouseup.landlords').bind('mouseup.landlords', function(e) {
					if(!isDowned) {
						return;
					}
					isDowned = false;

					var pageX = e.clientX + $(window).scrollLeft();
					var pageY = e.clientY + $(window).scrollTop();

					if(X == pageX && Y == pageY) {
						downElem.toggleClass('selected');
						selectBoxElem.remove();
						return;
					}

					var minX = Math.min(X, pageX), maxX = Math.max(X, pageX);
					var minY = Math.min(Y, pageY), maxY = Math.max(Y, pageY);

					selectBoxElem.width(maxX-minX).height(maxY-minY).css({
						left: minX + 'px',
						top: minY + 'px'
					});

					$.each(rects, function() {
						if(minX <= this.x2 && this.x <= maxX) {
							if(this.selected) {
								this.elem.removeClass('selected');
							} else {
								this.elem.addClass('selected');
							}
						} else if(this.selected) {
							this.elem.addClass('selected');
						} else {
							this.elem.removeClass('selected');
						}
					});
					selectBoxElem.remove();
				});
				$('<div style="clear:both;"></div>').appendTo(self.playerElem);
			} else {
				return self.getPukeElemForNormal(k).appendTo(self.playerElem);
			}
		},
		renderLeft: function(k) {
			var self = this;

			if(typeof(k) == 'undefined') {
				var i;

				self.leftElem.empty();
				for(i=0; i<self.leftArray.length; i++) {
					self.renderLeft(self.leftArray[i]);
				}
			} else {
				return self.getPukeElemForR90Percent(k).appendTo(self.leftElem);
			}
		},
		renderRight: function(k, zIndex) {
			var self = this;

			if(typeof(k) == 'undefined') {
				var i;
				
				zIndex = 1;

				self.rightElem.empty();
				for(i=0; i<self.rightArray.length; i++) {
					self.renderRight(self.rightArray[i], zIndex++);
				}
			} else {
				return self.getPukeElemForR90Percent(k).css({
					position: 'relative',
					zIndex: zIndex
				}).prependTo(self.rightElem);
			}
		},
		resizePlayer: function() {
			var self = this;
			var size = self.playerElem.children().size();
			if(size) {
				var width = (size - 1) * ($.landlordsGlobalOptions.puke54Options.width - parseInt($.landlordsGlobalOptions.paddingLeftOrTop)) + $.landlordsGlobalOptions.puke54Options.width;
				self.playerElem.css({
					width: width,
					marginLeft: Math.floor(-width/2) + 'px'
				});
			}
		},
		getPukeElemForNormal: function(k) {
			var p = $.landlordsGlobalOptions.puke54Object[k];

			return $('<div class="puke"></div>').attr('k', k).attr('title', k + ' - ' + p.title).css({
				float: 'left',
				width: $.landlordsGlobalOptions.puke54Options.width,
				height: $.landlordsGlobalOptions.puke54Options.height,
				overflow: 'hidden',
				marginLeft: '-' + $.landlordsGlobalOptions.paddingLeftOrTop
			}).css($.landlordsGlobalOptions.puke54BackgroundStyleArray[p.Y][p.X].normal);
		},
		getPukeElemForR90: function(k) {
			var p = $.landlordsGlobalOptions.puke54Object[k];

			return $('<div class="puke"></div>').attr('k', k).attr('title', k + ' - ' + p.title).css({
				width: $.landlordsGlobalOptions.puke54Options.height,
				height: $.landlordsGlobalOptions.puke54Options.width,
				overflow: 'hidden',
				marginTop: '-' + $.landlordsGlobalOptions.paddingLeftOrTop
			}).css($.landlordsGlobalOptions.puke54BackgroundStyleArray[p.Y][p.X].r90);
		},
		getPukeElemForNormalPercent: function(k) {
			var p = $.landlordsGlobalOptions.puke54Object[k];
			var imgElem = $('<img src="images/puke54.png" border="0"/>').css($.landlordsGlobalOptions.puke54BackgroundStyleArray[p.Y][p.X].normalPercent);

			return $('<div class="puke"></div>').attr('k', k).attr('title', k + ' - ' + p.title).css({
				position: 'relative',
				float: 'left',
				width: $.landlordsGlobalOptions.puke54Options.width * $.landlordsGlobalOptions.puke54Options.leftAndRightPlayerPercent,
				height: $.landlordsGlobalOptions.puke54Options.height * $.landlordsGlobalOptions.puke54Options.leftAndRightPlayerPercent,
				overflow: 'hidden',
				marginLeft: '-' + $.landlordsGlobalOptions.paddingLeftOrTopPercent
			}).append(imgElem);
		},
		getPukeElemForR90Percent: function(k) {
			var p = $.landlordsGlobalOptions.puke54Object[k];
			var imgElem = $('<img src="images/puke54-r90.png" border="0"/>').css($.landlordsGlobalOptions.puke54BackgroundStyleArray[p.Y][p.X].r90Percent);

			return $('<div class="puke"></div>').attr('k', k).attr('title', k + ' - ' + p.title).css({
				position: 'relative',
				width: $.landlordsGlobalOptions.puke54Options.height * $.landlordsGlobalOptions.puke54Options.leftAndRightPlayerPercent,
				height: $.landlordsGlobalOptions.puke54Options.width * $.landlordsGlobalOptions.puke54Options.leftAndRightPlayerPercent,
				overflow: 'hidden',
				marginTop: '-' + $.landlordsGlobalOptions.paddingLeftOrTopPercent
			}).append(imgElem);
		},
		// 随机一个整数
		randInt: function(maxValue) {
			return Math.floor(Math.random()*maxValue);
		}
	};

	/**
	 * 添加玩家
	 * 
	 * @param options 可选参数
	 *     1. $('.g-landlords').landlords(); $('.g-landlords').landlords({});
	 *     2. $('.g-landlords').landlords('log'); $('.g-landlords').landlords('options', {}); $('.g-landlords').landlords('options', 'beforeInit', function(){}); $('.g-landlords').landlords('options', 'isRobot', false);
	 * @return this jQuery的对象
	 */
	$.fn.landlords = function(options) {
		var args = [];
		var i;
		for(i=1; i<arguments.length; i++) {
			args.push(arguments[i]);
		}
		
		this.filter('.g-landlords').each(function() {
			var landlords = $(this).data('landlords');
			
			if(typeof(options) == 'string') {
				if($.isFunction(landlords[options])) {
					landlords[options].apply(landlords, args);
				} else if(options == 'options') { // $().landlords('options', ...)
					if($.isPlainObject(args[1])) { // $().landlords('options', {})
						$.extend(true, landlords.options, args[0]);
					} else if(args[1] in landlords.options) { // $().landlords('options', 'optionName', optionValue)
						if($.isPlainObject(landlords.options[args[0]])) { // $().landlords('options', 'optionName', {})
							$.extend(true, landlords.options[args[0]], args[1]);
						} else { // $().landlords('options', 'eventName', function() {})
							landlords.options[args[1]] = args[1];
						}
					} else {
						alert('没有 $.landlords.options.' + args[0] + ' 选项属性！');
					}
				} else {
					alert('不合法属性或方法 $.landlords.' + args[0] + ' ！');
				}
			} else if($.isPlainObject(options)) {
				$.extend(true, landlords.options, options);
			} else {
				alert('不合法的操作 landlords ' + options + ' ！');
			}
		});
		
		this.not('.g-landlords').addClass('g-landlords').each(function() {
			$(this).data('landlords', new $.landlords(this, options));
		});
		
		return this;
	};

	$.fn.disabled = function(isDisabled) {
		if(isDisabled) {
			this.addClass('disabled');
		} else {
			this.removeClass('disabled');
		}
		return this.attr('disabled', isDisabled);
	};
})(jQuery);
