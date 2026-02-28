import { ArticleService } from '../../../src/application/services/article.service';
import type { IArticleRepository } from '../../../src/application/interfaces/article-repository.interface';
import { ArticleCategory } from '../../../src/domain/enums';
import { EntityNotFoundError } from '../../../src/domain/errors/entity-not-found.error';

describe('ArticleService', () => {
  const articleRepository: jest.Mocked<IArticleRepository> = {
    list: jest.fn(),
    findById: jest.fn(),
  };

  let service: ArticleService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ArticleService(articleRepository);
  });

  it('listArticles sanitizes pagination and returns repository data', async () => {
    articleRepository.list.mockResolvedValue({
      data: [],
      total: 0,
    });

    await service.listArticles(ArticleCategory.TRAINING, -3, 500);

    expect(articleRepository.list.mock.calls[0]).toEqual([
      ArticleCategory.TRAINING,
      1,
      100,
    ]);
  });

  it('getArticleDetail returns detail when article exists', async () => {
    articleRepository.findById.mockResolvedValue({
      id: 'article-1',
      titleEs: 'Artículo',
      titleEn: 'Article',
      summaryEs: 'Resumen',
      summaryEn: 'Summary',
      contentEs: 'Contenido',
      contentEn: 'Content',
      category: ArticleCategory.FUNDAMENTALS,
      readTimeMin: 6,
      publishedAt: new Date('2026-02-28T00:00:00.000Z'),
      references: [],
    });

    await expect(service.getArticleDetail('article-1')).resolves.toMatchObject({
      id: 'article-1',
      category: ArticleCategory.FUNDAMENTALS,
    });
  });

  it('getArticleDetail throws when article does not exist', async () => {
    articleRepository.findById.mockResolvedValue(null);

    await expect(
      service.getArticleDetail('missing-article'),
    ).rejects.toBeInstanceOf(EntityNotFoundError);
  });
});
