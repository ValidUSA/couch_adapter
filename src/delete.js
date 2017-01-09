"use strict";

const nano = require("nano"),
      prom = require("nano-promises");

module.exports = function (config, logger, id) {
    logger.debug({
        config: config,
        id: id
    }, "Begin Delete Function");
    return new Promise((resolve, reject) => {
        resolve("done");
    });
};