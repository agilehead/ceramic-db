(function() {

    "use strict";

    var getRowId = function(item, entitySchema) {
        var rowId = entitySchema.rowId || "_id";
        return item[rowId] ? item[rowId]: undefined;
    };


    var setRowId = function(item, id, entitySchema) {
        var rowId = entitySchema.rowId || "_id";
        item[rowId] = id;
        return item;
    };


    var getIdQuery = function(item, entitySchema) {
        var rowId = entitySchema.rowId || "_id";
        var query = {};
        query[rowId] = item[rowId];
        return query;
    };


    var constructEntity = function*(item, entitySchema, ceramic, db) {
        var id = getRowId(item, entitySchema);
        var result = yield* ceramic.constructEntity(item, entitySchema, { additionalProperties: ["__updateTimestamp"] });
        setRowId(result, id, entitySchema);
        return result;
    };

    module.exports = {
        getRowId: getRowId,
        setRowId: setRowId,
        getIdQuery: getIdQuery,
        constructEntity: constructEntity
    };

})();
