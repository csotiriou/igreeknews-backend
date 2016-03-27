'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport');

module.exports = function(app) {
	//twitter routes
    var twitterController = require('../../app/controllers/crawler/twitter.server.controller');


    app.route('/api/twitter/leads').get(twitterController.getTwitterLeads);
    app.route('/api/twitter/media').get(twitterController.getSharedMedia);

    app.route('/api/twitter/hashtags').get(twitterController.getHashTags);

};
