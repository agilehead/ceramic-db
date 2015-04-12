(function() {

    "use strict";

    var utils = require("./utils");

    var Cursor = function(cursor, entitySchema, ceramic, db) {
        this.underlying = cursor;
        this.entitySchema = entitySchema;
        this.ceramic = ceramic;
        this.db = db;
    };


    var syncMethods = [
        "limit",
        "skip",
        "sort"
    ];
    syncMethods.forEach(function(methodName) {
        Cursor.prototype[methodName] = function() {
            var underlying = this.underlying[methodName].apply(this.underlying, arguments);
            return new Cursor(underlying, this.entitySchema, this.ceramic, this.db);
        };
    });


    Cursor.prototype.toArray = function*() {
        var items = yield* this.underlying.toArray();

        if (items.length) {
            var results = [];
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                results.push(yield* utils.constructEntity(item, this.entitySchema, this.ceramic, this.db));
            }
            return results;
        } else {
            return [];
        }
    };

    module.exports = Cursor;

}).call(this);
