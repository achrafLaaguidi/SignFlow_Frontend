// models/paged-model.model.ts
export interface PageMetadata {
  size: number;
  totalElements: number;
  totalPages: number;
  number: number;
}

export interface PagedModel<T> {
  content: T[];
  page?: PageMetadata; 
}