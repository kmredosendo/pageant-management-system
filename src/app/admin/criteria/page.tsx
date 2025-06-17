"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { AdminNav } from "@/components/admin-nav";
import { ActiveEventLabel } from "@/components/active-event-label";
import { Edit, Trash2, ListChecks, Plus } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";

const COMMON_IDENTIFIERS = [
  { value: "best-in-talent", label: "Best in Talent" },
  { value: "best-in-interview", label: "Best in Interview" },
  { value: "best-in-gown", label: "Best in Gown" },
  { value: "best-in-swimsuit", label: "Best in Swimsuit" },
];

type SubCriteria = {
  id: number;
  name: string;
  weight: number;
  autoAssignToAllContestants: boolean;
};

type MainCriteria = {
  id: number;
  name: string;
  identifier?: string;
  subCriterias: SubCriteria[];
};

export default function CriteriaPage() {
  const [criterias, setCriterias] = useState<MainCriteria[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [newMainName, setNewMainName] = useState("");
  const [newMainIdentifier, setNewMainIdentifier] = useState("");
  const [formError, setFormError] = useState("");

  // Sub-criteria dialog state
  const [subDialogOpen, setSubDialogOpen] = useState<number | null>(null); // main criteria id
  const [newSubName, setNewSubName] = useState("");
  const [newSubWeight, setNewSubWeight] = useState("");
  const [newSubAuto, setNewSubAuto] = useState(false);
  const [subFormError, setSubFormError] = useState("");

  // Edit/delete dialog state
  const [editMainId, setEditMainId] = useState<number | null>(null);
  const [editMainName, setEditMainName] = useState("");
  const [editMainIdentifier, setEditMainIdentifier] = useState("");
  const [editMainError, setEditMainError] = useState("");
  const [deleteMainId, setDeleteMainId] = useState<number | null>(null);
  const [editSubId, setEditSubId] = useState<number | null>(null);
  const [editSubName, setEditSubName] = useState("");
  const [editSubWeight, setEditSubWeight] = useState("");
  const [editSubAuto, setEditSubAuto] = useState(false);
  const [deleteSubId, setDeleteSubId] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/admin/criteria")
      .then(res => res.json())
      .then(data => {
        setCriterias(data);
        setLoading(false);
      })
      .catch(() => {
        setCriterias([]);
        setLoading(false);
        toast.error("Failed to load criteria. Please try again.");
      });
  }, []);

  const handleAddMainCriteria = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    const res = await fetch("/api/admin/criteria", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newMainName, identifier: newMainIdentifier }),
    });
    if (res.ok) {
      setOpen(false);
      setNewMainName("");
      setNewMainIdentifier("");
      setFormError("");
      fetch("/api/admin/criteria")
        .then(res => res.json())
        .then(data => setCriterias(data));
      toast.success("Main criteria added successfully.");
    } else {
      setFormError("Failed to add main criteria");
      toast.error("Failed to add main criteria.");
    }
  };

  const handleAddSubCriteria = async (mainId: number) => {
    setSubFormError("");
    const res = await fetch("/api/admin/criteria", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newSubName, weight: newSubWeight, parentId: mainId, autoAssignToAllContestants: newSubAuto }),
    });
    if (res.ok) {
      setSubDialogOpen(null);
      setNewSubName("");
      setNewSubWeight("");
      setNewSubAuto(false);
      setSubFormError("");
      fetch("/api/admin/criteria")
        .then(res => res.json())
        .then(data => setCriterias(data));
      toast.success("Sub-criteria added successfully.");
    } else {
      setSubFormError("Failed to add sub-criteria");
      toast.error("Failed to add sub-criteria.");
    }
  };

  // Edit main criteria
  const openEditMain = (main: MainCriteria) => {
    setEditMainId(main.id);
    setEditMainName(main.name);
    setEditMainIdentifier(main.identifier || "");
    setEditMainError("");
  };
  const handleEditMain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editMainId) return;
    setEditMainError("");
    const res = await fetch("/api/admin/criteria", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editMainId, name: editMainName, identifier: editMainIdentifier }),
    });
    if (res.ok) {
      setEditMainId(null);
      setEditMainName("");
      setEditMainIdentifier("");
      setEditMainError("");
      fetch("/api/admin/criteria").then(res => res.json()).then(data => setCriterias(data));
      toast.success("Main criteria updated successfully.");
    } else {
      setEditMainError("Failed to update main criteria");
      toast.error("Failed to update main criteria.");
    }
  };
  // Delete main criteria
  const handleDeleteMain = async () => {
    if (!deleteMainId) return;
    await fetch("/api/admin/criteria", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: deleteMainId }),
    });
    setDeleteMainId(null);
    fetch("/api/admin/criteria").then(res => res.json()).then(data => setCriterias(data));
    toast.success("Main criteria deleted successfully.");
  };
  // Edit sub-criteria
  const openEditSub = (sub: SubCriteria) => {
    setEditSubId(sub.id);
    setEditSubName(sub.name);
    setEditSubWeight(sub.weight.toString());
    setEditSubAuto(sub.autoAssignToAllContestants);
  };
  const handleEditSub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editSubId) return;
    const res = await fetch("/api/admin/criteria", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editSubId, name: editSubName, weight: editSubWeight, autoAssignToAllContestants: editSubAuto }),
    });
    if (res.ok) {
      setEditSubId(null);
      setEditSubName("");
      setEditSubWeight("");
      setEditSubAuto(false);
      fetch("/api/admin/criteria").then(res => res.json()).then(data => setCriterias(data));
      toast.success("Sub-criteria updated successfully.");
    }
  };
  // Delete sub-criteria
  const handleDeleteSub = async () => {
    if (!deleteSubId) return;
    await fetch("/api/admin/criteria", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: deleteSubId }),
    });
    setDeleteSubId(null);
    fetch("/api/admin/criteria").then(res => res.json()).then(data => setCriterias(data));
    toast.success("Sub-criteria deleted successfully.");
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
              <ListChecks className="w-5 h-5 text-primary" />
              Criteria
            </CardTitle>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="default">
                  <Plus className="w-4 h-4 mr-2" /> New Main Criteria
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md w-full">
                <DialogHeader>
                  <DialogTitle>New Main Criteria</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddMainCriteria} className="space-y-4">
                  <div>
                    <Input
                      placeholder="Main Criteria Name"
                      value={newMainName}
                      onChange={e => setNewMainName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Select value={newMainIdentifier} onValueChange={setNewMainIdentifier}>
                      <SelectTrigger>
                        <SelectValue placeholder="Identifier (e.g. best-in-talent)" />
                      </SelectTrigger>
                      <SelectContent>
                        {COMMON_IDENTIFIERS.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      className="mt-2"
                      placeholder="Or enter custom identifier"
                      value={newMainIdentifier}
                      onChange={e => setNewMainIdentifier(e.target.value)}
                      pattern="[a-zA-Z0-9\-]+"
                      minLength={3}
                      maxLength={32}
                    />
                    <div className="text-xs text-muted-foreground mt-1">Optional, unique. Used for results computation.</div>
                  </div>
                  {formError && <div className="text-destructive text-sm">{formError}</div>}
                  <div className="flex gap-2 justify-end">
                    <DialogClose asChild>
                      <Button type="button" variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit">Add</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center text-muted-foreground py-10">Loading...</div>
          ) : criterias.length === 0 ? (
            <div className="text-center text-muted-foreground py-10">No criteria found.</div>
          ) : (
            <ul className="space-y-4">
              {criterias.map(main => {
                const totalWeight = main.subCriterias.reduce((sum, sub) => sum + (sub.weight || 0), 0);
                return (
                  <li key={main.id} className="bg-background rounded-md p-4 shadow-sm">
                    <div className="font-semibold flex items-center justify-between">
                      <span>{main.name} {totalWeight > 0 && <span className="text-xs text-muted-foreground">({totalWeight}%)</span>} {main.identifier && <span className="text-xs text-muted-foreground">({main.identifier})</span>}</span>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEditMain(main)}><Edit className="w-4 h-4" /></Button>
                        <Button size="sm" variant="destructive" onClick={() => setDeleteMainId(main.id)}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </div>
                    {main.subCriterias.length > 0 && (
                      <ul className="ml-4 mt-2 space-y-1">
                        {main.subCriterias.map(sub => (
                          <li key={sub.id} className="flex items-center justify-between">
                            <span>{sub.name} <span className="text-xs text-muted-foreground">({sub.weight}%)</span> {sub.autoAssignToAllContestants && <span className="text-xs text-primary">(Auto)</span>}</span>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => openEditSub(sub)}><Edit className="w-4 h-4" /></Button>
                              <Button size="sm" variant="destructive" onClick={() => setDeleteSubId(sub.id)}><Trash2 className="w-4 h-4" /></Button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                    <Dialog open={subDialogOpen === main.id} onOpenChange={open => setSubDialogOpen(open ? main.id : null)}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="mt-2">
                          <Plus className="w-4 h-4 mr-2" /> Add Sub-Criteria
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md w-full">
                        <DialogHeader>
                          <DialogTitle>New Sub-Criteria for {main.name}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={e => { e.preventDefault(); handleAddSubCriteria(main.id); }} className="space-y-4">
                          <div>
                            <Input
                              placeholder="Sub-Criteria Name"
                              value={newSubName}
                              onChange={e => setNewSubName(e.target.value)}
                              required
                            />
                          </div>
                          <div>
                            <Input
                              placeholder="Weight (%)"
                              type="number"
                              min={0}
                              max={100}
                              value={newSubWeight}
                              onChange={e => setNewSubWeight(e.target.value)}
                              required
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="autoAssignToAllContestants"
                              checked={newSubAuto}
                              onChange={e => setNewSubAuto(e.target.checked)}
                            />
                            <label htmlFor="autoAssignToAllContestants" className="text-sm">Auto-assign to all contestants</label>
                          </div>
                          {subFormError && <div className="text-destructive text-sm">{subFormError}</div>}
                          <div className="flex gap-2 justify-end">
                            <DialogClose asChild>
                              <Button type="button" variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button type="submit">Add</Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                    {/* Edit Main Dialog */}
                    <Dialog open={editMainId === main.id} onOpenChange={open => { if (!open) setEditMainId(null); }}>
                      <DialogContent className="max-w-md w-full">
                        <DialogHeader>
                          <DialogTitle>Edit Main Criteria</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleEditMain} className="space-y-4">
                          <div>
                            <Input
                              placeholder="Main Criteria Name"
                              value={editMainName}
                              onChange={e => setEditMainName(e.target.value)}
                              required
                            />
                          </div>
                          <div>
                            <Select value={editMainIdentifier} onValueChange={setEditMainIdentifier}>
                              <SelectTrigger>
                                <SelectValue placeholder="Identifier (e.g. best-in-talent)" />
                              </SelectTrigger>
                              <SelectContent>
                                {COMMON_IDENTIFIERS.map(opt => (
                                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Input
                              className="mt-2"
                              placeholder="Or enter custom identifier"
                              value={editMainIdentifier}
                              onChange={e => setEditMainIdentifier(e.target.value)}
                              pattern="[a-zA-Z0-9\-]+"
                              minLength={3}
                              maxLength={32}
                            />
                            <div className="text-xs text-muted-foreground mt-1">Optional, unique. Used for results computation.</div>
                          </div>
                          {editMainError && <div className="text-destructive text-sm">{editMainError}</div>}
                          <div className="flex gap-2 justify-end">
                            <DialogClose asChild>
                              <Button type="button" variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button type="submit">Save</Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                    {/* Delete Main Dialog */}
                    <AlertDialog open={deleteMainId === main.id} onOpenChange={open => { if (!open) setDeleteMainId(null); }}>
                      <AlertDialogContent className="max-w-md w-full">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Main Criteria</AlertDialogTitle>
                        </AlertDialogHeader>
                        <div>Are you sure you want to delete <span className="font-semibold">{main.name}</span> and all its sub-criteria?</div>
                        <div className="flex gap-2 justify-end mt-4">
                          <AlertDialogCancel asChild>
                            <Button type="button" variant="outline">Cancel</Button>
                          </AlertDialogCancel>
                          <AlertDialogAction asChild>
                            <Button type="button" variant="destructive" onClick={handleDeleteMain}>Delete</Button>
                          </AlertDialogAction>
                        </div>
                      </AlertDialogContent>
                    </AlertDialog>
                    {/* Edit Sub Dialog */}
                    <Dialog open={editSubId !== null} onOpenChange={open => { if (!open) setEditSubId(null); }}>
                      <DialogContent className="max-w-md w-full">
                        <DialogHeader>
                          <DialogTitle>Edit Sub-Criteria</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleEditSub} className="space-y-4">
                          <div>
                            <Input
                              placeholder="Sub-Criteria Name"
                              value={editSubName}
                              onChange={e => setEditSubName(e.target.value)}
                              required
                            />
                          </div>
                          <div>
                            <Input
                              placeholder="Weight (%)"
                              type="number"
                              min={0}
                              max={100}
                              value={editSubWeight}
                              onChange={e => setEditSubWeight(e.target.value)}
                              required
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="editAutoAssignToAllContestants"
                              checked={editSubAuto}
                              onChange={e => setEditSubAuto(e.target.checked)}
                            />
                            <label htmlFor="editAutoAssignToAllContestants" className="text-sm">Auto-assign to all contestants</label>
                          </div>
                          <div className="flex gap-2 justify-end">
                            <DialogClose asChild>
                              <Button type="button" variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button type="submit">Save</Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                    {/* Delete Sub Dialog */}
                    <AlertDialog open={deleteSubId !== null} onOpenChange={open => { if (!open) setDeleteSubId(null); }}>
                      <AlertDialogContent className="max-w-md w-full">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Sub-Criteria</AlertDialogTitle>
                        </AlertDialogHeader>
                        <div>Are you sure you want to delete this sub-criteria?</div>
                        <div className="flex gap-2 justify-end mt-4">
                          <AlertDialogCancel asChild>
                            <Button type="button" variant="outline">Cancel</Button>
                          </AlertDialogCancel>
                          <AlertDialogAction asChild>
                            <Button type="button" variant="destructive" onClick={handleDeleteSub}>Delete</Button>
                          </AlertDialogAction>
                        </div>
                      </AlertDialogContent>
                    </AlertDialog>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
