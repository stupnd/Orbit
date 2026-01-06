import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AppProvider } from "./lib/store"
import { Layout } from "./components/Layout"
import { Dashboard } from "./pages/Dashboard"
import { Planner } from "./pages/Planner"
import { Simulator } from "./pages/Simulator"
import { Calendar } from "./pages/Calendar"

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/planner" element={<Planner />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/simulator" element={<Simulator />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AppProvider>
  )
}

export default App
