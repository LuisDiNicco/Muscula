import { ArticleCategory } from '../../domain/enums';

export const ARTICLE_REPOSITORY = 'ARTICLE_REPOSITORY';

export type ArticleSummary = {
  id: string;
  titleEs: string;
  titleEn: string;
  summaryEs: string;
  summaryEn: string;
  category: ArticleCategory;
  readTimeMin: number;
  publishedAt: Date | null;
};

export type ArticleReferenceItem = {
  id: string;
  doi: string | null;
  title: string;
  authors: string;
  journal: string | null;
  year: number | null;
  url: string | null;
};

export type ArticleDetail = ArticleSummary & {
  contentEs: string;
  contentEn: string;
  references: ArticleReferenceItem[];
};

export interface IArticleRepository {
  list(
    category: ArticleCategory | undefined,
    page: number,
    limit: number,
  ): Promise<{ data: ArticleSummary[]; total: number }>;
  findById(id: string): Promise<ArticleDetail | null>;
}
