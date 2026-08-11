import React, { useEffect, useState } from 'react';
import styles from './Dashboard.module.css';
import { Calls } from "../Calls";

interface TypeUser {
    idType: number;
    name?: string;
    description?: string;
}

interface UserData {
    id_user: number;
    name?: string;
    firstName?: string;
    lastName?: string;
    middleName?: string;
    email: string;
    nivel?: string;
    unidad?: string;
    idType?: number | null;
    type_user?: TypeUser;
}

interface DashboardProps {
    onLogout?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
    const [user, setUser] = useState<UserData | null>(null);
    const [activeSection, setActiveSection] = useState('inicio');

    useEffect(() => {
        const storedUser = localStorage.getItem('user_info');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Error al obtener información de sesión", e);
            }
        }
    }, []);

    const handleLogout = async () => {
        const token = localStorage.getItem('auth_token');

        try {
            if (token) {
                await fetch('http://localhost:9000/api/logout', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });
            }
        } catch (e) {
            console.error("Error al cerrar sesión en el servidor", e);
        } finally {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_info');
            if (onLogout) onLogout();
        }
    };

    const fullName = user
        ? (user.firstName || user.lastName)
            ? `${user.firstName || ''} ${user.lastName || ''} ${user.middleName || ''}`.trim()
            : user.name || user.email || 'Usuario'
        : 'Usuario';

    const userRole = user?.type_user?.name || user?.type_user?.description || 'Administrador';

    return (
        <div className={styles.dashboardContainer}>
            <aside className={styles.sidebar}>
                <div className={styles.sidebarTop}>
                    <div className={styles.sidebarHeader}>
                        <h2>Panel Principal</h2>
                        <span className={styles.systemSub}>Registro de Prestaciones</span>
                    </div>

                    <div className={styles.userInfoCard}>
                        <div className={styles.avatar}>👤</div>
                        <div className={styles.userDetails}>
                            <span className={styles.userName} title={fullName}>{fullName}</span>
                            <span className={styles.userRole}>{userRole}</span>
                        </div>
                    </div>

                    <nav className={styles.navMenu}>
                        <button
                            type="button"
                            className={`${styles.navItem} ${activeSection === 'inicio' ? styles.active : ''}`}
                            onClick={() => setActiveSection('inicio')}
                        >
                            <svg className={styles.navIcon} viewBox="0 0 24 24" fill="currentColor">
                                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                            </svg>
                            <span>Inicio</span>
                        </button>

                        <button
                            type="button"
                            className={`${styles.navItem} ${activeSection === 'familia' ? styles.active : ''}`}
                            onClick={() => setActiveSection('familia')}
                        >
                            <svg className={styles.navIcon} viewBox="0 0 24 24" fill="currentColor">
                                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                            </svg>
                            <span>Consulta de Menores o Familia (Actual)</span>
                        </button>
                        <button
                            type="button"
                            className={`${styles.navItem} ${activeSection === 'familia' ? styles.active : ''}`}
                            onClick={() => setActiveSection('familia')}
                        >
                            <svg className={styles.navIcon} viewBox="0 0 24 24" fill="currentColor">
                                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                            </svg>
                            <span>Consulta de histórico</span>
                        </button>
                                                <button
                            type="button"
                            className={`${styles.navItem} ${activeSection === 'familia' ? styles.active : ''}`}
                            onClick={() => setActiveSection('familia')}
                        >
                            <svg className={styles.navIcon} viewBox="0 0 24 24" fill="currentColor">
                                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                            </svg>
                            <span>Reportes</span>
                        </button>
                        <button
                            type="button"
                            className={`${styles.navItem} ${activeSection === 'usuarios' ? styles.active : ''}`}
                            onClick={() => setActiveSection('usuarios')}
                        >
                            <svg className={styles.navIcon} viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                            </svg>
                            <span>Usuarios</span>
                        </button>

                        <button
                            type="button"
                            className={`${styles.navItem} ${activeSection === 'convocatorias' ? styles.active : ''}`}
                            onClick={() => setActiveSection('convocatorias')}
                        >
                            <svg className={styles.navIcon} viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                            </svg>
                            <span>Alta de Convocatorias</span>
                        </button>
                    </nav>
                </div>

                <div className={styles.sidebarFooter}>
                    <button type="button" onClick={handleLogout} className={styles.logoutButton}>
                        <svg className={styles.navIcon} viewBox="0 0 24 24" fill="currentColor">
                            <path d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
                        </svg>
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            <main className={styles.mainContent}>
                <header className={styles.topHeader}>
                    <div>
                        <h1>Hola, {fullName}</h1>
                        <p className={styles.userEmailText}>{user?.email}</p>
                    </div>
                    <div className={styles.headerBadges}>
                        <span className={styles.badge}>Unidad: <strong>{user?.unidad || 'N/A'}</strong></span>
                        <span className={styles.badge}>Nivel: <strong>{user?.nivel || 'N/A'}</strong></span>
                    </div>
                </header>

                <section className={styles.contentBody}>
                    {activeSection === 'inicio' && (
                        <div className={styles.card}>
                            <h2>Resumen General</h2>
                            <p>Bienvenido al Sistema de Registro de Prestaciones Sociales y Familiares.</p>
                        </div>
                    )}

                    {activeSection === 'familia' && (
                        <div className={styles.card}>
                            <h2>Consulta de Menores o Familia</h2>
                            <p>Módulo para la búsqueda, verificación y gestión del padrón de dependientes económicos y familiares registrados.</p>
                        </div>
                    )}

                    {activeSection === 'usuarios' && (
                        <div className={styles.card}>
                            <h2>Gestión de Usuarios</h2>
                            <p>Módulo de administración para el control de accesos, roles y cuentas del sistema.</p>
                        </div>
                    )}


{activeSection === 'convocatorias' && (
    <div className={styles.card}>
        <Calls />
    </div>
)}
                </section>
            </main>
        </div>
    );
};