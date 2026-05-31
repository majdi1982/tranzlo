"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, LayoutDashboard, LogOut, User, ChevronDown, Sun, Moon, Monitor, MessageSquare, Bell, Settings } from "lucide-react";
import { useTheme } from "next-themes";
import { useSession } from "@/providers/session-provider";
import { DASHBOARD_ROUTES } from "@/constants/roles";
import type { Role } from "@/types";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import { getServices } from "@/services";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/jobs", label: "Browse Jobs" },
  { href: "/#how-it-works", label: "How it Works" },
  { href: "/#features", label: "Features" },
];

export function Navbar() {
  const { user, loading, logout } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  
  // Header Counts
  const [unreadNotifs, setUnreadNotifs] = React.useState(0);
  const [unreadSenders, setUnreadSenders] = React.useState(0);
  
  // Lists for Dropdowns
  const [recentNotifs, setRecentNotifs] = React.useState<any[]>([]);
  const [recentChats, setRecentChats] = React.useState<any[]>([]);
  const [avatarUrl, setAvatarUrl] = React.useState<string>("");

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    async function loadAvatar() {
      if (!user?.$id) return;
      try {
        const services = getServices();
        const role = (user?.prefs?.role as Role) || "translator";
        if (role === "translator") {
          const profile = await services.profile.getTranslatorProfile(user.$id);
          if (profile?.avatarUrl) setAvatarUrl(profile.avatarUrl);
        } else if (role === "company") {
          const profile = await services.profile.getCompanyProfile(user.$id);
          if (profile?.logoUrl) setAvatarUrl(profile.logoUrl);
        }
      } catch {
        // ignore
      }
    }
    loadAvatar();
  }, [user?.$id, user?.prefs?.role]);

  React.useEffect(() => {
    if (!user?.$id) return;
    const services = getServices();
    
    const loadCounts = async () => {
      try {
        const [notifCount, conversations] = await Promise.all([
          services.notification.getUnreadCount(user.$id),
          services.message.getConversations(user.$id)
        ]);
        setUnreadNotifs(notifCount);
        
        // Fetch recent notifications
        const notifList = await services.notification.getNotifications(user.$id);
        setRecentNotifs(notifList.slice(0, 4));

        // Fetch recent conversations
        setRecentChats(conversations.slice(0, 4));
        
        const convMessagesPromises = conversations.map(c => services.message.getMessages(c.$id));
        const allConvMessages = await Promise.all(convMessagesPromises);
        
        let unreadSendersCount = 0;
        allConvMessages.forEach(msgs => {
          const hasUnread = msgs.some(m => !m.read && m.senderId !== user.$id);
          if (hasUnread) unreadSendersCount++;
        });
        
        setUnreadSenders(unreadSendersCount);
      } catch (err) {
        console.error("Error loading navbar counts:", err);
      }
    };
    
    loadCounts();
    const interval = setInterval(loadCounts, 10000);
    return () => clearInterval(interval);
  }, [user?.$id]);

  // Click actions for Dropdown Items
  const handleNotificationClick = async (notif: any) => {
    try {
      const services = getServices();
      await services.notification.markAsRead(notif.$id);
      setUnreadNotifs(prev => Math.max(0, prev - 1));
      
      let targetUrl = "/notifications";
      if (notif.data) {
        try {
          const parsed = JSON.parse(notif.data);
          if (parsed.jobId) targetUrl = `/jobs/${parsed.jobId}`;
          else if (parsed.url) targetUrl = parsed.url;
        } catch {
          // ignore
        }
      }
      router.push(targetUrl);
    } catch (err) {
      console.error(err);
      router.push("/notifications");
    }
  };

  const handleConversationClick = async (conv: any) => {
    try {
      if (user?.$id) {
        const services = getServices();
        await services.message.markAsRead(conv.$id, user.$id);
      }
      router.push(`/messages?conversationId=${conv.$id}`);
    } catch (err) {
      console.error(err);
      router.push("/messages");
    }
  };

  const isDashboardRoute =
    pathname.startsWith("/dashboard") ||
    ["/messages", "/notifications", "/profile", "/settings"].includes(pathname);

  const renderThemeSwitcher = () => {
    if (!mounted) {
      return <div className="h-8 w-8 rounded-xl bg-accent/20 animate-pulse" />;
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors">
            {theme === "light" && <Sun className="h-4 w-4" />}
            {theme === "dark" && <Moon className="h-4 w-4" />}
            {theme === "system" && <Monitor className="h-4 w-4" />}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-36 mt-1 rounded-lg">
          <DropdownMenuItem onClick={() => setTheme("light")} className="flex items-center gap-2 cursor-pointer rounded-md">
            <Sun className="h-4 w-4" />
            <span>Light</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("dark")} className="flex items-center gap-2 cursor-pointer rounded-md">
            <Moon className="h-4 w-4" />
            <span>Dark</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("system")} className="flex items-center gap-2 cursor-pointer rounded-md">
            <Monitor className="h-4 w-4" />
            <span>System</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const userRole = (user?.prefs?.role as Role) || "translator";
  const dashboardHref = DASHBOARD_ROUTES[userRole] || "/";

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 w-full border-b transition-all duration-300 border-border/50",
        scrolled
          ? "glass shadow-sm bg-background/95"
          : "bg-background/80 backdrop-blur-md"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Logo size={32} />

        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-all duration-200",
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          {renderThemeSwitcher()}
          {loading ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
          ) : user ? (
            <>
              {/* Message Icon Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/50 relative transition-colors">
                    <MessageSquare className="h-4.5 w-4.5" />
                    {unreadSenders > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-primary px-1 text-2xs font-bold text-primary-foreground leading-none animate-pulse-glow">
                        {unreadSenders}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 mt-1 rounded-lg p-2 space-y-1 bg-background/95 backdrop-blur-xl border border-border/50 shadow-2xl">
                  <DropdownMenuLabel className="text-xs font-semibold px-2 py-1 flex items-center justify-between">
                    <span>Recent Chats</span>
                    {unreadSenders > 0 && (
                      <span className="text-3xs font-medium bg-primary/10 text-primary px-1.5 py-0.5 rounded-md">
                        {unreadSenders} New Senders
                      </span>
                    )}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-border/50" />
                  {recentChats.length === 0 ? (
                    <div className="text-center py-6 text-xs text-muted-foreground">
                      No recent messages
                    </div>
                  ) : (
                    recentChats.map((chat) => {
                      const otherParticipant = chat.participants?.find((p: string) => p !== user?.$id) || "Client User";
                      return (
                        <DropdownMenuItem
                          key={chat.$id}
                          onClick={() => handleConversationClick(chat)}
                          className="flex flex-col items-start gap-1 p-2.5 rounded-md cursor-pointer hover:bg-white/[0.04] transition-all duration-200"
                        >
                          <div className="flex items-center gap-2.5 w-full">
                            <Avatar className="h-6 w-6 ring-1 ring-border shrink-0">
                              <AvatarFallback className="bg-primary/20 text-primary text-3xs font-bold">
                                {otherParticipant.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs font-semibold text-foreground truncate flex-1">
                              {otherParticipant}
                            </span>
                            <span className="text-3xs text-muted-foreground shrink-0">
                              {chat.lastMessageAt ? new Date(chat.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                            </span>
                          </div>
                          <p className="text-2xs text-muted-foreground truncate pl-8.5 w-full">{chat.lastMessagePreview || "Open conversation..."}</p>
                        </DropdownMenuItem>
                      );
                    })
                  )}
                  <DropdownMenuSeparator className="bg-border/50" />
                  <DropdownMenuItem asChild className="rounded-md cursor-pointer justify-center text-center text-xs font-medium text-primary hover:bg-primary/5 py-1">
                    <Link href="/messages" className="w-full text-center">View all messages</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Notification Bell Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/50 relative transition-colors">
                    <Bell className="h-4.5 w-4.5" />
                    {unreadNotifs > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-primary px-1 text-2xs font-bold text-primary-foreground leading-none animate-pulse-glow">
                        {unreadNotifs}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 mt-1 rounded-lg p-2 space-y-1 bg-background/95 backdrop-blur-xl border border-border/50 shadow-2xl">
                  <DropdownMenuLabel className="text-xs font-semibold px-2 py-1 flex items-center justify-between">
                    <span>Notifications</span>
                    {unreadNotifs > 0 && (
                      <span className="text-3xs font-medium bg-primary/10 text-primary px-1.5 py-0.5 rounded-md animate-pulse">
                        {unreadNotifs} New
                      </span>
                    )}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-border/50" />
                  {recentNotifs.length === 0 ? (
                    <div className="text-center py-6 text-xs text-muted-foreground">
                      No notifications yet
                    </div>
                  ) : (
                    recentNotifs.map((notif) => (
                      <DropdownMenuItem
                        key={notif.$id}
                        onClick={() => handleNotificationClick(notif)}
                        className={cn(
                          "flex flex-col items-start gap-1 p-2.5 rounded-md cursor-pointer transition-all duration-200 border border-transparent",
                          !notif.read ? "bg-primary/5 hover:bg-primary/10 border-primary/10" : "hover:bg-white/[0.04]"
                        )}
                      >
                        <div className="flex items-center gap-1.5 w-full">
                          <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", !notif.read ? "bg-primary" : "bg-transparent")} />
                          <span className="text-xs font-semibold text-foreground truncate flex-1">{notif.title}</span>
                          <span className="text-3xs text-muted-foreground shrink-0">
                            {new Date(notif.createdAt || notif.$createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-2xs text-muted-foreground line-clamp-2 pl-3">{notif.body}</p>
                      </DropdownMenuItem>
                    ))
                  )}
                  <DropdownMenuSeparator className="bg-border/50" />
                  <DropdownMenuItem asChild className="rounded-md cursor-pointer justify-center text-center text-xs font-medium text-primary hover:bg-primary/5 py-1">
                    <Link href="/notifications" className="w-full text-center">View all notifications</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 group ml-1">
                    <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-transparent group-hover:ring-primary/50 transition-all overflow-hidden rounded-full">
                      {avatarUrl ? (
                        <AvatarImage src={avatarUrl} alt={user.name || "User Avatar"} className="object-cover h-full w-full" />
                      ) : (
                        <AvatarFallback className="bg-primary/20 text-primary text-xs">
                          {initials}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <ChevronDown className="h-3 w-3 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-1 rounded-lg">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="truncate font-semibold">{user.name}</span>
                      <span className="text-xs font-normal text-muted-foreground truncate">
                        {user.email}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="rounded-md cursor-pointer">
                    <Link href={dashboardHref} className="flex items-center">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-md cursor-pointer">
                    <Link href="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Profile Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-md cursor-pointer">
                    <Link href="/settings" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      Account Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => logout()}
                    className="rounded-md cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="rounded-md">
                  Sign in
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="rounded-md shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow">
                  Get started
                </Button>
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent transition-colors"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t bg-background/95 backdrop-blur-xl animate-in">
          <nav className="flex flex-col gap-1 px-4 py-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
            <hr className="my-2 border-border/50" />
            {loading ? (
              <div className="h-10 animate-pulse rounded-lg bg-muted" />
            ) : user ? (
              <>
                <div className="px-3 py-2 text-sm">
                  <p className="font-medium truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                <Link
                  href={dashboardHref}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent flex items-center gap-2"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  Profile
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 px-3 pt-2">
                <Link href="/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" className="w-full rounded-lg">
                    Sign in
                  </Button>
                </Link>
                <Link href="/signup" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full rounded-lg">Get started</Button>
                </Link>
              </div>
            )}
            {mounted && (
              <div className="flex items-center justify-between px-3 py-2 text-sm text-muted-foreground border-t border-border/50 mt-2 pt-4">
                <span>Theme</span>
                <div className="flex gap-1 bg-accent/30 rounded-xl p-1">
                  <button
                    onClick={() => setTheme("light")}
                    className={cn(
                      "p-1.5 rounded-lg transition-colors",
                      theme === "light" ? "bg-background text-primary shadow-sm" : "hover:text-foreground"
                    )}
                  >
                    <Sun className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setTheme("dark")}
                    className={cn(
                      "p-1.5 rounded-lg transition-colors",
                      theme === "dark" ? "bg-background text-primary shadow-sm" : "hover:text-foreground"
                    )}
                  >
                    <Moon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setTheme("system")}
                    className={cn(
                      "p-1.5 rounded-lg transition-colors",
                      theme === "system" ? "bg-background text-primary shadow-sm" : "hover:text-foreground"
                    )}
                  >
                    <Monitor className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
