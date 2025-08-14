"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Medal, Star, Mic, Users, ListOrdered, User, Eye, Printer } from "lucide-react";
import { AdminNav } from "@/components/admin-nav";
import { ActiveEventLabel } from "@/components/active-event-label";

export default function AdminResultsPage() {
  return (
    <div className="min-h-screen bg-muted flex flex-col items-center py-10 px-2 sm:px-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="flex flex-col gap-2 items-stretch">
          <AdminNav />
          <ActiveEventLabel />
          <hr className="my-2" />
          <CardTitle className="flex items-center gap-2">
            <Medal className="w-5 h-5" /> Results
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-2">
          {/* Sub-cards for result categories, compact style */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full">
            {/* Best in Talent */}
            <Card className="w-full p-1">
              <div className="flex flex-row items-center justify-between gap-2 p-1">
                <div className="flex flex-row items-center gap-1">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="text-base font-semibold">Best in Talent</span>
                </div>
                <div className="flex gap-1">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="icon" aria-label="View" title="View Talent Results">
                        <Eye />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="w-5 h-5 text-yellow-500" />
                        <DialogTitle>Best in Talent</DialogTitle>
                      </div>
                      {/* Dialog content for Best in Talent goes here */}
                    </DialogContent>
                  </Dialog>
                  <Button variant="outline" size="icon" aria-label="Print" title="Print Talent Results">
                    <Printer />
                  </Button>
                </div>
              </div>
            </Card>
            {/* Best in Interview */}
            <Card className="w-full p-1">
              <div className="flex flex-row items-center justify-between gap-2 p-1">
                <div className="flex flex-row items-center gap-1">
                  <Mic className="w-5 h-5 text-blue-500" />
                  <span className="text-base font-semibold">Best in Interview</span>
                </div>
                <div className="flex gap-1">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="icon" aria-label="View" title="View Interview Results">
                        <Eye />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <div className="flex items-center gap-2 mb-2">
                        <Mic className="w-5 h-5 text-blue-500" />
                        <DialogTitle>Best in Interview</DialogTitle>
                      </div>
                      {/* Dialog content for Best in Interview goes here */}
                    </DialogContent>
                  </Dialog>
                  <Button variant="outline" size="icon" aria-label="Print" title="Print Interview Results">
                    <Printer />
                  </Button>
                </div>
              </div>
            </Card>
            {/* Rank per Judge */}
            <Card className="w-full p-1">
              <div className="flex flex-row items-center justify-between gap-2 p-1">
                <div className="flex flex-row items-center gap-1">
                  <Users className="w-5 h-5 text-green-500" />
                  <span className="text-base font-semibold">Rank per Judge</span>
                </div>
                <div className="flex gap-1">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="icon" aria-label="View" title="View Rank per Judge">
                        <Eye />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-5 h-5 text-green-500" />
                        <DialogTitle>Rank per Judge</DialogTitle>
                      </div>
                      {/* Dialog content for Rank per Judge goes here */}
                    </DialogContent>
                  </Dialog>
                  <Button variant="outline" size="icon" aria-label="Print" title="Print Rank per Judge">
                    <Printer />
                  </Button>
                </div>
              </div>
            </Card>
            {/* Final Rank */}
            <Card className="w-full p-1">
              <div className="flex flex-row items-center justify-between gap-2 p-1">
                <div className="flex flex-row items-center gap-1">
                  <ListOrdered className="w-5 h-5 text-purple-500" />
                  <span className="text-base font-semibold">Final Rank</span>
                </div>
                <div className="flex gap-1">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="icon" aria-label="View" title="View Final Rank">
                        <Eye />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <div className="flex items-center gap-2 mb-2">
                        <ListOrdered className="w-5 h-5 text-purple-500" />
                        <DialogTitle>Final Rank</DialogTitle>
                      </div>
                      {/* Dialog content for Final Rank goes here */}
                    </DialogContent>
                  </Dialog>
                  <Button variant="outline" size="icon" aria-label="Print" title="Print Final Rank">
                    <Printer />
                  </Button>
                </div>
              </div>
            </Card>
            {/* Contestant Rank */}
            <Card className="w-full p-1">
              <div className="flex flex-row items-center justify-between gap-2 p-1">
                <div className="flex flex-row items-center gap-1">
                  <User className="w-5 h-5 text-pink-500" />
                  <span className="text-base font-semibold">Contestant Rank</span>
                </div>
                <div className="flex gap-1">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="icon" aria-label="View" title="View Contestant Rank">
                        <Eye />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-5 h-5 text-pink-500" />
                        <DialogTitle>Contestant Rank</DialogTitle>
                      </div>
                      {/* Dialog content for Contestant Rank goes here */}
                    </DialogContent>
                  </Dialog>
                  <Button variant="outline" size="icon" aria-label="Print" title="Print Contestant Rank">
                    <Printer />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
