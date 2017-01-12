"use strict";

const nano = require("nano"),
      prom = require("nano-promises"),
      urlBuilder = require("./url_builder.js"),
      getBody = (arr) => arr[0];

module.exports = function (config, logger, id) {
    logger.debug({
        config: config,
        id: id
    }, "Begin Delete Function");
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
        let doc = getBody(body).doc;
        doc._deleted = true;
        return db.insert(body.doc);
    }).catch((err) => {
        logger.debug("An error occurred during deletion");
        return err;
    });
};