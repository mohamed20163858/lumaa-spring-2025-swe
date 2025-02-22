import { useState } from "react";
import { TaskCardProps, Task } from "@/types/tasks";

function TaskCard({ task, token, fetchTasks, setError }: TaskCardProps) {
  // State to manage editing mode and input values
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedDescription, setEditedDescription] = useState(
    task.description || ""
  );

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

  const handleUpdateTask = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/tasks/${task.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: editedTitle,
            description: editedDescription,
          }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        fetchTasks();
        setIsEditing(false);
      } else {
        setError(data.error || "Failed to update task");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred");
    }
  };

  const handleCancelEdit = () => {
    // Reset the local inputs to original values
    setEditedTitle(task.title);
    setEditedDescription(task.description || "");
    setIsEditing(false);
  };

  return (
    <li className="bg-white shadow p-4 mb-4 flex justify-between items-center">
      <div>
        {isEditing ? (
          <div className="flex flex-col space-y-2">
            <h3 className="text-xl font-bold">Edit Task</h3>
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="text-xl border p-1 rounded mb-2"
            />
            <textarea
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              className="text-gray-600 border p-1 rounded"
            ></textarea>
          </div>
        ) : (
          <div>
            <h3 className={`text-xl ${task.isComplete ? "line-through" : ""}`}>
              {task.title}
            </h3>
            {task.description && (
              <p className="text-gray-600">{task.description}</p>
            )}
          </div>
        )}
      </div>
      <div className="flex items-center space-x-4">
        {!isEditing ? (
          <>
            <button
              onClick={() => handleToggleComplete(task)}
              className="text-blue-500"
            >
              {task.isComplete ? "Mark Incomplete" : "Mark Complete"}
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="text-green-500"
            >
              Edit
            </button>
            <button
              onClick={() => handleDeleteTask(task.id)}
              className="text-red-500"
            >
              Delete
            </button>
          </>
        ) : (
          <>
            <button onClick={handleUpdateTask} className="text-green-500">
              Save
            </button>
            <button onClick={handleCancelEdit} className="text-gray-500">
              Cancel
            </button>
          </>
        )}
      </div>
    </li>
  );
}

export default TaskCard;
