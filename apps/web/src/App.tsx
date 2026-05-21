import { Dumbbell, LayoutDashboard, ListChecks, Settings, Signal } from "lucide-react";
import { NavLink, Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard.tsx";
import ProblemDetail from "./pages/ProblemDetail.tsx";
import Problems from "./pages/Problems.tsx";
import SettingsPage from "./pages/Settings.tsx";
import Stats from "./pages/Stats.tsx";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/problems", label: "Problems", icon: ListChecks },
  { to: "/stats", label: "Stats", icon: Signal },
  { to: "/settings", label: "Settings", icon: Settings }
];

export default function App() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <NavLink to="/" className="flex items-center gap-2 text-lg font-semibold text-stone-950">
            <Dumbbell className="h-6 w-6 text-emerald-700" />
            algo-gym
          </NavLink>
          <nav className="flex flex-wrap gap-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  [
                    "focus-ring inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
                    isActive ? "bg-emerald-700 text-white" : "text-stone-700 hover:bg-stone-100"
                  ].join(" ")
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/problems" element={<Problems />} />
          <Route path="/problems/:titleSlug" element={<ProblemDetail />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
    </div>
  );
}
