"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorResponseSchema = exports.profileResponseSchema = exports.loginResponseSchema = exports.loginRequestSchema = void 0;
// src/schemas/authSchemas.ts
const zod_1 = require("zod");
// 1. Login Request
exports.loginRequestSchema = zod_1.z.object({
    nationalId: zod_1.z.string().length(13, 'รหัส 13 หลักเท่านั้น'),
    password: zod_1.z.string().min(1, 'กรุณากรอกรหัสผ่าน'),
});
// 2. Login Response
exports.loginResponseSchema = zod_1.z.object({
    accessToken: zod_1.z.string(),
    user: zod_1.z.object({
        id: zod_1.z.string(),
        role: zod_1.z.enum(['COMMUNITY', 'DRIVER', 'HEALTH_OFFICER', 'EXECUTIVE', 'ADMIN']),
    }),
});
// 3. Profile Response
exports.profileResponseSchema = zod_1.z.object({
    id: zod_1.z.string(),
    prefix: zod_1.z.string().nullable(),
    firstName: zod_1.z.string(),
    lastName: zod_1.z.string(),
    nationalId: zod_1.z.string().length(13),
    phone: zod_1.z.string().nullable(),
    role: zod_1.z.enum(['COMMUNITY', 'DRIVER', 'HEALTH_OFFICER', 'EXECUTIVE', 'ADMIN']),
    approved: zod_1.z.boolean(),
});
// 4. Error Response
exports.errorResponseSchema = zod_1.z.object({
    error: zod_1.z.string(),
});
//# sourceMappingURL=authSchemas.js.map