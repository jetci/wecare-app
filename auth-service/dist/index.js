"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const ioredis_1 = __importDefault(require("ioredis"));
const ioredis_mock_1 = __importDefault(require("ioredis-mock"));
// Load env vars
const { PORT = '4000', REDIS_URL = 'redis://localhost:6379', JWT_SECRET, CORS_ORIGIN = 'http://localhost:3000', NODE_ENV = 'development', } = process.env;
if (!JWT_SECRET) {
    console.error('Missing JWT_SECRET');
    process.exit(1);
}
// Init Redis: mock in non-prod
const redis = NODE_ENV === 'production'
    ? new ioredis_1.default(REDIS_URL)
    : new ioredis_mock_1.default();
redis.on('connect', () => console.log('Redis connected'));
redis.on('error', (err) => console.warn('Redis error:', err));
// Setup Express
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, express_rate_limit_1.default)({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use((0, cors_1.default)({ origin: CORS_ORIGIN, credentials: true }));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
// Health endpoint
app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
});
// TODO: Auth routes
app.listen(Number(PORT), () => {
    console.log(`Auth service running on port ${PORT}`);
});
//# sourceMappingURL=index.js.map