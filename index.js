"use strict";

const pino = require("pino"),
      fs = require("fs"),
      defaultGet = require("./src/get.js"),
      defaultDelete = require("./src/delete.js"),
      defaultGetAll = require("./src/get_all.js"),
      defaultPost = require("./src/post.js");
let logDir = process.env.LOG_DIR || "./",
    logOutput = logDir + "couch_adapter.log",
    logger = pino({
        name: "couch_adapter"
    },
    fs.createWriteStream(logOutput)),
    couchUrl = process.env.COUCH_URL || "",
    couchPass = process.env.COUCH_PASS || "",
    couchUser = process.env.COUCH_USER || "";

module.exports = function ({
    url = couchUrl,
    user = couchUser,
    pass = couchPass,
    db = "",
    get = defaultGet,
    deleteId = defaultDelete,
    getAll = defaultGetAll,
    post = defaultPost,
    logLevel = "info"
} = {}) {
    logger.level = logLevel;
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
        post: (doc) => {
            logger.debug(doc, "Perform Post");
            return post(config, logger.child({
                type: "post"
            }), doc);
        },
        delete: (id) => {
            logger.debug(id, "Perform Delete");
            return deleteId(config, logger.child({
                type: "delete"
            }), id);
        },
        getAll: (skip = 0, limit = 50) => {
            config.limit = limit;
            config.skip = skip;
            logger.debug("Perform GetAll");
            return getAll(config, logger.child({
                type: "getAll"
            }));
        }
    };
};