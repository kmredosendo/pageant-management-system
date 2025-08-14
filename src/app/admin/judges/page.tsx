"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { AdminNav } from "@/components/admin-nav";
import { ActiveEventLabel } from "@/components/active-event-label";
import { UserCheck, Edit, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";

type Event = {
  id: number;
  name: string;
  date: string;
  status: string;
};

type Judge = {
  id: number;
  number: number;
  name: string;
};

export default function JudgesPage() {
  const [judges, setJudges] = useState<Judge[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [newNumber, setNewNumber] = useState("");
  const [newName, setNewName] = useState("");
  const [formError, setFormError] = useState("");

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editJudge, setEditJudge] = useState<Judge | null>(null);
  const [editNumber, setEditNumber] = useState("");
  const [editName, setEditName] = useState("");
  const [editFormError, setEditFormError] = useState("");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [judgeToDelete, setJudgeToDelete] = useState<Judge | null>(null);
  const [deleteError, setDeleteError] = useState("");

  // Store active event in state
  const [activeEvent, setActiveEvent] = useState<Event | null>(null);

  // Fetch judges for the current event
  const fetchJudges = (eventId: number) => {
    setLoading(true);
    fetch(`/api/admin/judges?eventId=${eventId}`)
      .then(res => res.json())
      .then(data => {
        setJudges(data);
        setLoading(false);
      })
      .catch(() => {
        setJudges([]);
        setLoading(false);
      });
  };

  // Always fetch active event from API
  useEffect(() => {
    async function loadActiveEvent() {
      const res = await fetch("/api/admin/events/active");
      const data = await res.json();
      if (data.length > 0) {
        setActiveEvent(data[0]);
        fetchJudges(data[0].id);
      } else {
        setActiveEvent(null);
        setJudges([]);
        setLoading(false);
      }
    }
    loadActiveEvent();
  }, []);

  const handleAddJudge = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!activeEvent) {
      setFormError("No active event selected");
      return;
    }
    const res = await fetch(`/api/admin/judges?eventId=${activeEvent.id}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ number: newNumber, name: newName }),
      });
    if (res.ok) {
      setOpen(false);
      setNewNumber("");
      setNewName("");
      setFormError("");
      fetchJudges(activeEvent.id);
      toast.success("Judge added successfully");
    } else {
      setFormError("Failed to add judge");
      toast.error("Failed to add judge");
    }
  };

  const openEditDialog = (judge: Judge) => {
    setEditJudge(judge);
    setEditNumber(judge.number.toString());
    setEditName(judge.name);
    setEditFormError("");
    setEditDialogOpen(true);
  };

  const handleEditJudge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editJudge || !activeEvent) return;
    setEditFormError("");
    const res = await fetch(`/api/admin/judges/${editJudge.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ number: editNumber, name: editName }),
      });
    if (res.ok) {
      setEditDialogOpen(false);
      setEditJudge(null);
      fetchJudges(activeEvent.id);
      toast.success("Judge updated successfully");
    } else {
      setEditFormError("Failed to update judge");
      toast.error("Failed to update judge");
    }
  };

  const handleDeleteJudge = (judge: Judge) => {
    setJudgeToDelete(judge);
    setDeleteDialogOpen(true);
    setDeleteError("");
  };

  const handleConfirmDelete = async () => {
    if (!judgeToDelete || !activeEvent) return;
    const res = await fetch(`/api/admin/judges/${judgeToDelete.id}`, { method: "DELETE" });
    if (res.ok) {
      fetchJudges(activeEvent.id);
      setDeleteDialogOpen(false);
      setJudgeToDelete(null);
      setDeleteError("");
      toast.success("Judge deleted successfully");
    } else {
      setDeleteError("Failed to delete judge");
      toast.error("Failed to delete judge");
    }
  };

  // Helper to get the current event id for UI disables
  const getActiveEventId = () => activeEvent?.id;

  return (
    <div className="min-h-screen bg-muted flex flex-col items-center py-10 px-2 sm:px-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="flex flex-col gap-2 items-stretch">
          <AdminNav />
          <ActiveEventLabel />
          <hr className="my-2" />
          <div className="flex items-center justify-between w-full">
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="w-4 h-4" /> Judges
            </CardTitle>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="default" disabled={!getActiveEventId()}>
                  <Plus className="w-4 h-4 mr-2" /> New Judge
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md w-full">
                <DialogHeader>
                  <DialogTitle>New Judge</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddJudge} className="space-y-4">
                  <div>
                    <Input
                      placeholder="Judge Number (1 is Chief Judge)"
                      value={newNumber}
                      onChange={e => setNewNumber(e.target.value)}
                      required
                      type="number"
                      min={1}
                    />
                  </div>
                  <div>
                    <Input
                      placeholder="Name"
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                      required
                    />
                  </div>
                  {formError && <div className="text-destructive text-sm">{formError}</div>}
                  <div className="flex gap-2 justify-end">
                    <DialogClose asChild>
                      <Button type="button" variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit">Add Judge</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center text-muted-foreground py-10">Loading...</div>
          ) : !activeEvent ? (
            <div className="text-center text-muted-foreground py-10">No active event selected.</div>
          ) : judges.length === 0 ? (
            <div className="text-center text-muted-foreground py-10">No judges found.</div>
          ) : (
            <ul className="space-y-4">
              {judges.map(judge => (
                <li key={judge.id} className="flex items-center justify-between bg-background rounded-md p-4 shadow-sm">
                  <div>
                    <div className="font-semibold">#{judge.number} {judge.name}{judge.number === 1 && " (Chief Judge)"}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex items-center gap-1" onClick={() => openEditDialog(judge)} size="sm"><Edit className="w-4 h-4" /></Button>
                    <Button variant="destructive" className="flex items-center gap-1" onClick={() => handleDeleteJudge(judge)} size="sm"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md w-full">
          <DialogHeader>
            <DialogTitle>Edit Judge</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditJudge} className="space-y-4">
            <div>
              <Input
                placeholder="Judge Number (1 is Chief Judge)"
                value={editNumber}
                onChange={e => setEditNumber(e.target.value)}
                required
                type="number"
                min={1}
              />
            </div>
            <div>
              <Input
                placeholder="Name"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                required
              />
            </div>
            {editFormError && <div className="text-destructive text-sm">{editFormError}</div>}
            <div className="flex gap-2 justify-end">
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-w-md w-full">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Judge</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="mb-2">
            Are you sure you want to delete judge <span className="font-semibold">#{judgeToDelete?.number} {judgeToDelete?.name}</span>?
            <br />
            <span className="text-destructive font-semibold">This action cannot be undone.</span>
          </div>
          {deleteError && <div className="text-destructive text-sm mb-2">{deleteError}</div>}
          <div className="flex gap-2 justify-end mt-2">
            <AlertDialogCancel asChild>
              <Button type="button" variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button type="button" variant="destructive" onClick={handleConfirmDelete}>
                Delete
              </Button>
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
