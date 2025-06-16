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

type Event = {
  id: number;
  name: string;
  date: string;
  status: string;
};

type Contestant = {
  id: number;
  number: number;
  name: string;
  sex?: string;
};

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

  // Remove event selector and use active event for new contestants
  const [activeEvent, setActiveEvent] = useState<Event | null>(null);
  useEffect(() => {
    fetch("/api/admin/events/active")
      .then(res => res.json())
      .then(data => {
        if (data.length > 0) setActiveEvent(data[0]);
      });
    fetch("/api/admin/contestants")
      .then(res => res.json())
      .then(data => {
        setContestants(data);
        setLoading(false);
      });
  }, []);

  const handleAddContestant = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!activeEvent) {
      setFormError("No active event selected");
      return;
    }
    const res = await fetch("/api/admin/contestants", {
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
      fetch("/api/admin/contestants")
        .then(res => res.json())
        .then(data => setContestants(data));
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
    if (!editContestant) return;
    setEditFormError("");
    const res = await fetch(`/api/admin/contestants/${editContestant.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ number: editNumber, name: editName, sex: editSex }),
    });
    if (res.ok) {
      setEditDialogOpen(false);
      setEditContestant(null);
      fetch("/api/admin/contestants")
        .then(res => res.json())
        .then(data => setContestants(data));
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
    if (!contestantToDelete) return;
    const res = await fetch(`/api/admin/contestants/${contestantToDelete.id}`, { method: "DELETE" });
    if (res.ok) {
      setContestants(contestants => contestants.filter(c => c.id !== contestantToDelete.id));
      setDeleteDialogOpen(false);
      setContestantToDelete(null);
      setDeleteError("");
      toast.success("Contestant deleted successfully");
    } else {
      setDeleteError("Failed to delete contestant");
      toast.error("Failed to delete contestant");
    }
  };

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
                <Button variant="default">
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
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md w-full">
          <DialogHeader>
            <DialogTitle>Delete Contestant</DialogTitle>
          </DialogHeader>
          <div className="mb-2">
            Are you sure you want to delete contestant <span className="font-semibold">#{contestantToDelete?.number} {contestantToDelete?.name}</span>?
            <br />
            <span className="text-destructive font-semibold">This action cannot be undone.</span>
          </div>
          {deleteError && <div className="text-destructive text-sm mb-2">{deleteError}</div>}
          <div className="flex gap-2 justify-end mt-2">
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            </DialogClose>
            <Button type="button" variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
