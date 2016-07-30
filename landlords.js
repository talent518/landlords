(function($) {

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
				$.landlordsGlobalOptions.puke54Object.BJ = {
					title: '大王(big joker)',
					Y: 4,
					X: 0,
					sort: 47,
					points: pointsString.charAt(17)
				};
				// console.log($.landlordsGlobalOptions.puke54Object.BJ);
			} else if(x == 1) {
				$.landlordsGlobalOptions.puke54Object.LJ = {
					title: '小王(little joker)',
					Y: 4,
					X: 1,
					sort: 46,
					points: pointsString.charAt(16)
				};
				// console.log($.landlordsGlobalOptions.puke54Object.LJ);
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
			ajaxUrl: 'landlords.php'
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
			self.playerScoreElem = $('<div class="g-score"></div>').appendTo(self.playerAvatarElem);
			self.playerNameElem = $('<div class="g-landlords-name g-landlords-player-name"><span class="mask"></span><a class="name" href="#" title="玩家一">玩家一</a></div>').appendTo(self.wrapperElem);
			self.playerNumberElem = $('<div class="g-landlords-icons g-landlords-number g-landlords-player-number">0</div>').appendTo(self.wrapperElem);
			self.playerTimerElem = $('<div class="g-landlords-icons g-landlords-timer g-landlords-player-timer">30</div>').appendTo(self.wrapperElem);

			self.leftElem = $('<div class="g-landlords-left" style="padding-top:' + $.landlordsGlobalOptions.paddingLeftOrTopPercent + ';"></div>').appendTo(self.wrapperElem);
			self.leftAvatarElem = $('<div class="g-landlords-icons g-landlords-avatar g-landlords-left-avatar"></div>').appendTo(self.wrapperElem);
			self.leftScoreElem = $('<div class="g-score"></div>').appendTo(self.leftAvatarElem);
			self.leftNameElem = $('<div class="g-landlords-name g-landlords-left-name"><span class="mask"></span><a class="name" href="#" title="玩家三">玩家三</a></div>').appendTo(self.wrapperElem);
			self.leftNumberElem = $('<div class="g-landlords-icons g-landlords-number g-landlords-left-number">0</div>').appendTo(self.wrapperElem);
			self.leftTimerElem = $('<div class="g-landlords-icons g-landlords-timer g-landlords-left-timer">30</div>').appendTo(self.wrapperElem);

			self.rightElem = $('<div class="g-landlords-right" style="padding-top:' + $.landlordsGlobalOptions.paddingLeftOrTopPercent + ';"></div>').appendTo(self.wrapperElem);
			self.rightAvatarElem = $('<div class="g-landlords-icons g-landlords-avatar g-landlords-right-avatar"></div>').appendTo(self.wrapperElem);
			self.rightScoreElem = $('<div class="g-score"></div>').appendTo(self.rightAvatarElem);
			self.rightNameElem = $('<div class="g-landlords-name g-landlords-right-name"><span class="mask"></span><a class="name" href="#" title="玩家二">玩家二</a></div>').appendTo(self.wrapperElem);
			self.rightNumberElem = $('<div class="g-landlords-icons g-landlords-number g-landlords-right-number">0</div>').appendTo(self.wrapperElem);
			self.rightTimerElem = $('<div class="g-landlords-icons g-landlords-timer g-landlords-right-timer">30</div>').appendTo(self.wrapperElem);

			self.btnStartElem = $('<button class="g-landlords-icons g-landlords-button g-landlords-btn-start">开始</button>').appendTo(self.wrapperElem);
			self.btnCallElem = $('<button class="g-landlords-icons g-landlords-button g-landlords-btn-call">叫地主</button>').appendTo(self.wrapperElem);
			self.btnNotCallElem = $('<button class="g-landlords-icons g-landlords-button g-landlords-btn-not-call">不叫</button>').appendTo(self.wrapperElem);
			self.btnNotLeadElem = $('<button class="g-landlords-icons g-landlords-button g-landlords-btn-not-lead">不出</button>').appendTo(self.wrapperElem);
			self.btnPromptElem = $('<button class="g-landlords-icons g-landlords-button g-landlords-btn-prompt">提示</button>').appendTo(self.wrapperElem);
			self.btnLeadElem = $('<button class="g-landlords-icons g-landlords-button g-landlords-btn-lead">出牌</button>').appendTo(self.wrapperElem);
			self.btnChangeElem = $('<button class="g-landlords-icons g-landlords-button g-landlords-btn-change">换桌</button>').disabled(true).appendTo(self.wrapperElem);
			self.btnLogoutElem = $('<button class="g-landlords-icons g-landlords-button g-landlords-btn-logout">退出</button>').appendTo(self.wrapperElem);

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
						self.message($('button:visible', formElem).text() + '成功！', 0, function() {
							self.post('init');
						});
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

			if(!$.isPlainObject(data)) {
				data = {};
			}

			if($.isFunction(data)) {
				settings = callback;
				callback = data;
				data = {};
			}

			if(!$.isFunction(callback)) {
				callback = function(json) {
					if(typeof(json.callback) === 'string') {
						json.callback = new Function('json', json.callback);
						json.callback.call(self, json);
					}
				};
				settings = {};
			}

			data.action = action;

			self.loadingElem.show();

			$.ajax({
				global: false,
				url: self.options.ajaxUrl,
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
						self.message(response, $.inArray('html', this.dataTypes) > -1);
					}
				},
				error: function(xhr) {
					self.message(xhr.responseText);
				},
				complete: function() {
					self.loadingElem.hide();
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
				seconds = 30;
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

				if(zIndex == 13) {
					clearInterval(timer);

					self.renderCards();

					setTimeout(function() {
						self.sortRender();
					}, 150);
				}

				zIndex++;
			}, 150);

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

			self.playerNumberElem.text(13);
			self.leftNumberElem.text(13);
			self.rightNumberElem.text(13);

			self.renderCards();
			self.renderPlayer();
			self.renderLeft();
			self.renderRight();
			self.resizePlayer();
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
				var calcSelectedElem = function(e) {
					var pageX = e.clientX + $(window).scrollLeft();
					var pageY = e.clientY + $(window).scrollTop();

					if(X == pageX && Y == pageY) {
						downElem.toggleClass('selected');
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
				};

				self.playerElem.children().mousedown(function(e) {
					if(isDowned) {
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

					calcSelectedElem(e);
				}).unbind('mouseup.landlords').bind('mouseup.landlords', function(e) {
					if(!isDowned) {
						return;
					}
					isDowned = false;
					calcSelectedElem(e);
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
				self.playerElem.css('margin-left', Math.floor(-width/2) + 'px');
			} else {
				self.playerElem.css('margin-left', '0px');
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
