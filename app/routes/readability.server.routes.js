'use strict';

/**
 * Module dependencies.
 */

module.exports = function(app) {
    // User Routes
    var readabilityController = require('../../app/controllers/crawler/readability.server.controller');

    app.route('/api/readability/getUrl').get(readabilityController.getReadableContent);
    app.route('/api/readability/similar').get(readabilityController.getSimilarArticles);


};
