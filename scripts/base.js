(function($) {
	var appFormWidget = (function() {
		
		// declare some reusable variables
		var urlInput       = $('#url-input'),
			urlSubmit      = $('#url-submit'),
			clrInputButton = $('#clr-input-button'),
			alertAppError  = $('#alert-app-error'),
			ajaxNotifier   = $('#ajax-loader-notifier'),
			howTo          = $('#how-to');
		
		// some helper functions used by 'clear input' & 'ui errors'
		var	inputExistence = function() {
			setTimeout(function() {
				if (urlInput.val() != '') {
					clrInputButton.fadeIn();
				} 
				else {
					if (urlInput.val() == '' && clrInputButton.not(':hidden')) {
							clrInputButton.fadeOut();
					}
				}
			}, 100);
		};
		var clearError     = function() {
			alertAppError.fadeOut();
			urlInput.removeClass('error');
		};
		
		// return object with init method to appFormWidget
		return {
			init: function() {
			
			// #url-input
				// initialize autofocus & placeholder behavior
				urlInput.focus();
				urlInput.enablePlaceholder();
				
				// bindings for clear input functionality
				urlInput.keydown(function() {
					inputExistence();
				});
				try {
					urlInput.bind('paste', function() {
						inputExistence();
					});
				} 
				catch (err1) {
					try {
						urlInput.bind('onpaste', function() {
							inputExistence();
						});
					} 
					catch (err2) {
						try { // windows ie only
							urlInput.attachEvent('onpaste', function() {
								inputExistence();
							});
						}
						catch (err3) {}
					}
				}
				clrInputButton.click(function() {
					clrInputButton.fadeOut();
					urlInput.val('').focus();
				});
				
				// ui error handling
				urlInput.focus(function() {
					if (urlInput.hasClass('error')) {
						clearError();					
					}
				});
				alertAppError.click(function() {
					clearError();
				});
				
			// #url-submit & #clr-input-button
				// initialize simple hover events
				var comboSubmitButton = urlSubmit.add(clrInputButton);
				comboSubmitButton.hover(function() {
					$(this).toggleClass('hover');
				});
				
			// #app-form submit handler
				$('#app-form').submit(function(e) {
					try {
						e.preventDefault();
						urlSubmit.attr('disabled', 'disabled').addClass('clicked');			
			
						var input  = urlInput.val(),
							cache  = $('#cache');
						
						// functions for ajax loader icon
						var showAjaxLoader = function() {
							urlSubmit.attr('value', '');
							ajaxNotifier.show();
						};
						var hideAjaxLoader = function() {
							urlSubmit.removeAttr('disabled').removeClass('clicked');
							ajaxNotifier.hide();
							urlSubmit.attr('value', 'abbrevi8*');
						};
						showAjaxLoader();
						
						// template-like function for response
						var cacheHelper    = function(o, n) {
							var oldValue = cache.attr('value');
							
							newValue = oldValue + ',' + o + ',' + n;
							
							cache.attr('value', newValue);
						};
						var twitterHelper  = function(u) {
							var enU = encodeURIComponent(u);
							var tplTW = $(document.createElement('iframe')).attr({
								'allowtransparency': 'true',
								'frameborder'      : '0',
								'scrolling'        : 'no',
								'src'              : 'http://platform.twitter.com/widgets/tweet_button.html?url=' + enU + '&count=horizontal&lang=en',
							}).css({'width' : '115px', 'height' : '22px'});
							
							return tplTW;
						};
						var facebookHelper = function(u) {
							var tplFB = $(document.createElement('fb:like')).attr({
								'href'      : u,
								'layout'    : 'button_count',
								'send'      : 'true',
								'width'     : '90',
								'show_faces': 'false',
								'font'      : 'trebuchet ms'
							});
							
							return tplFB;
						};
						var renderTemplate = function(r, t) {
							if (r.status == 'success') {
								var newUrl   = 'http://' + location.host + '/l/' + r.resUrl,
									zIndexer = $('#z-indexer');
									
								// increase the z-index of successive server responses
								var z = parseInt(zIndexer.attr('value')) + 1;
								z = z.toString();
								zIndexer.attr('value', z);
								
								var tplD = $(document.createElement('div')).addClass('server-response hidden').attr({
									'id': newUrl
								}).css({'z-index': z});
								var tplP = $(document.createElement('p'));
								var tplI = $(document.createElement('input')).attr({
									'type' : 'text',
									'name' : 'newUrl',
									'value': newUrl
								});
								var tplInnerD = $(document.createElement('div'));
								
								tplD.append(tplP.append(tplI));
								tplInnerD.append(facebookHelper(newUrl));
								tplInnerD.append(twitterHelper(newUrl));
								
								tplD.append(tplInnerD);
								
								tplD.hide().prependTo(howTo);
								
								var dinkyDom = document.getElementById(newUrl);
								FB.XFBML.parse(dinkyDom, function() {
									tplD.slideDown('slow');
								});
								
								if (t) {
									cacheHelper(r.reqUrl, r.resUrl);
								}
							}
							else {
								var eMsg  = 'Sorry, Error Occurred: ' + r.msg;
							
								var tplDe = $(document.createElement('div')).addClass('server-response hidden');
								var tplPe = $(document.createElement('p')).text(eMsg);
								
								tplDe.append(tplPe);
								
								tplDe.hide().prependTo(howTo).slideDown('slow');
							}
						};
						
						// pre-submission & response functions
						var checkCache = function(u) {
							var arr      = cache.attr('value').split(',');
							var arrValue = $.inArray(u, arr);
							if (arrValue == -1) {
								return true;
							}
							else {
								response({
									'status' : 'success',
									'reqUrl' : arr[arrValue],
									'resUrl' : arr[arrValue + 1]
								}, false);
								return false;
							}
						};
						var validate = function() {
							var isUrl = function(url) {
								return /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(url);
							};
							if (input != '' && isUrl(input)) {
								return checkCache(input);
							}
							else {
								hideAjaxLoader();
								alertAppError.fadeIn();
								urlInput.addClass('error');
								return false;
							}
						};
						var response = function(res, token) {
							token = typeof(token) == 'undefined' ? true : token;
						
							renderTemplate(res, token);
							hideAjaxLoader();
						};
				
						$.ajax({
							url       : '/',
							type      : 'POST',
							data      : {url: input},
							beforeSend: validate,
							success   : response,
							dataType  : 'json'
						});
					} catch (err) {} // ajax error, default to http
				});
			}
		};
	})();
	appFormWidget.init();
})(jQuery);