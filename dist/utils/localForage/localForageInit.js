"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var localforage_1 = __importDefault(require("localforage"));
function localForageInit() {
    localforage_1.default.config({
        driver: localforage_1.default.WEBSQL,
        name: "toolChain",
        version: 1.0,
        size: 4980736,
        storeName: "keyvaluepairs",
        description: "toolChain data storage.",
    });
}
exports.default = localForageInit;
