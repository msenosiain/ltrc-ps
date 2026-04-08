# MongoDB con Mongoose en NestJS

## Schema típico
\`\`\`typescript
@Schema({ timestamps: true })
export class User {
@Prop({ required: true }) name: string;
@Prop({ required: true, unique: true }) email: string;
}
export const UserSchema = SchemaFactory.createForClass(User);
\`\`\`

## En el módulo
MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])

## Queries comunes
- find(), findById(), findOne(), create(), findByIdAndUpdate()
- Usar .lean() para performance en lecturas
- populate() para referencias entre colecciones

## Variables de entorno
MONGODB_URI=mongodb://localhost:27017/mi-db
