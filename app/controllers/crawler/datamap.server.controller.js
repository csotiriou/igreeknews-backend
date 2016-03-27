/**
 * Created by soulstorm on 6/4/15.
 */


var mongoose = require('mongoose');
var mongooseQ = require('mongoose-q')(mongoose);
var Datamap = mongoose.model('Datamap');
var Article = mongoose.model('Article');
var async = require('async');
var _ = require('lodash');
var util = require('../../util/util');

/**
 * The datamap version is here to achieve a basic migration capability, in case where the mapping model changes
 * and needs to be recreated.
 * @type {number}
 */
var currentDatamapVersion = 1;

/**
 * Adds host names to the data mapper
 * @param hostNames (Array)
 * @returns {*}
 */
var addHostNamesToMap = function(hostNames){
    return Datamap.update({}, {$addToSet : {hostNames : {$each : hostNames}}}).execQ();
};

/**
 * Returns a Q promise that searches for the latest data mapper
 * @returns {*}
 */
var getDataMap = function(req, res){
    var promise = Datamap.findOne({version : currentDatamapVersion}).execQ();
    if (!req || !res){
        return promise;
    }else{
        promise.then(function(datamapperObject){
            res.jsonp(util.apiResponse(datamapperObject));
        }).catch(function(error){
            res.jsonp(null, util.apiResponse(error));
        });
    }
};

/**
 * Creates a default data model, with the current version, if one
 * does not already exists
 */
var createDefaultDataMapModel = function(){
    console.log('creating default data map model...');

    getDataMap().then(function(doc){
       if (!doc){
           console.log('Mapping object does not exist. creating new...');
           return Article.distinct('hostName').execQ().then(function(results){
               createNewDataMapHostNames(results, new Datamap({
                   version : 1,
                   hostNames : results
               })).then(function(newDataMapModel){
                   console.log('new data map created');
                   console.log(newDataMapModel);
               });
           });
       }else{
       }
    }).catch(function(error){
       console.err('could not insert default data map to database');
       console.err(error);
    });
};


var getDistinctHostNames = function(){
    return Article.distinct('hostName').execQ();
};

var createNewDataMapHostNames = function(distinctHostNames, dataMapModel){
    console.log('updating data map model with new host names...');
    return dataMapModel.saveQ();
};

/**
 * Re-consolidates the data mapper with new hostnames, while leaving the rest of the properties intact
 * The data map model should have already been created
 * @param dataMapModel
 * @returns {*}
 */
var recreateHostNames = function(req, res){
    console.log('recreating host names..');
    var promise = getDistinctHostNames().then(function(hostNames){
        console.log('hostNames gotten');
        console.log(hostNames);
        return Datamap.findOneAndUpdate({}, {hostNames : hostNames}).execQ().then(function(result){
            console.log(result);
        });
    });

    if (!req || !res){
       return promise;
    }

    promise.then(function(){
        //all good
        res.jsonp(util.apiResponse('map recreated'));
    }).catch(function(err){
        console.err(err);
        res.jsonp(util.apiResponse(null, err));
    });
};


createDefaultDataMapModel();



/**
 * returns a promise
 */
exports.getDataMap = getDataMap;
exports.addHostNamesToMap = addHostNamesToMap;
exports.currentDatamapVersion = currentDatamapVersion;
exports.recreateHostNames = recreateHostNames;