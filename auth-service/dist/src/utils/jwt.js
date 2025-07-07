"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signToken = signToken;
exports.verifyToken = verifyToken;
// src/utils/jwt.ts
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const SECRET = process.env.JWT_SECRET ?? '';
/**
 * Generate a JWT token with a flexible expiresIn option.
 * @param payload - the payload to sign (string, object, or Buffer)
 * @param expiresIn - expiry duration (e.g., '1h', 3600)
 * @returns signed JWT string
 */
function signToken(payload, expiresIn = '1h') {
    // Cast to `any` here to satisfy SignOptions definition
    return jsonwebtoken_1.default.sign(payload, SECRET, { expiresIn: expiresIn });
}
/**
 * Verify a JWT token, returning the decoded payload or null if invalid.
 * @param token - JWT string
 * @returns decoded payload or null
 */
function verifyToken(token) {
    try {
        return jsonwebtoken_1.default.verify(token, SECRET);
    }
    catch {
        return null;
    }
}
//# sourceMappingURL=jwt.js.map