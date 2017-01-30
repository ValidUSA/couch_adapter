"use strict";

const pino = require("pino"),
      fs = require("fs"),
      defaultRead = require("./src/read.js"),
      defaultDelete = require("./src/delete.js"),
      defaultReadBulk = require("./src/read_bulk.js"),
      defaultCreate = require("./src/create.js"),
      defaultUpdate = require("./src/update.js"),
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
    read = defaultRead,
    deleteId = defaultDelete,
    readBulk = defaultReadBulk,
    create = defaultCreate,
    update = defaultUpdate,
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
    logger.info(`Couch Adapter Constructed for: ${config.db}`);
    logger.debug("End couch_adapter constructor.");
    return {
        read: (id) => {
            logger.debug(id, "Perform Read");
            return read(config, logger.child({
                type: "read"
            }), id);
        },
        create: (doc) => {
            logger.debug(doc, "Perform Create");
            return create(config, logger.child({
                type: "Create"
            }), doc);
        },
        delete: (id) => {
            logger.debug(id, "Perform Delete");
            return deleteId(config, logger.child({
                type: "delete"
            }), id);
        },
        readBulk: (skip = 0, limit = 50) => {
            config.limit = limit;
            config.skip = skip;
            logger.debug("Perform Read Bulk");
            return readBulk(config, logger.child({
                type: "read bulk"
            }));
        },
        update: (doc) => {
            logger.debug(doc, "Perform Update");
            return update(config, logger.child({
                type: "update"
            }), doc);
        },
        getVersion: () => {
            let version = process.env.npm_package_version || require("./package.json").version;
            return version;
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