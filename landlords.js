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

	$.landlordsGlobalOptions.puke54BackgroundStyleArray = $.initArray([5,13], function(y, x) {
		if(y == 4) {
			if(x == 0) {
				$.landlordsGlobalOptions.puke54Object.BJ = {
					title: '大王(big joker)',
					Y: 4,
					X: 0,
					sort: 14
				};
			} else if(x == 1) {
				$.landlordsGlobalOptions.puke54Object.LJ = {
					title: '小王(little joker)',
					Y: 4,
					X: 1,
					sort: 13
				};
			} else {
				return false;
			}
		} else {
			$.landlordsGlobalOptions.puke54Object[pukeYArray[y] + pukeXArray[x]] = {
				title: pukeTitleArray[y].replace('(', (x == 0 ? '尖儿' : pukeXArray[x]) + '(').replace(')', ' ' + (x == 0 ? 'Ace' : pukeXArray[x]) + ')'),
				Y: y,
				X: x,
				sort: (x == 0 ? 11 : (x == 1 ? 12 : x - 2))
			};
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
			isRobot: true
		},

		wrapperElem: $([]), // 游戏的主容器

		cardsElem: $([]), // 底牌容器
		cardsArray: [], // 底牌的数组的索引

		playerArray: [], // 主玩家牌的数组的索引
		playerElem: $([]), // 主玩家容器
		playerAvatarElem: $([]), // 主玩家头像
		playerNameElem: $([]), // 主玩家名字
		playerTimerElem: $([]), // 主玩家等待计时器

		leftArray: [], // 左玩家牌的数组的索引
		leftElem: $([]), // 左玩家容器
		leftAvatarElem: $([]), // 左玩家头像
		leftNameElem: $([]), // 左玩家名字
		leftNumberElem: $([]), // 左玩家牌的个数
		leftTimerElem: $([]), // 左玩家等待计时器

		rightArray: [], // 右玩家牌的数组的索引
		rightElem: $([]), // 右玩家容器
		rightAvatarElem: $([]), // 右玩家头像
		rightNameElem: $([]), // 右玩家名字
		rightNumberElem: $([]), // 右玩家牌的个数
		rightTimerElem: $([]), // 右玩家等待计时器

		btnStartElem: $([]), // 开始按钮

		btnCallElem: $([]), // 叫地主按钮
		btnNotCallElem: $([]), // 不叫按钮

		btnNotLeadElem: $([]), // 不出按钮
		btnPromptElem: $([]), // 提示按钮
		btnLeadElem: $([]), // 出牌按钮

		init: function() {
			var self = this;

			if(self.isInited) {
				alert('$.landlords.init() 不能重复执行！');
				return;
			}

			self.isInited = true; // 已初始化过游戏对象

			self.cardsElem = $('<div class="g-landlords-cards" style="padding-left:' + $.landlordsGlobalOptions.paddingLeftOrTopPercent + ';"></div>').appendTo(self.wrapperElem);

			self.playerElem = $('<div class="g-landlords-player" style="padding-left:' + $.landlordsGlobalOptions.paddingLeftOrTop + ';"></div>').appendTo(self.wrapperElem);
			self.playerAvatarElem = $('<div class="g-landlords-icons g-landlords-avatar g-landlords-player-avatar"></div>').appendTo(self.wrapperElem);
			self.playerNameElem = $('<div class="g-landlords-name g-landlords-player-name"><span class="mask"></span><a class="name" href="#" title="玩家一">玩家一</a></div>').appendTo(self.wrapperElem);
			self.playerNumberElem = $('<div class="g-landlords-icons g-landlords-number g-landlords-player-number">0</div>').appendTo(self.wrapperElem);
			self.playerTimerElem = $('<div class="g-landlords-icons g-landlords-timer g-landlords-player-timer">30</div>').appendTo(self.wrapperElem);

			self.leftElem = $('<div class="g-landlords-left" style="padding-top:' + $.landlordsGlobalOptions.paddingLeftOrTopPercent + ';"></div>').appendTo(self.wrapperElem);
			self.leftAvatarElem = $('<div class="g-landlords-icons g-landlords-avatar g-landlords-left-avatar"></div>').appendTo(self.wrapperElem);
			self.leftNameElem = $('<div class="g-landlords-name g-landlords-left-name"><span class="mask"></span><a class="name" href="#" title="玩家三">玩家三</a></div>').appendTo(self.wrapperElem);
			self.leftNumberElem = $('<div class="g-landlords-icons g-landlords-number g-landlords-left-number">0</div>').appendTo(self.wrapperElem);
			self.leftTimerElem = $('<div class="g-landlords-icons g-landlords-timer g-landlords-left-timer">30</div>').appendTo(self.wrapperElem);

			self.rightElem = $('<div class="g-landlords-right" style="padding-top:' + $.landlordsGlobalOptions.paddingLeftOrTopPercent + ';"></div>').appendTo(self.wrapperElem);
			self.rightAvatarElem = $('<div class="g-landlords-icons g-landlords-avatar g-landlords-right-avatar"></div>').appendTo(self.wrapperElem);
			self.rightNameElem = $('<div class="g-landlords-name g-landlords-right-name"><span class="mask"></span><a class="name" href="#" title="玩家二">玩家二</a></div>').appendTo(self.wrapperElem);
			self.rightNumberElem = $('<div class="g-landlords-icons g-landlords-number g-landlords-right-number">0</div>').appendTo(self.wrapperElem);
			self.rightTimerElem = $('<div class="g-landlords-icons g-landlords-timer g-landlords-right-timer">30</div>').appendTo(self.wrapperElem);

			self.btnStartElem = $('<button class="g-landlords-icons g-landlords-button g-landlords-btn-start">开始</button>').appendTo(self.wrapperElem);
			self.btnCallElem = $('<button class="g-landlords-icons g-landlords-button g-landlords-btn-call">叫地主</button>').hide().appendTo(self.wrapperElem);
			self.btnNotCallElem = $('<button class="g-landlords-icons g-landlords-button g-landlords-btn-not-call">不叫</button>').hide().appendTo(self.wrapperElem);
			self.btnNotLeadElem = $('<button class="g-landlords-icons g-landlords-button g-landlords-btn-not-lead">不出</button>').hide().appendTo(self.wrapperElem);
			self.btnPromptElem = $('<button class="g-landlords-icons g-landlords-button g-landlords-btn-prompt">提示</button>').hide().appendTo(self.wrapperElem);
			self.btnLeadElem = $('<button class="g-landlords-icons g-landlords-button g-landlords-btn-lead">出牌</button>').hide().appendTo(self.wrapperElem);
			self.btnChangeElem = $('<button class="g-landlords-icons g-landlords-button g-landlords-btn-change">换桌</button>').appendTo(self.wrapperElem);

			$('.g-landlords-name,.g-landlords-button', self.wrapperElem).hover(function(){
				$(this).addClass('hover');
			},function(){
				$(this).removeClass('hover');
			});

			var callback = function() {
				var downTimer = self.downTimer($('.g-landlords-timer', self.wrapperElem).show(), callback);
				/*
					// 提前结束倒计时
					setTimeout(function() {
						downTimer.clean();
					}, self.randInt(10000)+10000);
				*/
			};
			callback();
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
			var j, bj = self.randInt(3), ej = 51 + bj, i, k, puke54Array = [];

			for(k in $.landlordsGlobalOptions.puke54Object) {
				puke54Array.push(k);
			}
			
			self.playerArray = [];
			self.leftArray = [];
			self.rightArray = [];

			for(j=bj; j<ej; j++) {
				i = self.randInt(puke54Array.length);
				k = puke54Array[i];

				puke54Array.splice(i, 1);

				switch(j%3) {
					case 0:
						self.playerArray.push(k);
						
						break;
					case 1:
						self.rightArray.push(k);
						break;
					case 2:
						self.leftArray.push(k);
						break;
				}
			}

			self.cardsArray = puke54Array;
			self.cardsArray.sort(function(a, b) {
				return $.landlordsGlobalOptions.puke54Object[b].sort - $.landlordsGlobalOptions.puke54Object[a].sort;
			});

			self.playerArray.sort(function(a, b) {
				return $.landlordsGlobalOptions.puke54Object[b].sort - $.landlordsGlobalOptions.puke54Object[a].sort;
			});

			self.leftArray.sort(function(a, b) {
				return $.landlordsGlobalOptions.puke54Object[b].sort - $.landlordsGlobalOptions.puke54Object[a].sort;
			});

			self.rightArray.sort(function(b, a) {
				return $.landlordsGlobalOptions.puke54Object[b].sort - $.landlordsGlobalOptions.puke54Object[a].sort;
			});

			self.playerNumberElem.text(13);
			self.leftNumberElem.text(13);
			self.rightNumberElem.text(13);

			self.renderCards();
			self.renderPlayer();
			self.renderLeft();
			self.renderRight();

			if(self.randInt(2)) {
				self.playerAvatarElem.addClass('g-landlords-player-avatar-woman');
			} else {
				self.playerAvatarElem.removeClass('g-landlords-player-avatar-woman');
			}

			if(self.randInt(2)) {
				self.leftAvatarElem.addClass('g-landlords-left-avatar-woman');
			} else {
				self.leftAvatarElem.removeClass('g-landlords-left-avatar-woman');
			}

			if(self.randInt(2)) {
				self.rightAvatarElem.addClass('g-landlords-right-avatar-woman');
			} else {
				self.rightAvatarElem.removeClass('g-landlords-right-avatar-woman');
			}

			$('<div style="clear:both;"></div>').appendTo(self.cardsElem).clone().appendTo(self.playerElem);

			self.resizePlayer();
		},
		renderCards: function() {
			var self = this;
			var i;

			self.cardsElem.empty();
			for(i=0; i<3; i++) {
				self.getPukeElemForNormalPercent(self.cardsArray[i]).appendTo(self.cardsElem);
			}
		},
		renderPlayer: function() {
			var self = this;
			var i;

			self.playerElem.empty();
			for(i=0; i<self.playerArray.length; i++) {
				self.getPukeElemForNormal(self.playerArray[i]).appendTo(self.playerElem).click(function() {
					$(this).css('marginTop', $(this).css('marginTop') == '0px' ? '-20px' : '0px');
				});
			}
		},
		renderLeft: function() {
			var self = this;
			var i;

			self.leftElem.empty();
			for(i=0; i<self.leftArray.length; i++) {
				self.getPukeElemForR90Percent(self.leftArray[i]).appendTo(self.leftElem);
			}
		},
		renderRight: function() {
			var self = this;
			var i, zIndex = 20;

			self.rightElem.empty();
			for(i=0; i<self.rightArray.length; i++) {
				self.getPukeElemForR90Percent(self.rightArray[i]).css({
					position: 'relative',
					zIndex: zIndex--
				}).appendTo(self.rightElem);
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
