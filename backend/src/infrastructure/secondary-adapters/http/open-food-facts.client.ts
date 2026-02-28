import { Injectable } from '@nestjs/common';
import { IFoodApiClient } from '../../../application/interfaces/food-api-client.interface';
import { FoodEntity } from '../../../domain/entities/food.entity';

@Injectable()
export class OpenFoodFactsClient implements IFoodApiClient {
  search(query: string, page: number, limit: number): Promise<FoodEntity[]> {
    void query;
    void page;
    void limit;
    return Promise.resolve([]);
  }

  searchByBarcode(barcode: string): Promise<FoodEntity | null> {
    void barcode;
    return Promise.resolve(null);
  }
}
