"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { UserAvatar } from "@/components/auth/UserAvatar";
import { useAuth } from "@/components/auth/AuthProvider";
import type { AuthError } from "@/lib/auth";

const ALLOWED_AVATAR_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

export function ProfileForm() {
  const { user, updateUser, uploadUserAvatar } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(user?.name ?? "");
  const [organizationName, setOrganizationName] = useState(
    user?.organizationName ?? "",
  );
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  if (!user) return null;

  const showOrganization = user.customerKind === "organization";

  function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!ALLOWED_AVATAR_TYPES.has(file.type)) {
      setErrors((current) => ({
        ...current,
        avatar: "Use a JPEG, PNG, or WebP image.",
      }));
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setErrors((current) => ({
        ...current,
        avatar: "Image must be 2MB or smaller.",
      }));
      return;
    }

    setErrors((current) => {
      const { avatar: _avatar, ...rest } = current;
      return rest;
    });
    setSubmitError(null);
    setSuccess(null);
    setPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return URL.createObjectURL(file);
    });
    setPendingFile(file);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!name.trim()) nextErrors.name = "Full name is required.";
    if (newPassword && newPassword.length < 8) {
      nextErrors.newPassword = "Password must be at least 8 characters.";
    }
    if (newPassword && !currentPassword) {
      nextErrors.currentPassword = "Enter your current password.";
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setSuccess(null);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setErrors({});
    setSuccess(null);

    try {
      if (pendingFile) {
        await uploadUserAvatar(pendingFile);
        setPendingFile(null);
        setPreviewUrl((current) => {
          if (current) URL.revokeObjectURL(current);
          return null;
        });
      }
      await updateUser({
        name: name.trim(),
        organizationName: showOrganization
          ? organizationName.trim()
          : undefined,
        currentPassword: newPassword ? currentPassword : undefined,
        newPassword: newPassword || undefined,
      });
      setCurrentPassword("");
      setNewPassword("");
      setSuccess("Profile saved.");
    } catch (error) {
      const apiError = error as AuthError;
      if (apiError.fields) setErrors(apiError.fields);
      setSubmitError(apiError.error ?? "Unable to save your profile.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="max-w-xl space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <UserAvatar
          name={name || user.name}
          avatarUrl={user.avatarUrl}
          previewUrl={previewUrl}
          size="lg"
        />
        <div className="relative space-y-2">
          <p className="font-heading text-sm font-medium text-heading">
            Profile picture
          </p>
          <p className="text-xs text-muted-foreground">
            JPEG, PNG, or WebP. Maximum 2MB.
          </p>
          <input
            ref={fileInputRef}
            id="profile-avatar"
            type="file"
            accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
            className="absolute h-px w-px overflow-hidden opacity-0"
            tabIndex={-1}
            onChange={handleAvatarChange}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            aria-label="Choose profile photo"
            onClick={() => fileInputRef.current?.click()}
          >
            Choose photo
          </Button>
          {errors.avatar ? (
            <p className="text-xs text-error" role="alert">
              {errors.avatar}
            </p>
          ) : null}
        </div>
      </div>
      <Input
        label="Full name"
        name="name"
        autoComplete="name"
        required
        value={name}
        onChange={(event) => setName(event.target.value)}
        error={errors.name}
      />
      <Input
        label="Email"
        name="email"
        value={user.email}
        disabled
        hint="Email cannot be changed."
      />
      {showOrganization ? (
        <Input
          label="Organisation name"
          name="organizationName"
          autoComplete="organization"
          value={organizationName}
          onChange={(event) => setOrganizationName(event.target.value)}
          error={errors.organizationName}
        />
      ) : null}
      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          label="Current password"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          error={errors.currentPassword}
        />
        <Input
          label="New password"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          error={errors.newPassword}
          hint="Leave blank to keep your current password."
        />
      </div>
      {submitError ? (
        <p
          className="rounded-lg border border-error/20 bg-error/5 px-4 py-3 text-sm text-error"
          role="alert"
        >
          {submitError}
        </p>
      ) : null}
      {success ? (
        <p className="rounded-lg border border-brand-navy/15 bg-brand-navy/5 px-4 py-3 text-sm text-heading">
          {success}
        </p>
      ) : null}
      <Button type="submit" variant="accent" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Save profile"}
      </Button>
    </form>
  );
}
