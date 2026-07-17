interface TokenPayload {
    id: string;
    email: string;
    role: string;
}
export declare const generateTokens: (payload: TokenPayload) => {
    accessToken: string;
    refreshToken: string;
};
export declare const verifyAccessToken: (token: string) => TokenPayload;
export declare const verifyRefreshToken: (token: string) => {
    id: string;
};
export {};
//# sourceMappingURL=jwt.d.ts.map