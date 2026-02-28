import { RoutineSharingService } from '../../../src/application/services/routine-sharing.service';
import { TrainingObjective } from '../../../src/domain/enums';
import { EntityNotFoundError } from '../../../src/domain/errors/entity-not-found.error';
import { ValidationError } from '../../../src/domain/errors/validation.error';

describe('RoutineSharingService', () => {
  const sharingRepository = {
    codeExists: jest.fn(),
    createShare: jest.fn(),
    getPreviewByCode: jest.fn(),
    incrementViewCount: jest.fn(),
    importByCode: jest.fn(),
  };

  let service: RoutineSharingService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new RoutineSharingService(sharingRepository);
  });

  it('generateShareCode creates a share with generated code and expiration', async () => {
    sharingRepository.codeExists.mockResolvedValue(false);
    sharingRepository.createShare.mockImplementation(
      (
        _userId: string,
        _mesocycleId: string,
        code: string,
        expiresAt: Date,
      ) => ({ code, expiresAt }),
    );

    const result = await service.generateShareCode('user-1', 'mesocycle-1');

    expect(result.code).toMatch(/^MUSC-[A-Z2-9]{6}$/);
    expect(sharingRepository.createShare).toHaveBeenCalledWith(
      'user-1',
      'mesocycle-1',
      expect.stringMatching(/^MUSC-[A-Z2-9]{6}$/),
      expect.any(Date),
    );
  });

  it('generateShareCode retries when code already exists', async () => {
    sharingRepository.codeExists
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false);
    sharingRepository.createShare.mockImplementation(
      (
        _userId: string,
        _mesocycleId: string,
        code: string,
        expiresAt: Date,
      ) => ({ code, expiresAt }),
    );

    await service.generateShareCode('user-1', 'mesocycle-1');

    expect(sharingRepository.codeExists).toHaveBeenCalledTimes(3);
    expect(sharingRepository.createShare).toHaveBeenCalledTimes(1);
  });

  it('generateShareCode throws ValidationError after max attempts', async () => {
    sharingRepository.codeExists.mockResolvedValue(true);

    await expect(
      service.generateShareCode('user-1', 'mesocycle-1'),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it('getSharedRoutine normalizes code and increments views', async () => {
    sharingRepository.getPreviewByCode.mockResolvedValue({
      code: 'MUSC-ABC123',
      expiresAt: new Date('2026-03-30T00:00:00.000Z'),
      viewCount: 4,
      mesocycle: {
        id: 'mesocycle-1',
        name: 'Plan base',
        description: null,
        durationWeeks: 8,
        objective: TrainingObjective.HYPERTROPHY,
        includeDeload: true,
        trainingDays: [],
      },
    });

    const result = await service.getSharedRoutine('musc-abc123');

    expect(sharingRepository.getPreviewByCode).toHaveBeenCalledWith(
      'MUSC-ABC123',
    );
    expect(sharingRepository.incrementViewCount).toHaveBeenCalledWith(
      'MUSC-ABC123',
    );
    expect(result.viewCount).toBe(5);
  });

  it('getSharedRoutine throws when code is not found', async () => {
    sharingRepository.getPreviewByCode.mockResolvedValue(null);

    await expect(
      service.getSharedRoutine('musc-missing'),
    ).rejects.toBeInstanceOf(EntityNotFoundError);
  });

  it('importSharedRoutine normalizes code before importing', async () => {
    sharingRepository.importByCode.mockResolvedValue({
      mesocycleId: 'imported-1',
      name: 'Plan importado',
    });

    const result = await service.importSharedRoutine('user-1', 'musc-xy7z9q');

    expect(sharingRepository.importByCode).toHaveBeenCalledWith(
      'user-1',
      'MUSC-XY7Z9Q',
    );
    expect(result.mesocycleId).toBe('imported-1');
  });
});
