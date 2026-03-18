"use client";
import { useSession } from "@/lib/auth-client";
import DashboardHeader from "@/components/layout/DashboardHeader";
import ProtectedRoute from "@/components/providers/ProtectedRoute";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { ChartLine, Laptop, Users, ArrowUpRight } from "lucide-react";

const modules = [
  {
    name: "Digital Sales Lead Tracker",
    shortName: "CRM",
    icon: ChartLine,
    href: "/home/crm",
    description: "View and manage leads",
    accent: "#2563eb",
    tag: "CRM",
    permission: ["admin", "user"],
  },
  {
    name: "Content Studio Manager",
    shortName: "CMS",
    icon: Laptop,
    href: "/home/cms",
    description: "Manage website content and pages",
    accent: "#2563eb",
    tag: "Content",
    permission: ["admin", "user"],
  },
  {
    name: "Identity & Access Management",
    shortName: "IAM",
    icon: Users,
    href: "/home/user-management",
    description: "Manage user accounts and permissions",
    accent: "#2563eb",
    tag: "Admin",
    permission: ["admin"],
  },
];

function Home() {
  const { data: session } = useSession();
  const permissions = session?.user.role?.split(",") || [];

  return (
    <ProtectedRoute>
      <div className="h-screen w-full bg-accent">
        <main className="flex flex-col gap-10 p-8 px-8 md:px-16 lg:px-24 xl:px-44 h-screen">
          <DashboardHeader title="RLink" description="" />

          <div className="flex flex-col gap-10 flex-1">
            {/* Greeting */}
            <div className="flex flex-col gap-1">
              <p className="text-xs font-semibold tracking-widest text-neutral-400 uppercase">
                Welcome back
              </p>
              <h1 className="text-3xl font-bold text-accent-foreground tracking-tight">
                {(session?.user.firstName + " " + session?.user.lastName) || session?.user?.name || "User"}
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Select a module below to get started.
            </p>
            </div>

            {/* Module Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {modules.filter((module) => module.permission.some((permission) => permissions.includes(permission))).map((module, i) => (
                <Link href={module.href} key={module.name} className="group animate-fade-in-up">
                  <div className="relative flex flex-col justify-between h-52 rounded-2xl border border-border bg-background p-6 overflow-hidden transition-all duration-300 hover:shadow-sm hover:-translate-y-1">
                    {/* Top row: tag + arrow */}
                    <div className="flex items-center justify-end">
                      <ArrowUpRight
                        className="size-6 text-neutral-200 transition-all duration-200 group-hover:text-neutral-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    </div>

                    {/* Bottom: icon + name + description */}
                    <div className="flex flex-col gap-2">
                      <div
                        className="rounded-xl flex items-center">
                        <module.icon
                          className="size-10"
                          style={{ color: module.accent }}
                          strokeWidth={1.75}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-primary mt-0.5">
                          {module.shortName}
                        </p>
                        <h2 className="text-2xl font-bold text-foreground leading-tight">
                          {module.name}
                        </h2>
                        <p className="text-xs text-neutral-400 mt-0.5">
                          {module.description}
                        </p>
                      </div>
                    </div>           
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <footer>
            <Footer />
          </footer>
        </main>
      </div>
    </ProtectedRoute>
  );
}

export default Home;