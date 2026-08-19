import React, { useState, useEffect } from 'react';
import { X, Save, MapPin, School, Table, Award, Shield } from 'lucide-react';
import { SelectField } from '../forms/SelectField.jsx';
import { InputField } from '../forms/InputField.jsx';
import { DISTRITOS_LIMA, ROLES } from '../../constants/catalogs.js';
import { api } from '../../services/api.js';

export function EditAssignmentModal({ personero, onClose, onSaved }) {
  const [formData, setFormData] = useState({
    distritoAsignado: personero['Distrito Asignado'] || personero['Distrito donde Vota'] || '',
    localAsignado: personero['Local de Votación Asignado'] || personero['Local de Votación'] || '',
    mesaAsignada: personero['Mesa Asignada'] || personero['Mesa de Sufragio'] || '',
    rolADesempenar: personero['Rol a Desempeñar'] || 'Personero de Mesa',
    credenciales: personero['Credenciales'] || 'Bloqueado'
  });

  const [locales, setLocales] = useState([]);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const dni = personero['D.N.I.'] || personero['DNI'] || personero.dni;

  useEffect(() => {
    if (formData.distritoAsignado) {
      api.getLocales(formData.distritoAsignado)
        .then(res => setLocales(res.data || []))
        .catch(() => setLocales([]));
    }
  }, [formData.distritoAsignado]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    try {
      await api.updateAssignment(dni, formData);
      onSaved();
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Error al guardar asignación');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '580px' }}>
        
        {/* Header */}
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
              Editar Asignación Electoral
            </h3>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
              {personero['Nombres y Apellidos']} (DNI: {dni})
            </span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} className="modal-body">
          {errorMsg && (
            <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', fontSize: '0.82rem', marginBottom: '16px', fontWeight: 600 }}>
              ⚠️ {errorMsg}
            </div>
          )}

          <SelectField
            label="Rol a Desempeñar"
            icon={Award}
            name="rolADesempenar"
            value={formData.rolADesempenar}
            onChange={handleChange}
            options={ROLES}
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <SelectField
              label="Distrito Asignado"
              icon={MapPin}
              name="distritoAsignado"
              value={formData.distritoAsignado}
              onChange={handleChange}
              options={DISTRITOS_LIMA}
              required
            />
            <InputField
              label="Mesa Asignada"
              icon={Table}
              name="mesaAsignada"
              value={formData.mesaAsignada}
              onChange={handleChange}
              placeholder="Número de mesa"
            />
          </div>

          <SelectField
            label="Local de Votación Asignado"
            icon={School}
            name="localAsignado"
            value={formData.localAsignado}
            onChange={handleChange}
            options={locales}
            placeholder={locales.length ? "Seleccione local" : "Seleccione primero el distrito"}
          />

          <SelectField
            label="Estado de Credencial"
            icon={Shield}
            name="credenciales"
            value={formData.credenciales}
            onChange={handleChange}
            options={['Bloqueado', 'Confirmado']}
          />

          {/* Footer */}
          <div className="modal-footer" style={{ marginTop: '20px', padding: 0, background: 'none', border: 'none' }}>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="btn-primary" style={{ width: 'auto' }}>
              <Save className="w-4 h-4" />
              <span>{saving ? 'Guardando en SQL...' : 'Guardar Cambios'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
