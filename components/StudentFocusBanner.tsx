type StudentFocusBannerProps = {
  focus: string;
};

export function StudentFocusBanner({ focus }: StudentFocusBannerProps) {
  return (
    <aside
      className="student-focus-banner print:hidden"
      role="note"
      aria-label="Student focus for this skill"
    >
      <span className="student-focus-banner__label">Student focus</span>
      <p className="student-focus-banner__text">{focus}</p>
    </aside>
  );
}
