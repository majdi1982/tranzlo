type EnvOptions = {
  optional?: boolean;
  fallback?: string;
};

export function getEnv(name: string, options: EnvOptions = {}): string {
  const value = process.env[name] ?? options.fallback;
  if (!value) {
    if (options.optional) return "";
    throw new Error(`Missing env var: ${name}`);
  }
  return value;
}

export function getOptionalEnv(name: string): string {
  return process.env[name] ?? "";
}

