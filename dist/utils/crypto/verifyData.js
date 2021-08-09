"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var stringToArrayBuffer_1 = __importDefault(require("../stringToArrayBuffer"));
function verifyData(data, signature, publicKey) {
    return window.crypto.subtle.verify({
        name: "ECDSA",
        hash: { name: "SHA-256" }, // can be "SHA-1", "SHA-256", "SHA-384", or "SHA-512"
    }, publicKey, // from generateKey or importKey above
    stringToArrayBuffer_1.default(signature), // ArrayBuffer of the signature
    stringToArrayBuffer_1.default(data) // ArrayBuffer of the data
    );
}
exports.default = verifyData;
