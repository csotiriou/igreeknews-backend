/**
 * Created by soulstorm on 13/06/15.
 */

var Twit = require('twit');
var _ = require('lodash');
var mongoose = require('mongoose');
var mongooseQ = require('mongoose-q')(mongoose);
var Tweet = mongoose.model('Tweet');
var TwitterUserModel = mongoose.model('TwitterUser');
var async = require('async');
var HashTag = mongoose.model('HashTag');
var SharedMedia = mongoose.model('SharedMedia');

module.exports = function(){

    var TStream;

    //get these from the twitter streaming API
    var TwitterGlobals = {
            consumerKey : "-------------",
            consumerSecret : "-------------",
            accessToken : "-------------",
            accessTokenSecret : "-------------",
            accessOwner : "-------------",
            accessOwnerID : "-------------"
        };

    var TwitterInitializationOptions = {
        language : ['el']
    };



    var TwitterUser = function(streamUser){
        this.userId = streamUser.id;
        this.name = streamUser.name;
        this.screenName = streamUser.screen_name;
        this.url = streamUser.url;
        this.language = streamUser.lang;
        this.profileImageUrl = streamUser.profile_image_url;
        this.profileImageUrlHttps = streamUser.profile_image_url_https;

        return this;
    };

    /**
     *
     * @param streamTweet
     * @constructor
     */
    var TweetObject = function(streamTweet){

        this.text = streamTweet.text;
        this.photos = _.chain(streamTweet.entities.media).where({type : 'photo'}).pluck('media_url').value();
        this.urls = _.pluck(streamTweet.entities.urls, 'expanded_url');
        this.videos = _.chain(streamTweet.entities.media).where({type : 'video'}).value();
        this.language = streamTweet.lang;
        this.tweetId = streamTweet.id;
        this.tweetIdStr = streamTweet.id_str;
        this.userIdStr = streamTweet.user.id_str;
        this.userScreenName = streamTweet.user.screen_name;
        this.timestamp = new Date(parseFloat(streamTweet.timestamp_ms));
        this.hashtags = _.pluck(streamTweet.entities.hashtags,'text');

        this.user = new TwitterUser(streamTweet.user);

        return this;
    };

    var tParams  = {
        batchSize : 1
    };

    var T = new Twit({
        consumer_key : TwitterGlobals.consumerKey,
        consumer_secret : TwitterGlobals.consumerSecret,
        access_token : TwitterGlobals.accessToken,
        access_token_secret : TwitterGlobals.accessTokenSecret
    });


    var initializeTwitter = function(){
        console.log('initializing twitter stream...');
        console.log(TwitterGlobals);
        var twitterStream = T.stream('statuses/sample', TwitterInitializationOptions);



        var latestTweets = [];

        var processTweetForSharedMedia = function(tweet){
            var hashtags = _.pluck(tweet.entities.hashtags, 'text');
            var currentDate = new Date();

            if (hashtags.length > 0){
                async.eachLimit(hashtags, 1, function (tag, endAsyncCallback){
                    console.log('saving hashtag: ' + tag);

                    //increase the number of hashtags count by 1
                    HashTag.findOneAndUpdate({text : tag}, {$inc : { count : 1 }, lastAccessDate : currentDate}, {upsert : true, new : true}, function(err, updatedObject){
                        console.log("updated hashtag: " + JSON.stringify(updatedObject));
                        endAsyncCallback();
                    });

                }, function(err){
                    console.error(err);
                });
            }else {
                console.log('no hashtags found in tweet : ' + tweet.id_str);
            }

            if (tweet.entities.media && tweet.entities.media.length > 0){
                async.eachLimit(tweet.entities.media, 1, function(tweetMedia, endAsyncCallback){
                    console.log('saving tweet media: ' + tweetMedia);
                    var sharedUrl = tweetMedia.url;
                    var type = tweetMedia.type;
                    var hashTags = tweetMedia.hashTags? _.pluck(tweetMedia.hashTags, 'text') : [];
                    var mediaUrl = tweetMedia.media_url;
                    var mediaUrlHTTPs = tweetMedia.media_url_https;

                    var mediaPropertiesToUpdate = {
                        $inc : { count : 1},
                        $push : {tweetIds : tweet.id_str},
                        url : sharedUrl,
                        mediaUrl : mediaUrl,
                        urlHttps : mediaUrlHTTPs,
                        hashtags : hashTags,
                        type : type,
                        lastAccessDate : currentDate
                    };

                    SharedMedia.findOneAndUpdate({url : tweetMedia.url}, mediaPropertiesToUpdate, {upsert : true, new : true}, function(err, updatedObject){
                        console.log("updated shared media: " + JSON.stringify(updatedObject));
                        endAsyncCallback();
                    });

                });
            }else {
                console.log('no media found in tweet : ' + tweet.id_str);
            }




        };

        function appendTweet(tweetObject){
            latestTweets.push(tweetObject);
            if (latestTweets.length > tParams.batchSize){
                console.log('saving tweets to the database...');
                var tempTweetsArray = latestTweets; //keep temp
                latestTweets = [];

                async.each(tempTweetsArray, function(twitterStreamItem, callback){
                    //console.log('saving...' + twitterStreamItem.text);

                    TwitterUserModel.findOneAndUpdate({userId : twitterStreamItem.user.userId}, twitterStreamItem.user,  {upsert : true, new: true}, function(err, insertedUser){

                        var newT = new Tweet();
                        delete twitterStreamItem['user']; //avoid unnecessary overlap todo:revisit

                        _.extend(newT, twitterStreamItem);
                        newT.user = insertedUser;

                        newT.saveQ().then(function(newTweet){
                            //console.log(newTweet);
                        }).catch(function(error){
                            console.log(error);
                        }).finally(function(){
                            callback();
                        });
                    });

                }, function(err){
                    if (err){
                        console.log('an error happened while saving the tweets');
                        console.log(err);
                    }else{
                        //console.log('all items have finished saving successfully');
                    }
                });
            }
        }

        twitterStream.on('tweet', function (tweet) {
            if (!tweet.possibly_sensitive){
                processTweetForSharedMedia(tweet);
                var newTweetObject = new TweetObject(tweet);
                appendTweet(newTweetObject);
            }
        });


        twitterStream.on('error', function(error){
            console.log('error in twitter stream initialization');
            console.log(error);
        });
    };

    var initTwitterOnce = _.once(initializeTwitter);
    initTwitterOnce();

    return TStream;
};
