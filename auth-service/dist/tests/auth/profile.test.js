"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const index_1 = __importDefault(require("../../src/index"));
describe('GET /api/auth/profile', () => {
    let token;
    beforeAll(async () => {
        const res = await (0, supertest_1.default)(index_1.default)
            .post('/api/auth/login')
            .send({ nationalId: '1234567890123', password: 'password' });
        token = res.body.accessToken;
    });
    it('should return 200 and user profile with valid token', async () => {
        const res = await (0, supertest_1.default)(index_1.default)
            .get('/api/auth/profile')
            .set('Authorization', `Bearer ${token}`)
            .expect(200);
        expect(res.body).toMatchObject({
            id: '1',
            prefix: 'นาย',
            firstName: 'Adam',
            lastName: 'Smith',
            nationalId: '1234567890123',
            phone: null,
            role: 'COMMUNITY',
            approved: true,
        });
    });
    it('should return 401 when no token provided', async () => {
        await (0, supertest_1.default)(index_1.default)
            .get('/api/auth/profile')
            .expect(401);
    });
});
//# sourceMappingURL=profile.test.js.map