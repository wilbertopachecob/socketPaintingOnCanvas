const express = require('express'),
    morgan = require('morgan'),
    path = require('path'),
    http = require('http'), 
    socketIO = require('socket.io'),
    //Initialization
    app = express(),
    server = http.createServer(app),
    io = socketIO(server);

app.set('port', process.env.PORT || 3000);
//Middlewares
app.use(morgan('dev'));
//Sockets
require('./socket')(io);
//Static files
app.use(express.static(path.join(__dirname, 'public')));
//Server
server.listen(app.get('port'), function () {
    console.log('Node Server running on port: ', app.get('port'));
});
