/**
 * Tipos do PRD gerado pelos squads.
 */

export interface BrandAnalysis {
  positioning: string;
  value_proposition: string;
  brand_personality: string[];
  tone_of_voice: string;
  key_differentiators: string[];
  archetype: string;
}

export interface CopyAnalysis {
  hero_headline: string;
  hero_subheadline: string;
  primary_cta: string;
  about_paragraph: string;
  pain_points: string[];
  desires: string[];
  social_proof_angle: string;
}

export interface AudienceAnalysis {
  primary_persona: string;
  age_range: string;
  main_fears: string[];
  main_desires: string[];
  buying_trigger: string;
  objections: string[];
}

export interface DesignAnalysis {
  recommended_style: string;
  color_rationale: string;
  sections_recommended: string[];
  sections_order: string[];
  visual_references: string[];
}

export interface SquadPRD {
  brand: BrandAnalysis;
  copy: CopyAnalysis;
  audience: AudienceAnalysis;
  design: DesignAnalysis;
}

export interface PRDResponse {
  prd: SquadPRD;
  approved: boolean;
}
