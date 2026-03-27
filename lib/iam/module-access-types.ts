export type ModuleEntry = {
  roles: string[];
  departments: string[];
  name?: string;
  shortName?: string;
  description?: string;
  href?: string;
  icon?: string;
};

export type ModuleAccessConfig = Record<string, ModuleEntry>;
