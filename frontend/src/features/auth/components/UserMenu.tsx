"use client";

import { Loader } from "@/components/Loader";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { useAuth } from "../hooks/use-auth";
import { useUser } from "../hooks/use-user";

export function UserMenu() {
  const { isAuthenticated, signOut } = useAuth();
  const { user, isLoading } = useUser();
  const { email, displayName } = user;

  if (isLoading) {
    return <Loader />;
  }

  if (!isAuthenticated || !user) {
    return (
      <Button asChild>
        <Link href="/signin">Sign in</Link>
      </Button>
    );
  }

  const nameFallback = displayName || email || "Account";

  const getInitials = (name: string) => {
    const parts = name.split(/[\s._-]+/).filter(Boolean);
    return parts
      .slice(0, 2)
      .map((p: string) => p[0]?.toUpperCase())
      .join("");
  };

  const initials = getInitials(nameFallback);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          title={nameFallback}
          aria-label="User menu"
          size="icon"
        >
          <Avatar className="size-6">
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex items-center gap-2 font-normal truncate text-xs">
          <UserIcon className="size-4" />
          {nameFallback}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => signOut()}
          className="text-destructive focus:text-destructive"
        >
          <LogOut className="size-4 mr-2" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
