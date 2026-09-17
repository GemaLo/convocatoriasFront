import React, { useState, useEffect } from 'react';
import styles from './searchRegisters.module.css';
import { API_ENDPOINTS } from '../../config/api';
import Swal from 'sweetalert2';

export const SearchRegisters: React.FC = () => {
  const [filters, setFilters] = useState({
    convocatoria: '',
    no_direccion: '',
    estado: '',
    folio: '',
    edad_menor: '',
    formato: 'xlsx',
  });

  const [convocatorias, setConvocatorias] = useState<any[]>([]);
  const [direcciones, setDirecciones] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<any[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSelectData = async () => {
      const token = localStorage.getItem('auth_token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      };

      try {
        const [resCalls, resUnits, resStatuses] = await Promise.all([
          fetch(`${API_ENDPOINTS.MAIN}/calls`, { headers }),
          fetch(`${API_ENDPOINTS.MAIN}/units`, { headers }),
          fetch(`${API_ENDPOINTS.MAIN}/statuses`, { headers })
        ]);

        const dataCalls = await resCalls.json();
        const dataUnits = await resUnits.json();
        const dataStatuses = await resStatuses.json();

        if (resCalls.ok) {
          const callsList = Array.isArray(dataCalls) ? dataCalls : (dataCalls.data || []);
          setConvocatorias(callsList);
        }

        if (resUnits.ok) {
          const unitsList = Array.isArray(dataUnits) ? dataUnits : (dataUnits.data || []);
          setDirecciones(unitsList);
        }

        if (resStatuses.ok) {
          const statusesList = Array.isArray(dataStatuses) ? dataStatuses : (dataStatuses.data || []);
          const parsedStatuses = statusesList.map((item: any) => ({
            id: Number(item.id || item.ID || item.idstatus || item.IDSTATUS),
            status: String(item.status || item.STATUS || item.nombre || '')
          }));
          setStatuses(parsedStatuses);
        }

      } catch (error) {
        console.error("Error al cargar los catálogos para filtros:", error);
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchSelectData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  // 👈 Ahora recibe correctamente el tipo de "filters"
  const handleDownload = async (currentFilters: typeof filters) => {
    setLoading(true);

    try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`${API_ENDPOINTS.MAIN}/reports/download`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/json'
            },
            body: JSON.stringify(currentFilters)
        });

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'El servidor denegó la descarga.');
        }

        if (!response.ok) {
            throw new Error('Error al generar el reporte en el servidor.');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        const extension = currentFilters.formato || 'xlsx';
        a.download = `reporte_registros_${Date.now()}.${extension}`;
        
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
            window.URL.revokeObjectURL(url);
            a.remove();
        }, 100);

        Swal.fire({
            icon: 'success',
            title: '¡Reporte generado!',
            text: 'La descarga se ha completado con éxito.',
            timer: 2000,
            showConfirmButton: false
        });

    } catch (error: any) {
        console.error("Error en descarga:", error);
        Swal.fire({
            icon: 'error',
            title: 'Atención',
            text: error.message || 'Ocurrió un problema al descargar el reporte.'
        });
    } finally {
        setLoading(false);
    }
  };

  // 👈 Función envoltorio para prevenir recargas y pasar los filtros limpios
  const onSubmitDownload = (e: React.FormEvent) => {
    e.preventDefault();
    handleDownload(filters);
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Filtros de Exportación</h3>
      <p className={styles.subtitle}>Selecciona los criterios requeridos para descargar la información.</p>

      {/* 👈 Se usa onSubmitDownload en lugar de handleDownload directo */}
      <form onSubmit={onSubmitDownload} className={styles.formGrid}>

        <div className={styles.inputGroup}>
          <label htmlFor="convocatoria">Convocatoria</label>
          <select
            id="convocatoria"
            name="convocatoria"
            value={filters.convocatoria}
            onChange={handleChange}
            disabled={loadingOptions}
          >
            <option value="">{loadingOptions ? 'Cargando convocatorias...' : 'Seleccione una convocatoria'}</option>
            {convocatorias.map((call) => {
              const id = call.IDCALL ?? call.idcall ?? call.id;
              const title = call.NAMECALL ?? call.namecall ?? call.titulo ?? call.nombre;
              return (
                <option key={id} value={id}>
                  {title}
                </option>
              );
            })}
          </select>
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="no_direccion">No. Dirección</label>
          <select
            id="no_direccion"
            name="no_direccion"
            value={filters.no_direccion}
            onChange={handleChange}
            disabled={loadingOptions}
          >
            <option value="">{loadingOptions ? 'Cargando direcciones...' : 'Seleccione una dirección'}</option>
            {direcciones.map((unit) => {
              const id = unit.idunit || unit.ID;
              const name = unit.unit;
              return (
                <option key={id} value={id}>
                  {name ? `${name}` : id}
                </option>
              );
            })}
          </select>
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="estado">Estado</label>
          <select
            id="estado"
            name="estado"
            value={filters.estado}
            onChange={handleChange}
            disabled={loadingOptions}
          >
            <option value="">{loadingOptions ? 'Cargando estados...' : 'Seleccione un estado'}</option>
            {statuses.map((st) => (
              <option key={st.id} value={st.id}>
                {st.status}
              </option>
            ))}
          </select>
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