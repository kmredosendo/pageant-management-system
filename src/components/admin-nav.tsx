"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
	Gauge,
	Trophy,
	Users,
	UserCheck,
	ListChecks,
	Medal,
} from "lucide-react";

const navItems = [
	{ href: "/admin/dashboard", label: "Dashboard", icon: Gauge },
	{ href: "/admin/events", label: "Events", icon: Trophy },
	{ href: "/admin/contestants", label: "Contestants", icon: Users },
	{ href: "/admin/judges", label: "Judges", icon: UserCheck },
	{ href: "/admin/criteria", label: "Criteria", icon: ListChecks },
	{ href: "/admin/results", label: "Results", icon: Medal },
];

export function AdminNav() {
	const pathname = usePathname();
	return (
		<section className="flex flex-wrap gap-2 justify-center">
			{navItems.map((item) => {
				const isActive =
					pathname === item.href ||
					(item.href === "/admin/dashboard" && pathname === "/admin");
				const Icon = item.icon;
				return (
					<Button
						asChild
						key={item.href}
						variant={isActive ? "default" : "outline"}
						className={isActive ? "font-bold" : ""}
						size="sm"
					>
						<Link href={item.href} className="flex items-center gap-2">
							{Icon && <Icon className="w-4 h-4" />}
							<span>{item.label}</span>
						</Link>
					</Button>
				);
			})}
		</section>
	);
}
