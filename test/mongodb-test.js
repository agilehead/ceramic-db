var tests = require("./ceramic-db-test");
var TEST_DB_NAME = "ceramic-db-unittest-db-temp";
var MongoBackend = require("ceramic-backend-mongodb");
var dbBackend = new MongoBackend({ name: TEST_DB_NAME });

tests(dbBackend);
