export interface MCPPackage {
  registry_name: string;
  name: string;
  version?: string;
  environment_variables?: MCPEnvVar[];
  runtime_arguments?: MCPRuntimeArg[];
}

export interface MCPEnvVar {
  name: string;
  description?: string;
  is_required?: boolean;
  is_secret?: boolean;
  default?: string;
}

export interface MCPRuntimeArg {
  name: string;
  description?: string;
  is_required?: boolean;
  default?: string;
}

export interface MCPRepository {
  url: string;
  source: string;
}

export interface MCPVersionDetail {
  version: string;
  release_date?: string;
  is_latest?: boolean;
}

export interface MCPServer {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  version_detail?: MCPVersionDetail;
  packages?: MCPPackage[];
  repository?: MCPRepository;
  // Derived
  category?: string;
}

export interface RegistryResponse {
  servers: MCPServer[];
  total_count?: number;
  next_cursor?: string;
}
