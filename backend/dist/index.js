"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load environment variables
dotenv_1.default.config();
// Import routes
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const client_routes_1 = __importDefault(require("./routes/client.routes"));
const service_routes_1 = __importDefault(require("./routes/service.routes"));
const invoice_routes_1 = __importDefault(require("./routes/invoice.routes"));
const document_routes_1 = __importDefault(require("./routes/document.routes"));
const appointment_routes_1 = __importDefault(require("./routes/appointment.routes"));
const message_routes_1 = __importDefault(require("./routes/message.routes"));
const notification_routes_1 = __importDefault(require("./routes/notification.routes"));
const profile_routes_1 = __importDefault(require("./routes/profile.routes"));
const calendar_routes_1 = __importDefault(require("./routes/calendar.routes"));
// Import middleware
const errorHandler_1 = require("./middleware/errorHandler");
const notFoundHandler_1 = require("./middleware/notFoundHandler");
// Import socket setup
const socket_service_1 = require("./services/socket.service");
const app = (0, express_1.default)();
exports.app = app;
const httpServer = (0, http_1.createServer)(app);
// ─── Socket.IO Setup ──────────────────────────────────────────────────────────
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: process.env.CLIENT_URL || '*',
        methods: ['GET', 'POST'],
    },
});
exports.io = io;
(0, socket_service_1.setupSocketIO)(io);
// ─── Security Middleware ──────────────────────────────────────────────────────
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || '*',
    credentials: true,
}));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);
// Auth rate limiting (relaxed in development)
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV === 'development' ? 1000 : 10,
    message: { success: false, message: 'Too many login attempts, please try again later.' },
});
// ─── General Middleware ───────────────────────────────────────────────────────
app.use((0, compression_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((0, morgan_1.default)(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
// Static files for invoices/documents (if stored locally)
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'CA Connect API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
    });
});
// ─── API Routes (Supporting both /api and /api/v1) ────────────────────────────
const routeMap = [
    ['/auth', auth_routes_1.default],
    ['/clients', client_routes_1.default],
    ['/services', service_routes_1.default],
    ['/invoices', invoice_routes_1.default],
    ['/documents', document_routes_1.default],
    ['/appointments', appointment_routes_1.default],
    ['/messages', message_routes_1.default],
    ['/notifications', notification_routes_1.default],
    ['/profile', profile_routes_1.default],
    ['/calendar', calendar_routes_1.default],
];
// Mount with rate-limited auth
app.use('/api/auth', authLimiter, auth_routes_1.default);
app.use('/api/v1/auth', authLimiter, auth_routes_1.default);
for (const [subPath, router] of routeMap) {
    if (subPath !== '/auth') {
        app.use(`/api${subPath}`, router);
        app.use(`/api/v1${subPath}`, router);
    }
}
// ─── Error Handling ───────────────────────────────────────────────────────────
app.use(notFoundHandler_1.notFoundHandler);
app.use(errorHandler_1.errorHandler);
// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
    console.log(`\n🚀 CA Connect API Server started`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   Port: ${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/health\n`);
});
//# sourceMappingURL=index.js.map