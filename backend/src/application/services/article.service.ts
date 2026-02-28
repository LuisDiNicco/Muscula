import { Inject, Injectable } from '@nestjs/common';
import {
  ARTICLE_REPOSITORY,
  type IArticleRepository,
  type ArticleDetail,
  type ArticleSummary,
} from '../interfaces/article-repository.interface';
import { ArticleCategory } from '../../domain/enums';
import { EntityNotFoundError } from '../../domain/errors/entity-not-found.error';

@Injectable()
export class ArticleService {
  constructor(
    @Inject(ARTICLE_REPOSITORY)
    private readonly articleRepository: IArticleRepository,
  ) {}

  async listArticles(
    category: ArticleCategory | undefined,
    page: number,
    limit: number,
  ): Promise<{
    data: ArticleSummary[];
    total: number;
    page: number;
    limit: number;
  }> {
    const sanitizedPage = page > 0 ? page : 1;
    const sanitizedLimit = limit > 0 ? Math.min(limit, 100) : 20;

    const result = await this.articleRepository.list(
      category,
      sanitizedPage,
      sanitizedLimit,
    );

    return {
      ...result,
      page: sanitizedPage,
      limit: sanitizedLimit,
    };
  }

  async getArticleDetail(id: string): Promise<ArticleDetail> {
    const article = await this.articleRepository.findById(id);

    if (article === null) {
      throw new EntityNotFoundError('Article', id);
    }

    return article;
  }
}
