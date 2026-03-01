import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRef } from 'react';
import { User } from 'lucide-react';
import { PlayerPositionEnum, ClothingSizesEnum } from '../../domain/player';
import { POSITION_OPTIONS } from '../../domain/player-positions';
import type { Player } from '../../domain/player';
import { useDivisiones } from '../../queries/useDivisiones';
import { useEquipos } from '../../queries/useEquipos';

const addressSchema = z.object({
  street: z.string().max(100).optional(),
  number: z.string().max(20).optional(),
  floor: z.string().max(20).optional(),
  apartment: z.string().max(20).optional(),
  city: z.string().max(80).optional(),
  province: z.string().max(80).optional(),
  postalCode: z.string().max(20).optional(),
  country: z.string().max(80).optional(),
  phoneNumber: z.string().max(30).optional(),
});

const clothingSizesSchema = z.object({
  jersey: z.nativeEnum(ClothingSizesEnum).optional(),
  shorts: z.nativeEnum(ClothingSizesEnum).optional(),
  sweater: z.nativeEnum(ClothingSizesEnum).optional(),
  pants: z.nativeEnum(ClothingSizesEnum).optional(),
});

const playerSchema = z.object({
  idNumber: z.string().min(1, 'El DNI es obligatorio').max(20),
  firstName: z.string().min(1, 'El nombre es obligatorio').max(60),
  lastName: z.string().min(1, 'El apellido es obligatorio').max(60),
  nickName: z.string().max(40).optional(),
  birthDate: z.string().optional(),
  email: z.string().email('Email inválido').max(100),
  position: z.nativeEnum(PlayerPositionEnum, {
    required_error: 'La posición es obligatoria',
  }),
  alternatePosition: z.nativeEnum(PlayerPositionEnum).optional(),
  height: z.number().min(100).max(250).optional(),
  weight: z.number().min(30).max(200).optional(),
  address: addressSchema.optional(),
  clothingSizes: clothingSizesSchema.optional(),
  divisionId: z.string().optional(),
  equipoIds: z.array(z.string()).optional(),
});

export type PlayerFormValues = z.infer<typeof playerSchema>;

interface PlayerFormProps {
  initialData?: Partial<Player>;
  onSubmit: (data: PlayerFormValues, photo?: File) => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

export function PlayerForm({
  initialData,
  onSubmit,
  isSubmitting = false,
  submitLabel = 'Guardar',
}: PlayerFormProps) {
  const photoInputRef = useRef<HTMLInputElement>(null);
  const photoRef = useRef<File | undefined>(undefined);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PlayerFormValues>({
    resolver: zodResolver(playerSchema),
    defaultValues: {
      idNumber: initialData?.idNumber ?? '',
      firstName: initialData?.firstName ?? '',
      lastName: initialData?.lastName ?? '',
      nickName: initialData?.nickName ?? '',
      birthDate: initialData?.birthDate
        ? String(initialData.birthDate).split('T')[0]
        : '',
      email: initialData?.email ?? '',
      position: initialData?.position,
      alternatePosition: initialData?.alternatePosition,
      height: initialData?.height,
      weight: initialData?.weight,
      address: initialData?.address ?? {},
      clothingSizes: initialData?.clothingSizes ?? {},
      divisionId: initialData?.divisionId ?? '',
      equipoIds: initialData?.equipoIds ?? [],
    },
  });

  const selectedDivisionId = watch('divisionId');
  const equipoIdsValue: string[] = watch('equipoIds') ?? [];
  const { data: divisiones = [] } = useDivisiones();
  const { data: equipos = [] } = useEquipos(selectedDivisionId || undefined);

  const toggleEquipo = (id: string) => {
    const current = equipoIdsValue;
    setValue(
      'equipoIds',
      current.includes(id) ? current.filter((e) => e !== id) : [...current, id]
    );
  };

  const handleFormSubmit = (data: PlayerFormValues) => {
    onSubmit(data, photoRef.current);
  };

  const inputClass =
    'w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors bg-surface';
  const labelClass = 'block text-xs font-medium text-muted mb-1';
  const errorClass = 'text-xs text-red-500 mt-1';
  const sectionClass = 'border border-border rounded-xl p-4 space-y-3';

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
      {/* Foto */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-border flex items-center justify-center overflow-hidden">
          {initialData?.photoId ? (
            <img
              src={`${
                import.meta.env.VITE_PS_API_URL || 'http://localhost:3000/api'
              }/players/${initialData._id}/photo`}
              alt="Foto actual"
              className="w-full h-full object-cover"
            />
          ) : (
            <User size={28} className="text-muted" />
          )}
        </div>
        <div>
          <button
            type="button"
            onClick={() => photoInputRef.current?.click()}
            className="text-sm text-interactive hover:underline"
          >
            {initialData?.photoId ? 'Cambiar foto' : 'Subir foto'}
          </button>
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              photoRef.current = e.target.files?.[0];
            }}
          />
        </div>
      </div>

