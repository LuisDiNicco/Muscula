import { ValidationError } from '../errors/validation.error';

export type ReadinessScoreEntityProps = {
  id: string;
  userId: string;
  sessionId: string;
  sleepScore: number;
  stressScore: number;
  domsScore: number;
  totalScore: number;
  createdAt: Date;
};

export class ReadinessScoreEntity {
  constructor(private readonly props: ReadinessScoreEntityProps) {}

  get totalScore(): number {
    return this.props.totalScore;
  }

  calculateTotal(): number {
    this.assertScoreRange(this.props.sleepScore, 'sleepScore');
    this.assertScoreRange(this.props.stressScore, 'stressScore');
    this.assertScoreRange(this.props.domsScore, 'domsScore');

    const total =
      this.props.sleepScore * 0.4 +
      this.props.stressScore * 0.3 +
      this.props.domsScore * 0.3;

    this.props.totalScore = Number(total.toFixed(2));

    return this.props.totalScore;
  }

  getAdjustmentFactor(): number {
    const total =
      this.props.totalScore > 0 ? this.props.totalScore : this.calculateTotal();

    if (total < 2.5) {
      return 0.95;
    }

    return 1;
  }

  private assertScoreRange(value: number, field: string): void {
    if (value < 1 || value > 5) {
      throw new ValidationError(`${field} must be between 1 and 5`);
    }
  }
}
