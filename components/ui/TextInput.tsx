import React from "react";
import { Field, FieldLabel } from "./field";
import { Input } from "./input";
import { cn } from "@/lib/utils";

function TextInput({
  label,
  name,
  type,
  placeholder,
  onChange,
  value,
  className,
}: {
  label?: string;
  name: string;
  type: string;
  placeholder: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value: string;
  className?: string;
}) {
  return (
    <Field className={cn("col-span-2 md:col-span-1", className)}>
      <FieldLabel className="text-xs uppercase text-gray-500">{label}</FieldLabel>
      <Input
        type={type}
        name={name}
        placeholder={placeholder}
        className="w-full p-2 rounded-md text-black"
        onChange={onChange}
        value={value}
      />
    </Field>
  );
}

export default TextInput;
