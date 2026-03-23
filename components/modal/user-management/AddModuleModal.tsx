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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Link } from "lucide-react";

const ICON_OPTIONS = [
  { value: "ChartLine", label: "Chart Line" },
  { value: "Laptop", label: "Laptop" },
  { value: "Users", label: "Users" },
  { value: "HelpCircle", label: "Help Circle" },
  { value: "BarChart3", label: "Bar Chart" },
  { value: "Settings", label: "Settings" },
  { value: "FileText", label: "File Text" },
  { value: "Folder", label: "Folder" },
] as const;

function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_-]/g, "");
}

export type NewModulePayload = {
  configKey: string;
  name: string;
  shortName: string;
  href: string;
  description: string;
  icon: string;
};

type AddModuleModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (module: NewModulePayload) => void;
  existingIds: string[];
};

export default function AddModuleModal({
  isOpen,
  onClose,
  onSave,
  existingIds,
}: AddModuleModalProps) {
  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [configKeyOverride, setConfigKeyOverride] = useState("");
  const [href, setHref] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState<string>("ChartLine");

  useEffect(() => {
    if (isOpen) {
      setName("");
      setShortName("");
      setConfigKeyOverride("");
      setHref("");
      setDescription("");
      setIcon("ChartLine");
    }
  }, [isOpen]);

  const autoConfigKey = slugify(shortName || name) || "";
  const configKey = configKeyOverride.trim() || autoConfigKey;
  const isDuplicate = configKey && existingIds.includes(configKey);
  const canSubmit =
    name.trim().length > 0 &&
    shortName.trim().length > 0 &&
    configKey.length > 0 &&
    href.trim().length > 0 &&
    !isDuplicate;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    onSave({
      configKey,
      name: name.trim(),
      shortName: shortName.trim().toUpperCase(),
      href: `/home/${href.trim()}`,
      description: description.trim(),
      icon,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add module</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Name <span className="text-red-500">*</span>
            </Label>
            <TextInput
              name="module-name"
              type="text"
              placeholder="e.g. Digital Sales Lead Tracker"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Short name <span className="text-red-500">*</span>
            </Label>
            <TextInput
              name="module-shortName"
              type="text"
              placeholder="e.g. CRM"
              value={shortName}
              onChange={(e) => setShortName(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Config key <span className="text-muted-foreground font-normal">(ID)</span>
            </Label>
            <TextInput
              name="module-configKey"
              type="text"
              placeholder={autoConfigKey || "e.g. crm"}
              value={configKeyOverride}
              onChange={(e) => setConfigKeyOverride(e.target.value)}
            />
            {configKey && (
              <p className="text-xs text-muted-foreground">
                Saved as: <code className="bg-muted px-1 rounded">{configKey}</code>
                {isDuplicate && (
                  <span className="text-destructive ml-1">— already exists</span>
                )}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Route (href) <span className="text-red-500">*</span>
            </Label>
            <InputGroup>
              <InputGroupAddon>
                <span>/home/</span>
              </InputGroupAddon>
              <InputGroupInput
                name="module-href"
                type="text"
                placeholder={autoConfigKey || "crm"}
                value={href}
                onChange={(e) => setHref(e.target.value)}
              />
            </InputGroup>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Description
            </Label>
            <TextInput
              name="module-description"
              type="text"
              placeholder="e.g. View and manage leads"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Icon
            </Label>
            <Select value={icon} onValueChange={setIcon}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select icon" />
              </SelectTrigger>
              <SelectContent>
                {ICON_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              Add module
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
