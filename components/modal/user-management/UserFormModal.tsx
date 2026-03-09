"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import TextInput from "@/components/ui/TextInput";
import DropSelect from "@/components/ui/DropSelect";
import { toast } from "sonner";
import { department } from "@/lib/types";

export type UserRecord = {
  id: string;
  name: string;
  email: string;
  emailVerified?: boolean;
  image?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  role?: string | null;
  banned?: boolean;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  position?: string | null;
  department?: string | null;
  employeeId?: string | null;
};

type FormData = {
  name: string;
  email: string;
  password: string;
  role: string;
  firstName: string;
  lastName: string;
  phone: string;
  position: string;
  department: string;
  employeeId: string;
};

const EMPTY_FORM: FormData = {
  name: "",
  email: "",
  password: "",
  role: "user",
  firstName: "",
  lastName: "",
  phone: "",
  position: "",
  department: "",
  employeeId: "",
};

const ROLE_OPTIONS = [
  { value: "user", label: "User" },
  { value: "admin", label: "Admin" },
];

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
      {children}
    </Label>
  );
}

export default function UserFormModal({
  isOpen,
  onClose,
  onSuccess,
  user,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user?: UserRecord | null;
}) {
  const isEdit = !!user;
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name: (user.firstName ?? "") + " " + (user.lastName ?? ""),
        email: user.email ?? "",
        password: "",
        role: (user.role as string) ?? "user",
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        phone: user.phone ?? "",
        position: user.position ?? "",
        department: user.department ?? "",
        employeeId: user.employeeId ?? "",
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [user, isOpen]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof FormData, value: string) =>
    setForm((prev) => ({ ...prev, [name]: value }));

  const handleSubmit = async () => {
    if (!form.email.trim()) {
      toast.error("Email is required.");
      return;
    }
    if (!isEdit && !form.password.trim()) {
      toast.error("Password is required for new users.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { authClient } = await import("@/lib/auth-client");

      if (isEdit) {
        const { error } = await authClient.admin.updateUser({
          userId: user!.id,
          data: {
            name:
              (form.firstName.trim() ?? "") +
              " " +
              (form.lastName.trim() ?? ""),
            role: form.role as "admin" | "user",
            firstName: form.firstName.trim() || undefined,
            lastName: form.lastName.trim() || undefined,
            phone: form.phone.trim() || undefined,
            position: form.position.trim() || undefined,
            department: form.department.trim() || undefined,
            employeeId: form.employeeId.trim() || undefined,
          },
        });
        if (error) {
          toast.error(error.message ?? "Failed to update user.");
          return;
        }
        toast.success("User updated successfully!");
      } else {
        const { error } = await authClient.admin.createUser({
          email: form.email.trim(),
          password: form.password,
          name:
            (form.firstName.trim() ?? "") + " " + (form.lastName.trim() ?? ""),
          role: form.role as "admin" | "user",
          data: {
            firstName: form.firstName.trim() || undefined,
            lastName: form.lastName.trim() || undefined,
            phone: form.phone.trim() || undefined,
            position: form.position.trim() || undefined,
            department: form.department.trim() || undefined,
            employeeId: form.employeeId.trim() || undefined,
          },
        });
        if (error) {
          toast.error(error.message ?? "Failed to create user.");
          return;
        }
        toast.success("User created successfully!");
      }
      onSuccess();
      onClose();
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-w-xl max-h-[90vh] flex flex-col"
        showCloseButton={false}
      >
        <DialogHeader className="shrink-0">
          <DialogTitle>{isEdit ? "Edit User" : "Add User"}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-2 pr-0.5 scrollbar-hide flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <FieldLabel>First Name</FieldLabel>
              <TextInput
                name="firstName"
                type="text"
                placeholder="First name"
                value={form.firstName}
                onChange={handleInputChange}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Last Name</FieldLabel>
              <TextInput
                name="lastName"
                type="text"
                placeholder="Last name"
                value={form.lastName}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className=" items-center gap-4">
            <div className="flex flex-col gap-1.5">
              <FieldLabel>
                Email <span className="text-red-500">*</span>
              </FieldLabel>
              <input
                name="email"
                type="email"
                placeholder="user@example.com"
                value={form.email}
                onChange={handleInputChange}
                disabled={isEdit}
                className="h-10 w-full rounded-md border border-border bg-transparent px-3 text-sm outline-none focus-visible:border-ring disabled:opacity-70 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {!isEdit && (
            <div className="flex flex-col gap-1.5">
              <FieldLabel>
                Password <span className="text-red-500">*</span>
              </FieldLabel>
              <TextInput
                name="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleInputChange}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Role</FieldLabel>
              <DropSelect
                selectName="role"
                selectId="role"
                value={form.role}
                onChange={(e) => handleSelectChange("role", e.target.value)}
              >
                {ROLE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </DropSelect>
            </div>

            <div className="flex flex-col gap-1.5">
              <FieldLabel>Position</FieldLabel>
              <TextInput
                name="position"
                type="text"
                placeholder="Job title"
                value={form.position}
                onChange={handleInputChange}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Phone</FieldLabel>
              <TextInput
                name="phone"
                type="tel"
                placeholder="Phone number"
                value={form.phone}
                onChange={handleInputChange}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Employee ID</FieldLabel>
              <TextInput
                name="employeeId"
                type="text"
                placeholder="Employee ID"
                value={form.employeeId}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <FieldLabel>Department</FieldLabel>
            <DropSelect
              selectName="department"
              selectId="department"
              value={form.department}
              onChange={(e) => handleSelectChange("department", e.target.value)}
            >
              <option value="" disabled>
                Select Department
              </option>
              {Object.keys(department).map((d) => (
                <option key={d} value={d}>
                  {department[d as keyof typeof department]}
                </option>
              ))}
            </DropSelect>
          </div>
        </div>

        <DialogFooter className="shrink-0 pt-3 border-t">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting
              ? isEdit
                ? "Saving..."
                : "Adding..."
              : isEdit
                ? "Save Changes"
                : "Add User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
