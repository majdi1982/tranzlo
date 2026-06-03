"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Users, Search, Ban, CheckCircle, MoreHorizontal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AuthGuard } from "@/guards/auth-guard";
import { getDatabases, DB_ID, COLLECTIONS, Query } from "@/lib/appwrite";
import type { User } from "@/types";

export default function AdminUsersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [suspendTarget, setSuspendTarget] = React.useState<string | null>(null);

  React.useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const db = getDatabases();
      const profiles = await db.listDocuments(DB_ID, COLLECTIONS.translatorProfiles);
      const companyProfiles = await db.listDocuments(DB_ID, COLLECTIONS.companyProfiles);
      const allUsers: User[] = [];
      for (const p of [...profiles.documents, ...companyProfiles.documents]) {
        allUsers.push({
          $id: (p.userId as string) || p.$id,
          email: (p.email as string) || "",
          name: (p.fullName as string) || (p.companyName as string) || "",
          emailVerification: false,
          registration: (p.createdAt as string) || "",
          status: (p.status as string) !== "suspended",
          prefs: { role: p.role },
        });
      }
      setUsers(allUsers);
    } catch {
      toast({ title: "Failed to load users", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function handleSuspend(userId: string) {
    try {
      const db = getDatabases();
      const profiles = await db.listDocuments(DB_ID, COLLECTIONS.translatorProfiles, [Query.equal("userId", userId), Query.limit(1)]);
      const companyProfiles = await db.listDocuments(DB_ID, COLLECTIONS.companyProfiles, [Query.equal("userId", userId), Query.limit(1)]);
      for (const doc of [...profiles.documents, ...companyProfiles.documents]) {
        await db.updateDocument(DB_ID, doc.$collection, doc.$id, { status: "suspended" });
      }
      setUsers((prev) => prev.map((u) => (u.$id === userId ? { ...u, status: false } : u)));
      toast({ title: "User suspended" });
    } catch {
      toast({ title: "Failed to suspend user", variant: "destructive" });
    }
    setSuspendTarget(null);
  }

  async function handleActivate(userId: string) {
    try {
      const db = getDatabases();
      const profiles = await db.listDocuments(DB_ID, COLLECTIONS.translatorProfiles, [Query.equal("userId", userId), Query.limit(1)]);
      const companyProfiles = await db.listDocuments(DB_ID, COLLECTIONS.companyProfiles, [Query.equal("userId", userId), Query.limit(1)]);
      for (const doc of [...profiles.documents, ...companyProfiles.documents]) {
        await db.updateDocument(DB_ID, doc.$collection, doc.$id, { status: "active" });
      }
      setUsers((prev) => prev.map((u) => (u.$id === userId ? { ...u, status: true } : u)));
      toast({ title: "User activated" });
    } catch {
      toast({ title: "Failed to activate user", variant: "destructive" });
    }
  }

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-muted-foreground">Manage platform users</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 w-64"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            All Users ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No users found.</p>
          ) : (
            <ScrollArea className="h-[60vh]">
              <div className="space-y-2">
                {filtered.map((u) => (
                  <div key={u.$id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Users className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{u.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={u.status ? "default" : "destructive"}>
                        {u.status ? "Active" : "Suspended"}
                      </Badge>
                      <Badge variant="outline">
                        {(u.prefs?.role as string) || "user"}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(`/profile?userId=${u.$id}`)}>
                            <Users className="h-4 w-4 mr-2" /> View Profile
                          </DropdownMenuItem>
                          {u.status ? (
                            <DropdownMenuItem onClick={() => setSuspendTarget(u.$id)}>
                              <Ban className="h-4 w-4 mr-2" /> Suspend
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleActivate(u.$id)}>
                              <CheckCircle className="h-4 w-4 mr-2" /> Activate
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!suspendTarget} onOpenChange={() => setSuspendTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend User</DialogTitle>
            <DialogDescription>
              This will suspend the user account. They will not be able to access the platform.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSuspendTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => suspendTarget && handleSuspend(suspendTarget)}>
              Suspend
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
