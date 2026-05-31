export interface ScaleSet {
  peak: number | null;
  average: number | null;
  lowest: number | null;
}

export interface Dream {
  id: string;
  timestamp: number; // For sorting and creation tracking
  date: string | null; // YYYY-MM-DD. Null if unknown
  orderIndex?: number; // For sorting dreams from the same date
  title: string;
  content: string;
  mood: ScaleSet | number; 
  clarity: ScaleSet | number; 
  isLucid: boolean;
  isWBTB: boolean;
  isOriginalArchive: boolean; // Imported/legacy logs
  createdAt?: number;
  updatedAt?: number;
}

export type ScaleValue = -3 | -2 | -1 | 0 | 1 | 2 | 3;
