$(function() {
  window.socket = io("/analysis"); // start connection with server via socket.io
  window.socket.emit('getdata', function (userdata, sessions) {
    console.log('getdata', userdata, sessions);
  });
});
