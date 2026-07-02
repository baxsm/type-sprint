type TypingIllustrationProps = {
  className?: string;
};

// hand-drawn, flat-geometric illustration in the undraw style, built with the
// app's own palette variables directly so it is always color-matched, in both themes.
const TypingIllustration = ({ className }: TypingIllustrationProps) => {
  return (
    <svg
      viewBox="0 0 400 300"
      className={className}
      role="img"
      aria-label="Illustration of a person typing at a desk"
    >
      <title>Person typing at a desk</title>
      <rect
        x="40"
        y="220"
        width="320"
        height="12"
        rx="2"
        fill="var(--color-border)"
        opacity="0.3"
      />

      <rect
        x="70"
        y="150"
        width="180"
        height="70"
        rx="6"
        fill="var(--color-surface-raised)"
        stroke="var(--color-border)"
        strokeWidth="3"
      />
      <rect x="88" y="168" width="144" height="10" rx="2" fill="var(--color-accent-soft)" />
      <rect
        x="88"
        y="184"
        width="100"
        height="10"
        rx="2"
        fill="var(--color-primary)"
        opacity="0.5"
      />
      <rect x="88" y="200" width="120" height="10" rx="2" fill="var(--color-accent-soft)" />

      <rect x="90" y="220" width="140" height="14" rx="3" fill="var(--color-ink)" opacity="0.15" />

      <circle cx="290" cy="120" r="34" fill="var(--color-accent-soft)" />
      <rect x="270" y="140" width="40" height="56" rx="12" fill="var(--color-primary)" />
      <circle cx="278" cy="180" r="9" fill="var(--color-accent-soft)" />
      <circle cx="302" cy="180" r="9" fill="var(--color-accent-soft)" />

      <rect
        x="255"
        y="196"
        width="70"
        height="24"
        rx="4"
        fill="var(--color-surface)"
        stroke="var(--color-border)"
        strokeWidth="3"
      />

      <circle cx="60" cy="70" r="16" fill="var(--color-correct)" opacity="0.5" />
      <circle cx="340" cy="60" r="10" fill="var(--color-opponent)" opacity="0.5" />
      <rect x="20" y="130" width="18" height="18" rx="3" fill="var(--color-info)" opacity="0.6" />
    </svg>
  );
};

export default TypingIllustration;
