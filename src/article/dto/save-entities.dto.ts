// comparaai-ai'nin POST /extract-entities yanıtındaki her bir eleman.
export class SaveEntityDto {
  entity_type: string; // 'company' | 'product' | 'technology'
  entity_name: string;
  product_id?: string | null;
  confidence?: number | null;
}
