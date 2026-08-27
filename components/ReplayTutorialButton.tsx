"use client";

type ReplayTutorialButtonProps = {
  onReplay: () => void;
};

export default function ReplayTutorialButton({
  onReplay,
}: ReplayTutorialButtonProps) {
  return (
    <button
      type="button"
      className="tutorial-replay"
      onClick={onReplay}
    >
      Replay how-to walkthrough
    </button>
  );
}
