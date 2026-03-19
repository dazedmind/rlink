import React, { useMemo, useState } from "react";
import { Field, FieldLabel } from "./field";
import { Input } from "./input";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "./button";
import { validateEmail, validatePhone, validateName, validateEmployeeId } from "@/lib/form-validator";

type ValidationType = "email" | "name" | "phone" | "Employee ID" | "none";

function getValidationType(name: string, type: string): ValidationType {
  const lower = name.toLowerCase();
  if (type === "email" || lower.includes("email")) return "email";
  if (
    lower.includes("firstname") ||
    lower.includes("lastname") ||
    lower === "name" ||
    lower === "first" ||
    lower === "last"
  )
    return "name";
  if (type === "number" || type === "tel" || lower.includes("phone"))
    return "phone";
  if (type === "text" && name.includes("employeeId"))
    return "Employee ID";
  return "none";
}

function validateValue(value: string, validationType: ValidationType): boolean {
  if (!value.trim()) return true; // Empty is valid (required handled separately)
  switch (validationType) {
    case "email":
      return validateEmail(value);
    case "name":
      return validateName(value);
    case "phone":
      return validatePhone(value);
    case "Employee ID":
      return validateEmployeeId(value);
    default:
      return true;
  }
}

function TextInput({
  label,
  name,
  type,
  placeholder,
  onChange,
  value,
  className,
  required = false,
  disabled,
  validationType: validationTypeProp,
}: {
  label?: string;
  name: string;
  type: string;
  placeholder: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  validationType?: ValidationType;
}) {
  const [inputType, setInputType] = useState<string>(type);

  const validationType = validationTypeProp ?? getValidationType(name, type);
  const isInvalid = useMemo(
    () => (value ?? "").length > 0 && !validateValue(value ?? "", validationType),
    [value, validationType]
  );

  return (
    <Field className={cn("col-span-2 md:col-span-1 gap-2", className)}>
      <FieldLabel className="text-xs uppercase text-primary">
        {label} {required && <span className="text-red-500">*</span>}
      </FieldLabel>
      <span className="relative">
        <Input
          type={inputType}
          name={name}
          placeholder={placeholder}
          className="w-full rounded-md text-foreground"
          onChange={onChange}
          value={value ?? ""}
          disabled={disabled}
          aria-invalid={isInvalid}
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
        {/* <p>Invalid email. Please use your employee email.</p> */}
        {isInvalid && <p className="text-red-500 text-xs mt-1">Please enter a valid {validationType}</p>}
      </span>
    </Field>
  );
}

export default TextInput;
