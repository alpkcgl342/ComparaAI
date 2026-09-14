// comparaai-ai'nin POST /score-product yanıtıyla birebir eşleşir
// (bkz. comparaai-ai/main.py ScoreProductResponse).
export class SaveAiScoreDto {
  overall_score: number;
  performance_score?: number | null;
  camera_score?: number | null;
  battery_score?: number | null;
  software_score?: number | null;
  value_score?: number | null;
  use_case_score?: Record<string, number> | null;
  future_proof_score?: number | null;
  ai_summary: string;
  best_for?: string[];
  not_for?: string[];
  weaknesses?: string[];
  suggested_segment?: string | null;
}
