/**
 * Created by soulstorm on 5/31/15.
 */

var Twit = require('twit');
var _ = require('lodash');

var TwitterGlobals = {
    consumerKey : "V3tNrxXyB9ToimGaTd48lU2SE",
    consumerSecret : "QwWBcLugSPg1neKIPY8erN7VdKQdNtBTyVwsDz2huE1WTHA3Ed",
    accessToken : "87820706-6AgLVhUi39QGPw2rBodOLXple7CBcq2yLJhJd4e4Q",
    accessTokenSecret : "nyKJO4ZbBOBcNJikOygxtdWZYQFSYUnIG2qrYqlW0Xrws",
    accessOwner : "oramind",
    accessOwnerID : "87820706",

    initialized: false
};

var initializeTwitter = _.once(function(io){
    console.log('initializing twitter...');
    var T = new Twit({
        consumer_key : TwitterGlobals.consumerKey,
        consumer_secret : TwitterGlobals.consumerSecret,
        access_token : TwitterGlobals.accessToken,
        access_token_secret : TwitterGlobals.accessTokenSecret
    });

    var increaseCount = function (dict, value) {
        var currentCount = dict[value] ? dict[value] : 0;
        dict[value] = currentCount + 1;
    };

    var twitterStream = T.stream('statuses/sample', { language : 'el,gr' });

    twitterStream.on('tweet', function (tweet) {
        if (tweet.entities.hashtags.length > 0){
            console.log(tweet);
            var pluckedTags = _.pluck(tweet.entities.hashtags,'text'); //array of strings

            _.each(pluckedTags, function(tag){
                //increaseCount(hashTagsDict, tag);
            });
            //console.log("tags found");
            //console.log(pluckedTags);
        }
        io.emit('tweet', tweet);
    });
});




// Create the chat configuration
module.exports = function(io, socket) {
    initializeTwitter(io);


    socket.emit('welcome', {
        text : 'welcome, user. you will begin receiving notifications in a while...',
        created: Date.now()
    });

};
