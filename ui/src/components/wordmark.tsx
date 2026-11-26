import { MoveRight } from "lucide-react";

type WordmarkProps = {
  inverse?: boolean;
  compact?: boolean;
};

export function Wordmark({ inverse = false, compact = false }: WordmarkProps) {
  if (compact) {
    return <span className="compact-wordmark"><span className="brand-symbol">b</span><b>LazyBond</b></span>;
  }

  return (
    <span className={`wordmark ${inverse ? "wordmark-inverse" : ""}`}>
      <span className="brand-symbol">b</span>
      <span className="brand-name">lazybond</span>
      <MoveRight className="brand-arrow" size={15} aria-hidden="true" />
    </span>
  );
}
