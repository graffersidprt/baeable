// JavaScript Document
$(document).ready(function(){
	/* onload of html page read configuration xml file
	* using ajax and put those config variables in
	* sessionStorage and use those varaibles in throughout site
	*/
	if (sessionStorage.getItem('performerUniqueId') == null)
	{
		onLoadReadXML();

		//apply disabled on button
		$('.btnNewSign').attr('disabled', 'disabled');
	}
	else
	{
		//apply disabled on button
		$('.btnNewSign').attr('disabled', 'disabled');
	}

	authenticatedPages = ['performers-list.html','performer-dashboard.html', 'performer-private-chat.html', 'subscription-list.html', 'user-private-chat.html', 'user-purchase-reply.html', 'user-purchase-time.html'];

	//function for get url last parameter and last segment
	getURLParameter();

	//code for get streamname at performer/ user end
	//streamname should be same at both side
	//condition for performer
	if(sessionStorage.getItem('isPerformerExist'))
	{
		//for public chat
		if(document.getElementById("streamName"))
			document.getElementById("streamName").value = sessionStorage.getItem('LoginPerformerUsername');

		//for private chat
		if(document.getElementById("streamNamePrivate"))
			document.getElementById("streamNamePrivate").value = sessionStorage.getItem('LoginPerformerUsername')+'private';
	}

	//condition for user
	if(sessionStorage.getItem('isCustomerExist'))
	{
		if(window.location.href.indexOf("uniquePerformerName") > -1)
		{
			var userStreamName = getUrlParamUsingName('uniquePerformerName');

			//for public chat
			if(document.getElementById("streamName"))
				document.getElementById("streamName").value = userStreamName;

			//for private chat
			if(document.getElementById("streamNamePrivate"))
				document.getElementById("streamNamePrivate").value = userStreamName+'private';
			start();
		}
	}

	//call functions for update performers sales reports and
	//user spent their money tables at run time
	setTimeout(function()
	{
		if(sessionStorage.getItem('isPerformerExist'))
		{
			//update performer if get tip
			setInterval(function()
			{
				isTipAdded();
			}, 7000);

			//update performer if any purchase made
			setInterval(function()
			{
				isPurchaseAdded();
			}, 9000);
		}
	}, 20000);

	//used on performer dashboard page
	if($("#userAgent").length)
	{
		$("#userAgent").val(navigator.userAgent);
	}

	//function for show online status of performer
	//if performer pressed broadcast now then update
	//is_online status =1 in DB
	//this ajax only run when customer is logged-in
	if($("#coustmermassage").length)
	{
		$("#coustmermassage").LoadingOverlay("show");
	}

	if(sessionStorage.getItem('isCustomerExist'))
	{
		setTimeout(function()
		{
			$("#coustmermassage").LoadingOverlay("hide");
		}, 2500);

		/*setTimeout(function()
		{
			checkPerformerOnlineStatus();
		}, 6000);*/

		setInterval(function()
		{
			getAllPerformerOfDomain();
		}, 40000);
	}

	//set netbill return url through JS
	if($("#netBillReturnURL").length)
	{
		if(window.location.href.indexOf("UniqueId") > -1)
		{
			var urlData = window.location.search.substr('?');
			var startIndex = urlData.indexOf("=");
			var selectPerformerUniqueId = urlData.substr(startIndex+1);
			$("#netBillReturnURL").val(sessionStorage.getItem('serverUrl')+'user-purchase-reply.html?UniqueId='+selectPerformerUniqueId);
		}
		else
		{
			$("#netBillReturnURL").val(sessionStorage.getItem('serverUrl')+'user-purchase-reply.html');
		}
	};

	//var verificationToken = window.location.search.substr(1);
	setTimeout(function()
	{
		if(window.location.href.indexOf("verification_token") > -1)
		{
			verify_sub_performer();
		}
		
		if(window.location.href.indexOf("user_token") > -1)
		{
			verify_customer();
		}
	}, 2000);

	//function for show performers recent online status
	setInterval(function()
	{
		getAllPerformerOfDomainOut();
	}, 40000);

	//intilize date calendar on set schedule modal
	intilizeDatePicker('showDatePicker');

	//intilize timepicker on show start/end time
	intilizeTimePicker('showStartTime');
	intilizeTimePicker('showEndTime');

	//function for check customer's free chat time
	setInterval(function()
	{
		checkFreeChatCookie('freeChatCookie')
	}, 10000);
});
//document ready end

//get configuration variables and set as global vars
miricamServerUrl           = '';
serverUrl                  = '';
performerUniqueId          = '';
performerUniqueName        = '';
performerUniqueHost        = '';
wordpressSiteUrl           = '';
performerUniqueChat        = '';
performerNotificationSound = '';
performerChatRoomSound     = '';
performerOfferTipSound     = '';
paymentSuccessSound        = '';

//loading overlay setup for entire site
$.LoadingOverlaySetup({
	background    : "rgba(42, 63, 84, .1)",
	image         : "images/loading-animation.gif",
	imageAnimation: "0s fadein",
	imageColor    : "#ffcc00"
});

//show loader on every page request
if (sessionStorage.getItem('performerUniqueId') == null)
	$.LoadingOverlay("show");

//function for read xml file on load document
function onLoadReadXML()
{
	//send ajax request and get config xml variables
	$.ajax({
		type    : "POST",
		url     : 'config.xml',
		dataType: 'xml',
		success : function (XMLResponse)
		{
			//set delay of 2sec to read config file
			setTimeout(function()
			{
				//parse xml response and save it in sessionStorage
				miricamServerUrl           = $.trim($(XMLResponse).find('config').find('miricamServerUrl').text());
				serverUrl                  = $.trim($(XMLResponse).find('config').find('serverUrl').text());
				performerUniqueId          = $.trim($(XMLResponse).find('config').find('performerUniqueId').text());
				performerUniqueName        = $.trim($(XMLResponse).find('config').find('performerUniqueName').text());
				performerUniqueHost        = $.trim($(XMLResponse).find('config').find('performerUniqueHost').text());
				wordpressSiteUrl           = $.trim($(XMLResponse).find('config').find('wordpressSiteUrl').text());
				performerUniqueChat        = $.trim($(XMLResponse).find('config').find('performerUniqueChat').text());
				performerNotificationSound = $.trim($(XMLResponse).find('config').find('performerNotificationSoundPath').text());
				performerChatRoomSound     = $.trim($(XMLResponse).find('config').find('performerChatRoomSoundPath').text());
				performerofferTipSound     = $.trim($(XMLResponse).find('config').find('performerOfferTipSoundPath').text());
				paymentSuccessSound        = $.trim($(XMLResponse).find('config').find('paymentSuccessSoundPath').text());

				//set config variables in sessionStorage
				sessionStorage.setItem('miricamServerUrl', miricamServerUrl);
				sessionStorage.setItem('serverUrl', serverUrl);
				sessionStorage.setItem('performerUniqueId', performerUniqueId);
				sessionStorage.setItem('performerUniqueName', performerUniqueName);
				sessionStorage.setItem('performerUniqueHost', performerUniqueHost);
				sessionStorage.setItem('wordpressSiteUrl', wordpressSiteUrl);
				sessionStorage.setItem('performerUniqueChat', performerUniqueChat);
				sessionStorage.setItem('performerNotificationSound', performerNotificationSound);
				sessionStorage.setItem('performerChatRoomSound', performerChatRoomSound);
				sessionStorage.setItem('performerofferTipSound', performerofferTipSound);
				sessionStorage.setItem('paymentSuccessSound', paymentSuccessSound);

				getAllPerformerOfDomainOut();
			}, 1500);
		}
	});
}

//if session storage have values then direct assign to
//global vars, else assign after config.xml read properly
if(sessionStorage.getItem('performerUniqueId') != null)
{
	//hide loader 
	$.LoadingOverlay("hide");

	//assign values to global vars
	miricamServerUrl           = sessionStorage.getItem('miricamServerUrl');
	serverUrl                  = sessionStorage.getItem('serverUrl');
	performerUniqueId          = sessionStorage.getItem('performerUniqueId');
	performerUniqueName        = sessionStorage.getItem('performerUniqueName');
	performerUniqueHost        = sessionStorage.getItem('performerUniqueHost');
	wordpressSiteUrl           = sessionStorage.getItem('wordpressSiteUrl');
	performerUniqueChat        = sessionStorage.getItem('performerUniqueChat');
	performerNotificationSound = sessionStorage.getItem('performerNotificationSound');
	performerChatRoomSound     = sessionStorage.getItem('performerChatRoomSound');
	performerofferTipSound     = sessionStorage.getItem('performerofferTipSound');
	paymentSuccessSound        = sessionStorage.getItem('paymentSuccessSound');

	//set view all sales URL for performer
	viewAllSalesURL = miricamServerUrl+'performer-all-sales/'+performerUniqueId;
	$("#viewAllSales").attr("href", viewAllSalesURL);

	//set view all users URL for performer
	viewAllUsersURL = miricamServerUrl+'performer-all-users/'+performerUniqueId;
	$("#viewAllUsers").attr("href", viewAllUsersURL);
}
else
{
	setTimeout(function()
	{
		//hide loader 
		$.LoadingOverlay("hide");

		//assign values to global vars
		miricamServerUrl           = sessionStorage.getItem('miricamServerUrl');
		serverUrl                  = sessionStorage.getItem('serverUrl');
		performerUniqueId          = sessionStorage.getItem('performerUniqueId');
		performerUniqueName        = sessionStorage.getItem('performerUniqueName');
		performerUniqueHost        = sessionStorage.getItem('performerUniqueHost');
		wordpressSiteUrl           = sessionStorage.getItem('wordpressSiteUrl');
		performerUniqueChat        = sessionStorage.getItem('performerUniqueChat');
		performerNotificationSound = sessionStorage.getItem('performerNotificationSound');
		performerChatRoomSound     = sessionStorage.getItem('performerChatRoomSound');
		performerofferTipSound     = sessionStorage.getItem('performerofferTipSound');
		paymentSuccessSound        = sessionStorage.getItem('paymentSuccessSound');

		//set view all sales URL for performer
		viewAllSalesURL = miricamServerUrl+'performer-all-sales/'+performerUniqueId;
		$("#viewAllSales").attr("href", viewAllSalesURL);

		//set view all users URL for performer
		viewAllUsersURL = miricamServerUrl+'performer-all-users/'+performerUniqueId;
		$("#viewAllUsers").attr("href", viewAllUsersURL);
	}, 2500);
}

//function for get url parameters and last segment
function getURLParameter()
{
	/*LOGIC : first get last segment of url and find this segment
	* into authenticated pages array. If segment is available in
	* array then check, user is logged in or not. If user is not
	* login then redirect on index page otherwise redirect on 
	* requested page.
	*/
	var pageURL        = window.location.href;
	var urlLastSegment = pageURL.substr(pageURL.lastIndexOf('/') + 1);

	//find last segment in array
	authenticatedPages.forEach(function(value, key)
	{
		if(urlLastSegment.search(value) != -1)
		{
			//get session storage that user is logged in or not
			var isUserLoggedIn = sessionStorage.getItem('isUserLoggedIn');
			if(!isUserLoggedIn)
			{
				//if user is not logged in then he can not access authenticated pages
				window.location.href = 'user-login.html';
			}
		}
	});
}

//function for validate login form
$("#performerLoginForm").validate({
	rules: {
		performerUsername : {
			required : true,
			minlength: 2,
			maxlength: 50
		},
		performerPassword : {
			required : true,
			minlength: 3,
			maxlength: 20
		}
	},
	messages: {
		performerUsername : {
			required : 'Please enter username.',
			minlength: 'Username can not be less then 2 characters.',
			maxlength: 'Username can not be greater then 50 characters.'
		},
		performerPassword : {
			required : 'Please enter password.',
			minlength: 'Password can not be less then 3 characters.',
			maxlength: 'Password can not be greater then 20 characters.'
		}
	},
	focusInvalid: false,
	submitHandler: function(form)
	{
		//show loader at form submission
		$.LoadingOverlay("show");
		return true;
	}
});

//function for validate login form
$("#customerLoginForm").validate({
	rules: {
		customerUsername : {
			required : true,
			minlength: 2,
			maxlength: 50
		},
		customerPassword : {
			required : true,
			minlength: 3,
			maxlength: 20
		}
	},
	messages: {
		customerUsername : {
			required : 'Please enter username.',
			minlength: 'Username can not be less then 2 characters.',
			maxlength: 'Username can not be greater then 50 characters.'
		},
		customerPassword : {
			required : 'Please enter password.',
			minlength: 'Password can not be less then 3 characters.',
			maxlength: 'Password can not be greater then 20 characters.'
		}
	},
	focusInvalid: false,
	submitHandler: function(form)
	{
		//show loader at form submission
		$.LoadingOverlay("show");
		return true;
	}
});

//function for validate performer signup form
$("#performerSignupForm").validate({
	rules: {
		name : {
			required : true,
			minlength: 2,
			maxlength: 50
		},
		username : {
			required : true,
			minlength: 2,
			maxlength: 50
		},
		websiteURL : {
			required : true,
			url      : true,
			maxlength: 200
		},
		email : {
			required: true,
			email   : true
		},
		password : {
			required : true,
			minlength: 3,
			maxlength: 20
		}
	},
	messages: {
		name : {
			required : 'Please enter name.',
			minlength: 'Name can not be less then 2 characters.',
			maxlength: 'Name can not be greater then 50 characters.'
		},
		username : {
			required : 'Please enter username.',
			minlength: 'Username can not be less then 2 characters.',
			maxlength: 'Username can not be greater then 50 characters.'
		},
		websiteURL : {
			required :'Please enter website URL.',
			url      :'Please enter valid website URL.',
			maxlength:'Website URL can not be greater then 200 characters.'
		},
		email : {
			required: 'Please enter email.',
			email   : 'Please enter valid email.'
		},
		password : {
			required : 'Please enter password.',
			minlength: 'Password can not be less then 3 characters.',
			maxlength: 'Password can not be greater then 20 characters.'
		}
	},
	focusInvalid: false,
	submitHandler: function(form)
	{
		//show loader at form submission
		$.LoadingOverlay("show");
		return true;
	}
});

//function for validate customer signup form
$("#customerSignupForm").validate({
	rules: {
		username : {
			required : true,
			minlength: 2,
			maxlength: 50
		},
		email : {
			required: true,
			email   : true
		},
		password : {
			required : true,
			minlength: 3,
			maxlength: 20
		}
	},
	messages: {
		username : {
			required : 'Please enter username.',
			minlength: 'Username can not be less then 2 characters.',
			maxlength: 'Username can not be greater then 50 characters.'
		},
		email : {
			required: 'Please enter email.',
			email   : 'Please enter valid email.'
		},
		password : {
			required : 'Please enter password.',
			minlength: 'Password can not be less then 3 characters.',
			maxlength: 'Password can not be greater then 20 characters.'
		}
	},
	focusInvalid: false,
	submitHandler: function(form)
	{
		//show loader at form submission
		$.LoadingOverlay("show");
		return true;
	}
});

//function for validate forgot password form
$("#forgotPasswordForm").validate({
	rules: {
		forgotUsername : {
			required : true,
			minlength: 2,
			maxlength: 50
		}
	},
	messages: {
		forgotUsername : {
			required : 'Please enter username.',
			minlength: 'Username can not be less then 2 characters.',
			maxlength: 'Username can not be greater then 50 characters.'
		}
	},
	focusInvalid: false,
	submitHandler: function(form)
	{
		//show loader at form submission
		$.LoadingOverlay("show");
		return true;
	}
});

$.validator.addMethod( "extension", function( value, element, param )
{
	param = typeof param === "string" ? param.replace( /,/g, "|" ) : "png|jpe?g|gif";
	return this.optional( element ) || value.match( new RegExp( "\\.(" + param + ")$", "i" ) );
}, $.validator.format( "Please enter a value with a valid extension." ) );

// function for validate sub performer sign up form
$("#subPerformerSignupForm").validate({
	rules: {
		name : {
			required : true,
			minlength:2,
			maxlength:50
		},
		username : {
			required : true,
			minlength:2,
			maxlength:50
		},
		email : {
			required: true,
			email   :true
		},
		password : {
			required : true,
			minlength:3,
			maxlength:20
		}/*,
		about : {
			required : true,
			minlength:10,
			maxlength:2000
		},
		performer_image1 : {
			required : true,
			extension: "jpg|jpeg|png|JPG|JPEG|PNG",
		},
		performer_image2 : {
			required : true,
			extension: "jpg|jpeg|png|JPG|JPEG|PNG",
		},
		performer_photoId : {
			required : true,
			extension: "jpg|jpeg|png|JPG|JPEG|PNG",
		}*/
	},
	messages: {
		name : {
			required : 'Please enter full legal name.',
			minlength: 'Full legal name can not be less then 2 characters.',
			maxlength: 'Full legal name can not be greater then 50 characters.'
		},
		username : {
			required : 'Please enter username.',
			minlength: 'Username can not be less then 2 characters.',
			maxlength: 'Username can not be greater then 50 characters.'
		},
		email : {
			required: 'Please enter email.',
			email   : 'Please enter valid email.'
		},
		password : {
			required : 'Please enter password.',
			minlength : 'Password can not be less then 3 characters.',
			maxlength : 'Password can not be greater then 20 characters.'
		}/*,
		about : {
			required : 'Please enter about yourself.',
			minlength: 'About yourself can not be less then 10 characters.',
			maxlength: 'About yourself can not be greater then 2000 characters.'
		},
		performer_image1 : {
			required : 'Please select a image.',
			extension: "Please upload image of allowed extensions : jpg, jpeg, png."
		},
		performer_image2 : {
			required : 'Please select a image.',
			extension: "Please upload image of allowed extensions : jpg, jpeg, png."
		},
		performer_photoId : {
			required : 'Please select a image.',
			extension: "Please upload image of allowed extensions : jpg, jpeg, png."
		}*/
	},
	focusInvalid: false,
	submitHandler: function(form)
	{
		//show loader at form submission
		$.LoadingOverlay("show");
		return true;
	}
});

//function for validate sub performer login form
$("#subPerformerLoginForm").validate({
	rules: {
		username : {
			required : true,
			minlength:2,
			maxlength:50
		},
		password : {
			required : true,
			minlength:3,
			maxlength:20
		}
	},
	messages: {
		username : {
			required : 'Please enter username.',
			minlength: 'Username can not be less then 2 characters.',
			maxlength: 'Username can not be greater then 50 characters.'
		},
		password : {
			required : 'Please enter password.',
			minlength : 'Password can not be less then 3 characters.',
			maxlength : 'Password can not be greater then 20 characters.'
		}
		
	},
	focusInvalid: false,
	submitHandler: function(form)
	{
		//show loader at form submission
		$.LoadingOverlay("show");
		return true;
	}
});

//custom validator method for validate alphanumeric in zip
$.validator.addMethod("alphanumeric", function(value, element) {
	return this.optional(element) || /^[\w.]+$/i.test(value);
}, "Please enter letters and numbers only.");

//function for validate customer purchase form
$("#customerPurchaseTimeForm").validate({
	rules: {
		Ecom_BillTo_Postal_Name_First : {
			required : true,
			minlength: 2,
			maxlength: 50
		},
		Ecom_BillTo_Postal_Name_Last : {
			required : true,
			minlength: 2,
			maxlength: 50
		},
		Ecom_BillTo_Online_Email : {
			required: true,
			email   : true
		},
		Ecom_BillTo_Postal_Street_Line1 : {
			required : true,
			minlength: 5,
			maxlength: 150
		},
		Ecom_BillTo_Postal_City : {
			required : true,
			minlength: 2,
			maxlength: 50
		},
		Ecom_BillTo_Postal_StateProv : {
			required: true
		},
		Ecom_BillTo_Postal_CountryCode : {
			required: true
		},
		Ecom_BillTo_Postal_PostalCode : {
			required    : true,
			minlength   : 2,
			maxlength   : 8,
			alphanumeric: true
		},
		Ecom_Payment_Card_Number : {
			required : true,
			maxlength: 20,
			minlength: 12,
			digits   : true
		},
		Ecom_Payment_Card_ExpDate_Month : {
			required: true
		},
		Ecom_Payment_Card_ExpDate_Year : {
			required: true
		},
		Ecom_Ezic_Response_Card_VerificationCode : {
			required : true,
			minlength: 3,
			maxlength: 3,
			digits   : true
		},
		Ecom_Cost_Total : {
			required : true,
			maxlength: 8,
			digits   : true
		}
	},
	messages: {
		Ecom_BillTo_Postal_Name_First : {
			required : 'Please enter first name.',
			minlength: 'First name can not be less then 2 characters.',
			maxlength: 'First name can not be greater then 50 characters.'
		},
		Ecom_BillTo_Postal_Name_Last : {
			required : 'Please enter last name.',
			minlength: 'Last name can not be less then 2 characters.',
			maxlength: 'Last name can not be greater then 50 characters.'
		},
		Ecom_BillTo_Online_Email : {
			required: 'Please enter email.',
			email   : 'Please enter valid email.'
		},
		Ecom_BillTo_Postal_Street_Line1 : {
			required : 'Please enter street address.',
			minlength: 'Street address can not be less then 5 characters.',
			maxlength: 'Street address can not be greater then 150 characters.'
		},
		Ecom_BillTo_Postal_City : {
			required : 'Please enter city.',
			minlength: 'City can not be less then 2 characters.',
			maxlength: 'City can not be greater then 50 characters.'
		},
		Ecom_BillTo_Postal_StateProv : {
			required: 'Please select state.'
		},
		Ecom_BillTo_Postal_CountryCode : {
			required: 'Please select country.'
		},
		Ecom_BillTo_Postal_PostalCode : {
			required : 'Please enter zipcode.',
			minlength: 'Zipcode can not be less then 2 digits.',
			maxlength: 'Zipcode can not be greater then 8 digits.'
		},
		Ecom_Payment_Card_Number : {
			required : "Please enter card number.",
			minlength: 'Card number can not be less then 12 digits.',
			maxlength: 'Card number can not be greater then 20 digits.',
			digits   : "Card number must be in digits only."
		},
		Ecom_Payment_Card_ExpDate_Month : {
			required: "Please select month.",
		},
		Ecom_Payment_Card_ExpDate_Year : {
			required: "Please select year."
		},
		Ecom_Ezic_Response_Card_VerificationCode : {
			required : "Please enter cvv.",
			minlength: 'CVV can not be less then 3 digits.',
			maxlength: 'CVV can not be greater then 3 digits.',
			digits   : "CVV must be in digits only."
		},
		Ecom_Cost_Total : {
			required : "Please enter amount.",
			maxlength: 'Amount can not be greater then 8 digits.',
			digits   : "Amount must be in digits only."
		}
	},
	focusInvalid: false,
	submitHandler: function(form)
	{
		//show loader at form submission
		$.LoadingOverlay("show");
		return true;
	}
});

//function for validate performer controls form
$("#performerControlsForm").validate({
	rules: {
		name : {
			required : true,
			minlength: 2,
			maxlength: 50
		},
		username : {
			required : true,
			minlength: 2,
			maxlength: 50
		},
		email : {
			required: true,
			email   : true
		},
		mobilePhone : {
			required : true,
			minlength: 5,
			maxlength: 15,
			digits   :true
		}
	},
	messages: {
		name : {
			required : 'Please enter name.',
			minlength: 'Name can not be less then 2 characters.',
			maxlength: 'Name can not be greater then 50 characters.'
		},
		username : {
			required : 'Please enter username.',
			minlength: 'Username can not be less then 2 characters.',
			maxlength: 'Username can not be greater then 50 characters.'
		},
		email : {
			required: 'Please enter email.',
			email   : 'Please enter valid email.'
		},
		mobilePhone : {
			required : 'Please enter mobile phone.',
			minlength: 'Mobile phone can not be less then 5 digits.',
			maxlength: 'Mobile phone can not be greater then 15 digits.',
			digits   : 'Mobile phone can can contain only digits.',
		},
		
	},
	focusInvalid: false,
	submitHandler: function(form)
	{
		//show loader at form submission
		$.LoadingOverlay("show");
		return true;
	}
});

//function for validate performer topic form
$("#performerTopicForm").validate({
	rules: {
		topic : {
			required : true,
			minlength: 2,
			maxlength: 250
		}
	},
	messages: {
		topic : {
			required : 'Please enter topic.',
			minlength: 'Topic can not be less then 2 characters.',
			maxlength: 'Topic can not be greater then 250 characters.'
		}
	},
	focusInvalid: false,
	submitHandler: function(form)
	{
		//show loader at form submission
		$.LoadingOverlay("show");
		return true;
	}
});

//function for validate performer per minute price form
$("#performerTimeSettingsForm").validate({
	rules: {
		perMinutePrice : {
			required : true,
			minlength: 1,
			maxlength: 5,
			number   : true
		}
	},
	messages: {
		perMinutePrice : {
			required : 'Please enter per minute price.',
			minlength: 'Per minute price can not be less then 1 digits.',
			maxlength: 'Per minute price can not be greater then 5 digits.',
			number   : 'Please enter only numbers.'
		}
	},
	focusInvalid: false,
	submitHandler: function(form)
	{
		//show loader at form submission
		$.LoadingOverlay("show");
		return true;
	}
});

//function for validate profile image upload form
$("#performerProfileImageForm").validate({
	rules: {
		performer_images : {
			required : true,
			extension: "jpg|jpeg|png|JPG|JPEG|PNG",
		}
	},
	messages: {
		performer_images : {
			required : 'Please select a avatar image.',
			extension: "Please upload avatar image of allowed extensions : jpg, jpeg, png."
		}
	},
	focusInvalid: false,
	submitHandler: function(form)
	{
		//show loader at form submission
		$.LoadingOverlay("show");
		return true;
	}
});

//function for validate profile photoId upload form
$("#performerPhotoIdImageForm").validate({
	rules: {
		photoIdImage : {
			required : true,
			extension: "jpg|jpeg|png|JPG|JPEG|PNG",
		}
	},
	messages: {
		photoIdImage : {
			required : 'Please select a photoID image.',
			extension: "Please upload photoID image of allowed extensions : jpg, jpeg, png."
		}
	},
	focusInvalid: false,
	submitHandler: function(form)
	{
		//show loader at form submission
		$.LoadingOverlay("show");
		return true;
	}
});

//custom validator method for validate alphanumeric in zip
$.validator.addMethod("galleryImageCount", function(value, element)
{
	if(element.files.length <= 3)
		return true;
	else
		return false;
}, 'You can not upload more then 3 gallery images at a time.');

//function for validate gallery images upload form
$("#performerGalleryImageForm").validate({
	rules: {
		performer_images : {
			required         : true,
			extension        : "jpg|jpeg|png|JPG|JPEG|PNG",
			galleryImageCount:true
		}
	},
	messages: {
		performer_images : {
			required : 'Please select gallery images.',
			extension: "Please upload gallery images of allowed extensions : jpg, jpeg, png."
		}
	},
	focusInvalid: false,
	submitHandler: function(form)
	{
		//show loader at form submission
		$.LoadingOverlay("show");
		return true;
	}
});

$.validator.addClassRules({
	performertimeZoneSelect:{
			performer_performer_time_zone:true
	},
	performerdatePickerSelect:{
			performer_performer_show_date:true
	},
	performerShowStartTimeSelect:{
			performer_performer_show_start_time:true
	},
	performerShowEndTimeSelect:{
			performer_performer_show_end_time:true
	}
});

$.validator.addMethod('performer_performer_time_zone', $.validator.methods.required,
'Please select a timezone.');

$.validator.addMethod('performer_performer_show_date', $.validator.methods.required,
'Please select a show start date.');

$.validator.addMethod('performer_performer_show_start_time', $.validator.methods.required,
'Please select show start time.');

