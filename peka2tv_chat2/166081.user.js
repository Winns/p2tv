// ==UserScript==
// @name        peka2tv chat
// @namespace   http://chat.sc2tv.ru
// @description sc2tv.ru chat with extra features
// @author      Winns
// @copyright   27.04.2013, Winns
// @include     http://chat.sc2tv.ru/*
// @include     http://sc2tv.ru/*
// @version     2.0.1
// @updateURL   http://userscripts.org/scripts/source/166081.meta.js
// @downloadURL https://userscripts.org/scripts/source/166081.user.js
// @grant       GM_addStyle
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_getResourceText
// @require     http://code.jquery.com/jquery-2.0.2.min.js
// @resource    peka2tv_chat_css https://raw.github.com/Winns/p2tv/master/peka2tv_chat2/peka2tv_chat.css
// ==/UserScript==
(function () {

GM_addStyle (GM_getResourceText ('peka2tv_chat_css'));

var HOST = window.location.host, 
	SUBDOMAIN = HOST.split('.')[0];

$(document).ready(function() {
	if (SUBDOMAIN === 'chat') {

	/* ====== Variables ====== */
		var cfg = { 
			el: {
				chat:					'#wchat-msgs-wrapper',
				chatInput:				'#wchat-input',
				chatPopUpClose:			'.wchat-menu-popup-close div',
				chatPopUp:				'.wchat-menu-popup',
				streamerBtn: 			'#wchat-btn-streamer',
				privateSmiles:			'.wchat-smile-private',
				userName: 				'.wchat-nick',
				userMenu: 				'#wchat-usermenu-wrapper',
				userMenuName: 			'.wchat-usermenu-name',
				userMenuClose: 			'#wchat-usermenu-wrapper .wchat-usermenu-close div',
				userMenuBan: 			'#wchat-usermenu-wrapper .wchat-usermenu-banmenu .wchat-btn',
				userMenuBanCallback:	'#wchat-usermenu-wrapper .wchat-usermenu-banmenu .wchat-usermenu-callback',
				menuButtons: 			'#wchat-menu-inner-wrapper .wchat-btn',
				menuWrapper: 			'#wchat-menu-wrapper',
				pleaseLogIn:			'#wchat-menu-inner-wrapper .wchat-please-login',
				cfgSmilesSize: 			'#wchat-cfg-smiles select',
				cfgMsgsLimit:			'#wchat-cfg-msgslimit select',
				channelsWrapper:		'#wchat-chanells-wrapper',

				cfgWrapper: 			'#wchat-cfg-wrapper',
				admWrapper: 			'#wchat-adm-wrapper',
				linksWrapper: 			'#wchat-links-wrapper',
				forYouWrapper: 			'#wchat-foryou-wrapper',
				smilesWrapper: 			'#wchat-smiles-wrapper'
			},
			version: 'v2.0',
			
			userMenuUserSetup: {
				name:	null,
				userId:	null,
				msgId:	null
			},
			
			userInfo: null,
			
			chatURL: 'http://chat.sc2tv.ru/',
			chatGate: 'http://chat.sc2tv.ru/gate.php',
			
			channelId: decodeURIComponent((new RegExp('[?|&]channelId=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null,
			channelsList: null,
			
			streamerName: '',
			streamTitle: '',
			chatMessagesLimit: GM_getValue('wchat_chatMessagesLimit') || 50,
			chatInterval: null,
			inputCaretPosition: 0,
			
			messages: null,
			smiles: unsafeWindow.smiles,
			smilesSize: GM_getValue('wchat_smilesSize') || 1,
			
			scrollTimer: null,
			doScroll: true,
			time: {
				scroll: 1100,
				newMsg: 900,
				hide: 300,
				show: 300,
				removeMsg: 800,
				userMenu: 180,
				banMsg: 3000,
				toggleChannels: 300,
				ajaxRetryOnError: 1000,
				scrollTimer: 2500, // auto scroll disabled for n seconds after user scroll or mousedown
				chatUpdateInterval: 4000
			}
		}
		var templates = {};
	
	
	
	/* ===== Templates ====== */
		templates.chat = function() {
			var html = '';
			html += '<div id="wchat-wrapper">';
			html += 	'<div id="wchat-chanells-wrapper"></div>';
			html += 	'<div id="wchat-msgs-wrapper"></div>';
			html += 	'<div id="wchat-menu-wrapper">';
			html += 		templates.cfgWrapper();
			html += 		templates.admWrapper();
			html += 		templates.linksWrapper();
			html += 		templates.forYouWrapper();
			html += 		templates.userMenu();
			html += 		'<div id="wchat-menu-inner-wrapper">';
			html += 			'<div class="input-wrapper"><textarea id="wchat-input" placeholder="Сообщение..." maxlength="1024"></textarea>';
			html += 				'<div id="wchat-btn-streamer" class="wchat-btn" title="Написать стримеру">S</div>';
			html += 				'<div id="wchat-btn-smiles" class="wchat-btn" title="Смайлы" data-target="smilesWrapper"></div>';
			html += 			'</div>';
			html += 			templates.pleaseLogIn();
			html += 			'<div id="wchat-menu-control">';
			html += 				'<div class="wchat-btn" title="Настройки" data-target="cfgWrapper">CFG</div>';
			html += 				'<div class="wchat-btn" title="Сообщения от администрации" data-target="admWrapper">ADM</div>';
			html += 				'<div class="wchat-btn" title="Ссылки из чата" data-target="linksWrapper">LINKS</div>';
			html += 				'<div class="wchat-btn disabled" title="Сообщения адресованные вам" data-target="forYouWrapper">4YOU</div>';
			html += 			'</div>';
			html += 		'</div>';
			html += 	'</div>';
			html += '</div>';
			return html;
		}
		templates.chatMSG = function( data ) {
			var html = '', style = getMessageStyle( data ),
				msgData = 'data-userid="'+ data.uid +'" data-msgid="'+ data.id +'"';

			html += '<div class="wchat-msg '+ style.msg +'" title="'+ data.date +'">';
			html += '<span class="wchat-nick '+ style.nick +'" '+ msgData +' >'+ data.name +'</span>'+ msg2html(data.message);
			html += '</div>';
			
			return html;
		}
		templates.smile = function( data ) {
			var style = 'width: '+ Math.floor(data.width * cfg.smilesSize) +'px; height: '+ Math.floor(data.height * cfg.smilesSize)+'px;';
			return '<img src="img/'+ data.img +'" title="'+ data.code +'" style="'+ style +'" />';
		}
		templates.smilesWrapper = function() {
			var html = smilesHtml = '', privateSmile,
				userLoggedIn = isUserLoggedIn();
			
			for (var i=0; i < cfg.smiles.length; i++) {
				privateSmile = '';
				
				// check if user have access to smile
				//if ( userLoggedIn ){
				//	for (var j=0; j < cfg.userInfo.roleIds.length; j++){
				//		if (cfg.smiles[ i ].roles.indexOf( cfg.userInfo.roleIds[ j ] ) == -1) {
				//			privateSmile = ' class="wchat-smile-private" title="Платные смайлы"';
				//		}
				//	}
				//}
				
				smilesHtml += '<div'+ privateSmile +'><img src="/img/'+ cfg.smiles[ i ].img +'" title="'+ cfg.smiles[ i ].code +'" /></div>';
			}
		
			html +=		'<div id="wchat-smiles-wrapper" class="wchat-menu-popup">';
			html += 		'<div class="wchat-menu-popup-close"><span>Смайлы</span><div>&#10005;</div></div>';
			html += 		'<div class="wchat-menu-popup-content">'+ smilesHtml +'</div>';
			html += 	'</div>';
			
			return html;
		}
		templates.cfgWrapper = function() {
			var html = '';

			html +=		'<div id="wchat-cfg-wrapper" class="wchat-menu-popup">';
			html += 		'<div class="wchat-menu-popup-close"><span>Настройки</span><div>&#10005;</div></div>';
			html += 		'<div class="wchat-menu-popup-content">';
			html += 			'<ul>';
			html += 				'<li id="wchat-cfg-smiles">';
			html += 					'Размер смайлов ';
			html += 					'<select>';
			html += 						'<option>1.25</option>';
			html += 						'<option>1</option>';
			html += 						'<option>0.9</option>';
			html += 						'<option>0.8</option>';
			html += 						'<option>0.7</option>';
			html += 						'<option>0.6</option>';
			html += 						'<option>0.5</option>';
			html += 						'<option title="Выключить смайлы">0</option>';
			html += 					'</select>';
			html += 				'</li>';
			html += 				'<li id="wchat-cfg-msgslimit">';
			html += 					'Лимит сообщений в чате ';
			html += 					'<select>';
			html += 						'<option>250</option>';
			html += 						'<option>200</option>';
			html += 						'<option>150</option>';
			html += 						'<option>100</option>';
			html += 						'<option>50</option>';
			html += 						'<option>20</option>';
			html += 						'<option>10</option>';
			html += 					'</select>';
			html += 				'</li>';
			
			html += 				'<li id="wchat-cfg-about">';
			html += 					'peka2tv chat <a href="http://userscripts.org/scripts/show/166081" target="_blank">'+ cfg.version +'</a><br>';
			html += 					'Установить старую версию <a href="http://userscripts.org/scripts/show/186199" target="_blank">v1.x</a> ';
			html += 				'</li>';
			html += 			'</ul>';
			html += 		'</div>';
			html += 	'</div>';
			
			return html;
		}
		templates.channels = function() {
			var html = '', id, text, textHTML,
				title = cfg.streamTitle,
				streamer = cfg.streamerName;

			if ((cfg.streamerName == '') && (cfg.streamTitle == ''))
				text = textHTML = 'Unknown channel';
			else {
				if (cfg.streamerName === undefined)
					text = textHTML = cfg.streamTitle;
				else {
					text = cfg.streamerName +': '+ cfg.streamTitle;
					textHTML = '<em>'+ cfg.streamerName +':</em> '+ cfg.streamTitle;
				}
			}

			html += '<div id="wchat-chanells-title" title="'+ text +'">'+ textHTML +'</div>';
			html += '<div id="wchat-chanells-list">';
			html += 	'<div class="wchat-select-menu">';
			
				for (var key in cfg.channelsList) {
					id			= cfg.channelsList[ key ].channelId;
					title		= cfg.channelsList[ key ].channelTitle;
					streamer	= cfg.channelsList[ key ].streamerName;

					if (streamer === undefined)
						text = textHTML = title;
					else {
						text = streamer +': '+title;
						textHTML = '<em>'+ streamer +':</em> '+ title;
					}
					
					html += '<div title="'+ text +'" data-chanell-id="'+ id +'" data-streamer="'+ streamer +'">'+ textHTML +'</div>';
				}
				
			html += 	'</div>';
			html += '</div>';
			
			return html;
		}
		templates.admWrapper = function() {
			var html = '';

			html +=		'<div id="wchat-adm-wrapper" class="wchat-menu-popup">';
			html += 		'<div class="wchat-menu-popup-close"><span>Сообщения от администрации</span><div>&#10005;</div></div>';
			html += 		'<div class="wchat-menu-popup-content"></div>';
			html += 	'</div>';
			
			return html;
		}
		templates.linksWrapper = function() {
			var html = '';

			html +=		'<div id="wchat-links-wrapper" class="wchat-menu-popup">';
			html += 		'<div class="wchat-menu-popup-close"><span>Ссылки из чата</span><div>&#10005;</div></div>';
			html += 		'<div class="wchat-menu-popup-content"></div>';
			html += 	'</div>';
			
			return html;
		}
		templates.forYouWrapper = function() {
			var html = '';

			html +=		'<div id="wchat-foryou-wrapper" class="wchat-menu-popup">';
			html += 		'<div class="wchat-menu-popup-close"><span>Сообщения адресованные вам</span><div>&#10005;</div></div>';
			html += 		'<div class="wchat-menu-popup-content"></div>';
			html += 	'</div>';
			
			return html;
		}
		templates.userMenu = function() {
			var html = '';

			html +=		'<div id="wchat-usermenu-wrapper">';
			html += 		'<div class="wchat-usermenu-close"><span class="wchat-usermenu-name"></span><div>&#10005;</div></div>';
			html += 		'<div class="wchat-usermenu-content">';
			html += 			'<ul>';
			html += 				'<li data-action="answer">Ответить</li>';
			html += 				'<li data-action="banmenu">Забанить</li>';
			html += 				'<li data-action="send-private-msg">Послать ЛС</li>';
			html += 			'</ul>';
			html += 		'</div>';
			html += 		'<div class="wchat-usermenu-banmenu">';
			html += 			'<div>Причина бана</div>';
			html += 			'<select>';
			html += 				'<option data-reason-id="1">Мат</option>';
			html += 				'<option data-reason-id="2">Завуалированый мат</option>';
			html += 				'<option data-reason-id="3">Угрозы жизни и здоровью</option>';
			html += 				'<option data-reason-id="4">Лёгкие оскорбления</option>';
			html += 				'<option data-reason-id="5">Серьёзные оскорбления</option>';
			html += 				'<option data-reason-id="6">Национализм, нацизм</option>';
			html += 				'<option data-reason-id="7">Реклама</option>';
			html += 				'<option data-reason-id="8">Спам</option>';
			html += 				'<option data-reason-id="9">Клевета</option>';
			html += 				'<option data-reason-id="10">Негативный троллинг</option>';
			html += 				'<option data-reason-id="11">Транслит, удаффщина, капсы</option>';
			html += 				'<option data-reason-id="12">Вредные ссылки</option>';
			html += 				'<option data-reason-id="13">Вредные флэшмобы</option>';
			html += 				'<option data-reason-id="14">Спойлер</option>';
			html += 			'</select>';
			html += 			'<br><div class="wchat-btn">Забанить</div>';
			html += 			'<div class="wchat-usermenu-callback"></div>';
			html += 		'</div>';
			html += 	'</div>';
			
			return html;
		}
		templates.pleaseLogIn = function() {
			var html = '';
			if ( !isUserLoggedIn() ) {
				html = '<div class="wchat-please-login">Please log in...</div>';
			}
			return html;
		}
	
	
	
	/* ====== Functions ====== */
		/* === jQuery === */
		$.fn.selectRange = function(start, end) {
			if(!end) end = start; 
			return this.each(function() {
				if (this.setSelectionRange) {
					this.focus();
					this.setSelectionRange(start, end);
				} else if (this.createTextRange) {
					var range = this.createTextRange();
					range.collapse(true);
					range.moveEnd('character', end);
					range.moveStart('character', start);
					range.select();
				}
			});
		};
		
		/* === Script === */
		function isUserLoggedIn() {
			if ((cfg.userInfo === '') || (cfg.userInfo === null) || (cfg.userInfo === undefined)) {
				return false;
			} else {
				if (cfg.userInfo.type === 'anon') {
					return false;
				} else {
					return true;
				}
			}
		}
		
		function msg2html( data ) {
			// bb codes parser
			var html = [
				'<b>$1</b>',
				'<a href="$1" target="_blank">$2</a>',
				'<a href="$1" target="_blank">$1</a>'
			];
			var bb = [
				/\[b\](.*?)\[\/b\]/g,
				/\[url=(.*?)\](.*?)\[\/url\]/g,
				/\[url\](.*?)\[\/url\]/g
			];
			for (var i=0; i < bb.length; i++) {
				data = data.replace( bb[i], html[i] );
			}

			// smiles
			data = data.replace( /:s(:[-a-z0-9]{2,}:)/gi, function( match, code ) {
				var smile = '';
				for (var i=0; i < cfg.smiles.length; i++) {
					if (cfg.smiles[i].code == code) {
						smile = templates.smile( cfg.smiles[i] );
					}
				}
				return smile;
			});
			
			return data;
		}

		function readChat() {
			$.getJSON( cfg.chatURL + 'memfs/channel-' + cfg.channelId + '.json', function( jsonData ){
				if ( jsonData != undefined ) {

					// form messages object. { 'message id': { -data- } }
					var messages = {};
					for (var key in jsonData.messages) {
						messages[ jsonData.messages[key].id ] = jsonData.messages[key];
					}
					
					// get new messages
					var newMessages = {};
					if (cfg.messages === null) {
						newMessages = messages;
						renderMessages( newMessages );
					} else {
						for (var key in messages) {
							if (cfg.messages.hasOwnProperty(key)) {
							} else {
								newMessages[ key ] = messages[ key ];
							}
						}
						renderMessages( newMessages );
					}
					cfg.messages = messages;
					
					// chat widgets
					widgetChatLinks( newMessages );
					widgetAdmMsgs( newMessages );
					widgetMsgsForYou( newMessages );
				}
			});

		}
		
		function checkMsgCount() {
			var msgsEl = $(cfg.el.chat).find('div');
			if (msgsEl.length > cfg.chatMessagesLimit) {
				msgsEl.slice(0, msgsEl.length-cfg.chatMessagesLimit).remove();
			}
		}
		
		function renderMessages( data, scrollAnimation ) {
			var html = '', 
				oldMsgs = $(cfg.el.chat).find('.wchat-msg'),
				newMsgs;
	
			if (scrollAnimation === undefined) { scrollAnimation = true; }
				
			// form msgs html
			var keys = Object.keys( data ), k, 
				length = keys.length;
			keys.sort();
			
			for (var i=length-1; i >= 0; i--) {
				k = keys[i];

				html = templates.chatMSG( data[k] ) + html;
			}
			// append new msgs
			$(cfg.el.chat).append( html );
			
			// animate new msgs
			newMsgs = $(cfg.el.chat).find('.wchat-msg').not( oldMsgs );
			if ( newMsgs.length ) {
				newMsgs.fadeTo( cfg.time.newMsg, 1 );
				
				if (scrollAnimation) {
					// scroll, dell msg over limit
					// if mousedown and scroll = false
					if ( (!$( cfg.el.chat+':active' ).length) && cfg.doScroll ) {
						$(cfg.el.chat).animate({ 
								scrollTop: $(cfg.el.chat)[0].scrollHeight 
							}, cfg.time.scroll, function(){
								checkMsgCount();
							}
						);
					}
				} else {
					$(cfg.el.chat).scrollTop( $(cfg.el.chat)[0].scrollHeight );
					checkMsgCount();
				}
			}
		}
		
		function clearChat() {
			cfg.messages = null;
			$(cfg.el.chat).html('');
			readChat();
		}
		
		function getMessageStyle( data ) {
			var style = { msg: '', nick: '' };
			switch (data.role) {
				case 'user':		style.nick = 'wchat-user-default'; break;
				case 'admin':		style.nick = 'wchat-user-admin'; break;
				case 'moderator':	style.nick = 'wchat-user-moderator'; break;
				case 'editor':		style.nick = 'wchat-user-editor'; break;
				case 'root':		style.nick = 'wchat-user-root'; break;
				case 'streamer':	style.nick = 'wchat-user-streamer'; break;
				default: 			style.nick = 'wchat-user-default'; break;
			}
			
			// top supporter
			if (data.roleIds.indexOf( 24 ) !== -1) {
				style.nick += ' wchat-user-topsupporter';
			}
			
			// message for you
			if (isUserLoggedIn()) {
				var msgForUserRegExp = new RegExp('\\[b\\]' + escapeData( cfg.userInfo.name ) + '\\[/b\\],','gi');
				if ( data.message.search( msgForUserRegExp ) != -1 ) {
					style.msg += ' wchat-msg-foruser';
				}
			}
			
			switch( data.uid ) {
				case '-2': 
					style.msg += ' wchat-msg-primetime'; 
					style.nick += ' wchat-user-primetime'; 
					break; // primetime bot
				case '-1': 
					style.msg += ' wchat-msg-system'; 
					style.nick += ' wchat-user-system'; 
					break;	// system message
			};
			
			return style;
		}
		
		function sendMessage() {
			var msg = $( cfg.el.chatInput ).val();
			
			// sanitize user msg
			msg = msg.replace( /[^\u0020-\u007E\u0400-\u045F\u0490\u0491\u0207\u0239\u2012\u2013\u2014]+/g, '' );
			msg = msg.replace( /[\s]+/g, ' ' );
			
			// fix smiles
			msg = fixSmileCode( msg );
			// fix url
			msg = unsafeWindow.AddUrlBBCode( msg );
			
			$( cfg.el.chatInput ).attr( 'readonly', 'readonly' );
			// post message
			$.post( cfg.chatGate,
				{ task: 'WriteMessage', message: msg, channel_id: cfg.channelId, token: cfg.userInfo.token },
				function( data ) {
					var jsonData = $.parseJSON( data );
					if( jsonData.error == '' ) {
						$( cfg.el.chatInput ).val('');
						readChat();
					} else {
						// error
					}

					$( cfg.el.chatInput ).removeAttr( 'readonly' );
				}
			);
			
		}
		
		function escapeData( data ) {
			return data.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
		}
		
		function fixSmileCode( data ) {
			var smilePattern;
			for( i=0; i < cfg.smiles.length; i++) {
				smilePattern = new RegExp( escapeData( cfg.smiles[ i ].code ), 'gi' );
				data = data.replace( smilePattern, ':s' + cfg.smiles[ i ].code  );
			}
			return data;
		}
		
		function saveCaretePosition() {
			cfg.inputCaretPosition = $(cfg.el.chatInput)[0].selectionStart;
		}

		
		
		/* === User menu === */
		function userMenuShow() {
			$( cfg.el.userMenu ).animate( {right: -$( cfg.el.userMenu ).width()}, cfg.time.userMenu );
		}
		function userMenuHide() {
			$( cfg.el.userMenu ).animate( {right: 0}, cfg.time.userMenu );
		}
		
		function voteBan( reasonId ) {
			$.post( cfg.chatGate, {
					task:		'CitizenVoteForUserBan',
					messageId:	cfg.userMenuUserSetup.msgId,
					banUserId:	cfg.userMenuUserSetup.userId,
					userName:	cfg.userMenuUserSetup.name,
					reasonId:	reasonId,
					token:		cfg.userInfo.token
				}, function( data ) {
					$( cfg.el.userMenuBanCallback ).html( $.parseJSON( data ).result );
					setTimeout(function() {
						userMenuHide();
					}, cfg.time.banMsg);
				}
			);
		}
		
		function getUserInfo() {
			$.ajax({
				url: cfg.chatGate + '?task=GetUserInfo&ref=' + document.referrer,
				dataType: 'json',
				success: function( data ) { 
					cfg.userInfo = data; 
					onUserInfoUpdate();
				},
				error: function() {
					setTimeout(function() { getUserInfo(); }, cfg.time.ajaxRetryOnError);
				}
			});
		}
			function onUserInfoUpdate() {
				if (isUserLoggedIn()) {
					// hide 'please log in..' overlay
					$( cfg.el.pleaseLogIn ).fadeOut( cfg.time.hide );
					// activate '4YOU' button
					$('.wchat-btn.disabled[data-target="forYouWrapper"]').removeClass('disabled');
					// append smiles window
					if ( !$( cfg.el.smilesWrapper ).length ) {
						$( cfg.el.menuWrapper ).prepend( templates.smilesWrapper() );
					}
				}
			}
		
		function getChannelsInfo() {
			$.ajax({
				url: cfg.chatURL + 'memfs/channels.json',
				dataType: 'json',
				success: function( jsonData ) { 
					cfg.channelsList = jsonData.channel;
					onChannelsInfoUpdate();
				},
				error: function() {
					setTimeout(function() { getChannelsInfo(); }, cfg.time.ajaxRetryOnError);
				}
			});
		}
			function onChannelsInfoUpdate() {
				for (var i=0; i < cfg.channelsList.length; i++) {
					if ( cfg.channelsList[ i ].channelId == cfg.channelId ) {
						cfg.streamerName = cfg.channelsList[ i ].streamerName;
						cfg.streamTitle = cfg.channelsList[ i ].channelTitle;
					}
				}
				
				// add channels to cfg menu
				$( cfg.el.channelsWrapper ).html( templates.channels() );
			}
		
		function toggleChannels() {
			var el = $('#wchat-chanells-list');
					
			el.toggleClass('active');
			if ( !el.hasClass('active') ) {
				el.stop(true, false).animate({top: '-83px' }, cfg.time.toggleChannels );
			} else {
				el.stop(true, false).animate({top: '12px' }, cfg.time.toggleChannels );
			}
		}
		
		
		
	/* ====== Chat widgets ====== */
		/* === Links === */
		function widgetChatLinks( data ) {
			var msg, hasLink, html = '', newMsgs;
			
			for ( var key in data ) {
				msg = data[ key ].message;
				hasLink = msg.match( /\[url\](.*?)\[\/url\]/g );
				
				if ( hasLink ) {
					html = templates.chatMSG( data[ key ] ) + html;
				}
			}
			$( cfg.el.linksWrapper ).find('.wchat-menu-popup-content').append( html );
			
			var messages = $( cfg.el.linksWrapper ).find('.wchat-msg');
			messages.css({opacity: 1});

			// remove messages over limit
			if (messages.length > cfg.chatMessagesLimit) {
				messages.slice(0, messages.length-cfg.chatMessagesLimit).remove();
			}
		}
		
		/* === Adm === */
		function widgetAdmMsgs( data ) {
			var html = '';
			
			for ( var key in data ) {
				if ( data[ key ].role != 'user' ) {
					html = templates.chatMSG( data[ key ] ) + html;
				}
			}
			$( cfg.el.admWrapper ).find('.wchat-menu-popup-content').append( html );
			
			var messages = $( cfg.el.admWrapper ).find('.wchat-msg');
			messages.css({opacity: 1});

			// remove messages over limit
			if (messages.length > cfg.chatMessagesLimit) {
				messages.slice(0, messages.length-cfg.chatMessagesLimit).remove();
			}
		}
		
		/* === 4You === */
		function widgetMsgsForYou( data ) {
			var html = '', msgForUserRegExp = new RegExp('\\[b\\]' + escapeData( cfg.userInfo.name ) + '\\[/b\\],','gi');

			for ( var key in data ) {
				if ( data[ key ].message.search( msgForUserRegExp ) != -1 ) {
					html = templates.chatMSG( data[ key ] ) + html;
				}
			};
			
			$( cfg.el.forYouWrapper ).find('.wchat-menu-popup-content').append( html );
			
			var messages = $( cfg.el.forYouWrapper ).find('.wchat-msg');
			messages.css({opacity: 1});
			
			// remove messages over limit
			if (messages.length > cfg.chatMessagesLimit) {
				messages.slice(0, messages.length-cfg.chatMessagesLimit).remove();
			}
		}
		
		/* === Cfg === */
		function updateCfgFrame() {
			$( cfg.el.cfgSmilesSize ).val( cfg.smilesSize );
			$( cfg.el.cfgMsgsLimit ).val( cfg.chatMessagesLimit );
		}
		function setSmilesSize( size ) {
			GM_setValue('wchat_smilesSize', size.toString() )
			cfg.smilesSize = size;
			
			renderMessages( cfg.messages, false );
		}
		function setMsgsLimit( limit ) {
			GM_setValue('wchat_chatMessagesLimit', limit.toString() )
			cfg.chatMessagesLimit = limit;
			
			renderMessages( cfg.messages, false );
		}

		
		
		/* ====== Init ====== */
		function init() {
			/* === Render === */
			$('body').append( templates.chat() );

			/* === Elements === */
				// stop jquery scroll animation on user scroll
				$(cfg.el.chat).on('wheel mousedown', function(){
					$(cfg.el.chat).stop();

					cfg.doScroll = false;
					clearTimeout( cfg.sctollTimer );
					cfg.sctollTimer = setTimeout(function() {
						cfg.doScroll = true;
					}, cfg.time.scrollTimer);
				});
				
			/* === Channels === */
				// set new channel
				$( document ).on('click', cfg.el.channelsWrapper +' .wchat-select-menu div', function() {			
					cfg.channelId = $(this).attr('data-chanell-id');

					clearChat();
					toggleChannels();
					onChannelsInfoUpdate();
				});
				// open channel menu
				$( document ).on('click', '#wchat-chanells-title', function() {
					toggleChannels();
				});

			/* === Chat input === */
				// submit message on "enter"
				$( cfg.el.chatInput ).on('keypress', function(e){
					if (e.which == 13) {
						e.preventDefault();
						sendMessage();
						return false; 
					}
				});

				// save caret position
				$( cfg.el.chatInput ).on('mouseup input paste change blur keypress', function(e){
					saveCaretePosition();
				});

			/* === Chat popup === */
				// close
				$ ( document ).on('click', cfg.el.chatPopUpClose, function() {
					$(this).parent().parent().toggleClass('active');
					$(this).parent().parent().animate({top: 0 }, cfg.time.hide );
				});

			/* === Streamer === */
				// handle streamer button
				$( cfg.el.streamerBtn ).on('click', function() {
					if ( (cfg.streamerName != '') && (cfg.streamerName != undefined) ){
						var streamer = '[b]'+ cfg.streamerName +'[/b], ',

						msg = $(cfg.el.chatInput).val();
						if (msg.substr(0, streamer.length) != streamer) {
							$(cfg.el.chatInput).val( streamer + msg );
						}
						$(cfg.el.chatInput).selectRange( streamer.length + msg.length );
					}
				});


			/* === handle popup show === */
				$( document ).on('click', cfg.el.menuButtons +':not(.disabled)', function(){
					var target = $(this).attr('data-target');

					if (target) {
						switch (target) {
							case 'cfgWrapper': updateCfgFrame(); break;
						}

						// hide other frames
						$( cfg.el.chatPopUp ).not( $(cfg.el[target]) )
							.removeClass('active')
							.animate({top: '0' }, cfg.time.hide );

						$( cfg.el[ target ] ).toggleClass('active');
						if ($( cfg.el[ target ] ).hasClass('active')) {
							$( cfg.el[ target ] ).animate({top: -$(cfg.el[ target ]).height() }, cfg.time.show );
						} else {
							$( cfg.el[ target ] ).animate({top: '0' }, cfg.time.hide );
						}
					}
				});

			/* === Smiles === */
				// handle smile post
				$( document ).on('click', cfg.el.smilesWrapper + ' .wchat-menu-popup-content div:not(.wchat-smile-private)', function() {
					var smile			= ' '+ $(this).find('img').attr('title') +' ',
						inputLength		= $( cfg.el.chatInput ).val().length,
						textBeforeCaret = $( cfg.el.chatInput ).val().substring( 0, cfg.inputCaretPosition ),
						textAfterCaret	= $( cfg.el.chatInput ).val().substring( cfg.inputCaretPosition, inputLength );

					// insert smile
					$(cfg.el.chatInput).val( textBeforeCaret + smile + textAfterCaret );
					// close window
					$( cfg.el.smilesWrapper ).removeClass('active').animate({top: '0' }, cfg.time.hide );
					// restor cursor position
					$(cfg.el.chatInput).selectRange( cfg.inputCaretPosition + smile.length );
				});
				// on private smile click
				$( document ).on('click', cfg.el.privateSmiles, function() {
					window.open('http://prime.sc2tv.ru/donate','_blank');
				});

			/* === User menu (on username click) === */
				// show
				$( document ).on('click', cfg.el.userName, function() {
					if ( isUserLoggedIn() ){
						var userMenu			= $( cfg.el.userMenu ),
							userMenuHeight		= userMenu.outerHeight(),
							chatHeight			= $(cfg.el.chat).outerHeight(),
							msgPosition			= $(this).position(),
							chatMenuPosition	= $(cfg.el.menuWrapper).position(),
							top					= -(chatHeight - msgPosition.top);

						if (-top < userMenuHeight) {
							top =  -userMenu.outerHeight();
						}
						userMenu.css('top', top );
						userMenu.find( cfg.el.userMenuName ).html( $(this).text() );

						// hide ban menu, show default menu
						userMenu.find('.wchat-usermenu-banmenu').hide();
						userMenu.find('.wchat-usermenu-content').show();

						// save data to variable
						cfg.userMenuUserSetup = {
							name: $(this).text(),
							userId: $(this).attr('data-userid'),
							msgId: $(this).attr('data-msgid')
						}

						userMenuShow();
					}
				});
				
				// hide
				$( cfg.el.userMenuClose ).on('click', function() { userMenuHide(); });
				
				// on menu click
				$( cfg.el.userMenu ).find('ul li[data-action]').on('click', function() {
					var action = $(this).attr('data-action');
					switch( action ) {
						case 'answer':
							var nick = '[b]'+ $(cfg.el.userMenuName).text() +'[/b], ';
							$( cfg.el.chatInput ).val( nick );
							$( cfg.el.chatInput ).selectRange( nick.length );
							userMenuHide();
							break;
						case 'banmenu': // hide default menu, show ban menu
							$( cfg.el.userMenu ).find('.wchat-usermenu-content').hide();
							$( cfg.el.userMenuBanCallback ).html('');
							$( cfg.el.userMenu ).find('.wchat-usermenu-banmenu').show();
							break;
						case 'send-private-msg':
							var id = cfg.userMenuUserSetup.userId;
							window.open('http://sc2tv.ru/messages/new/'+ id,'_blank'); 
							break;
					}
				});
				
				// ban menu
				$( cfg.el.userMenuBan ).on('click', function() {
					var reasonId = $(this).parent().find('option:selected').attr('data-reason-id');
					voteBan( reasonId );
				});

			/* ====== Cfg ====== */
				/* === Smiles size === */
				$( cfg.el.cfgSmilesSize ).on('change', function() {
					setSmilesSize( $(this).val() );
				});
				/* === Messages limit === */
				$( cfg.el.cfgMsgsLimit ).on('change', function() {
					setMsgsLimit( $(this).val() );
				});

			/* === Script === */
				// shutdown original chat
				clearInterval( unsafeWindow.chatTimerId );

				// get chat data from server
				setTimeout(function() { readChat(); }, 250);

				// updata chat data on interval
				if (cfg.chatInterval != null) {
					clearInterval( cfg.chatInterval );
				}
				cfg.chatInterval = setInterval(function() { 
					readChat() 
				}, cfg.time.chatUpdateInterval);
		}

		getUserInfo();
		getChannelsInfo();
		init();
	
	} // END (if SUBDOMAIN = chat)
});

})();
