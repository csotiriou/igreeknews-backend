'use strict';


var http = require('http');
var urlParser = require('url');
var async = require('async');
var FeedParser = require('feedparser');
var mongoose = require('mongoose');
var mongooseQ = require('mongoose-q')(mongoose);
var Article = mongoose.model('Article');
var CronJob = require('cron').CronJob;
var sources = require('./util/Sources.json');
var _ = require('underscore');
var S = require('string');
//var cheerio = require('cheerio');
var lexer = require('util/lexer.greek.js');
var memCached = require('util/MemoryCache');
var util = require('util/util');


var consolidateCategories = function(){
    console.log("consolidating categories...");

    var articleCategories = sources["sources"]["categories"];
};
