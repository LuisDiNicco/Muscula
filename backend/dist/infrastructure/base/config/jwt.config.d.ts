export declare const jwtConfig: (() => {
    secret: string;
    expiration: string;
    refreshTokenExpiration: string;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    secret: string;
    expiration: string;
    refreshTokenExpiration: string;
}>;
