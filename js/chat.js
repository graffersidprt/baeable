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
			socket.emit('user_joined', {"room_id" : selectPerformerUniqueId,"user_name":sessionStorage.getItem('LoginCustomerUsername'),"socket_id" :socket.id });
		}

		if(sessionStorage.getItem('LoginPerformerUsername'))
		{
			socket.emit('performer_joined', {"room_id" : selectPerformerUniqueId,"user_name":sessionStorage.getItem('LoginPerformerName'),"socket_id" :socket.id });
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
				socket.emit('new_message', {message : message.val() ,"room_id" : selectPerformerUniqueId ,"user_name":sessionStorage.getItem('LoginCustomerUsername'), "socket_id" :socket.id})
			}

			if(sessionStorage.getItem('LoginPerformerUsername'))
			{
				socket.emit('new_message', {message : message.val() ,"room_id" : selectPerformerUniqueId ,"user_name":sessionStorage.getItem('LoginPerformerName'), "socket_id" :socket.id})
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
					socket.emit('new_message', {message : message.val() ,"room_id" : selectPerformerUniqueId ,"user_name":sessionStorage.getItem('LoginCustomerUsername'), "socket_id" :socket.id})
				}

				if(sessionStorage.getItem('LoginPerformerUsername'))
				{
					socket.emit('new_message', {message : message.val() ,"room_id" : selectPerformerUniqueId ,"user_name":sessionStorage.getItem('LoginPerformerName'), "socket_id" :socket.id})
				}
				message.val('');
			}
		}
	});

	socket.on("chat_message_sent" ,(data) => {
		feedback.html('');
		message.val('');
		chatroom.append("<p class='message'><b>" + data.user_name + " : </b> " + data.message + "</p>")
	});

	//Emit a username
	send_username.click(function(){
		socket.emit('change_username', {username : username.val()})
	})

	//Emit typing
	message.bind("keypress", () => {
		socket.emit('typing')
	})

	//Listen on typing
	socket.on('typing', (data) => {
		feedback.html("<p><i>" + data.username + " is typing a message..." + "</i></p>")
	})

	socket.on("new_user", (data) => {
		console.log(data);
	});

	socket.on("new_performer", (data) => {
		console.log(data);
	});

	socket.on("online_users", (data) => {
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

	/* user ask for private room */
	$("#go_to_private").click(function()
	{
		$.ajax({
			type: "POST",
			url : miricamServerUrl+'userApi/savePrivateChatNotification',
			data: {'performerUniqueId':selectPerformerUniqueId, 'customerPrimaryId':sessionStorage.getItem('LoginCustomerPrimaryId'), 'customerUsername':sessionStorage.getItem('LoginCustomerUsername'), 'totalPurchasedMins':'', 'totalPurchasedSecs':''},
			success : function (apiResponse)
			{
				if(apiResponse.status)
				{
					swal({
						title: "Stay Tuned!",
						text : apiResponse.message,
						icon : "success",
						timer:4000
					});

					socket.emit('private_chat_invitation', {"room_id" : selectPerformerUniqueId,"user_name":sessionStorage.getItem('LoginCustomerUsername'), "socket_id" :socket.id,"room_id_performer_name" : selectPerformerName, "customerPrimaryId":sessionStorage.getItem('LoginCustomerPrimaryId')});
				}
				else
				{
					swal({
						title: "Error!",
						text : apiResponse.message,
						icon : "error",
						timer:4000
					});
				}
			}
		});
	});

	function userSelectedPrivateRoom(roomID ,userName, performerName)
	{
		//save notification count in db
		//broadcast every other user that user has joined the room
		socket.emit('performer_went_to_private_chat', {"room_id" : roomID ,"user_name":userName, "socket_id" :socket.id, "performerName":performerName});
	};

	/* performer receives notification  by user */
	socket.on("performer_private_chat_notification", (response) => {

		//decided whether accept it or not ..select request from multiple user array
		//save private chat notification into table for future reference

		//now show notification ul to performer
		//play sound if any notification is arrive
		$.playSound(serverUrl+performerNotificationSound);

		var notificationHTML = '<li><span>'+response.user_name+' requests a private chat. </span> <a href="javascript:void(0);" data-room-id="'+response.room_id+'" data-user-name="'+response.user_name+'" data-performer-name="'+response.room_id_performer_name+'" class="acceptAnchor">ACCEPT ?</a></li>';

		$('#notifications_ul').append(notificationHTML);

		$('#notification_number').text($('#notifications_ul li').length).removeClass('hideClass');

		$('.acceptAnchor').click(function(){
			userSelectedPrivateRoom($(this).attr('data-room-id'),$(this).attr('data-user-name'), $(this).attr('data-performer-name') );

			//redirect performer on private chat page
		    window.location.href = 'performer-private-chat.html?UniqueId='+$(this).attr('data-room-id');
		});
	});

	socket.on("performer_busy_in_private_chat", (data) => {

		if(sessionStorage.getItem('LoginCustomerUsername') == data.user_name)
		{
			//console.log('show performer message performer reddy is personal chat');
			//redirect connected user on other page
			setTimeout(function()
			{
				window.location.href = 'user-private-chat.html?UniqueId='+data.room_id+'&uniquePerformerName='+data.performerName;
			}, 6000);
		}
		else
		{
			//console.log('show user message performer is busy is personal chat');
			window.location.href = 'performers-list.html';
		}	
	});
});