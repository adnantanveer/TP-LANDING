import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { getRecaptchaConfig, getRecaptchaTokenV3, type RecaptchaConfig } from "@/lib/recaptcha";
import { RecaptchaCheckbox } from "@/components/RecaptchaCheckbox";
import { COUNTRY_CODES } from "@/lib/countryCodes";
import { SectionLabel } from "@/components/landing/primitives";

const API_URL = import.meta.env.VITE_API_URL as string;

type JobOption = { slug: string; title: string };
type Address = { address: string; country: string; state: string; city: string; zip: string };

const EMPTY_ADDRESS: Address = { address: "", country: "", state: "", city: "", zip: "" };

const fieldClass =
  "w-full rounded-xl border border-border bg-background/95 px-5 py-4 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none transition-colors focus:border-primary";
const labelClass = "mb-1.5 block text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground";
const hintClass = "mt-1 text-xs text-muted-foreground";

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: ReactNode }) {
  return (
    <div>
      <label className={labelClass}>
        {label}
        {required && <span className="text-primary"> *</span>}
      </label>
      {children}
      {hint && <p className={hintClass}>{hint}</p>}
    </div>
  );
}

function ChevronDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
      <path d="M2.5 4.5 7 9l4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AddressFields({ value, onChange }: { value: Address; onChange: (next: Address) => void }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Field label="Address" hint="Where do you live?">
          <input value={value.address} onChange={(e) => onChange({ ...value, address: e.target.value })} className={fieldClass} />
        </Field>
      </div>
      <Field label="Country">
        <input value={value.country} onChange={(e) => onChange({ ...value, country: e.target.value })} className={fieldClass} />
      </Field>
      <Field label="State">
        <input value={value.state} onChange={(e) => onChange({ ...value, state: e.target.value })} className={fieldClass} />
      </Field>
      <Field label="City">
        <input value={value.city} onChange={(e) => onChange({ ...value, city: e.target.value })} className={fieldClass} />
      </Field>
      <Field label="ZIP / Postal code">
        <input value={value.zip} onChange={(e) => onChange({ ...value, zip: e.target.value })} className={fieldClass} />
      </Field>
    </div>
  );
}

