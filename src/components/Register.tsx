import React, { useState } from 'react';

export const Register: React.FC = () => {
    const [formData, setFormData] = useState({
        municipio: '',
        nivelEstudios: '',
        sexo: 'MASCULINO',
        edad: '',
        nomPersona: '',
        appPersona: '',
        apmPersona: '',
        curp: '',
        rfc: '',
        direccion: '',
        cp: '',
        correoC: '',
        servidor: '@gmail.com',
        telefono: '',
    });

    const [warning, setWarning] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCurpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const curpVal = e.target.value.toUpperCase();
        setFormData((prev) => ({ ...prev, curp: curpVal }));

        if (curpVal.length >= 10) {
            const yearTwoDigits = parseInt(curpVal.substring(4, 6), 10);
            const currentYear = new Date().getFullYear();
            const fullYear = yearTwoDigits > 30 ? 1900 + yearTwoDigits : 2000 + yearTwoDigits;
            const estimatedAge = currentYear - fullYear;

            if (!isNaN(estimatedAge) && estimatedAge > 0 && estimatedAge < 100) {
                setFormData((prev) => ({ ...prev, edad: estimatedAge.toString() }));
            }
        }
    };

    const handleRfcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rfcVal = e.target.value.toUpperCase();
        setFormData((prev) => ({ ...prev, rfc: rfcVal }));

        if (formData.curp && rfcVal) {
            if (formData.curp.substring(0, 10) !== rfcVal.substring(0, 10)) {
                setWarning('EL CURP Y EL RFC NO COINCIDEN EN SUS PRIMEROS 10 CARACTERES');
            } else {
                setWarning(null);
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert('Formulario listo en modo boceto.');
    };

    return (
        <div className="card-custom">
            <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
                <div>
                    <h2 className="h4 fw-bold text-dark mb-1">Registro de Familiares</h2>
                    <span className="text-muted small">Convocatoria {new Date().getFullYear()}</span>
                </div>
                <div>
                    <button type="button" className="btn btn-gradient-primary btn-sm px-3 py-2">
                        Consultar Número de Folio
                    </button>
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
                {/* Fila 1 */}
                <div className="row g-3 mb-3">
                    <div className="col-md-4">
                        <label className="form-label">Número de empleado:</label>
                        <input type="text" className="form-control" name="numeroEmpleado" value={formData.numeroEmpleado} onChange={handleChange} required />   
                    </div>

                    <div className="col-md-4">
                        <label className="form-label">Cargo:</label>
                        <input type="text" className="form-control" name="nomPersona" value={formData.nomPersona} onChange={handleChange} required maxLength={40} />
                    </div>

                    <div className="col-md-2">
                        <label className="form-label">Género:</label>
                        <div className="pt-1">
                            <div className="form-check form-check-inline">
                                <input className="form-check-input" type="radio" name="sexo" id="male" value="MASCULINO" checked={formData.sexo === 'MASCULINO'} onChange={handleChange} />
                                <label className="form-check-label" htmlFor="male">M</label>
                            </div>
                            <div className="form-check form-check-inline">
                                <input className="form-check-input" type="radio" name="sexo" id="female" value="FEMENINO" checked={formData.sexo === 'FEMENINO'} onChange={handleChange} />
                                <label className="form-check-label" htmlFor="female">F</label>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-2">
                        <label className="form-label">Edad:</label>
                        <input type="number" className="form-control" name="edad" value={formData.edad} readOnly/>
                    </div>
                </div>

                <div className="row g-3 mb-3">
                    <div className="col-md-4">
                        <label className="form-label">Nombre (s):</label>
                        <input type="text" className="form-control text-uppercase" name="nomPersona" value={formData.nomPersona} onChange={handleChange} required maxLength={40} />
                    </div>
                    <div className="col-md-4">
                        <label className="form-label">Apellido Paterno:</label>
                        <input type="text" className="form-control text-uppercase" name="appPersona" value={formData.appPersona} onChange={handleChange} maxLength={40} />
                    </div>
                    <div className="col-md-4">
                        <label className="form-label">Apellido Materno:</label>
                        <input type="text" className="form-control text-uppercase" name="apmPersona" value={formData.apmPersona} onChange={handleChange} maxLength={40} />
                    </div>
                </div>

                <div className="row g-3 mb-3">
                    <div className="col-md-3">
                        <label className="form-label">CURP:</label>
                        <input type="text" className="form-control text-uppercase" name="curp" value={formData.curp} onChange={handleCurpChange} required maxLength={18} />
                    </div>
                    <div className="col-md-3">
                        <label className="form-label">RFC:</label>
                        <input type="text" className="form-control text-uppercase" name="rfc" value={formData.rfc} onChange={handleRfcChange} required maxLength={13} />
                    </div>  
                    <div className="col-md-2">
                        <label className="form-label">Fecha de Ingreso:</label>
                        <input type="date" className="form-control" name="cp" value={formData.cp} onChange={handleChange} required maxLength={5} />
                    </div>
                </div>

                <div className="row g-3 mb-4">
                    <div className="col-md-8">
                        <label className="form-label">Correo Electrónico:</label>
                        <div className="input-group">
                            <input type="text" className="form-control" name="correoC" value={formData.correoC} onChange={handleChange} required />
                            <span className="input-group-text">@</span>
                            <select className="form-select" name="servidor" value={formData.servidor} onChange={handleChange} required>
                                <option value="@gmail.com">gmail.com</option>
                                <option value="@hotmail.com">hotmail.com</option>
                                <option value="@outlook.com">outlook.com</option>
                            </select>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <label className="form-label">Teléfono:</label>
                        <input type="number" className="form-control" name="telefono" value={formData.telefono} onChange={handleChange} required maxLength={10} />
                    </div>
                </div>

                <h6 className="fw-bold text-secondary mb-3 pt-2 border-top">Documentación Requerida (PDF max 2MB)</h6>
                <div className="row g-3 mb-4">
                    <div className="col-md-4">
                        <label className="form-label">CURP (PDF): <span className="text-danger">*</span></label>
                        <input type="file" className="form-control" accept=".pdf" required />
                    </div>
                    <div className="col-md-4">
                        <label className="form-label">Acta de Nacimiento (PDF):</label>
                        <input type="file" className="form-control" accept=".pdf" />
                    </div>
                </div>

                <div className="text-end pt-3 border-top">
                    <button type="submit" className="btn btn-enviar rounded-2">
                        Enviar Registro
                    </button>
                </div>
            </form>
        </div>
    );
};