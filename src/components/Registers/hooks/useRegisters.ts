import { useState, useEffect, useMemo } from 'react';
import Swal from 'sweetalert2';
import { CandidatoGroup, StatusData, ColumnFilters, NinoData } from '../types/registers';
import { API_ENDPOINTS } from '../../../config/api';

export const useRegisters = () => {
    const [candidatos, setCandidatos] = useState<CandidatoGroup[]>([]);
    const [statuses, setStatuses] = useState<StatusData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedCandidato, setSelectedCandidato] = useState<CandidatoGroup | null>(null);
    const [previewPdf, setPreviewPdf] = useState<{ url: string; title: string } | null>(null);
    const [updatingStatusId, setUpdatingStatusId] = useState<number | null>(null);

    const [globalSearch, setGlobalSearch] = useState('');
    const [pageSize, setPageSize] = useState<number>(10);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [columnFilters, setColumnFilters] = useState<ColumnFilters>({
        folio: '',
        nombre: '',
        numEmpleado: '',
        unidad: '',
        gender: '',
        curp: '',
        rfc: ''
    });

    const [observacionesMap, setObservacionesMap] = useState<Record<number, string>>({});

    useEffect(() => {
        const fetchInitialData = async () => {
            const token = localStorage.getItem('auth_token');
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            };

            try {
                const [resRegisters, resStatuses] = await Promise.all([
                    fetch(`${API_ENDPOINTS.MAIN}/indexRegisters`, { headers }),
                    fetch(`${API_ENDPOINTS.MAIN}/statuses`, { headers })
                ]);

                if (!resRegisters.ok || !resStatuses.ok) {
                    throw new Error('Error al obtener la información del servidor');
                }

                const dataRegisters = await resRegisters.json();
                const dataStatuses = await resStatuses.json();

                if (dataRegisters.status === 'success' && Array.isArray(dataRegisters.data)) {
                    setCandidatos(dataRegisters.data);
                }

                if (dataStatuses.status === 'success' && Array.isArray(dataStatuses.data)) {
                    const parsedStatuses: StatusData[] = dataStatuses.data.map((item: any) => ({
                        id: Number(item.id || item.ID || item.idstatus || item.IDSTATUS),
                        status: String(item.status || item.STATUS || item.nombre || '')
                    }));
                    setStatuses(parsedStatuses);
                }
            } catch (err: any) {
                console.error("Error al cargar datos iniciales:", err);
                setError("Ocurrió un error al cargar la información del padrón.");
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    useEffect(() => {
        return () => {
            if (previewPdf?.url.startsWith('blob:')) {
                URL.revokeObjectURL(previewPdf.url);
            }
        };
    }, [previewPdf]);

    const filteredCandidatos = useMemo(() => {
        return candidatos.filter(item => {
            const searchLower = globalSearch.toLowerCase();
            const matchesGlobal = !globalSearch || (
                (item.folio_registro || '').toLowerCase().includes(searchLower) ||
                (item.nombre_trabajador || '').toLowerCase().includes(searchLower) ||
                (item.num_empleado || '').toLowerCase().includes(searchLower) ||
                (item.curp || '').toLowerCase().includes(searchLower) ||
                (item.rfc || '').toLowerCase().includes(searchLower)
            );

            const matchesFolio = (item.folio_registro || '').toLowerCase().includes(columnFilters.folio.toLowerCase());
            const matchesNombre = (item.nombre_trabajador || '').toLowerCase().includes(columnFilters.nombre.toLowerCase());
            const matchesNumEmp = (item.num_empleado || '').toLowerCase().includes(columnFilters.numEmpleado.toLowerCase());
            const matchesUnidad = ((item.unidad || item.unit) || '').toLowerCase().includes(columnFilters.unidad.toLowerCase());
            const matchesGender = (item.gender || '').toLowerCase().includes(columnFilters.gender.toLowerCase());
            const matchesCurp = (item.curp || '').toLowerCase().includes(columnFilters.curp.toLowerCase());
            const matchesRfc = (item.rfc || '').toLowerCase().includes(columnFilters.rfc.toLowerCase());

            return matchesGlobal && matchesFolio && matchesNombre && matchesNumEmp && matchesUnidad && matchesGender && matchesCurp && matchesRfc;
        });
    }, [candidatos, globalSearch, columnFilters]);

    const totalPages = Math.ceil(filteredCandidatos.length / pageSize) || 1;
    const paginatedCandidatos = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredCandidatos.slice(start, start + pageSize);
    }, [filteredCandidatos, currentPage, pageSize]);

    const handleFilterChange = (field: keyof ColumnFilters, value: string) => {
        setColumnFilters(prev => ({ ...prev, [field]: value }));
        setCurrentPage(1);
    };

    const handleGlobalSearchChange = (value: string) => {
        setGlobalSearch(value);
        setCurrentPage(1);
    };

    const handleOpenPdf = async (pdfPath: string | null, title: string) => {
        if (!pdfPath) return;

        const token = localStorage.getItem('auth_token');
        const cleanPath = pdfPath.startsWith('/') ? pdfPath.slice(1) : pdfPath;
        const fullUrl = pdfPath.startsWith('http') ? pdfPath : `${API_ENDPOINTS.MAIN}/${cleanPath}`;

        try {
            const response = await fetch(fullUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/pdf'
                }
            });

            if (!response.ok) {
                if (response.status === 401) Swal.fire({ icon: 'error', title: 'Error', text: 'Sesión expirada o no autorizada.' });
                else if (response.status === 404) Swal.fire({ icon: 'error', title: 'Error', text: 'El archivo PDF no fue encontrado en el servidor.' });
                else Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo cargar el documento PDF.' });
                return;
            }

            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            setPreviewPdf({ url: blobUrl, title });

        } catch (err) {
            console.error("Error al obtener el PDF:", err);
            Swal.fire({ icon: 'error', title: 'Error', text: 'Ocurrió un problema al visualizar el archivo.' });
        }
    };

    const handleStatusChange = async (
        idRegister: number,
        newStatusId: number,
        newStatusName: string,
        observaciones: string = ''
    ) => {
        const isRechazado = newStatusName.toLowerCase().includes('rechazado');

        // Si el estado es rechazado y no hay motivo, se puede requerir por modal
        let finalObservaciones = observaciones;

        if (isRechazado && !finalObservaciones.trim()) {
            const { value: text, isConfirmed } = await Swal.fire({
                title: 'Motivo del Rechazo',
                input: 'textarea',
                inputPlaceholder: 'Escriba aquí la razón del rechazo...',
                inputAttributes: { 'aria-label': 'Motivo del rechazo' },
                showCancelButton: true,
                confirmButtonColor: '#691c32',
                cancelButtonColor: '#71717a',
                confirmButtonText: 'Guardar Rechazo',
                cancelButtonText: 'Cancelar',
                customClass: { container: 'swal-override-zindex' },
                inputValidator: (value) => {
                    if (!value.trim()) return '¡Es obligatorio ingresar el motivo del rechazo!';
                }
            });

            if (!isConfirmed) return;
            finalObservaciones = text;
        } else {
            const confirm = await Swal.fire({
                title: '¿Confirmar cambio?',
                text: `El estatus cambiará a "${newStatusName}"`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#691c32',
                cancelButtonColor: '#71717a',
                confirmButtonText: 'Sí, actualizar',
                cancelButtonText: 'Cancelar',
                customClass: { container: 'swal-override-zindex' }
            });

            if (!confirm.isConfirmed) return;
        }

        setUpdatingStatusId(idRegister);
        const token = localStorage.getItem('auth_token');

        try {
            const response = await fetch(`${API_ENDPOINTS.MAIN}/updateStatus/${idRegister}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ 
                    idstatus: newStatusId,
                    observaciones: finalObservaciones 
                })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Error al actualizar el estatus');

            // Actualizar localmente el mapa de observaciones
            setObservacionesMap(prev => ({ ...prev, [idRegister]: finalObservaciones }));

            const updateNinosList = (ninos: NinoData[]) =>
                ninos.map(nino =>
                    nino.idRegister === idRegister
                        ? { ...nino, idstatus: newStatusId, estatus: newStatusName, observaciones: finalObservaciones }
                        : nino
                );

            if (selectedCandidato) {
                setSelectedCandidato({
                    ...selectedCandidato,
                    ninos: updateNinosList(selectedCandidato.ninos)
                });
            }

            setCandidatos(prev => prev.map(cand => ({
                ...cand,
                ninos: updateNinosList(cand.ninos)
            })));

            Swal.fire({
                icon: 'success',
                title: '¡Actualizado!',
                text: 'El estatus y las observaciones han sido actualizados.',
                timer: 2000,
                showConfirmButton: false,
                customClass: { container: 'swal-override-zindex' }
            });

        } catch (err: any) {
            console.error("Error al cambiar estatus:", err);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.message || 'No se pudo actualizar el estatus.',
                customClass: { container: 'swal-override-zindex' }
            });
        } finally {
            setUpdatingStatusId(null);
        }
    };

    const handleObservacionesChange = (idRegister: number, val: string) => {
        setObservacionesMap(prev => ({ ...prev, [idRegister]: val }));
    };

    return {
        candidatos,
        statuses,
        loading,
        error,
        selectedCandidato,
        setSelectedCandidato,
        previewPdf,
        setPreviewPdf,
        updatingStatusId,
        globalSearch,
        pageSize,
        setPageSize,
        currentPage,
        setCurrentPage,
        columnFilters,
        totalPages,
        filteredCandidatos,
        paginatedCandidatos,
        observacionesMap,
        handleFilterChange,
        handleGlobalSearchChange,
        handleOpenPdf,
        handleStatusChange,
        handleObservacionesChange
    };
};