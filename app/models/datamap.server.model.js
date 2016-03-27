'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Article Schema
 */
var Datamap = new Schema({
    createdAt: {
		type: Date,
		default: Date.now,
        required : 'Date created cannot be blank'
	},
	hostNames : {
        type : [String]
    },
	version : {
		type : Number,
		default : 1
	}
});



mongoose.model('Datamap', Datamap);
exports.Datamap = Datamap;

