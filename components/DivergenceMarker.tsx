"use client";

type DivergenceMarkerProps = {
  copy: string;
};

export default function DivergenceMarker({ copy }: DivergenceMarkerProps) {
  return (
    <div className="divergence-marker" role="note">
      <p className="divergence-marker__copy">{copy}</p>
    </div>
  );
}
