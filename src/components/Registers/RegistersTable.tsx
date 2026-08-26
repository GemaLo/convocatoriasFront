import React, { useEffect, useState } from 'react';

const API_BASE_URL = 'http://localhost:9000/api'; 

// Interfaces normalizadas completamente a minúsculas
interface Candidato {
    idcandidato?: number;
    numempleado?: string;
    email?: string;
    firstname?: string;
    middlename?: string;
    lastname?: string;
}

interface Call {
    idcall?: number;
    namecall?: string;
    yearcall?: number;
}

interface RegisterData {
    idregister?: number;
    idcandidato?: number;
    idcall?: number;
    curpmenor?: string;
    edad?: number;
    curppdf?: string;
    actapdf?: string;
    candidato?: Candidato;
    call?: Call;
}

export const RegistersTable: React.FC = () => {
    const [registers, setRegisters] = useState<RegisterData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRegisters = async () => {
            const token = localStorage.getItem('auth_token');
            try {
                const response = await fetch(`${API_BASE_URL}/indexRegisters`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`Error en la respuesta: ${response.status}`);
                }

                const result = await response.json();

                if (result.status === 'success' && Array.isArray(result.data)) {
                    setRegisters(result.data);
                } else if (Array.isArray(result)) {
                    setRegisters(result);
                } else {
                    setRegisters([]);
                }
            } catch (err: any) {
                console.error("Error al obtener los registros:", err);
                setError("Ocurrió un error al cargar la información del padrón.");
            } finally {
                setLoading(false);
            }
        };

        fetchRegisters();
    }, []);

    if (loading) {
        return (
            <div style={{ padding: '2rem 1rem', color: '#666', textAlign: 'center' }}>
                <p>Cargando registros del padrón...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '1rem', color: '#842029', backgroundColor: '#f8d7da', borderRadius: '6px', marginTop: '1rem' }}>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div style={{ overflowX: 'auto', marginTop: '1.5rem', width: '100%' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f4f4f5', borderBottom: '2px solid #e4e4e7' }}>
                        <th style={{ padding: '12px 16px', fontWeight: '600', color: '#3f3f46' }}>Candidato / Tutor</th>
                        <th style={{ padding: '12px 16px', fontWeight: '600', color: '#3f3f46' }}>CURP Menor</th>
                        <th style={{ padding: '12px 16px', fontWeight: '600', color: '#3f3f46' }}>Edad</th>
                        <th style={{ padding: '12px 16px', fontWeight: '600', color: '#3f3f46' }}>Convocatoria</th>
                        <th style={{ padding: '12px 16px', fontWeight: '600', color: '#3f3f46' }}>Documentos</th>
                    </tr>
                </thead>
                <tbody>
                    {registers.length > 0 ? (
                        registers.map((item, index) => {
                            const cand = item.candidato;
                            
                            // Construcción del nombre del candidato (en minúsculas)
                            const candidateName = cand
                                ? `${cand.firstname || ''} ${cand.lastname || ''} ${cand.middlename || ''}`.trim()
                                : 'Sin candidato asignado';

                            // Nombre de la convocatoria (en minúsculas)
                            const callName = item.call?.namecall || (item.idcall ? `Convocatoria ID: ${item.idcall}` : 'N/A');

                            return (
                                <tr 
                                    key={item.idregister || index} 
                                    style={{ 
                                        borderBottom: '1px solid #e4e4e7',
                                        transition: 'background-color 0.2s ease-in-out'
                                    }}
                                >
                                    <td style={{ padding: '12px 16px', fontWeight: '500', color: '#18181b' }}>
                                        {candidateName}
                                        {cand?.numempleado && (
                                            <span style={{ display: 'block', fontSize: '0.75rem', color: '#71717a' }}>
                                                Emp: {cand.numempleado}
                                            </span>
                                        )}
                                    </td>
                                    <td style={{ padding: '12px 16px', fontFamily: 'monospace', letterSpacing: '0.5px' }}>
                                        {item.curpmenor || 'N/A'}
                                    </td>
                                    <td style={{ padding: '12px 16px' }}>
                                        {item.edad ? `${item.edad} años` : 'N/A'}
                                    </td>
                                    <td style={{ padding: '12px 16px', color: '#3f3f46' }}>
                                        {callName}
                                    </td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            {item.curppdf ? (
                                                <a 
                                                    href={item.curppdf} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    style={{ color: '#691c32', textDecoration: 'none', fontWeight: '600' }}
                                                >
                                                    CURP
                                                </a>
                                            ) : (
                                                <span style={{ color: '#a1a1aa' }}>No CURP</span>
                                            )}
                                            
                                            <span style={{ color: '#d4d4d8' }}>|</span>

                                            {item.actapdf ? (
                                                <a 
                                                    href={item.actapdf} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    style={{ color: '#691c32', textDecoration: 'none', fontWeight: '600' }}
                                                >
                                                    Acta
                                                </a>
                                            ) : (
                                                <span style={{ color: '#a1a1aa' }}>No Acta</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan={5} style={{ padding: '32px 16px', textAlign: 'center', color: '#71717a' }}>
                                No hay registros encontrados en la base de datos.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default RegistersTable;