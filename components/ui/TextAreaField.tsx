import React from "react";
import { Label } from "./label";
import { Textarea } from "./textarea";
import { cn } from "@/lib/utils";
import { Field } from "./field";

function TextAreaField({
  label,
  name,
  value,
  placeholder,
  onChange,
  className,
  required = false,
}: {
  label: string;
  name: string;
  value: string;
  placeholder: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  className?: string;
  required?: boolean;
}) {

  return (
    <Field className={cn("col-span-2 md:col-span-1 gap-2", className)}>
      <Label htmlFor={name} className="text-xs text-primary uppercase">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Textarea
        id={name}
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        className={cn("border border-border text-sm resize-none min-h-[120px]", className)}
      />
    </Field>
  );
}

export default TextAreaField;
