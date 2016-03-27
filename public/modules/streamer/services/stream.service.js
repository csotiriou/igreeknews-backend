/**
 * Created by soulstorm on 5/25/15.
 */
'use strict';

var streamer = angular.module('streamer');

// Users service used for communicating with the users REST endpoint
streamer.factory('socket', function($rootScope) {
    var socket = null;

    function connectToService(){
        if (!socket){
            console.log('connecting to service...');
            socket = io.connect('localhost:3000', {path : '/api/v1/stream'});
            socket.nsp = '/twitter';
        }
    }
    return {
        disconnect : function(){
            if (socket){
                socket.disconnect(true);
                socket = null; //garbage collect it
            }
        },
        connect : function(){
            connectToService();
        },
        on: function (eventName, callback) {
            socket.on(eventName, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    callback.apply(socket, args);
                });
            });
        },
        emit: function (eventName, data, callback) {
            socket.emit(eventName, data, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    if (callback) {
                        callback.apply(socket, args);
                    }
                });
            })
        }
    };
});
