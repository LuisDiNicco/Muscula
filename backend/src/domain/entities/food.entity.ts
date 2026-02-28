import { FoodSource } from '../enums';

export type FoodEntityProps = {
  id: string;
  name: string;
  brand: string | null;
  barcode: string | null;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  source: FoodSource;
  createdByUserId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export class FoodEntity {
  constructor(private readonly props: FoodEntityProps) {}

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get brand(): string | null {
    return this.props.brand;
  }

  get source(): FoodSource {
    return this.props.source;
  }

  getMacrosForGrams(grams: number): {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  } {
    const ratio = grams / 100;

    return {
      calories: Number((this.props.caloriesPer100g * ratio).toFixed(1)),
      protein: Number((this.props.proteinPer100g * ratio).toFixed(1)),
      carbs: Number((this.props.carbsPer100g * ratio).toFixed(1)),
      fat: Number((this.props.fatPer100g * ratio).toFixed(1)),
    };
  }
}
