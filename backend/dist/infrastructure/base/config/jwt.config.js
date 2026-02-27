"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtConfig = void 0;
const config_1 = require("@nestjs/config");
exports.jwtConfig = (0, config_1.registerAs)('jwt', () => ({
    secret: process.env.JWT_SECRET ?? '',
    expiration: process.env.JWT_EXPIRATION ?? '15m',
    refreshTokenExpiration: process.env.REFRESH_TOKEN_EXPIRATION ?? '30d',
}));
//# sourceMappingURL=jwt.config.js.map