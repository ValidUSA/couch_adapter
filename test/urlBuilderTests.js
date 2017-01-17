"use strict";

const chai = require("chai"),
      assert = chai.assert,
      randomstring = require("randomstring"),
      expect = chai.expect,
      urlBuilder = require("../src/url_builder.js");

describe("URL Builder Tests", function () {
    it("builds an appropriate url with user/pass", function () {
        let config = {
            url: "http://localhost:5984",
            auth: {
                user: "admin",
                pass: "kerjej"
            }
        };
        let url = urlBuilder(config);
        assert.isTrue(url === "http://admin:kerjej@localhost:5984");
    });

    it("builds an appropriate https url with user/pass", function () {
        let config = {
            url: "https://localhost:5984",
            auth: {
                user: "admin",
                pass: "kerjej"
            }
        };
        let url = urlBuilder(config);
        assert.isTrue(url === "https://admin:kerjej@localhost:5984");
    });

    it("builds an appropriate https url with useSSL is true", function () {
        let config = {
            url: "http://localhost:5984",
            auth: {
                user: "admin",
                pass: "kerjej"
            },
            useSSL: true
        };
        let url = urlBuilder(config);
        assert.isTrue(url === "https://admin:kerjej@localhost:5984");
    });

    it("builds an appropriate url when no http or http is passed", function () {
        let config = {
            url: "localhost:5984",
            auth: {
                user: "admin",
                pass: "kerjej"
            },
            useSSL: false
        };
        let url = urlBuilder(config);
        assert.isTrue(url === "http://admin:kerjej@localhost:5984");
    });

    it("throws an error if user is missing", function () {
        let config = {
            url: "http://localhost:5984",
            auth: {
                pass: "kerjej"
            },
            useSSL: true
        };
        expect(function () {
            urlBuilder(config);
        }).to.throw("Missing Username");
    });

    it("throws an error if password is missing", function () {
        let config = {
            url: "http://localhost:5984",
            auth: {
                user: "admin"
            },
            useSSL: true
        };
        expect(function () {
            urlBuilder(config);
        }).to.throw("Missing Password");
    });

    it("throws an error if auth object is missing", function () {
        let config = {
            url: "http://localhost:5984",
            useSSL: true
        };
        expect(function () {
            urlBuilder(config);
        }).to.throw("Missing Auth Object");
    });

    it("throws an error if url is missing", function () {
        let config = {
            auth: {
                pass: "kerjej"
            },
            useSSL: true
        };
        expect(function () {
            urlBuilder(config);
        }).to.throw("Missing URL");
    });
});