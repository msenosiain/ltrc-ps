import { PartialType } from '@nestjs/mapped-types';
import { AddTransportDto } from './add-transport.dto';

export class UpdateTransportDto extends PartialType(AddTransportDto) {}
