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
}: {
  children: React.ReactNode;
  label?: string;
  selectName: string;
  selectId: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  value?: string;
  className?: string;
}) {
  return (
    <Field className={cn("", "col-span-2 md:col-span-1")}>
      <FieldLabel className="text-xs uppercase text-gray-500">{label}</FieldLabel>
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
