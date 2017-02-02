"use strict";

const chai = require("chai"),
      assert = chai.assert,
      fs = require("fs"),
      nano = require("nano"),
      prom = require("nano-promises"),
      randomstring = require("randomstring"),
      config = require("./configData/config.json"),
      urlBuilder = require("../src/url_builder.js"),
      createDbName = randomstring.generate({
        length: 15,
        capitalization: "lowercase",
        charset: "alphabetic"
    }),
      createMethod = require("../src/create.js"),
      readMethod = require("../src/read.js"),
      pino = require("pino"),
      createWest = {
        _id: "awest2",
        schema: "wadol",
        encounterId: "12345"
    };

let logDir = process.env.LOG_DIR || "./",
    logOutput = logDir + "couch_adapter_createTests.log",
    logger = pino({
        name: "couch_adapter",
        level: "debug"
    },
    fs.createWriteStream(logOutput));
createWest._id = "awest2";
// database setup
const dbSetup = function (configSettings) {
    let url = urlBuilder(configSettings);
    let target = prom(nano(url));
    return target.db.create(createDbName).catch((err) => {
        // console.log(err);
        return err;
    });
};

const dbTeardown = (configSettings) => {
    let url = urlBuilder(configSettings);
    let server = prom(nano(url));
    return server.db.destroy(createDbName).catch((err) => {
        console.log("ERROR DESTROYING DB");
        console.log(err);
    });
};

describe(`Create Tests on ${createDbName}`, function ()  {
    before(function (done) {
        this.timeout(5000);
        dbSetup(config).then((result) => {
            done();
        });
    });

    it("creates a document in a db", function () {
        const configValues = {
            url: config.url,
            user: config.auth.user,
            pass: config.auth.pass,
            db: createDbName
        };
        return createMethod(configValues, logger.child({
            type: "create"
        }), createWest).then((result) => {
            return readMethod(configValues, logger.child({
                type: "read"
            }), "awest2");
        }).then((doc) => {
            assert.isTrue(doc.rows[0].id === "awest2");
        });
    });

    it("updates a document in a db", function () {
        const configValues = {
            url: config.url,
            user: config.auth.user,
            pass: config.auth.pass,
            db: createDbName
        };
        createWest.test = "Value";
        return createMethod(configValues, logger.child({
            type: "create"
        }), createWest).then((result) => {
            return readMethod(configValues, logger.child({
                type: "read"
            }), "awest2");
        }).then((doc) => {
            assert.isTrue(doc.rows[0].id === "awest2");
            assert.isTrue(doc.rows[0].doc.test === "Value");
        });
    });

    it("Throws an errror when config is wrong", function () {
        const configValues = {
            url: config.url,
            user: config.auth.user,
            pass: "hooplah",
            db: createDbName
        };
        createWest.test = "Value";
        return createMethod(configValues, logger.child({
            type: "create"
        }), createWest).then((result) => {
            return readMethod(configValues, logger.child({
                type: "read"
            }), "awest");
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