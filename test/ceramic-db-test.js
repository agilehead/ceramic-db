(function() {

    "use strict";

    var co = require('co');
    var assert = require('assert');
    var Ceramic = require("ceramic");
    var MongoBackend = require("ceramic-backend-mongodb");
    var odm = require("../lib/ceramic-db");

    module.exports = function(getDb, backendName) {

        var db;

        describe("Ceramic ODM with " + backendName, function() {
            var Author, BlogPost, Publisher;
            var authorSchema, postSchema, publisherSchema;
            var ceramic;

            var brosInArmsId, busyBeingBornId, markKnopflerId, davidKnopflerId;

            before(function() {
                return co(function*() {

                    Publisher = function(params) {
                        if (params) {
                            for(var key in params) {
                                this[key] = params[key];
                            }
                        }
                    };


                    publisherSchema = {
                        ctor: Publisher,
                        collection: "publishers",
                        schema: {
                            id: 'publisher',
                            type: 'object',
                            properties: {
                                name: { type: 'string' },
                                labels: {
                                    type: "array",
                                    items: {
                                        type: "string"
                                    },
                                    minItems: 1
                                }
                            },
                            required: ['name', 'labels']
                        },
                        canDestroyAll: function(params) {
                            return true;
                        }
                    };


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
                        },
                        canDestroyAll: function(params) {
                            return true;
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
                                publisherId: { type: 'string' },
                                author: { $ref: 'author' }
                            },
                            required: ['title', 'content', 'author', 'publisherId']
                        },
                        links: {
                            publisher: { type: "publisher", key: "publisherId" }
                        }
                    };

                    //Init the schema cache
                    ceramic = new Ceramic();
                    yield* ceramic.init([authorSchema, postSchema, publisherSchema]);

                    //Delete database if it exists
                    db = yield* getDb();
                    yield* db.dropDatabase();
                });
            });


            it("save must save records", function() {
                return co(function*() {

                    var batmanPublisher = {
                        name: "The Batman Publishing Company",
                        labels: ["Comica", "Lyrica"]
                    };

                    yield* odm.save(batmanPublisher, publisherSchema, ceramic, db);

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

                    yield* odm.save(markKnopfler, authorSchema, ceramic, db);
                    yield* odm.save(davidKnopfler, authorSchema, ceramic, db);

                    markKnopflerId = markKnopfler._id.toString();
                    davidKnopflerId = davidKnopfler._id.toString();

                    var busyBeingBorn    = {
                        title: "Busy Being Born",
                        content: "The days keep dragging on, Those rats keep pushing on,  The slowest race around, We all just race around ...",
                        published: "yes",
                        author: {
                            name: "Middle Class Rut",
                            location: "USA"
                        },
                        publisherId: batmanPublisher._id.toString()
                    };

                    var brosInArms = {
                        title: "Brothers in Arms",
                        content: "These mist covered mountains, Are a home now for me, But my home is the lowlands ...",
                        published: "yes",
                        author: {
                            name: "Dire Straits",
                            location: "UK"
                        },
                        publisherId: batmanPublisher._id.toString()
                    };

                    yield* odm.save(busyBeingBorn, postSchema, ceramic, db);
                    yield* odm.save(brosInArms, postSchema, ceramic, db);

                    busyBeingBornId = busyBeingBorn._id.toString();
                    brosInArmsId = brosInArms._id.toString();

                    assert.equal(typeof markKnopflerId === "string", true, "_id after saving must be a string");
                    assert.equal(typeof davidKnopflerId === "string", true, "_id after saving must be a string");
                    assert.equal(typeof busyBeingBornId === "string", true, "_id after saving must be a string");
                    assert.equal(typeof brosInArmsId === "string", true, "_id after saving must be a string");
                });
            });

            it("findById must find the record with the corresponding id", function() {
                return co(function*() {
                    var rec = yield* odm.findById(postSchema, busyBeingBornId, ceramic, db);
                    assert.equal(rec.title, "Busy Being Born");
                });
            });


            it("findById must return null with incorrect id", function() {
                return co(function*() {
                    var rec = yield* odm.findById(postSchema, "id6666666666", ceramic, db);
                    assert.equal(rec, null);
                });
            });


            it("find must return an array of matching records", function() {
                return co(function*() {
                    var records = yield* odm.find(postSchema, { published: "yes" }, ceramic, db);
                    assert.equal(records.length, 2);
                });
            });


            it("findOne must return a single matching record", function() {
                return co(function*() {
                    var rec = yield* odm.findOne(postSchema, { title: "Busy Being Born" }, ceramic, db);
                    assert.equal(rec.title, "Busy Being Born");
                });
            });


            it("count must return the number of matching records", function() {
                return co(function*() {
                    var count = yield* odm.count(postSchema, { title: "Busy Being Born" }, ceramic, db);
                    assert.equal(count, 1);

                    count = yield* odm.count(postSchema, {}, ceramic, db);
                    assert.equal(count, 2);
                });
            });


            it("link must retrieve corresponding record", function() {
                return co(function*() {
                    var rec = yield* odm.findOne(postSchema, { title: "Busy Being Born" }, ceramic, db);
                    var publisher = yield* odm.link(rec, postSchema, "publisher", ceramic, db);
                    assert.equal(publisher.name, "The Batman Publishing Company");
                });
            });


            it("destroy must delete a record", function() {
                return co(function*() {
                    var busyBeingBorn = yield* odm.findOne(postSchema, { title: "Busy Being Born" }, ceramic, db);
                    yield* odm.delete(busyBeingBorn, postSchema, ceramic, db);
                    var count = yield* odm.count(postSchema, {}, ceramic, db);
                    assert.equal(count, 1);
                });
            });


            it("destroyAll must throw an Error if canDestroyAll is not defined", function(done) {
                co(function*() {
                    try {
                        yield* odm.deleteMany(postSchema, {}, ceramic, db);
                        done(new Error("Should not delete without calling canDestroyAll()"));
                    } catch (ex) {
                        done();
                    }
                });
            });


            it("destroyAll must delete everything and NOT throw an Error if canDestroyAll is defined", function(done) {
                co(function*() {
                    try {
                        yield* odm.deleteMany(authorSchema, {}, ceramic, db);
                        var records = yield* odm.find(authorSchema, {}, ceramic, db);
                        assert.equal(records.length, 0);
                        done();
                    } catch (ex) {
                        done(new Error("Can delete if canDestroyAll() returns true"));
                    }
                });
            });

        });
    };

})();
