export type BodyMetricEntityProps = {
  id: string;
  userId: string;
  date: Date;
  weightKg: number | null;
  bodyFatPercentage: number | null;
  waistCm: number | null;
  chestCm: number | null;
  armCm: number | null;
  thighCm: number | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export class BodyMetricEntity {
  constructor(private readonly props: BodyMetricEntityProps) {}

  get id(): string {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get date(): Date {
    return this.props.date;
  }

  get weightKg(): number | null {
    return this.props.weightKg;
  }
}
