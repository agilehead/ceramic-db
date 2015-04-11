/*
var backend = require("ceramic-backend-nedb");
var tests = require("./ceramic-db-test");
var TEST_DB_NAME = "ceramic-db-unittest-db-temp";

var getDb = function*() {
    return yield* backend.MongoClient.connect({ database: TEST_DB_NAME });
};

tests(getDb, "NeDB");
*/

/*
var tests = require("./ceramic-db-test");
var TEST_DB_NAME = "ceramic-db-unittest-db-temp";
var NeDBBackend = require("ceramic-backend-nedb");
var dbBackend = new NeDBBackend({ name: TEST_DB_NAME });

tests(dbBackend, "NeDB");
*/
