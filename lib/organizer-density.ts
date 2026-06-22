export type OrganizerChannel =
  | "verb-spine"
  | "phase-word"
  | "template-chip"
  | "divergence"
  | "none";

export type DensityState = {
  loudChannel: OrganizerChannel;
  phaseWordOpacity: number;
  templateChipOpacity: number;
  stepFocused: boolean;
  pastTemplateOpen: boolean;
};

const AMBIENT = 0.12;
const LOUD = 1;
const MUTED_CHIP = 0.22;

/**
 * One loud organizer per scroll depth — everything else degrades to ambient.
 */
export function resolveOrganizerDensity(input: {
  hasDivergenceInView: boolean;
  stepFocused: boolean;
  pastTemplateOpen: boolean;
  phaseWordVisible: boolean;
  templateChipVisible: boolean;
}): DensityState {
  const {
    hasDivergenceInView,
    stepFocused,
    pastTemplateOpen,
    phaseWordVisible,
    templateChipVisible,
  } = input;

  if (hasDivergenceInView) {
    return {
      loudChannel: "divergence",
      phaseWordOpacity: AMBIENT,
      templateChipOpacity: AMBIENT,
      stepFocused,
      pastTemplateOpen,
    };
  }

  if (stepFocused) {
    return {
      loudChannel: "none",
      phaseWordOpacity: AMBIENT * 0.5,
      templateChipOpacity: pastTemplateOpen ? AMBIENT : MUTED_CHIP,
      stepFocused: true,
      pastTemplateOpen,
    };
  }

  if (pastTemplateOpen && templateChipVisible) {
    return {
      loudChannel: "template-chip",
      phaseWordOpacity: AMBIENT,
      templateChipOpacity: LOUD,
      stepFocused: false,
      pastTemplateOpen: true,
    };
  }

  if (phaseWordVisible) {
    return {
      loudChannel: "phase-word",
      phaseWordOpacity: LOUD,
      templateChipOpacity: MUTED_CHIP,
      stepFocused: false,
      pastTemplateOpen,
    };
  }

  return {
    loudChannel: "verb-spine",
    phaseWordOpacity: AMBIENT,
    templateChipOpacity: AMBIENT,
    stepFocused: false,
    pastTemplateOpen,
  };
}
