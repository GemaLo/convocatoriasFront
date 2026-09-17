export interface StatusData {
    id: number;
    status: string;
}

export interface NinoData {
    idRegister: number;
    curpMenor: string;
    edad: number;
    idstatus: number;
    estatus: string;
    convocatoria: string;
    curpPdf: string | null;
    actaPdf: string | null;
    observaciones?: string;
}

export interface CandidatoGroup {
    idCandidato: number;
    nombre_trabajador: string;
    num_empleado: string;
    unit?: string;
    unidad?: string;
    gender?: string;
    rfc: string;
    curp: string;
    folio_registro: string;
    total_hijos: number;
    ninos: NinoData[];
}

export interface ColumnFilters {
    folio: string;
    nombre: string;
    numEmpleado: string;
    unidad: string;
    gender: string;
    curp: string;
    rfc: string;
}