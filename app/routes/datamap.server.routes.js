'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport');

module.exports = function(app) {

    var datamapper = require('../../app/controllers/crawler/datamap.server.controller');


    // Setting up the users profile api
    app.route('/api/datamap/map').get(datamapper.getDataMap);
    app.route('/api/datamap/recreateHostNames').get(datamapper.recreateHostNames);





};
