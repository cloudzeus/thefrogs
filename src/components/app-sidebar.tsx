"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArrowUpCircleIcon,
  HelpCircleIcon,
  LayoutDashboardIcon,
  SettingsIcon,
  UsersIcon,
  MapPinIcon,
  ImageIcon,
  BookOpenIcon,
  StarIcon,
  HomeIcon,
  BedDoubleIcon,
  FileTextIcon,
  LayoutIcon,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import dynamic from "next/dynamic"

const NavUser = dynamic(
  () => import("@/components/nav-user").then((m) => m.NavUser),
  { ssr: false, loading: () => <div className="h-12" /> }
)
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const navData = {
  navMain: [
    {
      title: "Dashboard",
      url: "/admin/dashboard",
      icon: LayoutDashboardIcon,
    },
    {
      title: "Users",
      url: "/admin/users",
      icon: UsersIcon,
    },
    {
      title: "Rooms",
      url: "/admin/rooms",
      icon: BedDoubleIcon,
    },
    {
      title: "File Manager",
      url: "/admin/media",
      icon: ImageIcon,
    },
    {
      title: "Photo Gallery",
      url: "/admin/gallery",
      icon: ImageIcon,
    },
    {
      title: "Guest Directory",
      url: "/admin/guest-directory",
      icon: BookOpenIcon,
    },
    {
      title: "Points of Interest",
      url: "/admin/pois",
      icon: MapPinIcon,
    },
    {
      title: "Reviews",
      url: "/admin/reviews",
      icon: StarIcon,
    },
    {
      title: "Homepage",
      url: "/admin/homepage",
      icon: LayoutIcon,
    },
    {
      title: "Pages & SEO",
      url: "/admin/pages",
      icon: FileTextIcon,
    },
  ],
  navSecondary: [
    {
      title: "View Website",
      url: "/",
      icon: HomeIcon,
    },
    {
      title: "Settings",
      url: "#",
      icon: SettingsIcon,
    },
    {
      title: "Help",
      url: "#",
      icon: HelpCircleIcon,
    },
  ],
}

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user?: { name: string; email: string; avatar: string }
}) {
  const resolvedUser = user ?? { name: "Admin", email: "", avatar: "" }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/admin/dashboard">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-zinc-800 flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-4 h-4 text-white">
                      <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" fill="none" stroke="currentColor" strokeWidth="8" />
                    </svg>
                  </div>
                  <span className="text-base font-semibold">Frog House</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navData.navMain} />
        <NavSecondary items={navData.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={resolvedUser} />
      </SidebarFooter>
    </Sidebar>
  )
}
