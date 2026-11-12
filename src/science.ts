/** Distances and visual features in this experience are illustrative, not physical simulation. */
export const EXOPLANET = { name: 'K2-18 b', discoveryYear: 2015, massEarths: 8.6, distanceLightYearsApprox: 124, evidenceStatus: 'Nenhuma vida extraterrestre foi confirmada neste planeta.' } as const;
export type EvidenceKind = 'observado' | 'hipotese' | 'simulacao';
export const evidenceLabels: Record<EvidenceKind, string> = { observado: 'Observação científica', hipotese: 'Hipótese em investigação', simulacao: 'Representação artística' };
export function clampZoom(distance: number): number { if (!Number.isFinite(distance)) return 6; return Math.max(3.3, Math.min(13, distance)); }