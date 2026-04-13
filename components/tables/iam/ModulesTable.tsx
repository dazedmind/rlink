"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/query-keys";
import { fetchModuleAccessConfig } from "@/lib/iam/iam-fetchers";
import { iamTableQueryOptions } from "@/lib/iam/iam-query-options";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Box,
  ChevronDown,
  PlusCircle,
  Save,
  Trash2,
} from "lucide-react";
import AddModuleModal, {
  type NewModulePayload,
} from "@/components/modal/iam/AddModuleModal";
import { clearModuleAccessCache } from "@/lib/module-access-cache";
import { department, userRole, deptBadgeClass, userRoleMeta } from "@/lib/types";
import type { ModuleAccessConfig, ModuleEntry } from "@/lib/iam/module-access-types";
import { useSubmitGuard } from "@/hooks/useSubmitGuard";

export type { ModuleEntry, ModuleAccessConfig };

function toggleInArray(arr: string[], value: string): string[] {
  return arr.includes(value)
    ? arr.filter((v) => v !== value)
    : [...arr, value];
}

export default function ModulesTable() {
  const queryClient = useQueryClient();
  const { guard, release } = useSubmitGuard();
  const [draft, setDraft] = useState<ModuleAccessConfig>({});
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());
  const [addModalOpen, setAddModalOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: qk.developerToolsSettings("module-access"),
    queryFn: fetchModuleAccessConfig,
    ...iamTableQueryOptions,
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: ModuleAccessConfig) => {
      const res = await fetch("/api/developer-tools/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          section: "module-access",
          value: payload,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to save");
      }
    },
    onSuccess: () => {
      clearModuleAccessCache();
      queryClient.invalidateQueries({ queryKey: qk.developerToolsSettings("module-access") });
      setDraft({});
      setRemovedIds(new Set());
      toast.success("Module access saved.");
    },
    onError: (e: Error) => {
      toast.error(e.message ?? "Failed to save.");
    },
  });

  useEffect(() => {
    if (data && Object.keys(draft).length === 0) {
      setDraft(data);
    }
  }, [data]);

  const mergedConfig = useMemo(() => {
    const base = Object.keys(data ?? {}).length > 0 ? data ?? {} : {};
    return { ...base, ...draft };
  }, [data, draft]);

  const displayedModules = useMemo(() => {
    return Object.entries(mergedConfig)
      .filter(([id]) => !removedIds.has(id))
      .map(([id, entry]) => ({
        id,
        name: (entry.name as string) ?? id,
        shortName: (entry.shortName as string) ?? id,
        description: (entry.description as string) ?? "",
        href: (entry.href as string) ?? "",
        icon: (entry.icon as string) ?? "ChartLine",
      }));
  }, [mergedConfig, removedIds]);

  const config = useCallback(
    (moduleId: string): ModuleEntry => {
      const base = mergedConfig[moduleId] ?? { roles: [], departments: [] };
      return {
        roles: Array.isArray(base.roles) ? base.roles : [],
        departments: Array.isArray(base.departments) ? base.departments : [],
        name: base.name as string | undefined,
        shortName: base.shortName as string | undefined,
        description: base.description as string | undefined,
        href: base.href as string | undefined,
        icon: base.icon as string | undefined,
      };
    },
    [mergedConfig]
  );

  const toggleRole = useCallback(
    (moduleId: string, roleKey: string) => {
      const c = config(moduleId);
      setDraft((prev) => ({
        ...prev,
        [moduleId]: {
          ...c,
          roles: toggleInArray(c.roles, roleKey),
        },
      }));
    },
    [config]
  );

  const toggleDepartment = useCallback(
    (moduleId: string, deptKey: string) => {
      const c = config(moduleId);
      setDraft((prev) => ({
        ...prev,
        [moduleId]: {
          ...c,
          departments: toggleInArray(c.departments, deptKey),
        },
      }));
    },
    [config]
  );

  const hasChanges = useCallback(() => {
    if (removedIds.size > 0) return true;

    const toCanonical = (cfg: ModuleAccessConfig): string => {
      const entries = Object.entries(cfg)
        .filter(([id]) => !removedIds.has(id))
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([id, e]) => ({
          id,
          roles: [...(Array.isArray(e.roles) ? e.roles : [])].sort(),
          departments: [...(Array.isArray(e.departments) ? e.departments : [])].sort(),
          name: (e.name as string) ?? "",
          shortName: (e.shortName as string) ?? "",
          description: (e.description as string) ?? "",
          href: (e.href as string) ?? "",
          icon: (e.icon as string) ?? "ChartLine",
        }));
      return JSON.stringify(entries);
    };

    const payload: ModuleAccessConfig = {};
    for (const m of displayedModules) {
      const c = config(m.id);
      payload[m.id] = {
        roles: c.roles,
        departments: c.departments,
        name: m.name,
        shortName: m.shortName,
        description: m.description,
        href: m.href,
        icon: m.icon,
      };
    }

    const effectiveData = Object.fromEntries(
      Object.entries(data ?? {}).filter(([k]) => !removedIds.has(k))
    );

    return toCanonical(payload) !== toCanonical(effectiveData);
  }, [data, draft, removedIds, displayedModules, config]);

  const handleSave = () => {
    const payload: ModuleAccessConfig = {};
    for (const m of displayedModules) {
      const c = config(m.id);
      payload[m.id] = {
        roles: c.roles,
        departments: c.departments,
        name: m.name,
        shortName: m.shortName,
        description: m.description,
        href: m.href,
        icon: m.icon,
      };
    }
    if (!guard()) return;
    saveMutation.mutate(payload, { onSettled: release });
  };

  const handleAddModule = (module: NewModulePayload) => {
    setDraft((prev) => ({
      ...prev,
      [module.configKey]: {
        roles: [],
        departments: [],
        name: module.name,
        shortName: module.shortName,
        description: module.description,
        href: module.href,
        icon: module.icon,
      },
    }));
    setAddModalOpen(false);
  };

  const handleRemoveModule = (moduleId: string) => {
    setRemovedIds((prev) => new Set(prev).add(moduleId));
    setDraft((prev) => {
      const next = { ...prev };
      delete next[moduleId];
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b bg-background">
          <h3 className="font-semibold text-xl">Module Access</h3>
        </div>
        <div className="p-8">
          <div className="h-64 rounded-md bg-accent/10 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-background">
        <h3 className="font-semibold text-xl">Module Access</h3>
        <span className="flex items-center gap-2">
          {hasChanges() && (
            <Button size="sm" onClick={handleSave}>
              <Save className="size-4" />
              Save changes
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            className="gap-2"
            onClick={() => setAddModalOpen(true)}
          >
            <PlusCircle className="size-4" />
            Add module
          </Button>
        </span>
      </div>

      <AddModuleModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSave={handleAddModule}
        existingIds={displayedModules.map((m) => m.id)}
      />

      {/* Table */}
      <Table className="table-fixed">
        <TableHeader className="bg-accent">
          <TableRow>
            <TableHead className="w-120 px-6 py-4 font-semibold uppercase text-[11px] tracking-wider text-muted-foreground">
              Module
            </TableHead>
            <TableHead className="w-48 min-w-48 max-w-48 px-6 py-4 font-semibold uppercase text-[11px] tracking-wider text-muted-foreground">
              Allowed roles
            </TableHead>
            <TableHead className="w-64 min-w-64 max-w-64 px-6 py-4 font-semibold uppercase text-[11px] tracking-wider text-muted-foreground">
              Allowed departments
            </TableHead>
            <TableHead className="w-12 px-6 py-4" />
          </TableRow>
        </TableHeader>

        <TableBody>
          {displayedModules.map((module) => {
            const { roles, departments } = config(module.id);

            return (
              <TableRow key={module.id} className="hover:bg-accent/30">
                <TableCell className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-600/10 rounded-full p-2">
                      <Box className="size-5 text-blue-600" />
                    </span>
                    <span className="flex flex-col font-medium">
                        {module.name}
                        <p className="text-sm text-muted-foreground">{module.description}</p>
                    </span>
                  </div>
                </TableCell>
        
                <TableCell className="w-48 min-w-48 max-w-48 px-6 py-4 align-top">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-auto min-h-9 w-full justify-between text-left font-normal py-2"
                      >
                        <div className="flex flex-wrap gap-1 content-start flex-1 min-w-0">
                          {roles.length > 0 ? (
                            roles.map((r) => (
                              <Badge
                                key={r}
                                className={`text-[10px] font-medium ${userRoleMeta[r]?.className ?? "bg-muted text-muted-foreground"}`}
                              >
                                {userRoleMeta[r]?.label ?? r}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground text-sm">
                              Select roles…
                            </span>
                          )}
                        </div>
                        <ChevronDown className="size-4 shrink-0 opacity-50 ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48">
                      {Object.entries(userRole).map(([key, label]) => (
                        <DropdownMenuCheckboxItem
                          key={key}
                          checked={roles.includes(key)}
                          onCheckedChange={() => toggleRole(module.id, key)}
                          onSelect={(e) => e.preventDefault()}
                        >
                          {label}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
                <TableCell className="w-56 min-w-56 max-w-56 px-6 py-4 align-top">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-auto min-h-9 w-full justify-between text-left font-normal py-2"
                      >
                        <div className="flex flex-wrap gap-1 content-start flex-1 min-w-0 uppercase">
                          {departments.length > 0 ? (
                            departments.map((d) => (
                              <Badge
                                key={d}
                                className={`text-[10px] font-medium ${deptBadgeClass[d] ?? "bg-muted text-muted-foreground"}`}
                              >
                                {d}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground text-sm">
                              Select departments…
                            </span>
                          )}
                        </div>
                        <ChevronDown className="size-4 shrink-0 opacity-50 ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56">
                      {Object.entries(department).map(([key, label]) => (
                        <DropdownMenuCheckboxItem
                          key={key}
                          checked={departments.includes(key)}
                          onCheckedChange={() =>
                            toggleDepartment(module.id, key)
                          }
                          onSelect={(e) => e.preventDefault()}
                        >
                          {label}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
                <TableCell className="w-12 px-6 py-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemoveModule(module.id)}
                      aria-label="Remove module"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Footer hint */}
      <div className="px-6 py-4 border-t bg-background">
        <p className="text-sm text-muted-foreground">
          Users with the selected role or department can access each module. Leave
          both empty to restrict access to admins only.
        </p>
      </div>
    </div>
  );
}
