import React, { useState, useEffect } from 'react';
import { X, Save, MapPin, School, Table, Award, Shield, User, Phone, Trash2, AlertTriangle } from 'lucide-react';
import { SelectField } from '../forms/SelectField.jsx';
import { InputField } from '../forms/InputField.jsx';
import { DISTRITOS_LIMA, ROLES } from '../../constants/catalogs.js';
import { api } from '../../services/api.js';

export function EditAssignmentModal({ personero, onClose, onSaved }) {
  const rawMesa = personero['Mesa Asignada'] || personero.mesaAsignada || '';
  const initialMesa = (rawMesa === '-' || rawMesa.toLowerCase() === 'no aplica') ? '' : rawMesa;

  const [formData, setFormData] = useState({
    nombresApellidos: personero['Nombres y Apellidos'] || personero.nombresApellidos || '',
    celular: personero['Celular'] || personero.celular || '',
    distritoAsignado: personero['Distrito Asignado'] || personero['Distrito donde Vota'] || personero.distritoAsignado || '',
    localAsignado: personero['Local de Votación Asignado'] || personero['Local de Votación'] || personero.localDeVotacionAsignado || '',
    mesaAsignada: initialMesa,
    rolADesempenar: personero['Rol a Desempeñar'] || personero.rolADesempenar || 'Personero de Mesa',
    credenciales: personero['Credenciales'] || personero.credenciales || 'Bloqueado'
  });

  const [locales, setLocales] = useState([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
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
    if (name === 'mesaAsignada') {
      const clean = value.replace(/\D/g, '').slice(0, 6);
      setFormData(prev => ({ ...prev, mesaAsignada: clean }));
      return;
    }
    if (name === 'celular') {
      const clean = value.replace(/\D/g, '').slice(0, 9);
      setFormData(prev => ({ ...prev, celular: clean }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    try {
      await api.updatePersonero(dni, formData);
      onSaved();
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Error al guardar cambios');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(`¿Está seguro de eliminar definitivamente a "${formData.nombresApellidos}" (DNI: ${dni}) del sistema? Esta acción no se puede deshacer.`);
    if (!confirmDelete) return;

    setDeleting(true);
    setErrorMsg(null);
    try {
      await api.deletePersonero(dni);
      onSaved();
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Error al eliminar personero');
      setDeleting(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '620px', maxHeight: '92vh', overflowY: 'auto' }}>
        
        {/* Header */}
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: '14px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0284c7', margin: 0 }}>
              Modificar Datos del Personero
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>
              DNI: {dni}
            </span>
          </div>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} className="modal-body" style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {errorMsg && (
            <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Nombres y Celular */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '12px' }}>
            <InputField
              label="Nombres y Apellidos"
              icon={User}
              name="nombresApellidos"
              value={formData.nombresApellidos}
              onChange={handleChange}
              placeholder="Nombres completos"
              required
            />
            <InputField
              label="Celular"
              icon={Phone}
              name="celular"
              value={formData.celular}
              onChange={handleChange}
              placeholder="9 dígitos"
              maxLength={9}
              required
            />
          </div>

          {/* Rol y Credencial */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <SelectField
              label="Rol a Desempeñar"
              icon={Award}
              name="rolADesempenar"
              value={formData.rolADesempenar}
              onChange={handleChange}
              options={ROLES}
              required
            />
            <SelectField
              label="Estado de Credencial"
              icon={Shield}
              name="credenciales"
              value={formData.credenciales}
              onChange={handleChange}
              options={['Bloqueado', 'Confirmado']}
            />
          </div>

          {/* Distrito y Mesa Asignada (Solo para Personero de Mesa) */}
          <div style={{ display: 'grid', gridTemplateColumns: (formData.rolADesempenar || '').toLowerCase().includes('personero') ? '1fr 1fr' : '1fr', gap: '12px' }}>
            <SelectField
              label="Distrito Asignado"
              icon={MapPin}
              name="distritoAsignado"
              value={formData.distritoAsignado}
              onChange={handleChange}
              options={DISTRITOS_LIMA}
              required
            />
            {(formData.rolADesempenar || '').toLowerCase().includes('personero') && (
              <div>
                <InputField
                  label="Mesa Asignada"
                  icon={Table}
                  name="mesaAsignada"
                  value={formData.mesaAsignada}
                  onChange={handleChange}
                  placeholder="Ej. 064321 (Mesa asignada)"
                  maxLength={6}
                />
                <span style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 600, display: 'block', marginTop: '2px' }}>
                  💡 Ingrese el número de mesa para asignársela
                </span>
              </div>
            )}
          </div>

          {/* Local Asignado */}
          <SelectField
            label="Local de Votación Asignado"
            icon={School}
            name="localAsignado"
            value={formData.localAsignado}
            onChange={handleChange}
            options={locales}
            placeholder={locales.length ? "Seleccione local" : "Seleccione primero el distrito"}
          />

          {/* Footer con Guardar y Eliminar */}
          <div className="modal-footer" style={{ marginTop: '20px', padding: '14px 0 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #334155' }}>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting || saving}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 15px',
                borderRadius: '8px',
                border: '1px solid #ef4444',
                background: '#fef2f2',
                color: '#dc2626',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: (deleting || saving) ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Trash2 className="w-4 h-4" />
              <span>{deleting ? 'Eliminando...' : 'Eliminar Personero'}</span>
            </button>

            <button
              type="submit"
              disabled={saving || deleting}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 20px',
                borderRadius: '8px',
                background: 'rgb(14, 165, 233)',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.85rem',
                border: 'none',
                cursor: (saving || deleting) ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 8px rgba(14, 165, 233, 0.35)'
              }}
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Guardando...' : 'Guardar Datos'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
