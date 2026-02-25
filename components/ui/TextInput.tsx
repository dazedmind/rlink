import React from "react";
import { Field, FieldLabel } from "./field";
import { Input } from "./input";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

function TextInput({
  label,
  type,
  placeholder,
  // onChange,
  //  value,
  className,
  hasLabel,
}: {
  label: string;
  type: string;
  placeholder: string;
  // onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  // value: string;
  className?: string;
  hasLabel?: boolean;
}) {
  return (
    <Field className={cn("", className)}>
      {hasLabel && (
        <FieldLabel>{label}</FieldLabel>
      )}
      <Input
        type={type}
        placeholder={placeholder}
        className="w-full p-2 rounded-md text-black"
        // onChange={onChange}
        // value={value}
      />
    </Field>
  );
}

export default TextInput;
