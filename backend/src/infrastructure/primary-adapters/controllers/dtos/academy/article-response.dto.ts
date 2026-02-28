import { ApiProperty } from '@nestjs/swagger';
import type {
  ArticleDetail,
  ArticleReferenceItem,
  ArticleSummary,
} from '../../../../../application/interfaces/article-repository.interface';
import { ArticleCategory } from '../../../../../domain/enums';

class ArticleReferenceResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ nullable: true })
  doi!: string | null;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  authors!: string;

  @ApiProperty({ nullable: true })
  journal!: string | null;

  @ApiProperty({ nullable: true })
  year!: number | null;

  @ApiProperty({ nullable: true })
  url!: string | null;

  static fromItem(item: ArticleReferenceItem): ArticleReferenceResponseDto {
    return {
      id: item.id,
      doi: item.doi,
      title: item.title,
      authors: item.authors,
      journal: item.journal,
      year: item.year,
      url: item.url,
    };
  }
}

export class ArticleSummaryResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  titleEs!: string;

  @ApiProperty()
  titleEn!: string;

  @ApiProperty()
  summaryEs!: string;

  @ApiProperty()
  summaryEn!: string;

  @ApiProperty({ enum: ArticleCategory })
  category!: ArticleCategory;

  @ApiProperty()
  readTimeMin!: number;

  @ApiProperty({ nullable: true })
  publishedAt!: string | null;

  static fromItem(item: ArticleSummary): ArticleSummaryResponseDto {
    return {
      id: item.id,
      titleEs: item.titleEs,
      titleEn: item.titleEn,
      summaryEs: item.summaryEs,
      summaryEn: item.summaryEn,
      category: item.category,
      readTimeMin: item.readTimeMin,
      publishedAt:
        item.publishedAt === null ? null : item.publishedAt.toISOString(),
    };
  }
}

export class ArticleDetailResponseDto extends ArticleSummaryResponseDto {
  @ApiProperty()
  contentEs!: string;

  @ApiProperty()
  contentEn!: string;

  @ApiProperty({ type: ArticleReferenceResponseDto, isArray: true })
  references!: ArticleReferenceResponseDto[];

  static fromDetail(item: ArticleDetail): ArticleDetailResponseDto {
    return {
      ...ArticleSummaryResponseDto.fromItem(item),
      contentEs: item.contentEs,
      contentEn: item.contentEn,
      references: item.references.map((reference) =>
        ArticleReferenceResponseDto.fromItem(reference),
      ),
    };
  }
}
