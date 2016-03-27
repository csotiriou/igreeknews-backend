/**
 * Created by soulstorm on 20/06/15.
 */



var should = require('should');
var mongoose = require('mongoose');
var mongooseQ = require('mongoose-q')(mongoose);
var fs = require('fs');
var S = require('string');
var _ = require('underscore');
var NewsSource = mongoose.model('NewsSource');
var Article = mongoose.model('Article');
var SubCategory = mongoose.model('SubFeed');
var ArticleCategory = mongoose.model('ArticleCategory');


var mainCategory;
var subCategory1;
var subCategory2;
var newsSource;


describe('Category Tests', function(){

    before(function(done){
        mainCategory = new ArticleCategory({
            name : 'Test',
            displayName : 'Test'
        });

        subCategory1 = new SubCategory({ name : "SubCategory1", "feed" : "testFeed1"});
        subCategory2 = new SubCategory({ name : "SubCategory2", "feed" : "testFeed2"});
        newsSource = new NewsSource({
            name : 'Test Source',
            feed : 'Test Feed',
            rootUrl : 'Test Root URL'
        });


        done();
    });


    it('should begin with no categories', function(done){
        ArticleCategory.find({}, function(err, categories){
            categories.should.have.length(0);
            done();
        });
    });


    it('should save category with no problems', function(done){
        mainCategory.save(function(err, cat) {
            cat.name.should.equal('Test');
            done();
        });
    });



    it('should save Article Subcategories correctly', function(done){

        ArticleCategory.findOne({}).execQ().then(function(mainCategory){
            mainCategory.name.should.equal('Test');
            return subCategory1.saveQ().then(function(sub1){
                sub1.name.should.equal('SubCategory1');
                sub1.feed.should.equal('testFeed1');
                return subCategory2.saveQ().then(function(sub2){
                    sub2.name.should.equal('SubCategory2');
                    sub2.feed.should.equal('testFeed2');
                });
            });
        }).finally(function(){
            done();
        }).done();
    });


    it('should create a news source successfully', function(done){
        ArticleCategory.findOne({}).execQ().then(function(articleCategory){
            return newsSource.saveQ().then(function(newsSourceSaved){
                newsSourceSaved.name.should.equal('Test Source');
                newsSourceSaved.feed.should.equal('Test Feed');
                newsSourceSaved.rootUrl.should.equal('Test Root URL');

                newsSourceSaved.category = articleCategory._id;
                return newsSourceSaved.saveQ();
            }).then(function(){
                //check population
                return NewsSource.findOne({}).populate('category').execQ().then(function(newsSourceUpdated){
                    newsSourceUpdated.category.name.should.equal('Test');
                });
            });
        }).finally(function(){
            done();
        }).done();
    });


    it('should have saved Article Subcategories correctly', function(done){
        SubCategory.find({}).execQ().then(function(subCategories){
            subCategories.should.have.length(2);
        }).finally(function(){
            done();
        }).done();
    });

    it('should manage subcategories in a news source correctly', function(done){
        NewsSource.findOne({}).execQ().then(function(newsSource){
            return SubCategory.find({}).execQ().then(function(subcategories){
                newsSource.subcategories = [subcategories[0]._id, subcategories[1]._id];
                return newsSource.saveQ()
            });
        }).then(function(){
            return NewsSource.findOne({}).populate('subcategories').execQ().then(function(newsSourceUpdated){
                newsSourceUpdated.subcategories.should.have.length(2);
                newsSourceUpdated.subcategories[0].name.should.equal('SubCategory1');
                newsSourceUpdated.subcategories[1].name.should.equal('SubCategory2');
            }).finally(function(){
                done();
            }).done();
        });
    });


    it('should save category of subfeed correctly', function(done){
        subCategory1.category = mainCategory._id;
        subCategory1.saveQ().then(function(savedSubFeed){
            savedSubFeed.category.should.equal(mainCategory._id);
        }).finally(function(){
            done()
        }).done();
    });


    it('should fetch properly the sub feeds', function(done){
        SubCategory.findOne({name : subCategory1.name}).populate('category').execQ().then(function(result){
            result.category.name.should.equal('Test');
        }).finally(function(){
            done()
        }).done();
    });

    after(function(done){
        ArticleCategory.remove().exec();
        SubCategory.remove().exec();
        NewsSource.remove().exec();
        done();
    });
});
