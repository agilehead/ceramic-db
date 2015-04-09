var tests = require("./ceramic-db-test");
var TEST_DB_NAME = "ceramic-db-unittest-db-temp";
var Client = require("ceramic-backend-mongodb").MongoClient;

var getDb = function*() {
    return yield* Client.connect({ database: TEST_DB_NAME });
};

tests(getDb, "MongoDb");
