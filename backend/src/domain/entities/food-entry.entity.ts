export type FoodEntryEntityProps = {
  id: string;
  userId: string;
  mealId: string;
  foodId: string | null;
  customFoodName: string | null;
  grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  createdAt: Date;
  updatedAt: Date;
};

export class FoodEntryEntity {
  constructor(private readonly props: FoodEntryEntityProps) {}

  get id(): string {
    return this.props.id;
  }

  get mealId(): string {
    return this.props.mealId;
  }

  get customFoodName(): string | null {
    return this.props.customFoodName;
  }

  get grams(): number {
    return this.props.grams;
  }

  get calories(): number {
    return this.props.calories;
  }

  get protein(): number {
    return this.props.protein;
  }

  get carbs(): number {
    return this.props.carbs;
  }

  get fat(): number {
    return this.props.fat;
  }
}
