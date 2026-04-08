# NestJS

## Arquitectura
- Un módulo por feature (UsersModule, AuthModule, etc.)
- Cada módulo: controller + service + dto + schema

## DTOs
- Siempre usar class-validator: @IsString(), @IsEmail(), @IsNotEmpty()
- DTOs separados: CreateXxxDto, UpdateXxxDto

## Seguridad (main.ts)
- helmet() para headers
- ValidationPipe global con whitelist: true, transform: true
- CORS configurado explícitamente

## Mongoose
- Schemas con @Schema() y @Prop()
- InjectModel(Model.name) en los servicios
- Tipar documentos: Document & MiInterface
