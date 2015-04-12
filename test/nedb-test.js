var co = require("co");
var tests = require("./test-definition");
var TEST_DB_NAME = "ceramic-db-unittest-db-temp";

var run = function() {
    var backend = require("ceramic-backend-nedb");

    var getDb = function*() {
        return yield* backend.NeDBClient.connect({ database: TEST_DB_NAME });
    };

    tests(getDb, "NeDB");
};

run();
