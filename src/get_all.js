"use strict";

const nano = require("nano"),
      prom = require("nano-promises"),
      urlBuilder = require("./url_builder.js"),
      getBody = (arr) => arr[0];

module.exports = function (config, logger) {
    logger.debug({
        config: config
    }, "Begin GetAll Function");
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
        include_docs: true
    };

    return db.list(params).then((body) => {
        logger.debug("Docs Retrieved");
        return getBody(body).rows;
    }).catch((err) => {
        logger.debug("An error occurred listing contents of {$1} db", config.db);
        throw err;
    });
};