export function nameToSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "") // remove special chars except spaces and hyphens
      .replace(/\s+/g, "-")         // spaces to hyphens
      .replace(/-+/g, "-")          // collapse multiple hyphens
      .replace(/^-|-$/g, "");       // trim leading/trailing hyphens
  }
  