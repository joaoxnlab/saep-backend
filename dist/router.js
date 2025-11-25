"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const error_classes_1 = require("error/error-classes");
const router = (0, express_1.Router)();
router.use('/test', (req, res, next) => {
    res.status(200).json({
        "success": true
    });
});
router.all('/{*path}', (req, _res, next) => {
    next(new error_classes_1.HttpError(404, `Router with Path '${req.originalUrl}' Not Found`));
});
exports.default = router;