      {/* Datos personales */}
      <div className={sectionClass}>
        <h3 className="text-sm font-semibold text-ink">Datos personales</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>DNI *</label>
            <input {...register('idNumber')} className={inputClass} />
            {errors.idNumber && (
              <p className={errorClass}>{errors.idNumber.message}</p>
            )}
          </div>
          <div>
            <label className={labelClass}>Nombre *</label>
            <input {...register('firstName')} className={inputClass} />
            {errors.firstName && (
              <p className={errorClass}>{errors.firstName.message}</p>
            )}
          </div>
          <div>
            <label className={labelClass}>Apellido *</label>
            <input {...register('lastName')} className={inputClass} />
            {errors.lastName && (
              <p className={errorClass}>{errors.lastName.message}</p>
            )}
          </div>
          <div>
            <label className={labelClass}>Apodo</label>
            <input {...register('nickName')} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Fecha de nacimiento</label>
            <input
              type="date"
              {...register('birthDate')}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Email *</label>
            <input type="email" {...register('email')} className={inputClass} />
            {errors.email && (
              <p className={errorClass}>{errors.email.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Posición */}
      <div className={sectionClass}>
        <h3 className="text-sm font-semibold text-ink">Posición en cancha</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Posición principal *</label>
            <select {...register('position')} className={inputClass}>
              <option value="">Seleccionar...</option>
              {POSITION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {errors.position && (
              <p className={errorClass}>{errors.position.message}</p>
            )}
          </div>
          <div>
            <label className={labelClass}>Posición alternativa</label>
            <select {...register('alternatePosition')} className={inputClass}>
              <option value="">Ninguna</option>
              {POSITION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Físico */}
      <div className={sectionClass}>
        <h3 className="text-sm font-semibold text-ink">Datos físicos</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Altura (cm)</label>
            <input
              type="number"
              min={100}
              max={250}
              {...register('height', {
                setValueAs: (v) =>
                  v === '' || v === null ? undefined : Number(v),
              })}
              className={inputClass}
            />
            {errors.height && (
              <p className={errorClass}>{errors.height.message}</p>
            )}
          </div>
          <div>
            <label className={labelClass}>Peso (kg)</label>
            <input
              type="number"
              min={30}
              max={200}
              {...register('weight', {
                setValueAs: (v) =>
                  v === '' || v === null ? undefined : Number(v),
              })}
              className={inputClass}
            />
            {errors.weight && (
              <p className={errorClass}>{errors.weight.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Dirección */}
      <div className={sectionClass}>
        <h3 className="text-sm font-semibold text-ink">Domicilio</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Calle</label>
            <input {...register('address.street')} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Número</label>
            <input {...register('address.number')} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Piso</label>
            <input {...register('address.floor')} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Departamento</label>
            <input {...register('address.apartment')} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Ciudad</label>
            <input {...register('address.city')} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Provincia</label>
            <input {...register('address.province')} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Código postal</label>
            <input {...register('address.postalCode')} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>País</label>
            <input {...register('address.country')} className={inputClass} />
          </div>
          <div className="col-span-2">
            <label className={labelClass}>Teléfono</label>
            <input
              {...register('address.phoneNumber')}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Talles */}
      <div className={sectionClass}>
        <h3 className="text-sm font-semibold text-ink">
          Talles de indumentaria
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {(['jersey', 'shorts', 'sweater', 'pants'] as const).map((item) => (
            <div key={item}>
              <label className={labelClass}>
                {item === 'jersey'
                  ? 'Camiseta'
                  : item === 'shorts'
                  ? 'Short'
                  : item === 'sweater'
                  ? 'Buzo'
                  : 'Pantalón'}
              </label>
              <select
                {...register(`clothingSizes.${item}`)}
                className={inputClass}
              >
                <option value="">—</option>
                {Object.values(ClothingSizesEnum).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* División y Equipos */}
      <div className={sectionClass}>
        <h3 className="text-sm font-semibold text-ink">División y Equipos</h3>
        <div className="space-y-3">
          <div>
            <label className={labelClass}>División</label>
            <select
              {...register('divisionId')}
              className={inputClass}
              onChange={(e) => {
                register('divisionId').onChange(e);
                setValue('equipoIds', []);
              }}
            >
              <option value="">Sin asignar</option>
              {divisiones.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {selectedDivisionId && (
            <div>
              <label className={labelClass}>Equipos</label>
              {equipos.length === 0 ? (
                <p className="text-xs text-muted">Sin equipos en esta división</p>
              ) : (
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {equipos.map((e) => (
                    <label
                      key={e.id}
                      className="flex items-center gap-2 text-sm text-ink cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={equipoIdsValue.includes(e.id)}
                        onChange={() => toggleEquipo(e.id)}
                        className="rounded border-border accent-primary"
                      />
                      {e.name}
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 rounded-lg bg-primary text-white text-sm font-medium
                     hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed
                     transition-colors"
        >
          {isSubmitting ? 'Guardando...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
