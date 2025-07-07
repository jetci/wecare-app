"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.profileController = exports.loginController = void 0;
exports.loginHandler = loginHandler;
exports.profileHandler = profileHandler;
exports.loginHandler = loginHandler;
exports.profileHandler = profileHandler;
exports.loginHandler = loginHandler;
exports.profileHandler = profileHandler;
const bcryptjs_1 = require("bcryptjs");
const prisma_1 = __importDefault(require("../utils/prisma"));
const jwt_1 = require("../utils/jwt");
const authSchemas_1 = require("../schemas/authSchemas");
async function loginHandler(req, res) {
    const parsed = authSchemas_1.loginRequestSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors[0].message });
    }
    const { nationalId, password } = parsed.data;
    const user = await prisma_1.default.user.findUnique({ where: { nationalId } });
    if (!user) {
        return res.status(404).json({ error: 'ไม่พบผู้ใช้' });
    }
    const valid = await (0, bcryptjs_1.compare)(password, user.passwordHash);
    if (!valid) {
        return res.status(401).json({ error: 'รหัสผ่านไม่ถูกต้อง' });
    }
    const accessToken = (0, jwt_1.signToken)({ userId: user.id, role: user.role });
    const response = authSchemas_1.loginResponseSchema.parse({
        accessToken,
        user: { id: user.id, role: user.role },
    });
    res.cookie('refreshToken', '...', { httpOnly: true, secure: true, sameSite: 'strict' });
    return res.json(response);
}
async function profileHandler(req, res) {
    const payload = req.user;
    const user = await prisma_1.default.user.findUnique({ where: { id: payload.userId } });
    if (!user) {
        return res.status(404).json({ error: 'ไม่พบผู้ใช้' });
    }
    const profile = {
        id: user.id,
        nationalId: user.nationalId,
        prefix: user.prefix,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        approved: user.approved,
    };
    return res.json(authSchemas_1.profileResponseSchema.parse(profile));
}
async function loginHandler(req, res) {
    const parsed = authSchemas_1.loginRequestSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors[0].message });
    }
    const { nationalId, password } = parsed.data;
    const user = await prisma_1.default.user.findUnique({ where: { nationalId } });
    if (!user) {
        return res.status(404).json({ error: 'ไม่พบผู้ใช้' });
    }
    const valid = await (0, bcryptjs_1.compare)(password, user.passwordHash);
    if (!valid) {
        return res.status(401).json({ error: 'รหัสผ่านไม่ถูกต้อง' });
    }
    const accessToken = (0, jwt_1.signToken)({ userId: user.id, role: user.role });
    const response = authSchemas_1.loginResponseSchema.parse({
        accessToken,
        user: { id: user.id, role: user.role },
    });
    res.cookie('refreshToken', '...', { httpOnly: true, secure: true, sameSite: 'strict' });
    return res.json(response);
}
async function profileHandler(req, res) {
    const payload = req.user;
    const user = await prisma_1.default.user.findUnique({ where: { id: payload.userId } });
    if (!user) {
        return res.status(404).json({ error: 'ไม่พบผู้ใช้' });
    }
    const profile = {
        id: user.id,
        nationalId: user.nationalId,
        prefix: user.prefix,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        approved: user.approved,
    };
    const validatedProfile = authSchemas_1.profileResponseSchema.parse(profile);
    return res.json(validatedProfile);
}
async function loginHandler(req, res) {
    const parsed = authSchemas_1.loginRequestSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors[0].message });
    }
    const { nationalId, password } = parsed.data;
    const user = await prisma_1.default.user.findUnique({ where: { nationalId } });
    if (!user) {
        return res.status(404).json({ error: 'ไม่พบผู้ใช้' });
    }
    const valid = await (0, bcryptjs_1.compare)(password, user.passwordHash);
    if (!valid) {
        return res.status(401).json({ error: 'รหัสผ่านไม่ถูกต้อง' });
    }
    const accessToken = (0, jwt_1.signToken)({ userId: user.id, role: user.role });
    const response = authSchemas_1.loginResponseSchema.parse({
        accessToken,
        user: { id: user.id, role: user.role },
    });
    res.cookie('refreshToken', '...', { httpOnly: true, secure: true, sameSite: 'strict' });
    return res.json(response);
}
async function profileHandler(req, res) {
    const payload = req.user;
    const user = await prisma_1.default.user.findUnique({ where: { id: payload.userId } });
    if (!user) {
        return res.status(404).json({ error: 'ไม่พบผู้ใช้' });
    }
    const profile = {
        id: user.id,
        nationalId: user.nationalId,
        prefix: user.prefix,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        approved: user.approved,
    };
    const validatedProfile = authSchemas_1.profileResponseSchema.parse(profile);
    return res.json(validatedProfile);
}
const bcryptjs_2 = __importDefault(require("bcryptjs"));
// Dummy user for demonstration
const dummyUser = {
    id: '1',
    nationalId: '1234567890123',
    passwordHash: bcryptjs_2.default.hashSync('password', 8),
    role: 'COMMUNITY',
    prefix: 'นาย',
    firstName: 'Adam',
    lastName: 'Smith',
    phone: null,
    approved: true,
};
const loginController = async (data, res) => {
    const { nationalId, password } = data;
    if (nationalId !== dummyUser.nationalId) {
        return res.status(401).json({ error: 'user หรือ password ไม่ถูกต้อง' });
    }
    const valid = await bcryptjs_2.default.compare(password, dummyUser.passwordHash);
    if (!valid) {
        return res.status(401).json({ error: 'user หรือ password ไม่ถูกต้อง' });
    }
    const accessToken = (0, jwt_1.signToken)({ id: dummyUser.id, role: dummyUser.role });
    const refreshToken = (0, jwt_1.signToken)({ id: dummyUser.id }, '7d');
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
    });
    const responseData = {
        accessToken,
        user: { id: dummyUser.id, role: dummyUser.role },
    };
    const validatedResponse = authSchemas_1.loginResponseSchema.parse(responseData);
    return res.json(validatedResponse);
};
exports.loginController = loginController;
const profileController = async (_user, res) => {
    const profileData = {
        id: dummyUser.id,
        prefix: dummyUser.prefix,
        firstName: dummyUser.firstName,
        lastName: dummyUser.lastName,
        nationalId: dummyUser.nationalId,
        phone: dummyUser.phone,
        role: dummyUser.role,
        approved: dummyUser.approved,
    };
    const validatedProfile = authSchemas_1.profileResponseSchema.parse(profileData);
    return res.json(validatedProfile);
};
exports.profileController = profileController;
//# sourceMappingURL=authController.js.map