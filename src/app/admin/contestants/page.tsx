"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { AdminNav } from "@/components/admin-nav";
import { Users, Edit, Trash2, Plus } from "lucide-react";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { ActiveEventLabel } from "@/components/active-event-label";
import { toast } from "sonner";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";

// Add Contestant interface to match the expected structure and resolve the missing type error
interface Contestant {
  id: number;
  number: number;
  name: string;
  sex?: string;
}

// Add Event type for local state
interface Event {
  id: number;
  name: string;
  date: string;
  status: string;
}

export default function ContestantsPage() {
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [newNumber, setNewNumber] = useState("");
  const [newName, setNewName] = useState("");
  const [newSex, setNewSex] = useState("");
  const [formError, setFormError] = useState("");

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editContestant, setEditContestant] = useState<Contestant | null>(null);
  const [editNumber, setEditNumber] = useState("");
  const [editName, setEditName] = useState("");
  const [editSex, setEditSex] = useState("");
  const [editFormError, setEditFormError] = useState("");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contestantToDelete, setContestantToDelete] = useState<Contestant | null>(null);
  const [deleteError, setDeleteError] = useState("");

  // Store active event in state
  const [activeEvent, setActiveEvent] = useState<Event | null>(null);

  // Fetch contestants for the current event
  const fetchContestants = (eventId: number) => {
    setLoading(true);
    fetch(`/api/admin/contestants?eventId=${eventId}`)
      .then(res => res.json())
      .then(data => {
        setContestants(data);
        setLoading(false);
      })
      .catch(() => {
        setContestants([]);
        setLoading(false);
      });
  };

  // Remove all localStorage usage and always fetch active event from API
  useEffect(() => {
    const loadActiveEvent = async () => {
      const res = await fetch("/api/admin/events/active");
      const data = await res.json();
      if (data.length > 0) {
        setActiveEvent(data[0]);
      } else {
        setActiveEvent(null);
      }
    };
    loadActiveEvent();
  }, []);

  // Fetch contestants whenever activeEvent changes
  useEffect(() => {
    if (activeEvent && activeEvent.id) {
      fetchContestants(activeEvent.id);
    } else {
      setContestants([]);
      setLoading(false);
    }
  }, [activeEvent]);

  const handleAddContestant = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!activeEvent) {
      setFormError("No active event selected");
      return;
    }
    const res = await fetch(`/api/admin/contestants?eventId=${activeEvent.id}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ number: newNumber, name: newName, sex: newSex, eventId: activeEvent.id }),
      });
    if (res.ok) {
      setOpen(false);
      setNewNumber("");
      setNewName("");
      setNewSex("");
      setFormError("");
      fetchContestants(activeEvent.id);
      toast.success("Contestant added successfully");
    } else {
      setFormError("Failed to add contestant");
      toast.error("Failed to add contestant");
    }
  };

  const openEditDialog = (contestant: Contestant) => {
    setEditContestant(contestant);
    setEditNumber(contestant.number.toString());
    setEditName(contestant.name);
    setEditSex(contestant.sex || "");
    setEditFormError("");
    setEditDialogOpen(true);
  };

  const handleEditContestant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editContestant || !activeEvent) return;
    setEditFormError("");
    const res = await fetch(`/api/admin/contestants/${editContestant.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ number: editNumber, name: editName, sex: editSex }),
      });
    if (res.ok) {
      setEditDialogOpen(false);
      setEditContestant(null);
      fetchContestants(activeEvent.id);
      toast.success("Contestant updated successfully");
    } else {
      setEditFormError("Failed to update contestant");
      toast.error("Failed to update contestant");
    }
  };

  const handleDeleteContestant = (contestant: Contestant) => {
    setContestantToDelete(contestant);
    setDeleteDialogOpen(true);
    setDeleteError("");
  };

  const handleConfirmDelete = async () => {
    if (!contestantToDelete || !activeEvent) return;
    const res = await fetch(`/api/admin/contestants/${contestantToDelete.id}`, { method: "DELETE" });
    if (res.ok) {
      fetchContestants(activeEvent.id);
      setDeleteDialogOpen(false);
      setContestantToDelete(null);
      setDeleteError("");
      toast.success("Contestant deleted successfully");
    } else {
      setDeleteError("Failed to delete contestant");
      toast.error("Failed to delete contestant");
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
              <Users className="w-5 h-5" /> Contestants
            </CardTitle>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="default" disabled={!getActiveEventId()}>
                  <Plus className="w-4 h-4 mr-2" /> New Contestant
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md w-full">
                <DialogHeader>
                  <DialogTitle>New Contestant</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddContestant} className="space-y-4">
                  <div>
                    <Input
                      placeholder="Contestant Number"
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
                  <div>
                    <Select value={newSex} onValueChange={setNewSex}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sex (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MALE">Male</SelectItem>
                        <SelectItem value="FEMALE">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {formError && <div className="text-destructive text-sm">{formError}</div>}
                  <div className="flex gap-2 justify-end">
                    <DialogClose asChild>
                      <Button type="button" variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit">Add Contestant</Button>
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
          ) : contestants.length === 0 ? (
            <div className="text-center text-muted-foreground py-10">No contestants found.</div>
          ) : (
            <ul className="space-y-4">
              {contestants.map(contestant => (
                <li key={contestant.id} className="flex items-center justify-between bg-background rounded-md p-4 shadow-sm">
                  <div>
                    <div className="font-semibold">#{contestant.number} {contestant.name}</div>
                    {contestant.sex && <div className="text-xs text-muted-foreground">Sex: {contestant.sex}</div>}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => openEditDialog(contestant)}><Edit className="w-4 h-4" /></Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDeleteContestant(contestant)}><Trash2 className="w-4 h-4" /></Button>
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
            <DialogTitle>Edit Contestant</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditContestant} className="space-y-4">
            <div>
              <Input
                placeholder="Contestant Number"
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
            <div>
              <Select value={editSex} onValueChange={setEditSex}>
                <SelectTrigger>
                  <SelectValue placeholder="Sex (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                </SelectContent>
              </Select>
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
            <AlertDialogTitle>Delete Contestant</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="mb-2">
            Are you sure you want to delete contestant <span className="font-semibold">#{contestantToDelete?.number} {contestantToDelete?.name}</span>?
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
