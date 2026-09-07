import React, { useEffect, useState, useMemo } from 'react';
import Swal from 'sweetalert2';
import { API_ENDPOINTS } from '../../config/api';

interface StatusData {
    id: number;
    status: string;
}

interface NinoData {
    idRegister: number;
    curpMenor: string;
    edad: number;
    idstatus: number;
    estatus: string;
    convocatoria: string;
    curpPdf: string | null;
    actaPdf: string | null;
}

interface CandidatoGroup {
    idCandidato: number;
    nombre_trabajador: string;
    num_empleado: string;
    unit: string;
    rfc: string;
    curp: string;
    folio_registro: string;
    total_hijos: number;
    ninos: NinoData[];
}

export const RegistersTable: React.FC = () => {
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
    const [columnFilters, setColumnFilters] = useState({
        folio: '',
        nombre: '',
        numEmpleado: '',
        curp: '',
        rfc: ''
    });

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
            const matchesCurp = (item.curp || '').toLowerCase().includes(columnFilters.curp.toLowerCase());
            const matchesRfc = (item.rfc || '').toLowerCase().includes(columnFilters.rfc.toLowerCase());

            return matchesGlobal && matchesFolio && matchesNombre && matchesNumEmp && matchesCurp && matchesRfc;
        });
    }, [candidatos, globalSearch, columnFilters]);

    // Paginación
    const totalPages = Math.ceil(filteredCandidatos.length / pageSize) || 1;
    const paginatedCandidatos = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredCandidatos.slice(start, start + pageSize);
    }, [filteredCandidatos, currentPage, pageSize]);

    const handleFilterChange = (field: string, value: string) => {
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

    const handleStatusChange = async (idRegister: number, newStatusId: number, newStatusName: string) => {
        const confirm = await Swal.fire({
            title: '¿Confirmar cambio?',
            text: `El estatus cambiará a "${newStatusName}"`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#691c32',
            cancelButtonColor: '#71717a',
            confirmButtonText: 'Sí, actualizar',
            cancelButtonText: 'Cancelar',
            heightAuto: false,
            customClass: {
                container: 'swal-override-zindex'
            }
        });

        if (!confirm.isConfirmed) return;

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
                body: JSON.stringify({ idstatus: newStatusId })
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.message || 'Error al actualizar el estatus');

            if (selectedCandidato) {
                const updatedNinos = selectedCandidato.ninos.map(nino =>
                    nino.idRegister === idRegister
                        ? { ...nino, idstatus: newStatusId, estatus: newStatusName }
                        : nino
                );
                setSelectedCandidato({ ...selectedCandidato, ninos: updatedNinos });
            }

            setCandidatos(prev => prev.map(cand => ({
                ...cand,
                ninos: cand.ninos.map(nino =>
                    nino.idRegister === idRegister
                        ? { ...nino, idstatus: newStatusId, estatus: newStatusName }
                        : nino
                )
            })));

            Swal.fire({
                icon: 'success',
                title: '¡Actualizado!',
                text: 'El estatus ha sido actualizado con éxito.',
                timer: 2000,
                showConfirmButton: false,
                heightAuto: false,
                customClass: {
                    container: 'swal-override-zindex'
                }
            });

        } catch (err: any) {
            console.error("Error al cambiar estatus:", err);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.message || 'No se pudo actualizar el estatus.',
                heightAuto: false,
                customClass: {
                    container: 'swal-override-zindex'
                }
            });
        } finally {
            setUpdatingStatusId(null);
        }
    };

    const getStatusStyle = (estatusName: string) => {
        const lower = (estatusName || '').toLowerCase();
        if (lower.includes('aprobado') || lower.includes('aceptado')) return { bg: '#e6f4ea', color: '#137333' };
        if (lower.includes('rechazado')) return { bg: '#fce8e6', color: '#c5221f' };
        return { bg: '#fef7e0', color: '#b06000' };
    };

    const countAceptados = (ninos: NinoData[]) => {
        return ninos.filter(n => {
            const st = (n.estatus || '').toLowerCase();
            return st.includes('aprobado') || st.includes('aceptado');
        }).length;
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>Cargando registros del padrón...</div>;
    if (error) return <div style={{ padding: '1rem', color: '#991b1b', backgroundColor: '#fee2e2', borderRadius: '6px' }}>{error}</div>;

    const lightFilterInputStyle: React.CSSProperties = {
        width: '100%',
        padding: '6px 8px',
        fontSize: '0.75rem',
        borderRadius: '6px',
        border: '1px solid #e5e7eb',
        backgroundColor: '#f9fafb',
        color: '#374151',
        marginTop: '6px',
        boxSizing: 'border-box',
        outline: 'none'
    };

    return (
        <div style={{ width: '100%', marginTop: '1.5rem', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            <style>{`
                .swal-override-zindex { z-index: 9999 !important; }
                .light-input:focus {
                    border-color: #a1a1aa !important;
                    background-color: #ffffff !important;
                    box-shadow: 0 0 0 2px rgba(105, 28, 50, 0.08);
                }
                .pagination-btn {
                    padding: 6px 12px;
                    border: 1px solid #e5e7eb;
                    background-color: #ffffff;
                    color: #374151;
                    cursor: pointer;
                    border-radius: 6px;
                    font-size: 0.8rem;
                    transition: all 0.15s ease;
                }
                .pagination-btn:hover:not(:disabled) {
                    background-color: #f3f4f6;
                }
                .pagination-btn:disabled {
                    opacity: 0.4;
                    cursor: not-allowed;
                }
                .pagination-btn.active {
                    background-color: #691c32;
                    color: #ffffff;
                    border-color: #691c32;
                }
            `}</style>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#4b5563' }}>
                    <span>Mostrar</span>
                    <select
                        value={pageSize}
                        onChange={(e) => {
                            setPageSize(Number(e.target.value));
                            setCurrentPage(1);
                        }}
                        style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #e5e7eb', backgroundColor: '#ffffff', color: '#374151', fontSize: '0.85rem' }}
                    >
                        <option value={10}>10</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                    <span>registros</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#4b5563' }}>
                    <label htmlFor="global-search" style={{ fontWeight: '500' }}>Buscar:</label>
                    <input
                        id="global-search"
                        className="light-input"
                        type="text"
                        placeholder="Buscar por folio, nombre, RFC..."
                        value={globalSearch}
                        onChange={(e) => handleGlobalSearchChange(e.target.value)}
                        style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #e5e7eb', backgroundColor: '#ffffff', color: '#111827', width: '260px', fontSize: '0.85rem' }}
                    />
                </div>
            </div>

            <div style={{ overflowX: 'auto', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
        <thead>
            <tr style={{ backgroundColor: '#ffffff', borderBottom: '2px solid #f3f4f6' }}>
                <th style={{ padding: '12px 10px', color: '#1f2937', fontWeight: '600' }}>
                    Folio
                    <input
                        type="text"
                        className="light-input"
                        placeholder="Filtrar..."
                        value={columnFilters.folio || ''}
                        onChange={(e) => handleFilterChange('folio', e.target.value)}
                        style={lightFilterInputStyle}
                    />
                </th>
                <th style={{ padding: '12px 10px', color: '#1f2937', fontWeight: '600' }}>
                    Nombre del trabajador
                    <input
                        type="text"
                        className="light-input"
                        placeholder="Filtrar..."
                        value={columnFilters.nombre || ''}
                        onChange={(e) => handleFilterChange('nombre', e.target.value)}
                        style={lightFilterInputStyle}
                    />
                </th>
                <th style={{ padding: '12px 10px', color: '#1f2937', fontWeight: '600' }}>
                    N° Empleado
                    <input
                        type="text"
                        className="light-input"
                        placeholder="Filtrar..."
                        value={columnFilters.numEmpleado || ''}
                        onChange={(e) => handleFilterChange('numEmpleado', e.target.value)}
                        style={lightFilterInputStyle}
                    />
                </th>
                {/* Columna Dirección o Unidad con filtro asignado a 'unidad' */}
                <th style={{ padding: '12px 10px', color: '#1f2937', fontWeight: '600' }}>
                    Dirección o Unidad
                    <input
                        type="text"
                        className="light-input"
                        placeholder="Filtrar..."
                        value={columnFilters.unidad || ''}
                        onChange={(e) => handleFilterChange('unidad', e.target.value)}
                        style={lightFilterInputStyle}
                    />
                </th>
                {/* Columna Género con filtro asignado a 'gender' */}
                <th style={{ padding: '12px 10px', color: '#1f2937', fontWeight: '600' }}>
                    Género
                    <input
                        type="text"
                        className="light-input"
                        placeholder="Filtrar..."
                        value={columnFilters.gender || ''}
                        onChange={(e) => handleFilterChange('gender', e.target.value)}
                        style={lightFilterInputStyle}
                    />
                </th>
                <th style={{ padding: '12px 10px', color: '#1f2937', fontWeight: '600' }}>
                    CURP
                    <input
                        type="text"
                        className="light-input"
                        placeholder="Filtrar..."
                        value={columnFilters.curp || ''}
                        onChange={(e) => handleFilterChange('curp', e.target.value)}
                        style={lightFilterInputStyle}
                    />
                </th>
                <th style={{ padding: '12px 10px', color: '#1f2937', fontWeight: '600' }}>
                    RFC
                    <input
                        type="text"
                        className="light-input"
                        placeholder="Filtrar..."
                        value={columnFilters.rfc || ''}
                        onChange={(e) => handleFilterChange('rfc', e.target.value)}
                        style={lightFilterInputStyle}
                    />
                </th>
                <th style={{ padding: '12px 10px', color: '#1f2937', fontWeight: '600', textAlign: 'center', verticalAlign: 'top' }}>Hijos</th>
                <th style={{ padding: '12px 10px', color: '#1f2937', fontWeight: '600', textAlign: 'center', verticalAlign: 'top' }}>Aceptados</th>
                <th style={{ padding: '12px 10px', color: '#1f2937', fontWeight: '600', textAlign: 'center', verticalAlign: 'top' }}>Acciones</th>
            </tr>
        </thead>
        <tbody>
            {paginatedCandidatos.length > 0 ? (
                paginatedCandidatos.map((item, index) => {
                    const aceptadosCount = countAceptados(item.ninos);
                    
                    const displayUnidad = item.unidad || item.unit || 'N/A';
                    const displayGender = item.gender || item.genero || 'N/A';

                    return (
                        <tr key={item.idCandidato ? `candidato-${item.idCandidato}` : `cand-row-${index}`} style={{ borderBottom: '1px solid #f3f4f6', backgroundColor: '#ffffff' }}>
                            <td style={{ padding: '12px 10px', fontWeight: '600', color: '#111827' }}>{item.folio_registro}</td>
                            <td style={{ padding: '12px 10px', fontWeight: '500', color: '#374151' }}>{item.nombre_trabajador}</td>
                            <td style={{ padding: '12px 10px', color: '#4b5563' }}>{item.num_empleado}</td>
                            <td style={{ padding: '12px 10px', color: '#4b5563' }}>{displayUnidad}</td>
                            <td style={{ padding: '12px 10px', color: '#4b5563', textTransform: 'capitalize' }}>{displayGender}</td>

                            <td style={{ padding: '12px 10px', fontFamily: 'monospace', color: '#4b5563' }}>{item.curp || 'N/A'}</td>
                            <td style={{ padding: '12px 10px', fontFamily: 'monospace', color: '#4b5563' }}>{item.rfc || 'N/A'}</td>
                            <td style={{ padding: '12px 10px', textAlign: 'center', fontWeight: '600', color: '#111827' }}>{item.total_hijos}</td>
                            <td style={{ padding: '12px 10px', textAlign: 'center', fontWeight: '600', color: aceptadosCount > 0 ? '#166534' : '#9ca3af' }}>
                                {aceptadosCount}
                            </td>
                            <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                                <button
                                    onClick={() => setSelectedCandidato(item)}
                                    style={{
                                        backgroundColor: '#691c32', color: '#fff', border: 'none',
                                        padding: '6px 12px', borderRadius: '4px', cursor: 'pointer',
                                        fontSize: '0.75rem', fontWeight: '600'
                                    }}
                                >
                                    Ver niños ({item.total_hijos})
                                </button>
                            </td>
                        </tr>
                    );
                })
            ) : (
                <tr>
                    {/* Aumentado colSpan a 10 por la nueva columna agregada */}
                    <td colSpan={10} style={{ padding: '32px 16px', textAlign: 'center', color: '#6b7280', backgroundColor: '#ffffff' }}>
                        No se encontraron registros que coincidan con la búsqueda.
                    </td>
                </tr>
            )}
        </tbody>
    </table>
</div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', flexWrap: 'wrap', gap: '1rem', fontSize: '0.85rem', color: '#4b5563' }}>
                <div>
                    Mostrando {filteredCandidatos.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} a {Math.min(currentPage * pageSize, filteredCandidatos.length)} de {filteredCandidatos.length} registros
                    {filteredCandidatos.length !== candidatos.length && ` (filtrados de ${candidatos.length} totales)`}
                </div>

                <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button
                        className="pagination-btn"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => prev - 1)}
                    >
                        Anterior
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
                        .map((page, idx, arr) => {
                            const prevPage = arr[idx - 1];
                            const showEllipsis = prevPage && page - prevPage > 1;

                            return (
                                <React.Fragment key={page}>
                                    {showEllipsis && <span style={{ padding: '6px', color: '#9ca3af' }}>...</span>}
                                    <button
                                        className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                                        onClick={() => setCurrentPage(page)}
                                    >
                                        {page}
                                    </button>
                                </React.Fragment>
                            );
                        })}

                    <button
                        className="pagination-btn"
                        disabled={currentPage === totalPages || totalPages === 0}
                        onClick={() => setCurrentPage(prev => prev + 1)}
                    >
                        Siguiente
                    </button>
                </div>
            </div>

            {/* Modal de Previsualización de Documentos PDF */}
            {previewPdf && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', zIndex: 1100
                }}>
                    <div style={{
                        backgroundColor: '#fff', padding: '1rem', borderRadius: '8px',
                        width: '80%', height: '85vh', display: 'flex', flexDirection: 'column'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <h4 style={{ margin: 0, color: '#111827' }}>{previewPdf.title}</h4>
                            <button
                                onClick={() => setPreviewPdf(null)}
                                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#6b7280' }}
                            >
                                ✕
                            </button>
                        </div>
                        <iframe
                            src={previewPdf.url}
                            title="Vista previa del documento PDF"
                            style={{ width: '100%', height: '100%', border: 'none', borderRadius: '4px' }}
                        />
                    </div>
                </div>
            )}

            {/* Modal para Consultar los Menores del Candidato */}
            {selectedCandidato && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px',
                        maxWidth: '850px', width: '95%', maxHeight: '80vh', overflowY: 'auto'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#111827' }}>
                                Menores de {selectedCandidato.nombre_trabajador}
                            </h3>
                            <button
                                onClick={() => setSelectedCandidato(null)}
                                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#6b7280' }}
                            >
                                ✕
                            </button>
                        </div>

                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                                    <th style={{ padding: '8px', textAlign: 'left', color: '#374151' }}>CURP Menor</th>
                                    <th style={{ padding: '8px', textAlign: 'center', color: '#374151' }}>Edad</th>
                                    <th style={{ padding: '8px', textAlign: 'left', color: '#374151' }}>Convocatoria</th>
                                    <th style={{ padding: '8px', textAlign: 'center', color: '#374151' }}>Documentos</th>
                                    <th style={{ padding: '8px', textAlign: 'center', color: '#374151' }}>Estatus / Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedCandidato.ninos.map((nino, ninoIdx) => {
                                    const currentStatusObj = statuses.find(
                                        s => s.id === Number(nino.idstatus) || s.status.toLowerCase() === (nino.estatus || '').toLowerCase()
                                    );
                                    const selectedValue = currentStatusObj ? currentStatusObj.id : (nino.idstatus || '');
                                    const currentStatusName = currentStatusObj ? currentStatusObj.status : nino.estatus;
                                    const statusStyle = getStatusStyle(currentStatusName);

                                    return (
                                        <tr key={nino.idRegister ? `nino-${nino.idRegister}` : `nino-row-${ninoIdx}`} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                            <td style={{ padding: '8px', fontFamily: 'monospace', color: '#374151' }}>{nino.curpMenor}</td>
                                            <td style={{ padding: '8px', textAlign: 'center', color: '#374151' }}>{nino.edad} años</td>
                                            <td style={{ padding: '8px', color: '#374151' }}>{nino.convocatoria}</td>

                                            <td style={{ padding: '8px', textAlign: 'center' }}>
                                                {nino.curpPdf ? (
                                                    <button
                                                        onClick={() => handleOpenPdf(nino.curpPdf, `CURP: ${nino.curpMenor}`)}
                                                        style={{ backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', marginRight: '4px', fontSize: '0.75rem', color: '#374151' }}
                                                    >
                                                        📄 CURP
                                                    </button>
                                                ) : <span style={{ color: '#9ca3af', fontSize: '0.75rem' }}>Sin CURP</span>}

                                                {nino.actaPdf ? (
                                                    <button
                                                        onClick={() => handleOpenPdf(nino.actaPdf, `Acta: ${nino.curpMenor}`)}
                                                        style={{ backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', color: '#374151' }}
                                                    >
                                                        📄 Acta
                                                    </button>
                                                ) : <span style={{ color: '#9ca3af', fontSize: '0.75rem' }}>Sin Acta</span>}
                                            </td>

                                            <td style={{ padding: '8px', textAlign: 'center' }}>
                                                <select
                                                    disabled={updatingStatusId === nino.idRegister}
                                                    value={selectedValue}
                                                    onChange={(e) => {
                                                        const targetId = Number(e.target.value);
                                                        const statusObj = statuses.find(s => s.id === targetId);

                                                        if (statusObj) {
                                                            handleStatusChange(nino.idRegister, statusObj.id, statusObj.status);
                                                        }
                                                    }}
                                                    style={{
                                                        padding: '4px 8px',
                                                        borderRadius: '4px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: '600',
                                                        cursor: 'pointer',
                                                        border: '1px solid #d1d5db',
                                                        backgroundColor: statusStyle.bg,
                                                        color: statusStyle.color
                                                    }}
                                                >
                                                    {statuses.map((item, statusIdx) => (
                                                        <option key={item.id ? `status-opt-${item.id}` : `status-opt-${statusIdx}`} value={item.id}>
                                                            {item.status}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RegistersTable;  