export function ApplyForm({ initialSlug }: { initialSlug?: string }) {
  const [jobOptions, setJobOptions] = useState<JobOption[]>([]);
  const [slug, setSlug] = useState(initialSlug ?? "");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+44");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");

  const [current, setCurrent] = useState<Address>(EMPTY_ADDRESS);
  const [permanent, setPermanent] = useState<Address>(EMPTY_ADDRESS);
  const [sameAsCurrent, setSameAsCurrent] = useState(false);

  const [graduation, setGraduation] = useState("");
  const [postGraduation, setPostGraduation] = useState("");
  const [ppgCourse, setPpgCourse] = useState("");
  const [certificates, setCertificates] = useState("");

  const [experienceYears, setExperienceYears] = useState("0");
  const [experienceMonths, setExperienceMonths] = useState("0");
  const [employerName, setEmployerName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [currentSalary, setCurrentSalary] = useState("");

  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [coverNote, setCoverNote] = useState("");
  const [company, setCompany] = useState(""); // honeypot
  const resumeRef = useRef<HTMLInputElement>(null);

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [recaptchaConfig, setRecaptchaConfig] = useState<RecaptchaConfig | null>(null);
  const [v2Token, setV2Token] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/jobs`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setJobOptions(data?.jobs?.map((j: JobOption) => ({ slug: j.slug, title: j.title })) ?? []))
      .catch(() => setJobOptions([]));
  }, []);

  useEffect(() => {
    if (initialSlug) setSlug(initialSlug);
  }, [initialSlug]);

  useEffect(() => {
    getRecaptchaConfig().then(setRecaptchaConfig);
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (company) return; // honeypot tripped

    if (!slug) {
      setStatus("error");
      setErrorMessage("Please select which role you're applying for.");
      return;
    }
    if (!resumeRef.current?.files?.[0]) {
      setStatus("error");
      setErrorMessage("Please upload your resume.");
      return;
    }
    if (recaptchaConfig?.active && recaptchaConfig.version === "v2" && !v2Token) {
      setStatus("error");
      setErrorMessage("Please complete the reCAPTCHA check.");
      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    try {
      const recaptchaToken =
        recaptchaConfig?.active && recaptchaConfig.version === "v2" ? v2Token! : await getRecaptchaTokenV3("job_apply");

      const formData = new FormData();
      formData.append("name", fullName);
      formData.append("email", email);
      formData.append("countryCode", countryCode);
      formData.append("phone", phone);
      formData.append("dateOfBirth", dateOfBirth);
      formData.append("gender", gender);
      formData.append("linkedinUrl", portfolioUrl);
      formData.append("coverNote", coverNote);
      formData.append("currentAddress", JSON.stringify(current));
      formData.append("permanentAddress", JSON.stringify(sameAsCurrent ? current : permanent));
      formData.append("education", JSON.stringify({ graduation, postGraduation, ppgCourse, certificates }));
      formData.append(
        "experience",
        JSON.stringify({ years: experienceYears, months: experienceMonths, employerName, jobTitle, currentSalary }),
      );
      formData.append("resume", resumeRef.current.files[0]);
      if (recaptchaToken) formData.append("recaptchaToken", recaptchaToken);

      const res = await fetch(`${API_URL}/api/jobs/${slug}/apply`, { method: "POST", body: formData });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Something went wrong. Please try again later.");

      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong. Please try again later.");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-border bg-background/90 p-8 text-center backdrop-blur-md shadow-[var(--shadow-deep)]">
        <p className="text-sm font-medium text-foreground">
          Thanks — we've received your application and will be in touch if there's a match.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10 rounded-2xl border border-border bg-background/90 p-6 backdrop-blur-md shadow-[var(--shadow-deep)] sm:p-10">
      <input
        type="text"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />

      <div>
        <SectionLabel>Select position to apply for</SectionLabel>
        <div className="mt-5">
          <Field label="Applied for" required>
            <div className="relative">
              <select required value={slug} onChange={(e) => setSlug(e.target.value)} className={`${fieldClass} appearance-none`}>
                <option value="" disabled>
                  Select a role
                </option>
                {jobOptions.map((j) => (
                  <option key={j.slug} value={j.slug}>
                    {j.title}
                  </option>
                ))}
              </select>
              <ChevronDown />
            </div>
          </Field>
        </div>
      </div>

      <div>
        <SectionLabel>Personal details</SectionLabel>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Full name" required hint="Enter your name as it appears on your legal documents.">
              <input required value={fullName} onChange={(e) => setFullName(e.target.value)} className={fieldClass} />
            </Field>
          </div>
          <Field label="Email address" required hint="Enter your email.">
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={fieldClass} />
          </Field>
          <Field label="Phone number" required hint="So that we can give you a call.">
            <div className="flex gap-3">
              <div className="relative w-[6.5rem] shrink-0">
                <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)} className={`${fieldClass} appearance-none pr-8 text-center`}>
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.code} value={c.code} className="bg-background text-foreground">
                      {c.flag} {c.code}
                    </option>
                  ))}
                </select>
                <ChevronDown />
              </div>
              <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} pattern="[0-9 \(\)+\-]{6,}" className={`${fieldClass} flex-1`} />
            </div>
          </Field>
          <Field label="Date of birth" required>
            <input type="date" required value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className={fieldClass} />
          </Field>
          <Field label="Gender">
            <div className="flex items-center gap-6 pt-3">
              {["Male", "Female"].map((g) => (
                <label key={g} className="flex items-center gap-2 text-sm text-foreground">
                  <input type="radio" name="gender" value={g} checked={gender === g} onChange={() => setGender(g)} className="h-4 w-4 text-primary focus:ring-primary/30" />
                  {g}
                </label>
              ))}
            </div>
          </Field>
        </div>
      </div>

      <div>
        <SectionLabel>Current address</SectionLabel>
        <div className="mt-5">
          <AddressFields value={current} onChange={setCurrent} />
        </div>
      </div>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SectionLabel>Permanent address</SectionLabel>
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={sameAsCurrent}
              onChange={(e) => setSameAsCurrent(e.target.checked)}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary/30"
            />
            Same as current address
          </label>
        </div>
        {!sameAsCurrent && (
          <div className="mt-5">
            <AddressFields value={permanent} onChange={setPermanent} />
          </div>
        )}
      </div>

      <div>
        <SectionLabel>Education &amp; qualification</SectionLabel>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Graduation" hint="School/University name and degree.">
            <input value={graduation} onChange={(e) => setGraduation(e.target.value)} className={fieldClass} />
          </Field>
          <Field label="Post graduation" hint="School/University name and degree.">
            <input value={postGraduation} onChange={(e) => setPostGraduation(e.target.value)} className={fieldClass} />
          </Field>
          <Field label="PPG course" hint="School/University name and degree.">
            <input value={ppgCourse} onChange={(e) => setPpgCourse(e.target.value)} className={fieldClass} />
          </Field>
          <Field label="Certificates / skills (if any)">
            <input value={certificates} onChange={(e) => setCertificates(e.target.value)} className={fieldClass} />
          </Field>
        </div>
      </div>

      <div>
        <SectionLabel>Work experience</SectionLabel>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Experience">
            <div className="flex gap-3">
              <div className="flex-1">
                <input type="number" min={0} max={60} value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)} placeholder="Years" className={fieldClass} />
              </div>
              <div className="flex-1">
                <input type="number" min={0} max={11} value={experienceMonths} onChange={(e) => setExperienceMonths(e.target.value)} placeholder="Months" className={fieldClass} />
              </div>
            </div>
          </Field>
          <Field label="Current salary (optional)">
            <input value={currentSalary} onChange={(e) => setCurrentSalary(e.target.value)} placeholder="e.g. £45,000" className={fieldClass} />
          </Field>
          <Field label="Employer name" hint="What is the name of the company?">
            <input value={employerName} onChange={(e) => setEmployerName(e.target.value)} className={fieldClass} />
          </Field>
          <Field label="Job title" hint="What was your job title or designation?">
            <input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} className={fieldClass} />
          </Field>
        </div>
      </div>

      <div>
        <SectionLabel>Resume &amp; portfolio</SectionLabel>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Website / portfolio link (optional)">
            <input type="url" value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)} className={fieldClass} />
          </Field>
          <Field label="Resume" required hint="PDF, DOC, or DOCX — up to 5MB.">
            <input
              ref={resumeRef}
              type="file"
              required
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className={`${fieldClass} file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-xs file:font-medium file:text-primary-foreground`}
            />
          </Field>
        </div>
      </div>

      <div>
        <SectionLabel>Cover letter</SectionLabel>
        <div className="mt-5">
          <Field label="Write to us why we should choose you (optional)">
            <textarea value={coverNote} onChange={(e) => setCoverNote(e.target.value)} rows={5} className={`${fieldClass} resize-none`} />
          </Field>
        </div>
      </div>

      {recaptchaConfig?.active && recaptchaConfig.version === "v2" && (
        <RecaptchaCheckbox siteKey={recaptchaConfig.siteKey} onChange={setV2Token} />
      )}

      {status === "error" && <p className="text-sm text-destructive">{errorMessage}</p>}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full rounded-full bg-primary px-8 py-4 text-sm font-medium text-primary-foreground shadow-[var(--shadow-ember)] transition-transform duration-300 hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100 sm:w-auto"
      >
        {status === "submitting" ? "Submitting..." : "Submit application"}
      </button>
    </form>
  );
}
