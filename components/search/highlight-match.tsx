"use client";

type HighlightMatchProps = {
  text: string;
  terms: string[];
  className?: string;
};

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function HighlightMatch({ text, terms, className }: HighlightMatchProps) {
  const activeTerms = terms
    .map((term) => term.trim())
    .filter((term) => term.length > 0);

  if (!text || activeTerms.length === 0) {
    return <span className={className}>{text}</span>;
  }

  const pattern = activeTerms
    .sort((a, b) => b.length - a.length)
    .map(escapeRegExp)
    .join("|");

  const parts = text.split(new RegExp(`(${pattern})`, "gi"));

  return (
    <span className={className}>
      {parts.map((part, index) => {
        const isMatch = activeTerms.some(
          (term) => part.toLowerCase() === term.toLowerCase()
        );

        if (isMatch) {
          return (
            <mark
              key={`${part}-${index}`}
              className="rounded bg-primary/20 px-0.5 font-medium text-primary"
            >
              {part}
            </mark>
          );
        }

        return <span key={`${part}-${index}`}>{part}</span>;
      })}
    </span>
  );
}
