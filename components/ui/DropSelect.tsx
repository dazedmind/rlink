import React from "react";
import { Field, FieldLabel } from "./field";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";

function DropSelect({
  children,
  label,
  selectName,
  selectId,
  onChange,
  className,
  hasLabel,
}: {
  children: React.ReactNode;
  label: string;
  selectName: string;
  selectId: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  className?: string;
  hasLabel?: boolean;
}) {
  return (
    <Field className={cn("", hasLabel && "col-span-2 md:col-span-1")}>
      {hasLabel && (
        <FieldLabel>{label}</FieldLabel>
      )}
      <div className="relative">
        <ChevronDownIcon className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2" />
        <select
          name={selectName}
          id={selectId}
          className={cn("w-full h-10 text-sm text-black rounded-md px-2", className)}
          onChange={onChange}
        >
          {children}
        </select>
      </div>
    </Field>
  );
}

export default DropSelect;
