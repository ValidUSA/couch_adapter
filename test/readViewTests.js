"use strict";

const chai = require("chai"),
      assert = chai.assert,
      expect = chai.expect,
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
      readViewMethod = require("../src/read_view.js"),
      pino = require("pino"),
      awest = require("./TestData/adam_west.json"),
      ckent = require("./TestData/clark_kent.json"),
      jtest = require("./TestData/jtest.json");

let logDir = process.env.LOG_DIR || "./",
    logOutput = logDir + "couch_adapter_readTests.log",
    logger = pino({
        name: "couch_adapter"
    },
    fs.createWriteStream(logOutput));
// set logger level
logger.level = "debug";
// database setup
const readDbSetup = function (configSettings) {
    let url = urlBuilder(configSettings);
    let target = prom(nano(url));
    return target.db.create(dbName).then((body) => {
        let db = target.db.use(dbName);
        return db.insert(awest).then((body) => {
            return db.insert(ckent);
        }).then((body) => {
            return db.insert(jtest);
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
    return server.db.destroy(dbName).catch((err) => {
        console.log("ERROR DESTROYING DB");
        console.log(err);
    });
};

describe(`read view tests on ${dbName}`, function () {
    before(function (done) {
        this.timeout(5000);
        readDbSetup(config).then((result) => {
            done();
        });
    });

    it("reads the appropriate record", function () {
        const configValues = {
            url: config.url,
            user: config.auth.user,
            pass: config.auth.pass,
            db: dbName,
            design: "testViews",
            view: "by_TypeOfLicense"
        };
        return readViewMethod(configValues, logger.child({
            type: "read"
        }), "ID").then((result)=> {
            assert.isTrue(result.rows[0].id === "ckent");
        });
    });

    it("throws a not_found error when record not found", function () {
        const configValues = {
            url: config.url,
            user: config.auth.user,
            pass: config.auth.pass,
            db: dbName,
            design: "testViews",
            view: "by_TypeOfLicense"
        };

        return readViewMethod(configValues, logger.child({
            type: "read"
        }), "HillbillyHitchcock").then((body) => {
            throw new Error ("was_found");
        }).catch((err) => {
            assert.isTrue(err.message === "not_found");
        });
    });

    it("throws a invalid_id error when id undefined", function () {
        const configValues = {
            url: config.url,
            user: config.auth.user,
            pass: config.auth.pass,
            db: dbName,
            design: "testViews",
            view: "by_TypeOfLicense"
        };
        expect(function () {
                readViewMethod(configValues, logger.child({
                    type: "read"
                }));
            }).to.throw("invalid_id");
    });

    it("throws invalid_db error when database doesn't exist", function () {
        const configValues = {
            url: config.url,
            user: config.auth.user,
            pass: config.auth.pass,
            db: "qqqqqqqq",
            design: "testViews",
            view: "by_TypeOfLicense"
        };
        readViewMethod(configValues, logger.child({
                    type: "read"
                }), "awest").catch((err) => {
                    assert.isTrue(err.message === "invalid_db");
                }).catch((err) => {
                    // do nothing but read rid of warning because i'm tests.. i don't care
                });
    });
    it("throws error when config is not correct", function () {
        const configValues = {
            url: config.url,
            user: config.auth.user,
            pass: "hoopla",
            db: dbName,
            design: "testViews",
            view: "by_TypeOfLicense"
        };
        readViewMethod(configValues, logger.child({
                    type: "read"
                }), "awest").catch((err) => {
                    assert.isTrue(err.message === "Name or password is incorrect.");
                }).catch((err) => {
                    // do nothing but read rid of warning because i'm tests.. i don't care
                });
    });

    after(function (done) {
        this.timeout(5000);
        dbTeardown(config).then((result) => {
            done();
        });
    });
});