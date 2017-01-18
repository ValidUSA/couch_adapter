"use strict";

const pino = require("pino"),
      fs = require("fs"),
      defaultGet = require("./src/get.js"),
      defaultDelete = require("./src/delete.js"),
      defaultGetAll = require("./src/get_all.js"),
      defaultPost = require("./src/post.js"),
      fixLength = (val) => {
        if (val && val.toString().length < 2) {
            return `0${val}`;
        } else {
            return val.toString();
        }
    };
let logDir = process.env.LOG_DIR || "./",
    todaysDate = new Date(),
    logOutput = logDir + `couch_adapter_${fixLength(todaysDate.getMonth() + 1)}${fixLength(todaysDate.getDate())}${todaysDate.getFullYear()}.log`,
    logger = pino({
        name: "couch_adapter"
    },
    fs.createWriteStream(logOutput, {
        flags: "a+"
    })),
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
        logger.error("invalid_db", config);
        throw new Error("invalid_db");
    }
    if (config.url === "") {
        logger.error("invalid_url", config);
        throw new Error("invalid_url");
    }
    if (config.user === "") {
        logger.error("invalid_user", config);
        throw new Error("invalid_user");
    }
    if (config.pass === "") {
        logger.error("invalid_pass or your security sucks", config);
        throw new Error("invalid_pass");
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
        },
        getVersion: () => {
            return process.env.npm_package_version;
        },
        logLevel: (level) => {
            if (typeof level === "undefined") {
                return logger.level;
            } else {
                logger.level = level;
                return logger.level;
            }
        }
    };
};