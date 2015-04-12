var co = require("co");
var tests = require("./test-definition");
var TEST_DB_NAME = "ceramic-db-unittest-db-temp";

var run = function() {
    var backend = require("ceramic-backend-mongodb");

    var getDb = function*() {
        return yield* backend.MongoClient.connect({ database: TEST_DB_NAME });
    };

    tests(getDb, "MongoDb");
};

run();
