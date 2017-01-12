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
      getMethod = require("../src/get.js"),
      pino = require("pino"),
      awest = require("./TestData/adam_west.json"),
      ckent = require("./TestData/clark_kent.json"),
      jtest = require("./TestData/jtest.json");

let logDir = process.env.LOG_DIR || "./",
    logOutput = logDir + "couch_adapter.log",
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

describe("get tests", function () {
    before(function (done) {
        this.timeout(5000);
        dbSetup(config).then((result) => {
            done();
        });
    });

    it("gets the appropriate record", function () {
        const configValues = {
            url: "http://localhost:5984",
            user: "admin",
            pass: "secret",
            db: dbName
        };
        return getMethod(configValues, logger.child({
            type: "get"
        }), "awest").then((result)=> {
            assert.isTrue(result._id === "awest");
        });
    });

    it("throws a not_found error when record not found", function () {
        const configValues = {
            url: "http://localhost:5984",
            user: "admin",
            pass: "secret",
            db: dbName
        };
        return getMethod(configValues, logger.child({
            type: "get"
        }), "HillbillyHitchcock").then((body) => {
            assert.isTrue(body._id === "HillbillyHitchcock");
        }).catch((error) => {
            assert.isTrue(error.error === "not_found");
        });
    });

    after(function (done) {
        this.timeout(5000);
        dbTeardown(config).then((result) => {
            done();
        });
    });
});