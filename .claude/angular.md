# Angular + Angular Material

## Componentes
- Siempre standalone: `@Component({ standalone: true, imports: [...] })`
- Importar módulos de Angular Material individualmente (MatButtonModule, MatInputModule, etc.)
- Usar signals para estado local: `signal()`, `computed()`, `effect()`

## Formularios
- Preferir Reactive Forms con FormBuilder
- Usar MatFormField con matInput para inputs
- Validar con Validators de Angular

## Theming Material
- Paleta configurada en `styles.scss` con `mat.define-theme()`
- Usar variables CSS de Material: `var(--mat-primary)`

## Estructura de un componente típico
\`\`\`typescript
@Component({
standalone: true,
imports: [MatButtonModule, MatInputModule, ReactiveFormsModule],
template: `...`
})
export class MiComponent {
private fb = inject(FormBuilder);
}
\`\`\`

## Servicios HTTP
- Usar HttpClient con inject()
- Tipar siempre las respuestas
- Manejar errores con catchError
