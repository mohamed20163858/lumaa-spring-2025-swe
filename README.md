# Task Management Application

A full-stack task management application built with Next.js, Express, Prisma, and PostgreSQL. This application allows users to register, login, and manage their tasks through a secure interface.

# Demo 
Here is a [live link](https://lumaa-spring-2025-swe-yrke.vercel.app/) to the app implemented using [vercel](https://vercel.com/) for hosting both frontend and backend together and [supabase database](https://supabase.com/database) for using online free PostgreSQL database. 
Please note to be able to host it you need to give permission to your Prisma ORM to edit the supabase database this can be done by following these instructions in this [link](https://supabase.com/docs/guides/database/prisma) 

## Features

- User authentication (Register/Login)
- Task management (Create, Read, Update, Delete)
- Secure API endpoints with JWT authentication
- PostgreSQL database with Prisma ORM
- TypeScript support throughout the stack

## Prerequisites

- Node.js (version v20.17.0)
- PostgreSQL (version postgres (PostgreSQL) 15.0)
- npm or yarn

## Project Structure

```
task-management/
├── frontend/          # Next.js frontend application
├── backend/           # Express backend server
└── README.md         # This file
```

## Database Setup

1. Install PostgreSQL on your machine if you haven't already from [here](https://www.postgresql.org/download/) just choose your operating system and follow the instructions to set it up. Usually it will suggest that you use a username of postgres and leave the setup of the password to you.
2. Create a new database:
   ```sql
   CREATE DATABASE task_management;
   ```
3. The Prisma migrations will handle the table creation automatically during setup

## Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:
   ```
   DATABASE_URL="postgresql://[YOUR_USERNAME]:[YOUR_PASSWORD]@localhost:5432/task_management?schema=public"
   SUPABASE_JWT_SECRET="[YOUR_JWT_SECRET]"
   PORT=8000
   ```

4. Run Prisma migrations:
   ```bash
   npx prisma migrate dev
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

The backend server will start on http://localhost:8000

## Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the frontend directory:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The frontend application will start on http://localhost:3000

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user

### Tasks (Protected Routes)
- `GET /tasks` - Get all tasks
- `POST /tasks` - Create a new task
- `PUT /tasks/:id` - Update a task
- `DELETE /tasks/:id` - Delete a task

## Demo Video

[Demo video](https://www.loom.com/share/d85e0f679ecf482a92aa0f4f8696ac83?sid=2be72c46-6310-4cb9-a8fa-79a41b2d9cba)

## Salary Expectations

-I expect 1600$ per month I understand this is 20 hours worked per week and I expect  I should paid 20$ per hour 

## Additional Notes

- The application uses JWT for authentication
- Passwords are hashed using bcrypt
- All task endpoints require authentication
- The frontend uses TypeScript for better type safety and development experience

## Future Improvements

- Add task categories
- Implement task due dates
- Add task sharing between users
- Implement unit and integration tests
- Add CI/CD pipeline

## Author

Mohamed Saleh

