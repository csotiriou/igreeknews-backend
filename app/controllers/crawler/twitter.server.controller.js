/**
 * Created by soulstorm on 13/06/15.
 */

var _ = require('lodash');
var mongoose = require('mongoose');
var mongooseQ = require('mongoose-q')(mongoose);
var Tweet = mongoose.model('Tweet');
var SharedMedia = mongoose.model('SharedMedia');
var async = require('async');
var util = require('../../util/util');
var HashTag = mongoose.model('HashTag');
var moment = require('moment');


exports.getTwitterLeads = function(req, res){
  Tweet.find({ $where : 'this.urls.length > 0' }).sort({timestamp : -1}).limit(50).populate('user').execQ().then(function(results){
      res.jsonp(util.apiResponse(results));
  }).catch(function(err){
      res.jsonp(util.apiResponse(null, err));
  });
};


exports.getSharedMedia = function(req, res){
    var limit = req.query['limit'];
    var type = req.query['type'];

    var searchOptions = {};
    if (type){
        searchOptions = _.extend(searchOptions, {type : type});
    }

    SharedMedia.find(searchOptions).sort({count : -1, lastAccessDate : -1}).limit(limit ? limit : 100).execQ().then(function(results){
        res.jsonp(util.apiResponse(results));
    }).catch(function(err){
        res.jsonp(util.apiResponse(null, err));
    });
};


exports.getHashTags = function(req, res){
    var limit = req.query['limit'];


    var oneMonthEarlier = moment().subtract(1, 'month').toDate();

    var searchOptions = {"lastAccessDate" : {"$gte" : oneMonthEarlier}, count : {$gte : 2}};

    HashTag.find(searchOptions).sort({lastAccessDate : -1, count : -1}).limit(limit ? limit : 20).execQ().then(function(results){
        res.jsonp(util.apiResponse(results));
    }).catch(function(err){
        res.jsonp(util.apiResponse(null, err));
    });

};
