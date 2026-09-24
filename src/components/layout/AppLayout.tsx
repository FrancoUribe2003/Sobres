import { useState } from 'react'
import { Outlet, NavLink } from 'react-router'
import { Home, ArrowLeftRight, CalendarClock, Settings, Plus } from 'lucide-react'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'

const navItems = [
  { to: '/', label: 'Inicio', icon: Home },
  { to: '/movimientos', label: 'Movimientos', icon: ArrowLeftRight },
  { to: '/fijos', label: 'Fijos', icon: CalendarClock },
  { to: '/ajustes', label: 'Ajustes', icon: Settings },
]

export function AppLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background text-foreground">
      {/* Safe area and content wrapper */}
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col pb-[calc(env(safe-area-inset-bottom,0px)+5rem)] pt-[env(safe-area-inset-top,0px)]">
        <Outlet />
      </main>

      {/* Floating Action Button (+) */}
      <div className="fixed right-4 bottom-[calc(env(safe-area-inset-bottom,0px)+4.75rem)] z-40 sm:right-[max(1rem,calc(50%-13rem))]">
        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerTrigger asChild>
            <Button
              size="icon"
              className="h-14 w-14 rounded-full shadow-lg transition-transform active:scale-95"
              aria-label="Nuevo registro"
            >
              <Plus className="h-6 w-6" />
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Nuevo registro</DrawerTitle>
              <DrawerDescription>
                Carga de ingresos y gastos disponible en las siguientes fases.
              </DrawerDescription>
            </DrawerHeader>
            <div className="p-6 text-center text-sm text-muted-foreground">
              Sin opciones por el momento
            </div>
          </DrawerContent>
        </Drawer>
      </div>

      {/* Bottom Navigation Bar */}
      <nav
        aria-label="Navegación principal"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur-sm pb-[env(safe-area-inset-bottom,0px)]"
      >
        <div className="mx-auto flex h-16 max-w-md items-center justify-around px-2">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center justify-center py-1 text-xs transition-colors ${
                  isActive
                    ? 'font-medium text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`
              }
            >
              <Icon className="mb-1 h-5 w-5" />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
