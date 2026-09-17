import React from 'react';
// Por esto (añade un punto):
import { useRegisters } from './hooks/useRegisters';
import { NinoData } from '../types/registers';

export const RegistersTable: React.FC = () => {
    const {
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
    } = useRegisters();

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
                .pagination-btn:hover:not(:disabled) { background-color: #f3f4f6; }
                .pagination-btn:disabled { opacity: 0.4; cursor: not-allowed; }
                .pagination-btn.active {
                    background-color: #691c32;
                    color: #ffffff;
                    border-color: #691c32;
                }
            `}</style>

            {/* Filtros Globales */}
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

            {/* Tabla Principal */}
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
                                    value={columnFilters.folio}
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
                                    value={columnFilters.nombre}
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
                                    value={columnFilters.numEmpleado}
                                    onChange={(e) => handleFilterChange('numEmpleado', e.target.value)}
                                    style={lightFilterInputStyle}
                                />
                            </th>
                            <th style={{ padding: '12px 10px', color: '#1f2937', fontWeight: '600' }}>
                                Dirección o Unidad
                                <input
                                    type="text"
                                    className="light-input"
                                    placeholder="Filtrar..."
                                    value={columnFilters.unidad}
                                    onChange={(e) => handleFilterChange('unidad', e.target.value)}
                                    style={lightFilterInputStyle}
                                />
                            </th>
                            <th style={{ padding: '12px 10px', color: '#1f2937', fontWeight: '600' }}>
                                Género
                                <input
                                    type="text"
                                    className="light-input"
                                    placeholder="Filtrar..."
                                    value={columnFilters.gender}
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
                                    value={columnFilters.curp}
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
                                    value={columnFilters.rfc}
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
                                return (
                                    <tr key={item.idCandidato ? `candidato-${item.idCandidato}` : `cand-row-${index}`} style={{ borderBottom: '1px solid #f3f4f6', backgroundColor: '#ffffff' }}>
                                        <td style={{ padding: '12px 10px', fontWeight: '600', color: '#111827' }}>{item.folio_registro}</td>
                                        <td style={{ padding: '12px 10px', fontWeight: '500', color: '#374151' }}>{item.nombre_trabajador}</td>
                                        <td style={{ padding: '12px 10px', color: '#4b5563' }}>{item.num_empleado}</td>
                                        <td style={{ padding: '12px 10px', color: '#4b5563' }}>{item.unidad || item.unit || 'N/A'}</td>
                                        <td style={{ padding: '12px 10px', color: '#4b5563', textTransform: 'capitalize' }}>{item.gender || 'N/A'}</td>
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
                                <td colSpan={10} style={{ padding: '32px 16px', textAlign: 'center', color: '#6b7280', backgroundColor: '#ffffff' }}>
                                    No se encontraron registros que coincidan con la búsqueda.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Paginación */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', flexWrap: 'wrap', gap: '1rem', fontSize: '0.85rem', color: '#4b5563' }}>
                <div>
                    Mostrando {filteredCandidatos.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} a {Math.min(currentPage * pageSize, filteredCandidatos.length)} de {filteredCandidatos.length} registros
                </div>

                <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button className="pagination-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}>
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

                    <button className="pagination-btn" disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(prev => prev + 1)}>
                        Siguiente
                    </button>
                </div>
            </div>

            {/* Modal Vista Previa PDF */}
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
                            <button onClick={() => setPreviewPdf(null)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#6b7280' }}>✕</button>
                        </div>
                        <iframe src={previewPdf.url} title="Vista previa" style={{ width: '100%', height: '100%', border: 'none', borderRadius: '4px' }} />
                    </div>
                </div>
            )}

            {/* Modal Detalle Niños */}
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
                            <button onClick={() => setSelectedCandidato(null)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#6b7280' }}>✕</button>
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
                                    const esRechazado = currentStatusName?.toLowerCase().includes('rechazado');

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
                                                            const obs = observacionesMap[nino.idRegister] ?? nino.observaciones ?? '';
                                                            handleStatusChange(nino.idRegister, statusObj.id, statusObj.status, obs);
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

                                                {esRechazado && (
                                                    <div style={{ marginTop: '6px' }}>
                                                        <textarea
                                                            placeholder="Motivo del rechazo..."
                                                            value={observacionesMap[nino.idRegister] ?? nino.observaciones ?? ''}
                                                            onChange={(e) => handleObservacionesChange(nino.idRegister, e.target.value)}
                                                            onBlur={() => {
                                                                if (currentStatusObj) {
                                                                    const obs = observacionesMap[nino.idRegister] ?? nino.observaciones ?? '';
                                                                    handleStatusChange(nino.idRegister, currentStatusObj.id, currentStatusObj.status, obs);
                                                                }
                                                            }}
                                                            style={{
                                                                width: '100%',
                                                                boxSizing: 'border-box',
                                                                fontSize: '0.75rem',
                                                                padding: '6px 8px',
                                                                borderRadius: '4px',
                                                                border: '1px solid #fca5a5',
                                                                backgroundColor: '#fef2f2',
                                                                color: '#991b1b',
                                                                resize: 'vertical',
                                                                minHeight: '45px',
                                                                outline: 'none'
                                                            }}
                                                        />
                                                    </div>
                                                )}
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