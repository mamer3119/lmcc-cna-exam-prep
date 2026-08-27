import type { BoilerplateTokenId } from "@/lib/practice-labels";
import { BOILERPLATE_TOKEN_REGISTRY } from "@/lib/practice-labels";

type BoilerplateTokenChipProps = {
  tokenId: BoilerplateTokenId;
  /** Step-specific emoji from boilerplate_tags (circles stripped). Falls back to registry. */
  emoji?: string | null;
};

export function BoilerplateTokenChip({
  tokenId,
  emoji,
}: BoilerplateTokenChipProps) {
  const token = BOILERPLATE_TOKEN_REGISTRY[tokenId];
  const displayEmoji = emoji ?? token.emoji;

  return (
    <span
      className={`boilerplate-token-chip boilerplate-token-chip--${token.phase}`}
      data-testid="boilerplate-token-chip"
      data-token-id={tokenId}
      aria-label={token.label}
    >
      {displayEmoji ?
        <span className="boilerplate-token-chip__emoji" aria-hidden="true">
          {displayEmoji}
        </span>
      : null}
      <span className="boilerplate-token-chip__label">{token.label}</span>
    </span>
  );
}
