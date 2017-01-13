"use strict";

module.exports = function (config) {
    let url = "http";
    if (typeof config.url === "undefined") {
        throw new Error("Missing URL");
    }
    if (typeof config.auth === "undefined") {
        throw new Error("Missing Auth Object");
    }
    if (typeof config.auth.user === "undefined") {
        throw new Error("Missing Username");
    }
    if (typeof config.auth.pass === "undefined") {
        throw new Error("Missing Password");
    }
    if (config.useSSL || config.url.startsWith("https://")) {
        url += "s://";
    } else {
        url += "://";
    }
    url += config.auth.user + ":" + config.auth.pass + "@";
    if (config.url.startsWith("https://")) {
        url += config.url.substring(8);
    } else if (config.url.startsWith("http://")) {
        url += config.url.substring(7);
    } else {
        url += config.url;
    }
    return url;
};