$.validator.addMethod('performer_performer_show_end_time', $.validator.methods.required,
'Please select show end time.');

//function for validate performer set schedule form
$("#performerScheduleForm").validate({
	submitHandler: function(form)
	{
		//show loader at form submission
		$.LoadingOverlay("show");
		return true;
	}
});

//function for validate performer profile form
$("#performerProfileForm").validate({
	rules: {
		hairColor : {
			required : true,
			minlength: 2,
			maxlength: 10,
		},
		eyeColor : {
			required : true,
			minlength: 2,
			maxlength: 10,
		},
		age : {
			required : true,
			number :true,
			minlength: 1,
			maxlength: 2,
		},
		sex : {
			required : true,
			minlength: 2,
			maxlength: 10,
		},
		ethinicity : {
			required : true,
			minlength: 2,
			maxlength: 10,
		},
		bodyType :{
			required :true,
			minlength: 2,
			maxlength: 10
		}
	},
	messages: {
		hairColor : {
			required : 'Please select hair color.',
			minlength: 'Hair color can not be less then 2 characters.',
			maxlength: 'Hair color can not be greater then 10 characters.'
		},
		eyeColor : {
			required : 'Please select eye color.',
			minlength: 'Eye color can not be less then 2 characters.',
			maxlength: 'Eye color can not be greater then 10 characters.',
		},
		age : {
			required : 'Please select age.',
			minlength: 'Age can not be less then 1 digits.',
			maxlength: 'Age can not be greater then 2 digits.',
			number   : 'Please enter only numbers.'
		},
		sex : {
			required : 'Please select sex.',
			minlength: 'Sex can not be less then 2 characters.',
			maxlength: 'Sex can not be greater then 10 characters.',
			number   : 'Please enter only numbers.'
		},
		ethinicity : {
			required : 'Please select ethinicity.',
			minlength: 'Ethinicity can not be less then 2 characters.',
			maxlength: 'Ethinicity can not be greater then 10 characters.'
		},
		bodyType : {
			required : 'Please select body type.',
			minlength: 'Body Type can not be less then 2 characters.',
			maxlength: 'Body Type can not be greater then 10 characters.'
		}
	},
	focusInvalid: false,
	submitHandler: function(form)
	{
		//show loader at form submission
		$.LoadingOverlay("show");
		return true;
	}
});

//function for validate performer private gallery settings form
$("#performerPrivateGalleryForm").validate({
	rules: {
		privateGalleryPrice : {
			required : true,
			minlength: 1,
			maxlength: 5,
			number   : true
		}
	},
	messages: {
		privateGalleryPrice : {
			required : 'Please enter private gallery price.',
			minlength: 'Private gallery price can not be less then 1 digits.',
			maxlength: 'Private gallery price can not be greater then 5 digits.',
			number   : 'Please enter only numbers.'
		}
	},
	focusInvalid: false,
	submitHandler: function(form)
	{
		//show loader at form submission
		$.LoadingOverlay("show");
		return true;
	}
});

//set delay of 4sec until config.xml not
//read and assign values to global vars
setTimeout(function()
{
	//function for submit performer login form
	$('#performerLoginForm').ajaxForm({
		url: miricamServerUrl+'userApi/performerLoginWithRegister',

		//send custom value in formdata for authorization
		data: {'performerUniqueId':performerUniqueId},

		beforeSubmit: function(formData, jqForm, options)
		{
			//if remember me checkbox is checked then remember performer login username and password
			if($('#performerWithoutRegistrationLogin').prop("checked"))
			{
				//create cookie if checkbox is checked
				createCookie("rememberPerformerUsername", $('#performerUsername').val(), 7);
				createCookie("rememberPerformerPassword", $('#performerPassword').val(), 7);
			}
			else
			{
				//delete cookie if checkbox is unchecked
				deleteCookie("rememberPerformerUsername");
				deleteCookie("rememberPerformerPassword");
			}
		},
		success : function(apiResponse)
		{
			//hide loader after success
			$.LoadingOverlay("hide");

			if(!apiResponse.status)
			{
				swal({
					title: "Error",
					text : apiResponse.message,
					icon : "error",
					timer: 3000
				});
			}
			else
			{
				swal({
					title: "Done",
					text : apiResponse.message,
					icon : "success",
					timer: 3000
				});

				//now set performer details in session
				//storage redirect on performer dashboard
				sessionStorage.setItem('isUserLoggedIn', true);
				sessionStorage.setItem('isPerformerExist', true);
				sessionStorage.setItem('LoginPerformerPrimaryId', apiResponse.data.performer_primary_id);
				sessionStorage.setItem('LoginPerformerId', apiResponse.data.performer_id);
				sessionStorage.setItem('LoginPerformerUniqueId', apiResponse.data.performer_unique_id);
				sessionStorage.setItem('LoginPerformerName', apiResponse.data.performer_name);
				sessionStorage.setItem('LoginPerformerUsername', apiResponse.data.performer_username);
				sessionStorage.setItem('LoginPerformerEmail', apiResponse.data.performer_email);
				sessionStorage.setItem('LoginPerformerParentPerformerId', apiResponse.data.parent_performer_id);

				//redirect performer on dashboard page
				window.location.href = serverUrl+'performer-dashboard.html?UniqueId='+apiResponse.data.performer_unique_id;
			}
		}
	});

	//function for submit customer login form
	$('#customerLoginForm').ajaxForm({
		url:  miricamServerUrl+'userApi/customerLoginWithRegister',

		//send custom value in formdata for authorization
		data: {'performerUniqueId':performerUniqueId},

		beforeSubmit: function(formData, jqForm, options)
		{
			//if remember me checkbox is checked then remember customer login username and password
			if($('#customerRememberCredentials').prop("checked"))
			{
				//create cookie if checkbox is checked
				createCookie("rememberCustomerUsername", $('#customerUsername').val(), 7);
				createCookie("rememberCustomerPassword", $('#customerPassword').val(), 7);
			}
			else
			{
				//delete cookie if checkbox is unchecked
				deleteCookie("rememberCustomerUsername");
				deleteCookie("rememberCustomerPassword");
			}
		},
		success : function(apiResponse)
		{
			//hide loader after success
			$.LoadingOverlay("hide");

			if(!apiResponse.status)
			{
				swal({
					title: "Error",
					text : apiResponse.message,
					icon : "error",
					timer: 3000
				});
			}
			else
			{
				/*swal({
					title: "Done",
					text : apiResponse.message,
					icon : "success",
					timer: 3000
				});
				*/

				//now set customer details in session
				//storage redirect on customer dashboard
				sessionStorage.setItem('isUserLoggedIn', true);
				sessionStorage.setItem('isCustomerExist', true);
				sessionStorage.setItem('LoginCustomerPrimaryId', apiResponse.data.customer_primary_id);
				sessionStorage.setItem('LoginCustomerId', apiResponse.data.customer_id);
				sessionStorage.setItem('LoginCustomerUniqueId', apiResponse.data.customer_unique_id);
				sessionStorage.setItem('LoginCustomerName', apiResponse.data.customer_name);
				sessionStorage.setItem('LoginCustomerUsername', apiResponse.data.customer_username);
				sessionStorage.setItem('LoginCustomerEmail', apiResponse.data.customer_email);
				sessionStorage.setItem('LoginCustomerParentPerformerId', apiResponse.data.parent_performer_id);

				//window.location.href = wordpressSiteUrl+'custom-functions.php?username='+$('#customerUsername').val()+'&password='+btoa($('#customerPassword').val())+'&redirectUrl='+$('#redirect_site_url').val()+'&role=2';

				//redirect customer on dashboard page
				window.location.href = serverUrl+'performers-list.html';
			}
		}
	});

	//function for submit performer signup form
	$('#performerSignupForm').ajaxForm({
		url: miricamServerUrl+'userApi/performerSignup',

		//send custom value in formdata for authorization
		data: {'performerUniqueId':performerUniqueId},
		success : function(apiResponse)
		{
			//hide loader after success
			$.LoadingOverlay("hide");

			if(!apiResponse.status)
			{
				swal({
					title: "Error",
					text : apiResponse.message,
					icon : "error",
					timer: 3000
				});
			}
			else
			{
				swal({
					title: "Done",
					text : apiResponse.message,
					icon : "success",
					timer: 3000
				});
			}
		}
	});

	//function for submit customer signup form
	$('#customerSignupForm').ajaxForm({
		url: miricamServerUrl+'userApi/customerSignup',

		//send custom value in formdata for authorization
		//data: {'performerUniqueId':performerUniqueId},
		data: {'performerUniqueId':performerUniqueId, 'websiteURL' : serverUrl},
		success : function(apiResponse)
		{
			//hide loader after success
			$.LoadingOverlay("hide");

			if(!apiResponse.status)
			{
				 swal({
					title: "Error",
					text : apiResponse.message,
					icon : "error",
					timer: 2000
				 });
			}
			else
			{
				 swal({
					title: "Done",
					text : apiResponse.message,
					icon : "success",
					timer: 1500
				 });

				setTimeout(function()
				{
					window.location.href = serverUrl+'user-login.html';
				}, 2000)
			}
		}
	});

	//function for submit child performer's sign-up form
	$('#subPerformerSignupForm').ajaxForm({
		url: miricamServerUrl+'userApi/subPerformerSignupBaeable',

		//send custom value in formdata for authorization
		data: {'performerUniqueId':performerUniqueId,'performerUniqueName':performerUniqueName ,'websiteURL' : serverUrl},
		success : function(apiResponse)
		{
			//hide loader after success
			$.LoadingOverlay("hide");

			if(apiResponse.status)
			{
				swal({
						title: "Done",
						text : apiResponse.message,
						icon : "success",
						timer: 3000
				});

				setTimeout(function()
				{
					window.location.href = serverUrl+'index.html';
				}, 2000)
			}
			else
			{
				swal({
						title: "Error",
						text : apiResponse.message,
						icon : "error",
						timer: 3000
				});
			}
		}
	});

	//function for submit child performer's login form
	$('#subPerformerLoginForm').ajaxForm({
		url: miricamServerUrl+'userApi/subPerformerLoginWithRegister',

		//send custom value in formdata for authorization
		data: {'performerUniqueId':performerUniqueId,'performerUniqueName':performerUniqueName ,'websiteURL' : serverUrl},
		beforeSubmit: function(formData, jqForm, options)
		{
			//if remember me checkbox is checked then remember customer login username and password
			if($('#customerSubperformerCredentials').prop("checked"))
			{
				//create cookie if checkbox is checked
				createCookie("rememberSubperformerUsername", $('#username').val(), 7);
				createCookie("rememberSubperformerPassword", $('#password').val(), 7);
			}
			else
			{
				//delete cookie if checkbox is unchecked
				deleteCookie("rememberSubperformerUsername");
				deleteCookie("rememberSubperformerPassword");
			}
		},	
		success : function(apiResponse)
		{
			//hide loader after success
			$.LoadingOverlay("hide");

			//hide account modal after apiresponse
			$('#performerTopicModal').modal('hide');

			if(apiResponse.status)
			{
				/*swal({
						title: "Done",
						text : apiResponse.message,
						icon : "success",
						timer: 3000
				});*/

				//now set performer details in session
				//storage redirect on performer dashboard
				sessionStorage.setItem('isUserLoggedIn', true);
				sessionStorage.setItem('isPerformerExist', true);
				sessionStorage.setItem('LoginPerformerPrimaryId', apiResponse.data.performer_primary_id);
				sessionStorage.setItem('LoginPerformerId', apiResponse.data.performer_id);
				sessionStorage.setItem('LoginPerformerUniqueId', apiResponse.data.performer_unique_id);
				sessionStorage.setItem('LoginPerformerName', apiResponse.data.performer_name);
				sessionStorage.setItem('LoginPerformerUsername', apiResponse.data.performer_username);
				sessionStorage.setItem('LoginPerformerEmail', apiResponse.data.performer_email);
				sessionStorage.setItem('LoginPerformerParentPerformerId', apiResponse.data.parent_performer_id);
				
				//window.location.href = wordpressSiteUrl+'custom-functions.php?username='+$('#username').val()+'&password='+btoa($('#password').val())+'&UniqueId='+apiResponse.data.performer_unique_id+'&redirectUrl='+$('#redirect_site_url').val()+'&role=1';
			
				setTimeout(function()
				{
					window.location.href = serverUrl+'performer-dashboard.html?UniqueId='+apiResponse.data.performer_unique_id;
				}, 2000)
			}
			else
			{
				swal({
						title: "Error",
						text : apiResponse.message,
						icon : "error",
						timer: 3000
				});
			}
		}
	});

	//function for submit customer signup form
	$('#forgotPasswordForm').ajaxForm({
		url: miricamServerUrl+'userApi/forgotPassword',

		//send custom value in formdata for authorization
		data: {'performerUniqueId':performerUniqueId, 'serverUrl':serverUrl},
		success : function(apiResponse)
		{
			//hide loader after success
			$.LoadingOverlay("hide");

			$('#forgotPasswordModal').modal('hide');

			if(!apiResponse.status)
			{
				swal({
					title: "Error",
					text : apiResponse.message,
					icon : "error",
					timer: 3000
				});
			}
			else
			{
				swal({
					title: "Done",
					text : apiResponse.message,
					icon : "success",
					timer: 3000
				});
			}
		}
	});

	//function for submit performer's controls form
	$('#performerControlsForm').ajaxForm({
		url: miricamServerUrl+'userApi/savePerformerControls',

		//send custom value in formdata for authorization
		data: {},
		beforeSubmit: function(formData, jqForm, options)
		{
			if(window.location.href.indexOf("UniqueId") > -1)
			{
				var urlData = window.location.search.substr('?');
				var startIndex = urlData.indexOf("=");
				var selectPerformerUniqueId = urlData.substr(startIndex+1);
				formData.push({name:'performerUniqueId', value:selectPerformerUniqueId}); 
			}
			else
			{
				formData.push({name:'performerUniqueId', value:performerUniqueId});
			}
		},
		success : function(apiResponse)
		{
			//hide loader after success
			$.LoadingOverlay("hide");

			//hide account modal after apiresponse
			$('#performerAccountSettingsModal').modal('hide');

			if(apiResponse.status)
			{
				//after successfull profile update apply changes in session storage variables
				sessionStorage.removeItem('LoginPerformerName');
				sessionStorage.removeItem('LoginPerformerUsername');
				sessionStorage.removeItem('LoginPerformerEmail');

				sessionStorage.setItem('LoginPerformerName', $('#name').val());
				sessionStorage.setItem('LoginPerformerUsername', $('#username').val());
				sessionStorage.setItem('LoginPerformerEmail',  $('#email').val());

				swal({
					title: "Done",
					text : apiResponse.message,
					icon : "success",
					timer: 3000
				});
			}
			else
			{
				swal({
					title: "Error",
					text : apiResponse.message,
					icon : "error",
					timer: 3000
				});
			}
		}
	});

	//function for submit performer's time settings form
	$('#performerTimeSettingsForm').ajaxForm({
		url: miricamServerUrl+'userApi/savePerformerTimeSettings',

		//send custom value in formdata for authorization
		data: {},
		beforeSubmit: function(formData, jqForm, options)
		{
			if(window.location.href.indexOf("UniqueId") > -1) 
			{
				var urlData = window.location.search.substr('?');
				var startIndex = urlData.indexOf("=");
				var selectPerformerUniqueId = urlData.substr(startIndex+1);
				formData.push({name:'performerUniqueId', value:selectPerformerUniqueId}); 
			}
			else
			{
				formData.push({name:'performerUniqueId', value:performerUniqueId});
			}
		},
		success : function(apiResponse)
		{
			//hide loader after success
			$.LoadingOverlay("hide");

			//hide modal after api response
			$('#performerPricingModal').modal('hide');

			if(apiResponse.status)
			{
				swal({
					title: "Done",
					text : apiResponse.message,
					icon : "success",
					timer: 3000
				});
			}
			else
			{
				swal({
					title: "Error",
					text : apiResponse.message,
					icon : "error",
					timer: 3000
				});
			}
		}
	});

	//function for submit performer's topic form
	$('#performerTopicForm').ajaxForm({
		url: miricamServerUrl+'userApi/savePerformerTopic',

		//send custom value in formdata for authorization
		data: {},

		beforeSubmit: function(formData, jqForm, options)
		{
			if(window.location.href.indexOf("UniqueId") > -1) 
			{
				var urlData = window.location.search.substr('?');
				var startIndex = urlData.indexOf("=");
				var selectPerformerUniqueId = urlData.substr(startIndex+1);
				formData.push({name:'performerUniqueId', value:selectPerformerUniqueId}); 
			}
			else
			{
				formData.push({name:'performerUniqueId', value:performerUniqueId});
			}
		},
		success : function(apiResponse)
		{
			//hide loader after success
			$.LoadingOverlay("hide");

			//hide account modal after apiresponse
			$('#performerTopicModal').modal('hide');

			if(apiResponse.status)
			{
				swal({
					title: "Done",
					text : apiResponse.message,
					icon : "success",
					timer: 3000
				});
			}
			else
			{
				swal({
					title: "Error",
					text : apiResponse.message,
					icon : "error",
					timer: 3000
				});
			}
		}
	});

	//function for submit performer's profile image form
	$('#performerProfileImageForm').ajaxForm({
		url: miricamServerUrl+'userApi/performerProfileImageSubmit',

		//send custom value in formdata for authorization
		data: {},
		beforeSubmit: function(formData, jqForm, options)
		{
			if(window.location.href.indexOf("UniqueId") > -1) 
			{
				var urlData = window.location.search.substr('?');
				var startIndex = urlData.indexOf("=");
				var selectPerformerUniqueId = urlData.substr(startIndex+1);
				formData.push({name:'performerUniqueId', value:selectPerformerUniqueId}); 
			}
			else
			{
				formData.push({name:'performerUniqueId', value:performerUniqueId});
			}
		},
		success : function(apiResponse)
		{
			//hide loader after success
			$.LoadingOverlay("hide");

			//hide account modal after apiresponse
			$('#performerImagesUploadModal').modal('hide');

			if(apiResponse.status)
			{
				swal({
					title: "Done",
					text : apiResponse.message,
					icon : "success",
					timer: 3000
				});
			}
			else
			{
				swal({
					title: "Error",
					text : apiResponse.message,
					icon : "error",
					timer: 3000
				});
			}
		}
	});

	//function for submit performer's photoId image form
	$('#performerPhotoIdImageForm').ajaxForm({
		url: miricamServerUrl+'userApi/performerPhotoIdImageSubmit',

		//send custom value in formdata for authorization
		data: {},
		beforeSubmit: function(formData, jqForm, options)
		{
			if(window.location.href.indexOf("UniqueId") > -1) 
			{
				var urlData = window.location.search.substr('?');
				var startIndex = urlData.indexOf("=");
				var selectPerformerUniqueId = urlData.substr(startIndex+1);
				formData.push({name:'performerUniqueId', value:selectPerformerUniqueId}); 
			}
			else
			{
				formData.push({name:'performerUniqueId', value:performerUniqueId});
			}
		},
		success : function(apiResponse)
		{
			//hide loader after success
			$.LoadingOverlay("hide");

			//hide account modal after apiresponse
			$('#performerImagesUploadModal').modal('hide');

			if(apiResponse.status)
			{
				swal({
					title: "Done",
					text : apiResponse.message,
					icon : "success",
					timer: 3000
				});
			}
			else
			{
				swal({
					title: "Error",
					text : apiResponse.message,
					icon : "error",
					timer: 3000
				});
			}
		}
	});

	//function for submit performer's gallery images form
	$('#performerGalleryImageForm').ajaxForm({
		url: miricamServerUrl+'userApi/performerGalleryImageSubmit',

		//send custom value in formdata for authorization
		data: {},
		beforeSubmit: function(formData, jqForm, options)
		{
			if(window.location.href.indexOf("UniqueId") > -1) 
			{
				var urlData = window.location.search.substr('?');
				var startIndex = urlData.indexOf("=");
				var selectPerformerUniqueId = urlData.substr(startIndex+1);
				formData.push({name:'performerUniqueId', value:selectPerformerUniqueId}); 
			}
			else
			{
				formData.push({name:'performerUniqueId', value:performerUniqueId});
			}
		},
		success : function(apiResponse)
		{
			//hide loader after success
			$.LoadingOverlay("hide");

			//hide account modal after apiresponse
			$('#performerImagesUploadModal').modal('hide');

			if(apiResponse.status)
			{
				swal({
					title: "Done",
					text : apiResponse.message,
					icon : "success",
					timer: 3000
				});
			}
			else
			{
				swal({
					title: "Error",
					text : apiResponse.message,
					icon : "error",
					timer: 3000
				});
			}
		}
	});

	//function for submit performer's schedule form
	$('#performerScheduleForm').ajaxForm({
		url: miricamServerUrl+'userApi/performerScheduleSubmit',

		//send custom value in formdata for authorization
		data: {},
		beforeSubmit: function(formData, jqForm, options)
		{
			var myObj = {};
			var testArray = [];
			if(window.location.href.indexOf("UniqueId") > -1) 
			{
				var urlData = window.location.search.substr('?');
				var startIndex = urlData.indexOf("=");
				var selectPerformerUniqueId = urlData.substr(startIndex+1);
				for(var z=0 ;z < formData.length ;z++)
				{
					formData[z].name = formData[z].name.substring(0, formData[z].name.length - 1);	

					myObj[formData[z].name] = formData[z].value;

					if((z+1) %4 == 0)
					{
						testArray.push(myObj);
						myObj = {};
					}
				};
				formData.push({name:'performerUniqueId', value:selectPerformerUniqueId });
				formData.push({name:'scheduleData',value:JSON.stringify(testArray)}); 
			}
			else
			{
				for(var z=0 ;z < formData.length ;z++)
				{
					formData[z].name = formData[z].name.substring(0, formData[z].name.length - 1);	
					myObj[formData[z].name] = formData[z].value;
					if((z+1) %4 == 0)
					{ 
						testArray.push(myObj);
						myObj = {};
					}
				}; 
				formData.push({name:'performerUniqueId', value:performerUniqueId});
				formData.push({name:'scheduleData',value:JSON.stringify(testArray)}); 
			}
		},
		success : function(apiResponse)
		{
			//hide loader after success
			$.LoadingOverlay("hide");

			//hide account modal after apiresponse
			$('#performerSetScheduleModal').modal('hide');

			if(apiResponse.status)
			{
				swal({
					title: "Done",
					text : apiResponse.message,
					icon : "success",
					timer: 3000
				});
			}
			else
			{
				swal({
					title: "Error",
					text : apiResponse.message,
					icon : "error",
					timer: 3000
				});
			}
		}
	});

	//function for submit performer's schedule form
	$('#performerProfileForm').ajaxForm({
		url: miricamServerUrl+'userApi/performerProfileSubmit',

		//send custom value in formdata for authorization
		data: {},
		beforeSubmit: function(formData, jqForm, options)
		{
			if(window.location.href.indexOf("UniqueId") > -1) 
			{
				var urlData = window.location.search.substr('?');
				var startIndex = urlData.indexOf("=");
				var selectPerformerUniqueId = urlData.substr(startIndex+1);
				formData.push({name:'performerUniqueId', value:selectPerformerUniqueId}); 
			}
			else
			{
				formData.push({name:'performerUniqueId', value:performerUniqueId});
			}
		},
		success : function(apiResponse)
		{
			//hide loader after success
			$.LoadingOverlay("hide");

			//hide account modal after apiresponse
			$('#performerProfileModal').modal('hide');

			if(apiResponse.status)
			{
				swal({
					title: "Done",
					text : apiResponse.message,
					icon : "success",
					timer: 3000
				});
			}
			else
			{
				swal({
					title: "Error",
					text : apiResponse.message,
					icon : "error",
					timer: 3000
				});
			}
		}
	});

	//function for submit performer's private gallery settings form
	$('#performerPrivateGalleryForm').ajaxForm({
		url: miricamServerUrl+'userApi/savePerformerPrivateGallerySettings',

		//send custom value in formdata for authorization
		data: {},
		beforeSubmit: function(formData, jqForm, options)
		{
			if(window.location.href.indexOf("UniqueId") > -1) 
			{
				var urlData = window.location.search.substr('?');
				var startIndex = urlData.indexOf("=");
				var selectPerformerUniqueId = urlData.substr(startIndex+1);
				formData.push({name:'performerUniqueId', value:selectPerformerUniqueId});
				formData.push({name:'loginPerformerId', value:sessionStorage.getItem('LoginPerformerPrimaryId')});
			}
			else
			{
				formData.push({name:'performerUniqueId', value:performerUniqueId});
				formData.push({name:'loginPerformerId', value:sessionStorage.getItem('LoginPerformerPrimaryId')});
			}
		},
		success : function(apiResponse)
		{
			//hide loader after success
			$.LoadingOverlay("hide");

			//hide modal after api response
			$('#performerPrivateGalleryModal').modal('hide');

			if(apiResponse.status)
			{
				swal({
					title: "Done",
					text : apiResponse.message,
					icon : "success",
					timer: 3000
				});
			}
			else
			{
				swal({
					title: "Error",
					text : apiResponse.message,
					icon : "error",
					timer: 3000
				});
			}
		}
	});

	//hide loader on intilization ajax form
	$.LoadingOverlay("hide");

	//remove disabled from button
	$('.btnNewSign').removeAttr('disabled');

}, 3500);


//function for open multiple modals
//like forgot password, performer pricing, performer account etc
//on opening of modal also reset a form
function openResetModal(modalId, formId)
{
	if($('#subMenuUL').is(":visible"))
	{
		$('#subMenuUL').toggle();
	}

	//open modal
	$('#'+modalId).modal('show');

	//remove error labels from form
	$("label.error").remove();
}

//function for logout a performer/customer from system
function logout()
{
	$.LoadingOverlay("show");

	//removing saved data from sessionstorage
	//get session storage that performer pressed logout
	var isPerformerLoggedIn = sessionStorage.getItem('LoginPerformerPrimaryId');
	var isSubPerformerLoggedIn = sessionStorage.getItem('LoginPerformerParentPerformerId');

	if(isPerformerLoggedIn)
	{
		//if performer pressed logout then set is_online=0 in DB
		setPerformerOnlineStatus('logout');

		// logs the performer's signout activity 
		setPerformerSignOutActivity();

		// clear room entry from performer-group-chat table 
		clearPerformerGroupChatRoom();
	}

	//get session storage that customer pressed logout
	var isCustomerExist = sessionStorage.getItem('isCustomerExist');
	if(isCustomerExist)
	{
		//if performer pressed logout then his today's
		//all private chat requests are deleted from DB
		if(window.location.href.indexOf("UniqueId") > -1) 
		{
			var urlData = window.location.search.substr('?');
			var startIndex = urlData.indexOf("=");
			var selectPerformerUniqueId = urlData.substr(startIndex+1);
			deletePrivateChatRequests(sessionStorage.getItem('LoginCustomerPrimaryId'), selectPerformerUniqueId);
		}
		else
		{
			deletePrivateChatRequests(sessionStorage.getItem('LoginCustomerPrimaryId'), performerUniqueId);
		}
	}

	//remove customer info
	sessionStorage.removeItem('isUserLoggedIn');
	sessionStorage.removeItem('LoginCustomerPrimaryId');
	sessionStorage.removeItem('LoginCustomerId');
	sessionStorage.removeItem('LoginCustomerUniqueId');

	//remove performer info
	sessionStorage.removeItem('isUserLoggedIn');
	sessionStorage.removeItem('LoginPerformerPrimaryId');
	sessionStorage.removeItem('LoginPerformerId');
	sessionStorage.removeItem('LoginPerformerUniqueId');

	//clear all sessionStorage and localstorage
	sessionStorage.clear();
	localStorage.clear();
	
	if(isPerformerLoggedIn)
	{
		$.ajax({
				type: "POST",
				url : miricamServerUrl+'userApi/logutBaeableUsers',
				data: {'email':sessionStorage.getItem('LoginPerformerEmail'), 'redirect_url':sessionStorage.getItem('wordpressSiteUrl')+'miricam'},
				success : function (apiResponse)
				{
					if(apiResponse)
					{
						console.log(apiResponse);	
					}
				}
		});
	}
	
	if(isCustomerExist)
	{
		$.ajax({
				type: "POST",
				url : miricamServerUrl+'userApi/logutBaeableUsers',
				data: {'email':sessionStorage.getItem('LoginCustomerEmail'), 'redirect_url':sessionStorage.getItem('wordpressSiteUrl')+'miricam'},
				success : function (apiResponse)
				{
					if(apiResponse)
					{
						console.log(apiResponse);
					}
				}
		});
	}

	//redirect user on home page
	setTimeout(function()
	{
		if(isPerformerLoggedIn)
		{
			if(isSubPerformerLoggedIn != 0)
			{
				window.location.href = serverUrl+'sub-performer-login.html';
			}
			else
			{
				window.location.href = serverUrl+'performer-login.html'; 
			}
		}
		else
		{
			window.location.href = serverUrl+'user-login.html';
		}
	}, 3000);
}

