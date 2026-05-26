export function useMock(): boolean {
  if (typeof window === "undefined") return false;
  return process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";
}

export function isMockEnabled(): boolean {
  return process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";
}
