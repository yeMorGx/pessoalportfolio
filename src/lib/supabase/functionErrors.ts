export async function getFunctionErrorCode(error: unknown, data: unknown) {
  if (data && typeof data === "object" && "code" in data && typeof data.code === "string") {
    return data.code;
  }

  if (error && typeof error === "object" && "context" in error) {
    const context = (error as { context?: unknown }).context;

    if (context instanceof Response) {
      try {
        const body = await context.clone().json() as { code?: unknown };
        return typeof body.code === "string" ? body.code : undefined;
      } catch {
        return undefined;
      }
    }
  }

  return undefined;
}
