"use strict";

const nano = require("nano"),
      prom = require("nano-promises"),
      urlBuilder = require("./url_builder.js"),
      sanitizeConfig = require("./sanitize_config.js"),
      getBody = (arr) => arr[0];

module.exports = function (config, logger) {
    logger.debug("Begin Read Bulk Function");
    let dbConfig = {
        url: config.url,
        auth: {
            user: config.user,
            pass: config.pass
        }
    },
    url = urlBuilder(dbConfig),
    db = prom(nano(url)).db.use(config.db),
        params = {
        skip: config.skip,
        limit: config.limit,
        include_docs: true,
        startkey: "_"
    };

    return db.list(params).then((body) => {
        logger.debug("Docs Retrieved");
        return getBody(body);
    }).catch((err) => {
        logger.error(`An error occurred listing contents of ${config.db} db1`);
        logger.error("Configuration:", sanitizeConfig(config));
        throw err;
    });
};