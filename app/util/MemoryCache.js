'use strict';

/**
 * Module dependencies.
 */

var Memcached = require('memcached');
var memcached = new Memcached('127.0.0.1:11211', {retries:10,retry:1000});



exports.storeValue = function(key, value, ttl, callback){
    console.log("setting value for key: " + key);

    memcached.set( key, value, ttl, function( err, result ){
        memcached.end(); // as we are 100% certain we are not going to use the connection again, we are going to end it
        callback(err, result);
    });
};

