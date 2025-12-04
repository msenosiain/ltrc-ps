import { IsMongoId } from 'class-validator';

export class FindByIdParams {
  @IsMongoId()
  id: string;
}
