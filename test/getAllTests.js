"use strict";

const chai = require("chai"),
      assert = chai.assert,
      fs = require("fs"),
      nano = require("nano"),
      prom = require("nano-promises"),
      randomstring = require("randomstring"),
      config = require("./configData/config.json"),
      urlBuilder = require("../src/url_builder.js"),
      dbName = randomstring.generate({
        length: 15,
        capitalization: "lowercase",
        charset: "alphabetic"
    }),
      getAllMethod = require("../src/get_all.js"),
      pino = require("pino"),
      awest = require("./TestData/adam_west.json"),
      ckent = require("./TestData/clark_kent.json"),
      jtest = require("./TestData/jtest.json");

let logDir = process.env.LOG_DIR || "./",
    logOutput = logDir + "couch_adapter_getAllTests.log",
    logger = pino({
        name: "couch_adapter"
    },
    fs.createWriteStream(logOutput));
// set logger level
logger.level = "debug";
// database setup
const dbSetup = function (configSettings) {
    let url = urlBuilder(configSettings);
    let target = prom(nano(url));
    return target.db.create(dbName).then((body) => {
        let db = target.db.use(dbName);
        return db.insert(awest).then((body) => {
            return db.insert(ckent);
        }).then((body) => {
            return db.insert(jtest);
        });
    }).catch((err) => {
        console.log(err);
        return err;
    });
};

const dbTeardown = (configSettings) => {
    let url = urlBuilder(configSettings);
    let server = prom(nano(url));
    return server.db.destroy(dbName).catch((err) => {
        console.log("ERROR DESTROYING DB");
        console.log(err);
    });
};

describe("get all tests", function () {
    before(function (done) {
        this.timeout(5000);
        dbSetup(config).then((result) => {
            done();
        });
    });

    it("gets all records from db when # of docs is less than limit", function () {
        const configValues = {
            url: "http://localhost:5984",
            user: "admin",
            pass: "secret",
            db: dbName,
            limit: 5,
            skip: 0
        };
        return getAllMethod(configValues, logger.child({
            type: "get"
        })).then((result) => {
            assert.isTrue(result.length === 3);
        }).catch((error) => {
            console.log(error);
        });
    });

    it("returns a records equal to limit", function () {
        const configValues = {
            url: "http://localhost:5984",
            user: "admin",
            pass: "secret",
            db: dbName,
            limit: 1,
            skip: 0
        };
        return getAllMethod(configValues, logger.child({
            type: "get"
        })).then((result) => {
            assert.isTrue(result.length === 1);
        }).catch((error) => {
            console.log(error);
        });
    });

    it("returns correct record when skip is passed", function () {
        const configValues = {
            url: "http://localhost:5984",
            user: "admin",
            pass: "secret",
            db: dbName,
            limit: 1,
            skip: 2
        };
        return getAllMethod(configValues, logger.child({
            type: "get"
        })).then((result) => {
            assert.isTrue(result.length === 1);
            assert.isTrue(result[0].id === "jtest");
        }).catch((error) => {
            console.log(error);
        });
    });

    it("throws an error when configuration is incorrect", function () {
        const configValues = {
            url: "http://localhost:5984",
            user: "admin",
            pass: "hooplah",
            db: dbName,
            limit: 1,
            skip: 2
        };
        return getAllMethod(configValues, logger.child({
            type: "get"
        })).catch((error) => {
            assert.isTrue(error.message === "Name or password is incorrect.");
        });
    });

    after(function (done) {
        this.timeout(5000);
        dbTeardown(config).then((result) => {
            done();
        });
    });
});