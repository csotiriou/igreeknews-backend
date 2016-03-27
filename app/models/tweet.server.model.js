'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var TwitterUserSchema = new Schema({
    userId: {
        type: Number,
        required: 'User ID should not be null',
        index : true
    },
    name: {
        type: String,
        required: 'User name should not be null',
        default: null
    },
    screenName: {
        type: String,
        required: 'User screen name should not be null',
        default: null
    },
    url: {
        type: String,
        required: false,
        default: null
    },
    language: {
        type: String,
        index : true
    },
    profileImageUrl: {
        type: String
    },
    profileImageUrlHttps: {
        type: String
    }
}, {autoIndex : true});

mongoose.model('TwitterUser', TwitterUserSchema);


/**
 * Article Schema
 */
var TweetSchema = new Schema({
	text: {
		type: String,
		default: '',
		trim: true,
		required: 'Title cannot be blank'
	},
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'TwitterUser'
    },
    urls : {
        type : [String],
        default: []
    },
    photos : {
        type : [String],
        default: []
    },
    videos : {
        type : [String],
        default: []
    },
    hashtags : {
        type : [String],
        default : []
    },
    language : {
        type : String,
        default : 'el',
        trim : true
    },
    tweetId : {
        type : String,
        required : 'tweetId cannot be blank',
        trim : true
    },
    tweetIdStr : {
        type : String,
        required : 'tweetIdStr cannot be blank',
        trim : true
    },
    timestamp : {
        type : Date,
        required : 'Date cannot be blank',
        default : Date.now(),
        index : true
    }

});



var SharedMediaSchema = new Schema({
    type : {
        type : String,
        required : 'media type cannot be blank'
    },
    url : {
        type : String,
        required : 'url of shared item must be present',
        index : true
    },
    mediaUrl : {
        type : String,
        required : 'media url of shared item must be present'
    },
    urlHttps : {
        type : String
    },
    tweetIds : {
        type : [String],
        default : []
    },
    hashtags : {
        type : [String],
        default: []
    },
    count: {
        type : Number,
        default : 0
    },
    lastAccessDate : {
        type : Date,
        default : Date.now
    }
}, {autoIndex: true});

var HashTagSchema = new Schema({
    text : {
        type : String,
        required: 'hashtag text cannot be null'
    },
    count : {
        type : Number,
        default : 0
    },
    lastAccessDate : {
        type : Date,
        default : Date.now
    }
});


var toJSONOptions = {
    transform : function(doc, ret, options){
        ret.id = ret._id;
        ret.created = ret._id.getTimestamp();
        delete ret._id;
        delete ret.__v;
        return ret;
    }
};

TweetSchema.options.toJSON = toJSONOptions;
SharedMediaSchema.options.toJSON = toJSONOptions;
HashTagSchema.options.toJSON = toJSONOptions;

mongoose.model('Tweet', TweetSchema);
mongoose.model('SharedMedia', SharedMediaSchema);
mongoose.model('HashTag', HashTagSchema);

exports.ArticleSchema = TweetSchema;
exports.SharedMediaSchema = SharedMediaSchema;

//exports.TwitterUserSchema = TwitterUserSchema;
