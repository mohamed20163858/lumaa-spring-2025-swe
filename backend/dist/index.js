"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/index.ts
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const cors_1 = __importDefault(require("cors"));
const client_1 = require("@prisma/client");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: "*" }));
app.use(express_1.default.json());
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.SUPABASE_JWT_SECRET || "your_jwt_secret";
// Middleware: Token Verification
function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    // Expect header format: "Bearer <token>"
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
        res.status(401).json({ error: "No token provided" });
        return;
    }
    jsonwebtoken_1.default.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: "Invalid token" });
        }
        req.user = user;
        next();
    });
}
// ----- Authentication Endpoints -----
// POST /auth/register - Create a new user
app.post("/auth/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
    }
    try {
        // Check if the user already exists
        const existingUser = yield prisma.user.findUnique({
            where: { username },
        });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }
        // Hash the password
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const user = yield prisma.user.create({
            data: { username, password: hashedPassword },
        });
        res.status(201).json({ message: "User created", userId: user.id });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
}));
// POST /auth/login - Login user, return a token
app.post("/auth/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
    }
    try {
        const user = yield prisma.user.findUnique({ where: { username } });
        if (!user) {
            return res.status(400).json({ error: "Invalid credentials" });
        }
        const passwordMatch = yield bcrypt_1.default.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(400).json({ error: "Invalid credentials" });
        }
        // Sign and return JWT token
        const token = jsonwebtoken_1.default.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: "1h" });
        res.json({ token });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
}));
// Token verification endpoint: GET /auth/verify
app.get("/auth/verify", (req, res) => {
    // Extract token from the Authorization header (expected format: "Bearer <token>")
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
        res.status(401).json({ error: "No token provided" });
        return;
    }
    jsonwebtoken_1.default.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            // Token is invalid or expired
            return res.status(403).json({ error: "Invalid token" });
        }
        // Token is valid; optionally return the decoded user information
        return res.status(200).json({ message: "Token is valid", user: decoded });
    });
});
// ----- Task CRUD Endpoints (Protected) -----
// GET /tasks - Retrieve a list of tasks for the authenticated user
app.get("/tasks", authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tasks = yield prisma.task.findMany({
            where: { userId: req.user.id },
        });
        res.json(tasks);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
}));
// POST /tasks - Create a new task
app.post("/tasks", authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, description } = req.body;
    if (!title) {
        return res.status(400).json({ error: "Title is required" });
    }
    try {
        const task = yield prisma.task.create({
            data: {
                title,
                description,
                userId: req.user.id,
            },
        });
        res.status(201).json(task);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
}));
// PUT /tasks/:id - Update a task
app.put("/tasks/:id", authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { title, description, isComplete } = req.body;
    try {
        // Verify the task belongs to the authenticated user
        const task = yield prisma.task.findUnique({
            where: { id: parseInt(id, 10) },
        });
        if (!task || task.userId !== req.user.id) {
            return res.status(403).json({ error: "Not authorized" });
        }
        const updatedTask = yield prisma.task.update({
            where: { id: parseInt(id, 10) },
            data: { title, description, isComplete },
        });
        res.json(updatedTask);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
}));
// DELETE /tasks/:id - Delete a task
app.delete("/tasks/:id", authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const task = yield prisma.task.findUnique({
            where: { id: parseInt(id, 10) },
        });
        if (!task || task.userId !== req.user.id) {
            return res.status(403).json({ error: "Not authorized" });
        }
        yield prisma.task.delete({ where: { id: parseInt(id, 10) } });
        res.json({ message: "Task deleted" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
}));
// Start the server
const PORT = process.env.PORT || 3000;
app.get("/", (req, res) => {
    res.send("Hello, this is task management backend system!");
}); // test the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
//# sourceMappingURL=index.js.map