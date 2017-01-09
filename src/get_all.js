"use strict";

const nano = require("nano"),
      prom = require("nano-promises");

module.exports = function (config, logger) {
    logger.debug({
        config: config
    }, "Begin GetAll Function");
    return new Promise((resolve, reject) => {
        resolve("done");
    });
}