//function for show a alert when any
//user press go private button
function gotoPrivateChatOld()
{
	/*NEW LOGIC :  When customer wants to do private chat with
	* performer then show him per minute price of performer
	* then send a request to performer, when performer accept
	* this request then send both users in private chat.
	* when private chat starts then start of every minute
	* deduct perminute price from customer account, but do not
	* add this amount in performer and admin accounts becuase
	* when customer purchase throguh NETBilling then we already
	* send amount in performer/admin accounts.
	* In case of private chat-tip every thing is belongs to 
	* time instead of money.
	*/
	
	if(window.location.href.indexOf("UniqueId") > -1)
	{
		var urlData = window.location.search.substr('?');
		var startIndex = urlData.indexOf("=");
		var selectPerformerUniqueId = urlData.substr(startIndex+1);

		//now call ajax function to get performer time settings
		$.ajax({
			type: "POST",
			url : miricamServerUrl+'userApi/getPerformerTimeSettings',
			data: {'customerUniqueId':sessionStorage.getItem('LoginCustomerUniqueId'), 'customerPrimaryId':sessionStorage.getItem('LoginCustomerPrimaryId'), 'performerUniqueId':selectPerformerUniqueId, 'callingSide':'customer'},
			success : function (apiResponse)
			{
				if(apiResponse.status)
				{
					//convert json into json object
					var jsonVariables = $.parseJSON(apiResponse.data);

					var jsonPerMinutePrice = '0.00';
					$.each(jsonVariables, function(key, value)
					{
						jsonPerMinutePrice = value;
					});

					const wrapper     = document.createElement('div');
					wrapper.className = 'swal-custom-content';
					wrapper.innerHTML = "You are about to begin a private chat with me, "+apiResponse.performer_username+". <br/> The cost is $"+parseFloat(jsonPerMinutePrice).toFixed(2)+" Per Minute.";

					swal({
						content   : wrapper,
						buttons   : { 
								confirm: true,
								cancel: true,
							  },
						dangerMode: true,
					})
					.then((willStart) => {
						if (willStart)
						{
							//now get total chat time of customer based on his total amount

							//performer's per minute price
							var perMinutePrice = jsonPerMinutePrice;

							//customer's total amount in his account
							var totalAmountInAccount = parseFloat(sessionStorage.getItem('customerTotalAmount'));

							//total purchased mins by customer
							var totalPurchasedMins = parseFloat(totalAmountInAccount/perMinutePrice);

							//total purchased seconds by customer
							var totalPurchasedSecs = parseInt(totalPurchasedMins*60);

							//send ajax request and save notification in table
							//also send custom value in post for authorization
							$.ajax({
								type: "POST",
								url : miricamServerUrl+'userApi/savePrivateChatNotification',
								data: {'performerUniqueId':selectPerformerUniqueId, 'customerPrimaryId':sessionStorage.getItem('LoginCustomerPrimaryId'), 'customerUsername':sessionStorage.getItem('LoginCustomerUsername'), 'totalPurchasedMins':totalPurchasedMins, 'totalPurchasedSecs':totalPurchasedSecs},
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

										sessionStorage.setItem('requestedPrivateChatMins', apiResponse.requestedPrivateChatMins);
										sessionStorage.setItem('requestedPrivateChatSecs', apiResponse.requestedPrivateChatSecs);

										//save perMinutePrice in session for further usage
										sessionStorage.setItem('privateChatPerMinutePrice', perMinutePrice);

										getSetRandomRoomId(sessionStorage.getItem('LoginCustomerPrimaryId'), 2, 2, 1);

										//when customer send private chat request to performer
										//then we'll check that performer accepted this request
										//if request is accepted then open private-chat.html page
										checkChatRequest = setInterval(function()
										{
											sessionStorage.setItem('endedNotificationId', apiResponse.requestedNotificationId);
											checkChatRequestAcceptedOrNot(apiResponse.requestedNotificationId, sessionStorage.getItem('LoginCustomerPrimaryId'), performerUniqueId);
										}, 1000);
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
						}
						/*else
						{
							swal("You have cancelled your private chat request.", {timer:2500});
						}*/
					});
				}
				else
				{
					swal(apiResponse.message);
				}
			}
		});
	}
	else
	{
		//now call ajax function to get performer time settings
		$.ajax({
			type: "POST",
			url : miricamServerUrl+'userApi/getPerformerTimeSettings',
			data: {'customerUniqueId':sessionStorage.getItem('LoginCustomerUniqueId'), 'customerPrimaryId':sessionStorage.getItem('LoginCustomerPrimaryId'), 'performerUniqueId':performerUniqueId, 'callingSide':'customer'},
			success : function (apiResponse)
			{
				if(apiResponse.status)
				{
					//convert json into json object
					var jsonVariables = $.parseJSON(apiResponse.data);

					var jsonPerMinutePrice = '0.00';
					$.each(jsonVariables, function(key, value)
					{
						jsonPerMinutePrice = value;
					});

					const wrapper     = document.createElement('div');
					wrapper.className = 'swal-custom-content';
					wrapper.innerHTML = "You are about to begin a private chat with me, "+apiResponse.performer_username+". <br/> The cost is $"+parseFloat(jsonPerMinutePrice).toFixed(2)+" Per Minute.";

					swal({
						content   : wrapper,
						buttons   : { 
								confirm: true, 
								cancel: true,
							  },
						dangerMode: true,
					})
					.then((willStart) => {
						if (willStart)
						{
							//now get total chat time of customer based on his total amount

							//performer's per minute price
							var perMinutePrice = jsonPerMinutePrice;

							//customer's total amount in his account
							var totalAmountInAccount = parseFloat(sessionStorage.getItem('customerTotalAmount'));

							//total purchased mins by customer
							var totalPurchasedMins = parseFloat(totalAmountInAccount/perMinutePrice);

							//total purchased seconds by customer
							var totalPurchasedSecs = parseInt(totalPurchasedMins*60);

							//send ajax request and save notification in table
							//also send custom value in post for authorization
							$.ajax({
								type: "POST",
								url : miricamServerUrl+'userApi/savePrivateChatNotification',
								data: {'performerUniqueId':performerUniqueId, 'customerPrimaryId':sessionStorage.getItem('LoginCustomerPrimaryId'), 'customerUsername':sessionStorage.getItem('LoginCustomerUsername'), 'totalPurchasedMins':totalPurchasedMins, 'totalPurchasedSecs':totalPurchasedSecs},
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

										sessionStorage.setItem('requestedPrivateChatMins', apiResponse.requestedPrivateChatMins);
										sessionStorage.setItem('requestedPrivateChatSecs', apiResponse.requestedPrivateChatSecs);

										//save perMinutePrice in session for further usage
										sessionStorage.setItem('privateChatPerMinutePrice', perMinutePrice);

										getSetRandomRoomId(sessionStorage.getItem('LoginCustomerPrimaryId'), 2, 2, 1);

										//when customer send private chat request to performer
										//then we'll check that performer accepted this request
										//if request is accepted then open private-chat.html page
										checkChatRequest = setInterval(function()
										{
											sessionStorage.setItem('endedNotificationId', apiResponse.requestedNotificationId);
											checkChatRequestAcceptedOrNot(apiResponse.requestedNotificationId, sessionStorage.getItem('LoginCustomerPrimaryId'), performerUniqueId);
										}, 1000);
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
						}
						/*else
						{
							swal("You have cancelled your private chat request.", {timer:2500});
						}*/
					});
				}
				else
				{
					swal(apiResponse.message);
				}
			}
		});
	}
}

//function for private chat request is accepted or not
function checkChatRequestAcceptedOrNot(requestedNotificationId, customerPrimaryId, performerUniqueId)
{
	if(window.location.href.indexOf("UniqueId") > -1) 
	{
		var urlData = window.location.search.substr('?');
		var startIndex = urlData.indexOf("=");
		var selectPerformerUniqueId = urlData.substr(startIndex+1);

		$.ajax({
			type: "POST",
			url : miricamServerUrl+'userApi/checkChatRequestAcceptedOrNot',
			data: {'performerUniqueId':selectPerformerUniqueId, 'customerPrimaryId':customerPrimaryId, 'requestedNotificationId' : requestedNotificationId},
			success : function (apiResponse)
			{
				if(apiResponse.status)
				{
					//now set this notification id in session
					//if performer/customer end private chat then
					//we will delete this id from session storage
					sessionStorage.setItem('endedNotificationId', apiResponse.data);

					clearInterval(checkChatRequest);
					setTimeout(function()
					{
						window.location.href = serverUrl+'user-private-chat.html?UniqueId='+selectPerformerUniqueId;
					}, 2000);
				}
				else
				{
				console.log(apiResponse.message);
			}
		}
	});
	}
   else
   {
	  $.ajax({
		type: "POST",
		url : miricamServerUrl+'userApi/checkChatRequestAcceptedOrNot',
		data: {'performerUniqueId':performerUniqueId, 'customerPrimaryId':customerPrimaryId, 'requestedNotificationId' : requestedNotificationId},
		success : function (apiResponse)
		{
			if(apiResponse.status)
			{
				//now set this notification id in session
				//if performer/customer end private chat then
				//we will delete this id from session storage
				sessionStorage.setItem('endedNotificationId', apiResponse.data);

				clearInterval(checkChatRequest);
				setTimeout(function()
				{
					window.location.href = serverUrl+'user-private-chat.html';
				}, 2000);
			}
			else
			{
				console.log(apiResponse.message);
			}
		}
	});
  };
};

//function for show notification ul onclick of
//notification number in performer dashboard
function showNotificationsUL()
{
	if($('#notifications_ul li').length > 0)
	{
		$('#notifications_ul').toggle();
	}
	else
	{
		swal({
			title: "",
			text : 'You have no notifications right now.',
			icon : "warning",
			timer: 3000
		});
	}
}

//function for show Unblock Request ul onclick of
//Unblock  Request number in performer dashboard
function showUnblockRequest()
{
	if($('#unblockrequest_ul li').length > 0)
	{
		$('#unblockrequest_ul').toggle();
	}
	else
	{
		swal({
			title: "",
			text : 'You have no Unblock Request right now.',
			icon : "warning",
			timer: 3000
		});
	}
}

//function for show accept/deny box
//on acceptaence open a new page in
//performer dashboard and customer dashboard
//if performer accept request then start of every seconds
//deduct amount from customer's account.
function showAcceptDenyBox(ths)
{
	var requestedCustomerUniqueId = $(ths).attr('data-unique-id');
	var requestedNotificationId   = $(ths).attr('data-notification-id');

	if(window.location.href.indexOf("UniqueId") > -1) 
	 {
		var urlData = window.location.search.substr('?');
		var startIndex = urlData.indexOf("=");
		var selectPerformerUniqueId = urlData.substr(startIndex+1);

		//after acceptance from performer change status of notification as accept
		//mark unread all notifications except which is accept by performer
		$.ajax({
			type: "POST",
			url : miricamServerUrl+'userApi/changeStatusPrivateChatNotification',
			data: {'notificationId':requestedNotificationId, 'performerUniqueId':selectPerformerUniqueId},
			success : function (apiResponse)
			{
				//now set random room id in database for private chat
				getSetRandomRoomId(apiResponse.acceptedCustomerPrimaryId, 1, 1, 2);

				sessionStorage.setItem('requestedPrivateChatMins', apiResponse.requestedPrivateChatMins);
				sessionStorage.setItem('requestedPrivateChatSecs', apiResponse.requestedPrivateChatSecs);

				setPerformerOnlineStatus('busy');

				//now set this notification id in session
				//if performer/customer end private chat then
				//we will delete this id from session storage
				sessionStorage.setItem('endedNotificationId', requestedNotificationId);

				//again check private notifications
				checkPrivateChatNotifications();

				//redirect performer on private chat page
				setTimeout(function()
				{
					window.location.href = serverUrl+'performer-private-chat.html?UniqueId='+selectPerformerUniqueId;
				}, 1000);
			}
		});
	 }
	else
	{
	  //after acceptance from performer change status of notification as accept
	  //mark unread all notifications except which is accept by performer
		$.ajax({
			type: "POST",
			url : miricamServerUrl+'userApi/changeStatusPrivateChatNotification',
			data: {'notificationId':requestedNotificationId, 'performerUniqueId':performerUniqueId},
			success : function (apiResponse)
			{
				//now set random room id in database for private chat
				getSetRandomRoomId(apiResponse.acceptedCustomerPrimaryId, 1, 1, 2);

				sessionStorage.setItem('requestedPrivateChatMins', apiResponse.requestedPrivateChatMins);
				sessionStorage.setItem('requestedPrivateChatSecs', apiResponse.requestedPrivateChatSecs);

				setPerformerOnlineStatus('busy');

				//now set this notification id in session
				//if performer/customer end private chat then
				//we will delete this id from session storage
				sessionStorage.setItem('endedNotificationId', requestedNotificationId);

				//again check private notifications
				checkPrivateChatNotifications();

				//redirect performer on private chat page
				setTimeout(function()
				{
					window.location.href = serverUrl+'performer-private-chat.html';
				}, 1000);
			}
		});
	}
};
function readPaypalPurchaseReplyParameters()
{
	$('#purchaseReplyMessage').html('<div>Thank You!</div><p>Your payment is successful. Payment is added in your account.</p>')
}

//function for read url parameters reply by netbilling payment gateway
function readPurchaseReplyParameters()
{
	//push url parameters in this array
	var replyArray = {};

	//get page url
	var pageURL = window.location.href;

	//break page url using &
	var urlSegments = pageURL.substring(pageURL.indexOf('?') + 1).split('&');

	//iterate url segments
	for (var i = 0; i < urlSegments.length; i++)
	{
		if(!urlSegments[i])
			continue;

		var urlSegment = urlSegments[i].split('=');

		//push into array
		replyArray[decodeURIComponent(urlSegment[0])] = decodeURIComponent(urlSegment[1]);
	}

	if(replyArray.Ecom_Ezic_TransactionStatus)
	{
		$('#purchaseReplyMessage').html('<div>Thank You!</div><p>Your payment is successful. Payment is added in your account.</p>')

		//now call ajax function to save amount in database on behalf of customer

		/*NEW LOGIC : we have to store all the information on behalf of this
		* transaction so we are sending all details to our server for further processing
		*/
		var realNumber   = replyArray.Ecom_UserData_CardNumber;
		var maskedNumber = realNumber.replace(/[0-9](?=([0-9]{4}))/g, 'x');

		if(replyArray.hasOwnProperty("UniqueId"))
		{
			/*NEW LOGIC : when any user purchase then this sale will be
			* also reflected in main parent performer statement report
			* as  credit.
			*/
			$.ajax({
				type: "POST",
				url : miricamServerUrl+'userApi/savePurchaseAmount',
				data: { 'performerUniqueId':replyArray.UniqueId, 'customerPrimaryId':sessionStorage.getItem('LoginCustomerPrimaryId'), 'customerPaymentEmail': replyArray.Ecom_BillTo_Online_Email, 'customerPaymentAmount': replyArray.Ecom_Cost_Total, 'customerPaymentTransactionId': replyArray.Ecom_Ezic_TransactionId, 'customerFullName':replyArray.Ecom_BillTo_Postal_Name_First+' '+replyArray.Ecom_BillTo_Postal_Name_Last, 'customerIPAddress': replyArray.Ecom_Ezic_Remote_Addr, 'customerFullAddress':replyArray.Ecom_BillTo_Postal_Street_Line1+', '+replyArray.Ecom_BillTo_Postal_City+', '+replyArray.Ecom_BillTo_Postal_StateProv+', '+replyArray.Ecom_BillTo_Postal_CountryCode+', '+replyArray.Ecom_BillTo_Postal_PostalCode, 'customerDateTime':replyArray.Ecom_Ezic_Response_IssueDate, 'customerCardNumber':maskedNumber},
				success : function (apiResponse)
				{
					if(apiResponse.status)
					{
						//play payment success sound
						$.playSound(serverUrl+paymentSuccessSound);

						setTimeout(function()
						{
							window.location.href = serverUrl+'user-dashboard.html?UniqueId='+replyArray.UniqueId;
						}, 5000);
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
		}
	   else
	   {
			/*NEW LOGIC : when any user purchase then this sale will be
			* also reflected in main parent performer statement report
			* as  credit.
			*/
			$.ajax({
				type: "POST",
				url : miricamServerUrl+'userApi/savePurchaseAmount',
				data: { 'performerUniqueId':performerUniqueId, 'customerPrimaryId':sessionStorage.getItem('LoginCustomerPrimaryId'), 'customerPaymentEmail': replyArray.Ecom_BillTo_Online_Email, 'customerPaymentAmount': replyArray.Ecom_Cost_Total, 'customerPaymentTransactionId': replyArray.Ecom_Ezic_TransactionId, 'customerFullName':replyArray.Ecom_BillTo_Postal_Name_First+' '+replyArray.Ecom_BillTo_Postal_Name_Last, 'customerIPAddress': replyArray.Ecom_Ezic_Remote_Addr, 'customerFullAddress':replyArray.Ecom_BillTo_Postal_Street_Line1+', '+replyArray.Ecom_BillTo_Postal_City+', '+replyArray.Ecom_BillTo_Postal_StateProv+', '+replyArray.Ecom_BillTo_Postal_CountryCode+', '+replyArray.Ecom_BillTo_Postal_PostalCode, 'customerDateTime':replyArray.Ecom_Ezic_Response_IssueDate, 'customerCardNumber':maskedNumber},
				success : function (apiResponse)
				{
					if(apiResponse.status)
					{
						//play payment success sound
						$.playSound(serverUrl+paymentSuccessSound);

						setTimeout(function()
						{
							window.location.href = serverUrl+'performers-list.html';
						}, 5000);
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
	   }
	}
	else
	{
		$('#purchaseReplyMessage').html('<div>Sorry!</div><p>Some error occured during payment processing. Please try after sometimes.</p>')
		return true;
	}
}

//function for get performer controls if exist
//and show on page where performer can edit this
function getPerformerSettings()
{
	if(window.location.href.indexOf("UniqueId") > -1) 
	 {
	   var urlData = window.location.search.substr('?');
	   var startIndex = urlData.indexOf("=");
	   var selectPerformerUniqueId = urlData.substr(startIndex+1);

	   //now call ajax function to get performer controls
		$.ajax({
			type: "POST",
			url : miricamServerUrl+'userApi/getPerformerSettings',
			data: {'customerUniqueId':sessionStorage.getItem('LoginCustomerUniqueId'), 'performerUniqueId':selectPerformerUniqueId},
			success : function (apiResponse)
			{
				if(apiResponse.status)
				{
					var jsonVariables = apiResponse.data;

					//iterate json object and show values
					$.each(jsonVariables, function(key, value)
					{
						if(key == 'settings')
						{
							//convert json into json object
							var settings = $.parseJSON(value);
							$.each(settings, function(innerKey, innerValue)
							{
								$('#'+innerKey).val(innerValue);
							});
						}
						else
						{
							$('#'+key).val(value);
						}
					});
				}
				else
				{
					/*swal({
						title: "Notice!",
						text : apiResponse.message,
						icon : "warning",
						timer: 3000
					});*/
				}
			}
		});
	}
	else
	{
	 //now call ajax function to get performer controls
		$.ajax({
			type: "POST",
			url : miricamServerUrl+'userApi/getPerformerSettings',
			data: {'customerUniqueId':sessionStorage.getItem('LoginCustomerUniqueId'), 'performerUniqueId':performerUniqueId},
			success : function (apiResponse)
			{
				if(apiResponse.status)
				{
					var jsonVariables = apiResponse.data;

					//iterate json object and show values
					$.each(jsonVariables, function(key, value)
					{
						if(key == 'settings')
						{
							//convert json into json object
							var settings = $.parseJSON(value);
							$.each(settings, function(innerKey, innerValue)
							{
								$('#'+innerKey).val(innerValue);
							});
						}
						else
						{
							$('#'+key).val(value);
						}
					});
				}
				else
				{
					/*swal({
						title: "Notice!",
						text : apiResponse.message,
						icon : "warning",
						timer: 3000
					});*/
				}
			}
		});
  };
}

//function for get performer time settings if exist
//and show on page where performer can edit this
function getPerformerTimeSettings()
{
	if(window.location.href.indexOf("UniqueId") > -1) 
	{
		  var urlData = window.location.search.substr('?');
		  var startIndex = urlData.indexOf("=");
		  var selectPerformerUniqueId = urlData.substr(startIndex+1);

		//now call ajax function to get performer controls
		$.ajax({
			type: "POST",
			url : miricamServerUrl+'userApi/getPerformerTimeSettings',
			data: {'customerUniqueId':sessionStorage.getItem('LoginCustomerUniqueId'), 'performerUniqueId':selectPerformerUniqueId, 'callingSide':'performer'},
			success : function (apiResponse)
			{
				if(apiResponse.status)
				{
					//convert json into json object
					var jsonVariables = $.parseJSON(apiResponse.data);

					//set default per minute price
					$('#perMinutePrice').val(parseFloat(jsonVariables.perMinutePrice).toFixed(2));
					sessionStorage.setItem('privateChatPerMinutePrice', parseFloat(jsonVariables.perMinutePrice).toFixed(2));
				}
				else
				{
					/*swal({
						title: "Notice!",
						text : apiResponse.message,
						icon : "warning",
						timer:4000
					});*/
				}
			}
		});
	}
	else
	{
	  //now call ajax function to get performer controls
		$.ajax({
			type: "POST",
			url : miricamServerUrl+'userApi/getPerformerTimeSettings',
			data: {'customerUniqueId':sessionStorage.getItem('LoginCustomerUniqueId'), 'performerUniqueId':performerUniqueId, 'callingSide':'performer'},
			success : function (apiResponse)
			{
				if(apiResponse.status)
				{
					//convert json into json object
					var jsonVariables = $.parseJSON(apiResponse.data);

					//set default per minute price
					$('#perMinutePrice').val(parseFloat(jsonVariables.perMinutePrice).toFixed(2));
					sessionStorage.setItem('privateChatPerMinutePrice', parseFloat(jsonVariables.perMinutePrice).toFixed(2));
				}
				else
				{
					/*swal({
						title: "Notice!",
						text : apiResponse.message,
						icon : "warning",
						timer:4000
					});*/
				}
			}
		});
  }
};

//add  and remove schedule rows
var timeZoneList = [];
function addSchduleRow()
{
	var p = $('#perfSchdTable tbody tr').length;

	if($('#perfSchdTable tbody tr').length <= 6)
	{
	 var performerTimezone = moment.tz.guess();

	 panelBody = "";
	 panelBody += '<tr id="newScheduleRow'+p+'">';
	 panelBody += '<td><select id="performer_time_zone'+p+'" name="performer_time_zone'+p+'" class="form-control performertimeZoneSelect"><option value="">Select Timezone</option></select></div>';
	 panelBody += '</td>';

	 panelBody +='<td><input type="text" class="form-control performerdatePickerSelect" id="performer_show_date'+p+'" name="performer_show_date'+p+'" placeholder="Show Date" maxlength="20" style="border-radius: 6px; width: 70%; margin-right: 5px;" readonly="readonly"></td>';

	 panelBody +='<td><input type="text" class="form-control performerShowStartTimeSelect" id="performer_show_start_time'+p+'" name="performer_show_start_time'+p+'" placeholder="Show Start Time" maxlength="20"></td>';
	 
	 panelBody +='<td><input type="text" class="form-control performerShowEndTimeSelect" id="performer_show_end_time'+p+'" name="performer_show_end_time'+p+'" placeholder="Show End Time" maxlength="20"></td>';

	 panelBody += '<td><button type="button" class="btn btn-danger" id="remove-superadmin-show'+p+'" onclick="removeSchduleRow('+p+')">Remove</button></td> ';
	 panelBody +='</tr>';

	 $('#perfSchdTable').append(panelBody);	
		intilizeDatePicker('performer_show_date'+p);
		intilizeTimePicker("performer_show_start_time"+p);
		intilizeTimePicker("performer_show_end_time"+p);

		var performerTimezone = moment.tz.guess();
		
		timeZoneList.forEach(function(value, key)
		{
			if(performerTimezone == value['timezone_name'])
				$('#performer_time_zone'+p).append($("<option></option>").attr("value", value['timezone_id']).text(value['timezone_name']).attr('selected', 'selected'));
			else
				$('#performer_time_zone'+p).append($("<option></option>").attr("value", value['timezone_id']).text(value['timezone_name']));
		});
   }
   else
   {
	 swal({
			title: "Alert",
			text : "Can not add more schedule",
			icon : "error",
			timer: 3000
		 });
   } 
}
 
function removeSchduleRow(rowId)
{
	$('#newScheduleRow'+rowId).remove();
}

//function for get performer showtime settings if exist
//and show on page where performer can edit this
function getPerformerShowtimeSettings()
{
	if(window.location.href.indexOf("UniqueId") > -1) 
	{
		  var urlData = window.location.search.substr('?');
		  var startIndex = urlData.indexOf("=");
		  var selectPerformerUniqueId = urlData.substr(startIndex+1);

	   //now call ajax function to get performer showtime
		$.ajax({
			type: "POST",
			url : miricamServerUrl+'userApi/getPerformerShowtimeSettings',
			data: {'customerUniqueId':sessionStorage.getItem('LoginCustomerUniqueId'), 'performerUniqueId':selectPerformerUniqueId},
			success : function (apiResponse)
			{
				timeZoneList = apiResponse.timezone;
				if(apiResponse.status)
				{
					var jsonVariables = JSON.parse(apiResponse.data.performer_next_show_data);
					var performerTimezone = moment.tz.guess();

					for(var k= 0 ;k<jsonVariables.length ;k++)
					 {
						 panelBody = "";
						 panelBody += '<tr id="newScheduleRow'+k+'">';
						 panelBody += '<td><select id="performer_time_zone'+k+'" name="performer_time_zone'+k+'" class="form-control performertimeZoneSelect"><option value="">Select Timezone</option></select></div>';
						 panelBody += '</td>';

						 panelBody +='<td><input type="text" class="form-control performerdatePickerSelect" id="performer_show_date'+k+'" name="performer_show_date'+k+'" placeholder="Show Date" maxlength="20" style="border-radius: 6px; width: 70%; margin-right: 5px;" readonly="readonly"></td>';
						 panelBody +='<td><input type="text" class="form-control performerShowStartTimeSelect" id="performer_show_start_time'+k+'" name="performer_show_start_time'+k+'" placeholder="Show Start Time" maxlength="20"></td>';
						 panelBody +='<td><input type="text" class="form-control performerShowEndTimeSelect" id="performer_show_end_time'+k+'" name="performer_show_end_time'+k+'" placeholder="Show End Time" maxlength="20"></td>';

						 if(k == 0)
						  {
							panelBody += '<td><button type="button" class="btn btn-primary" id="remove-superadmin-show'+k+'" onclick="addSchduleRow()">Add</button></td> ';
							panelBody +='</tr>';
						  }
						  else
						  {
							panelBody += '<td><button type="button" class="btn btn-danger" id="remove-superadmin-show'+k+'" onclick="removeSchduleRow('+k+')">Remove</button></td> ';
							panelBody +='</tr>';
						  }

						 $('#perfSchdTable').append(panelBody);	

						 apiResponse.timezone.forEach(function(value, key)
						{
							if(jsonVariables[k].performer_time_zone != '')
							{
								if(value['timezone_id'] == jsonVariables[k].performer_time_zone)
									$('#performer_time_zone'+k).append($("<option></option>").attr("value", value['timezone_id']).text(value['timezone_name']).attr('selected', 'selected'));
								else
									$('#performer_time_zone'+k).append($("<option></option>").attr("value", value['timezone_id']).text(value['timezone_name']));
							}
							else
							{
								if(performerTimezone == value['timezone_name'])
									$('#performer_time_zone'+k).append($("<option></option>").attr("value", value['timezone_id']).text(value['timezone_name']).attr('selected', 'selected'));
								else
									$('#performer_time_zone'+k).append($("<option></option>").attr("value", value['timezone_id']).text(value['timezone_name']));
							}
						});
						intilizeDatePicker('performer_show_date'+k);
						intilizeTimePicker("performer_show_start_time"+k);
						intilizeTimePicker("performer_show_end_time"+k);

						if(jsonVariables[k].performer_show_date!='')
							$('#performer_show_date'+k).val(jsonVariables[k].performer_show_date);

						if(jsonVariables[k].performer_show_start_time!='')
							$('#performer_show_start_time'+k).val(jsonVariables[k].performer_show_start_time);

						if(jsonVariables[k].performer_show_end_time!='')
							$('#performer_show_end_time'+k).val(jsonVariables[k].performer_show_end_time);
					 };
				}
				else
				{ 
						 panelBody = "";
						 panelBody += '<tr id="newScheduleRow0">';
						 panelBody += '<td><select id="performer_time_zone0" name="performer_time_zone0" class="form-control performertimeZoneSelect"><option value="">Select Timezone</option></select></div>';
						 panelBody += '</td>';

						 panelBody +='<td><input type="text" class="form-control performerdatePickerSelect" id="performer_show_date0" name="performer_show_date0" placeholder="Show Date" maxlength="20" style="border-radius: 6px; width: 70%; margin-right: 5px;" readonly="readonly"></td>';
						 panelBody +='<td><input type="text" class="form-control performerShowStartTimeSelect" id="performer_show_start_time0" name="performer_show_start_time0" placeholder="Show Start Time" maxlength="20"></td>';
						 panelBody +='<td><input type="text" class="form-control performerShowEndTimeSelect" id="performer_show_end_time0" name="performer_show_end_time0" placeholder="Show End Time" maxlength="20"></td>';
						  panelBody += '<td><button type="button" class="btn btn-primary" id="remove-superadmin-show0" onclick="addSchduleRow()">Add</button></td> ';
						   panelBody +='</tr>';

						 $('#perfSchdTable').append(panelBody);	
						intilizeDatePicker('performer_show_date0');
						intilizeTimePicker("performer_show_start_time0");
						intilizeTimePicker("performer_show_end_time0");

						var performerTimezone = moment.tz.guess();
						
						apiResponse.timezone.forEach(function(value, key)
						{
							if(performerTimezone == value['timezone_name'])
								$('#performer_time_zone0').append($("<option></option>").attr("value", value['timezone_id']).text(value['timezone_name']).attr('selected', 'selected'));
							else
								$('#performer_time_zone0').append($("<option></option>").attr("value", value['timezone_id']).text(value['timezone_name']));
						});
				}
			}
		});
	 }
	else
	{
	  //now call ajax function to get performer showtime
		$.ajax({
			type: "POST",
			url : miricamServerUrl+'userApi/getPerformerShowtimeSettings',
			data: {'customerUniqueId':sessionStorage.getItem('LoginCustomerUniqueId'), 'performerUniqueId':performerUniqueId},
			success : function (apiResponse)
			{
				timeZoneList = apiResponse.timezone;
				if(apiResponse.status)
				{
					var jsonVariables = JSON.parse(apiResponse.data.performer_next_show_data);
					var performerTimezone = moment.tz.guess();

					for(var k= 0 ;k<jsonVariables.length ;k++)
					 {   
						 panelBody = "";
						 panelBody += '<tr id="newScheduleRow'+k+'">';
						 panelBody += '<td><select id="performer_time_zone'+k+'" name="performer_time_zone'+k+'" class="form-control performertimeZoneSelect"><option value="">Select Timezone</option></select></div>';
						 panelBody += '</td>';

						 panelBody +='<td><input type="text" class="form-control performerdatePickerSelect" id="performer_show_date'+k+'" name="performer_show_date'+k+'" placeholder="Show Date" maxlength="20" style="border-radius: 6px; width: 70%; margin-right: 5px;" readonly="readonly"></td>';
						 panelBody +='<td><input type="text" class="form-control performerShowStartTimeSelect" id="performer_show_start_time'+k+'" name="performer_show_start_time'+k+'" placeholder="Show Start Time" maxlength="20"></td>';
						 panelBody +='<td><input type="text" class="form-control performerShowEndTimeSelect" id="performer_show_end_time'+k+'" name="performer_show_end_time'+k+'" placeholder="Show End Time" maxlength="20"></td>';

						 if(k == 0)
						  {
							 panelBody += '<td><button type="button" class="btn btn-primary" id="remove-superadmin-show'+k+'" onclick="addSchduleRow()">Add</button></td> ';
							  panelBody +='</tr>';
						  }
						  else
						  {
							  panelBody += '<td><button type="button" class="btn btn-danger" id="remove-superadmin-show'+k+'" onclick="removeSchduleRow('+k+')">Remove</button></td> ';
							   panelBody +='</tr>';
						  }

						 $('#perfSchdTable').append(panelBody);	

						 apiResponse.timezone.forEach(function(value, key)
						{
							if(jsonVariables[k].performer_time_zone != '')
							{
								if(value['timezone_id'] == jsonVariables[k].performer_time_zone)
									$('#performer_time_zone'+k).append($("<option></option>").attr("value", value['timezone_id']).text(value['timezone_name']).attr('selected', 'selected'));
								else
									$('#performer_time_zone'+k).append($("<option></option>").attr("value", value['timezone_id']).text(value['timezone_name']));
							}
							else
							{
								if(performerTimezone == value['timezone_name'])
									$('#performer_time_zone'+k).append($("<option></option>").attr("value", value['timezone_id']).text(value['timezone_name']).attr('selected', 'selected'));
								else
									$('#performer_time_zone'+k).append($("<option></option>").attr("value", value['timezone_id']).text(value['timezone_name']));
							}
						});
						intilizeDatePicker('performer_show_date'+k);
						intilizeTimePicker("performer_show_start_time"+k);
						intilizeTimePicker("performer_show_end_time"+k);

						if(jsonVariables[k].performer_show_date!='')
							$('#performer_show_date'+k).val(jsonVariables[k].performer_show_date);

						if(jsonVariables[k].performer_show_start_time!='')
							$('#performer_show_start_time'+k).val(jsonVariables[k].performer_show_start_time);

						if(jsonVariables[k].performer_show_end_time!='')
							$('#performer_show_end_time'+k).val(jsonVariables[k].performer_show_end_time);
					 };
				}
				else
				{ 
						 panelBody = "";
						 panelBody += '<tr id="newScheduleRow0">';
						 panelBody += '<td><select id="performer_time_zone0" name="performer_time_zone0" class="form-control performertimeZoneSelect"><option value="">Select Timezone</option></select></div>';
						 panelBody += '</td>';

						 panelBody +='<td><input type="text" class="form-control performerdatePickerSelect" id="performer_show_date0" name="performer_show_date0" placeholder="Show Date" maxlength="20" style="border-radius: 6px; width: 70%; margin-right: 5px;" readonly="readonly"></td>';
						 panelBody +='<td><input type="text" class="form-control performerShowStartTimeSelect" id="performer_show_start_time0" name="performer_show_start_time0" placeholder="Show Start Time" maxlength="20"></td>';
						 panelBody +='<td><input type="text" class="form-control performerShowEndTimeSelect" id="performer_show_end_time0" name="performer_show_end_time0" placeholder="Show End Time" maxlength="20"></td>';
						  panelBody += '<td><button type="button" class="btn btn-primary" id="remove-superadmin-show0" onclick="addSchduleRow()">Add</button></td> ';
						   panelBody +='</tr>';

						 $('#perfSchdTable').append(panelBody);	
						intilizeDatePicker('performer_show_date0');
						intilizeTimePicker("performer_show_start_time0");
						intilizeTimePicker("performer_show_end_time0");

						var performerTimezone = moment.tz.guess();
						apiResponse.timezone.forEach(function(value, key)
						{
							if(performerTimezone == value['timezone_name'])
								$('#performer_time_zone0').append($("<option></option>").attr("value", value['timezone_id']).text(value['timezone_name']).attr('selected', 'selected'));
							else
								$('#performer_time_zone0').append($("<option></option>").attr("value", value['timezone_id']).text(value['timezone_name']));
						});
				}
			}
		});
	}
};

//function for get performer profile details if exist
//and show on page where performer can edit this
function getPerformerProfileDetails()
{
	if(window.location.href.indexOf("UniqueId") > -1) 
	{
		var urlData = window.location.search.substr('?');
		var startIndex = urlData.indexOf("=");
		var selectPerformerUniqueId = urlData.substr(startIndex+1);

		//now call ajax function to get performer showtime
		$.ajax({
			type: "POST",
			url : miricamServerUrl+'userApi/getPerformerProfileDetails',
			data: {'customerUniqueId':sessionStorage.getItem('LoginCustomerUniqueId'), 'performerUniqueId':selectPerformerUniqueId},
			success : function (apiResponse)
			{
				if(apiResponse.status)
				{
					var jsonVariables = apiResponse.data;

					if(jsonVariables.performer_hair_color!='')
					$('#hairColor').val(jsonVariables.performer_hair_color);

				   if(jsonVariables.performer_eye_color!='')
					 $('#eyeColor').val(jsonVariables.performer_eye_color);

				   if(jsonVariables.performer_age!='')
					 $('#age').val(jsonVariables.performer_age);

					if(jsonVariables.performer_sex!='')
					 $('#sex').val(jsonVariables.performer_sex);

					if(jsonVariables.performer_ethinicity!='')
					 $('#ethinicity').val(jsonVariables.performer_ethinicity);

					if(jsonVariables.performer_body_type!='')
						$('#bodyType').val(jsonVariables.performer_body_type);
				}
			}
		});
	 }
	else
	{
	  //now call ajax function to get performer showtime
		$.ajax({
			type: "POST",
			url : miricamServerUrl+'userApi/getPerformerProfileDetails',
			data: {'customerUniqueId':sessionStorage.getItem('LoginCustomerUniqueId'), 'performerUniqueId':performerUniqueId},
			success : function (apiResponse)
			{
				//now call ajax function to get performer showtime
				$.ajax({
					type: "POST",
					url : miricamServerUrl+'userApi/getPerformerProfileDetails',
					data: {'customerUniqueId':sessionStorage.getItem('LoginCustomerUniqueId'), 'performerUniqueId':selectPerformerUniqueId},
					success : function (apiResponse)
					{
						if(apiResponse.status)
						{
							var jsonVariables = apiResponse.data;

							if(jsonVariables.performer_hair_color!='')
							$('#hairColor').val(jsonVariables.performer_hair_color);

						   if(jsonVariables.performer_eye_color!='')
							 $('#eyeColor').val(jsonVariables.performer_eye_color);

						   if(jsonVariables.performer_age!='')
							 $('#age').val(jsonVariables.performer_age);

							if(jsonVariables.performer_sex!='')
							 $('#sex').val(jsonVariables.performer_sex);

							if(jsonVariables.performer_ethinicity!='')
							 $('#ethinicity').val(jsonVariables.performer_ethinicity);

							if(jsonVariables.performer_body_type!='')
							 $('#bodyType').val(jsonVariables.performer_body_type);
						}
					}
				})
			}
		});
	}
};

//function for save information in cookie
//if performer pressed remember me then we
//will save username in cookie
function createCookie(cookieName, cookieValue, daysToExpire)
{
	//get date and create time for cookie
	var date = new Date();
	date.setTime(date.getTime()+(daysToExpire*24*60*60*1000));

	//save javascript cookie
	document.cookie = cookieName + "=" + cookieValue + "; expires=" + date.toGMTString();
}

//function for check cookie is exist for performer
//if cookie exist then we will show performer
//username for quick login
function checkCookie(cookieName)
{
	var savedCookieName = cookieName + "=";

	//get all cookies into an array
	var allCookiesArray = document.cookie.split(';');
	var rememberCountry = '';

	//iterate cookies array
	for(var i=0; i<allCookiesArray.length; i++)
	{
		var temp = allCookiesArray[i].trim();

		//check savedCookieName available in cookies array
		switch(savedCookieName)
		{
			case 'rememberPerformerUsername=':
				if (temp.indexOf(savedCookieName)==0)
				{
					var rememberedPerformerUsername = temp.substring(savedCookieName.length, temp.length);
					$('#performerUsername').val(rememberedPerformerUsername);
				}
			break;
			case 'rememberPerformerPassword=':
				if (temp.indexOf(savedCookieName)==0)
				{
					var rememberedPerformerPassword = temp.substring(savedCookieName.length, temp.length);
					$('#performerPassword').val(rememberedPerformerPassword);
					$('#performerWithoutRegistrationLogin').prop('checked', true);
				}
			break;
			case 'rememberCustomerUsername=':
				if (temp.indexOf(savedCookieName)==0)
				{
					var rememberedCustomerUsername = temp.substring(savedCookieName.length, temp.length);
					$('#customerUsername').val(rememberedCustomerUsername);
				}
			break;
			case 'rememberCustomerPassword=':
				if (temp.indexOf(savedCookieName)==0)
				{
					var rememberedCustomerPassword = temp.substring(savedCookieName.length, temp.length);
					$('#customerPassword').val(rememberedCustomerPassword);
					$('#customerRememberCredentials').prop('checked', true);
				}
			break;
			case 'rememberSubperformerUsername=':
				if (temp.indexOf(savedCookieName)==0)
				{
					var rememberedSubperformerUsername = temp.substring(savedCookieName.length, temp.length);
					$('#username').val(rememberedSubperformerUsername);
				}
			break;
			case 'rememberSubperformerPassword=':
				if (temp.indexOf(savedCookieName)==0)
				{
					var rememberedSubperformerPassword = temp.substring(savedCookieName.length, temp.length);
					$('#password').val(rememberedSubperformerPassword);
					$('#customerSubperformerCredentials').prop('checked', true);
				}
			break;
			case 'rememberCustomerCardNumber=':
				if (temp.indexOf(savedCookieName)==0)
				{
					var rememberCustomerCardNumber = temp.substring(savedCookieName.length, temp.length);
					$('#cardNumber').val(rememberCustomerCardNumber);
					$('#rememberCardDetails').prop('checked', true);
				}
			break;
			case 'rememberCustomerCardMonth=':
				if (temp.indexOf(savedCookieName)==0)
				{
					var rememberCustomerCardMonth = temp.substring(savedCookieName.length, temp.length);
					$('#cardMonth').val(rememberCustomerCardMonth);
					$('#rememberCardDetails').prop('checked', true);
				}
			break;
			case 'rememberCustomerCardYear=':
				if (temp.indexOf(savedCookieName)==0)
				{
					var rememberCustomerCardYear = temp.substring(savedCookieName.length, temp.length);
					$('#cardYear').val(rememberCustomerCardYear);
					$('#rememberCardDetails').prop('checked', true);
				}
			break;
			case 'rememberCustomerCardCVV=':
				if (temp.indexOf(savedCookieName)==0)
				{
					var rememberCustomerCardCVV = temp.substring(savedCookieName.length, temp.length);
					$('#cardCVV').val(rememberCustomerCardCVV);
					$('#rememberCardDetails').prop('checked', true);
				}
			break;
			//new case for cookies
			case 'rememberFirstName=':
				if (temp.indexOf(savedCookieName)==0)
				{
					var rememberFirstName = temp.substring(savedCookieName.length, temp.length);
					$('#firstName').val(rememberFirstName);
					$('#rememberCardDetails').prop('checked', true);
				}
			break;
			case 'rememberLastName=':
				if (temp.indexOf(savedCookieName)==0)
				{
					var rememberLastName = temp.substring(savedCookieName.length, temp.length);
					$('#lastName').val(rememberLastName);
					$('#rememberCardDetails').prop('checked', true);
				}
			break;
			case 'rememberEmail=':
				if (temp.indexOf(savedCookieName)==0)
				{
					var rememberEmail = temp.substring(savedCookieName.length, temp.length);
					$('#email').val(rememberEmail);
					$('#rememberCardDetails').prop('checked', true);
				}
			break;
			case 'rememberStreet=':
				if (temp.indexOf(savedCookieName)==0)
				{
					var rememberStreet = temp.substring(savedCookieName.length, temp.length);
					$('#street').val(rememberStreet);
					$('#rememberCardDetails').prop('checked', true);
				}
			break;
			case 'rememberCity=':
				if (temp.indexOf(savedCookieName)==0)
				{
					var rememberCity = temp.substring(savedCookieName.length, temp.length);
					$('#city').val(rememberCity);
					$('#rememberCardDetails').prop('checked', true);
				}
			break;
			case 'rememberCountry=':
				if (temp.indexOf(savedCookieName)==0)
				{
					rememberCountry = temp.substring(savedCookieName.length, temp.length);
					setTimeout(function()
					{
						$('#country').val(rememberCountry);
						$('#rememberCardDetails').prop('checked', true);
					}, 1500);
				}
			break;
			case 'rememberState=':
				if (temp.indexOf(savedCookieName)==0)
				{
					var rememberState = temp.substring(savedCookieName.length, temp.length);
					setTimeout(function()
					{
						getStatesList($('#country'));
					}, 2000);

					setTimeout(function()
					{
						$('#state').val(rememberState);
						$('#rememberCardDetails').prop('checked', true);
					}, 3000);
				}
			break;
			case 'rememberZip=':
				if (temp.indexOf(savedCookieName)==0)
				{
					var rememberZip = temp.substring(savedCookieName.length, temp.length);
					$('#zip').val(rememberZip);
					$('#rememberCardDetails').prop('checked', true);
				}
			break;
			case 'rememberAmount=':
				if (temp.indexOf(savedCookieName)==0)
				{
					var rememberAmount = temp.substring(savedCookieName.length, temp.length);
					$('#cardAmount').val(rememberAmount);
					$('#rememberCardDetails').prop('checked', true);
				}
			break;
		}
	}
}

//function for delete information from cookie
//if performer unchecked remember me then we
//will delete username/password from cookie
function deleteCookie(cookieName)
{
	document.cookie = cookieName + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

//function for blink notifications number
function blink(selector)
{
	$(selector).fadeOut(4000, 'linear', function()
	{
		$(this).fadeIn(4000, 'linear' , function()
		{
			blink(this);
		});
	});
}

//function for convert seconds into h:m:s format
function convertSecondsIntoHMS(receivedSeconds)
{
	var hours   = Math.floor(receivedSeconds / 3600);
	var minutes = Math.floor((receivedSeconds - (hours * 3600)) / 60);
	var seconds = receivedSeconds - (hours * 3600) - (minutes * 60);
	seconds     = Math.round(seconds * 100) / 100

	var result = (hours < 10 ? "0" + hours : hours);
	result += ":" + (minutes < 10 ? "0" + minutes : minutes);
	result += ":" + (seconds < 10 ? "0" + seconds : seconds);

	document.getElementById("private-chat-timer").innerHTML = result;
}

//function for run timer on user side
function runCustomerTimer(receivedSeconds)
{
	//now run timer for each second
	privateChatSecs = receivedSeconds;
	incrementVar    = 0;

	if (typeof newtime !== 'undefined')
	{
		clearInterval(newtime);
	}

	newtime = setInterval(function()
	{
		if(privateChatSecs > 0)
		{
			privateChatSecs = privateChatSecs-1;
			incrementVar    = incrementVar+1

			if(incrementVar == 1)
			{
				//now call ajax request in every minute
				//for deduct amount from customer account
				addDeductChatAmount(sessionStorage.getItem('privateChatPerMinutePrice'));
			}

			if(incrementVar >= 60)
			{
				incrementVar = 0;
			}

			//after each second convert seconds into H:M:S format and show timer
			convertSecondsIntoHMS(privateChatSecs);
		}
	}, 1000);
}

//function for run new timer on user side
function runCustomerNewTimer(receivedSeconds)
{
	//now run timer for each second
	privateChatSecs = receivedSeconds;
	incrementVar    = 0;

	clearInterval(newtime);
	newtime = setInterval(function()
	{
		if(privateChatSecs > 0)
		{
			privateChatSecs = privateChatSecs-1;
			incrementVar    = incrementVar+1

			if(incrementVar == 1)
			{
				//now call ajax request in every minute
				//for deduct amount from customer account
				addDeductChatAmount(sessionStorage.getItem('privateChatPerMinutePrice'));
			}

			if(incrementVar >= 60)
			{
				incrementVar = 0;
			}

			//after each second convert seconds into H:M:S format and show timer
			convertSecondsIntoHMS(privateChatSecs);
		}
	}, 1000);
}

//function for run timer on performer side
function runPerformerTimer(receivedSeconds)
{
	//console.log('%c runPerformerTimer called', 'background: #222; color: #bada55');

	//now run timer for each second
	privateChatSecs = receivedSeconds;
	incrementVar    = 0;

	if (typeof newtimePerformer !== 'undefined')
	{
		clearInterval(newtimePerformer);
	}

	newtimePerformer = setInterval(function()
	{
		if(privateChatSecs > 0)
		{
			privateChatSecs = privateChatSecs-1;
			incrementVar    = incrementVar+1

			if(incrementVar >= 60)
			{
				incrementVar = 0;
			}

			//after each second convert seconds into H:M:S format and show timer
			convertSecondsIntoHMS(privateChatSecs);
		}
	}, 1000);
}

//function for run new timer on performer side
function runPerformerNewTimer(receivedSeconds)
{
	//console.log('%c runPerformerNewTimer called', 'background: #222; color: #bada55');
	//console.log($('.videoColLft').length);

	//now run timer for each second
	privateChatSecs = receivedSeconds;
	incrementVar    = 0;

	clearInterval(newtimePerformer);
	newtimePerformer = setInterval(function()
	{
		if(privateChatSecs > 0)
		{
			privateChatSecs = privateChatSecs-1;
			incrementVar    = incrementVar+1

			if(incrementVar >= 60)
			{
				incrementVar = 0;
			}

			//after each second convert seconds into H:M:S format and show timer
			convertSecondsIntoHMS(privateChatSecs);
		}
	}, 1000);
}

//function for open/show login submenu
function showHideSubMenu()
{
	$('#subMenuUL').toggle();
}

//function for get customer's full details
function getCustomerFullDetails()
{
   if(window.location.href.indexOf("UniqueId") > -1) 
	{
	   var urlData = window.location.search.substr('?');
	   var startIndex = urlData.indexOf("=");
	   var selectPerformerUniqueId = urlData.substr(startIndex+1);

	   //set Ecom_UserData_PerformerUniqueId on user-purchase-time page
	   if($('#Ecom_UserData_PerformerUniqueId').length)
			$('#Ecom_UserData_PerformerUniqueId').val(selectPerformerUniqueId)

		//now call ajax function to get customer details
		$.ajax({
			type: "POST",
			url : miricamServerUrl+'userApi/getCustomerFullDetails',
			data: {'performerUniqueId':selectPerformerUniqueId, 'customerPrimaryId':sessionStorage.getItem('LoginCustomerPrimaryId')},
			success : function (apiResponse)
			{
				//now set total_amount in sessionstorage and show the customer
				//we will also set other data if required
				if(apiResponse.data.total_amount==null)
					apiResponse.data.total_amount = 0;

				sessionStorage.setItem('customerTotalAmount', parseFloat(apiResponse.data.total_amount).toFixed(2));
				$('#customerTotalAmount').html(parseFloat(apiResponse.data.total_amount).toFixed(2));

				if(apiResponse.data.performer_todays_topic != '' && apiResponse.data.performer_todays_topic != null)
					$('#topic-div').html('').html(apiResponse.data.performer_todays_topic).hide();
				else
					$('#topic-div').html('').hide();
			}
		});
	 }
	else 
	{
		//set Ecom_UserData_PerformerUniqueId on user-purchase-time page
		if($('#Ecom_UserData_PerformerUniqueId').length)
			$('#Ecom_UserData_PerformerUniqueId').val(performerUniqueId)

	//now call ajax function to get customer details
	$.ajax({
		type: "POST",
		url : miricamServerUrl+'userApi/getCustomerFullDetails',
		data: {'performerUniqueId':performerUniqueId, 'customerPrimaryId':sessionStorage.getItem('LoginCustomerPrimaryId')},
		success : function (apiResponse)
		{
			//now set total_amount in sessionstorage and show the customer
			//we will also set other data if required
			if(apiResponse.data.total_amount==null)
				apiResponse.data.total_amount = 0;

			sessionStorage.setItem('customerTotalAmount', parseFloat(apiResponse.data.total_amount).toFixed(2));
			$('#customerTotalAmount').html(parseFloat(apiResponse.data.total_amount).toFixed(2));

			if(apiResponse.data.performer_todays_topic != '' && apiResponse.data.performer_todays_topic != null)
				$('#topic-div').html('').html(apiResponse.data.performer_todays_topic).hide();
			else
				$('#topic-div').html('').hide();
		}
	});
  }
};

//function for get countries list with country code
function getCountriesList()
{
	//now call ajax function to get countries list with country code
	$.ajax({
		type: "POST",
		url : miricamServerUrl+'userApi/getCountriesList',
		data: {'performerUniqueId':performerUniqueId},
		success : function (apiResponse)
		{
			if(apiResponse.status)
			{
				apiResponse.data.forEach(function(value, key)
				{
					if(document.cookie.indexOf("rememberCountry=") < 0)
					{
						if(value['country_code'] == 'US')
							$('#country').append($("<option></option>").attr("value", value['country_code']).text(value['country_name']).attr('selected', 'selected'));
						else
							$('#country').append($("<option></option>").attr("value", value['country_code']).text(value['country_name']));
					}
					else
					{
						$('#country').append($("<option></option>").attr("value", value['country_code']).text(value['country_name']));
					}
				});

				setTimeout(function()
				{
					if(document.cookie.indexOf("rememberState=") < 0)
					{
						getStatesList($('#country'));
					}
				}, 3000);
			}
		}
	});
};

//function for get states list with state code according country
function getStatesList(ths)
{
	//now call ajax function to get states list with state code according country
	$.ajax({
		type: "POST",
		url : miricamServerUrl+'userApi/getStatesList',
		data: {'performerUniqueId':performerUniqueId, 'countryCode':$(ths).val()},
		success : function (apiResponse)
		{
			if(apiResponse.status)
			{
				//first remove old option from select box
				$('#state').find("option:gt(0)").remove();

				apiResponse.data.forEach(function(value, key)
				{
					$('#state').append($("<option></option>").attr("value", value['state_code']).text(value['state_name']));
				});
			}
		}
	});
};

//function for get performer's full details
function getPerformerFullDetails()
{
	if(window.location.href.indexOf("UniqueId") > -1)
	 {
		  var urlData = window.location.search.substr('?');
		  var startIndex = urlData.indexOf("=");
		  var selectPerformerUniqueId = urlData.substr(startIndex+1);

		//now call ajax function to get performer details
		$.ajax({
			type: "POST",
			url : miricamServerUrl+'userApi/getPerformerFullDetails',
			data: {'performerUniqueId':selectPerformerUniqueId, 'performerPrimaryId':sessionStorage.getItem('LoginPerformerPrimaryId')},
			success : function (apiResponse)
			{
				//now set total_amount in sessionstorage and show the performer
				//we will also set other data if required
				if(apiResponse.data.total_amount==null)
					apiResponse.data.total_amount = 0;

				sessionStorage.setItem('performerTotalAmount', parseFloat(apiResponse.data.total_amount).toFixed(2));
				
					apiResponse.countryArray.forEach(function(value, key)
						{
							if(value['country_code'] == apiResponse.data.performer_country)
							{
							   $('#country').append($("<option></option>").attr("value", value['country_code']).text(value['country_name']).attr('selected', 'selected'));
							}
							else
							{
								$('#country').append($("<option></option>").attr("value", value['country_code']).text(value['country_name']));
							}
						});

				//now set performer username/emaiil/full name in my account form
				if(apiResponse.data.performer_username != '')
					$('#username').val(apiResponse.data.performer_username);

				if(apiResponse.data.performer_email != '')
					$('#email').val(apiResponse.data.performer_email);

				if(apiResponse.data.performer_name != '')
					$('#name').val(apiResponse.data.performer_name);

				if(apiResponse.data.performer_website != '')
					$('#websiteURL').val(apiResponse.data.performer_website);

				if(apiResponse.data.performer_phone != '')
					$('#mobilePhone').val(apiResponse.data.performer_phone);

				if(apiResponse.data.performer_address != '')
					$('#street').val(apiResponse.data.performer_address);

				if(apiResponse.data.performer_city != '')
					$('#city').val(apiResponse.data.performer_city);

				if(apiResponse.data.performer_state != '')
					$('#state').val(apiResponse.data.performer_state);

				if(apiResponse.data.performer_zip != '')
					$('#zip').val(apiResponse.data.performer_zip);

				if(apiResponse.data.performer_commission != '')
					$('#performerCommission').val(apiResponse.data.performer_commission);

				if(apiResponse.data.performer_social_taxid != '')
					$('#socialInsTaxId').val(apiResponse.data.performer_social_taxid);

				if(apiResponse.data.performer_twitter_url != '')
					$('#twitterURL').val(apiResponse.data.performer_twitter_url);

				if(apiResponse.data.performer_instagram_url != '')
					$('#instagramURL').val(apiResponse.data.performer_instagram_url);

				if(apiResponse.data.performer_todays_topic != '' && apiResponse.data.performer_todays_topic != null)
					$('#topic-div').html('').html(apiResponse.data.performer_todays_topic);
				else
					$('#topic-div').html('').hide();

				sessionStorage.setItem('performerTipCount', apiResponse.data.tipCount);
				sessionStorage.setItem('performerPurchaseCount', apiResponse.data.purchaseCount);
			}
		});
	}
	else
	{
		//now call ajax function to get performer details
		$.ajax({
			type: "POST",
			url : miricamServerUrl+'userApi/getPerformerFullDetails',
			data: {'performerUniqueId':performerUniqueId, 'performerPrimaryId':sessionStorage.getItem('LoginPerformerPrimaryId')},
			success : function (apiResponse)
			{
				//now set total_amount in sessionstorage and show the performer
				//we will also set other data if required
				if(apiResponse.data.total_amount==null)
					apiResponse.data.total_amount = 0;

				sessionStorage.setItem('performerTotalAmount', parseFloat(apiResponse.data.total_amount).toFixed(2));

				//now set performer username/emaiil/full name in my account form
				if(apiResponse.data.performer_username != '')
					$('#username').val(apiResponse.data.performer_username);

				if(apiResponse.data.performer_email != '')
					$('#email').val(apiResponse.data.performer_email);

				if(apiResponse.data.performer_name != '')
					$('#name').val(apiResponse.data.performer_name);

				if(apiResponse.data.performer_website != '')
					$('#websiteURL').val(apiResponse.data.performer_website);

				if(apiResponse.data.performer_phone != '')
					$('#mobilePhone').val(apiResponse.data.performer_phone);

				if(apiResponse.data.performer_address != '')
					$('#street').val(apiResponse.data.performer_address);

				if(apiResponse.data.performer_city != '')
					$('#city').val(apiResponse.data.performer_city);

				if(apiResponse.data.performer_state != '')
					$('#state').val(apiResponse.data.performer_state);

				if(apiResponse.data.performer_zip != '')
					$('#zip').val(apiResponse.data.performer_zip);

				if(apiResponse.data.performer_commission != '')
					$('#performerCommission').val(apiResponse.data.performer_commission);

				if(apiResponse.data.performer_social_taxid != '')
					$('#socialInsTaxId').val(apiResponse.data.performer_social_taxid);

				if(apiResponse.data.performer_twitter_url != '')
					$('#twitterURL').val(apiResponse.data.performer_twitter_url);

				if(apiResponse.data.performer_instagram_url != '')
					$('#instagramURL').val(apiResponse.data.performer_instagram_url);

				if(apiResponse.data.performer_todays_topic != '' && apiResponse.data.performer_todays_topic != null)
					$('#topic-div').html('').html(apiResponse.data.performer_todays_topic);
				else
					$('#topic-div').html('').hide();

				sessionStorage.setItem('performerTipCount', apiResponse.data.tipCount);
				sessionStorage.setItem('performerPurchaseCount', apiResponse.data.purchaseCount);
			}
		});
  }
}

//function for get performer's users transactions according date
function getUsersTransactions()
{
   if(window.location.href.indexOf("UniqueId") > -1) 
	 {
		var urlData = window.location.search.substr('?');
		var startIndex = urlData.indexOf("=");
		var selectPerformerUniqueId = urlData.substr(startIndex+1);

	   //now call ajax function to get performer's users transactions according date
		$.ajax({
			type: "POST",
			url : miricamServerUrl+'userApi/getUsersTransactions',
			data: {'performerUniqueId':selectPerformerUniqueId, 'performerPrimaryId':sessionStorage.getItem('LoginPerformerPrimaryId')},
			success : function (apiResponse)
			{
				if(apiResponse.status)
				{
					//remove all the rows except first one
					$("#performerUsersTransactions").find("tr:gt(0)").remove();

					//var jsonVariables = $.parseJSON(apiResponse.data)
					var jsonVariables = apiResponse.data

					//now create tr's for append in html table
					var trHTML      = '';
					var totalPayout = 0;
					apiResponse.data.forEach(function(value, key)
					{
						trHTML += '<tr style="background-color:#343F45;">';
						if(value.customer_username != '' && value.customer_username != null && value.customer_username != 'NaN')
							trHTML += '<td>'+value.customer_username+'</td>';
						else
							trHTML += '<td>--</td>';

						if(value.created_date != '' && value.created_date != null && value.created_date != 'NaN')
							trHTML += '<td>'+value.created_date+'</td>';
						else
							trHTML += '<td>--</td>';

						if(value.created_time != '' && value.created_time != null && value.created_time != 'NaN')
							trHTML += '<td>'+value.created_time+'</td>';
						else
							trHTML += '<td>--</td>';

						if(value.purchase_amount != '' && value.purchase_amount != null && value.purchase_amount != 'NaN')
							trHTML += '<td>$'+parseFloat(value.purchase_amount).toFixed(2)+'</td>';
						else
							trHTML += '<td>--</td>';

						if(value.performerAmount != '' && value.performerAmount != null && value.performerAmount != 'NaN')
							trHTML += '<td>$'+parseFloat(value.performerAmount).toFixed(2)+'</td>';
						else
							trHTML += '<td>--</td>';

						trHTML += '</tr>';

						if(value.performerAmount != '' && value.performerAmount != null && value.performerAmount != 'NaN')
							totalPayout = parseFloat(totalPayout) + parseFloat(value.performerAmount);
					});

					//this tr for show total payout
					if(totalPayout != 0)
					{
						var payoutTrHTML = '<tr><td colspan="4"></td><td>-------</td></tr>';
						payoutTrHTML += '<tr><td colspan="4"></td><td>$'+parseFloat(totalPayout).toFixed(2)+'</td></tr>';
						$('#performerTotalAmount').html(parseFloat(totalPayout).toFixed(2));
					}

					//append all trs in table for today sales
					$('#performerUsersTransactions').append(trHTML);
					$('#performerUsersTransactions').append(payoutTrHTML);
				}
				else
				{
					//first remove existing tr from tbody
					$('#performerUsersTransactions').find('tr:not(:first)').remove();

					//now create tr's for append in html table
					var trHTML = '<tr><td colspan="5" class="no_result_tr">No Result Found.</td>';
					$('#performerUsersTransactions').append(trHTML);
				}
			}
		});
	}
	else
	{
	//now call ajax function to get performer's users transactions according date
	$.ajax({
		type: "POST",
		url : miricamServerUrl+'userApi/getUsersTransactions',
		data: {'performerUniqueId':performerUniqueId, 'performerPrimaryId':sessionStorage.getItem('LoginPerformerPrimaryId')},
		success : function (apiResponse)
		{
			if(apiResponse.status)
			{
				//remove all the rows except first one
				$("#performerUsersTransactions").find("tr:gt(0)").remove();

				//var jsonVariables = $.parseJSON(apiResponse.data)
				var jsonVariables = apiResponse.data

				//now create tr's for append in html table
				var trHTML      = '';
				var totalPayout = 0;
				apiResponse.data.forEach(function(value, key)
				{
					trHTML += '<tr style="background-color:#343F45;">';
					if(value.customer_username != '' && value.customer_username != null && value.customer_username != 'NaN')
						trHTML += '<td>'+value.customer_username+'</td>';
					else
						trHTML += '<td>--</td>';

					if(value.created_date != '' && value.created_date != null && value.created_date != 'NaN')
						trHTML += '<td>'+value.created_date+'</td>';
					else
						trHTML += '<td>--</td>';

					if(value.created_time != '' && value.created_time != null && value.created_time != 'NaN')
						trHTML += '<td>'+value.created_time+'</td>';
					else
						trHTML += '<td>--</td>';

					if(value.purchase_amount != '' && value.purchase_amount != null && value.purchase_amount != 'NaN')
						trHTML += '<td>$'+parseFloat(value.purchase_amount).toFixed(2)+'</td>';
					else
						trHTML += '<td>--</td>';

					if(value.performerAmount != '' && value.performerAmount != null && value.performerAmount != 'NaN')
						trHTML += '<td>$'+parseFloat(value.performerAmount).toFixed(2)+'</td>';
					else
						trHTML += '<td>--</td>';

					trHTML += '</tr>';

					if(value.performerAmount != '' && value.performerAmount != null && value.performerAmount != 'NaN')
						totalPayout = parseFloat(totalPayout) + parseFloat(value.performerAmount);
				});

				//this tr for show total payout
				if(totalPayout != 0)
				{
					var payoutTrHTML = '<tr><td colspan="4"></td><td>-------</td></tr>';
					payoutTrHTML += '<tr><td colspan="4"></td><td>$'+parseFloat(totalPayout).toFixed(2)+'</td></tr>';
					$('#performerTotalAmount').html(parseFloat(totalPayout).toFixed(2));
				}

				//append all trs in table for today sales
				$('#performerUsersTransactions').append(trHTML);
				$('#performerUsersTransactions').append(payoutTrHTML);
			}
			else
			{
				//first remove existing tr from tbody
				$('#performerUsersTransactions tbody').empty();

				//now create tr's for append in html table
				var trHTML = '<tr><td colspan="5" class="no_result_tr">No Result Found.</td>';
				$('#performerUsersTransactions').append(trHTML);
			}
		}
	});
  };
};

//function for customer when he wants to
//provide tip to any performer
//if offer tip calling from public page then deduct amount
function performerOfferTip()
{
	swal({
			title: "How much would you like to tip?",
			text : "Account Balance : $"+sessionStorage.getItem('customerTotalAmount'),
			content: {
				element: "input",
				attributes: {
					placeholder: "Tip Amount In $",
					type       : "text",
					maxlength  : 8
				},
			}
		})
		.then((value) => {
			var valid = /^(?:-?\d+|-?\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test(value);
			if(valid  &&  value > 0)
			{
				if(parseFloat(value) <= sessionStorage.getItem('customerTotalAmount'))
				{
					customerFullAddress = '';
					customerIPAddress   = '';

					$.getJSON('https://ipinfo.io?token=12677dc9b587eb', function(data)
					{
						customerIPAddress   = data.ip;
						customerFullAddress = data.city+', '+data.region+', '+data.country+', '+data.postal;
					}).done(function()
					{
						if(window.location.href.indexOf("UniqueId") > -1) 
						{
							var urlData                    = window.location.search.substr('?');
							var startIndex                 = urlData.indexOf("=");
							var selectPerformerUniqueId    = urlData.substr(startIndex+1);
							var siteOwnerPerformerUniqueId = sessionStorage.getItem('performerUniqueId');

							//send ajax request and save notification in table
							//also send custom value in post for authorization
							$.ajax({
								type: "POST",
								url : miricamServerUrl+'userApi/performerOfferTip',
								data: {'performerUniqueId':selectPerformerUniqueId, 'siteOwnerPerformerUniqueId':siteOwnerPerformerUniqueId, 'customerId':sessionStorage.getItem('LoginCustomerPrimaryId'), 'tipAmount' : value, 'customerIPAddress':customerIPAddress, 'customerFullAddress':customerFullAddress},
								success : function (apiResponse)
								{
									if(apiResponse.status)
									{
										//now update total amount of customer
										var previousAmount = parseFloat($('#customerTotalAmount').html());
										var newAmount      = parseFloat(previousAmount) - parseFloat(value);

										sessionStorage.setItem('customerTotalAmount', parseFloat(newAmount).toFixed(2));
										$('#customerTotalAmount').html(parseFloat(newAmount).toFixed(2));

										swal({
											title: "Done",
											text : apiResponse.message,
											icon : "success",
											timer: 3000
										});
									}
									else
									{
										swal({
											title: "Error!",
											text : apiResponse.message,
											icon : "error",
											timer: 3000
										});
									}
								}
							});
						 }
						 else
						 {
							var siteOwnerPerformerUniqueId = sessionStorage.getItem('performerUniqueId');
							$.getJSON('https://ipinfo.io?token=12677dc9b587eb', function(data)
							{
								customerIPAddress   = data.ip;
								customerFullAddress = data.city+', '+data.region+', '+data.country+', '+data.postal;
							}).done(function()
							{
								//send ajax request and save notification in table
								//also send custom value in post for authorization
								$.ajax({
									type: "POST",
									url : miricamServerUrl+'userApi/performerOfferTip',
									data: {'performerUniqueId':performerUniqueId, 'siteOwnerPerformerUniqueId':siteOwnerPerformerUniqueId, 'customerId':sessionStorage.getItem('LoginCustomerPrimaryId'), 'tipAmount' : value, 'customerIPAddress':customerIPAddress, 'customerFullAddress':customerFullAddress},
									success : function (apiResponse)
									{
										if(apiResponse.status)
										{
											//now update total amount of customer
											var previousAmount = parseFloat($('#customerTotalAmount').html());
											var newAmount      = parseFloat(previousAmount) - parseFloat(value);

											sessionStorage.setItem('customerTotalAmount', parseFloat(newAmount).toFixed(2));
											$('#customerTotalAmount').html(parseFloat(newAmount).toFixed(2));

											swal({
												title: "Done",
												text : apiResponse.message,
												icon : "success",
												timer: 3000
											});
										}
										else
										{
											swal({
												title: "Error!",
												text : apiResponse.message,
												icon : "error",
												timer: 3000
											});
										}
									}
								});
							});
					   };
					});
				}
				else
				{
					swal({
						title: "Error!",
						text : "Tip amount should be less then your account balance.",
						icon : "error",
						timer: 3000
					});
				}
			}
			else
			{
				swal({
					title: "Error!",
					text : "Please enter amount in right format, only digits and decimals allowed.",
					icon : "error",
					timer: 3000
				});
			}
		});
}

//function for customer when he wants to
//provide tip to any performer in private chat
//if offer tip calling from private page then deduct time instead of money
function performerOfferTipFromPrivate()
{
	swal({
			title: "How much would you like to tip?",
			text : "Account Balance : $"+sessionStorage.getItem('customerTotalAmount'),
			content: {
				element: "input",
				attributes: {
					placeholder: "Tip Amount In $",
					type       : "text",
					maxlength  : 8
				},
			}
		})
		.then((value) => {
			var valid = /^(?:-?\d+|-?\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test(value);
			if(valid  &&  value > 0)
			{
				if(parseFloat(value) <= sessionStorage.getItem('customerTotalAmount'))
				{
					customerFullAddress = '';
					customerIPAddress   = '';

					if(window.location.href.indexOf("UniqueId") > -1) 
					 {
							var urlData                    = window.location.search.substr('?');
							var startIndex                 = urlData.indexOf("=");
							var selectPerformerUniqueId    = urlData.substr(startIndex+1);
							var siteOwnerPerformerUniqueId = sessionStorage.getItem('performerUniqueId');

						//get customers ipaddress using third party api
						$.getJSON('https://ipinfo.io?token=12677dc9b587eb', function(data)
						{
							customerIPAddress   = data.ip;
							customerFullAddress = data.city+', '+data.region+', '+data.country+', '+data.postal;
						}).done(function()
						{
							//send ajax request and save notification in table
							//also send custom value in post for authorization
							$.ajax({
								type: "POST",
								url : miricamServerUrl+'userApi/performerOfferTip',
								data: {'performerUniqueId':selectPerformerUniqueId, 'siteOwnerPerformerUniqueId':siteOwnerPerformerUniqueId, 'customerId':sessionStorage.getItem('LoginCustomerPrimaryId'), 'tipAmount' : value, 'customerIPAddress':customerIPAddress, 'customerFullAddress':customerFullAddress},
								success : function (apiResponse)
								{
									if(apiResponse.status)
									{
										//now update total amount of customer
										var previousAmount = parseFloat($('#customerTotalAmount').html());
										var newAmount      = parseFloat(previousAmount) - parseFloat(value);

										sessionStorage.setItem('customerTotalAmount', parseFloat(newAmount).toFixed(2));
										$('#customerTotalAmount').html(parseFloat(newAmount).toFixed(2));

										//now after deduction amount from customers account
										//we want to set new timer according to tip

										//first convert tip amount into minutes
										var perMinutePrice        = sessionStorage.getItem('privateChatPerMinutePrice');
										var minsValueAccordingTip = parseFloat(value)/parseFloat(perMinutePrice);
										var secsValueAccordingTip = parseInt(minsValueAccordingTip*60);

										clearInterval(newtime);

										$("#private-chat-timer").html('00:00:00');

										//get original deducted time according seconds
										var remainingSeconds = parseInt(sessionStorage.getItem('requestedPrivateChatSecs')) - parseInt(secsValueAccordingTip);

										//convert seconds into H:M:S format and show timer
										//convertSecondsIntoHMS(remainingSeconds);
										sessionStorage.setItem('requestedPrivateChatSecs', remainingSeconds);

										//now run timer for each second
										runCustomerNewTimer(remainingSeconds);

										//now send ajax request to update private chat room time
										updateRoomTime(sessionStorage.getItem('endedNotificationId'), selectPerformerUniqueId, sessionStorage.getItem('LoginCustomerPrimaryId'), sessionStorage.getItem('requestedPrivateChatSecs'));
									}
								}
							});
						});
					}
					else
					{
						var siteOwnerPerformerUniqueId = sessionStorage.getItem('performerUniqueId');
						//get customers ipaddress using third party api
						$.getJSON('https://ipinfo.io?token=12677dc9b587eb', function(data)
						{
							customerIPAddress   = data.ip;
							customerFullAddress = data.city+', '+data.region+', '+data.country+', '+data.postal;
						}).done(function()
						{
							//send ajax request and save notification in table
							//also send custom value in post for authorization
							$.ajax({
								type: "POST",
								url : miricamServerUrl+'userApi/performerOfferTip',
								data: {'performerUniqueId':performerUniqueId, 'siteOwnerPerformerUniqueId':siteOwnerPerformerUniqueId, 'customerId':sessionStorage.getItem('LoginCustomerPrimaryId'), 'tipAmount' : value, 'customerIPAddress':customerIPAddress, 'customerFullAddress':customerFullAddress},
								success : function (apiResponse)
								{
									if(apiResponse.status)
									{
										//now update total amount of customer
										var previousAmount = parseFloat($('#customerTotalAmount').html());
										var newAmount      = parseFloat(previousAmount) - parseFloat(value);

										sessionStorage.setItem('customerTotalAmount', parseFloat(newAmount).toFixed(2));
										$('#customerTotalAmount').html(parseFloat(newAmount).toFixed(2));

										//now after deduction amount from customers account
										//we want to set new timer according to tip

										//first convert tip amount into minutes
										var perMinutePrice        = sessionStorage.getItem('privateChatPerMinutePrice');
										var minsValueAccordingTip = parseFloat(value)/parseFloat(perMinutePrice);
										var secsValueAccordingTip = parseInt(minsValueAccordingTip*60);

										clearInterval(newtime);

										$("#private-chat-timer").html('00:00:00');

										//get original deducted time according seconds
										var remainingSeconds = parseInt(sessionStorage.getItem('requestedPrivateChatSecs')) - parseInt(secsValueAccordingTip);

										//convert seconds into H:M:S format and show timer
										//convertSecondsIntoHMS(remainingSeconds);
										sessionStorage.setItem('requestedPrivateChatSecs', remainingSeconds);

										//now run timer for each second
										runCustomerNewTimer(remainingSeconds);

										//now send ajax request to update private chat room time
										updateRoomTime(sessionStorage.getItem('endedNotificationId'), performerUniqueId, sessionStorage.getItem('LoginCustomerPrimaryId'), sessionStorage.getItem('requestedPrivateChatSecs'));
									}
								}
							});
						});
				  };
				}
				else
				{
					swal({
						title: "Error!",
						text : "Tip amount should be less then your account balance.",
						icon : "error",
						timer: 3000
					});
				}
			}
			else
			{
				swal({
					title: "Error!",
					text : "Please enter amount in right format, only digits and decimals allowed.",
					icon : "error",
					timer: 3000
				});
			}
		});
}

//function for change room time for performer
function updateRoomTime(notificationId, performerUniqueId, customerPrimaryId, actualSeconds)
{
	$.ajax({
		type: "POST",
		url : miricamServerUrl+'userApi/updateRoomTime',
		data: {'performerUniqueId':performerUniqueId, 'customerPrimaryId':customerPrimaryId, 'notificationId':notificationId, 'actualSeconds':actualSeconds},
		success : function (apiResponse)
		{
			console.log(apiResponse);
		}
	});
};

//function for get room time for performer
//this function called from privatechat page
//on every 4 seconds
function getRoomTime(notificationId)
{
	if(window.location.href.indexOf("UniqueId") > -1)
	 {
		var urlData = window.location.search.substr('?');
		var startIndex = urlData.indexOf("=");
		var selectPerformerUniqueId = urlData.substr(startIndex+1);

		$.ajax({
			type: "POST",
			url : miricamServerUrl+'userApi/getRoomTime',
			data: {'performerUniqueId':selectPerformerUniqueId, 'notificationId':notificationId},
			success : function (apiResponse)
			{
				if(apiResponse.status)
				{
					//now update performer side timer if customer
					//give tip to performer. If old secs value is
					//match with current result then no need to change
					//in timer otherwise change timer
					var oldSecsInPrivateChat     = sessionStorage.getItem('requestedPrivateChatSecs');
					var currentSecsInPrivateChat = apiResponse.actualSeconds;

					if(parseInt(oldSecsInPrivateChat) != parseInt(currentSecsInPrivateChat))
					{
						clearInterval(newtimePerformer);

						sessionStorage.setItem('requestedPrivateChatSecs', currentSecsInPrivateChat);

						//now run timer for each second
						runPerformerNewTimer(currentSecsInPrivateChat);
					}
					else
					{
						console.log(apiResponse);
					}
				}
			}
		});
	}
	else
	{
		$.ajax({
			type: "POST",
			url : miricamServerUrl+'userApi/getRoomTime',
			data: {'performerUniqueId':performerUniqueId, 'notificationId':notificationId},
			success : function (apiResponse)
			{
				if(apiResponse.status)
				{
					//now update performer side timer if customer
					//give tip to performer. If old secs value is
					//match with current result then no need to change
					//in timer otherwise change timer
					var oldSecsInPrivateChat     = sessionStorage.getItem('requestedPrivateChatSecs');
					var currentSecsInPrivateChat = apiResponse.actualSeconds;

					if(parseInt(oldSecsInPrivateChat) != parseInt(currentSecsInPrivateChat))
					{
						clearInterval(newtimePerformer);

						sessionStorage.setItem('requestedPrivateChatSecs', currentSecsInPrivateChat);

						//now run timer for each second
						runPerformerNewTimer(currentSecsInPrivateChat);
					}
					else
					{
						console.log(apiResponse);
					}
				}
			}
		});
   };
};

//function for check that performer will online or not
//if online then show connect to button otherwise message that
//performer is not online
function checkPerformerOnlineStatus()
{
	if(window.location.href.indexOf("UniqueId") > -1) 
	{
		var urlData = window.location.search.substr('?');
		var startIndex = urlData.indexOf("=");
		var selectPerformerUniqueId = urlData.substr(startIndex+1);

		$.ajax({
			type: "POST",
			url : miricamServerUrl+'userApi/checkPerformerOnlineStatus',
			data: {'performerUniqueId':selectPerformerUniqueId },
			success : function (apiResponse)
			{
				//console.log(apiResponse);
				getIntoMultiGroupChatStatus().then(function(result)
				{
					if( (result.status == true) && (result.oldNotify == true))
					{
						if( (apiResponse.status==1) || (apiResponse.status==2))
						{
							var userstatus = result.response;
							if(userstatus.status == 1)
							{
							   if(userstatus.redirectUrl == 0)
							   {
								 updateIntoMultiGroupChat(userstatus.customer_name, userstatus.room_id ,1,1);
									setTimeout(function(){
									window.location.href = serverUrl+'user-dashboard.html?UniqueId='+selectPerformerUniqueId;
									}, 500);
							   }
							   else
							   {
									$('#coustmermassage').html('<h4 class="no_performer">'+result.message+' <div class="btnChatCol"><div class=""><a href="javascript:void(0);" onclick="userRequestUnblock();"><div class="btnChat1">Send Request </div></a></div></div></h4>');
							   }
							}
							else if(userstatus.status == 2)
							{
								$('#coustmermassage').html('<h4 class="no_performer">'+result.message+'</h4>');
							}
							else
							{
								$('#coustmermassage').html('<h4 class="no_performer">'+apiResponse.message+' <div class="btnChatCol"><div class=""><a href="javascript:void(0);" onclick="start();"><div class="btnChat1">Connect To Performer</div></a></div></div></h4>');
							} 
						}
					   else
					   {
							$('#coustmermassage').html('<h4 class="no_performer">'+apiResponse.message+'</h4>');
					   }      
					}
					else if( (result.status == true) && (result.oldNotify != true))
					{
						var userstatus = result.response;
						
						if(userstatus.status == 1 || userstatus.status == 0)
						{
							/*$('#coustmermassage').html('<h4 class="no_performer">'+result.message+' <div class="btnChatCol"><div class=""><a href="javascript:void(0);" onclick="userPendingRequestUnblock();"><div class="btnChat1">Send Request </div></a></div></div></h4>');*/
							$('#coustmermassage').html('<h4 class="no_performer">'+apiResponse.message+' <div class="btnChatCol"><div class=""><a href="javascript:void(0);" onclick="start();"><div class="btnChat1">Connect To Performer</div></a></div></div></h4>');
						}
						else if(userstatus.status == 2)
						{
							$('#coustmermassage').html("<h4 class='no_performer'>Unblock request has been sent. Please wait for performer's approval.</h4>");
						}
					}
					else
					{ 
						if(apiResponse.status==1)
						{
							$('#coustmermassage').html('<h4 class="no_performer">'+apiResponse.message+' <div class="btnChatCol"><div class=""><a href="javascript:void(0);" onclick="start();"><div class="btnChat1">Connect To Performer</div></a></div></div></h4>');
						}
						else if(apiResponse.status==2)
						{
							$('#coustmermassage').html('<h4 class="no_performer">'+apiResponse.message+' <div class="btnChatCol"><div class=""><a href="javascript:void(0);" onclick="gotoPrivateChat()"><div class="btnChat1">Go Private</div></a></div></div></h4>');
						}
						else
						{  
						   $('#coustmermassage').html('<h4 class="no_performer">'+apiResponse.message+'</h4>');
						}
					} 
				 }); 
			}
		});
	}
	else
	{
		$.ajax({
			type: "POST",
			url : miricamServerUrl+'userApi/checkPerformerOnlineStatus',
			data: {'performerUniqueId':performerUniqueId},
			success : function (apiResponse)
			{     
				 getIntoMultiGroupChatStatus().then(function(result){
					 if(result.status)
					 {
					   if( (apiResponse.status==1) || (apiResponse.status==2))
						{
						   var userstatus = result.response;
							if(userstatus.status == 1)
							{
							   if(userstatus.redirectUrl == 0)
							   {
								 updateIntoMultiGroupChat(userstatus.customer_name, userstatus.room_id ,1,1);
									setTimeout(function(){
									window.location.href = serverUrl+'user-dashboard.html';
									}, 500);
							   }
							   else
							   {
								   $('#coustmermassage').html('<h4 class="no_performer">'+result.message+' <div class="btnChatCol"><div class=""><a href="javascript:void(0);" onclick="userRequestUnblock();"><div class="btnChat1">Send Request </div></a></div></div></h4>');
							   }
							}
							else if(userstatus.status == 2)
							{
							 $('#coustmermassage').html('<h4 class="no_performer">'+result.message+'</h4>');
							}
							else
							{
							  $('#coustmermassage').html('<h4 class="no_performer">'+apiResponse.message+' <div class="btnChatCol"><div class=""><a href="javascript:void(0);" onclick="start();"><div class="btnChat1">Connect To Performer</div></a></div></div></h4>');
							} 
						}
					   else
					   {
						 $('#coustmermassage').html('<h4 class="no_performer">'+apiResponse.message+'</h4>');
					   }      
					 }
					else
					{ 
						if(apiResponse.status==1)
						{
							$('#coustmermassage').html('<h4 class="no_performer">'+apiResponse.message+' <div class="btnChatCol"><div class=""><a href="javascript:void(0);" onclick="start();"><div class="btnChat1">Connect To Performer</div></a></div></div></h4>');
						}
						else if(apiResponse.status==2)
						{
							$('#coustmermassage').html('<h4 class="no_performer">'+apiResponse.message+' <div class="btnChatCol"><div class=""><a href="javascript:void(0);" onclick="start();"><div class="btnChat1">Connect To Performer</div></a></div></div></h4>');
							//$('#coustmermassage').html('<h4 class="no_performer">'+apiResponse.message+'</h4>');
						}
						else
						{  
						   $('#coustmermassage').html('<h4 class="no_performer">'+apiResponse.message+'</h4>');
						}

					} 
				});
			}
		});
	}
}

//function for set performer online status
//type = broadcast, logout, busy
function setPerformerOnlineStatus(type)
{
	if(window.location.href.indexOf("UniqueId") > -1) 
	{
		var urlData                 = window.location.search.substr('?');
		var startIndex              = urlData.indexOf("=");
		var selectPerformerUniqueId = urlData.substr(startIndex+1);

		$.ajax({
			type: "POST",
			url : miricamServerUrl+'userApi/setPerformerOnlineStatus',
			data: {'performerUniqueId':selectPerformerUniqueId, 'type': type},
			success : function (apiResponse)
			{
				console.log(apiResponse.message);
			}
		});
	}
	else
	{
		$.ajax({
			type: "POST",
			url : miricamServerUrl+'userApi/setPerformerOnlineStatus',
			data: {'performerUniqueId':sessionStorage.getItem('LoginPerformerUniqueId'), 'type': type},
			success : function (apiResponse)
			{
				console.log(apiResponse.message);
			}
		});
	}
};

//function for delete today's private chat requests of
//customer when he pressed logout
function deletePrivateChatRequests(customerPrimaryId, performerUniqueId)
{
	$.ajax({
		type: "POST",
		url : miricamServerUrl+'userApi/deletePrivateChatRequests',
		data: {'performerUniqueId':performerUniqueId, 'customerPrimaryId':customerPrimaryId},
		success : function (apiResponse)
		{
			console.log(apiResponse.message);
		}
	});
};

//function call when customer/performer joins in
//private chat then deduct amount from customer's
//account and add in performers account
function addDeductChatAmount(privateChatPerMinutePrice)
{
	customerIPAddress   = '';
	customerFullAddress = '';

	if(window.location.href.indexOf("UniqueId") > -1)
	 {
		  var urlData = window.location.search.substr('?');
		  var startIndex = urlData.indexOf("=");
		  var selectPerformerUniqueId = urlData.substr(startIndex+1);

		  //get customers ipaddress using third party api
		$.getJSON('https://ipinfo.io?token=12677dc9b587eb', function(data)
		{
			customerIPAddress   = data.ip;
			customerFullAddress = data.city+', '+data.region+', '+data.country+', '+data.postal;
		}).done(function()
		{
			$.ajax({
				type: "POST",
				url : miricamServerUrl+'userApi/addDeductChatAmount',
				data: {'performerUniqueId':selectPerformerUniqueId, 'notificationId':sessionStorage.getItem('endedNotificationId'), 'customerIPAddress':customerIPAddress, 'customerFullAddress':customerFullAddress, 'privateChatPerMinutePrice':privateChatPerMinutePrice},
				success : function (apiResponse)
				{
					if(apiResponse.status)
					{
						var totalAmountInAccount       = sessionStorage.getItem('customerTotalAmount');
						var perMinutePrice             = sessionStorage.getItem('privateChatPerMinutePrice');
						var totalRemainAmountInAccount = parseFloat(totalAmountInAccount) - parseFloat(perMinutePrice);

						sessionStorage.setItem('customerTotalAmount', parseFloat(totalRemainAmountInAccount).toFixed(2));
						$('#customerTotalAmount').html('').html(parseFloat(totalRemainAmountInAccount).toFixed(2));

						console.log(apiResponse.message);
					}
					else
					{
						console.log(apiResponse.message);
					}
				}
			});
		});
	}
	else
	{
		//get customers ipaddress using third party api
		$.getJSON('https://ipinfo.io?token=12677dc9b587eb', function(data)
		{
			customerIPAddress   = data.ip;
			customerFullAddress = data.city+', '+data.region+', '+data.country+', '+data.postal;
		}).done(function()
		{
			$.ajax({
				type: "POST",
				url : miricamServerUrl+'userApi/addDeductChatAmount',
				data: {'performerUniqueId':performerUniqueId, 'notificationId':sessionStorage.getItem('endedNotificationId'), 'customerIPAddress':customerIPAddress, 'customerFullAddress':customerFullAddress, 'privateChatPerMinutePrice':privateChatPerMinutePrice},
				success : function (apiResponse)
				{
					if(apiResponse.status)
					{
						var totalAmountInAccount       = sessionStorage.getItem('customerTotalAmount');
						var perMinutePrice             = sessionStorage.getItem('privateChatPerMinutePrice');
						var totalRemainAmountInAccount = parseFloat(totalAmountInAccount) - parseFloat(perMinutePrice);

						sessionStorage.setItem('customerTotalAmount', parseFloat(totalRemainAmountInAccount).toFixed(2));
						$('#customerTotalAmount').html('').html(parseFloat(totalRemainAmountInAccount).toFixed(2));

						console.log(apiResponse.message);
					}
					else
					{
						console.log(apiResponse.message);
					}
				}
			});
		});
   };
};

//function call when user/performer end private chat
//if private chat is ended from any side then we need
//to delete specific notification id from table
function deletePrivateChatNotification()
{
	if(window.location.href.indexOf("UniqueId") > -1) 
	 {
		  var urlData = window.location.search.substr('?');
		  var startIndex = urlData.indexOf("=");
		  var selectPerformerUniqueId = urlData.substr(startIndex+1);

		  $.ajax({
			type: "POST",
			url : miricamServerUrl+'userApi/deletePrivateChatNotification',
			data: {'performerUniqueId':selectPerformerUniqueId, 'notificationId':sessionStorage.getItem('endedNotificationId')},
			success : function (apiResponse)
			{
				console.log(apiResponse.message);
			}
		});
	}
	else
	{
		$.ajax({
			type: "POST",
			url : miricamServerUrl+'userApi/deletePrivateChatNotification',
			data: {'performerUniqueId':performerUniqueId, 'notificationId':sessionStorage.getItem('endedNotificationId')},
			success : function (apiResponse)
			{
				console.log(apiResponse.message);
			}
		});
	}
};

//function for get-set random room id of performer/customer using his primary id
//parameters : performerPrimaryId - customerPrimaryId
// type - 1 for performer - 2 for customer
// operations - 1 for get - 2 for set
// callingSide - 1 for performer - 2 for customer
/*Logic : we are set and get performer/customer random room id through this function
*
* If customer wants performers room id from his side then he need to send 2 in callingside
* then he can get performers room id, if he send 1 then he will get his own room id
*
* If performer wants customers room id from his side then he need to send 2 in callingside
* then he can get customers room id, if he send 1 then he will get his own room id
*/
function getSetRandomRoomId(primaryId, type, operations, callingSide)
{
	if(window.location.href.indexOf("UniqueId") > -1)
	{
		var urlData = window.location.search.substr('?');
		var startIndex = urlData.indexOf("=");
		var selectPerformerUniqueId = urlData.substr(startIndex+1);

		$.ajax({
			type: "POST",
			url : miricamServerUrl+'userApi/getSetRandomRoomId',
			data: {'performerUniqueId':selectPerformerUniqueId, 'primaryId':primaryId, 'type':type, 'operations':operations, 'callingSide':callingSide},
			success : function (apiResponse)
			{
				sessionStorage.setItem('randomRoomId', apiResponse.data.random_room_id);
			}
		});
	}
	else
	{
		$.ajax({
			type: "POST",
			url : miricamServerUrl+'userApi/getSetRandomRoomId',
			data: {'performerUniqueId':performerUniqueId, 'primaryId':primaryId, 'type':type, 'operations':operations, 'callingSide':callingSide},
			success : function (apiResponse)
			{
				sessionStorage.setItem('randomRoomId', apiResponse.data.random_room_id);
			}
		});
	}
}

//function for remember card details
//if customer pressed this button then we will
//save card details in cookie and saved this
function rememberCardInfo()
{
	//if remember me checkbox is checked then remember customer card details
	//like : card number, card year/month, CVV
	if($('#rememberCardDetails').prop("checked"))
	{
		//create cookie if checkbox is checked
		createCookie("rememberCustomerCardNumber", $('#cardNumber').val(), 7);
		createCookie("rememberCustomerCardMonth", $('#cardMonth').val(), 7);
		createCookie("rememberCustomerCardYear", $('#cardYear').val(), 7);
		createCookie("rememberCustomerCardCVV", $('#cardCVV').val(), 7);

		//new cookie values
		createCookie("rememberFirstName", $('#firstName').val(), 7);
		createCookie("rememberLastName", $('#lastName').val(), 7);
		createCookie("rememberEmail", $('#email').val(), 7);
		createCookie("rememberStreet", $('#street').val(), 7);
		createCookie("rememberCity", $('#city').val(), 7);
		createCookie("rememberCountry", $('#country').val(), 7);
		createCookie("rememberState", $('#state').val(), 7);
		createCookie("rememberZip", $('#zip').val(), 7);
		createCookie("rememberAmount", $('#cardAmount').val(), 7);
	}
	else
	{
		//delete cookie if checkbox is unchecked
		deleteCookie("rememberCustomerCardNumber");
		deleteCookie("rememberCustomerCardMonth");
		deleteCookie("rememberCustomerCardYear");
		deleteCookie("rememberCustomerCardCVV");

		//new cookie values
		deleteCookie("rememberFirstName");
		deleteCookie("rememberLastName");
		deleteCookie("rememberEmail");
		deleteCookie("rememberStreet");
		deleteCookie("rememberCity");
		deleteCookie("rememberCountry");
		deleteCookie("rememberState");
		deleteCookie("rememberZip");
		deleteCookie("rememberAmount");
	}
}

//function for get card number and set
//into form's hidden field
function getCardNumber()
{
	//now get all values and fit in to hidden variable and
	//submit paypal form
	//$('#Ecom_UserData_CardNumber').val($('#cardNumber').val());

	$('#first_name').val($('#firstName').val());	
	$('#last_name').val($('#lastName').val());	
	$('#address1').val($('#street').val());	
	$('#city').val($('#city').val());	
	$('#state').val($('#state').val());	
	$('#zip').val($('#zip').val());	
	$('#country').val($('#country').val());	
	$('#email').val($('#email').val());	
	$('#amount').val($('#cardAmount').val());

	document.getElementById("paypalForm").submit();
}

//function for show a popup to performer
//when any tip is given by customer
function isTipAdded()
{
	if(window.location.href.indexOf("UniqueId") > -1)
	{
		var urlData = window.location.search.substr('?');
		var startIndex = urlData.indexOf("=");
		var selectPerformerUniqueId = urlData.substr(startIndex+1);

		  $.ajax({
			type: "POST",
			url : miricamServerUrl+'userApi/isTipAdded',
			data: {'performerUniqueId':selectPerformerUniqueId, 'siteOwnerPerformerUniqueId':sessionStorage.getItem('performerUniqueId'), 'primaryId':sessionStorage.getItem('LoginPerformerPrimaryId'), 'performerTipCount':sessionStorage.getItem('performerTipCount')},
			success : function (apiResponse)
			{
				if(apiResponse.status)
				{
					//play sound if any tip is arrive
					$.playSound(serverUrl+performerOfferTipSound);

					$('#performerTipAmountModal').modal('show');
					var siteOwnerPerformerId = apiResponse.siteOwnerPerformerId;
					var parentPerformerId    = apiResponse.parentPerformerId;

					if(siteOwnerPerformerId != parentPerformerId)
					{
						$('#tipAmount').html('').html('$'+parseFloat(apiResponse.data.total_tip_amount).toFixed(2));

						var totalTipAmount        = parseFloat(apiResponse.data.total_tip_amount);
						if(apiResponse.MbaseData.performer_commission != '')
							var totalCommissionAmount = parseFloat( (apiResponse.data.total_tip_amount*apiResponse.MbaseData.performer_commission)/100);
						else
							var totalCommissionAmount = parseFloat( (apiResponse.data.total_tip_amount*apiResponse.miricamPerformerCommission)/100);

						//var tipTimeText    = 'Your commission ';
						//tipTimeText += '$'+parseFloat(totalCommissionAmount).toFixed(2);
						//tipTimeText += '!';

						//$('#tipTimeText').html('').html(tipTimeText);
					}
					else
					{
						$('#tipAmount').html('').html('$'+parseFloat(apiResponse.data.total_tip_amount).toFixed(2));

						var totalTipAmount  = parseFloat(apiResponse.data.total_tip_amount);
						var totalCommission = parseInt(100 - apiResponse.MbaseData.performer_commission);
						var totalCommissionAmount = parseFloat( (apiResponse.data.total_tip_amount*totalCommission)/100);

						//var tipTimeText    = 'Your commission ';
						//tipTimeText        += '$'+parseFloat(totalCommissionAmount).toFixed(2);
						//tipTimeText        += '!';

						//$('#tipTimeText').html('').html(tipTimeText);
					}
					var oldTipCount = sessionStorage.getItem('performerTipCount');
					var newTipCount = parseInt(oldTipCount) + parseInt(1);
					sessionStorage.setItem('performerTipCount', newTipCount);

					setTimeout(function()
					{
						$('#performerTipAmountModal').modal('hide');
					}, 6000);
				}
			}
		});
	}
	else
	{
		$.ajax({
			type: "POST",
			url : miricamServerUrl+'userApi/isTipAdded',
			data: {'performerUniqueId':performerUniqueId, 'primaryId':sessionStorage.getItem('LoginPerformerPrimaryId'), 'performerTipCount':sessionStorage.getItem('performerTipCount')},
			success : function (apiResponse)
			{
				if(apiResponse.status)
				{
					//play sound if any tip is arrive
					$.playSound(serverUrl+performerOfferTipSound);

					$('#performerTipAmountModal').modal('show');
					var siteOwnerPerformerId = apiResponse.siteOwnerPerformerId;
					var parentPerformerId    = apiResponse.parentPerformerId;

					if(siteOwnerPerformerId != parentPerformerId)
					{
						$('#tipAmount').html('').html('$'+parseFloat(apiResponse.data.total_tip_amount).toFixed(2));

						var totalTipAmount        = parseFloat(apiResponse.data.total_tip_amount);
						if(apiResponse.MbaseData.performer_commission != '')
							var totalCommissionAmount = parseFloat( (apiResponse.data.total_tip_amount*apiResponse.MbaseData.performer_commission)/100);
						else
							var totalCommissionAmount = parseFloat( (apiResponse.data.total_tip_amount*apiResponse.miricamPerformerCommission)/100);

						//var tipTimeText    = 'Your commission ';
						//tipTimeText += '$'+parseFloat(totalCommissionAmount).toFixed(2);
						//tipTimeText += '!';

						//$('#tipTimeText').html('').html(tipTimeText);
					}
					else
					{
						$('#tipAmount').html('').html('$'+parseFloat(apiResponse.data.total_tip_amount).toFixed(2));

						var totalTipAmount = parseFloat(apiResponse.data.total_tip_amount);
						var totalCommission = parseInt(100 - apiResponse.MbaseData.performer_commission);
						var totalCommissionAmount = parseFloat( (apiResponse.data.total_tip_amount*totalCommission)/100);

						//var tipTimeText    = 'Your commission ';
						//tipTimeText        += '$'+parseFloat(totalCommissionAmount).toFixed(2);
						//tipTimeText        += '!';

						//$('#tipTimeText').html('').html(tipTimeText);
					}
					var oldTipCount = sessionStorage.getItem('performerTipCount');
					var newTipCount = parseInt(oldTipCount) + parseInt(1);
					sessionStorage.setItem('performerTipCount', newTipCount);

					setTimeout(function()
					{
						$('#performerTipAmountModal').modal('hide');
					}, 6000);
				}
				else
				{
					console.log(apiResponse);
				}
			}
		});
	}
};

//function for show a popup to performer
//when any purchase is made by customer on performer's site
function isPurchaseAdded()
{
	if(window.location.href.indexOf("UniqueId") > -1)
	 {
		  var urlData = window.location.search.substr('?');
		  var startIndex = urlData.indexOf("=");
		  var selectPerformerUniqueId = urlData.substr(startIndex+1);

		  $.ajax({
			type: "POST",
			url : miricamServerUrl+'userApi/isPurchaseAdded',
			data: {'performerUniqueId':selectPerformerUniqueId, 'primaryId':sessionStorage.getItem('LoginPerformerPrimaryId'), 'performerPurchaseCount':sessionStorage.getItem('performerPurchaseCount')},
			success : function (apiResponse)
			{
				if(apiResponse.status)
				{
					//play sound if any purchase is arrive
					$.playSound(serverUrl+paymentSuccessSound);

					$('#performerCustomerPurchaseModal').modal('show');
					$('#purchaseAmount').html('').html('$'+parseFloat(apiResponse.data.purchase_amount).toFixed(2));
					$('#commissionAmount').html('').html('$'+parseFloat(apiResponse.performerCommissionAmount).toFixed(2));

					var oldPurchaseCount = sessionStorage.getItem('performerPurchaseCount');
					var newPurchaseCount = parseInt(oldPurchaseCount) + parseInt(1);
					sessionStorage.setItem('performerPurchaseCount', newPurchaseCount);

					setTimeout(function()
					{
						$('#performerCustomerPurchaseModal').modal('hide');
					}, 6000);
				}
			}
		});
	}
	else
	{
		$.ajax({
			type: "POST",
			url : miricamServerUrl+'userApi/isPurchaseAdded',
			data: {'performerUniqueId':performerUniqueId, 'primaryId':sessionStorage.getItem('LoginPerformerPrimaryId'), 'performerPurchaseCount':sessionStorage.getItem('performerPurchaseCount')},
			success : function (apiResponse)
			{
				if(apiResponse.status)
				{
					//play sound if any purchase is arrive
					$.playSound(serverUrl+paymentSuccessSound);

					$('#performerCustomerPurchaseModal').modal('show');
					$('#purchaseAmount').html('').html('$'+parseFloat(apiResponse.data.purchase_amount).toFixed(2));
					$('#commissionAmount').html('').html('$'+parseFloat(apiResponse.performerCommissionAmount).toFixed(2));

					var oldPurchaseCount = sessionStorage.getItem('performerPurchaseCount');
					var newPurchaseCount = parseInt(oldPurchaseCount) + parseInt(1);
					sessionStorage.setItem('performerPurchaseCount', newPurchaseCount);

					setTimeout(function()
					{
						$('#performerCustomerPurchaseModal').modal('hide');
					}, 6000);
				}
				else
				{
					console.log(apiResponse);
				}
			}
		});
   };
};

function verify_sub_performer()
{
	var urlData = window.location.search.substr('&');
	var endIndex = urlData.indexOf("&");
	var verificationToken = urlData.substr(1, endIndex-1);

	$.LoadingOverlay("show");

	$.ajax({
		type: "POST",
		url : miricamServerUrl+'userApi/verifySubPerformer',
		data: {'performerUniqueName':performerUniqueName ,'websiteURL' : serverUrl ,'verificationToken': verificationToken},
		success : function (apiResponse)
		{
			$.LoadingOverlay("hide");
			if(apiResponse.status)
			{
				swal({
						title: "Done",
						text : apiResponse.message,
						icon : "success",
						timer: 2000
				});
				setTimeout(function()
				{
					window.location.href = serverUrl+'sub-performer-login.html';
				}, 2000)
			}
			else
			{
				swal({
						title: "Error",
						text : apiResponse.message,
						icon : "error",
						timer: 2000
					});

					setTimeout(function()
					{
						window.location.href = serverUrl+'index.html';
					}, 2000)
			}
		}
	});
};

function verify_customer()
{
	var urlData = window.location.search.substr('&');
	var endIndex = urlData.indexOf("&");
	var verificationToken = urlData.substr(1, endIndex-1);

	$.LoadingOverlay("show");

	$.ajax({
		type: "POST",
		url : miricamServerUrl+'userApi/verifyCustomer',
		data: {'websiteURL' : serverUrl ,'verificationToken': verificationToken},
		success : function (apiResponse)
		{
			$.LoadingOverlay("hide");
			if(apiResponse.status)
			{
				swal({
						title: "Done",
						text : apiResponse.message,
						icon : "success",
						timer: 2000
				});
				setTimeout(function()
				{
					window.location.href = serverUrl+'user-login.html';
				}, 2000)
			}
			else
			{
				swal({
						title: "Error",
						text : apiResponse.message,
						icon : "error",
						timer: 2000
					});

					setTimeout(function()
					{
						window.location.href = serverUrl+'index.html';
					}, 2000)
			}
		}
	});
};

//function for logs performer signout activity
function setPerformerSignOutActivity()
{
	var performer_primary_id = sessionStorage.getItem('LoginPerformerPrimaryId');
	$.ajax({
		type: "POST",
		url : miricamServerUrl+'userApi/logsPerformerSignOutActivity',
		data: {'performer_primary_id':performer_primary_id},
		success : function (apiResponse)
		{
			console.log(apiResponse.message);
		}
	});
};

//function for logs chatting activity
function insertPerformerChatLogs(messageTime,senderName,message)
{
	if(window.location.href.indexOf("UniqueId") > -1)
	{
		  var urlData = window.location.search.substr('?');
		  var startIndex = urlData.indexOf("=");
		  var selectPerformerUniqueId = urlData.substr(startIndex+1);
		   $.ajax({
				type: "POST",
				url : miricamServerUrl+'userApi/savePerformerChatLogs',
				data: {'performerUniqueId':selectPerformerUniqueId,messageTime:messageTime,senderName:senderName,message :message},
				success : function (apiResponse)
				{
					//console.log(apiResponse);
				}
			});
	}
};

//performer group chat --customer/block unblock feature
/* when customer joins the room initial status is 0
*   performer blocks customer set status to 1
*   cutomer request to unblock him to performer status 2
*   redirecturl - 0 initially --
*   redirecturl - 1 when performer block customer it redirects to user's dashboard
*/ 

function clearPerformerGroupChatRoom()
{
   var roomId = sessionStorage.getItem('randomRoomId');

	if((roomId !=null))
	{
		$.ajax({
			type: "POST",
			url : miricamServerUrl+'userApi/groupChatRemove',
			data: {roomId:roomId},
			success : function (apiResponse)
			{
			   console.log(apiResponse);
			}
		})
	}
};

function insertIntoMultiGroupChat(loginCustomerUsername, roomId, status, redirectUrl)
{
	$.ajax({
		type: "POST",
		url : miricamServerUrl+'userApi/groupChatInsert',
		data: {loginCustomerUsername:loginCustomerUsername,roomId:roomId,status:status,redirectUrl:redirectUrl},
		success : function (apiResponse)
		{
			console.log(apiResponse);
		}
	});
};

function updateIntoMultiGroupChat(loginCustomerUsername, roomId, status, redirectUrl)
{
	/*New logic : we are saving block records also in table. For this
	* we need performer id. when any performer block any user then
	* we save this recrod into table with parameters.
	*/
	var selectPerformerUniqueId = '';
	if(window.location.href.indexOf("UniqueId") > -1)
	{
		var urlData             = window.location.search.substr('?');
		var startIndex          = urlData.indexOf("=");
		selectPerformerUniqueId = urlData.substr(startIndex+1);
	}

	$.ajax({
		type: "POST",
		url : miricamServerUrl+'userApi/groupChatUpdate',
		data: {selectPerformerUniqueId:selectPerformerUniqueId,loginCustomerId:sessionStorage.getItem('LoginCustomerPrimaryId'), loginCustomerUsername:loginCustomerUsername, roomId:roomId ,status:status,redirectUrl:redirectUrl},
		success : function (apiResponse)
		{
			console.log(apiResponse);
		}
	});
};

function getIntoMultiGroupChatStatus()
{
	var roomId = sessionStorage.getItem('randomRoomId');
	var loginCustomerUsername = sessionStorage.getItem('LoginCustomerUsername');
	var userResponseStatus='';

	var selectPerformerUniqueId = '';
	if(window.location.href.indexOf("UniqueId") > -1)
	{
		var urlData             = window.location.search.substr('?');
		var startIndex          = urlData.indexOf("=");
		selectPerformerUniqueId = urlData.substr(startIndex+1);
	}

	return $.ajax({
		type: "POST",
		async: false,
		url : miricamServerUrl+'userApi/groupChatGetStatus',
		//data: {selectPerformerUniqueId:selectPerformerUniqueId, loginCustomerId:sessionStorage.getItem('LoginCustomerPrimaryId'), loginCustomerUsername:loginCustomerUsername,roomId:roomId},
		data: {selectPerformerUniqueId:selectPerformerUniqueId, loginCustomerId:sessionStorage.getItem('LoginCustomerPrimaryId'), loginCustomerUsername:loginCustomerUsername,roomId:roomId},
		success : function (apiResponse)
		{
			apiResponse;
		}
	});
};

function userRequestUnblock()
{
	var roomId = sessionStorage.getItem('randomRoomId');
	var loginCustomerUsername = sessionStorage.getItem('LoginCustomerUsername');

	if((roomId !=null) && (loginCustomerUsername !=null))
	{
		$.ajax({
			type: "POST",
			url : miricamServerUrl+'userApi/groupChatReqUpdate',
			data: {loginCustomerUsername:loginCustomerUsername,roomId:roomId ,status :2,redirectUrl:1},
			success : function (apiResponse)
			{
				console.log(apiResponse);
			}
		});
	};
};

function performerUnblockUser(loginCustomerUsername,roomId,status,redirectUrl)
{
	swal({
	   title: "Are you sure?",
	   text: "Are you sure that you want to Unblock this user?",
	   icon: "warning",
	   dangerMode: true,
	   buttons: ["No", "Yes"],
	})
	.then(willDelete => {
	   if (willDelete) {
		   updateIntoMultiGroupChat(loginCustomerUsername,roomId,status,redirectUrl)
		  } else {
	   }
   })
};

function videochat()
{
	$(".media-container-chat").toggle();
}

function goToPerformerRoom(performer_unique_id)
{
	window.location.href = serverUrl+'user-dashboard.html?UniqueId='+performer_unique_id;
}

function goToDashboard(page)
{
  if(window.location.href.indexOf("UniqueId") > -1)
	 {
		  var urlData = window.location.search.substr('?');
		  var startIndex = urlData.indexOf("=");
		  var selectPerformerUniqueId = urlData.substr(startIndex+1);

		if(page == "user")
		{
			window.location.href = serverUrl+'user-dashboard.html?UniqueId='+selectPerformerUniqueId;
		}
		else
		{
			window.location.href = serverUrl+'performer-dashboard.html?UniqueId='+selectPerformerUniqueId;
		}
	}
};

//function for initlize datepicker on field
function intilizeDatePicker(fieldName)
{
	var today = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
	$("#"+fieldName).datepicker({
		uiLibrary   : 'bootstrap4',
		iconsLibrary: 'fontawesome',
		minDate     : today
	});
};

//function for initlize timepicker on field
function intilizeTimePicker(fieldName)
{
	$('#'+fieldName).timepicker({
		timeFormat : 'h:mm p',
		interval   : 30,
		defaultTime: '',
		startTime  : '01:00',
		dynamic    : false,
		dropdown   : true,
		scrollbar  : true
	});
};

function buyTime()
{
	if(window.location.href.indexOf("UniqueId") > -1)
	{
		var urlData = window.location.search.substr('?');
		var startIndex = urlData.indexOf("=");
		var selectPerformerUniqueId = urlData.substr(startIndex+1);
		window.location.href = serverUrl+'user-purchase-time.html?UniqueId='+selectPerformerUniqueId;
	}
	else
	{
		window.location.href = serverUrl+'user-purchase-time.html';
	}
};

//function for get performers entire details and show in
//performer details page
function getPerformerEntireDetails()
{
	$.ajax({
		type: "POST",
		url : miricamServerUrl+'userApi/getPerformerEntireDetails',
		data: {'performerUniqueId':performerUniqueId},
		success : function (apiResponse)
		{
			if(apiResponse.status)
			{
				var performerContent     = '';
				var performerDescription = '';
				var performerTimezone    = '';
				var sliderContent        = '';

				if(apiResponse.data.performer_name != '' && apiResponse.data.performer_name != null)
					performerContent += '<div class="col-md-4 contentDiv"><span>Name : <strong>'+apiResponse.data.performer_name+'</strong></span></div>';

				if(apiResponse.data.performer_username != '' && apiResponse.data.performer_username != null)
					performerContent += '<div class="col-md-4 contentDiv"><span>Username : <strong>'+apiResponse.data.performer_username+'</strong></span></div>';

				if(apiResponse.data.performer_email != '' && apiResponse.data.performer_email != null)
					performerContent += '<div class="col-md-4 contentDiv"><span>Email : <strong>'+apiResponse.data.performer_email+'</strong></span></div>';

				if(apiResponse.data.performer_website != '' && apiResponse.data.performer_website != null)
					performerContent += '<div class="col-md-4 contentDiv"><span>Website : <strong>'+apiResponse.data.performer_website+'</strong></span></div>';

				if(apiResponse.data.performer_phone != '' && apiResponse.data.performer_phone != null)
					performerContent += '<div class="col-md-4 contentDiv"><span>Phone : <strong>'+apiResponse.data.performer_phone+'</strong></span></div>';

				if(apiResponse.data.performer_address != '' && apiResponse.data.performer_address != null)
					performerContent += '<div class="col-md-4 contentDiv"><span>Address : <strong>'+apiResponse.data.performer_address+', '+apiResponse.data.performer_city+', '+apiResponse.data.performer_state+', '+apiResponse.data.performer_country+'</strong></span></div>';

				if(apiResponse.data.performer_description != '' && apiResponse.data.performer_description != null)
					performerDescription += apiResponse.data.performer_description;

				if(apiResponse.data.is_online == 0)
				{
					if(apiResponse.data.performer_time_zone != '')
					{
						apiResponse.timezone.forEach(function(value, key)
						{
							if(apiResponse.data.performer_time_zone != '')
								if(value['timezone_id'] == apiResponse.data.performer_time_zone)
									performerTimezone = value['timezone_name'];
						});

						var performerTime         = apiResponse.data.performer_show_date+' '+apiResponse.data.performer_show_start_time;
						var performerActualTime   = moment.tz(performerTime, "M/D/YYYY h:mm A", true, performerTimezone);
						var performerFormatedTime = moment.tz(performerTime, "M/D/YYYY h:mm A", true, performerTimezone).format('dddd, Do MMMM, hh:mm A');

						var userTimezone   = moment.tz.guess();
						var userActualTime = performerActualTime.tz(userTimezone).format('dddd, Do MMMM, hh:mm A');

						performerContent += '<div class="col-md-4 contentDiv"><span>According Performer Time : <strong> \
						'+performerFormatedTime+'</strong></span></div>';

						performerContent += '<div class="col-md-4 contentDiv"><span>According User Time : <strong> \
						'+userActualTime+'</strong></span></div>';
					}
					else
					{
						performerContent += '<div class="col-md-4 contentDiv"><span>According Performer Time : <strong> N/A </strong></span></div>';
						performerContent += '<div class="col-md-4 contentDiv"><span>According User Time : <strong> N/A </strong></span></div>';
					}
				}

				if(apiResponse.data.is_online == 1 || apiResponse.data.is_online == 2)
				{
					performerContent += '<div class="col-md-4 contentDiv"><span>Live Now : <strong> <a href="user-login.html">Chat With Me</a> </strong></span></div>';
				}

				$('#performer-content').append(performerContent);
				$('#performer-description').append(performerDescription);

				if(apiResponse.performerImagesResult.length > 0)
				{
					var incrementVar = 1;
					apiResponse.performerImagesResult.forEach(function(value, key)
					{
						//update profile image
						if(value.performer_images_primary_id == apiResponse.data.performer_image)
						{
							$('#performer-image').attr('src', miricamServerUrl+value.performer_image_path);
						}

						//update gallery images for carousal
						if(value.performer_images_primary_id != apiResponse.data.performer_image && value.performer_images_primary_id != apiResponse.data.performer_photo_id)
						{
							if(incrementVar == 1)
								sliderContent += '<div class="item">';

							sliderContent += '<div class="col-sm-3"><a href="javascript:void(0);" class="thumbnail">\
							<img src="'+miricamServerUrl+value.performer_image_path+'" alt="Image" class="img-responsive" style="height:200px;"></a> </div>';

							incrementVar++;
							if(incrementVar > 4 || Object.is(apiResponse.performerImagesResult.length - 1, key))
							{
								sliderContent += '</div>';
								incrementVar = 1;
							}
						}
					});
					$('#performer-images').append(sliderContent);
					$('.item:first-child').addClass('active');
				}
			}
			else
			{
				console.log(apiResponse);
			}
		}
	});
}

//function for get customer's full details
function getPerformerOtherFullDetails()
{
   if(window.location.href.indexOf("UniqueId") > -1) 
	 {
	   var urlData = window.location.search.substr('?');
	   var startIndex = urlData.indexOf("=");
	   var selectPerformerUniqueId = urlData.substr(startIndex+1);

	   //now call ajax function to get customer details
		$.ajax({
			type: "POST",
			url : miricamServerUrl+'userApi/getPerformersAllInfo',
			data: {'performerUniqueId':selectPerformerUniqueId, 'customerPrimaryId':sessionStorage.getItem('LoginCustomerPrimaryId')},
			success : function (apiResponse)
			{
				if(apiResponse.status)
				{
					var performerData = apiResponse.data;
					var panelBody = "";

					if(performerData.subPerformer_list.length > 0)
					{
						panelBody += '<section class="box special"><div class="col-md-10 bottomUserProfilePanel">';
						panelBody += '<div class="video_perform">';
						panelBody += '<div class="row chatRoomPanel col-container" id="containermassages">';
						panelBody += '<div class="col-xs-12 col-md-12" id="coustmermassage" style="height:300px;"><h4 class="no_performer"></h4></div>';
						panelBody += '<div class="videos-viewers" id="viewers" style="display:none;"><div id="videos-container-viewers-public" class="videoPanel"></div></div></div>';  
						panelBody += '<div class="saleTableData"><div class="row"><div class="col-xs-12 col-md-12 topic-div-position" id="topic-div"></div></div></div>';
						panelBody += '<div class="col-md-12 threeBtnPanel"><div class="row btnChatCol">';
						panelBody += '<div class=""><a href="javascript:void(0);" onclick="buyTime()"><div class="btnChat3">Buy Time</div></a></div>';
						panelBody += '<div class=""><a href="javascript:void(0);" onclick="gotoPrivateChat()"><div class="btnChat3">Go Private</div></a></div>';
						panelBody += '<div class=""><a href="javascript:void(0);" onclick="performerOfferTip()"><div class="btnChat3">Offer Tip</div></a></div>';
						panelBody += '</div></div>';
						panelBody += '<h5>'+performerData.performer_name+'</h5>';

						if(performerData.image_gallary.length > 0)
						{
							panelBody += '<div class="col-md-12 galleryThumbPanel"> <ul id="flexiselDemo1">'
						for(var i=0 ;i<performerData.image_gallary.length ;i++)
						{ 
							if((performerData.performer_image != performerData.image_gallary[i].performer_images_primary_id)&&(performerData.performer_photo_id != performerData.image_gallary[i].performer_images_primary_id))
							{
								panelBody += '<li> <img src="'+ miricamServerUrl+''+performerData.image_gallary[i].performer_image_path+'" alt=" " class="img-responsive" /></li>';
							}
						}
						panelBody +='</ul></div>';
						}
						else
						{
							panelBody += '<div class="col-md-12 galleryThumbPanel"> <ul id="flexiselDemo1">';
							panelBody += '<li><img src="images/no-image.jpg" alt=" " class="img-responsive" /></li>';
							panelBody +='</ul></div>';
						}

						panelBody +='<div class="col-md-12 twoColProfileMain">';
						panelBody +='<div class="col-md-6 largeImg"> <div class="row">';
						panelBody +='<div class="col-md-6 lftImgMod">';

						if((performerData.performer_image !='') && (performerData.performer_image !=null))
						{
							for(var i=0 ;i<performerData.image_gallary.length ;i++)
							{
								if(performerData.performer_image == performerData.image_gallary[i].performer_images_primary_id)
								{
									panelBody += '<figure> <img src="'+ miricamServerUrl+''+performerData.image_gallary[i].performer_image_path+'" alt=" " class="img-responsive" /></figure>';
								}
							}
							}
							else
							{
								panelBody += '<figure> <img src="images/no-image.jpg" alt=" " class="img-responsive" /></figure>';
							}
						panelBody +='<div class="modelSocialIcons"><a href=""><i class="fa fa-envelope-o"></i></a> <a href=""><i class="fa fa-twitter"></i></a></div>';
						panelBody +='</div><div class="col-md-6 modelDesc">';
						panelBody +='<h3>'+performerData.performer_name+'</h3> '+performerData.performer_description+'';
						panelBody +='</div></div></div>';
						panelBody +='<div class="col-md-6 profilePanel"><ul>';
						panelBody +='<li class="row"><label class="col-md-5">Hair :</label> <span class="col-md-7">'+performerData.performer_hair_color+'</span></li>';
						panelBody +='<li class="row"><label class="col-md-5">Eyes :</label> <span class="col-md-7">'+performerData.performer_eye_color+'</span></li>';
						panelBody +='<li class="row"><label class="col-md-5">Body-type :</label> <span class="col-md-7">'+performerData.performer_body_type+'</span></li>';
						panelBody +='<li class="row"><label class="col-md-5">Ethinicity :</label> <span class="col-md-7">'+performerData.performer_ethinicity+'</span></li>';
						panelBody +='<li class="row"><label class="col-md-5">Age :</label> <span class="col-md-7">'+performerData.performer_age+'</span></li>';
						panelBody +='<li class="row"><label class="col-md-5">Sex :</label> <span class="col-md-7">'+performerData.performer_sex+'</span></li>';
						panelBody +='</ul></div>';

						panelBody += '</div></section>';
						panelBody += '<div class="col-md-2 rightThumbImgGallery">';
						for(var i=0 ;i<performerData.subPerformer_list.length ;i++)
						{
							if((performerData.subPerformer_list[i].performer_image !=null) && (performerData.subPerformer_list[i].performer_image !=''))
							{
								if(performerData.subPerformer_list[i].is_online)
								{
								  panelBody += '<a style="border: none; margin-left: 8px;" href="user-dashboard.html?UniqueId='+performerData.subPerformer_list[i].performer_unique_id+'" title="'+performerData.subPerformer_list[i].performer_name+'" > <i class="fa fa-circle" aria-hidden="true" style="color:#32CD32"></i> <img src="'+ miricamServerUrl+''+performerData.subPerformer_list[i].performer_image_path+'" alt=""></a>';
								}
								else
								{
								  panelBody += '<a style="border: none; margin-left: 8px;" href="user-dashboard.html?UniqueId='+performerData.subPerformer_list[i].performer_unique_id+'" title="'+performerData.subPerformer_list[i].performer_name+'" > <i class="fa fa-circle" aria-hidden="true" style="color:#FF0000"></i> <img src="'+ miricamServerUrl+''+performerData.subPerformer_list[i].performer_image_path+'" alt=""></a>';
								}
							}
							else
							{
								if(performerData.subPerformer_list[i].is_online)
								{
								  panelBody += '<a style="border: none;margin-left:8px;" href="user-dashboard.html?UniqueId='+performerData.subPerformer_list[i].performer_unique_id+'" title="'+performerData.subPerformer_list[i].performer_name+'" > <i class="fa fa-circle" aria-hidden="true" style="color:#32CD32"></i> <img src="images/no-image.jpg" alt=""></a>';   
								}
								else
								{
								 panelBody += '<a style="border: none;margin-left:8px;" href="user-dashboard.html?UniqueId='+performerData.subPerformer_list[i].performer_unique_id+'" title="'+performerData.subPerformer_list[i].performer_name+'" > <i class="fa fa-circle" aria-hidden="true" style="color:#FF0000"></i> <img src="images/no-image.jpg" alt=""></a>';   
								}
							}
						}
						panelBody += '</div>';
						$('.user_dash_board').append(panelBody);
					}
				   else
					{
					  /*  no online subperformer */	
					 panelBody += '<section class="box special"><div class="col-md-12 bottomUserProfilePanel">';
					 panelBody += '<div class="video_perform">';
					 panelBody += '<div class="row chatRoomPanel col-container" id="containermassages">';
					 panelBody += '<div class="col-xs-12 col-md-12" id="coustmermassage" style="height:300px;"><h4 class="no_performer"></h4></div>';
					 panelBody += '<div class="videos-viewers" id="viewers" style="display:none;"><div id="videos-container-viewers-public" class="videoPanel"></div></div></div>';  
					 panelBody += '<div class="saleTableData"><div class="row"><div class="col-xs-12 col-md-12 topic-div-position" id="topic-div"></div></div></div>';
					 panelBody += '<div class="col-md-12 threeBtnPanel"><div class="row btnChatCol">';
					 panelBody += '<div class=""><a href="javascript:void(0);" onclick="buyTime()"><div class="btnChat3">Buy Time</div></a></div>';
					 panelBody += '<div class=""><a href="javascript:void(0);" onclick="gotoPrivateChat()"><div class="btnChat3">Go Private</div></a></div>';
					 panelBody += '<div class=""><a href="javascript:void(0);" onclick="performerOfferTip()"><div class="btnChat3">Offer Tip</div></a></div>';
					 panelBody += '</div></div>';
					 panelBody += '<h5>'+performerData.performer_name+'</h5>';

					 if(performerData.image_gallary.length > 0)
					 {
						 panelBody += '<div class="col-md-12 galleryThumbPanel"> <ul id="flexiselDemo1">'
					   for(var i=0 ;i<performerData.image_gallary.length ;i++)
					   {
						   if((performerData.performer_image != performerData.image_gallary[i].performer_images_primary_id)&&(performerData.performer_photo_id != performerData.image_gallary[i].performer_images_primary_id))
						   {
							panelBody += '<li> <img src="'+ miricamServerUrl+''+performerData.image_gallary[i].performer_image_path+'" alt=" " class="img-responsive" /></li>';
						 }
					   }
					   panelBody +='</ul></div>';
					 }
					 else
					 {
						 panelBody += '<div class="col-md-12 galleryThumbPanel"> <ul id="flexiselDemo1">';
						 panelBody += '<li><img src="images/no-image.jpg" alt=" " class="img-responsive" /></li>';
						 panelBody +='</ul></div>';
					 }
					   panelBody +='<div class="col-md-12 twoColProfileMain">';
					   panelBody +='<div class="col-md-6 largeImg"> <div class="row">';
					   panelBody +='<div class="col-md-6 lftImgMod">';
					   
					  if((performerData.performer_image !='') && (performerData.performer_image !=null))
					  {
						   for(var i=0 ;i<performerData.image_gallary.length ;i++)
						   {
							   if(performerData.performer_image == performerData.image_gallary[i].performer_images_primary_id)
							   {
								panelBody += '<figure> <img src="'+ miricamServerUrl+''+performerData.image_gallary[i].performer_image_path+'" alt=" " class="img-responsive" /></figure>';
							 }
						   }
						}
						else
						{
							 panelBody += '<figure> <img src="images/no-image.jpg" alt=" " class="img-responsive" /></figure>';
						}
					   panelBody +='<div class="modelSocialIcons"><a href=""><i class="fa fa-envelope-o"></i></a> <a href=""><i class="fa fa-twitter"></i></a></div>';
					   panelBody +='</div><div class="col-md-6 modelDesc">';
					   panelBody +='<h3>'+performerData.performer_name+'</h3> '+performerData.performer_description+'';
					   panelBody +='</div></div></div>';
					   panelBody +='<div class="col-md-6 profilePanel"><ul>';
					   panelBody +='<li class="row"><label class="col-md-5">Hair :</label> <span class="col-md-7">'+performerData.performer_hair_color+'</span></li>';
					   panelBody +='<li class="row"><label class="col-md-5">Eyes :</label> <span class="col-md-7">'+performerData.performer_eye_color+'</span></li>';
					   panelBody +='<li class="row"><label class="col-md-5">Body-type :</label> <span class="col-md-7">'+performerData.performer_body_type+'</span></li>';
					   panelBody +='<li class="row"><label class="col-md-5">Ethinicity :</label> <span class="col-md-7">'+performerData.performer_ethinicity+'</span></li>';
					   panelBody +='<li class="row"><label class="col-md-5">Age :</label> <span class="col-md-7">'+performerData.performer_age+'</span></li>';
					   panelBody +='<li class="row"><label class="col-md-5">Sex :</label> <span class="col-md-7">'+performerData.performer_sex+'</span></li>';
					   panelBody +='</ul></div>';
					   panelBody += '</div></section>';
						$('.user_dash_board').append(panelBody);
					}

					getCustomerFullDetails();
					$("#flexiselDemo1").flexisel({
						visibleItems:6,
						animationSpeed: 1000,
						autoPlay: true,
						autoPlaySpeed: 3000,
						pauseOnHover: true,
						enableResponsiveBreakpoints: true,
						responsiveBreakpoints: { 
							portrait: { 
								changePoint:480,
								visibleItems: 1
							}, 
							landscape: { 
								changePoint:640,
								visibleItems:2
							},
							tablet: { 
								changePoint:768,
								visibleItems:3
							}
						}
					});

					setInterval(function()
					{
						//getOnlineSubPerformerList();
					}, 30000);
				}
			}
		});
	 }
};

function getOnlineSubPerformerList()
{
	 if(window.location.href.indexOf("UniqueId") > -1)
	 {
	   var urlData = window.location.search.substr('?');
	   var startIndex = urlData.indexOf("=");
	   var selectPerformerUniqueId = urlData.substr(startIndex+1);

	   //now call ajax function to get customer details
		$.ajax({
			type: "POST",
			url : miricamServerUrl+'userApi/getAllOnlinePerformer',
			data: {'performerUniqueId':selectPerformerUniqueId, 'customerPrimaryId':sessionStorage.getItem('LoginCustomerPrimaryId')},
			success : function (apiResponse)
			{
				if(apiResponse.status)
				{
					//checking whether div exits or not
				   if( $('.rightThumbImgGallery').length )
					 {
						   //remove all html inside this div
							$('.rightThumbImgGallery').empty();
							panelBody = "";

							 for(var i=0 ;i<apiResponse.data.length ;i++)
								{
									if((apiResponse.data[i].performer_image !=null) && (apiResponse.data[i].performer_image !=''))
									{
										if(apiResponse.data[i].is_online)
										{
										  panelBody += '<a style="border: none;margin-left: 8px;" href="user-dashboard.html?UniqueId='+apiResponse.data[i].performer_unique_id+'" title="'+apiResponse.data[i].performer_name+'" ><i class="fa fa-circle" aria-hidden="true" style="color:#32CD32"></i><img src="'+ miricamServerUrl+''+apiResponse.data[i].performer_image_path+'" alt=""></a>';
										}
										else
										{
										  panelBody += '<a style="border: none;margin-left: 8px;" href="user-dashboard.html?UniqueId='+apiResponse.data[i].performer_unique_id+'" title="'+apiResponse.data[i].performer_name+'" ><i class="fa fa-circle" aria-hidden="true" style="color:#FF0000"></i><img src="'+ miricamServerUrl+''+apiResponse.data[i].performer_image_path+'" alt=""></a>';
										}
									}
									else
									{
										if(apiResponse.data[i].is_online)
										{
										  panelBody += '<a style="border:none;margin-left: 8px;" href="user-dashboard.html?UniqueId='+apiResponse.data[i].performer_unique_id+'" title="'+apiResponse.data[i].performer_name+'" ><i class="fa fa-circle" aria-hidden="true" style="color:#32CD32"></i><img src="images/no-image.jpg" alt=""></a>';   
										}
										else
										{
											panelBody += '<a style="border:none;margin-left: 8px;" href="user-dashboard.html?UniqueId='+apiResponse.data[i].performer_unique_id+'" title="'+apiResponse.data[i].performer_name+'" ><i class="fa fa-circle" aria-hidden="true" style="color:#FF0000"></i><img src="images/no-image.jpg" alt=""></a>';   
										}
									}
								}
							$('.rightThumbImgGallery').append(panelBody);
					  }
				}
			}
	   });
	 }
};

//function for save free chat time in cookie
//if cookie is expire then redirect user on
//performers list page
function createFreeChatCookie(cookieName, cookieValue, timeToExpire)
{
	//get date and create time for cookie
	var date = new Date();
	date.setTime(date.getTime()+(timeToExpire*60*1000));

	//save javascript cookie
	document.cookie = cookieName + "=" + cookieValue + "; expires=" + date.toGMTString();
}

//function for check frre chat time cookie is exist for
//customer if not exist then redirect on performers list page
function checkFreeChatCookie(cookieName)
{
	var pageURL        = window.location.href;
	var urlLastSegment = pageURL.substr(pageURL.lastIndexOf('/') + 1);
	var urlArray       = urlLastSegment.split("?");

	//this function only work for nonlogin user dashboard page
	if(urlArray[0] == 'nonlogin-user-dashboard.html')
	{
		if(document.cookie.indexOf('freeChatCookie=') >= 0)
		{
			console.log('Still time is remain in cookie for free chat.');
		}
		else
		{
			window.location.href = 'domain-performer-list.html';
		}
	}
};

function popUpFunction(id)
{
	document.getElementById('subperformer_gallary_modal').style.display="block";
	document.getElementById("subperformer_gallary_img01").src = id.src;
}

//close modal
var gallary_img_popup_close = document.getElementsByClassName("subperformer_gallary_modal_close")[0];
if(typeof(gallary_img_popup_close) != "undefined")
{
	gallary_img_popup_close.onclick = function()
	{ 
		document.getElementById('subperformer_gallary_modal').style.display="none";
	}
}

function getSubPerformerEntireDetails()
{
   if(window.location.href.indexOf("UniqueId") > -1) 
	 {
	   var urlData = window.location.search.substr('?');
	   var startIndex = urlData.indexOf("=");
	   var selectPerformerUniqueId = urlData.substr(startIndex+1);

	   //now call ajax function to get customer details
		$.ajax({
			type: "POST",
			url : miricamServerUrl+'userApi/getPerformerEntireDetails',
			data: {'performerUniqueId':selectPerformerUniqueId},
			success : function (apiResponse)
			{
				if(apiResponse.status)
				{
				   var sliderContent = '';
				   if(apiResponse.performerImagesResult.length > 0)
				   { 
					var incrementVar = 1;
					apiResponse.performerImagesResult.forEach(function(value, key)
					{
						//update profile image
						if(value.performer_images_primary_id == apiResponse.data.performer_image)
						{
							$('#performer-image').attr('src', miricamServerUrl+value.performer_image_path);
						}

						//update gallery images for carousal
						if(value.performer_images_primary_id != apiResponse.data.performer_image && value.performer_images_primary_id != apiResponse.data.performer_photo_id)
						{
							if(incrementVar == 1)
								sliderContent += '<div class="item">';

							sliderContent += '<div class="col-sm-3"><a href="javascript:void(0);" class="thumbnail">\
							<img src="'+miricamServerUrl+value.performer_image_path+'" id= "thumbnail'+key+'" alt="Image" onclick="popUpFunction(thumbnail'+key+')" class="img-responsive" style="height:200px;"></a> </div>';

							incrementVar++;
							if(incrementVar > 4 || Object.is(apiResponse.performerImagesResult.length - 1, key))
							{
								sliderContent += '</div>';
								incrementVar = 1;
							}
						}
					});
					$('#performer-images').append(sliderContent);
					$('.item:first-child').addClass('active');

					//Social Media setup
					 if(apiResponse.data.performer_twitter_url != '' && apiResponse.data.performer_twitter_url != null)
					$('#subPerformertwitterURL').attr("href",apiResponse.data.performer_twitter_url)

					if(apiResponse.data.performer_email != ''&& apiResponse.data.performer_email != null)
						var perf_email = "mailto:"+ apiResponse.data.performer_email;
						$('#subPerformeremailURL').attr("href",perf_email);

					//performer description

					var performerDescription = '';

					if(apiResponse.data.performer_description != '' && apiResponse.data.performer_description != null)
					performerDescription += apiResponse.data.performer_description;

					 $('#performer-description').append(performerDescription); 
					 //performer-personal details

					 var performerContent = '';

					 if(apiResponse.data.performer_hair_color != '' && apiResponse.data.performer_hair_color != null)
					performerContent += '<div class="perf_pers_detls"><label>Hair : </label><strong>'+apiResponse.data.performer_hair_color+'</strong></div>';

					if(apiResponse.data.performer_eye_color != '' && apiResponse.data.performer_eye_color != null)
						performerContent += '<div class="perf_pers_detls"><label>Eyes : </label><strong>'+apiResponse.data.performer_eye_color+'</strong></div>';

					if(apiResponse.data.performer_body_type != '' && apiResponse.data.performer_body_type != null)
						performerContent += '<div class="perf_pers_detls"><label>Body-type : </label><strong>'+apiResponse.data.performer_body_type+'</strong></div>';

					if(apiResponse.data.performer_ethinicity != '' && apiResponse.data.performer_ethinicity != null)
						performerContent += '<div class="perf_pers_detls"><label>Ethinicity : </label><strong>'+apiResponse.data.performer_ethinicity+'</strong></div>';

					 if(apiResponse.data.performer_age != '' && apiResponse.data.performer_age != null)
						performerContent += '<div class="perf_pers_detls"><label>Age : </label><strong>'+apiResponse.data.performer_age+'</strong></span></div>';

					  if(apiResponse.data.performer_sex != '' && apiResponse.data.performer_sex != null)
						performerContent += '<div class="perf_pers_detls"><label>Sex : </label><strong>'+apiResponse.data.performer_sex+'</strong></div>';

					 $('#performer-personel-details').append(performerContent);
					 var performerUserName = '';
					 var performerUserName_stream = '';
					 var performerWelcomeMsg = '';

					 if(apiResponse.data.performer_username != '' && apiResponse.data.performer_username != null)
					 {
							performerUserName += ''+apiResponse.data.performer_username+':';
							performerUserName_stream = ''+apiResponse.data.performer_username+'';
					 }

					$('#performer-welcome-msg').append(performerWelcomeMsg);
					$('#performer-user-name').append(performerUserName);
					// if(document.getElementById("streamName"))
					// {
					// 	document.getElementById("streamName").value = performerUserName_stream;
					// }

					var performerUpSchedule ='';
					var performerScheduleList = [];

					if(apiResponse.data.performer_next_show_data != '' && apiResponse.data.performer_next_show_data != null)
					 performerScheduleList = JSON.parse(apiResponse.data.performer_next_show_data);

					 performerUpSchedule +='<table class="table table-striped"><thead><tr class="bg-primary">';
					 performerUpSchedule +='<!-- <th>Performer Time Zone</th> --> <th>Date</th><th>Start</th><th>End</th></thead></tr>';

						performerScheduleList.forEach(function(pvalue, pkey)
						{
						   performerUpSchedule += '<tr>';
						  apiResponse.timezone.forEach(function(nvalue, nkey)
							{
								if(pvalue.performer_time_zone != '')
									if(nvalue['timezone_id'] == pvalue.performer_time_zone)
								performerUpSchedule +='<!-- <td>'+nvalue["timezone_name"]+'</td> --> ';
							});

						  performerUpSchedule +='<td>'+pvalue.performer_show_date+'</td><td>'+pvalue.performer_show_start_time+'</td><td>'+pvalue.performer_show_end_time+'</td></tr>'
						});
					 $('#performer-schedule').append(performerUpSchedule);
				  }
			   }
			  }
			});
	   }
};

function getAllPerformerOfDomainOut()
{
	var performer_list  = [];
	var parentPerformerHostId = sessionStorage.getItem('performerUniqueHost');

	$.ajax({
		type: "POST",
		url : miricamServerUrl+'userApi/getAllPerformerOfDomain',
		data: {'parentPerformerHostId':parentPerformerHostId},
		success : function (apiResponse)
		{
			if(apiResponse.status)
			{
			   //remove all div inside it
			  $('#performerlist_li_out div').detach();
			   performer_list = apiResponse.data;
			   var panelBody = "";

			   if(performer_list.length > 0)
			   {
				 performer_list.forEach(function(value,key)
				 {
				  var performerPanelBody = '';

				  performerPanelBody += '<div class="col-12 col-sm-6 col-md-4 col-lg-2 px-25 performer-content">';

					if(performer_list[key].is_online === 1)
					{
						//performerPanelBody += '<div class="course-content bonline"><figure class="course-thumbnail "><a href ="nonlogin-sub-performer-details.html?UniqueId='+performer_list[key].performer_unique_id+'">';
						performerPanelBody += '<div class="course-content bonline"><figure class="course-thumbnail "><a href ="/members/'+performer_list[key].performer_username+'">';
					}
					else if(performer_list[key].is_online === 2)
					{
					  //performerPanelBody += '<div class="course-content bbusy" ><figure class="course-thumbnail "><a href ="nonlogin-sub-performer-details.html?UniqueId='+performer_list[key].performer_unique_id+'">';
					  performerPanelBody += '<div class="course-content bbusy" ><figure class="course-thumbnail "><a href ="/members/'+performer_list[key].performer_username+'">';
					}
					else
					{
					  //performerPanelBody += '<div class="course-content boffline"><figure class="course-thumbnail "><a href ="nonlogin-sub-performer-details.html?UniqueId='+performer_list[key].performer_unique_id+'">';
					  performerPanelBody += '<div class="course-content boffline"><figure class="course-thumbnail "><a href ="/members/'+performer_list[key].performer_username+'">';
					}

					if((performer_list[key].performer_image != null) && (performer_list[key].performer_image != ''))
					{
						var performerImageName = performer_list[key].performer_image_path;
						if(performerImageName.startsWith("http"))
						{
							performerPanelBody += '<img src="'+performer_list[key].performer_image_path+'"></img></a></figure>';
						}
						else
						{
							performerPanelBody += '<img src="'+ miricamServerUrl+''+performer_list[key].performer_image_path+'"></img></a></figure>';
						}
					}
					else
					{
						performerPanelBody += '<img src="images/no-image.jpg"></img></a></figure>';
					}

					performerPanelBody += '<div class= class="course-content-wrap"><header class="entry-header"><h2 class ="entry-title">';
					//performerPanelBody += '<a href="nonlogin-sub-performer-details.html?UniqueId='+performer_list[key].performer_unique_id+'" class ="text-capitalize">';
					performerPanelBody += '<a href="/members/'+performer_list[key].performer_username+'" class ="text-capitalize">';
					performerPanelBody +=  performer_list[key].performer_username;
					performerPanelBody += '</h2></a>';

					if(performer_list[key].is_online === 1)
					{
						performerPanelBody += '<h3 class="online">In Free Chat</h4>';
						performerPanelBody += '<div class="entry-meta flex align-items-center"><div class="course-author">';
						performerPanelBody += '<div class=" bottom-btn onlin"><a href ="/members/'+performer_list[key].performer_username+'">Chat With Me</a></div>';
					}
					else if (performer_list[key].is_online === 2)
					{
						performerPanelBody += '<h3 class="busy">In Private Chat</h4>';
						performerPanelBody += '<div class="entry-meta flex align-items-center"><div class="course-author">';
						performerPanelBody += '<div class=" bottom-btn bsy"><a href="user-login.html">Busy</a></div>';
					}
					else
					{
							if((performer_list[key].performer_next_show_data != null) && (performer_list[key].performer_next_show_data != ''))
							{
							  performerPanelBody += '<h3 class="offline">Back ';
								performerPanelBody +=  performer_list[key].performer_show_date ;
								performerPanelBody +=  ' @ ' ;
								performerPanelBody +=  performer_list[key].performer_show_start_time;
								performerPanelBody += '</h3>';
							}
							else
							{
							   performerPanelBody += '<h3 class="offline">';
								performerPanelBody +=  'Back Soon!' ;
								performerPanelBody += '</h3>';
							}
						performerPanelBody += '<div class="entry-meta flex align-items-center"><div class="course-author">';
						performerPanelBody += '<div class="bottom-btn offln">Offline</div>';
					}

						performerPanelBody += '</div></div></header></div></div></div></div>'; 
						$('#performerlist_li_out').append(performerPanelBody);    
				});
			   }
			   else
			   {
				var performerPanelBody = "";
				performerPanelBody += '<div class="col-12 col-md-12 col-lg-12 px-25 performer-content">';
				performerPanelBody += '<h2>No Performer has been registerd yet !</h2></div>';
				$('#performerlist_li_out').append(performerPanelBody);  
			   }
			}
		 }
		})
}

function getAllPerformerOfDomain()
{
	var performer_list  = [];
	var parentPerformerHostId = sessionStorage.getItem('performerUniqueHost');
	$.ajax({
		type: "POST",
		url : miricamServerUrl+'userApi/getAllPerformerOfDomain',
		data: {'parentPerformerHostId':parentPerformerHostId},
		success : function (apiResponse)
		{
			if(apiResponse.status)
			{
			   //remove all div inside it
			  $('#performerlist_li_in div').detach();
			   performer_list = apiResponse.data;
			   var panelBody = "";

			   if(performer_list.length > 0)
			   {
				 performer_list.forEach(function(value,key)
				 {
				  var performerPanelBody = '';

				  performerPanelBody += '<div class="col-12 col-sm-3 col-md-2 col-lg-2 px-25 performer-content">';

				  if(performer_list[key].is_online === 1)
					  {
						performerPanelBody += '<div class="course-content bonline"><figure class="course-thumbnail "><a href ="user-dashboard.html?UniqueId='+performer_list[key].performer_unique_id+'&uniquePerformerName='+performer_list[key].performer_username+'">';
					  }
					else if(performer_list[key].is_online === 2)
					{
					  performerPanelBody += '<div class="course-content bbusy" ><figure class="course-thumbnail "><a href ="user-dashboard.html?UniqueId='+performer_list[key].performer_unique_id+'&uniquePerformerName='+performer_list[key].performer_username+'">';
					}
					else
					{
					  //performerPanelBody += '<div class="course-content boffline"><figure class="course-thumbnail "><a href ="sub-performer-details.html?UniqueId='+performer_list[key].performer_unique_id+'">';
					  performerPanelBody += '<div class="course-content boffline"><figure class="course-thumbnail "><a href ="/members/'+performer_list[key].performer_username+'">';
					}

					if((performer_list[key].performer_image != null) && (performer_list[key].performer_image != ''))
					{
						var performerImageName = performer_list[key].performer_image_path;
						if(performerImageName.startsWith("http"))
						{
							performerPanelBody += '<img src="'+performer_list[key].performer_image_path+'"></img></a></figure>';
						}
						else
						{
							performerPanelBody += '<img src="'+ miricamServerUrl+''+performer_list[key].performer_image_path+'"></img></a></figure>';
						}
					}
					else
					{
						performerPanelBody += '<img src="images/no-image.jpg"></img></a></figure>';
					}

					performerPanelBody += '<div class= class="course-content-wrap"><header class="entry-header"><h2 class ="entry-title">';
					if(performer_list[key].is_online === 1 )
					  {
						performerPanelBody += '<a href="user-dashboard.html?UniqueId='+performer_list[key].performer_unique_id+'&uniquePerformerName='+performer_list[key].performer_username+'" class ="text-capitalize">';
					  }else if(performer_list[key].is_online === 2)
					  {
						performerPanelBody += '<a href="javascript:void(0);" class ="text-capitalize">';
					  }
					  else
					  {
						performerPanelBody += '<a href="/members/'+performer_list[key].performer_username+'" class ="text-capitalize">';
					  }
					performerPanelBody +=  performer_list[key].performer_username;
					performerPanelBody += '</h2></a>';

					if(performer_list[key].is_online === 1)
					  {
						performerPanelBody += '<h3 class="online">In Free Chat</h4>';
						performerPanelBody += '<div class="entry-meta flex align-items-center"><div class="course-author">';
						performerPanelBody += '<div class=" bottom-btn onlin"><a href ="user-dashboard.html?UniqueId='+performer_list[key].performer_unique_id+'&uniquePerformerName='+performer_list[key].performer_username+'">Chat With Me</a></div>';
					  }
					 else if (performer_list[key].is_online === 2)
					 {
						performerPanelBody += '<h3 class="busy">In Private Chat</h4>';
						performerPanelBody += '<div class="entry-meta flex align-items-center"><div class="course-author">';
						//performerPanelBody += '<div class=" bottom-btn bsy"><a href="user-dashboard.html?UniqueId='+performer_list[key].performer_unique_id+'">Busy</a></div>';
						performerPanelBody += '<div class=" bottom-btn bsy"><a href="javascript:void(0);">Busy</a></div>';
					 }
					 else
					 {
						 if((performer_list[key].performer_next_show_data != null) && (performer_list[key].performer_next_show_data != ''))
							{
							  performerPanelBody += '<h3 class="offline">Back ';
								performerPanelBody +=  performer_list[key].performer_show_date ;
								performerPanelBody +=  ' @ ' ;
								performerPanelBody +=  performer_list[key].performer_show_start_time;
								performerPanelBody += '</h3>';
							}
							else
							{
							   performerPanelBody += '<h3 class="offline">';
								performerPanelBody +=  'Back Soon!' ;
								performerPanelBody += '</h3>';
							}
						performerPanelBody += '<div class="entry-meta flex align-items-center"><div class="course-author">';
						performerPanelBody += '<div class="bottom-btn offln">Offline</div>';
					 }
					performerPanelBody += '</div></div></header></div></div></div></div>'; 
					$('#performerlist_li_in').append(performerPanelBody);
				  });
			   }
			   else
			   {
				var performerPanelBody = "";
				performerPanelBody += '<div class="col-12 col-md-12 col-lg-12 px-25 performer-content">';
				performerPanelBody += '<h2>No Performer has been registerd yet !</h2></div>';
				$('#performerlist_li_in').append(performerPanelBody);
			   }
			}
		 }
	})
}

//function for show pending Unblock Request ul onclick of
// pending Unblock  Request number in performer dashboard
function showPendingUnblockRequest()
{
	if($('#pendingunblockrequest_ul li').length > 0)
	{
		$('#pendingunblockrequest_ul').toggle();
	}
	else
	{
		swal({
			title: "",
			text : 'You have no pending unblock request right now.',
			icon : "warning",
			timer: 3000
		});
	}
}

//function for unblock peding unblock user
function performerPendingUnblockUser(customerId)
{
	$.ajax({
		type: "POST",
		url : miricamServerUrl+'userApi/performerPendingUnblockUser',
		data: {LoginPerformerUniqueId:sessionStorage.getItem('LoginPerformerUniqueId'), customerId:customerId},
		success : function (apiResponse)
		{
			if(apiResponse.status)
			{
				swal({
					title: "",
					text : apiResponse.message,
					icon : "success",
					timer: 3000
				});
			}
		}
	});
}

//funtion for send pending unblock request for block me
function userPendingRequestUnblock()
{
	/*New logic : we already saved data for blocked in table.
	* now we needs to update those record into table that
	* user sent unblock request, and again he can not sent
	*/
	var selectPerformerUniqueId = '';
	if(window.location.href.indexOf("UniqueId") > -1)
	{
		var urlData             = window.location.search.substr('?');
		var startIndex          = urlData.indexOf("=");
		selectPerformerUniqueId = urlData.substr(startIndex+1);
	}

	$.ajax({
		type: "POST",
		url : miricamServerUrl+'userApi/userPendingRequestUnblock',
		data: {selectPerformerUniqueId:selectPerformerUniqueId,loginCustomerId:sessionStorage.getItem('LoginCustomerPrimaryId')},
		success : function (apiResponse)
		{
			console.log(apiResponse);
		}
	});
}

//function for ser wordpress siteurl on 
//sub performer signup page because we 
//are making this url dynamic for all site.
function setWordpressSiteUrl()
{
	setTimeout(function()
	{
		if(sessionStorage.getItem('wordpressSiteUrl'))
		{
			$('#wordpress_site_url').val(sessionStorage.getItem('wordpressSiteUrl'));
		}
	}, 4000);
}

//function for ser redirect siteurl on 
//sub performer signup page because we 
//are making this url dynamic for all site.
function setRedirectUrl()
{
	$('#redirect_site_url').val(sessionStorage.getItem('serverUrl'));
}

//function for get performer private gallery settings if exist
//and show on page where performer can edit this
function getPerformerPrivateGallerySettings()
{
	if(window.location.href.indexOf("UniqueId") > -1) 
	{
		var urlData = window.location.search.substr('?');
		var startIndex = urlData.indexOf("=");
		var selectPerformerUniqueId = urlData.substr(startIndex+1);

		//now call ajax function to get performer controls
		$.ajax({
			type: "POST",
			url : miricamServerUrl+'userApi/getPerformerPrivateGallerySettings',
			data: {'performerUniqueId':selectPerformerUniqueId, 'callingSide':'customer'},
			success : function (apiResponse)
			{
				if(apiResponse.status)
				{
					//convert json into json object
					var jsonVariables = $.parseJSON(apiResponse.data);

					//set default private content settings price
					$('#privateGalleryPrice').val(parseFloat(jsonVariables.privateGalleryPrice).toFixed(2));
					sessionStorage.setItem('privateGalleryPrice', parseFloat(jsonVariables.privateGalleryPrice).toFixed(2));
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
	}
	else
	{
		//now call ajax function to get performer private gellery settings
		$.ajax({
			type: "POST",
			url : miricamServerUrl+'userApi/getPerformerPrivateGallerySettings',
			data: {'performerUniqueId':performerUniqueId, callingSide:'performer'},
			success : function (apiResponse)
			{
				if(apiResponse.status)
				{
					//convert json into json object
					var jsonVariables = $.parseJSON(apiResponse.data);

					//set default private content settings price
					$('#privateGalleryPrice').val(parseFloat(jsonVariables.privateGalleryPrice).toFixed(2));
					sessionStorage.setItem('privateGalleryPrice', parseFloat(jsonVariables.privateGalleryPrice).toFixed(2));
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
	}
}

//function for logout a performer/customer from system
//when user redirected from WP site
function logoutFromRedirect()
{
	$.LoadingOverlay("show");

	//removing saved data from sessionstorage
	//get session storage that performer pressed logout
	var isPerformerLoggedIn = sessionStorage.getItem('LoginPerformerPrimaryId');
	var isSubPerformerLoggedIn = sessionStorage.getItem('LoginPerformerParentPerformerId');

	if(isPerformerLoggedIn)
	{
		//if performer pressed logout then set is_online=0 in DB
		setPerformerOnlineStatus('logout');

		//logs the performer's signout activity 
		setPerformerSignOutActivity();

		//clear room entry from performer-group-chat table 
		clearPerformerGroupChatRoom();
	}

	//get session storage that customer pressed logout
	var isCustomerExist = sessionStorage.getItem('isCustomerExist');
	if(isCustomerExist)
	{
		//if performer pressed logout then his today's
		//all private chat requests are deleted from DB
		if(window.location.href.indexOf("UniqueId") > -1)
		{
			var urlData = window.location.search.substr('?');
			var startIndex = urlData.indexOf("=");
			var selectPerformerUniqueId = urlData.substr(startIndex+1);
			deletePrivateChatRequests(sessionStorage.getItem('LoginCustomerPrimaryId'), selectPerformerUniqueId);
		}
		else
		{
			deletePrivateChatRequests(sessionStorage.getItem('LoginCustomerPrimaryId'), performerUniqueId);
		}
	}

	//remove customer info
	sessionStorage.removeItem('isUserLoggedIn');
	sessionStorage.removeItem('LoginCustomerPrimaryId');
	sessionStorage.removeItem('LoginCustomerId');
	sessionStorage.removeItem('LoginCustomerUniqueId');

	//remove performer info
	sessionStorage.removeItem('isUserLoggedIn');
	sessionStorage.removeItem('LoginPerformerPrimaryId');
	sessionStorage.removeItem('LoginPerformerId');
	sessionStorage.removeItem('LoginPerformerUniqueId');

	//clear all sessionStorage and localstorage
	sessionStorage.clear();
	localStorage.clear();

	//redirect user on home page
	setTimeout(function()
	{
		if(isPerformerLoggedIn)
		{
			if(isSubPerformerLoggedIn != 0)
			{
				window.location.href = serverUrl+'sub-performer-login.html';
			}
			else
			{
				window.location.href = serverUrl+'performer-login.html'; 
			}
		}
		else
		{
			window.location.href = serverUrl+'user-login.html';
		}
	}, 3000);
}

//function for get all subscription list
//get all performers list which is subscribed by a user
function getAllSubscriptionList()
{
	$.ajax({
			type: "POST",
			url : miricamServerUrl+'userApi/getAllSubscriptionList',
			data: {'customerPrimaryId':sessionStorage.getItem('LoginCustomerPrimaryId')},
			success : function (apiResponse)
			{
				performer_list = apiResponse.data;
				var performerPanelBody = '';
				var totalBalance = 0;
				
				//creating table head
				performerPanelBody += '<table class="table table-striped">';
				performerPanelBody += '<thead><tr><th>Date</th><th>Code</th><th>Description</th><th>Credit</th><th>Debit</th><th>Balance</th><th>Action</th></tr></thead>';
				performerPanelBody += '<tbody>';

				if(apiResponse.status)
				{
					console.log(apiResponse);
					performer_list.forEach(function(value, key)
					{
						performerPanelBody += '<tr>';
						performerPanelBody += '<td>'+ value.created_date +'</td>';

						if(value.amountInfo == 'amountCredited')
						{
							performerPanelBody += '<td>440</td>';
						}
						else if(value.amountInfo == 'subscriptionAmountDebited')
						{
							performerPanelBody += '<td>310</td>';
						}
						else if(value.amountInfo == 'tipPcAmountDebited')
						{
							performerPanelBody += '<td>320</td>';
						}
						
						var descriptionText = '';
						if(value.amountInfo == 'amountCredited')
						{
							descriptionText = 'Funds Added (Transaction Id : ';
							descriptionText += value.transaction_id;
							descriptionText += ')';
						}
						else if(value.amountInfo == 'subscriptionAmountDebited')
						{
							descriptionText = 'Subscribed to ';
							descriptionText += value.performer_username;
							descriptionText += ' Recurring Monthly';
						}
						else if(value.amountInfo == 'tipPcAmountDebited')
						{
							//condition for tip amount
							if(value.fund_type == 1)
							{
								descriptionText = 'Tips to ';
								descriptionText += value.performer_username;
							}
							
							//condition for private chat
							if(value.fund_type == 2)
							{
								descriptionText = 'Private Chat with ';
								descriptionText += value.performer_username;   
							}
						}
						performerPanelBody += '<td>'+descriptionText+'</td>';
						
					   
						//if(typeof value.purchase_amount !== 'undefined')
						//condition for credit column
						if(value.amountInfo == 'amountCredited')
						{
							performerPanelBody += '<td style="color:green;">$'+parseFloat(value.purchase_amount).toFixed(2)+'</td>';
							totalBalance = parseFloat(totalBalance) + parseFloat(value.purchase_amount);
						}
						else
						{
							performerPanelBody += '<td>--</td>';
						}

						//condition for credit column
						if(value.amountInfo == 'subscriptionAmountDebited')
						{
							performerPanelBody += '<td style="color:red;">(-$'+ parseFloat(value.subscription_amount).toFixed(2) +')</td>';
							totalBalance = parseFloat(totalBalance) - parseFloat(value.subscription_amount);
						}
						else if(value.amountInfo == 'tipPcAmountDebited')
						{
							performerPanelBody += '<td style="color:red;">(-$'+ parseFloat(value.total_tip_amount).toFixed(2) +')</td>';
							totalBalance = parseFloat(totalBalance) - parseFloat(value.total_tip_amount);
						}
						else
						{
							performerPanelBody += '<td>--</td>';
						}

						performerPanelBody += '<td>$'+parseFloat(totalBalance).toFixed(2)+'</td>';
						
						if(value.amountInfo == 'subscriptionAmountDebited')
						{
							performerPanelBody += '<td><a href="javascript:void(0)">Unsubscribe</a></td>';
						}
						else
						{
							performerPanelBody += '<td>&nbsp;</td>';
						}
						performerPanelBody += '</tr>';
					});
					performerPanelBody += '<tr><td colspan="4"></td><td>Balance :</td><td>$'+parseFloat(totalBalance).toFixed(2)+'</td><td><a href="javascript:void(0)">Add More</a></td></tr>';
					performerPanelBody += '</tbody>';
					performerPanelBody += '</table>';
				}
				else
				{
					performerPanelBody += '<tr>';
					performerPanelBody += '<td colspan="7" style="text-align:center;">'+ apiResponse.message +'</td>';
					performerPanelBody += '</tr>';
				}

				$('#subscriptionlist_table').append(performerPanelBody);
			}
	});
}

//function for get url parameter using param name
function getUrlParamUsingName(paramName)
{
	paramName = paramName.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
	var regex = new RegExp('[\\?&]' + paramName + '=([^&#]*)');
	var results = regex.exec(location.search);
	return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};

//function for get customer's full details from chat pages
function getCustomerFullDetailsFromChat()
{
	var selectPerformerUniqueId = getUrlParamUsingName('UniqueId')
   	if(selectPerformerUniqueId != '')
	{
	   //set Ecom_UserData_PerformerUniqueId on user-purchase-time page
	   if($('#Ecom_UserData_PerformerUniqueId').length)
			$('#Ecom_UserData_PerformerUniqueId').val(selectPerformerUniqueId)

		//now call ajax function to get customer details
		$.ajax({
			type: "POST",
			url : miricamServerUrl+'userApi/getCustomerFullDetails',
			data: {'performerUniqueId':selectPerformerUniqueId, 'customerPrimaryId':sessionStorage.getItem('LoginCustomerPrimaryId')},
			success : function (apiResponse)
			{
				//now set total_amount in sessionstorage and show the customer
				//we will also set other data if required
				if(apiResponse.data.total_amount==null)
					apiResponse.data.total_amount = 0;

				sessionStorage.setItem('customerTotalAmount', parseFloat(apiResponse.data.total_amount).toFixed(2));
				$('#customerTotalAmount').html(parseFloat(apiResponse.data.total_amount).toFixed(2));

				if(apiResponse.data.performer_todays_topic != '' && apiResponse.data.performer_todays_topic != null)
					$('#topic-div').html('').html(apiResponse.data.performer_todays_topic).hide();
				else
					$('#topic-div').html('').hide();
			}
		});
	}
	else 
	{
		//set Ecom_UserData_PerformerUniqueId on user-purchase-time page
		if($('#Ecom_UserData_PerformerUniqueId').length)
			$('#Ecom_UserData_PerformerUniqueId').val(performerUniqueId)

		//now call ajax function to get customer details
		$.ajax({
			type: "POST",
			url : miricamServerUrl+'userApi/getCustomerFullDetails',
			data: {'performerUniqueId':performerUniqueId, 'customerPrimaryId':sessionStorage.getItem('LoginCustomerPrimaryId')},
			success : function (apiResponse)
			{
				//now set total_amount in sessionstorage and show the customer
				//we will also set other data if required
				if(apiResponse.data.total_amount==null)
					apiResponse.data.total_amount = 0;

				sessionStorage.setItem('customerTotalAmount', parseFloat(apiResponse.data.total_amount).toFixed(2));
				$('#customerTotalAmount').html(parseFloat(apiResponse.data.total_amount).toFixed(2));

				if(apiResponse.data.performer_todays_topic != '' && apiResponse.data.performer_todays_topic != null)
					$('#topic-div').html('').html(apiResponse.data.performer_todays_topic).hide();
				else
					$('#topic-div').html('').hide();
			}
		});
  	}
}