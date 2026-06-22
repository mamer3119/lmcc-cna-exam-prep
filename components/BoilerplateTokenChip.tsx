import type { BoilerplateTokenId } from "@/lib/practice-labels";
import { BOILERPLATE_TOKEN_REGISTRY } from "@/lib/practice-labels";

type BoilerplateTokenChipProps = {
  tokenId: BoilerplateTokenId;
};

export function BoilerplateTokenChip({ tokenId }: BoilerplateTokenChipProps) {
  const token = BOILERPLATE_TOKEN_REGISTRY[tokenId];

  return (
    <span
      className={`boilerplate-token-chip boilerplate-token-chip--${token.phase}`}
      data-testid="boilerplate-token-chip"
      data-token-id={tokenId}
      aria-label={token.label}
    >
      {token.emoji ?
        <span className="boilerplate-token-chip__emoji" aria-hidden="true">
          {token.emoji}
        </span>
      : null}
      <span className="boilerplate-token-chip__label">{token.label}</span>
    </span>
  );
}
