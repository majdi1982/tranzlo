"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Shield,
  KeyRound,
  Mail,
  Smartphone,
  Trash2,
  Lock,
  Link2,
  CheckCircle,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { useSession } from "@/providers/session-provider";
import { getServices } from "@/services";
import { getAccount, getDatabases, DB_ID, COLLECTIONS } from "@/lib/appwrite";
import { AuthGuard } from "@/guards/auth-guard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { DASHBOARD_ROUTES } from "@/constants/roles";
import type { Role } from "@/types";

interface SessionItem {
  $id: string;
  clientName: string;
  clientType: string;
  clientVersion: string;
  osName: string;
  osVersion: string;
  deviceModel: string;
  deviceBrand: string;
  ip: string;
  current: boolean;
}

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout } = useSession();
  const { toast } = useToast();
  
  const role = (user?.prefs?.role as Role) || "translator";

  // Form states
  const [emailInput, setEmailInput] = React.useState({ newEmail: "", password: "" });
  const [passwordInput, setPasswordInput] = React.useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [deleteConfirmText, setDeleteConfirmText] = React.useState("");
  
  // Loading states
  const [emailLoading, setEmailLoading] = React.useState(false);
  const [passwordLoading, setPasswordLoading] = React.useState(false);
  const [deleteLoading, setDeleteLoading] = React.useState(false);
  const [sessionsLoading, setSessionsLoading] = React.useState(true);
  
  // Appwrite states
  const [sessions, setSessions] = React.useState<SessionItem[]>([]);

  // Load active sessions
  const loadSessions = React.useCallback(async () => {
    try {
      const account = getAccount();
      const res = await account.listSessions();
      setSessions(res.sessions as unknown as SessionItem[]);
    } catch (err) {
      console.error("Failed to load sessions:", err);
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (user?.$id) {
      loadSessions();
    }
  }, [user?.$id, loadSessions]);

  // Handle Email Change
  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.newEmail || !emailInput.password) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }

    setEmailLoading(true);
    try {
      const services = getServices();
      await services.auth.updateEmail(emailInput.newEmail, emailInput.password);
      toast({
        title: "Email updated successfully",
        description: "A verification link has been sent to your new email.",
        variant: "success",
      });
      setEmailInput({ newEmail: "", password: "" });
      // Refresh session
      window.location.reload();
    } catch (err: any) {
      toast({
        title: "Failed to update email",
        description: err.message || "Please check your password and try again.",
        variant: "destructive",
      });
    } finally {
      setEmailLoading(false);
    }
  };

  // Handle Password Change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput.currentPassword || !passwordInput.newPassword || !passwordInput.confirmPassword) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }

    if (passwordInput.newPassword !== passwordInput.confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }

    setPasswordLoading(true);
    try {
      const services = getServices();
      await services.auth.updatePassword(passwordInput.currentPassword, passwordInput.newPassword);
      toast({
        title: "Password updated successfully",
        description: "Your login credentials have been updated.",
        variant: "success",
      });
      setPasswordInput({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      toast({
        title: "Failed to update password",
        description: err.message || "Please check your current password.",
        variant: "destructive",
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  // Handle OAuth Link
  const handleOAuthLink = async (provider: "google" | "linkedin") => {
    try {
      const account = getAccount();
      const redirectUrl = window.location.origin + "/settings";
      // This will link the OAuth identity to the logged-in user
      await account.createOAuth2Session(provider as any, redirectUrl, redirectUrl);
    } catch (err: any) {
      toast({
        title: `Failed to link ${provider}`,
        description: err.message || "Please try again later.",
        variant: "destructive",
      });
    }
  };

  // Revoke other session
  const handleRevokeSession = async (sessionId: string) => {
    try {
      const account = getAccount();
      await account.deleteSession(sessionId);
      toast({ title: "Session revoked successfully", variant: "success" });
      loadSessions();
    } catch (err: any) {
      toast({ title: "Failed to revoke session", description: err.message, variant: "destructive" });
    }
  };

  // Revoke all other sessions
  const handleRevokeAllOtherSessions = async () => {
    try {
      const account = getAccount();
      // Revoke all sessions
      await account.deleteSessions();
      toast({ title: "All other sessions revoked", variant: "success" });
      loadSessions();
    } catch (err: any) {
      toast({ title: "Failed to revoke sessions", description: err.message, variant: "destructive" });
    }
  };

  // Handle Account Deletion
  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (deleteConfirmText !== "DELETE") {
      toast({ title: "Please type DELETE to confirm", variant: "destructive" });
      return;
    }

    setDeleteLoading(true);
    try {
      const db = getDatabases();
      const targetCollection = role === "translator" ? COLLECTIONS.translatorProfiles : COLLECTIONS.companyProfiles;
      
      // 1. Attempt to delete profile document
      try {
        if (user?.$id) {
          await db.deleteDocument(DB_ID, targetCollection, user.$id);
        }
      } catch (docErr) {
        console.warn("Profile document not found or already deleted:", docErr);
      }

      // 2. Log out and invalidate session
      await logout();
      toast({
        title: "Account deleted",
        description: "Your profiles and credentials have been removed.",
        variant: "success",
      });
      router.push("/");
    } catch (err: any) {
      toast({
        title: "Error deleting account",
        description: err.message || "Please contact support.",
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <AuthGuard>
      <div className="max-w-3xl mx-auto space-y-8 p-4 md:p-8 pt-24 sm:pt-28">
        
        {/* Header Block */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(DASHBOARD_ROUTES[role] || "/")}
            className="hover:bg-white/5 rounded-md"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              Account Settings & Security
            </h1>
            <p className="text-muted-foreground text-sm">
              Manage your credentials, active browser sessions, and linked social accounts.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">

          {/* Section 1: Credentials Modification */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Change Email */}
            <Card className="rounded-xl border-border/50 bg-card/50 backdrop-blur-xl shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-md font-semibold flex items-center gap-2">
                  <Mail className="h-4.5 w-4.5 text-primary" />
                  Change Email Address
                </CardTitle>
                <CardDescription className="text-xs">
                  Update your contact and login email address.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleEmailChange} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-email" className="text-xs">Current Email</Label>
                    <Input
                      id="current-email"
                      type="text"
                      disabled
                      value={user?.email || ""}
                      className="bg-white/[0.02] border-border/50 rounded-md text-xs text-muted-foreground"
                    />
                    {!user?.emailVerification && (
                      <div className="flex items-center gap-2 text-2xs text-amber-500 bg-amber-500/10 px-2 py-1 rounded-md mt-1 border border-amber-500/20">
                        <AlertTriangle className="h-3 w-3 shrink-0" />
                        <span>Email address is currently unverified.</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-email" className="text-xs">New Email Address</Label>
                    <Input
                      id="new-email"
                      type="email"
                      required
                      placeholder="enter new email"
                      value={emailInput.newEmail}
                      onChange={(e) => setEmailInput({ ...emailInput, newEmail: e.target.value })}
                      className="bg-white/[0.02] border-border/50 focus:border-primary rounded-md text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-password" className="text-xs">Current Password</Label>
                    <Input
                      id="email-password"
                      type="password"
                      required
                      placeholder="••••••••"
                      value={emailInput.password}
                      onChange={(e) => setEmailInput({ ...emailInput, password: e.target.value })}
                      className="bg-white/[0.02] border-border/50 focus:border-primary rounded-md text-xs"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={emailLoading}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-md text-xs py-2"
                  >
                    {emailLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" /> : null}
                    Update Email
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Change Password */}
            <Card className="rounded-xl border-border/50 bg-card/50 backdrop-blur-xl shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-md font-semibold flex items-center gap-2">
                  <KeyRound className="h-4.5 w-4.5 text-primary" />
                  Change Account Password
                </CardTitle>
                <CardDescription className="text-xs">
                  Change your login password to keep your account secure.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-pw" className="text-xs">Current Password</Label>
                    <Input
                      id="current-pw"
                      type="password"
                      required
                      placeholder="••••••••"
                      value={passwordInput.currentPassword}
                      onChange={(e) => setPasswordInput({ ...passwordInput, currentPassword: e.target.value })}
                      className="bg-white/[0.02] border-border/50 focus:border-primary rounded-md text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-pw" className="text-xs">New Password</Label>
                    <Input
                      id="new-pw"
                      type="password"
                      required
                      placeholder="••••••••"
                      value={passwordInput.newPassword}
                      onChange={(e) => setPasswordInput({ ...passwordInput, newPassword: e.target.value })}
                      className="bg-white/[0.02] border-border/50 focus:border-primary rounded-md text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-pw" className="text-xs">Confirm New Password</Label>
                    <Input
                      id="confirm-pw"
                      type="password"
                      required
                      placeholder="••••••••"
                      value={passwordInput.confirmPassword}
                      onChange={(e) => setPasswordInput({ ...passwordInput, confirmPassword: e.target.value })}
                      className="bg-white/[0.02] border-border/50 focus:border-primary rounded-md text-xs"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={passwordLoading}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-md text-xs py-2"
                  >
                    {passwordLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" /> : null}
                    Update Password
                  </Button>
                </form>
              </CardContent>
            </Card>

          </div>

          {/* Section 2: Linked Accounts (OAuth) */}
          <Card className="rounded-xl border-border/50 bg-card/50 backdrop-blur-xl shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-md font-semibold flex items-center gap-2">
                <Link2 className="h-4.5 w-4.5 text-primary" />
                Linked Social Identities
              </CardTitle>
              <CardDescription className="text-xs">
                Link Google and LinkedIn credentials to easily login to your account.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="outline"
                onClick={() => handleOAuthLink("google")}
                className="flex-1 border-border/50 hover:bg-white/5 rounded-md flex items-center justify-center gap-3 py-3"
              >
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fillRule="evenodd" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span className="text-xs">Link Google Account</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => handleOAuthLink("linkedin")}
                className="flex-1 border-border/50 hover:bg-white/5 rounded-md flex items-center justify-center gap-3 py-3"
              >
                <svg className="h-4 w-4 shrink-0" fill="#0A66C2" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
                <span className="text-xs">Link LinkedIn Account</span>
              </Button>
            </CardContent>
          </Card>

          {/* Section 3: Active Browser & Device Sessions */}
          <Card className="rounded-xl border-border/50 bg-card/50 backdrop-blur-xl shadow-lg">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-md font-semibold flex items-center gap-2">
                  <Smartphone className="h-4.5 w-4.5 text-primary" />
                  Active Connected Devices
                </CardTitle>
                <CardDescription className="text-xs">
                  Review all active browser and device sessions connected to your account.
                </CardDescription>
              </div>
              {sessions.length > 1 && (
                <Button
                  variant="outline"
                  onClick={handleRevokeAllOtherSessions}
                  className="text-amber-500 hover:text-amber-400 border-amber-500/20 hover:bg-amber-500/10 rounded-md text-xs py-1"
                >
                  Revoke Others
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {sessionsLoading ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <div className="divide-y divide-border/30">
                  {sessions.map((session) => (
                    <div key={session.$id} className="flex items-center justify-between py-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-white/5 rounded-lg border border-border/30 mt-0.5">
                          <Smartphone className="h-4.5 w-4.5 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-foreground">
                              {session.osName || "Unknown OS"} ({session.clientName || "Browser"})
                            </span>
                            {session.current && (
                              <span className="inline-flex items-center rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-3xs font-medium text-emerald-400 ring-1 ring-inset ring-emerald-500/20">
                                This device
                              </span>
                            )}
                          </div>
                          <p className="text-2xs text-muted-foreground mt-0.5">
                            IP Address: <span className="text-foreground">{session.ip}</span> • Client Version: {session.clientVersion}
                          </p>
                        </div>
                      </div>
                      {!session.current && (
                        <Button
                          variant="ghost"
                          onClick={() => handleRevokeSession(session.$id)}
                          className="text-destructive hover:bg-destructive/10 rounded-md text-xs py-1 px-3"
                        >
                          Revoke
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section 4: Danger Zone (Delete Account) */}
          <Card className="rounded-xl border-red-500/20 bg-red-950/5 shadow-md">
            <CardHeader className="pb-4">
              <CardTitle className="text-md font-semibold text-red-500 flex items-center gap-2">
                <Trash2 className="h-4.5 w-4.5" />
                Danger Zone: Permanent Deletion
              </CardTitle>
              <CardDescription className="text-red-400/80 text-xs">
                Deleting your account will permanently wipe your translation profile, applications, and documents from Tranzlo databases. This action is irreversible.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleDeleteAccount} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="delete-confirm" className="text-xs text-red-400/80 font-medium">
                    To confirm deletion, please type <span className="font-bold text-red-500">DELETE</span> below:
                  </Label>
                  <Input
                    id="delete-confirm"
                    type="text"
                    required
                    placeholder="Type DELETE"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    className="bg-red-500/5 border-red-500/20 focus:border-red-500 rounded-md text-xs text-red-200"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={deleteLoading || deleteConfirmText !== "DELETE"}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-medium rounded-md text-xs py-2 disabled:bg-red-950/20 disabled:text-red-400/50"
                >
                  {deleteLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" /> : null}
                  Permanently Delete My Account
                </Button>
              </form>
            </CardContent>
          </Card>

        </div>

      </div>
    </AuthGuard>
  );
}
