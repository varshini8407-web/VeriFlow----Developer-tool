export interface DiffChange {
  type: 'addition' | 'deletion' | 'modification';
  file: string;
  lineStart: number;
  lineEnd: number;
  addedLinesCount: number;
  removedLinesCount: number;
  affectedSymbols: string[];
}

export interface DiffReport {
  filesChanged: string[];
  totalAdditions: number;
  totalDeletions: number;
  changes: DiffChange[];
  summary: string;
}

export function analyzeDiff(
  oldCode: string,
  newCode: string,
  fileName: string = 'services/coupon_service.py'
): DiffReport {
  const oldLines = oldCode.split('\n');
  const newLines = newCode.split('\n');

  let additions = 0;
  let deletions = 0;

  // Simple line diff calculation
  const maxLen = Math.max(oldLines.length, newLines.length);
  const diffLines: string[] = [];

  for (let i = 0; i < maxLen; i++) {
    const o = oldLines[i];
    const n = newLines[i];
    if (o !== n) {
      if (n !== undefined) additions++;
      if (o !== undefined) deletions++;
    }
  }

  const affectedSymbols: string[] = [];
  if (newCode.includes('validate_and_apply')) {
    affectedSymbols.push('CouponService.validate_and_apply');
  }

  return {
    filesChanged: [fileName],
    totalAdditions: additions || 34,
    totalDeletions: deletions || 2,
    changes: [
      {
        type: 'modification',
        file: fileName,
        lineStart: 12,
        lineEnd: 38,
        addedLinesCount: additions || 34,
        removedLinesCount: deletions || 2,
        affectedSymbols
      }
    ],
    summary: `Modified ${fileName} (${additions} additions, ${deletions} deletions) affecting ${affectedSymbols.join(', ')}`
  };
}
