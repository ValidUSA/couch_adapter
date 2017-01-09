"use strict";

const pino = require("pino"),
      fs = require("fs"),
      get = require("./src/get.js"),
      deleteId = require("./src/delete.js"),
      put = require("./src/put.js"),
      getAll = require("./src/get_all.js"),
      post = require("./src/post.js");
let logDir = process.env.LOG_DIR || "./",
    logOutput = logDir + "couch_adapter.log",
    logger = pino({
        name: "couch_adapter"
    },
    fs.createWriteStream(logOutput)),
    couchUrl = process.env.COUCH_URL || "",
    couchPass = process.env.COUCH_PASS || "",
    couchUser = process.env.COUCH_USER || "";

module.export = function ({
    url = couchUrl,
    user = couchUser,
    pass = couchPass,
    db = ""
} = {}) {
    logger.debug("Begin couch_adapter constructor.");
    let config = {
        url: url,
        user: user,
        pass: pass,
        db: db
    };
    if (config.db === "") {
        logger.error("Invalid db", config);
        throw new Error("Invalid db");
    }
    logger.info({
        config: config
    },
        "couch_adapter constructed.");
    logger.debug("End couch_adapter constructor.");
    return {
        get: (id) => {
            logger.debug(id, "Perform Get");
            return get(config, logger.child({
                type: "get"
            }), id);
        },
        put: (doc) => {
            logger.debug(doc, "Perform Put");
            return put(config, logger.child({
                type: "put"
            }), doc);
        },
        post: (doc) => {
            logger.debug(doc, "Perform Post");
            return post(config, logger.child({
                type: "post"
            }), doc);
        },
        delete: (id) => {
            logger.debug(id, "Perform Delete");
            return deleteId(config, logger.child({
                type: "put"
            }), id);
        },
        getAll: () => {
            logger.debug("Perform GetAll");
            return getAll(config, logger.child({
                type: "put"
            }));
        }
    };
}