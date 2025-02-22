"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

interface Task {
  id: number;
  title: string;
  description?: string;
  isComplete: boolean;
}

const Tasks: React.FC = () => {
  const { token } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
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

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newTaskTitle,
          description: newTaskDescription,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setNewTaskTitle("");
        setNewTaskDescription("");
        fetchTasks();
      } else {
        setError(data.error || "Failed to create task");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred");
    }
  };

  const handleDeleteTask = async (id: number) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/tasks/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      if (res.ok) {
        fetchTasks();
      } else {
        setError(data.error || "Failed to delete task");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred");
    }
  };

  const handleToggleComplete = async (task: Task) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/tasks/${task.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ isComplete: !task.isComplete }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        fetchTasks();
      } else {
        setError(data.error || "Failed to update task");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Your Tasks</h2>
      {error && <div className="mb-4 text-red-500">{error}</div>}
      <form onSubmit={handleCreateTask} className="mb-6">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Task Title"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />
        </div>
        <div className="mb-4">
          <textarea
            placeholder="Task Description (optional)"
            value={newTaskDescription}
            onChange={(e) => setNewTaskDescription(e.target.value)}
            className="w-full border p-2 rounded"
          ></textarea>
        </div>
        <button type="submit" className="bg-green-500 text-white p-2 rounded">
          Add Task
        </button>
      </form>
      <ul>
        {tasks.map((task) => (
          <li
            key={task.id}
            className="bg-white shadow p-4 mb-4 flex justify-between items-center"
          >
            <div>
              <h3
                className={`text-xl ${task.isComplete ? "line-through" : ""}`}
              >
                {task.title}
              </h3>
              {task.description && (
                <p className="text-gray-600">{task.description}</p>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleToggleComplete(task)}
                className="text-blue-500"
              >
                {task.isComplete ? "Mark Incomplete" : "Mark Complete"}
              </button>
              <button
                onClick={() => handleDeleteTask(task.id)}
                className="text-red-500"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Tasks;
