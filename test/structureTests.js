"use strict";

process.env.COUCH_URL = "";
process.env.COUCH_USER = "";
process.env.COUCH_PASS = "";

const chai = require("chai"),
      assert = chai.assert,
      expect = chai.expect,
      couchAdapter = require("../index.js");

const testFunction = function (config, logger, id) {
    logger.debug({
        config: config,
        id: id
    }, "Begin Test Function");
    return new Promise((resolve, reject) => {
        resolve({
            config: config,
            id: id
        });
    });
};

const testDeleteFunction = function (config, logger, id) {
    logger.debug({
        config: config,
        id: id
    }, "Begin TestDelete Function");
    return new Promise((resolve, reject) => {
        resolve({
            config: config,
            id: id
        });
    });
};

const testPostFunction = function (config, logger, doc) {
    logger.debug({
        config: config,
        doc: doc
    }, "Begin TestPost Function");
    return new Promise((resolve, reject) => {
        resolve({
            config: config,
            doc: doc
        });
    });
};

const testGetAllFunction = function (config, logger) {
    logger.debug({
        config: config
    }, "Begin TestGetAllFunction");
    return new Promise((resolve, reject) => {
        resolve({
            config: config
        });
    });
};

describe("Structural Tests", function () {
    it("returns an object with appropriate functions", function () {
        let config = {
            db: "users",
            user: "admin",
            pass: "somepass",
            url: "http://test.test.com"
        };
        let adapter = couchAdapter(config);
        assert.isObject(adapter);
        assert.isFunction(adapter.read);
        assert.isFunction(adapter.create);
        assert.isFunction(adapter.delete);
        assert.isFunction(adapter.readBulk);
        assert.isFunction(adapter.update);
    });
    it ("throws error when no db is passed", function () {
        let config = {
            user: "admin",
            pass: "somepass",
            url: "http://test.test.com"
        };
        expect(function () {
            couchAdapter(config);
        }).to.throw("invalid_db");
    });
    it("throws an error when no url is passed and no environment variable is set", function () {
        let config = {
            url: undefined,
            user: "admin",
            pass: "somepass",
            db: "users"
        };
        process.env.COUCH_URL = "";
        expect(function () {
            couchAdapter(config);
        }).to.throw("invalid_url");
    });
    it("throws an error when no user is passed and no environment variable is set", function () {
        let config = {
            user: undefined,
            url: "http://test.test.com",
            pass: "somepass",
            db: "users"
        };
        process.env.COUCH_USER = "";
        expect(function () {
            couchAdapter(config);
        }).to.throw("invalid_user");
    });
    it("throws an error when no pass is passed and no environment variable is set", function () {
        process.env.COUCH_PASS = undefined;
        let config = {
            pass: undefined,
            url: "http://test.test.com",
            user: "admin",
            db: "users"
        };
        process.env.COUCH_PASS = "";
        expect(function () {
            couchAdapter(config);
        }).to.throw("invalid_pass");
    });
    it("throws an error when view is set, but no design is passed", function () {
        let config = {
            url: "http://test.test.com",
            user: "admin",
            pass: "llamas",
            db: "users",
            view: "byId"
        };
        process.env.COUCH_PASS = "";
        expect(function () {
            couchAdapter(config);
        }).to.throw("invalid_design");
    });
    it("calls passed function", function () {
        let config = {
            db: "users",
            user: "admin",
            pass: "somepass",
            url: "http://test.test.com",
            read: testFunction,
            logLevel: "debug"
        };
        let adapter = couchAdapter(config);
        adapter.read("12345")
        .then((val) => {
            assert.isTrue(val.id === "12345");
        })
        .catch((err) => {
            console.log(err);
        });
    });
    it("applies skip and limit to config", function () {
        let config = {
            db: "users",
            user: "admin",
            pass: "somepass",
            url: "http://test.test.com",
            readBulk: testGetAllFunction,
            logLevel: "debug"
        };
        let adapter = couchAdapter(config);
        adapter.readBulk(10, 50).then((result) => {
            assert.isTrue(result.config.skip === 10);
            assert.isTrue(result.config.limit === 50);
        });
    });
    it("Calls delete function", function () {
        let config = {
            db: "users",
            user: "admin",
            pass: "somepass",
            url: "http://test.test.com",
            delete: testDeleteFunction,
            logLevel: "debug"
        };
        let adapter = couchAdapter(config);
        adapter.delete("12345").then((result) => {
            assert.isTrue(result.id === "12345");
        });
    });
    it("Calls create function", function () {
        let config = {
            db: "users",
            user: "admin",
            pass: "somepass",
            url: "http://test.test.com",
            create: testPostFunction,
            logLevel: "debug"
        };
        let adapter = couchAdapter(config);
        adapter.create({
            id: "12345"
        }).then((result) => {
            assert.isTrue(result.doc.id === "12345");
        });
    });
    it("Calls update function", function () {
        let config = {
            db: "users",
            user: "admin",
            pass: "somepass",
            url: "http://test.test.com",
            update: testPostFunction,
            logLevel: "debug"
        };
        let adapter = couchAdapter(config);
        adapter.update({
            id: "12345"
        }).then((result) => {
            assert.isTrue(result.doc.id === "12345");
        });
    });
    it("gets correct version number", function () {
        let config = {
            db: "users",
            user: "admin",
            pass: "somepass",
            url: "http://test.test.com",
            logLevel: "debug"
        };
        let adapter = couchAdapter(config);
        let npmPackage = require("../package.json");
        adapter.getVersion().then((result) => {
            assert.isTrue(npmPackage.version === result.version);
        });
    });
    it("tests whether i can do things on constuction", function () {
        let config = {
            db: "users",
            user: "admin",
            pass: "somepass",
            url: "http://test.test.com",
            logLevel: "debug"
        };
        couchAdapter(config).read("12345").then((result) => {
            assert.isTrue(result.id === "12345");
        }).catch((err) => {
            console.log(err);
        });
    });
});