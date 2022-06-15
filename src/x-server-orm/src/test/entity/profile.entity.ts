import { IsOptional, IsString, Length } from 'class-validator';

export class Profile {
  @Length(5, 20)
  name: string;

  @IsString()
  @IsOptional()
  desc: string;
}
