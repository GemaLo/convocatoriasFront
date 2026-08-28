import React, { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '../../config/api';

interface NinoData {
    idRegister: number;
    curpMenor: string;
    edad: number;
    estatus: string;
    convocatoria: string;
    curpPdf: string | null;
    actaPdf: string | null;
}

interface CandidatoGroup {
    idCandidato: number;
    nombre_trabajador: string;
    num_empleado: string;
    rfc: string;
    curp: string;
    folio_registro: string;
    total_hijos: number;
    ninos: NinoData[];
}

export const RegistersTable: React.FC = () => {
    const [candidatos, setCandidatos] = useState<CandidatoGroup[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedCandidato, setSelectedCandidato] = useState<CandidatoGroup | null>(null);

    useEffect(() => {
        const fetchRegisters = async () => {
            const token = localStorage.getItem('auth_token');
            try {
                const response = await fetch(`${API_ENDPOINTS.MAIN}/indexRegisters`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                });

                if (!response.ok) throw new Error(`Error: ${response.status}`);
                const result = await response.json();

                if (result.status === 'success' && Array.isArray(result.data)) {
                    setCandidatos(result.data);
                } else {
                    setCandidatos([]);
                }
            } catch (err: any) {
                console.error("Error al cargar padrón:", err);
                setError("Ocurrió un error al cargar la información del padrón.");
            } finally {
                setLoading(false);
            }
        };

        fetchRegisters();
    }, []);

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando registros del padrón...</div>;
    if (error) return <div style={{ padding: '1rem', color: '#842029', backgroundColor: '#f8d7da', borderRadius: '6px' }}>{error}</div>;

    return (
        <div style={{ overflowX: 'auto', marginTop: '1.5rem', width: '100%' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f4f4f5', borderBottom: '2px solid #e4e4e7' }}>
                        <th style={{ padding: '12px 10px', fontWeight: '600', color: '#3f3f46' }}>Folio</th>
                        <th style={{ padding: '12px 10px', fontWeight: '600', color: '#3f3f46' }}>Nombre del trabajador</th>
                        <th style={{ padding: '12px 10px', fontWeight: '600', color: '#3f3f46' }}>N° Empleado</th>
                        <th style={{ padding: '12px 10px', fontWeight: '600', color: '#3f3f46' }}>CURP</th>
                        <th style={{ padding: '12px 10px', fontWeight: '600', color: '#3f3f46' }}>RFC</th>
                        <th style={{ padding: '12px 10px', fontWeight: '600', color: '#3f3f46', textAlign: 'center' }}>Hijos</th>
                        <th style={{ padding: '12px 10px', fontWeight: '600', color: '#3f3f46', textAlign: 'center' }}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {candidatos.length > 0 ? (
                        candidatos.map((item, index) => (
                            <tr key={item.idCandidato || index} style={{ borderBottom: '1px solid #e4e4e7' }}>
                                <td style={{ padding: '12px 10px', fontWeight: '600' }}>
                                    {item.folio_registro}
                                </td>
                                <td style={{ padding: '12px 10px', fontWeight: '500', color: '#18181b' }}>
                                    {item.nombre_trabajador}
                                </td>
                                <td style={{ padding: '12px 10px', color: '#3f3f46' }}>
                                    {item.num_empleado}
                                </td>
                                <td style={{ padding: '12px 10px', fontFamily: 'monospace' }}>
                                    {item.curp || 'N/A'}
                                </td>
                                <td style={{ padding: '12px 10px', fontFamily: 'monospace' }}>
                                    {item.rfc || 'N/A'}
                                </td>
                                <td style={{ padding: '12px 10px', textAlign: 'center', fontWeight: '600' }}>
                                    {item.total_hijos}
                                </td>
                                <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                                    <button
                                        onClick={() => setSelectedCandidato(item)}
                                        style={{
                                            backgroundColor: '#691c32',
                                            color: '#fff',
                                            border: 'none',
                                            padding: '6px 12px',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '0.75rem',
                                            fontWeight: '600'
                                        }}
                                    >
                                        Ver niños ({item.total_hijos})
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={7} style={{ padding: '32px 16px', textAlign: 'center', color: '#71717a' }}>
                                No hay registros encontrados.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {selectedCandidato && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px',
                        maxWidth: '700px', width: '90%', maxHeight: '80vh', overflowY: 'auto'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid #e4e4e7', paddingBottom: '0.5rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#18181b' }}>
                                Menores de {selectedCandidato.nombre_trabajador}
                            </h3>
                            <button
                                onClick={() => setSelectedCandidato(null)}
                                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#71717a' }}
                            >
                                ✕
                            </button>
                        </div>

                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f4f4f5' }}>
                                    <th style={{ padding: '8px', textAlign: 'left' }}>CURP Menor</th>
                                    <th style={{ padding: '8px', textAlign: 'center' }}>Edad</th>
                                    <th style={{ padding: '8px', textAlign: 'left' }}>Convocatoria</th>
                                    <th style={{ padding: '8px', textAlign: 'center' }}>Estatus</th>
                                    <th style={{ padding: '8px', textAlign: 'center' }}>Documentos</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedCandidato.ninos.map((nino) => (
                                    <tr key={nino.idRegister} style={{ borderBottom: '1px solid #f4f4f5' }}>
                                        <td style={{ padding: '8px', fontFamily: 'monospace' }}>{nino.curpMenor}</td>
                                        <td style={{ padding: '8px', textAlign: 'center' }}>{nino.edad} años</td>
                                        <td style={{ padding: '8px' }}>{nino.convocatoria}</td>
                                        <td style={{ padding: '8px', textAlign: 'center' }}>
                                            <span style={{
                                                padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem',
                                                backgroundColor: nino.estatus === 'Aprobado' ? '#d1e7dd' : '#fff3cd',
                                                color: nino.estatus === 'Aprobado' ? '#0f5132' : '#664d03'
                                            }}>
                                                {nino.estatus}
                                            </span>
                                        </td>
                                        <td style={{ padding: '8px', textAlign: 'center' }}>
                                            {nino.curpPdf ? (
                                                <a href={nino.curpPdf} target="_blank" rel="noreferrer" style={{ color: '#691c32', marginRight: '6px', fontWeight: '600' }}>CURP</a>
                                            ) : <span style={{ color: '#aaa' }}>No CURP</span>}
                                            |
                                            {nino.actaPdf ? (
                                                <a href={nino.actaPdf} target="_blank" rel="noreferrer" style={{ color: '#691c32', marginLeft: '6px', fontWeight: '600' }}>Acta</a>
                                            ) : <span style={{ color: '#aaa', marginLeft: '6px' }}>No Acta</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RegistersTable;