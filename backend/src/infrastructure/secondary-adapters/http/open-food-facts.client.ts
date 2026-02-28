import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IFoodApiClient } from '../../../application/interfaces/food-api-client.interface';
import { FoodEntity } from '../../../domain/entities/food.entity';
import { FoodSource } from '../../../domain/enums';

@Injectable()
export class OpenFoodFactsClient implements IFoodApiClient {
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl =
      this.configService.get<string>('OPEN_FOOD_FACTS_BASE_URL') ??
      'https://world.openfoodfacts.org';
  }

  async search(
    query: string,
    page: number,
    limit: number,
  ): Promise<FoodEntity[]> {
    const url = new URL('/cgi/search.pl', this.baseUrl);
    url.searchParams.set('search_terms', query);
    url.searchParams.set('search_simple', '1');
    url.searchParams.set('action', 'process');
    url.searchParams.set('json', '1');
    url.searchParams.set('page', String(page));
    url.searchParams.set('page_size', String(limit));

    const response = await fetch(url.toString());
    if (!response.ok) {
      return [];
    }

    const body = (await response.json()) as {
      products?: Array<Record<string, unknown>>;
    };

    return (body.products ?? [])
      .map((product) => this.mapProduct(product))
      .filter((food): food is FoodEntity => food !== null);
  }

  async searchByBarcode(barcode: string): Promise<FoodEntity | null> {
    const normalized = barcode.trim();
    if (normalized.length === 0) {
      return null;
    }

    const url = new URL(
      `/api/v2/product/${encodeURIComponent(normalized)}.json`,
      this.baseUrl,
    );

    const response = await fetch(url.toString());
    if (!response.ok) {
      return null;
    }

    const body = (await response.json()) as {
      product?: Record<string, unknown>;
    };

    if (body.product === undefined) {
      return null;
    }

    return this.mapProduct(body.product);
  }

  private mapProduct(product: Record<string, unknown>): FoodEntity | null {
    const name =
      this.asString(product.product_name) ??
      this.asString(product.product_name_es);
    if (name === null || name.trim().length === 0) {
      return null;
    }

    const barcode = this.asString(product.code);
    const brand = this.asString(product.brands);

    const nutriments =
      typeof product.nutriments === 'object' &&
      product.nutriments !== null &&
      !Array.isArray(product.nutriments)
        ? (product.nutriments as Record<string, unknown>)
        : undefined;

    if (nutriments === undefined) {
      return null;
    }

    const caloriesPer100g =
      this.asNumber(nutriments['energy-kcal_100g']) ??
      this.asNumber(nutriments['energy-kcal']) ??
      this.asNumber(nutriments['energy-kcal_value']);
    const proteinPer100g = this.asNumber(nutriments.proteins_100g);
    const carbsPer100g = this.asNumber(nutriments.carbohydrates_100g);
    const fatPer100g = this.asNumber(nutriments.fat_100g);

    if (
      caloriesPer100g === null ||
      proteinPer100g === null ||
      carbsPer100g === null ||
      fatPer100g === null ||
      caloriesPer100g < 0 ||
      proteinPer100g < 0 ||
      carbsPer100g < 0 ||
      fatPer100g < 0
    ) {
      return null;
    }

    const now = new Date();

    return new FoodEntity({
      id: barcode ?? `off-${this.slugify(name)}`,
      name,
      brand,
      barcode,
      caloriesPer100g,
      proteinPer100g,
      carbsPer100g,
      fatPer100g,
      source: FoodSource.OPEN_FOOD_FACTS,
      createdByUserId: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  private asString(value: unknown): string | null {
    return typeof value === 'string' && value.trim().length > 0
      ? value.trim()
      : null;
  }

  private asNumber(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return Number(value.toFixed(2));
    }

    if (typeof value === 'string') {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return Number(parsed.toFixed(2));
      }
    }

    return null;
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[^\p{L}\p{N}\s-]/gu, '')
      .trim()
      .replace(/\s+/g, '-')
      .slice(0, 64);
  }
}
