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
exports.FILE_ENCODING = void 0;
exports.read = read;
exports.write = write;
const fs_1 = __importDefault(require("fs"));
exports.FILE_ENCODING = "utf8";
function read(file, parser) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            fs_1.default.readFile(file, exports.FILE_ENCODING, (err, data) => {
                if (err)
                    return reject(err);
                const parsed = parser(data);
                return resolve(parsed);
            });
        });
    });
}
function write(file, data) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            fs_1.default.writeFile(file, data, exports.FILE_ENCODING, (err) => {
                if (err)
                    return reject(err);
                return resolve(null);
            });
        });
    });
}
