// Custom hook: encapsulates all task management logic.
// Composes useLocalStorage + useState; the rest is plain derived values and functions.
import { useState } from "react";
import { useLocalStorage } from "./useLocalStorage";

export function useTasks(initialTasks) {
  // Delegate persistence to useLocalStorage — TaskBoard doesn't need to know HOW tasks are stored.
  const [tasks, setTasks] = useLocalStorage("tasks", initialTasks);
  const [filter, setFilter] = useState("all"); // "all" | "active" | "done"

  // Derived values: computed from state on every render.
  const counts = {
    total:   tasks.length,
    done:    tasks.filter((t) =>  t.done).length,
    pending: tasks.filter((t) => !t.done).length,
  };
  const visibleTasks =
    filter === "active" ? tasks.filter((t) => !t.done) :
    filter === "done"   ? tasks.filter((t) =>  t.done) :
    tasks;

  function addTask(text) {
    if (!text.trim()) return;
    setTasks([...tasks, { id: Date.now(), text: text.trim(), done: false }]);
  }

  function toggleTask(id) {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  function deleteTask(id) {
    setTasks(tasks.filter((t) => t.id !== id));
  }

  function clearDone() {
    setTasks(tasks.filter((t) => !t.done));
  }

  return { visibleTasks, filter, setFilter, counts, addTask, toggleTask, deleteTask, clearDone };
}
