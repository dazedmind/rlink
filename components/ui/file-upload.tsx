"use client"

import * as React from "react"
import { Upload, FileText, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

export interface FileUploadProps extends React.HTMLAttributes<HTMLDivElement> {
  file: File | null
  onFileSelect: (file: File) => void
  onFileRemove: (e: React.MouseEvent<HTMLButtonElement>) => void
  accept?: string
  placeholder?: string
}

const FileUpload = React.forwardRef<HTMLDivElement, FileUploadProps>(
  ({ className, file, onFileSelect, onFileRemove, accept = ".pdf,.doc,.docx", placeholder = "Upload File", ...props }, ref) => {
    const fileInputRef = React.useRef<HTMLInputElement | null>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
      const files = e.target.files
      if (files && files.length > 0) {
        onFileSelect(files[0])
      }
    }

    const handleRemove = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()
      e.stopPropagation()
      onFileRemove(e)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex items-center justify-center gap-2 w-full rounded-md border-2 border-dashed border-border p-4 transition-all duration-300",
          !file ? "bg-background hover:bg-accent hover:text-accent-foreground cursor-pointer" : "bg-muted/50 border-solid",
          "has-[.delete-btn:hover]:bg-destructive/10 has-[.delete-btn:hover]:border-destructive/50",
          className
        )}
        {...props}
      >
        {!file ? (
          <>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              accept={accept}
              className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
            />
            <div className="flex items-center gap-2 text-sm font-medium">
              <Upload className="h-5 w-5 text-muted-foreground" />
              <span>{placeholder}</span>
            </div>
          </>
        ) : (
          <div className="z-20 flex w-full items-center justify-between px-1">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="truncate text-sm font-medium text-foreground">
                  {file.name}
                </span>
                <span className="text-[10px] uppercase text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRemove}
              className="delete-btn group rounded-md p-2 transition-colors hover:bg-destructive/20"
              title="Remove file"
            >
              <Trash2 className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-destructive" />
            </button>
          </div>
        )}
      </div>
    )
  }
)
FileUpload.displayName = "FileUpload"

export { FileUpload }