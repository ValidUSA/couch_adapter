"use strict";

const nano = require("nano"),
      prom = require("nano-promises"),
      urlBuilder = require("./url_builder.js"),
      sanitizeConfig = require("./sanitize_config.js"),
      getBody = (arr) => arr[0];

module.exports = function (config, logger, id) {
    logger.debug("Begin Read Function");
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
    if (typeof id === "undefined") {
        throw new Error("invalid_id");
    }
    return db.get(id)
    .then((result) => {
        const doc = getBody(result);
        logger.debug("Document retrieved");
        let format = {
            total_rows: 1,
            offset: 0,
            rows: [
                {
                    id: doc._id,
                    key: doc._id,
                    value: {
                        rev: doc.rev
                    },
                    doc: doc
                }
            ]
        };
        return format;
    })
    .catch((err) => {
        if (err.error === "not_found") {
            logger.debug("Record not found.");
            throw new Error("not_found");
        } else {
            logger.error("Error retrieving document");
            logger.error(`Error Mesage: ${err.reason}`);
            logger.error("Configuration: ", sanitizeConfig(config));
            throw new Error(err.message);
        }
    });
};