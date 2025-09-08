import { CreateFaqDto } from "../dtos/faq.dto";
import { faqCategory } from "../enums/faqCategory.enum";
import { FAQRepository } from "../repositories/faq.repository";

export class FAQService {
  constructor(private readonly faqs: FAQRepository) {}

  async create(dto: CreateFaqDto) {
    try {
      const faq = this.faqs.create(dto);
      return faq;
    } catch (err) {
      console.log(err);
      return err;
    }
  }

  async find(category: faqCategory, page: number) {
    try {
      const skip = (page - 1) * 10;

      const results = this.faqs.find({
        where: { category: category },
        skip,
        take: 10,
      });
      return results;
    } catch (err) {
      console.log(err);
      return err;
    }
  }

  async remove(id: string) {
    try {
      const result = await this.faqs.deleteAll(id);
      if (result === 0) {
        throw new Error("FAQ not found");
      }
      return result;
    } catch (err) {
      console.log(err);
      return err;
    }
  }
}
