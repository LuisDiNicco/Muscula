import type { IFileStorageService } from '../../../src/application/interfaces/file-storage.interface';
import type { IImportExportRepository } from '../../../src/application/interfaces/import-export-repository.interface';
import { ImportExportService } from '../../../src/application/services/import-export.service';

describe('ImportExportService', () => {
  let repository: jest.Mocked<IImportExportRepository>;
  let fileStorageService: jest.Mocked<IFileStorageService>;
  let service: ImportExportService;

  beforeEach(() => {
    repository = {
      getSessionRows: jest.fn().mockResolvedValue([]),
      getNutritionRows: jest.fn().mockResolvedValue([]),
      getBodyMetricRows: jest.fn().mockResolvedValue([]),
      findExerciseCandidatesByNames: jest.fn().mockResolvedValue([
        {
          id: 'exercise-1',
          nameEs: 'Press banca',
          nameEn: 'Bench Press',
        },
      ]),
      createCustomExercise: jest.fn().mockResolvedValue('custom-1'),
      persistImportedSessions: jest.fn().mockResolvedValue(1),
    };

    fileStorageService = {
      upload: jest.fn().mockResolvedValue('exports/user-1/file.zip'),
      getSignedUrl: jest.fn().mockResolvedValue('https://signed-url'),
      delete: jest.fn().mockResolvedValue(undefined),
    };

    service = new ImportExportService(repository, fileStorageService);
  });

  it('exports data bundle and returns signed URL', async () => {
    const result = await service.exportData('user-1');

    expect(result.url).toBe('https://signed-url');
    expect(result.fileName.endsWith('.zip')).toBe(true);
    expect(fileStorageService.upload.mock.calls.length).toBe(1);
  });

  it('creates preview and returns mappings for parsed rows', async () => {
    const csv = [
      'Exercise Name,Date,Weight,Reps',
      'Bench Press,2026-02-28,100,8',
      'Bench Press,2026-02-28,102.5,6',
    ].join('\n');

    const result = await service.previewImport('user-1', 'STRONG', csv);

    expect(result.validRows).toBe(2);
    expect(result.unmappedExercises).toHaveLength(0);
    expect(result.mappings[0]?.mappedExerciseId).toBe('exercise-1');
  });

  it('confirms preview and persists imported sessions', async () => {
    const csv = [
      'Exercise Name,Date,Weight,Reps',
      'Unknown Exercise,2026-02-28,60,10',
    ].join('\n');

    const preview = await service.previewImport('user-1', 'STRONG', csv);
    const result = await service.confirmImport('user-1', preview.previewId, [
      {
        exerciseName: 'Unknown Exercise',
        customName: 'Unknown Exercise',
      },
    ]);

    expect(result.importedSessions).toBe(1);
    expect(result.createdCustomExercises).toBe(1);
    expect(repository.persistImportedSessions.mock.calls.length).toBe(1);
  });
});
