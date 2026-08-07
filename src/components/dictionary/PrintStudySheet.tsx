"use client";

type StudyRow = {
  kweyolWord: string;
  english: string;
  pronunciation?: string | null;
};

type PrintStudySheetProps = {
  title: string;
  subtitle?: string;
  rows: StudyRow[];
  buttonLabel?: string;
  disabled?: boolean;
  className?: string;
};

export function PrintStudySheet({
  title,
  subtitle,
  rows,
  buttonLabel = "Print study sheet",
  disabled = false,
  className,
}: PrintStudySheetProps) {
  return (
    <div className={className}>
      <button
        type="button"
        className="btn btn--soft btn--md no-print"
        disabled={disabled || rows.length === 0}
        onClick={() => window.print()}
      >
        {buttonLabel}
      </button>
      <div className="study-print-sheet" aria-hidden="true">
        <h2>{title}</h2>
        {subtitle ? <p>{subtitle}</p> : null}
        <ul>
          {rows.map((row) => (
            <li key={`${row.kweyolWord}-${row.english}`}>
              <strong>{row.kweyolWord}</strong> — {row.english}
              {row.pronunciation ? ` /${row.pronunciation}/` : ""}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
