import * as React from "react"
import {
  LayoutDashboard,
  Car,
  Users,
  CalendarCheck,
  FileCheck,
  BarChart3,
  Fuel,
  Wrench,
  UserCog,
  Truck
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useAuthStore } from "@/lib/auth"

const navItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Bookings', url: '/bookings', icon: CalendarCheck },
  { title: 'Vehicles', url: '/vehicles', icon: Car },
  { title: 'Drivers', url: '/drivers', icon: Users },
  { title: 'Approvals', url: '/approvals', icon: FileCheck },
  { title: 'Reports', url: '/reports', icon: BarChart3 },
  { title: 'Fuel Logs', url: '/fuel-logs', icon: Fuel },
  { title: 'Service', url: '/service-schedules', icon: Wrench },
  { title: 'Users', url: '/users', icon: UserCog },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuthStore();

  const userData = {
    name: user?.name || "User",
    email: user?.role || "View Profile",
    avatar: "", // Add avatar logic if available
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Truck className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Sekawan Fleet</span>
                  <span className="truncate text-xs">Vehicle Management</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}
