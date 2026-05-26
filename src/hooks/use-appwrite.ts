export function useAppwrite(): { isConfigured: boolean } {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

  return {
    isConfigured: !!(endpoint && projectId),
  };
}

export function isAppwriteConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT &&
    process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID
  );
}
