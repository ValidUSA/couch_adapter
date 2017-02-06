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
      updateDbName = randomstring.generate({
        length: 15,
        capitalization: "lowercase",
        charset: "alphabetic"
    }),
      updateMethod = require("../src/update.js"),
      readMethod = require("../src/read.js"),
      pino = require("pino"),
      updateWest = {
        _id: "awest3",
        schema: "wadol",
        encounterId: "12345"
    };

let logDir = process.env.LOG_DIR || "./",
    logOutput = logDir + "couch_adapter_updateTests.log",
    logger = pino({
        name: "couch_adapter",
        level: "debug"
    },
    fs.createWriteStream(logOutput));

// database setup
const dbSetup = function (configSettings) {
    let url = urlBuilder(configSettings);
    let target = prom(nano(url));
    return target.db.create(updateDbName).then((body) => {
        let db = target.db.use(updateDbName);
        db.insert(updateWest);
    }).catch((err) => {
        // console.log(err);
        return err;
    });
};

const dbTeardown = (configSettings) => {
    let url = urlBuilder(configSettings);
    let server = prom(nano(url));
    return server.db.destroy(updateDbName).catch((err) => {
        console.log("ERROR DESTROYING DB");
        console.log(err);
    });
};

describe(`Update Tests on ${updateDbName}`, function ()  {
    before(function (done) {
        this.timeout(5000);
        dbSetup(config).then((result) => {
            done();
        });
    });

    it("updates a document in a db", function () {
        const configValues = {
            url: config.url,
            user: config.auth.user,
            pass: config.auth.pass,
            db: updateDbName
        };
        return readMethod(configValues, logger.child({
                type: "read"
            }), "awest3").then((result) => {
            let doc = result.rows[0].doc;
            doc.test = "Value";
            return updateMethod(configValues, logger.child({
                type: "update"
            }), doc);
        }).then((result) => {
            return readMethod(configValues, logger.child({
                type: "read"
            }), "awest3");
        }).then((doc) => {
            assert.isTrue(doc.rows[0].id === "awest3");
            assert.isTrue(doc.rows[0].doc.test === "Value");
        });
    });

    it("Throws an error if revision is not on a document", function () {
        const configValues = {
            url: config.url,
            user: config.auth.user,
            pass: config.auth.pass,
            db: updateDbName
        };
        expect(function () {
            updateMethod(configValues, logger.child({
                type: "update"
            }), updateWest);
        }).to.throw("invalid_revision");
    });

    after(function (done) {
        this.timeout(5000);
        dbTeardown(config).then((result) => {
            done();
        });
    });
});