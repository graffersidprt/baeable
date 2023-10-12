$(function()
{
	//make connection
	var socket = io.connect('http://192.168.0.137:7002/');
	var selectPerformerUniqueId = getUrlParamUsingName('UniqueId');
	var selectPerformerName = getUrlParamUsingName('uniquePerformerName');

	socket.on('connect', function()
	{
		if(sessionStorage.getItem('LoginCustomerUsername'))
		{
           socket.emit('user_joined_private', {"room_id" : selectPerformerUniqueId,"user_name":sessionStorage.getItem('LoginCustomerUsername'),"socket_id" :socket.id});
		}

		if(sessionStorage.getItem('LoginPerformerUsername'))
		{
			socket.emit('performer_joined_private', {"room_id" : selectPerformerUniqueId,"user_name":sessionStorage.getItem('LoginPerformerName'),"socket_id" :socket.id } );
		}
	});

	//buttons and inputs
	var message = $("#message")
	var username = '';

	if(sessionStorage.getItem('isCustomerExist'))
		username = sessionStorage.getItem('LoginCustomerUsername');

	if(sessionStorage.getItem('isPerformerExist'))
		username = sessionStorage.getItem('LoginPerformerUsername');

	var send_message = $("#send_message")
	var send_username = $("#send_username")
	var chatroom = $(".userWriteTxt")
	var feedback = $("#feedback")

	//send message when send button pressed
	send_message.click(function()
	{
		if(message.val() != '')
		{
			if(sessionStorage.getItem('LoginCustomerUsername'))
			{
				 socket.emit('user_joined_private', {"room_id" : selectPerformerUniqueId,"user_name":sessionStorage.getItem('LoginCustomerUsername'),"socket_id" :socket.id ,private_user : userName});
			}

			if(sessionStorage.getItem('LoginPerformerUsername'))
			{
				socket.emit('performer_joined_private', {"room_id" : selectPerformerUniqueId,"user_name":sessionStorage.getItem('LoginPerformerName'),"socket_id" :socket.id } );
			}
		}
	});

	//send message when enter key pressed
	$('#message').on('keypress', function(e) {
		if (e.keyCode === 13)
		{
			if(message.val() != "")
			{
				if(sessionStorage.getItem('LoginCustomerUsername'))
				{
					socket.emit('private_new_message', {message : message.val() ,"room_id" : selectPerformerUniqueId ,"user_name":sessionStorage.getItem('LoginCustomerUsername'), "socket_id" :socket.id})
				}

				if(sessionStorage.getItem('LoginPerformerUsername'))
				{
					socket.emit('private_new_message', {message : message.val() ,"room_id" : selectPerformerUniqueId ,"user_name":sessionStorage.getItem('LoginPerformerName'), "socket_id" :socket.id})
				}
				message.val('');
			}
		}
	});

	socket.on("private_chat_message_sent" ,(data) => {
		feedback.html('');
		message.val('');
		chatroom.append("<p class='message'><b>" + data.user_name + " : </b> " + data.message + "</p>")
	});

	socket.on("private_room_users", (data) => {
		var html = '';
		var userlist  = data.userlist;

		if(userlist.length > 0)
		{
			userlist.forEach(function(value, key)
			{
				if(value.room_id == selectPerformerUniqueId)
				{
				  var userName = value.user_name;
				  html += '<p>'+userName+'</p>'; 
				}
			});
			$('.userListPanel').html('').html(html);
		}
	});

	//function call when user press end private chat
	$("#end_private").click(function()
	{
		socket.emit('private_chat_ended', {"room_id" : selectPerformerUniqueId,"user_name":sessionStorage.getItem('LoginCustomerUsername'), "socket_id" :socket.id,"room_id_performer_name" : selectPerformerName});

		//redirect user on private chat page
		window.location.href = 'performers-list.html';
	});

	//function call when performer get event of go private button
	socket.on("private_chat_ended_notification", (data) => {

		//redirect performer on dashboard page
		window.location.href = 'performer-dashboard.html?UniqueId='+data.room_id;
	});
});