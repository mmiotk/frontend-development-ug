"use client";
// Final state of TaskBoard after all segments.
// Segment 0: static skeleton (initialTasks prop, ul/li list).
// Segment 1: useState — add / toggle / delete tasks, controlled input.
// Segment 2: useEffect — document title (with cleanup), localStorage persistence.
// Segment 3: useRef — DOM focus after add, render counter without re-render.
// Segment 4: filter + counts as derived values (no extra state, no memoization).
// Segment 5: custom hooks — all task logic extracted to useTasks (+ useLocalStorage).
// Segment 6: "Clear done" button (clearDone from useTasks) used to demo the rules of hooks.
import { useState, useEffect, useRef } from "react";
import { useTasks } from "../hooks/useTasks";

export default function TaskBoard({ initialTasks }) {
  // All task logic delegated to useTasks — TaskBoard is now a pure UI component.
  const {
    visibleTasks,
    filter,
    setFilter,
    counts,
    addTask,
    toggleTask,
    deleteTask,
    clearDone,
  } = useTasks(initialTasks);

  const [text, setText] = useState("");

  // useRef: DOM reference — setting .current.focus() does NOT cause a re-render.
  const inputRef = useRef(null);
  // useRef: mutable counter — persists across renders, does NOT trigger re-render.
  const renderCount = useRef(0);
  renderCount.current += 1;

  // useEffect: update browser tab title to reflect pending task count.
  useEffect(() => {
    document.title =
      counts.pending > 0 ? `(${counts.pending}) Task Board` : "Task Board";
    // Cleanup: reset title when component unmounts (e.g., navigating away).
    return () => {
      document.title = "Task Board";
    };
  }, [counts.pending]);

  function handleAdd() {
    addTask(text);
    setText("");
    inputRef.current?.focus(); // imperative DOM action — no re-render
  }

  return (
    <div>
      <p>Renders: {renderCount.current}</p>

      <input
        ref={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="New task..."
      />
      <button onClick={handleAdd}>Add</button>

      <p>
        <button onClick={() => setFilter("all")}>All ({counts.total})</button>
        <button onClick={() => setFilter("active")}>Active ({counts.pending})</button>
        <button onClick={() => setFilter("done")}>Done ({counts.done})</button>
        <button onClick={clearDone}>Clear done</button>
      </p>

      <ul>
        {visibleTasks.map((task) => (
          <li key={task.id}>
            <input
              type="checkbox"
              checked={task.done}
              onChange={() => toggleTask(task.id)}
            />
            {task.done ? <s>{task.text}</s> : task.text}
            <button onClick={() => deleteTask(task.id)}>Delete</button>
          </li>
        ))}
      </ul>

      <p>{counts.pending} pending / {counts.total} total</p>
    </div>
  );
}
