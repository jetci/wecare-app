"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authSchemas_1 = require("../schemas/authSchemas");
const authController_1 = require("../controllers/authController");
const jwtAuth_1 = require("../middleware/jwtAuth");
const router = express_1.default.Router();
/**
 * POST /login
 */
router.post('/login', async (req, res) => {
    const parsed = authSchemas_1.loginRequestSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.errors[0].message });
    return (0, authController_1.loginController)(parsed.data, res);
});
/**
 * GET /profile
 */
router.get('/profile', jwtAuth_1.jwtAuth, async (req, res) => {
    const user = req.user;
    return (0, authController_1.profileController)(user, res);
});
exports.default = router;
//# sourceMappingURL=auth.js.map