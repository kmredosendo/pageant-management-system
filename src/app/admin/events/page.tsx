"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Edit, Trash2, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { AdminNav } from "@/components/admin-nav";
import { Switch } from "@/components/ui/switch";
import { ActiveEventLabel } from "@/components/active-event-label";
import { toast } from "sonner";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";

type Event = {
  id: number;
  name: string;
  date: string;
  status: "ACTIVE" | "INACTIVE";
};

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [newEventName, setNewEventName] = useState("");
  const [newEventDate, setNewEventDate] = useState("");
  const [formError, setFormError] = useState("");

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editEvent, setEditEvent] = useState<Event | null>(null);
  const [editEventName, setEditEventName] = useState("");
  const [editEventDate, setEditEventDate] = useState("");
  const [editFormError, setEditFormError] = useState("");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState("");
  const [deleteError, setDeleteError] = useState("");

  const [refreshActiveEventLabel, setRefreshActiveEventLabel] = useState(0);

  useEffect(() => {
    fetch("/api/admin/events")
      .then(res => res.json())
      .then(data => {
        setEvents(data);
        setLoading(false);
      });
  }, [refreshActiveEventLabel]);

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    const res = await fetch("/api/admin/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newEventName, date: newEventDate }),
    });
    if (res.ok) {
      setOpen(false);
      setNewEventName("");
      setNewEventDate("");
      setFormError("");
      toast.success('Event created successfully');
      setRefreshActiveEventLabel(k => k + 1);
      // Refresh events
      fetch("/api/admin/events")
        .then(res => res.json())
        .then(data => {
          setEvents(data);
        });
    } else {
      setFormError("Failed to create event");
      toast.error('Failed to create event');
    }
  };

  const openEditDialog = (event: Event) => {
    setEditEvent(event);
    setEditEventName(event.name);
    setEditEventDate(event.date.slice(0, 10));
    setEditFormError("");
    setEditDialogOpen(true);
  };

  const handleEditEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editEvent) return;
    setEditFormError("");
    const res = await fetch(`/api/admin/events/${editEvent.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editEventName, date: editEventDate }),
    });
    if (res.ok) {
      setEditDialogOpen(false);
      setEditEvent(null);
      toast.success('Event updated successfully');
      setRefreshActiveEventLabel(k => k + 1);
      // Refresh events
      fetch("/api/admin/events")
        .then(res => res.json())
        .then(data => {
          setEvents(data);
        });
    } else {
      setEditFormError("Failed to update event");
      toast.error('Failed to update event');
    }
  };

  const handleDeleteClick = (event: Event) => {
    setEventToDelete(event);
    setDeleteDialogOpen(true);
    setDeleteConfirmInput("");
    setDeleteError("");
  };

  const handleConfirmDelete = async () => {
    if (!eventToDelete) return;
    if (deleteConfirmInput !== eventToDelete.name) {
      setDeleteError("Event name does not match. Please type the event name exactly to confirm deletion.");
      return;
    }
    const res = await fetch(`/api/admin/events/${eventToDelete.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setEvents(events => events.filter(e => e.id !== eventToDelete.id));
      setDeleteDialogOpen(false);
      setEventToDelete(null);
      setDeleteConfirmInput("");
      setDeleteError("");
      toast.success('Event deleted successfully');
      setRefreshActiveEventLabel(k => k + 1);
    } else {
      setDeleteDialogOpen(false);
      setEventToDelete(null);
      setDeleteConfirmInput("");
      setDeleteError("");
      toast.error('Failed to delete event');
      // Optionally show error toast or message
    }
  };

  return (
    <div className="min-h-screen bg-muted flex flex-col items-center py-10 px-2 sm:px-4">
      {/* Main Events Card */}
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="flex flex-col gap-2 items-stretch">
          <AdminNav />
          <ActiveEventLabel refresh={refreshActiveEventLabel} />
          <hr className="my-2" />
          <div className="flex items-center justify-between w-full">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" /> Events
            </CardTitle>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="default">
                  <Plus className="w-4 h-4 mr-2" /> New Event
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md w-full">
                <DialogHeader>
                  <DialogTitle>New Event</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddEvent} className="space-y-4">
                  <div>
                    <Input
                      placeholder="Event Name"
                      value={newEventName}
                      onChange={e => setNewEventName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Input
                      type="date"
                      value={newEventDate}
                      onChange={e => setNewEventDate(e.target.value)}
                      required
                    />
                  </div>
                  {formError && <div className="text-destructive text-sm">{formError}</div>}
                  <div className="flex gap-2 justify-end">
                    <DialogClose asChild>
                      <Button type="button" variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit">Create Event</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center text-muted-foreground py-10">Loading...</div>
          ) : events.length === 0 ? (
            <div className="text-center text-muted-foreground py-10">No events found.</div>
          ) : (
            <ul className="space-y-4">
              {[...events]
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map(event => (
                  <li key={event.id} className="flex items-center justify-between bg-background rounded-md p-4 shadow-sm">
                    <div>
                      <div className="font-semibold">{event.name}</div>
                      <div className="text-xs text-muted-foreground">{new Date(event.date).toLocaleDateString()}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Switch
                          checked={event.status === "ACTIVE"}
                          onCheckedChange={async (checked) => {
                            if (checked) {
                              // Deactivate any currently active event first
                              const currentActive = events.find(e => e.status === "ACTIVE" && e.id !== event.id);
                              if (currentActive) {
                                await fetch(`/api/admin/events/${currentActive.id}`, {
                                  method: "PUT",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({
                                    name: currentActive.name,
                                    date: currentActive.date,
                                    status: "INACTIVE"
                                  })
                                });
                              }
                            }
                            await fetch(`/api/admin/events/${event.id}`, {
                              method: "PUT",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                name: event.name,
                                date: event.date,
                                status: checked ? "ACTIVE" : "INACTIVE"
                              })
                            });
                            setRefreshActiveEventLabel(k => k + 1);
                            fetch("/api/admin/events")
                              .then(res => res.json())
                              .then(data => {
                                setEvents(data);
                              });
                          }}
                        />
                        <span className="text-xs">{event.status === "ACTIVE" ? "Active" : "Inactive"}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => openEditDialog(event)} className="flex items-center gap-1" size="sm"><Edit className="w-4 h-4" /></Button>
                      <Button variant="destructive" onClick={() => handleDeleteClick(event)} size="sm"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </li>
                ))}
            </ul>
          )}
          {/* Edit Event Dialog */}
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent className="max-w-md w-full">
              <DialogHeader>
                <DialogTitle>Edit Event</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleEditEvent} className="space-y-4">
                <div>
                  <Input
                    placeholder="Event Name"
                    value={editEventName}
                    onChange={e => setEditEventName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Input
                    type="date"
                    value={editEventDate}
                    onChange={e => setEditEventDate(e.target.value)}
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
          {/* Delete Confirmation Dialog */}
          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogContent className="max-w-md w-full">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Event</AlertDialogTitle>
              </AlertDialogHeader>
              <div className="mb-2">
                Are you sure you want to delete the event <span className="font-semibold">{eventToDelete?.name}</span>?<br />
                <span className="text-destructive font-semibold">This will also permanently delete all contestants, judges, criteria, and scores for this event. This action cannot be undone.</span>
              </div>
              <div className="mb-2">
                Please type <span className="font-mono font-semibold">{eventToDelete?.name}</span> to confirm:
              </div>
              <Input
                value={deleteConfirmInput}
                onChange={e => setDeleteConfirmInput(e.target.value)}
                placeholder="Type event name to confirm"
                autoFocus
                className="mb-2"
                disabled={!eventToDelete}
              />
              {deleteError && <div className="text-destructive text-sm mb-2">{deleteError}</div>}
              <div className="flex gap-2 justify-end mt-2">
                <AlertDialogCancel asChild>
                  <Button type="button" variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                </AlertDialogCancel>
                <AlertDialogAction asChild>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleConfirmDelete}
                    disabled={!eventToDelete || deleteConfirmInput !== eventToDelete?.name}
                  >
                    Delete
                  </Button>
                </AlertDialogAction>
              </div>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
