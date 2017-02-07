"use strict";

const nano = require("nano"),
      prom = require("nano-promises"),
      getBody = (arr) => arr[0],
      urlBuilder = require("./url_builder.js"),
      sanitizeConfig = require("./sanitize_config.js");

module.exports = function (config, logger, doc) {
    logger.debug("Begin Update Function");
    if (!doc._rev || doc._rev === "") {
        throw new Error("invalid_doc_state");
    }
    let dbConfig = {
        url: config.url,
        auth: {
            user: config.user,
            pass: config.pass
        }
    },
    url = urlBuilder(dbConfig),
    db = prom(nano(url)).db.use(config.db);
    return db.insert(doc).then((body) => {
        logger.debug("Update Successful");
        return getBody(body);
    }).catch((err)=> {
        logger.error("Insert Failed");
        logger.error(`Error Message: ${err.message}`);
        logger.error("Configuration:", sanitizeConfig(config));
        throw err;
    });
};