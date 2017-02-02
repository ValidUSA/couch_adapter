"use strict";

const chai = require("chai"),
      assert = chai.assert,
      fs = require("fs"),
      nano = require("nano"),
      prom = require("nano-promises"),
      randomstring = require("randomstring"),
      config = require("./configData/config.json"),
      urlBuilder = require("../src/url_builder.js"),
      newdbName = randomstring.generate({
        length: 15,
        capitalization: "lowercase",
        charset: "alphabetic"
    }),
      readBulkMethod = require("../src/read_view_bulk.js"),
      pino = require("pino"),
      awest = require("./TestData/adam_west.json"),
      ckent = require("./TestData/clark_kent.json"),
      jtest = require("./TestData/jtest.json");

let logDir = process.env.LOG_DIR || "./",
    logOutput = logDir + "couch_adapter_readBulkTests.log",
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
    return target.db.create(newdbName).then((body) => {
        let db = target.db.use(newdbName);
        db.list().then((result) => {
            // console.log(result);
        });
        return db.insert(awest).then((body) => {
            return db.insert(ckent).catch((error)=> {
                console.log("It was ckent");
                return error;
            });
        }).then((body) => {
            return db.insert(jtest).catch((error) => {
                console.log("it was jtest");
                return error;
            });
        }).then((body) => {
            return db.insert({
                views: {
                    by_TypeOfLicense: {
                        map: function (doc) {
                            emit(doc.abbrevTypeOfLicense, doc._id);
                        }
                    }
                }
            }, "_design/testViews");
        });
    }).catch((err) => {
        // console.log(err.request.body._id);
        return err;
    });
};

const dbTeardown = (configSettings) => {
    let url = urlBuilder(configSettings);
    let server = prom(nano(url));
    return server.db.destroy(newdbName).catch((err) => {
        console.log("ERROR DESTROYING DB");
        console.log(err);
    });
};

describe(`read bulk view tests on ${newdbName}`, function () {
    before(function (done) {
        this.timeout(5000);
        dbSetup(config).then((result) => {
            done();
        });
    });

    it("gets all records from db when # of docs is less than limit", function () {
        const configValues = {
            url: config.url,
            user: config.auth.user,
            pass: config.auth.pass,
            db: newdbName,
            limit: 5,
            skip: 0,
            design: "testViews",
            view: "by_TypeOfLicense"

        };
        return readBulkMethod(configValues, logger.child({
            type: "read bulk"
        })).then((result) => {
            assert.isTrue(result.rows.length === 3);
        });
    });

    it("returns a records equal to limit", function () {
        const configValues = {
            url: config.url,
            user: config.auth.user,
            pass: config.auth.pass,
            db: newdbName,
            limit: 1,
            skip: 0,
            design: "testViews",
            view: "by_TypeOfLicense"
        };
        return readBulkMethod(configValues, logger.child({
            type: "read bulk"
        })).then((result) => {
            assert.isTrue(result.rows.length === 1);
        });
    });

    it("returns correct record when skip is passed", function () {
        const configValues = {
            url: config.url,
            user: config.auth.user,
            pass: config.auth.pass,
            db: newdbName,
            limit: 1,
            skip: 2,
            design: "testViews",
            view: "by_TypeOfLicense"
        };
        return readBulkMethod(configValues, logger.child({
            type: "read bulk"
        })).then((result) => {
            assert.isTrue(result.rows.length === 1);
            assert.isTrue(result.rows[0].id === "jtest");
        });
    });

    it("throws an error when configuration is incorrect", function () {
        const configValues = {
            url: config.url,
            user: config.auth.user,
            pass: "hooplah",
            db: newdbName,
            limit: 1,
            skip: 2,
            design: "testViews",
            view: "by_TypeOfLicense"
        };
        return readBulkMethod(configValues, logger.child({
            type: "read bulk"
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