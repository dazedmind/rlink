import React, { useState } from "react";
import { Field, FieldLabel } from "./field";
import { Input } from "./input";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "./button";

function TextInput({
  label,
  name,
  type,
  placeholder,
  onChange,
  value,
  className,
  required = false,
}: {
  label?: string;
  name: string;
  type: string;
  placeholder: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value: string;
  className?: string;
  required?: boolean;
}) {
  const [inputType, setInputType] = useState<string>(type);

  return (
    <Field className={cn("col-span-2 md:col-span-1 gap-2", className)}>
      <FieldLabel className="text-xs uppercase text-gray-500">
        {label} {required && <span className="text-red-500">*</span>}
      </FieldLabel>
      <span className="relative">
        <Input
          type={inputType}
          name={name}
          placeholder={placeholder}
          className="w-full p-2 rounded-md text-black"
          onChange={onChange}
          value={value}
        />
        {type === "password" && (
          <span className="absolute right-0 top-1/2 -translate-y-1/2 cursor-pointer z-10">
            <Button
              variant="ghost"
              size="icon"
              type="button"
              onClick={() =>
                setInputType(inputType === "password" ? "text" : "password")
              }
            >
              {inputType === "password" ? (
                <Eye className="size-4 text-gray-500" />
              ) : (
                <EyeOff className="size-4 text-gray-500" />
              )}
            </Button>
          </span>
        )}
      </span>
    </Field>
  );
}

export default TextInput;
