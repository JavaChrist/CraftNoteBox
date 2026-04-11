/** Identifiants stables pour le stockage (évite injection / attributs arbitraires). */
export const CODE_LANGUAGE_OPTIONS: ReadonlyArray<{
  id: string;
  label: string;
}> = [
  { id: "plain", label: "Texte brut" },
  { id: "bash", label: "Bash" },
  { id: "c", label: "C" },
  { id: "cpp", label: "C++" },
  { id: "csharp", label: "C#" },
  { id: "css", label: "CSS" },
  { id: "dockerfile", label: "Dockerfile" },
  { id: "gherkin", label: "Gherkin" },
  { id: "glsl", label: "GLSL" },
  { id: "go", label: "Go" },
  { id: "graphql", label: "GraphQL" },
  { id: "groovy", label: "Groovy" },
  { id: "haskell", label: "Haskell" },
  { id: "hcl", label: "HCL" },
  { id: "html", label: "HTML" },
  { id: "idris", label: "Idris" },
  { id: "java", label: "Java" },
  { id: "javascript", label: "JavaScript" },
  { id: "jsx", label: "JSX" },
  { id: "json", label: "JSON" },
  { id: "kotlin", label: "Kotlin" },
  { id: "markdown", label: "Markdown" },
  { id: "php", label: "PHP" },
  { id: "python", label: "Python" },
  { id: "ruby", label: "Ruby" },
  { id: "rust", label: "Rust" },
  { id: "scss", label: "SCSS" },
  { id: "sql", label: "SQL" },
  { id: "swift", label: "Swift" },
  { id: "tsx", label: "TSX" },
  { id: "typescript", label: "TypeScript" },
  { id: "xml", label: "XML" },
  { id: "yaml", label: "YAML" },
];

const ALLOWED = new Set(CODE_LANGUAGE_OPTIONS.map((o) => o.id));

export const DEFAULT_CODE_LANGUAGE = "javascript";

export function isAllowedCodeLanguage(id: string): boolean {
  return ALLOWED.has(id.trim().toLowerCase());
}

export function normalizeCodeLanguage(
  raw: string | undefined | null,
): string {
  if (raw == null || raw === "") return DEFAULT_CODE_LANGUAGE;
  const id = raw.trim().toLowerCase();
  return isAllowedCodeLanguage(id) ? id : DEFAULT_CODE_LANGUAGE;
}

export function codeLanguageLabel(id: string): string {
  const n = normalizeCodeLanguage(id);
  return CODE_LANGUAGE_OPTIONS.find((o) => o.id === n)?.label ?? n;
}
