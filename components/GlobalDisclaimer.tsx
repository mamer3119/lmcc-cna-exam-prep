import { GLOBAL_DISCLAIMER } from "@/lib/compliance";

export default function GlobalDisclaimer() {
  return (
    <footer className="global-disclaimer">
      <p>{GLOBAL_DISCLAIMER}</p>
    </footer>
  );
}
