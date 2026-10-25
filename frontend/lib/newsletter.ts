const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export interface NewsletterError {
  error: string;
  fields?: Record<string, string>;
}

async function postNewsletter(
  path: string,
  body: Record<string, unknown>,
): Promise<{ message: string }> {
  const response = await fetch(`${API_URL}/newsletter${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = (await response.json()) as { message?: string } | NewsletterError;

  if (!response.ok) {
    throw data as NewsletterError;
  }

  return { message: (data as { message: string }).message };
}

export function subscribeToNewsletter(email: string) {
  return postNewsletter("", {
    email,
    consent: true,
    source: "homepage",
  });
}

export function confirmNewsletter(token: string) {
  return postNewsletter("/confirm", { token });
}

export function unsubscribeNewsletter(token: string) {
  return postNewsletter("/unsubscribe", { token });
}
