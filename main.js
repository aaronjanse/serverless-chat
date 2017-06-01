var peer = null
var ip = null
var name = "dummy"

var id_prefix = 'serverlesschat'

var conn = null

Base64 = (function () {
	var digitsStr =
		//   0       8       16      24      32      40      48      56     63
		//   v       v       v       v       v       v       v       v      v
		"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz+-";
	var digits = digitsStr.split('');
	var digitsMap = {};
	for (var i = 0; i < digits.length; i++) {
		digitsMap[digits[i]] = i;
	}
	return {
		fromInt: function (int32) {
			var result = '';
			while (true) {
				result = digits[int32 & 0x3f] + result;
				int32 >>>= 6;
				if (int32 === 0)
					break;
			}
			return result;
		},
		toInt: function (digitsStr) {
			var result = 0;
			var digits = digitsStr.split('');
			for (var i = 0; i < digits.length; i++) {
				result = (result << 6) + digitsMap[digits[i]];
			}
			return result;
		}
	};
})();

window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection; //compatibility for firefox and chrome
var pc = new RTCPeerConnection({
		iceServers: []
	}),
	noop = function () {};
pc.createDataChannel(""); //create a bogus data channel
pc.createOffer(pc.setLocalDescription.bind(pc), noop); // create offer and set local description
pc.onicecandidate = function (ice) { //listen for candidate events
	if (!ice || !ice.candidate || !ice.candidate.candidate) return;
	var myIP = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/.exec(ice.candidate.candidate)[1];

	ip = myIP
	pc.onicecandidate = noop;
};

var check_interval = null

function autorun() {
	check_interval = setInterval(check_if_ip_ready, 100)
}

function check_if_ip_ready() {
	if (ip != null) {
		clearInterval(check_interval)

		connect()
	}
}

function connect() {
	my_id = parseInt(ip.split('.')[2]) * 256 + parseInt(ip.split('.')[3])
	my_id = Base64.fromInt(my_id)

	peer = new Peer(id_prefix + my_id, {
		key: 'k21h7zsvzls4te29'
	});

	peer.on('connection', function (conn) {
		conn.on('data', function (data) {
			// Will print 'hi!'
			console.log(data);

			$('#chat-output').html($('#chat-output').html() + '\n<b>' + data.replace(/</g, '&lt;') + '</b>')
		});
	});

	alert("Your id: " + my_id)

	other_id = prompt("Other id: ")

	conn = peer.connect(id_prefix + other_id)
	conn.on('open', function () {
		console.log('connection opened!')
		conn.send("\'" + name + "\'" + " joined!");
	});

	name = prompt("What is your display name?")

	$('#input-chat-box').keydown(function (e) {
		if (e.keyCode == 13) {
			send_message()
		}
	})

	$('#send-chat-button').click(function () {
		send_message()
	})
}

function send_message() {
	var text = $.trim($('#input-chat-box').val())
	$('#input-chat-box').val('')
	if (text != '' && conn != null && conn.open) {
		conn.send(name + '> ' + text)
		$('#chat-output').html($('#chat-output').html() + '\n' + name + '> ' + text)
	}
}

function append_display_text(text, bold = false) {
	var clean_text = text.replace('<', '&lt').replace('>', '&gt')
	if (bold) {
		// $("#chat-list-group").append("<li class='list-group-item chat-message'><b>" + clean_text + "</b></li>");
		$("#chat-list-group").append("<li class='list-group-item chat-message-strong'>" + clean_text + "</li>");
	} else {
		$("#chat-list-group").append("<li class='list-group-item chat-message'>" + text.replace('<', '&lt') + "</li>");
	}
}

if (window.addEventListener) window.addEventListener("load", autorun, false);
else if (window.attachEvent) window.attachEvent("onload", autorun);
else window.onload = autorun;
