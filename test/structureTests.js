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
        }).to.throw("Invalid db");
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
});