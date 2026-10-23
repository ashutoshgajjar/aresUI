import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { tasksApi } from "@/api/tasks.api";
import Loader from "@/components/UI/Loader";

export default function TaskDetailPage() {
  const { taskId } = useParams();
  const [task, setTask] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    tasksApi.get(taskId).then(setTask).catch((err) => setError(err.message));
  }, [taskId]);

  async function markComplete() {
    const updated = await tasksApi.update(taskId, { status: "completed" });
    setTask(updated);
  }

  if (error) return <main><p role="alert">{error}</p></main>;
  if (!task) return <main><Loader /></main>;

  return (
    <main>
      <h1>{task.title}</h1>
      <p>{task.description}</p>
      <p>Status: {task.status}</p>
      <button onClick={markComplete}>Complete</button>
      <pre>{JSON.stringify(task.data, null, 2)}</pre>
    </main>
  );
}
