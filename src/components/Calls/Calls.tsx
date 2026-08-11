import React, { useState, useEffect } from 'react';
import styles from './Calls.module.css';
import { API_ENDPOINTS } from '../../config/api';

export interface CallModel {
    idcall: string | number;
    yearcall: string | number;
    namecall: string;
    dateinitialcall: string;
    datefinalcall: string;
    activo: string | number;
}

export const Calls: React.FC = () => {
    const [calls, setCalls] = useState<CallModel[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    
    const [showModal, setShowModal] = useState<boolean>(false);
    const [editingCall, setEditingCall] = useState<CallModel | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        namecall: '',
        dateinitialcall: '',
        datefinalcall: '',
        activo: '1'
    });

    const todayDate = new Date().toISOString().split('T')[0];

    const formatDate = (dateString?: string): string => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;

        return date.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const fetchCalls = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('auth_token');

            const res = await fetch(`${API_ENDPOINTS.MAIN}/calls`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            if (res.ok) {
                const response = await res.json();
                setCalls(response.data || []);
            }
        } catch (error) {
            console.error('Error al cargar convocatorias:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCalls();
    }, []);

    const handleOpenCreate = () => {
        setEditingCall(null);
        setFormData({
            namecall: '',
            dateinitialcall: '',
            datefinalcall: '',
            activo: '1'
        });
        setShowModal(true);
    };

    const handleOpenEdit = (item: CallModel) => {
        setEditingCall(item);
        setFormData({
            namecall: item.namecall,
            dateinitialcall: item.dateinitialcall ? item.dateinitialcall.split(' ')[0] : '',
            datefinalcall: item.datefinalcall ? item.datefinalcall.split(' ')[0] : '',
            activo: String(item.activo)
        });
        setShowModal(true);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('auth_token');
            const isEdit = !!editingCall;
            const url = isEdit 
                ? `${API_ENDPOINTS.MAIN}/calls/${editingCall.idcall}`
                : `${API_ENDPOINTS.MAIN}/calls`;

            const res = await fetch(url, {
                method: isEdit ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (res.ok) {
                setMessage(isEdit ? 'Convocatoria actualizada correctamente.' : 'Convocatoria registrada con éxito.');
                setShowModal(false);
                fetchCalls();
            } else {
                alert(data.message || 'Error al guardar.');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    // Inactivar / Activar directamente desde la tabla
    const handleToggleStatus = async (id: string | number) => {
        if (!confirm('¿Deseas cambiar el estatus de esta convocatoria?')) return;

        try {
            const token = localStorage.getItem('auth_token');
            const res = await fetch(`${API_ENDPOINTS.MAIN}/calls/${id}/toggle-status`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            if (res.ok) {
                fetchCalls();
            } else {
                alert('No se pudo cambiar el estatus.');
            }
        } catch (error) {
            console.error('Error al cambiar estatus:', error);
        }
    };

    return (
        <div className={styles.callsContainer}>
            <div className={styles.headerFlex}>
                <div>
                    <h2 className={styles.title}>Consulta de Convocatorias</h2>
                    <p className={styles.subtitle}>Gestión y registro de convocatorias vigentes</p>
                </div>
                <button className={styles.btnPrimary} onClick={handleOpenCreate}>
                    + Alta de nueva Convocatoria
                </button>
            </div>

            {message && (
                <div className={styles.alertSuccess}>
                    <span>{message}</span>
                    <button onClick={() => setMessage(null)} className={styles.closeAlert}>✕</button>
                </div>
            )}

            {loading ? (
                <div className={styles.loadingState}>Cargando información...</div>
            ) : (
                <div className={styles.tableWrapper}>
                    <table className={styles.dataTable}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Convocatoria</th>
                                <th>Año</th>
                                <th>Fecha Inicio</th>
                                <th>Fecha Final</th>
                                <th>Estatus</th>
                                <th>Opciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {calls.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className={styles.emptyRow}>
                                        No se encontraron convocatorias registradas.
                                    </td>
                                </tr>
                            ) : (
                                calls.map((item) => (
                                    <tr key={item.idcall}>
                                        <td>{item.idcall}</td>
                                        <td><strong>{item.namecall}</strong></td>
                                        <td>{item.yearcall}</td>
                                        <td>{formatDate(item.dateinitialcall)}</td>
                                        <td>{formatDate(item.datefinalcall)}</td>
                                        <td>
                                            <span 
                                                className={String(item.activo) === '1' ? styles.badgeActive : styles.badgeInactive}
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => handleToggleStatus(item.idcall)}
                                                title="Haz clic para cambiar estatus"
                                            >
                                                {String(item.activo) === '1' ? 'ACTIVA' : 'INACTIVA'}
                                            </span>
                                        </td>
                                        <td>
                                            <button className={styles.btnEdit} onClick={() => handleOpenEdit(item)}>
                                                Editar
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalCard}>
                        <div className={styles.modalHeader}>
                            <h3>{editingCall ? 'Editar Convocatoria' : 'Alta de Nueva Convocatoria'}</h3>
                            <button className={styles.closeModalBtn} onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className={styles.modalBody}>
                            <div className={styles.formGroup}>
                                <label className={styles.labelLight}>Nombre de la Convocatoria:</label>
                                <input 
                                    type="text" 
                                    name="namecall" 
                                    className={styles.inputLight}
                                    value={formData.namecall} 
                                    onChange={handleChange} 
                                    required 
                                />
                            </div>

                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label className={styles.labelLight}>Fecha Inicio:</label>
                                    <input 
                                        type="date" 
                                        name="dateinitialcall" 
                                        className={styles.inputLight}
                                        value={formData.dateinitialcall} 
                                        onChange={handleChange} 
                                        required 
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.labelLight}>Fecha Final:</label>
                                    <input 
                                        type="date" 
                                        name="datefinalcall" 
                                        className={styles.inputLight}
                                        value={formData.datefinalcall} 
                                        onChange={handleChange} 
                                        required 
                                    />
                                </div>
                            </div>

                            {editingCall && (
                                <div className={styles.formGroup}>
                                    <label className={styles.labelLight}>Estatus:</label>
                                    <select 
                                        name="activo" 
                                        className={styles.inputLight}
                                        value={formData.activo} 
                                        onChange={handleChange}
                                    >
                                        <option value="1">ACTIVA</option>
                                        <option value="0">INACTIVA</option>
                                    </select>
                                </div>
                            )}

                            <div className={styles.modalFooter}>
                                <button type="button" className={styles.btnCancelLight} onClick={() => setShowModal(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className={styles.btnGold}>
                                    {editingCall ? 'Actualizar' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};