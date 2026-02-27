import { MesocycleStatus, TrainingObjective } from '../enums';
import { TrainingDayEntity } from './training-day.entity';

export type MesocycleEntityProps = {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  durationWeeks: number;
  objective: TrainingObjective;
  includeDeload: boolean;
  status: MesocycleStatus;
  startedAt: Date | null;
  completedAt: Date | null;
  deletedAt: Date | null;
  trainingDays: TrainingDayEntity[];
  createdAt: Date;
  updatedAt: Date;
};

export class MesocycleEntity {
  constructor(private readonly props: MesocycleEntityProps) {}

  get id(): string {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string | null {
    return this.props.description;
  }

  get durationWeeks(): number {
    return this.props.durationWeeks;
  }

  get objective(): TrainingObjective {
    return this.props.objective;
  }

  get includeDeload(): boolean {
    return this.props.includeDeload;
  }

  get status(): MesocycleStatus {
    return this.props.status;
  }

  get startedAt(): Date | null {
    return this.props.startedAt;
  }

  get completedAt(): Date | null {
    return this.props.completedAt;
  }

  get trainingDays(): TrainingDayEntity[] {
    return this.props.trainingDays;
  }

  isDraft(): boolean {
    return this.props.status === MesocycleStatus.DRAFT;
  }

  isActive(): boolean {
    return this.props.status === MesocycleStatus.ACTIVE;
  }

  canActivate(): boolean {
    return this.isDraft() && this.props.deletedAt === null;
  }

  canComplete(): boolean {
    return this.isActive() && this.props.deletedAt === null;
  }
}
