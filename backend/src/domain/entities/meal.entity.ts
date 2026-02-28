import { MealType } from '../enums';

export type MealEntityProps = {
  id: string;
  userId: string;
  date: Date;
  mealType: MealType;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export class MealEntity {
  constructor(private readonly props: MealEntityProps) {}

  get id(): string {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get date(): Date {
    return this.props.date;
  }

  get mealType(): MealType {
    return this.props.mealType;
  }
}
