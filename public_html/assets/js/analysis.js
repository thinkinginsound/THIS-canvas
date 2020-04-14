$(function() {
  window.socket = io("/analysis"); // start connection with server via socket.io
  socket.on("getlist", function(result){
    console.log("getlist", result);
  });
});
