import { Routes, Route } from "react-router-dom";
import TaskPage from "./pages/Taskpage";
import Notes from "./pages/Notes";
import Calendar from "./pages/activitygraph";
import DailyExpense from "./pages/dailyexpense";

function App() {
  return (
    <Routes>
      <Route path="/" element={<TaskPage />} />
      <Route path="/notes" element={<Notes />} />
      <Route path="/calendar" element={<Calendar />} />
      <Route path="/daily-expense" element={<DailyExpense />} />
    </Routes>
  );
}

export default App;
