(function() {

    "use strict";

    var co = require('co');
    var assert = require('assert');
    var Ceramic = require("ceramic");
    var CeramicDbAPI = require("ceramic-db-api");
    var MongoBackend = require("ceramic-backend-mongodb");
    var odm = require("../lib/ceramic-db");

    var TEST_DB_NAME = "ceramic-db-unittest-db-temp";

    describe("Ceramic ODM with MongoDb Backend", function() {
        var Author, BlogPost;
        var authorSchema, postSchema;
        var dbBackend, dbApi, ceramic;

        var brosInArmsId, busyBeingBornId, markKnopflerId, davidKnopflerId;

        before(function() {
            return co(function*() {
                Author = function(params) {
                    if (params) {
                        for(var key in params) {
                            this[key] = params[key];
                        }
                    }
                };

                authorSchema = {
                    ctor: Author,
                    collection: "authors",
                    schema: {
                        id: 'author',
                        type: 'object',
                        properties: {
                            name: { type: 'string' },
                            location: { type: 'string' },
                            age: { type: 'number' }
                        },
                        required: ['name', 'location']
                    }
                };

                BlogPost = function(params) {
                    if (params) {
                        for(var key in params) {
                            this[key] = params[key];
                        }
                    }
                };

                postSchema = {
                    ctor: BlogPost,
                    collection: "posts",
                    schema: {
                        id: 'post',
                        type: 'object',
                        properties: {
                            title: { type: 'string' },
                            content: { type: 'string' },
                            published: { type: 'string' },
                            author: { $ref: 'author' }
                        },
                        required: ['title', 'content', 'author']
                    }
                };

                //Init the schema cache
                ceramic = new Ceramic();
                yield* ceramic.init([authorSchema, postSchema]);

                //Delete database if it exists
                dbBackend = new MongoBackend({ name: TEST_DB_NAME });
                dbApi = new CeramicDbAPI(dbBackend);
                yield* dbApi.deleteDatabase();
            });
        });


        it("save must save records", function() {
            return co(function*() {

                var markKnopfler = {
                    name: "Mark Freuder Knopfler",
                    location: "Gosforth, England",
                    age: 65
                };

                var davidKnopfler = {
                    name: "David Knopfler",
                    location: "Newcastle-upon-Tyne, England",
                    age: 62
                };

                yield* odm.save(markKnopfler, authorSchema, ceramic, dbApi);
                yield* odm.save(davidKnopfler, authorSchema, ceramic, dbApi);

                markKnopflerId = markKnopfler._id.toString();
                davidKnopflerId = davidKnopfler._id.toString();

                var busyBeingBorn    = {
                    title: "Busy Being Born",
                    content: "The days keep dragging on, Those rats keep pushing on,  The slowest race around, We all just race around ...",
                    published: "yes",
                    author: {
                        name: "Middle Class Rut",
                        location: "USA"
                    }
                };

                var brosInArms = {
                    title: "Brothers in Arms",
                    content: "These mist covered mountains, Are a home now for me, But my home is the lowlands ...",
                    published: "yes",
                    author: {
                        name: "Dire Straits",
                        location: "UK"
                    }
                };

                yield* odm.save(busyBeingBorn, postSchema, ceramic, dbApi);
                yield* odm.save(brosInArms, postSchema, ceramic, dbApi);

                busyBeingBornId = busyBeingBorn._id.toString();
                brosInArmsId = brosInArms._id.toString();

                assert.equal(typeof markKnopflerId === "string", true, "_id after saving must be a string");
                assert.equal(typeof davidKnopflerId === "string", true, "_id after saving must be a string");
                assert.equal(typeof busyBeingBornId === "string", true, "_id after saving must be a string");
                assert.equal(typeof brosInArmsId === "string", true, "_id after saving must be a string");
            });
        });

        it("findById must return the record with the specific id", function() {
            return co(function*() {
                var rec = yield* odm.findById(postSchema, busyBeingBornId, ceramic, dbApi);
                assert.equal(rec.title, "Busy Being Born");
            });
        });


        it("findById must return null with missing id", function() {
            return co(function*() {
                var rec = yield* odm.findById(postSchema, "id6666666666", ceramic, dbApi);
                assert.equal(rec, null);
            });
        });


        it("find must return an array of matching records", function() {
            return co(function*() {
                var rec = yield* odm.find(postSchema, { published: "yes" }, ceramic, dbApi);
                assert.equal(rec.length, 2);
            });
        });


        it("findOne must return a single matching record", function() {
            return co(function*() {
                var rec = yield* odm.findOne(postSchema, { title: "Busy Being Born" }, ceramic, dbApi);
                assert.equal(rec.title, "Busy Being Born");
            });
        });


        it("count must return the number of matching records", function() {
            return co(function*() {
                var count = yield* odm.count(postSchema, { title: "Busy Being Born" }, ceramic, dbApi);
                assert.equal(count, 1);

                count = yield* odm.count(postSchema, {}, ceramic, dbApi);
                assert.equal(count, 2);
            });
        });


        it("destroy must delete a record", function() {
            return co(function*() {
                var busyBeingBorn = yield* odm.findOne(postSchema, { title: "Busy Being Born" }, ceramic, dbApi);
                yield* odm.destroy(busyBeingBorn, postSchema, ceramic, dbApi);
                var count = yield* odm.count(postSchema, {}, ceramic, dbApi);
                assert.equal(count, 1);
            });
        });

    });

})();
