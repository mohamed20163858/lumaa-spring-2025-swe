import { TaskCardProps, Task } from "@/types/tasks";
function TaskCard({ task, token, fetchTasks, setError }: TaskCardProps) {
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
    <li className="bg-white shadow p-4 mb-4 flex justify-between items-center">
      <div>
        <h3 className={`text-xl ${task.isComplete ? "line-through" : ""}`}>
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
  );
}

export default TaskCard;
