/*
 * popLayer
 * Copyright (c) 2011 [好～宇～坏] （QQ:123851072）
 * @version 1.0
 */
(function ($) {
	var openedLayer = "";
	var parentElement = "no";
	$.showPopLayer = function (options) {
		options = jQuery.extend({
			target: "",
			screenLock: true,
			screenLockBackground: "#000",
			screenLockOpacity: "0.5",
			onPop: function () { },
			onClose: function () { },
			fixedPosition: true,
			formID: "",
			animate: true
		}, options);
		showIt(options);
		return this;
	}


	$.closePopLayer = function () {
		target = openedLayer.target;

		if (typeof (target) != "undefined") {
			if (openedLayer.animate) {

				$("#" + target).fadeOut('fast', function () {
					if (parentElement != "no") {
						$("#" + target).appendTo($("#" + parentElement));
					}
				});
				hideScreenLock(true);
			} else {
				$("#" + target).css("display", "none");
				hideScreenLock(false);
				if (parentElement != "no") {
					$("#" + target).appendTo($("#" + parentElement));
				}
			}
		}
		openedLayer.onClose();
	}


	function setScreenLockSize() {
		$('#ScreenLockDiv').height($(document).height() + "px");
		$('#ScreenLockDiv').width($(document.body).outerWidth(true) + "px");
	}


	function showScreenLock(bg_color, bg_opacity, useAnimate) {
		if ($('#ScreenLockDiv').length) {
			setScreenLockSize();
			if (useAnimate) {
				$('#ScreenLockDiv').fadeIn('slow');
			} else {
				$('#ScreenLockDiv').css("display", "block");
			}
		} else {
			$("body").append("<div id='ScreenLockDiv'></div>");
			$('#ScreenLockDiv').css({
				position: "absolute",
				background: bg_color,
				left: "0",
				top: "0",
				opacity: bg_opacity,
				"z-index": "8000",
				display: "none"
			});
			showScreenLock(bg_color, bg_opacity, useAnimate);
		}
	}

	function hideScreenLock(useAnimate) {
		if (useAnimate) {
			$('#ScreenLockDiv').fadeOut('normal');
		} else {
			$('#ScreenLockDiv').css("display", "none");
		}
	}

	function setPopLayerPosition(obj) {
		var windowWidth = document.documentElement.clientWidth;
        var windowHeight = document.documentElement.clientHeight;
        
		var popupHeight = $(obj).height();
		var popupWidth = $(obj).width();
		$(obj).css({
			"position": "absolute",
			"z-index": "10000",
			"top": (windowHeight - popupHeight) / 2 + $(document).scrollTop() + "px",
			"left": (windowWidth - popupWidth) / 2 + "px"
		});
	}

	function showIt(popObject) {
		openedLayer = popObject;
		var _tDiv = $("#" + popObject.target);
		var _screenlock = popObject.screenLock;
		var _bgcolor = popObject.screenLockBackground;
		var _bgopacity = popObject.screenLockOpacity;
		var _animate = popObject.animate;
		var _isFixed = popObject.fixedPosition;
		var _formID = popObject.formID;

		if (_screenlock) {
			showScreenLock(_bgcolor, _bgopacity, _animate);
			$(window).resize(function () { setScreenLockSize(); });
		}

		if (_tDiv.parent().attr('id') != _formID && _formID != '') {
			parentElement = _tDiv.parent().attr("id");
			_tDiv.appendTo($("#" + _formID));
		}

		setPopLayerPosition(_tDiv);

		if (_animate) {
			_tDiv.fadeIn();
		} else {
			_tDiv.css("display", "block");
		}
		if (_isFixed) {
			$(window).scroll(function () { setPopLayerPosition(_tDiv); });
			$(window).resize(function () { setPopLayerPosition(_tDiv); });
		}

		openedLayer.onPop();
	}

})(jQuery);