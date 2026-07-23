function TaskCard({ task }) {
  return (
    <article className="task-card">
      <h3>{task.title}</h3>
      <p>สถานะ: {task.status}</p>
    </article>
  );
}