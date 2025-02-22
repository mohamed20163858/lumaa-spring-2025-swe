import { TaskFormProps } from "@/types/tasks";
import { useState } from "react";

function TaskForm({ token, setError, error, fetchTasks }: TaskFormProps) {
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
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
  return (
    <form onSubmit={handleCreateTask} className="mb-6">
      {error && <div className="mb-4 text-red-500">{error}</div>}

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
  );
}

export default TaskForm;
