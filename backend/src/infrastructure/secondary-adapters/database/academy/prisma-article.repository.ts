import { Injectable } from '@nestjs/common';
import {
  type ArticleDetail,
  type ArticleSummary,
  IArticleRepository,
} from '../../../../application/interfaces/article-repository.interface';
import { ArticleCategory } from '../../../../domain/enums';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaArticleRepository implements IArticleRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async list(
    category: ArticleCategory | undefined,
    page: number,
    limit: number,
  ): Promise<{ data: ArticleSummary[]; total: number }> {
    const where = {
      category,
      publishedAt: {
        not: null,
      },
    };

    const [rows, total] = await Promise.all([
      this.prismaService.article.findMany({
        where,
        orderBy: [
          {
            publishedAt: 'desc',
          },
          {
            createdAt: 'desc',
          },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prismaService.article.count({ where }),
    ]);

    return {
      data: rows.map((row) => ({
        id: row.id,
        titleEs: row.titleEs,
        titleEn: row.titleEn,
        summaryEs: row.summaryEs,
        summaryEn: row.summaryEn,
        category: row.category as ArticleCategory,
        readTimeMin: row.readTimeMin,
        publishedAt: row.publishedAt,
      })),
      total,
    };
  }

  async findById(id: string): Promise<ArticleDetail | null> {
    const row = await this.prismaService.article.findFirst({
      where: {
        id,
        publishedAt: {
          not: null,
        },
      },
      include: {
        references: true,
      },
    });

    if (row === null) {
      return null;
    }

    return {
      id: row.id,
      titleEs: row.titleEs,
      titleEn: row.titleEn,
      summaryEs: row.summaryEs,
      summaryEn: row.summaryEn,
      contentEs: row.contentEs,
      contentEn: row.contentEn,
      category: row.category as ArticleCategory,
      readTimeMin: row.readTimeMin,
      publishedAt: row.publishedAt,
      references: row.references.map((reference) => ({
        id: reference.id,
        doi: reference.doi,
        title: reference.title,
        authors: reference.authors,
        journal: reference.journal,
        year: reference.year,
        url: reference.url,
      })),
    };
  }
}
