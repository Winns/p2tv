// ==UserScript==
// @name        peka2tv chat
// @namespace   sc2tv.ru
// @description sc2tv.ru chat extra features
// @author		Winns
// @copyright	27.04.2013, Winns
// @include     http://chat.sc2tv.ru/*
// @version     0.1b
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_addStyle
// @grant       GM_getResourceText
// @require		http://code.jquery.com/jquery-latest.js
// @resource	peka2tv_chat_style https://raw.github.com/Winns/p2tv/master/peka2tv_chat_restyle/peka2tv_chat.css
// ==/UserScript==

GM_addStyle (GM_getResourceText ("peka2tv_chat_style"));

$(document).ready(function() {
	// variables
		var msgsLimit	= 20,
			linksLimit	= 20,
			uMsgLimit	= 20,
			doScroll	= true;
	// variables end
	
	// functions begin
		// handle chat config box open/close
		function p2tv_chat_box_openclose(e) {
			var e = $( e ); 
			if ( e.is(':visible') ) {
				e.fadeOut(300);
			} else {
				e.fadeIn(300);
			}
		}
	// functions end

	
	
	
	// config frame
		// create config box
		$('<div id="p2tv_chat_config_wrapper" class="p2tv_chat_widget_wrapper">'
			+'<div id="p2tv_chat_config_close" class="p2tv_chat_widget_close"><em>CONFIG</em>CLOSE</div>'
			+'</div>'
		).appendTo( '#chat-form' );
		$('#chat-form').contents().not('form', '#p2tv_chat_config_wrapper').appendTo('#p2tv_chat_config_wrapper');
			
		// create config button
		$('<a href="javascript:// config" id="p2tv_chat_configbox_btn" class="p2tv_chat_widget_btn" data-target="#p2tv_chat_config_wrapper" title="open/close">CFG</a>')
		.appendTo( '#chat-form' );
		
		// handle chat config box open/close
		$('#p2tv_chat_configbox_btn').on('click', function() {
			p2tv_chat_box_openclose( '#p2tv_chat_config_wrapper' );
		});
		// handle chat config box close
		$('#p2tv_chat_config_close').on('click', function() {
			$('#p2tv_chat_config_wrapper').fadeOut(300);
		});	
	
	
	
	
	// admins msg's frame
		// create admins msg's button
		$('<a href="javascript:// config" id="p2tv_chat_adminsbox_btn" class="p2tv_chat_widget_btn" data-target="#p2tv_chat_adminsbox_wrapper" title="open/close">COL. MSG\'S</a>')
		.appendTo( '#chat-form' );
		
		// create admins msg's box
		$('<div id="p2tv_chat_adminsbox_wrapper" class="p2tv_chat_widget_wrapper">'
			+'<div id="p2tv_chat_adminsbox_close" class="p2tv_chat_widget_close"><em>"COLORED NICKS" MESSAGES</em>CLOSE</div>'
			+'<div id="p2tv_chat_adminsbox" class="p2tv_chat_widget_content"></div>'
			+'</div>'
		).appendTo( '#chat-form' );

		function p2tv_getAdminsMsgsFromChat( scroll ) {
			if ( typeof(scroll)==='undefined' ) { scroll = doScroll; }

			// push adms msgs
			var msgsSelect = $('#chat .mess .nick').not('.user-2,.user-8,.user-10,.user-14'); // .user-14 - fan/real streamer
			msgsSelect.each(function() {
				$('<div class="p2tv_chat_adminsbox_msg p2tv_chat_widget_msg" data-unique="'+ $(this).parent().attr('class') +'">'
						+$(this).prop('outerHTML')
						+$(this).parent().find('.text').prop('outerHTML')
					+'</div>'
				).appendTo( '#p2tv_chat_adminsbox' );
			});
			
			// remove duplicates
			if ( msgsSelect.length < msgsLimit ) {
				var p2tv_adminsmsgs_duplicateCheck = {};
				$( $('.p2tv_chat_adminsbox_msg').get().reverse() ).each (function () {
					if (p2tv_adminsmsgs_duplicateCheck.hasOwnProperty( $(this).attr('data-unique') )) {
						$(this).remove();
					} else {
						p2tv_adminsmsgs_duplicateCheck[ $(this).attr('data-unique') ] = true;
					}
				});
			}
			
			// delete amd msgs if over limit
			var msgsInFrame = $('.p2tv_chat_adminsbox_msg');
			if ( msgsInFrame.length > msgsLimit ) {
				msgsInFrame.slice(0, msgsInFrame.length - msgsLimit).remove();
			}

			if ( scroll == true ) {
				$('#p2tv_chat_adminsbox').scrollTop( $('#p2tv_chat_adminsbox').prop('scrollHeight') );
			}
		}

		// handle chat admins msg's box open/close
		$('#p2tv_chat_adminsbox_btn').on('click', function() {
			p2tv_chat_box_openclose( '#p2tv_chat_adminsbox_wrapper' );
			p2tv_getAdminsMsgsFromChat( true );
		});
		// handle chat admins msg's box close
		$('#p2tv_chat_adminsbox_close').on('click', function() {
			$('#p2tv_chat_adminsbox_wrapper').fadeOut(300);
		});
		
		
		

	// links frame	
		// create links button
		$('<a href="javascript:// config" id="p2tv_chat_linksbox_btn" class="p2tv_chat_widget_btn" data-target="#p2tv_chat_links_wrapper" title="open/close">LINKS</a>')
		.appendTo( '#chat-form' );

		// create links box
		$('<div id="p2tv_chat_links_wrapper" class="p2tv_chat_widget_wrapper">'
			+'<div id="p2tv_chat_links_close" class="p2tv_chat_widget_close"><em>LINKS</em>CLOSE</div>'
			+'<div id="p2tv_chat_links" class="p2tv_chat_widget_content"></div>'
			+'</div>'
		).appendTo( '#chat-form' );
		
		// get links from chat
		function p2tv_getLinksFromChat( scroll ) {
			if ( typeof(scroll)==='undefined' ) { scroll = doScroll; }

			// push links
			var linksSelect = $('#chat .mess .text a');
			linksSelect.each(function() {
				$('<div class="p2tv_chat_link_msg p2tv_chat_widget_msg" data-unique="'+ $(this).parent().parent().attr('class') +'">'
						+$(this).parent().parent().find('.nick').prop('outerHTML')
						+'<a href="'+ $(this).attr('href') +'" target="_blank">'+ $(this).attr('href') +'</a>'
					+'</div>'
				).appendTo( '#p2tv_chat_links' );
			});
			
			// remove duplicates
			if ( linksSelect.length < linksLimit ) {
				var p2tv_links_duplicateCheck = {};
				$( $('.p2tv_chat_link_msg').get().reverse() ).each (function () {
					if (p2tv_links_duplicateCheck.hasOwnProperty( $(this).attr('data-unique') )) {
						$(this).remove();
					} else {
						p2tv_links_duplicateCheck[ $(this).attr('data-unique') ] = true;
					}
				});
			}
			
			// delete links if over limit
			var linksInFrame = $('.p2tv_chat_link_msg');
			if (linksInFrame.length > linksLimit) {
				linksInFrame.slice(0, linksInFrame.length - linksLimit).remove();
			}

			if ( scroll == true ) {
				$('#p2tv_chat_links').scrollTop( $('#p2tv_chat_links').prop('scrollHeight') );
			}
		}
		
		// handle chat links box open/close
		$('#p2tv_chat_linksbox_btn').on('click', function() {
			p2tv_chat_box_openclose( '#p2tv_chat_links_wrapper' );
			p2tv_getLinksFromChat( true );
		});
		// handle chat links box close
		$('#p2tv_chat_links_close').on('click', function() {
			$('#p2tv_chat_links_wrapper').fadeOut(300);
		});

		
		
	// msg's for user frame	
		// msg's for user button
		$('<a href="javascript:// config" id="p2tv_chat_usermsg_btn" class="p2tv_chat_widget_btn" data-target="#p2tv_chat_usermsg_wrapper" title="open/close">4 YOU</a>')
		.appendTo( '#chat-form' );

		// msg's for user box
		$('<div id="p2tv_chat_usermsg_wrapper" class="p2tv_chat_widget_wrapper">'
			+'<div id="p2tv_chat_usermsg_close" class="p2tv_chat_widget_close"><em>MESSAGES FOR YOU</em>CLOSE</div>'
			+'<div id="p2tv_chat_usermsg" class="p2tv_chat_widget_content"></div>'
			+'</div>'
		).appendTo( '#chat-form' );
		
		// get msgs from chat
		function p2tv_getUserMsgFromChat( scroll ) {
			if ( typeof(scroll)==='undefined' ) { scroll = doScroll; }

			// push user msgs
			var uMsgSelect = $('#chat .mess .text[style="color:#f36223"]');
			uMsgSelect.each(function() {
				$('<div class="p2tv_chat_usermsg_msg p2tv_chat_widget_msg" data-unique="'+ $(this).parent().attr('class') +'">'
						+$(this).parent().find('.nick').prop('outerHTML')
						+$(this).prop('outerHTML')
					+'</div>'
				).appendTo( '#p2tv_chat_usermsg' );
			});
			
			// remove duplicates
			if ( uMsgSelect.length < uMsgLimit ) {
				var p2tv_uMsg_duplicateCheck = {};
				$( $('.p2tv_chat_usermsg_msg').get().reverse() ).each (function () {
					if (p2tv_uMsg_duplicateCheck.hasOwnProperty( $(this).attr('data-unique') )) {
						$(this).remove();
					} else {
						p2tv_uMsg_duplicateCheck[ $(this).attr('data-unique') ] = true;
					}
				});
			}
			
			// delete user msgs if over limit
			var uMsgInFrame = $('.p2tv_chat_usermsg_msg');
			if (uMsgInFrame.length > uMsgLimit) {
				uMsgInFrame.slice(0, uMsgInFrame.length - uMsgLimit).remove();
			}

			if ( scroll == true ) {
				$('#p2tv_chat_usermsg').scrollTop( $('#p2tv_chat_usermsg').prop('scrollHeight') );
			}
		}
		
		// handle msg's for user box open/close
		$('#p2tv_chat_usermsg_btn').on('click', function() {
			p2tv_chat_box_openclose( '#p2tv_chat_usermsg_wrapper' );
			p2tv_getUserMsgFromChat( true );
		});
		// handle chat links box close
		$('#p2tv_chat_usermsg_close').on('click', function() {
			$('#p2tv_chat_usermsg_wrapper').fadeOut(300);
		});
		
		
		
	// smiles frame
		// create new siles box
		$('<div id="p2tv_chat_smiles_wrapper" class="p2tv_chat_widget_wrapper">'
			+'<div id="p2tv_chat_smiles_close" class="p2tv_chat_widget_close"><em>SMILES</em>CLOSE</div>'
			+'<div id="p2tv_chat_smiles"></div>'
			+'</div>'
		).appendTo( '#chat-form' );
		
		// insert smiles to new siles box
		$('#chat-smile-panel img').each(function() {
			$(this).appendTo('#p2tv_chat_smiles');
		});
		
		// del old smile button and insert new
		$('#smile-btn').remove();
		$('<a href="javascript:// view smiles" id="p2tv_chat_smilesbox_btn" class="p2tv_chat_widget_btn" data-target="#p2tv_chat_smiles_wrapper" title="open/close">SMILES</a>')
		.appendTo( '#chat-form' );
		
		// handle chat smile box open/close
		$('#p2tv_chat_smilesbox_btn').on('click', function() {
			p2tv_chat_box_openclose( '#p2tv_chat_smiles_wrapper' );
		});
		// handle chat smile box close
		$('#p2tv_chat_smiles_close').on('click', function() {
			$('#p2tv_chat_smiles_wrapper').fadeOut(300);
		});
			
		// handle smile insert on click
		$('#p2tv_chat_smiles img').on('click', function() {
			$('#p2tv_chat_smiles_wrapper').fadeOut(300);
			$('input[name=chat-text]').val().append( $(this).attr('title') );
		});
		
		
		
	// handle widgets close
		$('.p2tv_chat_widget_btn').on('click', function() {
			$('.p2tv_chat_widget_wrapper').not( $($(this).attr('data-target')) ).hide();
		});
		
	
	
	// handele widgets scroll
		$('.p2tv_chat_widget_content').scroll( function(){
			if ( $(this)[0].scrollHeight - $(this).scrollTop() < $(this).outerHeight()+10 ) {
				doScroll = true;
			} else {
				doScroll = false;
			}
		});
		
		
		
	// modify chat default function to update widgets
		unsafeWindow.PutDataToChat = function( data ) {
			unsafeWindow.channelId = unsafeWindow.GetChannelId( unsafeWindow.chat_channel_id );

			if( unsafeWindow.$.cookie( 'is_moderator') ) {
				data = data.replace('class="censured"', 'class="red"');
				unsafeWindow.$( '#chat' ).html( data );
				unsafeWindow.AddChannelTitles();
				channelClassPath = 'div.channel-' + unsafeWindow.channelId;
				unsafeWindow.$( channelClassPath ).attr(
					'style', 'background-color:#333333 !important;'
				);
			}
			else {
				DIV = document.createElement( 'DIV' );
				DIV.innerHTML = data;
				unsafeWindow.$( '#chat' ).html( $( 'div.channel-' + unsafeWindow.channelId, DIV) );
			}
			
			if (unsafeWindow.autoScroll == 1) {
				unsafeWindow.$("#chat").scrollTop(10000000);
			}
			
			// new
			p2tv_getAdminsMsgsFromChat();
			p2tv_getLinksFromChat();
			p2tv_getUserMsgFromChat();
		}

});
