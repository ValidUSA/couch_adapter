"use strict";

const chai = require("chai"),
      assert = chai.assert,
      expect = chai.expect,
      _ = require("lodash"),
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
        assert.isFunction(adapter.get);
        assert.isFunction(adapter.post);
        assert.isFunction(adapter.delete);
        assert.isFunction(adapter.getAll);
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
        let config = {
            url: "http://test.test.com",
            user: "admin",
            db: "users"
        };
        process.env.COUCH_PASS = "";
        expect(function () {
            couchAdapter(config);
        }).to.throw("invalid_pass");
    });
    it("calls passed function", function () {
        let config = {
            db: "users",
            user: "admin",
            pass: "somepass",
            url: "http://test.test.com",
            get: testFunction,
            logLevel: "debug"
        };
        let adapter = couchAdapter(config);
        adapter.get("12345")
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
            getAll: testGetAllFunction,
            logLevel: "debug"
        };
        let adapter = couchAdapter(config);
        adapter.getAll(10, 50).then((result) => {
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
    it("Calls post function", function () {
        let config = {
            db: "users",
            user: "admin",
            pass: "somepass",
            url: "http://test.test.com",
            post: testPostFunction,
            logLevel: "debug"
        };
        let adapter = couchAdapter(config);
        adapter.post({
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
            post: testPostFunction,
            logLevel: "debug"
        };
        let adapter = couchAdapter(config);
        let npmPackage = require("../package.json");
        assert.isTrue(npmPackage.version === adapter.getVersion());
    });
    it("changes log levels", function () {
        let config = {
            db: "users",
            user: "admin",
            pass: "somepass",
            url: "http://test.test.com",
            post: testPostFunction,
            logLevel: "debug"
        };
        let adapter = couchAdapter(config);
        assert.isTrue(adapter.logLevel() === "debug");
        assert.isTrue(adapter.logLevel("info") === "info");
    });
    it("tests whether i can do things on constuction", function () {
        let config = {
            db: "users",
            user: "admin",
            pass: "somepass",
            url: "http://test.test.com",
            get: testFunction,
            logLevel: "debug"
        };
        couchAdapter(config).get("12345").then((result) => {
            assert.isTrue(result.id === "12345");
        }).catch((err) => {
            console.log(err);
        });
    });
});