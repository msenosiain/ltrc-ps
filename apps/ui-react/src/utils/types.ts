// types/ejercicio.ts
export interface SubCategoria {
    id: string;
    label: string;
  }
  
  export interface Ejercicio {
    id: string;
    titulo: string;
    descripcion: string;
    subcategoria: string;
    video: string
  }
  