import React from 'react';
import { useRegisterForm } from './useRegisterForm';

export const Register: React.FC = () => {
  const {
    formData,
    menores,
    isFetched,
    loading,
    warning,
    constanciaData,
    submitting,
    convocatoriaActiva,
    checkingConvocatoria,
    setConstanciaData,
    handleChange,
    handleRfcChange,
    agregarMenor,
    eliminarMenor,
    handleMenorChange,
    handlePreviewLocalPdf,
    consultarEmpleado,
    handleSubmit
  } = useRegisterForm();

  if (checkingConvocatoria) {
    return (
      <div className="app-container text-center p-5" role="status">
        <div className="spinner-border text-primary">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-3 text-muted">Verificando convocatorias vigentes...</p>
      </div>
    );
  }

  if (!convocatoriaActiva) {
    return (
      <div className="app-container">
        <div className="card-custom p-5 text-center bg-white border rounded shadow-sm">
          <h3 className="text-secondary fw-bold mb-3">Convocatoria Inactiva</h3>
          <p className="lead text-muted mb-0">
            Actualmente no se encuentra ninguna convocatoria abierta para realizar registros.
          </p>
          <p className="text-muted small mt-2">
            Por favor, consulta los avisos oficiales para futuras fechas de registro.
          </p>
        </div>
      </div>
    );
  }

  if (constanciaData) {
    return (
      <div className="app-container">
        <div className="card-custom p-4 border rounded shadow-sm text-center">
          <h3 className="text-success mb-3">¡Registro Completado con Éxito!</h3>
          <p className="lead">Constancia de Recepción de Documentos</p>
          <div className="text-start d-inline-block bg-light p-4 rounded border my-3">
            <p><strong>Folio de Registro:</strong> {constanciaData.folio}</p>
            <p><strong>Empleado:</strong> {constanciaData.candidato} ({constanciaData.numEmpleado})</p>
            <p><strong>Menores Registrados:</strong> {menores.length}</p>
            <p><strong>Fecha de Registro:</strong> {constanciaData.fecha}</p>
          </div>
          <div className="mt-3">
            <button className="btn btn-primary me-2" onClick={() => window.print()}>
              Imprimir Constancia
            </button>
            <button className="btn btn-secondary" onClick={() => setConstanciaData(null)}>
              Realizar otro registro
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="card-custom">
        <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
          <div>
            <h2 className="h4 fw-bold text-dark mb-1">Registro de Familiares</h2>
            <span className="text-muted small">
              Convocatoria {convocatoriaActiva.titulo || new Date().getFullYear()}
            </span>
          </div>
        </div>

        {warning && (
          <div className="alert alert-danger mb-4" role="alert">
            {warning}
          </div>
        )}

        <p className="card-inside-title mb-4">
          Para mostrar la información solicitada, llene el campo de número de empleado y haga clic en el botón de consultar.
          Los archivos PDF que se suban al sistema no deben exceder los 2MB de tamaño.
          En caso de que el archivo sea más grande, favor de reducir su tamaño antes de subirlo.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="row g-3 mb-3">
            <div className="col-md-3">
              <label htmlFor="numeroEmpleado" className="form-label">No. de empleado:</label>
              <div className="input-group">
                <input
                  id="numeroEmpleado"
                  type="text"
                  className="form-control"
                  name="numeroEmpleado"
                  value={formData.numeroEmpleado}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="btn btn-gradient-primary btn-sm px-3 py-2"
                  onClick={consultarEmpleado}
                  disabled={loading}
                >
                  {loading ? 'Cargando...' : 'Consultar'}
                </button>
              </div>
            </div>

            <div className="col-md-3">
              <label htmlFor="cargo" className="form-label">Cargo:</label>
              <input
                id="cargo"
                type="text"
                className="form-control"
                name="cargo"
                value={formData.cargo}
                onChange={handleChange}
                readOnly={isFetched}
                required
              />
            </div>
            <div className="col-md-2">
              <label htmlFor="fechaIngreso" className="form-label">Fecha de Ingreso:</label>
              <input
                id="fechaIngreso"
                type="date"
                className="form-control"
                name="fechaIngreso"
                value={formData.fechaIngreso}
                onChange={handleChange}
                readOnly={isFetched}
                required
              />
            </div>
            <div className="col-md-4">
              <label htmlFor="nomPersona" className="form-label">Nombre (s):</label>
              <input
                id="nomPersona"
                type="text"
                className="form-control text-uppercase"
                name="nomPersona"
                value={formData.nomPersona}
                onChange={handleChange}
                readOnly={isFetched}
                required
              />
            </div>
          </div>

          <div className="row g-3 mb-3">
            <div className="col-md-4">
              <label htmlFor="appPersona" className="form-label">Apellido Paterno:</label>
              <input
                id="appPersona"
                type="text"
                className="form-control text-uppercase"
                name="appPersona"
                value={formData.appPersona}
                onChange={handleChange}
                readOnly={isFetched}
              />
            </div>
            <div className="col-md-4">
              <label htmlFor="apmPersona" className="form-label">Apellido Materno:</label>
              <input
                id="apmPersona"
                type="text"
                className="form-control text-uppercase"
                name="apmPersona"
                value={formData.apmPersona}
                onChange={handleChange}
                readOnly={isFetched}
              />
            </div>
            <div className="col-md-4">
              <label htmlFor="curp" className="form-label">CURP:</label>
              <input
                id="curp"
                type="text"
                className="form-control text-uppercase"
                name="curp"
                value={formData.curp}
                onChange={handleChange}
                readOnly={isFetched}
                maxLength={18}
                required
              />
            </div>
          </div>

          <div className="row g-3 mb-3">
            <div className="col-md-3">
              <label htmlFor="rfc" className="form-label">RFC:</label>
              <input
                id="rfc"
                type="text"
                className="form-control text-uppercase"
                name="rfc"
                value={formData.rfc}
                onChange={handleRfcChange}
                readOnly={isFetched}
                maxLength={13}
                required
              />
            </div>
            <div className="col-md-2">
              <label htmlFor="telefono" className="form-label">Teléfono:</label>
              <input
                id="telefono"
                type="tel"
                pattern="[0-9]{10}"
                className="form-control"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-7">
              <label htmlFor="correoC" className="form-label">Correo Electrónico:</label>
              <div className="input-group">
                <input
                  id="correoC"
                  type="text"
                  className="form-control"
                  name="correoC"
                  value={formData.correoC}
                  onChange={handleChange}
                  required
                />
                <span className="input-group-text">@</span>
                <select
                  aria-label="Servidor de correo"
                  className="form-select"
                  name="servidor"
                  value={formData.servidor}
                  onChange={handleChange}
                  required
                >
                  <option value="@gmail.com">gmail.com</option>
                  <option value="@hotmail.com">hotmail.com</option>
                  <option value="@outlook.com">outlook.com</option>
                </select>
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-between align-items-center pt-3 border-top mb-3">
            <h6 className="fw-bold text-secondary m-0">Documentación de Menores (PDF max 2MB)</h6>
            <button
              type="button"
              className="btn btn-outline-success btn-sm"
              onClick={agregarMenor}
            >
              + Añadir otro menor
            </button>
          </div>

          {menores.map((menor, index) => (
            <div key={menor.id} className="p-3 border rounded bg-light mb-3 position-relative">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="badge bg-secondary">Menor #{index + 1}</span>
                {menores.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm py-0 px-2"
                    onClick={() => eliminarMenor(menor.id)}
                  >
                    Eliminar
                  </button>
                )}
              </div>

              <div className="row g-3 align-items-start">
                <div className="col-md-3">
                  <label htmlFor={`curpMenor-${menor.id}`} className="form-label">CURP del menor:</label>
                  <input
                    id={`curpMenor-${menor.id}`}
                    type="text"
                    className="form-control text-uppercase"
                    value={menor.curpMenor}
                    onChange={(e) => handleMenorChange(menor.id, 'curpMenor', e.target.value)}
                    required
                    maxLength={18}
                  />
                </div>
                <div className="col-md-1">
                  <label htmlFor={`edad-${menor.id}`} className="form-label">Edad:</label>
                  <input
                    id={`edad-${menor.id}`}
                    type="number"
                    className="form-control"
                    value={menor.edad}
                    onChange={(e) => handleMenorChange(menor.id, 'edad', e.target.value)}
                    required
                    min="0"
                    max="18"
                  />
                </div>

                <div className="col-md-4">
                  <label htmlFor={`fileCurp-${menor.id}`} className="form-label">
                    CURP (PDF): <span className="text-danger">*</span>
                  </label>
                  <input
                    id={`fileCurp-${menor.id}`}
                    type="file"
                    className="form-control"
                    accept=".pdf"
                    required
                    onChange={(e) => handleMenorChange(menor.id, 'fileCurp', e.target.files?.[0] || null)}
                  />
                  {menor.fileCurp && (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-info mt-2 w-100"
                      onClick={() => handlePreviewLocalPdf(menor.fileCurp)}
                    >
                      👁 Previsualizar CURP
                    </button>
                  )}
                </div>

                <div className="col-md-4">
                  <label htmlFor={`fileActa-${menor.id}`} className="form-label">Acta de Nacimiento (PDF):</label>
                  <input
                    id={`fileActa-${menor.id}`}
                    type="file"
                    className="form-control"
                    accept=".pdf"
                    onChange={(e) => handleMenorChange(menor.id, 'fileActa', e.target.files?.[0] || null)}
                  />
                  {menor.fileActa && (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-info mt-2 w-100"
                      onClick={() => handlePreviewLocalPdf(menor.fileActa)}
                    >
                      👁 Previsualizar Acta
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          <div className="text-end pt-3 border-top">
            <button
              type="submit"
              className="btn btn-enviar rounded-2 px-4"
              disabled={submitting || Boolean(warning)}
            >
              {submitting ? 'Guardando...' : 'Enviar Registro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};