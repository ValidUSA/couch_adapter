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
      readMethod = require("../src/read.js"),
      deleteMethod = require("../src/delete.js"),
      pino = require("pino"),
      awest = require("./TestData/adam_west.json"),
      ckent = require("./TestData/clark_kent.json"),
      jtest = require("./TestData/jtest.json");

let logDir = process.env.LOG_DIR || "./",
    logOutput = logDir + "couch_adapter_deleteTests.log",
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
        // console.log(err);
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

describe(`Delete Tests on ${dbName}`, function () {
    before(function (done) {
        this.timeout(5000);
        dbSetup(config).then((result) => {
            done();
        });
    });

    it("deletes a record", function () {
        const configValues = {
            url: config.url,
            user: config.auth.user,
            pass: config.auth.pass,
            db: dbName
        };
        return deleteMethod(configValues, logger.child({
            type: "delete"
        }), "awest").then((result) => {
            return readMethod(configValues, logger.child({
                type: "read"
            }), "awest");
        }).catch((error) => {
            assert.isTrue(error.message === "not_found");
        });
    });

    it("throws an error when record does not exist", function () {
        const configValues = {
            url: config.url,
            user: config.auth.user,
            pass: config.auth.pass,
            db: dbName
        };
        return deleteMethod(configValues, logger.child({
            type: "delete"
        }), "HoraceNight").then((result) => {
            return readMethod(configValues, logger.child({
                type: "read"
            }), "awest");
        }).catch((error) => {
            assert.isTrue(error.message === "not_found");
        });
    });

    it("throws an error when cannot connect", function () {
        const configValues = {
            url: config.url,
            user: config.auth.user,
            pass: "hoopla",
            db: dbName
        };
        return deleteMethod(configValues, logger.child({
            type: "delete"
        }), "ckent").then((result) => {
            return readMethod(configValues, logger.child({
                type: "read"
            }), "skent");
        }).catch((error) => {
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