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
		puke54Object: {},
		puke54BackgroundStyleArray: [],
		puke54Options: {
			width: 116,
			height: 177,
			positionX: 120,
			positionY: 182
		}
	};
	
	var pukeTitleArray = ['红桃(hearts)', '方块(diamonds)', '梅花(club)', '黑桃(spade)'];
	var pukeYArray = ['H', 'D', 'C', 'S'];
	var pukeXArray = ['A', 2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K'];
	var r90PositionX = $.landlordsGlobalOptions.puke54Options.positionY - $.landlordsGlobalOptions.puke54Options.height;

	$.landlordsGlobalOptions.puke54BackgroundStyleArray = $.initArray([5,13], function(y, x) {
		if(y == 4) {
			if(x == 0) {
				$.landlordsGlobalOptions.puke54Object.BJ = {
					title: '大王(big joker)',
					Y: 4,
					X: 0
				};
			} else if(x == 1) {
				$.landlordsGlobalOptions.puke54Object.LJ = {
					title: '小王(little joker)',
					Y: 4,
					X: 1
				};
			} else {
				return false;
			}
		} else {
			$.landlordsGlobalOptions.puke54Object[pukeYArray[y] + pukeXArray[x]] = {
				title: pukeTitleArray[y].replace('(', (x == 0 ? '尖儿' : pukeXArray[x]) + '(').replace(')', ' ' + (x == 0 ? 'Ace' : pukeXArray[x]) + ')'),
				Y: y,
				X: x
			};
		}

		return {
			normal: {
				background: 'transparent url(puke54.png) no-repeat',
				backgroundPositionX: (-$.landlordsGlobalOptions.puke54Options.positionX * x) + 'px',
				backgroundPositionY: (-$.landlordsGlobalOptions.puke54Options.positionY * y) + 'px'
			},
			r90: {
				background: 'transparent url(puke54-r90.png) no-repeat',
				backgroundPositionY: (-$.landlordsGlobalOptions.puke54Options.positionX * x) + 'px',
				backgroundPositionX: (-$.landlordsGlobalOptions.puke54Options.positionY * (4-y) - r90PositionX ) + 'px'
			}
		};
	});

	/**
	 * 斗地主游戏主函数 必须使用 new方法调用
	 * 
	 * @param elem 游戏容器
	 * @param options 游戏选项
	 * @return $.landlords Object
	 */
	$.landlords = function(elem, options) {
		this.elem = $(elem);
		this.options = $.extend(true, {}, this.options, options);
		this.init();
	};
	// 游戏对象方法或默认属性的定义
	$.landlords.prototype = {
		options: {
			isRobot: true
		},
		init: function() {
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
})(jQuery);
