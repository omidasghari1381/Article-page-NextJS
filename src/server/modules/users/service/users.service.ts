import { RegisterDto } from "../dtos/register.dto";
import { UserRepository } from "../repositories/user.repository";
import * as bcrypt from "bcryptjs";

export class UsersService {
  constructor(private readonly users: UserRepository) {}

  private normalizePhoneToE164Iran(input: string): string {
    const v = String(input).trim();
    if (/^\+98\d{10}$/.test(v)) return v;
    if (/^0098\d{10}$/.test(v)) return "+" + v.slice(2);
    if (/^0?9\d{9}$/.test(v)) return "+98" + v.replace(/^0/, "");
    throw new Error("Invalid Iranian phone");
  }

  async register(dto: RegisterDto) {
    const phone = this.normalizePhoneToE164Iran(dto.phone);

    const exists = await this.users.findByPhone(phone);
    if (exists) {
      return { status: 409, message: "Phone already registered" };
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.users.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone,
      passwordHash,
    });

    // برای امنیت، هش را به کلاینت برنگردان
    const { passwordHash: _, ...safe } = user as any;
    return { status: 201, data: safe };
  }
}
