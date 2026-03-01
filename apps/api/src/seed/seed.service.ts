import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { DivisionesService } from '../divisiones/divisiones.service';
import { EquiposService } from '../equipos/equipos.service';
import { EjerciciosService } from '../ejercicios/ejercicios.service';
import { RolEnum } from '@ltrc-ps/shared-api-model';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly usersService: UsersService,
    private readonly divisionesService: DivisionesService,
    private readonly equiposService: EquiposService,
    private readonly ejerciciosService: EjerciciosService,
  ) {}

  async onApplicationBootstrap() {
    await this.seedAdmin();
    await this.seedDivisiones();
    await this.seedEquipos();
    await this.seedCategorias();
    await this.seedEjercicios();
    this.logger.log('✅ Seed completado');
  }

  private async seedAdmin() {
    const email = this.config.get<string>('ADMIN_EMAIL', 'admin@ltrc.com');
    const password = this.config.get<string>('ADMIN_PASSWORD', 'Admin1234!');
    const existing = await this.usersService.findByEmail(email);
    if (!existing) {
      await this.usersService.create({
        email,
        password,
        firstName: 'Admin',
        lastName: 'LTRC',
        rol: RolEnum.ADMIN,
      });
      this.logger.log(`👤 Admin creado: ${email}`);
    }
  }

  private async seedDivisiones() {
    const divisiones = [
      { id: 'ps', name: 'Plantel Superior', order: 1 },
      { id: 'm19', name: 'M19', order: 2 },
      { id: 'm18', name: 'M18', order: 3 },
      { id: 'm17', name: 'M17', order: 4 },
      { id: 'm16', name: 'M16', order: 5 },
      { id: 'm15', name: 'M15', order: 6 },
      { id: 'm14', name: 'M14', order: 7 },
    ];
    for (const div of divisiones) {
      await this.divisionesService.upsert(div);
    }
    this.logger.log('🏉 Divisiones sembradas');
  }

  private async seedEquipos() {
    const equipos = [
      { id: 'ps-primera', name: 'Primera', divisionId: 'ps', order: 1 },
      { id: 'ps-intermedia', name: 'Intermedia', divisionId: 'ps', order: 2 },
      { id: 'ps-pre-a', name: 'Preintermedia A', divisionId: 'ps', order: 3 },
      { id: 'ps-pre-b', name: 'Preintermedia B', divisionId: 'ps', order: 4 },
      { id: 'm19-a', name: 'Equipo A', divisionId: 'm19', order: 1 },
      { id: 'm19-b', name: 'Equipo B', divisionId: 'm19', order: 2 },
      { id: 'm18-a', name: 'Equipo A', divisionId: 'm18', order: 1 },
      { id: 'm18-b', name: 'Equipo B', divisionId: 'm18', order: 2 },
      { id: 'm17-a', name: 'Equipo A', divisionId: 'm17', order: 1 },
      { id: 'm17-b', name: 'Equipo B', divisionId: 'm17', order: 2 },
      { id: 'm16-a', name: 'Equipo A', divisionId: 'm16', order: 1 },
      { id: 'm16-b', name: 'Equipo B', divisionId: 'm16', order: 2 },
      { id: 'm15-a', name: 'Equipo A', divisionId: 'm15', order: 1 },
      { id: 'm15-b', name: 'Equipo B', divisionId: 'm15', order: 2 },
      { id: 'm14-a', name: 'Equipo A', divisionId: 'm14', order: 1 },
      { id: 'm14-b', name: 'Equipo B', divisionId: 'm14', order: 2 },
    ];
    for (const eq of equipos) {
      await this.equiposService.upsert(eq);
    }
    this.logger.log('👥 Equipos sembrados');
  }

  private async seedCategorias() {
    const categorias = [
      {
        id: 'ruck', name: 'Ruck', order: 1,
        subcategorias: [
          { id: 'limpieza', label: 'Limpieza' },
          { id: 'llegada', label: 'Llegada al ruck' },
          { id: 'post-contacto', label: 'Post contacto' },
        ],
      },
      {
        id: 'ataque', name: 'Ataque', order: 2,
        subcategorias: [
          { id: 'pases', label: 'Pases' },
          { id: 'continuidad', label: 'Continuidad' },
          { id: 'finalizacion', label: 'Finalización' },
        ],
      },
      {
        id: 'defensa', name: 'Defensa', order: 3,
        subcategorias: [
          { id: 'marca', label: 'Marca' },
          { id: 'linea', label: 'Línea defensiva' },
          { id: 'repliegue', label: 'Repliegue' },
        ],
      },
      {
        id: 'fisico', name: 'Fisico', order: 4,
        subcategorias: [
          { id: 'resistencia', label: 'Resistencia' },
          { id: 'sprint', label: 'Sprint' },
        ],
      },
      {
        id: 'lineout', name: 'Line Out', order: 5,
        subcategorias: [
          { id: 'lanzamiento', label: 'Lanzamiento' },
          { id: 'salto', label: 'Salto' },
          { id: 'maul', label: 'Maul' },
        ],
      },
      {
        id: 'scrum', name: 'Scrum', order: 6,
        subcategorias: [
          { id: 'empuje', label: 'Empuje' },
          { id: 'coordinacion', label: 'Coordinación' },
          { id: 'salida', label: 'Salida de scrum' },
        ],
      },
      {
        id: 'kicking', name: 'Kicking', order: 7,
        subcategorias: [
          { id: 'patada', label: 'Patada' },
          { id: 'recepcion', label: 'Recepción' },
          { id: 'presion', label: 'Presión' },
        ],
      },
    ];
    for (const cat of categorias) {
      await this.ejerciciosService.upsertCategoria(cat);
    }
    this.logger.log('📂 Categorías sembradas');
  }

  private async seedEjercicios() {
    const adminUser = await this.usersService.findByEmail(
      this.config.get<string>('ADMIN_EMAIL', 'admin@ltrc.com'),
    );
    if (!adminUser) return;

    const ejercicios = [
      {
        titulo: 'Ataque en continuidad',
        descripcion: 'Secuencia de pases tras contacto manteniendo velocidad. Toma de decisiones.',
        categoriaId: 'ataque',
        subcategoriaId: 'continuidad',
        videoUrl: 'https://drive.google.com/file/d/1tO2epI7jmY3db8uRVmRcocKBEvu4783l/view?usp=drive_link',
      },
      {
        titulo: 'Subida en línea',
        descripcion: 'Coordinación defensiva y presión conjunta.',
        categoriaId: 'defensa',
        subcategoriaId: 'linea',
        videoUrl: 'https://drive.google.com/file/d/116NqVmmbu5b0Bpz1THfXKe0C_03IFyqD/view?usp=drive_link',
      },
      {
        titulo: 'Defensa real',
        descripcion: 'Situacion real de partido. Ejercicio pensado para hacer foco en correr y experimentar situaciones del partido.',
        categoriaId: 'defensa',
        subcategoriaId: 'marca',
        videoUrl: 'https://drive.google.com/file/d/1l1sMj13Z6YATasD9EjRhbv5Co_Fefplp/view?usp=drive_link',
      },
      {
        titulo: 'Limpieza efectiva',
        descripcion: 'Ingreso bajo y fuerte al ruck.',
        categoriaId: 'ruck',
        subcategoriaId: 'limpieza',
        videoUrl: 'https://drive.google.com/file/d/1r2YeMSaKKuUoXpx5RP3N9fMH5OJJOPdX/view?usp=drive_link',
      },
      {
        titulo: 'Orden/Presion/Reposicion',
        descripcion: '1ro:Armar la pared.2do:Salir con el Canto Arriba.3ro: Velocidad de llegada al punto de contacto. 4to: Reposicion',
        categoriaId: 'ruck',
        subcategoriaId: 'llegada',
        videoUrl: 'https://drive.google.com/file/d/1DXE_6aKfkiLfer9KD15kvw3pykyItngA/view?usp=drive_link',
      },
      {
        titulo: 'Coordinacion. Resistencia',
        descripcion: '',
        categoriaId: 'fisico',
        subcategoriaId: 'resistencia',
        videoUrl: 'https://drive.google.com/file/d/1e_Py22iIN1yUZ6mghKi5vutTDyf_4iMU/view?usp=drive_link',
      },
      {
        titulo: 'Sprints. Rehubicacion',
        descripcion: '',
        categoriaId: 'fisico',
        subcategoriaId: 'sprint',
        videoUrl: 'https://drive.google.com/file/d/1L4IVwrQwcX8FpBTx8JxFv_Tk-SP_e1vL/view?usp=drive_link',
      },
      {
        titulo: 'Timing de salto',
        descripcion: 'Coordinación entre lanzador y saltador.',
        categoriaId: 'lineout',
        subcategoriaId: 'salto',
        videoUrl: 'https://drive.google.com/file/d/1r2YeMSaKKuUoXpx5RP3N9fMH5OJJOPdX/view?usp=drive_link',
      },
      {
        titulo: 'Empuje coordinado',
        descripcion: 'Trabajo de potencia y timing.',
        categoriaId: 'scrum',
        subcategoriaId: 'empuje',
        videoUrl: 'https://drive.google.com/file/d/1r2YeMSaKKuUoXpx5RP3N9fMH5OJJOPdX/view?usp=drive_link',
      },
      {
        titulo: 'Patada táctica',
        descripcion: 'Uso del espacio y presión posterior.',
        categoriaId: 'kicking',
        subcategoriaId: 'patada',
        videoUrl: 'https://drive.google.com/file/d/1r2YeMSaKKuUoXpx5RP3N9fMH5OJJOPdX/view?usp=drive_link',
      },
    ];

    for (const ej of ejercicios) {
      await this.ejerciciosService.upsertEjercicio(ej, adminUser._id.toString());
    }
    this.logger.log('💪 Ejercicios sembrados');
  }
}
