"use strict";

const chai = require("chai"),
      assert = chai.assert,
      randomstring = require("randomstring"),
      expect = chai.expect,
      sanitizeConfig = require("../src/sanitize_config.js");

describe("sanitize config tests", function () {
    it("changes password to string of asteriks of the same length", function () {
        let config = {
            pass: "abcdefghijk"
        };
        let newConfig = sanitizeConfig(config);
        assert.isTrue(newConfig.pass === "*******");
    });
    it("changes username to string of asteriks of the same length", function () {
        let config = {
            user: "abcdefghijk"
        };
        let newConfig = sanitizeConfig(config);
        assert.isTrue(newConfig.user === "*******");
    });
    it("changes username and password to string of asteriks of the same length", function () {
        let config = {
            user: "abcdefghijk",
            pass: "abcdefghijk"
        };
        let newConfig = sanitizeConfig(config);
        assert.isTrue(newConfig.user === "*******");
        assert.isTrue(newConfig.pass === "*******");
    });
    it("changes username and password that reside in object", function () {
        let config = {
            auth: {
                user: "abcdefghijk",
                pass: "abcdefghijk"
            }
        };
        let newConfig = sanitizeConfig(config);

        assert.isTrue(newConfig.auth.user === "*******");
        assert.isTrue(newConfig.auth.pass === "*******");
    });
    it("goes even deeper", function () {
        let config = {
            auth: {
                completely: {
                    uneccessary: {
                        depth: {
                            user: "abcdefghijk",
                            pass: "abcdefghijk"
                        }
                    }
                }
            }
        };
        let newConfig = sanitizeConfig(config);
        assert.isTrue(newConfig.auth.completely.uneccessary.depth.user === "*******");
        assert.isTrue(newConfig.auth.completely.uneccessary.depth.pass === "*******");
    });
    it("does not change object without user, pass, username, password, or pwd", function () {
        let config = {
            hello: "world"
        };
        let newConfig = sanitizeConfig(config);
        assert.isTrue(JSON.stringify(config) === JSON.stringify(newConfig));
    });
    it("hits all of the aliases user, pass, username, password, and pwd", function () {
        let config = {
            user: "abcdefghijk",
            pass: "abcdefghijk",
            username: "abcdefghijk",
            password: "abcdefghijk",
            pwd: "abcdefghijk"
        };
        let newConfig = sanitizeConfig(config);
        assert.isTrue(newConfig.user === "*******");
        assert.isTrue(newConfig.pass === "*******");
        assert.isTrue(newConfig.username === "*******");
        assert.isTrue(newConfig.password === "*******");
        assert.isTrue(newConfig.pwd === "*******");
    });
});