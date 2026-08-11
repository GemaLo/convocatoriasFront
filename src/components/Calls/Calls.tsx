import React, { useState, useEffect } from 'react';
import styles from './Calls.module.css';

export interface Puesto {
    id_puesto: number;
    puesto: string;
}

export interface Convocatoria {
    id_convocatoria: number;
    convocatoria: string;
    year: number;
    puesto: string;
    id_puesto: number;
    fecha_inicio: string;
    fecha_final: string;
    fecha_limite: string;
    activo: number;
}

export const Calls: React.FC = () => {
    const [convocatorias, setConvocatorias] = useState<Convocatoria[]>([]);
    const [puestos, setPuestos] = useState<Puesto[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [message, setMessage] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        convocatoria: '',
        fecha_inicio: '',
        fecha_final: '',
        fecha_limite: '',
        id_puesto: ''
    });

    const todayDate = new Date().toISOString().split('T')[0];

    const fetchConvocatorias = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('auth_token');
            const res = await fetch('http://localhost:9000/api/convocatorias', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            if (res.ok) {
                const data = await res.json();
                setConvocatorias(data.convocatorias || []);
                setPuestos(data.puestos || []);
            }
        } catch (error) {
            console.error('Error al obtener convocatorias:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConvocatorias();
    }, []);

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
            const res = await fetch('http://localhost:9000/api/guarda-convocatoria', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setMessage('La convocatoria ha sido creada correctamente.');
                setShowModal(false);
                setFormData({
                    convocatoria: '',
                    fecha_inicio: '',
                    fecha_final: '',
                    fecha_limite: '',
                    id_puesto: ''
                });
                fetchConvocatorias();
            } else {
                alert('Error al guardar la convocatoria. Verifica los campos.');
            }
        } catch (error) {
            console.error('Error al enviar el formulario:', error);
        }
    };

    return (
        <div className={styles.callsContainer}>
            <div className={styles.headerFlex}>
                <div>
                    <h2 className={styles.title}>Consulta de Convocatorias</h2>
                    <p className={styles.subtitle}>Gestión y registro de convocatorias vigentes</p>
                </div>
                <button 
                    className={styles.btnPrimary} 
                    onClick={() => setShowModal(true)}
                >
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
                                <th>Puesto</th>
                                <th>Fecha Inicio</th>
                                <th>Fecha Final</th>
                                <th>Fecha Límite</th>
                                <th>Estatus</th>
                                <th>Opciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {convocatorias.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className={styles.emptyRow}>
                                        No se encontraron convocatorias registradas.
                                    </td>
                                </tr>
                            ) : (
                                convocatorias.map((item) => (
                                    <tr key={item.id_convocatoria}>
                                        <td>{item.id_convocatoria}</td>
                                        <td><strong>{item.convocatoria}</strong></td>
                                        <td>{item.year}</td>
                                        <td>{item.puesto}</td>
                                        <td>{item.fecha_inicio}</td>
                                        <td>{item.fecha_final}</td>
                                        <td>{item.fecha_limite}</td>
                                        <td>
                                            <span className={item.activo === 1 ? styles.badgeActive : styles.badgeInactive}>
                                                {item.activo === 1 ? 'ACTIVA' : 'INACTIVA'}
                                            </span>
                                        </td>
                                        <td>
                                            <button className={styles.btnEdit}>Editar</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* MODAL / ALTA DE CONVOCATORIA CON TEXTURA Y TEXTO CLARO */}
            {showModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalCard}>
                        <div className={styles.modalHeader}>
                            <h3>Alta de Nueva Convocatoria</h3>
                            <button className={styles.closeModalBtn} onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className={styles.modalBody}>
                            <div className={styles.formGroup}>
                                <label className={styles.labelLight}>Nombre de la convocatoria:</label>
                                <input 
                                    type="text" 
                                    name="convocatoria" 
                                    className={styles.inputLight}
                                    value={formData.convocatoria} 
                                    onChange={handleChange} 
                                    required 
                                />
                            </div>

                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label className={styles.labelLight}>Fecha Inicio:</label>
                                    <input 
                                        type="date" 
                                        name="fecha_inicio" 
                                        className={styles.inputLight}
                                        min={todayDate} 
                                        value={formData.fecha_inicio} 
                                        onChange={handleChange} 
                                        required 
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.labelLight}>Fecha Final:</label>
                                    <input 
                                        type="date" 
                                        name="fecha_final" 
                                        className={styles.inputLight}
                                        min={todayDate} 
                                        value={formData.fecha_final} 
                                        onChange={handleChange} 
                                        required 
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.labelLight}>Fecha Límite (Entrega Docs):</label>
                                    <input 
                                        type="date" 
                                        name="fecha_limite" 
                                        className={styles.inputLight}
                                        min={todayDate} 
                                        value={formData.fecha_limite} 
                                        onChange={handleChange} 
                                        required 
                                    />
                                </div>
                            </div>

                            <div className={styles.modalFooter}>
                                <button type="button" className={styles.btnCancelLight} onClick={() => setShowModal(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className={styles.btnGold}>
                                    Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};