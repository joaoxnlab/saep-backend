"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.jsonParserHandler = jsonParserHandler;
exports.errorHandler = errorHandler;
exports.listenUnhandledRejections = listenUnhandledRejections;
const logger = __importStar(require("express-logger-functions"));
const error_classes_1 = require("./error-classes");
function jsonParserHandler(err, _req, _res, _next) {
    if (err instanceof SyntaxError && 'body' in err)
        throw new error_classes_1.HttpError(400, `Malformed JSON in Request Body: ${err.message}`, err);
    throw err;
}
function logError(req, httpError, err) {
    if (!(err instanceof Error)) {
        logger.fatal(req, "A non-error landed on errorHandler.", httpError);
        logger.warn(req, "Data landed on handler:", err);
    }
    else if (httpError.statusCode >= 500) {
        logger.error(req, httpError);
    }
    else if ([401, 403].includes(httpError.statusCode)) {
        logger.warn(req, httpError);
    }
    else
        logger.debug(req, httpError);
    if (err instanceof Error)
        logger.trace(req, "Error landed on handler:", err);
}
function errorHandler(err, req, res, _next) {
    const httpError = err instanceof error_classes_1.HttpError
        ? err
        : !(err instanceof Error)
            ? new error_classes_1.HttpError(500)
            : error_classes_1.DatabaseError.isRawDatabaseError(err)
                ? error_classes_1.HttpError.fromDatabaseError(err)
                : new error_classes_1.HttpError(500, err.message, err);
    const handler = new error_classes_1.HttpErrorHandler(httpError);
    logger.error(req, handler);
    logError(req, httpError, err);
    res.status(handler.status).json(handler);
}
function listenUnhandledRejections() {
    process.on('unhandledRejection', (reason, promise) => {
        logger.log(logger.LogLevel.FATAL, '(UNKNOWN method)', '(UNKNOWN url)', console.error, 'UnhandledRejection fatal error:', reason);
        logger.log(logger.LogLevel.DEBUG, '(UNKNOWN method)', '(UNKNOWN url)', console.error, 'Unhandled Promise:', promise);
    });
}
