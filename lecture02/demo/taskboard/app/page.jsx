// Server Component — receives initialTasks from data module and passes them to the client component.
import TaskBoard from "./components/TaskBoard";
import { initialTasks } from "./data/initialTasks";

export default function Home() {
  return (
    <main>
      <h1>Task Board</h1>
      <TaskBoard initialTasks={initialTasks} />
    </main>
  );
}
