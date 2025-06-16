"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

const navItems = [
	{ href: "/admin/dashboard", label: "Dashboard" },
	{ href: "/admin/events", label: "Events" },
	{ href: "/admin/contestants", label: "Contestants" },
	{ href: "/admin/judges", label: "Judges" },
	{ href: "/admin/criteria", label: "Criteria" },
	{ href: "/admin/results", label: "Results" },
];

export function AdminNav() {
	const pathname = usePathname();
	return (
		<section className="flex flex-wrap gap-2 justify-center">
			{navItems.map((item) => {
				const isActive =
					pathname === item.href ||
					(item.href === "/admin/dashboard" && pathname === "/admin");
				return (
					<Button
						asChild
						key={item.href}
						variant={isActive ? "default" : "outline"}
						className={isActive ? "font-bold" : ""}
						size="sm"
					>
						<Link href={item.href}>{item.label}</Link>
					</Button>
				);
			})}
		</section>
	);
}
