"use strict";

const nano = require("nano"),
      prom = require("nano-promises"),
      urlBuilder = require("./url_builder.js"),
      getBody = (arr) => arr[0];

module.exports = function (config, logger, id) {
    logger.debug({
        config: config,
        id: id
    }, "Begin Get Function");
    let dbConfig = {
        url: config.url,
        auth: {
            user: config.user,
            pass: config.pass
        }
    },
    url = urlBuilder(dbConfig),
    server = prom(nano(url)),
    db = server.db.use(config.db);
    return db.get(id)
    .then((doc) => {
        logger.debug("Document retrieved");
        return getBody(doc);
    })
    .catch((err) => {
        logger.error("Error retrieving document");
        throw err;
    });
};