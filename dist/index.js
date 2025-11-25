"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const files_1 = require("utils/files");
const router_1 = __importDefault(require("router"));
const db_1 = __importDefault(require("database/db"));
const error_handler_1 = require("error/error-handler");
const logs_1 = require("middleware/logs");
const express_logger_functions_1 = require("express-logger-functions");
(0, express_logger_functions_1.loggerLevel)(express_logger_functions_1.LogLevel.INFO);
(0, error_handler_1.listenUnhandledRejections)();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(logs_1.initRequestLogger);
app.use(logs_1.enableLoggedResponses);
app.use(router_1.default);
app.use(error_handler_1.errorHandler);
const PORT = process.env.PORT || 8800;
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
(() => __awaiter(void 0, void 0, void 0, function* () {
    yield db_1.default.query(yield (0, files_1.read)('src/database/schema.sql', (x) => x));
}))();
