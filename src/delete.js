"use strict";

const nano = require("nano"),
      prom = require("nano-promises"),
      urlBuilder = require("./url_builder.js"),
      sanitizeConfig = require("./sanitize_config.js"),
      getBody = (arr) => arr[0];

module.exports = function (config, logger, id) {
    logger.debug("Begin Delete Function");
    let dbConfig = {
        url: config.url,
        auth: {
            user: config.user,
            pass: config.pass
        }
    },
    url = urlBuilder(dbConfig),
    db = prom(nano(url)).db.use(config.db);
    return db.get(id).then((body) => {
        logger.debug("Retrieved Doc for deletion");
        let doc = getBody(body);
        doc._deleted = true;
        return db.insert(doc);
    }).then((result) => {
        return getBody(result);
    }).catch((err) => {
        logger.error("An error occurred during deletion");
        logger.error(`Error Message: ${err.message}`);
        logger.error("Configuration: ", sanitizeConfig(config));
        if (err.message === "missing") {
            throw new Error("not_found");
        }
        throw err;
    });
};