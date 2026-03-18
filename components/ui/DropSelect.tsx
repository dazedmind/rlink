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
  value,
  className,
  required,
}: {
  children: React.ReactNode;
  label?: string;
  selectName: string;
  selectId: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  value?: string;
  className?: string;
  required?: boolean;
}) {
  return (
    <Field className={cn("col-span-2 md:col-span-1 gap-2", className)}>
      <FieldLabel className="text-xs uppercase text-primary font-medium">{label}{required && <span className="text-red-500">*</span>}</FieldLabel>
      <div className="relative">
        <ChevronDownIcon className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2" />
        <select
          name={selectName}
          id={selectId}
          value={value}
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
