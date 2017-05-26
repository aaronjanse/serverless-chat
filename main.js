var peer = null
var ip = null
var name = "dummy"

var conn = null

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
	my_id = ip.split('.')[2] + '.' + ip.split('.')[3]

	peer = new Peer(my_id.replace('.', 'x'), {
		key: 'k21h7zsvzls4te29'
	});

	peer.on('connection', function (conn) {
		conn.on('data', function (data) {
			// Will print 'hi!'
			console.log(data);

			$('#chat-output').html($('#chat-output').text() + '\n<b>' + data.replace(/</g, '&lt;') + '</b>')
		});
	});

	alert("Your id: " + my_id)

	other_id = prompt("Other id: ").replace('.', 'x')

	conn = peer.connect(other_id)
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
		$('#chat-output').text($('#chat-output').text() + '\n' + name + '> ' + text)
	}
}

if (window.addEventListener) window.addEventListener("load", autorun, false);
else if (window.attachEvent) window.attachEvent("onload", autorun);
else window.onload = autorun;
