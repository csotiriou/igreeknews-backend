'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;



var NewsSourceCategorySchema = new Schema({
    displayName : {
        type : String,
        required : 'displayName cannot be blank'
    },
    name: {
        type: String,
        default: '',
        trim: true,
        required: 'Title cannot be blank'
    }
});



/**
 * SubFeed
 */
var SubFeedSchema = new Schema({
    name : String,
    feed : {
        type : String,
        required : 'feed URL cannot be blank',
        index : true
    },
    parentNewsSource : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'NewsSource'
    },
    category : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'ArticleCategory'
    },
    isMainFeed : {
        type : Boolean,
        default : true
    }
});


var autoPopulateSubFeedCategory = function(next) {
    this.populate('category');
    next();
};

SubFeedSchema.pre('findOne', autoPopulateSubFeedCategory);
SubFeedSchema.pre('find', autoPopulateSubFeedCategory);




/**
 * Source Schema
 */
var SourceSchema = new Schema({
    created: {
        type: Date,
        default: Date.now
    },
    name: {
        type: String,
        default: '',
        trim: true,
        required: 'name cannot be blank'
    },
    feed: {
        type: String,
        default: '',
        trim: true,
        index : true
    },
    rootUrl : {
        type: String,
        default: '',
        trim: true,
        index : true
    },
    tags: {
        type: [String],
        default: []
    },
    category : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'NewsSourceCategory'
    },
    subcategories : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'SubFeed'
    }],
    gravity : {
        type : Number,
        default : 0
    }
});

SourceSchema.pre('find', function(next){
    //this.populate('category subcategories');
    next();
});



/**
 * Article Category Schema
 */
var ArticleCategorySchema = new Schema({
    displayName : {
        type : String,
        required : 'displayName cannot be blank'
    },
    name: {
        type: String,
        default: '',
        trim: true,
        required: 'Title cannot be blank'
    }
});


ArticleCategorySchema.pre('remove', function(next){
     next();
});


/**
 * Article Schema
 */
var ArticleSchema = new Schema({
	title: {
		type: String,
		default: '',
		trim: true,
		required: 'Title cannot be blank'
	},
	content: {
		type: String,
		default: '',
		trim: true
	},
    summary : {
        type : String,
        default: '',
        trim: true
    },
    url : {
        type : String,
        default: '',
        trim : true,
        required : 'URL cannot be blank',
        unique : true,
        index : true
    },
    hostName : {
        type : String,
        default: ''
    },
    feedUrl : {
        type : String,
        default : '',
        trim : true
    },
    publicationDate : {
        type : Date,
        default: null,
        trim : true,
        index : true
    },
    imageUrl : {
        type : String,
        default : '',
        trim : true
    },
    imageTitle : {
        type : String,
        default : '',
        trim : true
    },
    description : {
        type : String,
        default : '',
        trim : true
    },
    tags : {
        type : String,
        default : '',
        trim : true
    },
    publicationTimeStamp : {
        type : Number,
        default : 0,
        index : true
    },
    keywords : {
        type : [String],
        default : [],
        index : true
    },
    newsSource : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'NewsSource',
        default : null,
        index : true
    },
    category : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'ArticleCategory',
        default : null,
        index : true
    },
    subcategory : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'SubFeed',
        default : null,
        index : true
    },
    fullText : {
        type : String,
        default : null
    },
    alreadySearchedForFullText : {
        type : Boolean,
        default : false
    }
});

ArticleSchema.index({ title: "text", summary: "text" });

/**
 * toJSON implementation
 */
var schemaAdditionalOptions = {
    transform: function(doc, ret, options) {
        ret.id = ret._id;
        ret.created = ret._id.getTimestamp();
        delete ret._id;
        delete ret.__v;
        return ret;
    }
};

/**
 * if there is full text available, return this, in the place of content. Else, return this
 * as it is now
 * @type {{transform: Function}}
 */
var articleResolutionOptions = {
    transform : function(doc, ret, options){

        var fullText = doc.fullText;
        if (fullText){
            ret.content = fullText;
            delete ret.fullText;
        }
        ret.id = ret._id;
        ret.created = ret._id.getTimestamp();
        delete ret._id;
        delete ret.__v;

        return ret;
    }
};

SourceSchema.options.toJSON = schemaAdditionalOptions;
ArticleCategorySchema.options.toJSON = schemaAdditionalOptions;
ArticleSchema.options.toJSON = articleResolutionOptions;
SubFeedSchema.options.toJSON = schemaAdditionalOptions;
NewsSourceCategorySchema.options.toJSON = schemaAdditionalOptions;

mongoose.model('NewsSource', SourceSchema);
mongoose.model('ArticleCategory', ArticleCategorySchema);
mongoose.model('NewsSourceCategory', NewsSourceCategorySchema);
mongoose.model('Article', ArticleSchema);
mongoose.model('SubFeed', SubFeedSchema);

exports.ArticleSchema = ArticleSchema;
exports.ArticleCategorySchema = ArticleCategorySchema;
exports.SourceSchema = SourceSchema;
exports.SubFeedSchema = SubFeedSchema;
