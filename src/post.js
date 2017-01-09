"use strict";

const nano = require("nano"),
      prom = require("nano-promises");

module.exports = function (config, logger, doc) {
    logger.debug({
        config: config,
        doc: doc
    }, "Begin Post Function");
    return new Promise((resolve, reject) => {
        resolve("done");
    });
}