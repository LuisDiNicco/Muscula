import { FoodEntity } from '../../domain/entities/food.entity';

export const FOOD_API_CLIENT = 'FOOD_API_CLIENT';

export interface IFoodApiClient {
  search(query: string, page: number, limit: number): Promise<FoodEntity[]>;
  searchByBarcode(barcode: string): Promise<FoodEntity | null>;
}
