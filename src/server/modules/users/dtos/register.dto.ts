import { IsNotEmpty, MinLength, Matches } from "class-validator";

export class RegisterDto {
  @IsNotEmpty()
  @MinLength(2)
  firstName!: string;

  @IsNotEmpty()
  @MinLength(2)
  lastName!: string;

  @Matches(/^\+98\d{10}$/, {
    message: "phone must be in +98XXXXXXXXXX format",
  })
  phone!: string;

  @IsNotEmpty()
  @MinLength(6)
  password!: string;
}
