import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Settings, ListChecks, Users, ClipboardList, BarChart } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-muted flex flex-col items-center py-10 px-2 sm:px-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" /> Admin Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/admin/events">
            <Button variant="outline" className="w-full flex gap-2 justify-start">
              <ClipboardList className="w-4 h-4" /> Manage Events
            </Button>
          </Link>
          <Link href="/admin/contestants">
            <Button variant="outline" className="w-full flex gap-2 justify-start">
              <Users className="w-4 h-4" /> Manage Contestants
            </Button>
          </Link>
          <Link href="/admin/judges">
            <Button variant="outline" className="w-full flex gap-2 justify-start">
              <User className="w-4 h-4" /> Manage Judges
            </Button>
          </Link>
          <Link href="/admin/criteria">
            <Button variant="outline" className="w-full flex gap-2 justify-start">
              <ListChecks className="w-4 h-4" /> Manage Criteria
            </Button>
          </Link>
          <Link href="/admin/results">
            <Button variant="outline" className="w-full flex gap-2 justify-start">
              <BarChart className="w-4 h-4" /> View Results
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
