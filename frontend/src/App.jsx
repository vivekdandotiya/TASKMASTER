import { Routes, Route } from "react-router-dom";
import TaskPage from "./pages/Taskpage";
import Notes from "./pages/Notes";
import Calendar from "./pages/activitygraph";

function App() {
  return (
    <Routes>
      <Route path="/" element={<TaskPage />} />
      <Route path="/notes" element={<Notes />} />
      <Route path="/calendar" element={<Calendar />} />
    </Routes>
  );
}

export default App;
