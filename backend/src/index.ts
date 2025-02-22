// src/index.ts
import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const app: express.Application = express();
app.use(express.json());

const prisma = new PrismaClient();
const JWT_SECRET = process.env.SUPABASE_JWT_SECRET || "your_jwt_secret";

// Extend Express Request to include "user"
interface AuthenticatedRequest extends Request {
  user?: { id: number; username: string };
}

// Middleware: Token Verification
function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers["authorization"];
  // Expect header format: "Bearer <token>"
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    res.status(401).json({ error: "No token provided" });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid token" });
    }
    req.user = user as { id: number; username: string };
    next();
  });
}

// ----- Authentication Endpoints -----

// POST /auth/register - Create a new user
app.post(
  "/auth/register",
  async (req: Request, res: Response): Promise<any> => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }
    try {
      // Check if the user already exists
      const existingUser = await prisma.user.findUnique({
        where: { username },
      });
      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: { username, password: hashedPassword },
      });
      res.status(201).json({ message: "User created", userId: user.id });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// POST /auth/login - Login user, return a token
app.post("/auth/login", async (req: Request, res: Response): Promise<any> => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }
  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    // Sign and return JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ----- Task CRUD Endpoints (Protected) -----

// GET /tasks - Retrieve a list of tasks for the authenticated user
app.get(
  "/tasks",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const tasks = await prisma.task.findMany({
        where: { userId: req.user!.id },
      });
      res.json(tasks);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// POST /tasks - Create a new task
app.post(
  "/tasks",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    const { title, description } = req.body;
    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }
    try {
      const task = await prisma.task.create({
        data: {
          title,
          description,
          userId: req.user!.id,
        },
      });
      res.status(201).json(task);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// PUT /tasks/:id - Update a task
app.put(
  "/tasks/:id",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    const { id } = req.params;
    const { title, description, isComplete } = req.body;
    try {
      // Verify the task belongs to the authenticated user
      const task = await prisma.task.findUnique({
        where: { id: parseInt(id, 10) },
      });
      if (!task || task.userId !== req.user!.id) {
        return res.status(403).json({ error: "Not authorized" });
      }
      const updatedTask = await prisma.task.update({
        where: { id: parseInt(id, 10) },
        data: { title, description, isComplete },
      });
      res.json(updatedTask);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// DELETE /tasks/:id - Delete a task
app.delete(
  "/tasks/:id",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    const { id } = req.params;
    try {
      const task = await prisma.task.findUnique({
        where: { id: parseInt(id, 10) },
      });
      if (!task || task.userId !== req.user!.id) {
        return res.status(403).json({ error: "Not authorized" });
      }
      await prisma.task.delete({ where: { id: parseInt(id, 10) } });
      res.json({ message: "Task deleted" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Start the server
const PORT = process.env.PORT || 3000;
app.get("/", (req: Request, res: Response) => {
  res.send("Hello, this is task management backend system!");
}); // test the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
