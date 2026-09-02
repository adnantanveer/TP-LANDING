import { useEffect, useState, type FormEvent } from "react";
import { getRecaptchaConfig, getRecaptchaTokenV3, type RecaptchaConfig } from "@/lib/recaptcha";

const API_URL = import.meta.env.VITE_API_URL as string;

export type ContactStatus = "idle" | "submitting" | "success" | "error";

/**
 * Same submit behavior as the live site's contact form (Sections.tsx):
 * honeypot, v2/v3 reCAPTCHA, POST to /api/contact. Extracted so both
 * concept pages can render their own markup around identical, real
 * (non-mocked) form logic instead of duplicating the submit handler.
 */
export function useContactForm() {
  const [status, setStatus] = useState<ContactStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [recaptchaConfig, setRecaptchaConfig] = useState<RecaptchaConfig | null>(null);
  const [v2Token, setV2Token] = useState<string | null>(null);

  useEffect(() => {
    getRecaptchaConfig().then(setRecaptchaConfig);
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    if (data.get("company")) return; // honeypot

    if (recaptchaConfig?.active && recaptchaConfig.version === "v2" && !v2Token) {
      setStatus("error");
      setErrorMessage("Please complete the reCAPTCHA check.");
      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    try {
      const recaptchaToken =
        recaptchaConfig?.active && recaptchaConfig.version === "v2" ? v2Token! : await getRecaptchaTokenV3("contact");

      const res = await fetch(`${API_URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          countryCode: data.get("countryCode"),
          phone: data.get("phone"),
          email: data.get("email"),
          budget: data.get("budget"),
          message: data.get("message"),
          recaptchaToken,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Something went wrong. Please try again later.");

      setStatus("success");
      form.reset();
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong. Please try again later.");
    }
  }

  return { status, errorMessage, recaptchaConfig, v2Token, setV2Token, handleSubmit };
}

export const BUDGETS = ["Under £10k", "£10k-£25k", "£25k-£75k", "£75k+", "Not sure yet"];
