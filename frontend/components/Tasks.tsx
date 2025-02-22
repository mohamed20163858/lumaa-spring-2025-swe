"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Task } from "@/types/tasks";
import TaskCard from "./TaskCard";
import TaskForm from "./TaskForm";

const Tasks: React.FC = () => {
  const { token } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);

  const [error, setError] = useState("");

  const fetchTasks = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/tasks`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setTasks(data);
      } else {
        setError(data.error || "Failed to fetch tasks");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred");
    }
  };

  useEffect(() => {
    if (token) fetchTasks();
  }, [token]);

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Your Tasks</h2>
      <TaskForm
        token={token}
        setError={setError}
        fetchTasks={fetchTasks}
        error={error}
      />
      <ul>
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            token={token}
            setError={setError}
            fetchTasks={fetchTasks}
          />
        ))}
      </ul>
    </div>
  );
};

export default Tasks;
