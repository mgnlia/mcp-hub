// ─── New registry API schema (2025-12-11) ────────────────────────────────────

export interface MCPPackage {
  // New schema fields
  registryType?: string;       // "oci", "npm", "pypi", etc.
  identifier?: string;         // e.g. "docker.io/foo/bar:1.0"
  transport?: { type: string };
  environmentVariables?: MCPEnvVar[];
  runtimeArguments?: MCPRuntimeArg[];

  // Legacy / compat
  registry_name?: string;
  name?: string;
  version?: string;
  environment_variables?: MCPEnvVar[];
  runtime_arguments?: MCPRuntimeArg[];
}

export interface MCPEnvVar {
  name: string;
  description?: string;
  is_required?: boolean;
  isSecret?: boolean;
  is_secret?: boolean;
  default?: string;
  format?: string;
}

export interface MCPRuntimeArg {
  name: string;
  description?: string;
  is_required?: boolean;
  default?: string;
}

export interface MCPRepository {
  url?: string;
  source?: string;
  id?: string;
  subfolder?: string;
}

export interface MCPVersionDetail {
  version: string;
  release_date?: string;
  is_latest?: boolean;
}

export interface MCPRemote {
  type: string;
  url: string;
}

// Raw server object from the registry (nested under "server" key in list response)
export interface MCPServerRaw {
  $schema?: string;
  name: string;
  description?: string;
  title?: string;
  version?: string;
  websiteUrl?: string;
  repository?: MCPRepository;
  packages?: MCPPackage[];
  remotes?: MCPRemote[];
  icons?: Array<{ src: string; mimeType?: string; sizes?: string[] }>;
}

// _meta wrapper
export interface MCPServerMeta {
  "io.modelcontextprotocol.registry/official"?: {
    status?: string;
    publishedAt?: string;
    updatedAt?: string;
    isLatest?: boolean;
  };
}

// Raw list item from the API
export interface MCPServerListItem {
  server: MCPServerRaw;
  _meta?: MCPServerMeta;
}

// Normalised server used throughout the app
export interface MCPServer {
  id: string;           // derived: server.name (unique slug)
  name: string;
  description: string;
  created_at: string;   // from _meta.publishedAt
  updated_at: string;   // from _meta.updatedAt
  version_detail?: MCPVersionDetail;
  packages?: MCPPackage[];
  repository?: MCPRepository;
  remotes?: MCPRemote[];
  websiteUrl?: string;
  // Derived
  category?: string;
}

// New API response shape
export interface RegistryResponseRaw {
  servers: MCPServerListItem[];
  metadata?: {
    nextCursor?: string;
    count?: number;
  };
  // Legacy fallback fields
  next_cursor?: string;
  total_count?: number;
}

// Normalised response used in the app
export interface RegistryResponse {
  servers: MCPServer[];
  next_cursor?: string;
  total_count?: number;
}
