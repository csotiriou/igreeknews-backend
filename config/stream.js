/**
 * Created by soulstorm on 5/23/15.
 */

'use strict';


var app = require('express')();
var http = require('http');
var socketio = require('socket.io');
var _ = require('lodash');
var path = require('path');
var glob = require('glob');



/**
 * Get files by glob patterns
 */
var getGlobbedPaths = function(globPatterns, excludes) {
    // URL paths regex
    var urlRegex = new RegExp('^(?:[a-z]+:)?\/\/', 'i');

    // The output array
    var output = [];

    // If glob pattern is array so we use each pattern in a recursive way, otherwise we use glob
    if (_.isArray(globPatterns)) {
        globPatterns.forEach(function(globPattern) {
            output = _.union(output, getGlobbedPaths(globPattern, excludes));
        });
    } else if (_.isString(globPatterns)) {
        if (urlRegex.test(globPatterns)) {
            output.push(globPatterns);
        } else {
            var files = glob.sync(globPatterns);
            if (excludes) {
                files = files.map(function(file) {
                    if (_.isArray(excludes)) {
                        for (var i in excludes) {
                            file = file.replace(excludes[i], '');
                        }
                    } else {
                        file = file.replace(excludes, '');
                    }
                    return file;
                });
            }
            output = _.union(output, files);
        }
    }

    return output;
};



module.exports = function(app, db){
    console.log('creating io...');

    var server = http.createServer(app);
    var io = new socketio(server, {path : '/api/v1/stream'});


    var socketsFiles =  'app/sockets/*.js';
    var allSocketfiles = getGlobbedPaths(path.join(process.cwd(), socketsFiles));

    console.log('all socket files :' + allSocketfiles);


    io.on('connection', function(socket){
        console.log('client connected');
        socket.emit("global namespace welcome", "welcome");

        _.each(allSocketfiles, function(socketFile){
            console.log('loading script path: ' + socketFile);
            require(path.resolve(socketFile))(io, socket);
        });
    });

    console.log("initializing...");

    return server;
};