"use client";

import { useRouter } from "next/navigation";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";

export default function Home() {
	const [event, setEvent] = useState<{ id: number; name: string } | null>(null);
	const [judges, setJudges] = useState<{ id: number; number: number; name: string }[]>([]);
	const [selectedJudge, setSelectedJudge] = useState<string>("");
	const router = useRouter();

	useEffect(() => {
		fetch("/api/admin/events/active")
			.then((res) => res.json())
			.then((events) => {
				if (Array.isArray(events) && events.length > 0) {
					setEvent(events[0]);
					fetch("/api/admin/judges")
						.then((res) => res.json())
						.then((data) => setJudges(data));
				}
			});
	}, []);

	const handleJudgeSelect = (value: string) => {
		setSelectedJudge(value);
		if (value) {
			router.push(`/score/${value}`);
		}
	};

	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-background p-4">
			<Card className="w-full max-w-xl mx-auto p-8 flex flex-col items-center gap-8 shadow-xl">
				<h1 className="text-3xl sm:text-4xl font-bold text-center text-primary drop-shadow mb-2">
					{event ? event.name : "No Active Event"}
				</h1>
				<div className="w-full flex flex-col items-center gap-4">
					<div className="text-lg font-medium text-center mb-2">Select Judge</div>
					<Select value={selectedJudge} onValueChange={handleJudgeSelect} disabled={!event || judges.length === 0}>
						<SelectTrigger className="w-64">
							<SelectValue placeholder="Choose a judge..." />
						</SelectTrigger>
						<SelectContent>
							{judges.map((judge) => (
								<SelectItem key={judge.id} value={judge.id.toString()}>
									Judge #{judge.number} - {judge.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</Card>
		</div>
	);
}
