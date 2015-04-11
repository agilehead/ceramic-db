var backend = require("ceramic-backend-mongodb");
var tests = require("./ceramic-db-test");
var TEST_DB_NAME = "ceramic-db-unittest-db-temp";

var getDb = function*() {
    return yield* backend.MongoClient.connect({ database: TEST_DB_NAME });
};

tests(getDb, "MongoDb");
