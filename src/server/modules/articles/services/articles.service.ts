import { ArticleRepository } from "../repository/article.repository";
import { CreateArticleDto } from "../dto/createArticle.dto";
import { UploadsService } from "../../uploads/services/uploads.service";

export class ArticlesService {
  constructor(
    private readonly articleRepo: ArticleRepository,
    private readonly uploadsService: UploadsService
  ) {}
  //=================================================================================================
  createArticle = async (
    createArticleDto: CreateArticleDto,
    thumbnail?: string
  ) => {
    try {
      const article = await this.articleRepo.create({
        ...createArticleDto,
        thumbnail,
      });
      return { status: 200, data: article };
    } catch (err) {
      console.error(err);
      throw new Error("Failed to create article");
    }
  };
  //=================================================================================================
  getArticle = async (page: number, id?: string) => {
    try {
      if (id) {
        const article = await this.articleRepo.findOne({ where: { id } });
        return { status: 200, data: article };
      }
      const skip = (page - 1) * 10;
      const articles = await this.articleRepo.find({
        order: { createdAt: "DESC" },
        skip,
        take: 10,
      });
      return { status: 200, data: articles };
    } catch (err) {
      console.error(err);
      throw new Error("Failed to get articles");
    }
  };
  //=================================================================================================
  deleteArticle = async (id: string) => {
    try {
      const article = await this.articleRepo.findOne({ where: { id } });
      if ((article as any).image?.length) {
        this.uploadsService.deleteFiles((article as any).image);
      }
      if ((article as any).video?.length) {
        this.uploadsService.deleteFiles((article as any).video);
      }
      await this.articleRepo.deleteAll({ id });

      return { status: 200, message: "article got removed", data: article };
    } catch (err) {
      console.error(err);
      throw new Error("Failed to delete article");
    }
  };
}
