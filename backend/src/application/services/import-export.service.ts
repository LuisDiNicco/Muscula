import { Inject, Injectable } from '@nestjs/common';
import JSZip from 'jszip';
import {
  FILE_STORAGE_SERVICE,
  type IFileStorageService,
} from '../interfaces/file-storage.interface';
import {
  IMPORT_EXPORT_REPOSITORY,
  type IImportExportRepository,
  type ImportedExerciseInput,
  type ImportedSessionInput,
} from '../interfaces/import-export-repository.interface';
import { ValidationError } from '../../domain/errors/validation.error';

const PREVIEW_TTL_MS = 30 * 60 * 1000;

type ImportSource = 'STRONG' | 'HEVY';

type ParsedSetRow = {
  date: Date;
  exerciseName: string;
  weightKg: number;
  reps: number;
};

type ExerciseMapping = {
  exerciseName: string;
  mappedExerciseId: string | null;
  matchedExerciseName: string | null;
  confidence: number;
};

type ImportPreview = {
  previewId: string;
  userId: string;
  source: ImportSource;
  rows: ParsedSetRow[];
  mappings: ExerciseMapping[];
  createdAt: Date;
  expiresAt: Date;
};

@Injectable()
export class ImportExportService {
  private readonly previewStore = new Map<string, ImportPreview>();

  constructor(
    @Inject(IMPORT_EXPORT_REPOSITORY)
    private readonly importExportRepository: IImportExportRepository,
    @Inject(FILE_STORAGE_SERVICE)
    private readonly fileStorageService: IFileStorageService,
  ) {}

  async exportData(userId: string): Promise<{
    fileName: string;
    url: string;
    expiresAt: Date;
  }> {
    const [sessionRows, nutritionRows, bodyMetricRows] = await Promise.all([
      this.importExportRepository.getSessionRows(userId),
      this.importExportRepository.getNutritionRows(userId),
      this.importExportRepository.getBodyMetricRows(userId),
    ]);

    const sessionsCsv = this.toCsv(
      [
        'sessionId',
        'status',
        'startedAt',
        'finishedAt',
        'durationMinutes',
        'exerciseName',
        'setOrder',
        'weightKg',
        'reps',
        'rir',
        'completed',
        'skipped',
      ],
      sessionRows.map((row) => [
        row.sessionId,
        row.status,
        row.startedAt.toISOString(),
        row.finishedAt?.toISOString() ?? '',
        row.durationMinutes ?? '',
        row.exerciseName,
        row.setOrder,
        row.weightKg,
        row.reps,
        row.rir,
        row.completed,
        row.skipped,
      ]),
    );

    const nutritionCsv = this.toCsv(
      [
        'mealDate',
        'mealType',
        'foodName',
        'grams',
        'calories',
        'protein',
        'carbs',
        'fat',
      ],
      nutritionRows.map((row) => [
        row.mealDate.toISOString().slice(0, 10),
        row.mealType,
        row.foodName,
        row.grams,
        row.calories,
        row.protein,
        row.carbs,
        row.fat,
      ]),
    );

    const bodyMetricsCsv = this.toCsv(
      ['date', 'weightKg', 'neckCm', 'chestCm', 'waistCm', 'hipCm'],
      bodyMetricRows.map((row) => [
        row.date.toISOString().slice(0, 10),
        row.weightKg ?? '',
        row.neckCm ?? '',
        row.chestCm ?? '',
        row.waistCm ?? '',
        row.hipCm ?? '',
      ]),
    );

    const zip = new JSZip();
    zip.file('sessions.csv', sessionsCsv);
    zip.file('nutrition.csv', nutritionCsv);
    zip.file('body-metrics.csv', bodyMetricsCsv);
    const bundle = await zip.generateAsync({ type: 'nodebuffer' });

    const now = new Date();
    const fileName = `muscula-export-${now.toISOString().replace(/[:.]/g, '-')}.zip`;
    const storagePath = `exports/${userId}/${fileName}`;

    const uploadedPath = await this.fileStorageService.upload(storagePath, {
      buffer: bundle,
      contentType: 'application/zip',
      fileName,
    });

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const url = await this.fileStorageService.getSignedUrl(uploadedPath, 86400);

    return {
      fileName,
      url,
      expiresAt,
    };
  }

  async previewImport(
    userId: string,
    source: ImportSource,
    csvContent: string,
  ): Promise<{
    previewId: string;
    source: ImportSource;
    totalRows: number;
    validRows: number;
    discardedRows: number;
    mappings: ExerciseMapping[];
    unmappedExercises: string[];
    expiresAt: Date;
  }> {
    const parsedRows = this.parseCsvRows(csvContent);
    const validRows = this.parseImportRows(source, parsedRows);
    const exerciseNames = [
      ...new Set(validRows.map((row) => row.exerciseName)),
    ];

    const candidates =
      await this.importExportRepository.findExerciseCandidatesByNames(
        exerciseNames,
      );

    const mappings = this.buildMappings(exerciseNames, candidates);
    const unmappedExercises = mappings
      .filter((mapping) => mapping.mappedExerciseId === null)
      .map((mapping) => mapping.exerciseName);

    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + PREVIEW_TTL_MS);
    const previewId = this.generatePreviewId();

