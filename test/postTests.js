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
      postMethod = require("../src/post.js"),
      getMethod = require("../src/get.js"),
      pino = require("pino"),
      awest = require("./TestData/adam_west.json"),
      ckent = require("./TestData/clark_kent.json"),
      jtest = require("./TestData/jtest.json");

let logDir = process.env.LOG_DIR || "./",
    logOutput = logDir + "couch_adapter.log",
    logger = pino({
        name: "couch_adapter",
        level: "debug"
    },
    fs.createWriteStream(logOutput, {
        flags: "r+"
    }));

// database setup
const dbSetup = function (configSettings) {
    let url = urlBuilder(configSettings);
    let target = prom(nano(url));
    return target.db.create(dbName).catch((err) => {
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

describe("Post Tests", function ()  {
    before(function (done) {
        this.timeout(5000);
        dbSetup(config).then((result) => {
            done();
        });
    });

    it("creates a document in a db", function () {
        const configValues = {
            url: "http://localhost:5984",
            user: "admin",
            pass: "secret",
            db: dbName
        };
        return postMethod(configValues, logger.child({
            type: "post"
        }), awest).then((result) => {
            return getMethod(configValues, logger.child({
                type: "get"
            }), "awest");
        }).then((doc) => {
            assert.isTrue(doc._id === "awest");
        });
    });

    it("updates a document in a db", function () {
        const configValues = {
            url: "http://localhost:5984",
            user: "admin",
            pass: "secret",
            db: dbName
        };
        awest.test = "Value";
        return postMethod(configValues, logger.child({
            type: "post"
        }), awest).then((result) => {
            return getMethod(configValues, logger.child({
                type: "get"
            }), "awest");
        }).then((doc) => {
            assert.isTrue(doc._id === "awest");
            assert.isTrue(doc.test === "Value");
        });
    });

    after(function (done) {
        this.timeout(5000);
        dbTeardown(config).then((result) => {
            done();
        });
    });
});