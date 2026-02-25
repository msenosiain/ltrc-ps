import { Outlet } from "react-router-dom"
import { Sidebar } from "./Sidebar/Sidebar"
import { Header } from "./Header"

export function AppLayout() {
  return (
    <div className="min-h-screen bg-secondary text-white flex">
      
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header />

        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>

    </div>
  )
}