    this.previewStore.set(previewId, {
      previewId,
      userId,
      source,
      rows: validRows,
      mappings,
      createdAt,
      expiresAt,
    });

    this.clearExpiredPreviews();

    return {
      previewId,
      source,
      totalRows: parsedRows.length,
      validRows: validRows.length,
      discardedRows: parsedRows.length - validRows.length,
      mappings,
      unmappedExercises,
      expiresAt,
    };
  }

  async confirmImport(
    userId: string,
    previewId: string,
    customMappings: Array<{
      exerciseName: string;
      exerciseId?: string;
      customName?: string;
    }>,
  ): Promise<{
    importedSessions: number;
    importedRows: number;
    createdCustomExercises: number;
  }> {
    const preview = this.previewStore.get(previewId);

    if (
      preview === undefined ||
      preview.userId !== userId ||
      preview.expiresAt.getTime() < Date.now()
    ) {
      throw new ValidationError('Invalid or expired import preview');
    }

    const mappingByName = new Map<string, string>();
    for (const mapping of preview.mappings) {
      if (mapping.mappedExerciseId !== null) {
        mappingByName.set(mapping.exerciseName, mapping.mappedExerciseId);
      }
    }

    let createdCustomExercises = 0;

    for (const customMapping of customMappings) {
      const exerciseName = customMapping.exerciseName.trim();
      if (exerciseName.length === 0) {
        continue;
      }

      if (customMapping.exerciseId !== undefined) {
        mappingByName.set(exerciseName, customMapping.exerciseId);
        continue;
      }

      const customName = customMapping.customName?.trim() || exerciseName;
      const createdId = await this.importExportRepository.createCustomExercise(
        userId,
        customName,
      );
      mappingByName.set(exerciseName, createdId);
      createdCustomExercises += 1;
    }

    const unresolved = [
      ...new Set(preview.rows.map((row) => row.exerciseName)),
    ].filter((name) => !mappingByName.has(name));

    if (unresolved.length > 0) {
      throw new ValidationError(
        `Unmapped exercises remain: ${unresolved.join(', ')}`,
      );
    }

    const groupedSessions = this.groupRowsIntoSessions(
      preview.rows,
      mappingByName,
    );
    const importedSessions =
      await this.importExportRepository.persistImportedSessions(
        userId,
        groupedSessions,
      );

    this.previewStore.delete(previewId);

    return {
      importedSessions,
      importedRows: preview.rows.length,
      createdCustomExercises,
    };
  }

  private parseImportRows(
    source: ImportSource,
    rows: Array<Record<string, string>>,
  ): ParsedSetRow[] {
    const parsed: ParsedSetRow[] = [];

    for (const row of rows) {
      const exerciseName =
        source === 'STRONG'
          ? (row['Exercise Name'] ?? row['Exercise'])
          : (row['exercise_name'] ?? row['Exercise Name']);
      const dateValue =
        source === 'STRONG'
          ? (row['Date'] ?? row['date'])
          : (row['date'] ?? row['Date']);
      const weightValue =
        source === 'STRONG'
          ? (row['Weight'] ?? row['Weight (kg)'])
          : (row['weight_kg'] ?? row['Weight']);
      const repsValue =
        source === 'STRONG'
          ? (row['Reps'] ?? row['reps'])
          : (row['reps'] ?? row['Reps']);

      const normalizedName = (exerciseName ?? '').trim();
      const parsedDate = new Date((dateValue ?? '').trim());
      const weightKg = Number((weightValue ?? '').trim());
      const reps = Number((repsValue ?? '').trim());

      if (
        normalizedName.length === 0 ||
        Number.isNaN(parsedDate.getTime()) ||
        !Number.isFinite(weightKg) ||
        !Number.isFinite(reps) ||
        weightKg < 0 ||
        reps <= 0
      ) {
        continue;
      }

      parsed.push({
        date: parsedDate,
        exerciseName: normalizedName,
        weightKg,
        reps,
      });
    }

    return parsed;
  }

  private buildMappings(
    names: string[],
    candidates: Array<{ id: string; nameEs: string; nameEn: string }>,
  ): ExerciseMapping[] {
    return names.map((name) => {
      const normalizedInput = this.normalizeName(name);
      const scored = candidates
        .map((candidate) => {
          const scoreEs = this.similarity(
            normalizedInput,
            this.normalizeName(candidate.nameEs),
          );
          const scoreEn = this.similarity(
            normalizedInput,
            this.normalizeName(candidate.nameEn),
          );
          const score = Math.max(scoreEs, scoreEn);

          return {
            candidate,
            score,
          };
        })
        .sort((left, right) => right.score - left.score);

      const best = scored[0];
      if (best === undefined || best.score < 0.72) {
        return {
          exerciseName: name,
          mappedExerciseId: null,
          matchedExerciseName: null,
          confidence: 0,
        };
      }

      return {
        exerciseName: name,
        mappedExerciseId: best.candidate.id,
        matchedExerciseName:
          best.candidate.nameEn.length > 0
            ? best.candidate.nameEn
            : best.candidate.nameEs,
        confidence: Number(best.score.toFixed(2)),
      };
    });
  }

  private groupRowsIntoSessions(
    rows: ParsedSetRow[],
    mappingByName: Map<string, string>,
  ): ImportedSessionInput[] {
    const byDay = new Map<string, ParsedSetRow[]>();

    for (const row of rows) {
      const day = row.date.toISOString().slice(0, 10);
      const current = byDay.get(day) ?? [];
      current.push(row);
      byDay.set(day, current);
    }

    const sessions: ImportedSessionInput[] = [];

    for (const [day, dayRows] of byDay.entries()) {
      const exerciseGroups = new Map<string, ParsedSetRow[]>();

      for (const row of dayRows) {
        const current = exerciseGroups.get(row.exerciseName) ?? [];
        current.push(row);
        exerciseGroups.set(row.exerciseName, current);
      }

      const exercises: ImportedExerciseInput[] = [
        ...exerciseGroups.entries(),
      ].map(([exerciseName, exerciseRows], exerciseIndex) => {
        const exerciseId = mappingByName.get(exerciseName);
        if (exerciseId === undefined) {
          throw new ValidationError(
            `Missing mapping for exercise ${exerciseName}`,
          );
        }

        return {
          exerciseOrder: exerciseIndex + 1,
          exerciseId,
          sets: exerciseRows.map((set, setIndex) => ({
            setOrder: setIndex + 1,
            weightKg: set.weightKg,
            reps: set.reps,
          })),
        };
      });

      const startedAt = new Date(`${day}T10:00:00.000Z`);
      const finishedAt = new Date(`${day}T10:45:00.000Z`);

      sessions.push({
        startedAt,
        finishedAt,
        exercises,
      });
    }

    return sessions.sort(
      (left, right) => left.startedAt.getTime() - right.startedAt.getTime(),
    );
  }

  private parseCsvRows(csvContent: string): Array<Record<string, string>> {
    const lines = csvContent
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length < 2) {
      throw new ValidationError('CSV must include header and at least one row');
    }

    const headers = this.parseCsvLine(lines[0]);
    const records: Array<Record<string, string>> = [];

    for (const line of lines.slice(1)) {
      const values = this.parseCsvLine(line);
      const record: Record<string, string> = {};

      headers.forEach((header, index) => {
        record[header] = values[index] ?? '';
      });

      records.push(record);
    }

    return records;
  }

  private parseCsvLine(line: string): string[] {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let index = 0; index < line.length; index += 1) {
      const char = line[index];

      if (char === '"') {
        const next = line[index + 1];

        if (inQuotes && next === '"') {
          current += '"';
          index += 1;
          continue;
        }

        inQuotes = !inQuotes;
        continue;
      }

      if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
        continue;
      }

      current += char;
    }

    values.push(current.trim());
    return values;
  }

  private toCsv(
    headers: string[],
    rows: Array<Array<string | number | boolean>>,
  ): string {
    const escapedHeaders = headers.map((header) => this.escapeCsvField(header));
    const contentRows = rows.map((row) =>
      row.map((cell) => this.escapeCsvField(String(cell))).join(','),
    );

    return [escapedHeaders.join(','), ...contentRows].join('\n');
  }

  private escapeCsvField(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }

    return value;
  }

  private normalizeName(name: string): string {
    return name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  private similarity(left: string, right: string): number {
    if (left === right) {
      return 1;
    }

    if (left.length === 0 || right.length === 0) {
      return 0;
    }

    const leftTokens = new Set(left.split(' '));
    const rightTokens = new Set(right.split(' '));

    let intersection = 0;
    for (const token of leftTokens) {
      if (rightTokens.has(token)) {
        intersection += 1;
      }
    }

    const union = new Set([...leftTokens, ...rightTokens]).size;
    return union === 0 ? 0 : intersection / union;
  }

  private clearExpiredPreviews(): void {
    const now = Date.now();

    for (const [key, preview] of this.previewStore.entries()) {
      if (preview.expiresAt.getTime() < now) {
        this.previewStore.delete(key);
      }
    }
  }

  private generatePreviewId(): string {
    return `preview_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  }
}
