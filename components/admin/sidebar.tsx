"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { FileText, Home, Menu, X, Users, Ban, CreditCard, User, Tv, UserCheck } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const pathname = usePathname()
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function getUserEmail() {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session?.user?.email) {
        setUserEmail(session.user.email)
      }
    }

    getUserEmail()
  }, [supabase])

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  // Elementos de navegación con el gestor de streamers añadido
  const navItems = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: <Home className="h-5 w-5" />,
    },
    {
      name: "Noticias",
      href: "/admin/dashboard/news",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      name: "Usuarios",
      href: "/admin/users",
      icon: <Users className="h-5 w-5" />,
    },
    {
      name: "Info de Cuenta",
      href: "/admin/accountinfo",
      icon: <User className="h-5 w-5" />,
    },
    {
      name: "Cuentas Pendientes",
      href: "/admin/pending-accounts",
      icon: <UserCheck className="h-5 w-5" />,
    },
    {
      name: "Baneados",
      href: "/admin/ban",
      icon: <Ban className="h-5 w-5" />,
    },
    {
      name: "Gestor de Créditos",
      href: "/admin/creditsmanager",
      icon: <CreditCard className="h-5 w-5" />,
    },
    {
      name: "Streams",
      href: "/admin/streams",
      icon: <Tv className="h-5 w-5" />,
    },
  ]

  return (
    <>
      {/* Mobile sidebar toggle */}
      <button
        className="fixed top-4 left-4 z-40 md:hidden bg-bunker-800 p-2 rounded-md text-gray-400 hover:text-white hover:bg-bunker-700 focus:outline-none"
        onClick={toggleSidebar}
        style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Sidebar */}
      <div
        className={`h-full bg-bunker-900 border-r border-bunker-800 md:relative md:block ${
          isOpen ? "fixed inset-y-0 left-0 z-30 w-64 block" : "hidden md:block w-full"
        }`}
        style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 border-b border-bunker-800">
            <div className="flex items-center space-x-2">
              <span
                className="text-lg font-medium text-white"
                style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
              >
                Panel de Administración
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-2 text-sm rounded-md transition-colors ${
                    isActive ? "bg-bunker-800 text-white" : "text-gray-400 hover:bg-bunker-800 hover:text-white"
                  }`}
                  style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* User info */}
          <div className="p-4 border-t border-bunker-800">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-bunker-700 flex items-center justify-center text-white">A</div>
              <div className="ml-3">
                <p
                  className="text-sm font-medium text-white"
                  style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
                >
                  Admin
                </p>
                <p
                  className="text-xs text-gray-400 truncate max-w-[140px]"
                  style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
                  title={userEmail || ""}
                >
                  {userEmail || "admin@example.com"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
