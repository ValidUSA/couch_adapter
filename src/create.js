"use strict";

const nano = require("nano"),
      prom = require("nano-promises"),
      getBody = (arr) => arr[0],
      urlBuilder = require("./url_builder.js"),
      sanitizeConfig = require("./sanitize_config.js");

module.exports = function (config, logger, doc) {
    logger.debug("Begin Create Function");
    let dbConfig = {
        url: config.url,
        auth: {
            user: config.user,
            pass: config.pass
        }
    },
    url = urlBuilder(dbConfig),
    db = prom(nano(url)).db.use(config.db);
    if (typeof doc._rev !== "undefined") {
        throw new Error("invalid_doc_state");
    }
    return db.insert(doc).then((body) => {
        logger.debug("Insert Successful");
        return getBody(body);
    }).catch((err)=> {
        logger.error("Insert Failed");
        logger.error(`Error Message: ${err.message}`);
        logger.error("Configuration:", sanitizeConfig(config));
        throw err;
    });
};