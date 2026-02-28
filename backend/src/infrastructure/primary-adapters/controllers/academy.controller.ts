import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ArticleService } from '../../../application/services/article.service';
import {
  ArticleDetailResponseDto,
  ArticleSummaryResponseDto,
} from './dtos/academy/article-response.dto';
import { ListArticlesQueryDto } from './dtos/academy/list-articles-query.dto';

@ApiTags('Academy')
@Controller('academy')
export class AcademyController {
  constructor(private readonly articleService: ArticleService) {}

  @Get('articles')
  @ApiOperation({ summary: 'List published academy articles' })
  @ApiResponse({ status: 200 })
  async listArticles(@Query() query: ListArticlesQueryDto): Promise<{
    data: ArticleSummaryResponseDto[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const result = await this.articleService.listArticles(
      query.category,
      query.page ?? 1,
      query.limit ?? 20,
    );

    return {
      data: result.data.map((article) =>
        ArticleSummaryResponseDto.fromItem(article),
      ),
      meta: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: Math.max(1, Math.ceil(result.total / result.limit)),
      },
    };
  }

  @Get('articles/:id')
  @ApiOperation({ summary: 'Get academy article detail with references' })
  @ApiResponse({ status: 200, type: ArticleDetailResponseDto })
  async getArticleDetail(
    @Param('id') id: string,
  ): Promise<ArticleDetailResponseDto> {
    const detail = await this.articleService.getArticleDetail(id);
    return ArticleDetailResponseDto.fromDetail(detail);
  }
}
