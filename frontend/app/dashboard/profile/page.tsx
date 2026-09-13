"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageLoader } from "@/components/ui/LogoLoader";
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
    return <PageLoader label="Loading profile…" />;
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
