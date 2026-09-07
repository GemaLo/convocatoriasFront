import React, { useState } from 'react';
import styles from './searchRegisters.module.css';

export const SearchRegisters: React.FC = () => {
  const [filters, setFilters] = useState({
    convocatoria: '',
    no_direccion: '',
    estado: '',
    folio: '',
    edad_menor: '',
    formato: 'xlsx',
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Filtros de Exportación</h3>
      <p className={styles.subtitle}>Selecciona los criterios requeridos para descargar la información.</p>

      <form onSubmit={handleDownload} className={styles.formGrid}>
        <div className={styles.inputGroup}>
          <label htmlFor="convocatoria">Convocatoria</label>
          <input
            type="text"
            id="convocatoria"
            name="convocatoria"
            value={filters.convocatoria}
            onChange={handleChange}
            placeholder="Ej. Convocatoria 2026"
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="no_direccion">No. Dirección</label>
          <input
            type="text"
            id="no_direccion"
            name="no_direccion"
            value={filters.no_direccion}
            onChange={handleChange}
            placeholder="Número de dirección"
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="estado">Estado</label>
          <input
            type="text"
            id="estado"
            name="estado"
            value={filters.estado}
            onChange={handleChange}
            placeholder="Ej. Aceptado / Rechazado"
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="folio">Folio</label>
          <input
            type="text"
            id="folio"
            name="folio"
            value={filters.folio}
            onChange={handleChange}
            placeholder="Ej. FOL-12345"
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="edad_menor">Edad del Menor</label>
          <input
            type="number"
            id="edad_menor"
            name="edad_menor"
            value={filters.edad_menor}
            onChange={handleChange}
            placeholder="Ej. 5"
            min="0"
          />
        </div>
        <div className={styles.buttonContainer}>
          <button type="submit" disabled={loading} className={styles.submitBtn}>
            {loading ? 'Generando reporte...' : 'Descargar Reporte'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchRegisters;