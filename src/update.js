"use strict";

const nano = require("nano"),
      prom = require("nano-promises"),
      getBody = (arr) => arr[0],
      urlBuilder = require("./url_builder.js"),
      sanitizeConfig = require("./sanitize_config.js");

module.exports = function (config, logger, doc) {
    logger.debug("Begin Update Function");
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
        logger.debug("Initial Insert Successful");
        return "Success";
    }).catch((reason) => {
        if (reason.message === "Document update conflict.") {
            logger.debug("Initial Insert Failed, Checking Revision");
            return db.head(doc._id);
        } else {
            throw reason;
        }
    }).then((header) => {
        if (header !== "Success") {
            logger.debug("Trying to insert with rev: ", header[1].etag.replace(/"/g, ""));
            doc._rev = header[1].etag.replace(/"/g, "");
            return db.insert(doc);
        } else {
            return header;
        }
    }).then((body) => {
        if (body !== "Success") {
            logger.debug("Second Insert Successful");
            return getBody(body);
        } else {
            logger.debug("Initial was successful, passing along");
            return body;
        }
    }).catch((err)=> {
        logger.error("Insert Failed");
        logger.error(`Error Message: ${err.message}`);
        logger.error("Configuration:", sanitizeConfig(config));
        throw err;
    });
};