import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../config/api';

export interface MenorData {
  id: string;
  curpMenor: string;
  edad: string;
  fileCurp: File | null;
  fileActa: File | null;
}

export interface Convocatoria {
  id: number;
  titulo?: string;
  activo?: number | string | boolean;
}

const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const useRegisterForm = () => {
  const EDAD_MAXIMA_PERMITIDA = 12;

  const [convocatoriaActiva, setConvocatoriaActiva] = useState<Convocatoria | null>(null);
  const [checkingConvocatoria, setCheckingConvocatoria] = useState<boolean>(true);

  const [formData, setFormData] = useState({
    numeroEmpleado: '',
    cargo: '',
    fechaIngreso: '',
    nomPersona: '',
    appPersona: '',
    apmPersona: '',
    curp: '',
    rfc: '',
    telefono: '',
    correoC: '',
    servidor: '@gmail.com'
  });

  const [menores, setMenores] = useState<MenorData[]>([
    { id: generateUUID(), curpMenor: '', edad: '', fileCurp: null, fileActa: null }
  ]);

  const [isFetched, setIsFetched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const [constanciaData, setConstanciaData] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const checkConvocatoria = async () => {
      try {
        const res = await fetch(`${API_ENDPOINTS.MAIN}/calls/activa`);
        const responseData = await res.json();

        console.log("Respuesta API Convocatoria:", responseData);

        if (!res.ok) {
          setConvocatoriaActiva(null);
          return;
        }

        const rawConv = Array.isArray(responseData) 
          ? responseData[0] 
          : (responseData.data || responseData.convocatoria || responseData);

        if (!rawConv) {
          setConvocatoriaActiva(null);
          return;
        }

        const id = rawConv.IDCALL ?? rawConv.idcall ?? rawConv.id;
        const titulo = rawConv.NAMECALL ?? rawConv.namecall ?? rawConv.titulo ?? rawConv.nombre;
        const activoRaw = rawConv.ACTIVO ?? rawConv.activo;

        const isActivo = activoRaw === 1 || activoRaw === "1" || activoRaw === true;

        if (isActivo && id !== undefined) {
          setConvocatoriaActiva({
            id: Number(id),
            titulo: titulo || '',
            activo: 1
          });
        } else {
          setConvocatoriaActiva(null);
        }
      } catch (error) {
        console.error("Error al consultar convocatoria:", error);
        setConvocatoriaActiva(null);
      } finally {
        setCheckingConvocatoria(false);
      }
    };

    checkConvocatoria();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRfcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, rfc: e.target.value.toUpperCase() }));
  };

  const calcularEdadDesdeCurp = (curp: string): string => {
    if (curp.length < 10) return '';
    const yearTwoDigits = parseInt(curp.substring(4, 6), 10);
    const monthNum = parseInt(curp.substring(6, 8), 10) - 1;
    const dayNum = parseInt(curp.substring(8, 10), 10);

    if (isNaN(yearTwoDigits) || isNaN(monthNum) || isNaN(dayNum)) return '';

    const hoy = new Date();
    const currentYearTwoDigits = hoy.getFullYear() % 100;
    const fullYear = yearTwoDigits <= currentYearTwoDigits ? 2000 + yearTwoDigits : 1900 + yearTwoDigits;

    const fechaNacimiento = new Date(fullYear, monthNum, dayNum);
    let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
    const mesDiff = hoy.getMonth() - fechaNacimiento.getMonth();

    if (mesDiff < 0 || (mesDiff === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
      edad--;
    }

    return edad >= 0 ? edad.toString() : '';
  };

  const revalidarEdades = (listaMenores: MenorData[]) => {
    const error = listaMenores.find(m => {
      const edadNum = parseInt(m.edad, 10);
      return !isNaN(edadNum) && edadNum > EDAD_MAXIMA_PERMITIDA;
    });

    if (error) {
      setWarning(`Uno de los menores excede el límite permitido de ${EDAD_MAXIMA_PERMITIDA} años.`);
    } else {
      setWarning(null);
    }
  };

  const agregarMenor = () => {
    setMenores(prev => [
      ...prev,
      { id: generateUUID(), curpMenor: '', edad: '', fileCurp: null, fileActa: null }
    ]);
  };

  const eliminarMenor = (id: string) => {
    if (menores.length === 1) {
      alert('Debe registrar al menos un menor.');
      return;
    }
    const nuevaLista = menores.filter(m => m.id !== id);
    setMenores(nuevaLista);
    revalidarEdades(nuevaLista);
  };

  const handleMenorChange = (id: string, field: keyof MenorData, value: any) => {
    setMenores(prev => {
      const nuevaLista = prev.map(m => {
        if (m.id !== id) return m;

        if (field === 'curpMenor') {
          const curpUpper = (value as string).toUpperCase();
          const edadCalculada = calcularEdadDesdeCurp(curpUpper);
          return {
            ...m,
            curpMenor: curpUpper,
            edad: edadCalculada !== '' ? edadCalculada : m.edad
          };
        }

        return { ...m, [field]: value };
      });

      revalidarEdades(nuevaLista);
      return nuevaLista;
    });
  };

  const handlePreviewLocalPdf = (file: File | null) => {
    if (!file) return;
    const fileURL = URL.createObjectURL(file);
    window.open(fileURL, '_blank');
  };

  const consultarEmpleado = async () => {
    if (!formData.numeroEmpleado.trim()) {
      setWarning('Por favor ingresa un número de empleado.');
      return;
    }

    setLoading(true);
    setWarning(null);

    try {
      const response = await fetch(`${API_ENDPOINTS.MAIN}/candidato?numero_empleado=${formData.numeroEmpleado}`);
      const result = await response.json();

      if (response.ok && result.success) {
        const data = result.data;
        const formatDateForInput = (rawDate: string | null | undefined): string => {
          if (!rawDate) return '';
          return rawDate.substring(0, 10);
        };

        setFormData((prev) => ({
          ...prev,
          cargo: data.cargo || '',
          fechaIngreso: formatDateForInput(data.ingreso),
          nomPersona: data.nombre || data.nomPersona || '',
          appPersona: data.apellido_paterno || data.appPersona || '',
          apmPersona: data.apellido_materno || data.apmPersona || '',
          curp: data.curp || '',
          rfc: data.rfc || '',
          telefono: data.telefono || '',
        }));

        setIsFetched(true);
      } else {
        setWarning(result.message || 'No se encontró información del empleado.');
        setIsFetched(false);
      }
    } catch (error) {
      console.error('Error al consultar empleado:', error);
      setWarning('Ocurrió un error al intentar conectarse al servidor.');
      setIsFetched(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!convocatoriaActiva) {
      alert('No se puede enviar el registro porque no hay una convocatoria activa.');
      return;
    }

    for (let i = 0; i < menores.length; i++) {
      const m = menores[i];
      if (!m.fileCurp) {
        alert(`El PDF de la CURP es obligatorio para el menor #${i + 1}.`);
        return;
      }
      const edadNum = parseInt(m.edad, 10);
      if (isNaN(edadNum) || edadNum > EDAD_MAXIMA_PERMITIDA) {
        setWarning(`El menor #${i + 1} excede la edad límite de ${EDAD_MAXIMA_PERMITIDA} años.`);
        return;
      }
    }

    setSubmitting(true);

    const payload = new FormData();
    payload.append('numEmpleado', formData.numeroEmpleado);
    payload.append('email', `${formData.correoC}${formData.servidor}`);
    payload.append('phone', formData.telefono);
    payload.append('firstName', formData.nomPersona);
    payload.append('middleName', formData.appPersona);
    payload.append('lastName', formData.apmPersona);
    payload.append('idCall', convocatoriaActiva.id.toString());

    menores.forEach((menor, index) => {
      payload.append(`menores[${index}][curpMenor]`, menor.curpMenor);
      payload.append(`menores[${index}][edad]`, menor.edad);
      if (menor.fileCurp) {
        payload.append(`pdfCurp_${index}`, menor.fileCurp);
      }
      if (menor.fileActa) {
        payload.append(`pdfActa_${index}`, menor.fileActa);
      }
    });

    try {
      const response = await fetch(`${API_ENDPOINTS.MAIN}/candidato`, {
        method: 'POST',
        body: payload,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setConstanciaData(result.constancia);
      } else {
        alert(result.message || 'Error al guardar el registro.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión con el servidor.');
    } finally {
      setSubmitting(false);
    }
  };

  return {
    formData,
    menores,
    isFetched,
    loading,
    warning,
    constanciaData,
    submitting,
    convocatoriaActiva,
    checkingConvocatoria,
    setConstanciaData,
    handleChange,
    handleRfcChange,
    agregarMenor,
    eliminarMenor,
    handleMenorChange,
    handlePreviewLocalPdf,
    consultarEmpleado,
    handleSubmit
  };
};