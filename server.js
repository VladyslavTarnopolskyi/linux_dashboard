'use strict';

var express = require('express');
var socketio = require('socket.io');
var osmod = require('os');
var si = require('systeminformation');

var server = express();
server.use('/', express.static(__dirname + '/'));
var io = socketio(server.listen(process.env.PORT || 8080));


var cpu, os, user = 0;
var clients = 0;
si.cpu()
    .then(function (cpuData) {
    cpu = cpuData;
});

si.osInfo()
    .then(function(osData) {
        os = osData
    });

var userName, userTime = 0;
si.users()
    .then(function(userData){
        userName = userData[0].user;
        userTime = userData[0].time;
    });

io.on('connection', function(socket) {
    ++clients;
    socket.emit('onConnection', {
        osInfo: os,
        cpuInfo: cpu,
        userInfo: userName,
        userLogin: userTime
    });
});

(function heartbeat() {
    var dynamic = {}, ready = 0;
    if (clients <= 0) {
        setTimeout(heartbeat, 1000);
        return;
    }

    dynamic['currTime'] = si.time().current;
    dynamic['uptime'] = si.time().uptime;
    dynamic['os'] = osmod.loadavg();

    si.cpuCurrentspeed().then(function(cpuSpeed){
        dynamic['cpuSpeed'] = cpuSpeed;
        send();
    });

    si.mem().then(function(mem){
        dynamic['mem'] = mem;
        send();
    });

    si.fsSize().then(function(fsSize){
        dynamic['fsSize'] = fsSize;
        send();
    });

    si.processes().then(function(processes){
        dynamic['proc'] = processes;
        send();
    });
    function send() {
        if (++ready < 4) {
            return;
        }
        io.emit('heartbeat', dynamic);
        setTimeout(heartbeat, 3000);
    }
})();


io.on('disconnect', function() {
    --clients;
});
