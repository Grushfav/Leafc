"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { ProfileForm } from "@/components/auth/ProfileForm";
import { useAuth } from "@/components/auth/AuthProvider";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isReady } = useAuth();

  useEffect(() => {
    if (!isReady) return;
    if (!user) router.replace("/login");
  }, [isReady, user, router]);

  if (!isReady || !user) {
    return (
      <div className="flex flex-1 items-center justify-center p-12 text-sm text-muted-foreground">
        Loading profile…
      </div>
    );
  }

  return (
    <DashboardShell
      title="Profile"
      description="Update your photo, name, and password for this LEAF-C account."
    >
      <ProfileForm />
    </DashboardShell>
  );
}
