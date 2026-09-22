import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  LayoutGrid, GraduationCap, Cable, RefreshCw, LogOut, Moon, Sun,
  Users, UserCheck, ShieldCheck, CheckCircle2, Car, Calendar, Info,
  FileSpreadsheet, Phone, Search, X, Check, Lock, Video, FileText,
  AlertCircle, ChevronRight, ChevronLeft, Menu, Edit3, Heart, Filter, RotateCcw, School, Layers, Building2,
  Navigation, MapPin, ArrowUpDown, History, Trash2, Clock, Activity, Shield, Bell, Eye, CheckCheck, Award
} from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { EditAssignmentModal } from '../../components/modals/EditAssignmentModal.jsx';
import { CertificateModal } from '../../components/modals/CertificateModal.jsx';
import { TrayectoView } from './TrayectoView.jsx';
import { ZonasElectoralesView } from './ZonasElectoralesView.jsx';
import { MapaZonasVMTView } from './MapaZonasVMTView.jsx';
import { bloomSearchAccelerator } from '../../utils/BloomFilter.js';
import {
  DISTRITOS_LIMA, DISTRITO_METAS, ROLES, TOTAL_MESAS_LIMA,
  TOTAL_MESAS_LIMA_METROPOLITANA, TOTAL_LOCALES_LIMA_METROPOLITANA, TOTAL_ELECTORES_LIMA_METROPOLITANA,
  getMesasForLocal, getMesasForDistrito, getElectoresForDistrito, getLocalesCountForDistrito
} from '../../constants/catalogs.js';
import { getLocalesByDistrito, findOfficialLocal } from '../../constants/localesCatalog.js';
import { exportPadronToExcel } from '../../utils/exportFilteredExcel.js';
import { getVmtAssignedZoneForUser, getSchoolsForVmtZone } from '../../constants/vmtCoordinadoresZonales.js';
import { api } from '../../services/api.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);
ChartJS.defaults.events = ['mousemove', 'mouseout', 'click'];

// Helper de normalización distrital
function normalizeDistrictName(name) {
  if (!name) return '';
  let clean = String(name).trim().toUpperCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (clean.includes('LURIGANCHO') || clean.includes('CHOSICA')) return 'LURIGANCHO';
  if (clean.includes('CERCADO') || clean === 'LIMA' || clean === 'LIMA CERCADO') return 'LIMA';
  return clean;
}

function matchesDistrict(recordDistrict, filterDistrict) {
  if (!filterDistrict || filterDistrict === 'all') return true;
  if (!recordDistrict) return false;
  return normalizeDistrictName(recordDistrict) === normalizeDistrictName(filterDistrict);
}

// Helper de normalización de local de votación (colegio)
function normalizeLocalName(name) {
  if (!name) return '';
  return String(name).trim().toUpperCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function matchesLocal(recordLocal, filterLocal) {
  if (!filterLocal || filterLocal === 'all') return true;
  if (!recordLocal) return false;
  const normRec = normalizeLocalName(recordLocal);
  const normFilt = normalizeLocalName(filterLocal);
  return normRec === normFilt || normRec.includes(normFilt) || normFilt.includes(normRec);
}

// Helper de roles (Personero de Mesa, Personero de Centro de Votación / Local, Coordinador Zonal y Coordinador Distrital)
function matchesRole(recordRole, filterRole) {
  if (!filterRole || filterRole === 'all') return true;
  if (!recordRole) return false;
  const r = String(recordRole).trim().toLowerCase();
  const f = String(filterRole).trim().toLowerCase();
  
  if (f.includes('distrito') || f.includes('distrital')) {
    return r.includes('distrito') || r.includes('distrital');
  }
  if (f.includes('zonal') || f.includes('zona')) {
    return r.includes('zonal') || r.includes('zona');
  }
  if (f.includes('local') || f.includes('centro') || f.includes('pcv') || f.includes('plv')) {
    return (r.includes('local') || r.includes('centro') || r.includes('pcv') || r.includes('plv') || (r.includes('coordinador') && !r.includes('distrito') && !r.includes('distrital') && !r.includes('zonal') && !r.includes('zona')));
  }
  if (f.includes('mesa') || f.includes('personero')) {
    return (r.includes('mesa') || (!r.includes('local') && !r.includes('centro') && !r.includes('coordinador') && !r.includes('distrito') && !r.includes('distrital') && !r.includes('zonal') && !r.includes('zona')));
  }
  return r === f || r.includes(f);
}

// Componente para renderizar elegantemente listas de colegios asignados (ej. Coordinador Zonal con 15+ colegios)
function AssignedSchoolsPillList({ schools = '', isDark = false, borderCol = '#cbd5e1' }) {
  const [expanded, setExpanded] = useState(false);
  const list = Array.isArray(schools)
    ? schools.filter(Boolean)
    : String(schools || '').split(',').map(s => s.trim()).filter(Boolean);

  if (list.length === 0 || list[0] === '-' || list[0].toLowerCase() === 'no aplica') {
    return <span style={{ color: '#94a3b8' }}>—</span>;
  }

  if (list.length === 1) {
    return <span style={{ fontWeight: 600, color: isDark ? '#e2e8f0' : '#1e293b' }}>{list[0]}</span>;
  }

  const visible = expanded ? list : list.slice(0, 2);
  const remaining = list.length - 2;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
        <span style={{
          background: isDark ? 'rgba(139, 92, 246, 0.25)' : '#ede9fe',
          color: '#7c3aed',
          fontSize: '0.72rem',
          fontWeight: 800,
          padding: '2px 7px',
          borderRadius: '12px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          border: '1px solid rgba(139, 92, 246, 0.3)'
        }}>
          <span>🗺️ Zona: {list.length} locales de votación asignados</span>
        </span>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
          style={{
            background: isDark ? 'rgba(2, 132, 199, 0.15)' : '#e0f2fe',
            border: '1px solid #bae6fd',
            color: '#0284c7',
            fontSize: '0.7rem',
            fontWeight: 800,
            borderRadius: '4px',
            padding: '2px 6px',
            cursor: 'pointer'
          }}
        >
          {expanded ? '▲ Colapsar' : `▼ Ver todos (${list.length})`}
        </button>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxHeight: expanded ? '180px' : 'none', overflowY: expanded ? 'auto' : 'visible' }}>
        {visible.map((sch, i) => (
          <span
            key={i}
            title={sch}
            style={{
              background: isDark ? 'rgba(255,255,255,0.06)' : '#f8fafc',
              color: isDark ? '#e2e8f0' : '#334155',
              border: `1px solid ${borderCol}`,
              borderRadius: '6px',
              padding: '2px 7px',
              fontSize: '0.71rem',
              fontWeight: 600,
              lineHeight: 1.2,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span>🏫</span>
            <span>{sch}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// Componente para tarjeta individual balanceada, compacta, simétrica y ordenada de Coordinador Zonal
function ZonalOverviewCard({ zonal, isDark, borderCol, onEdit }) {
  const [showModal, setShowModal] = useState(false);
  const total = zonal.colegios.length;

  return (
    <>
      <div
        style={{
          background: isDark ? '#1e293b' : '#ffffff',
          border: `1px solid ${borderCol}`,
          borderLeft: '4px solid #8b5cf6',
          borderRadius: '12px',
          padding: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.2)' : '0 1px 6px rgba(0,0,0,0.04)',
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        {/* Header del Zonal */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '9px', alignItems: 'center', minWidth: 0, flex: 1 }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '9px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '0.86rem',
              flexShrink: 0
            }}>
              {zonal.nombre.charAt(0).toUpperCase()}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                <strong
                  title={zonal.nombre}
                  style={{
                    fontSize: '0.88rem',
                    color: isDark ? '#f8fafc' : '#0f172a',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '150px'
                  }}
                >
                  {zonal.nombre}
                </strong>
                <span style={{
                  background: zonal.credencial === 'Confirmado' ? '#dcfce7' : '#fef9c3',
                  color: zonal.credencial === 'Confirmado' ? '#166534' : '#854d0e',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  padding: '1.5px 5px',
                  borderRadius: '4px',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}>
                  {zonal.credencial === 'Confirmado' ? '✅ Acreditado' : '⏳ En Proceso'}
                </span>
              </div>
              <div style={{ fontSize: '0.73rem', color: isDark ? '#94a3b8' : '#64748b', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span>DNI: <strong>{zonal.dni}</strong></span>
                {zonal.celular && (
                  <a
                    href={`https://wa.me/51${zonal.celular.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      color: '#16a34a',
                      fontWeight: 800,
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px',
                      background: isDark ? 'rgba(22, 163, 74, 0.15)' : '#dcfce7',
                      padding: '1px 6px',
                      borderRadius: '4px',
                      fontSize: '0.71rem'
                    }}
                  >
                    <Phone className="w-2.5 h-2.5" />
                    <span>{zonal.celular}</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => onEdit(zonal.raw)}
            style={{
              padding: '4px 8px',
              borderRadius: '6px',
              border: '1px solid #8b5cf6',
              background: isDark ? 'rgba(139, 92, 246, 0.15)' : '#ede9fe',
              color: '#7c3aed',
              fontSize: '0.7rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
              flexShrink: 0
            }}
          >
            <Edit3 className="w-3 h-3" />
            <span>Editar</span>
          </button>
        </div>

        {/* Indicadores Simétricos en Grid 2 Columnas (50% / 50%) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <div style={{
            background: isDark ? 'rgba(2, 132, 199, 0.12)' : '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: '8px',
            padding: '5px 8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '4px'
          }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#0369a1' }}>👥 Personeros:</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#0284c7' }}>{zonal.personerosEnZona}</span>
          </div>

          <div style={{
            background: isDark ? 'rgba(16, 185, 129, 0.12)' : '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '8px',
            padding: '5px 8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '4px'
          }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#15803d' }}>🏫 Con PCV:</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#16a34a' }}>{zonal.plvsEnZona}/{zonal.totalColegios}</span>
          </div>
        </div>

        {/* Colegios de su Zona (Horizontal limpio y simétrico con bordes visibles en modo claro) */}
        <div style={{
          background: isDark ? 'rgba(0,0,0,0.2)' : '#f1f5f9',
          borderRadius: '9px',
          padding: '7px 9px',
          border: `1px solid ${isDark ? borderCol : '#cbd5e1'}`,
          minWidth: 0,
          overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
            <div style={{ fontSize: '0.71rem', fontWeight: 800, color: isDark ? '#cbd5e1' : '#1e293b', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>🏫 Locales de Votación ({total}):</span>
            </div>
            {total > 2 && (
              <button
                type="button"
                onClick={() => setShowModal(true)}
                style={{
                  background: isDark ? 'rgba(139, 92, 246, 0.2)' : '#ede9fe',
                  border: isDark ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid #c4b5fd',
                  color: '#6d28d9',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  borderRadius: '5px',
                  padding: '2px 7px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  flexShrink: 0
                }}
              >
                <span>👁️ Ver todos ({total})</span>
              </button>
            )}
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '6px',
            overflowX: 'auto',
            overflowY: 'hidden',
            paddingBottom: '2px',
            minWidth: 0,
            width: '100%',
            scrollbarWidth: 'none'
          }}>
            {total > 0 ? (
              zonal.colegios.map((sch, schIdx) => (
                <div
                  key={schIdx}
                  title={sch}
                  style={{
                    background: isDark ? '#1e293b' : '#ffffff',
                    color: isDark ? '#e2e8f0' : '#0f172a',
                    fontSize: '0.71rem',
                    fontWeight: 700,
                    padding: '4px 8px',
                    borderRadius: '6px',
                    border: `1px solid ${isDark ? borderCol : '#94a3b8'}`,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    maxWidth: '200px',
                    boxShadow: isDark ? 'none' : '0 1px 2px rgba(0,0,0,0.05)'
                  }}
                >
                  <span style={{
                    background: isDark ? 'rgba(139, 92, 246, 0.25)' : '#ede9fe',
                    color: '#6d28d9',
                    fontSize: '0.64rem',
                    fontWeight: 900,
                    width: '16px',
                    height: '16px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {schIdx + 1}
                  </span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {sch}
                  </span>
                </div>
              ))
            ) : (
              <span style={{ fontSize: '0.7rem', color: '#ef4444', fontStyle: 'italic' }}>
                Sin colegios asignados
              </span>
            )}
          </div>
        </div>
      </div>

      {/* POPUP MODAL ELEGANTE PARA VER TODOS LOS COLEGIOS DE LA ZONA */}
      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '16px',
            zIndex: 9999,
            animation: 'fadeIn 0.15s ease-out'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: isDark ? '#1e293b' : '#ffffff',
              border: `1.5px solid ${borderCol}`,
              borderRadius: '16px',
              maxWidth: '520px',
              width: '100%',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
            }}
          >
            {/* Modal Header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: `1px solid ${borderCol}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: isDark ? '#0f172a' : '#f8fafc',
              flexShrink: 0
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                  <div style={{ background: '#8b5cf6', color: '#fff', padding: '3px 7px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 900 }}>
                    🗺️ ZONA
                  </div>
                  <strong style={{ fontSize: '1rem', fontWeight: 900, color: isDark ? '#f8fafc' : '#0f172a' }}>
                    {zonal.nombre}
                  </strong>
                </div>
                <div style={{ fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                  Total: <strong>{total} locales de votación asignados</strong> &bull; DNI: {zonal.dni}
                </div>
              </div>

              <button
                onClick={() => setShowModal(false)}
                title="Cerrar ventana"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  border: `1px solid ${borderCol}`,
                  background: isDark ? '#1e293b' : '#ffffff',
                  color: isDark ? '#f8fafc' : '#0f172a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontWeight: 900,
                  fontSize: '0.9rem',
                  transition: 'all 0.15s ease'
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body: 1 Sola Columna con scroll horizontal para nombres largos si se requiere */}
            <div style={{
              padding: '16px 20px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              {zonal.colegios.map((sch, i) => (
                <div
                  key={i}
                  style={{
                    background: isDark ? '#0f172a' : '#f8fafc',
                    border: `1px solid ${borderCol}`,
                    borderRadius: '8px',
                    padding: '10px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    minWidth: 0,
                    width: '100%',
                    boxSizing: 'border-box'
                  }}
                >
                  <span style={{
                    background: isDark ? 'rgba(139, 92, 246, 0.25)' : '#ede9fe',
                    color: '#7c3aed',
                    fontWeight: 900,
                    fontSize: '0.74rem',
                    width: '24px',
                    height: '24px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {i + 1}
                  </span>
                  
                  {/* Nombre del colegio protegido contra desborde con scroll horizontal suave */}
                  <div
                    title={sch}
                    style={{
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      color: isDark ? '#f8fafc' : '#0f172a',
                      whiteSpace: 'nowrap',
                      overflowX: 'auto',
                      overflowY: 'hidden',
                      flex: 1,
                      minWidth: 0,
                      scrollbarWidth: 'thin'
                    }}
                  >
                    🏫 {sch}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Helpers para lectura de logística (Experiencia, Movilidad, Compromiso)
function getExp(r) {
  const val = String(
    r['Tiene Experiencia como Personero'] ??
    r['¿Tiene Experiencia como Personero?'] ??
    r['Tiene_Experiencia_como_Personero'] ??
    r.TieneExperiencia ??
    r.tiene_experiencia ??
    r.experiencia ??
    'No'
  ).trim();
  const lower = val.toLowerCase();
  if (lower.startsWith('no')) return 'No';
  if (lower === 'sí' || lower === 'si' || lower.startsWith('sí') || lower.startsWith('si')) return 'Sí';
  return 'No';
}

function getMov(r) {
  const val = String(
    r['Cuenta con Movilidad Propia'] ??
    r['¿Cuenta con Movilidad Propia?'] ??
    r['Cuenta_con_Movilidad_Propia'] ??
    r.CuentaMovilidad ??
    r.cuenta_movilidad ??
    r.movilidad ??
    'No'
  ).trim();
  const lower = val.toLowerCase();
  if (lower.startsWith('no')) return 'No';
  if (lower === 'sí' || lower === 'si' || lower.startsWith('sí') || lower.startsWith('si')) return 'Sí';
  return 'No';
}

function getComp(r) {
  const val = String(
    r['Se compromete a colaborar el 4 de Octubre del 2026 en las Elecciones'] ??
    r['¿Se compromete a colaborar el 4 de Octubre del 2026 en las Elecciones?'] ??
    r['Se_compromete_a_colaborar_el_4_de_Octubre_del_2026_en_las_Elecciones'] ??
    r.seCompromete ??
    r.se_compromete ??
    r.compromiso ??
    'No'
  ).trim();
  const lower = val.toLowerCase();
  if (lower.startsWith('no')) return 'No';
  if (lower === 'sí' || lower === 'si' || lower.startsWith('sí') || lower.startsWith('si') || lower.includes('me comprometo') || lower.includes('confirmo mi compromiso')) return 'Sí';
  return 'No';
}

export function DashboardView({ onGoToTraining }) {
  const { user, isCoordinador, isCoordinadorDistrital, isCoordinadorZonal, isCoordinadorLocal, isSuperAdmin, canViewAudit, logout } = useAuth();
  const { toggleTheme, isDark } = useTheme();

  // Detección de pantalla móvil (< 768px) y tablet (< 1024px) con debounce para estabilidad táctil
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  const [isTablet, setIsTablet] = useState(() => typeof window !== 'undefined' ? window.innerWidth >= 768 && window.innerWidth < 1024 : false);
  useEffect(() => {
    let timeoutId = null;
    const handler = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const w = window.innerWidth;
        setIsMobile(w < 768);
        setIsTablet(w >= 768 && w < 1024);
      }, 150);
    };
    window.addEventListener('resize', handler, { passive: true });
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handler);
    };
  }, []);

  const coordinatorDistrict = useMemo(() => {
    if (isSuperAdmin) return null;
    return user?.['Distrito Asignado'] || user?.distritoAsignado || user?.['Distrito donde Vota'] || user?.distrito || '';
  }, [isSuperAdmin, user]);

  const coordinatorLocal = useMemo(() => {
    if (!isCoordinadorLocal) return null;
    return user?.['Local de Votación Asignado'] || user?.localAsignado || user?.['Local de Votación'] || '';
  }, [isCoordinadorLocal, user]);

  // Lista de colegios asignados para Coordinador Zonal
  const coordinatorZonalLocales = useMemo(() => {
    if (!isCoordinadorZonal) return [];
    const raw = user?.['Local de Votación Asignado'] || user?.localDeVotacionAsignado || user?.localAsignado || '';
    return raw.split(',').map(s => s.trim()).filter(Boolean);
  }, [isCoordinadorZonal, user]);

  // Zona asignada de Villa María del Triunfo para el usuario (si es coordinador zonal)
  const assignedVmtZone = useMemo(() => {
    return getVmtAssignedZoneForUser(user);
  }, [user]);

  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'capacitacion', 'sql'
  const [showCertificate, setShowCertificate] = useState(false);

  // Redirigir inmediatamente a overview si un Coordinador Local intenta entrar al Mapa Zonal o Zonas
  useEffect(() => {
    if (isCoordinadorLocal && (activeTab === 'mapa' || activeTab === 'zonas')) {
      setActiveTab('overview');
    }
  }, [isCoordinadorLocal, activeTab]);

  // Estado de aprobación de evaluación / credenciales del usuario coordinador
  const isCoordinatorApproved = useMemo(() => {
    const preg = String(user?.Preguntas ?? user?.preguntas ?? user?.['Evaluación Estado'] ?? user?.evaluacionEstado ?? user?.evaluacion ?? '').toLowerCase();
    const cred = String(user?.Credenciales ?? user?.credenciales ?? user?.['Estado Credencial'] ?? user?.estadoCredencial ?? user?.estado ?? '').toLowerCase();
    return cred === 'confirmado' || preg.includes('aprob') || preg.includes('pasad');
  }, [user]);

  const [data, setData] = useState(() => {
    try {
      const cached = localStorage.getItem('dashboard_cache');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(() => {
    try {
      return !localStorage.getItem('dashboard_cache');
    } catch {
      return true;
    }
  });
  const [errorMsg, setErrorMsg] = useState(null);

  // Filtros Tab 1 (Panel General)
  const [search1, setSearch1] = useState('');
  const [dist1, setDist1] = useState(() => (coordinatorDistrict ? coordinatorDistrict : 'all'));
  const [localZonal1, setLocalZonal1] = useState('all');
  const [role1, setRole1] = useState('all');
  const [colegio1, setColegio1] = useState('all');
  const [coordLocalFilter1, setCoordLocalFilter1] = useState('all'); // 'all', 'con_pcv', 'sin_pcv'
  const [alertFilter1, setAlertFilter1] = useState('all'); // 'all', 'critico', 'parcial', 'optimo', 'excedido'
  const [exp1, setExp1] = useState('all');
  const [mov1, setMov1] = useState('all');
  const [comp1, setComp1] = useState('all');
  const [zoneType1, setZoneType1] = useState('all'); // 'all', 'multi', 'single', 'unassigned'

  // Resetear filtro de colegio cuando cambia el distrito seleccionado
  useEffect(() => {
    setColegio1('all');
  }, [dist1]);
  const [sortBySchool1, setSortBySchool1] = useState('zonal_group'); // 'zonal_group', 'personeros_desc', 'personeros_asc', 'alfabetico_asc', 'alfabetico_desc', 'mesas_desc', 'cobertura_desc', 'cobertura_asc'
  const [viewMode1, setViewMode1] = useState('cards'); // 'cards', 'tabla', 'directorio'
  const [selectedSchoolDetail, setSelectedSchoolDetail] = useState(null);
  const [schoolDetailTab, setSchoolDetailTab] = useState('personeros'); // 'personeros' | 'zona'
  const [expandedMesa, setExpandedMesa] = useState(null);
  const [sortByMesa, setSortByMesa] = useState('mesa_asc'); // 'mesa_asc', 'mesa_desc', 'nombre_asc', 'acreditados_primero', 'movilidad_primero', 'experiencia_primero'

  // Personeros de mesa ordenados dentro del modal de detalle de colegio
  const sortedModalMesaPersoneros = useMemo(() => {
    if (!selectedSchoolDetail) return [];
    const list = [...(selectedSchoolDetail.mesaPersoneros || [])];

    return list.sort((a, b) => {
      const mesaA = String(a['Mesa Asignada'] || a.mesaAsignada || a['Mesa de Sufragio'] || a.mesaDeSufragio || a.mesa_asignada || a.mesa || '').trim();
      const mesaB = String(b['Mesa Asignada'] || b.mesaAsignada || b['Mesa de Sufragio'] || b.mesaDeSufragio || b.mesa_asignada || b.mesa || '').trim();
      const numA = parseInt(mesaA, 10);
      const numB = parseInt(mesaB, 10);
      const hasNumA = !isNaN(numA);
      const hasNumB = !isNaN(numB);

      const nameA = String(a['Nombres y Apellidos'] || a.nombresApellidos || '').trim();
      const nameB = String(b['Nombres y Apellidos'] || b.nombresApellidos || '').trim();

      const credA = String(a['Credenciales'] || a.credenciales || '').toLowerCase() === 'confirmado';
      const credB = String(b['Credenciales'] || b.credenciales || '').toLowerCase() === 'confirmado';

      const movA = getMov(a) === 'Sí';
      const movB = getMov(b) === 'Sí';

      const expA = getExp(a) === 'Sí';
      const expB = getExp(b) === 'Sí';

      if (sortByMesa === 'mesa_asc') {
        if (hasNumA && hasNumB) return numA - numB;
        if (hasNumA) return -1;
        if (hasNumB) return 1;
        return nameA.localeCompare(nameB);
      }
      if (sortByMesa === 'mesa_desc') {
        if (hasNumA && hasNumB) return numB - numA;
        if (hasNumA) return -1;
        if (hasNumB) return 1;
        return nameA.localeCompare(nameB);
      }
      if (sortByMesa === 'nombre_asc') {
        return nameA.localeCompare(nameB);
      }
      if (sortByMesa === 'acreditados_primero') {
        if (credA !== credB) return credA ? -1 : 1;
        return nameA.localeCompare(nameB);
      }
      if (sortByMesa === 'movilidad_primero') {
        if (movA !== movB) return movA ? -1 : 1;
        return nameA.localeCompare(nameB);
      }
      if (sortByMesa === 'experiencia_primero') {
        if (expA !== expB) return expA ? -1 : 1;
        return nameA.localeCompare(nameB);
      }

      return nameA.localeCompare(nameB);
    });
  }, [selectedSchoolDetail, sortByMesa]);

  // Filtros Tab 2 (Capacitaciones)
  const [search2, setSearch2] = useState('');
  const [status2, setStatus2] = useState('all');
  const [dist2, setDist2] = useState(() => (coordinatorDistrict ? coordinatorDistrict : 'all'));
  const [localZonal2, setLocalZonal2] = useState('all');
  const [role2, setRole2] = useState('all');

  useEffect(() => {
    if (coordinatorDistrict) {
      setDist1(coordinatorDistrict);
      setDist2(coordinatorDistrict);
    }
  }, [coordinatorDistrict]);

  // Modal Ficha / Edición
  const [selectedPersonero, setSelectedPersonero] = useState(null);

  // Estado para colapsar menú lateral a solo íconos (Persistido)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('sidebar_collapsed', next ? 'true' : 'false');
      return next;
    });
  };

  // Tab 3 API URL state
  const [apiUrl, setApiUrl] = useState('http://localhost:3000/api');
  const [savedUrlMsg, setSavedUrlMsg] = useState(null);
  const [lastSync, setLastSync] = useState(null);

  // Estados Tab 4 y Notificaciones en Tiempo Real (Exclusivo Superadmin Master)
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditFilterAction, setAuditFilterAction] = useState('modificaciones');
  const [auditDateFilter, setAuditDateFilter] = useState('all'); // 'all', 'today', 'yesterday', 'last7', 'custom'
  const [auditCustomDate, setAuditCustomDate] = useState('');
  const [auditSearch, setAuditSearch] = useState('');
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [latestToast, setLatestToast] = useState(null);
  const [lastSeenAuditId, setLastSeenAuditId] = useState(() => {
    try {
      const saved = localStorage.getItem('supera_last_seen_audit_id');
      return saved ? parseInt(saved, 10) : null;
    } catch {
      return null;
    }
  });

  // Ref para registrar los IDs de auditoría que ya se mostraron en toast y evitar repeticiones en cada ciclo de 10s
  const lastShownToastIdRef = useRef(null);

  // Cerrar toast y marcarlo como visto para que no vuelva a aparecer
  const dismissToast = (toastObj = null) => {
    const target = toastObj || latestToast;
    if (target && target.id) {
      const toastId = target.id;
      lastShownToastIdRef.current = Math.max(lastShownToastIdRef.current || 0, toastId);
      setLastSeenAuditId(prev => {
        const nextId = Math.max(prev || 0, toastId);
        try { localStorage.setItem('supera_last_seen_audit_id', String(nextId)); } catch {}
        return nextId;
      });
    }
    setLatestToast(null);
  };

  const fetchAuditLogs = async (isBackground = false) => {
    if (!canViewAudit) return;
    if (!isBackground) setAuditLoading(true);
    try {
      const res = await api.getAuditLogs({ limit: 2500 });
      const logs = res?.data || [];
      setAuditLogs(logs);

      // Si es la primera vez que se ingresa, se fija el último ID visto para que empiece vacío
      // a partir de este instante (0 notificaciones hasta que ocurra un cambio nuevo).
      setLastSeenAuditId(prev => {
        if (prev === null && logs.length > 0) {
          const maxId = Math.max(...logs.map(l => l.id || 0));
          lastShownToastIdRef.current = maxId;
          try { localStorage.setItem('supera_last_seen_audit_id', String(maxId)); } catch {}
          return maxId;
        } else if (prev !== null && logs.length > 0 && isBackground) {
          // Detectar si llegaron modificaciones o eliminaciones nuevas que no hayan sido mostradas ni cerradas
          const baselineId = Math.max(prev || 0, lastShownToastIdRef.current || 0);
          const freshChanges = logs.filter(l => (l.id > baselineId) && (l.action === 'UPDATE_PERSONERO' || l.action === 'DELETE_PERSONERO'));
          if (freshChanges.length > 0) {
            const newestChange = freshChanges[0];
            lastShownToastIdRef.current = Math.max(lastShownToastIdRef.current || 0, ...freshChanges.map(f => f.id || 0));
            setLatestToast(newestChange);
          }
        }
        return prev;
      });
    } catch (err) {
      console.error('Error cargando registros de auditoría:', err);
    } finally {
      if (!isBackground) setAuditLoading(false);
    }
  };

  useEffect(() => {
    if (canViewAudit) {
      fetchAuditLogs(false);
      // Polling de auditoría en tiempo real cada 10 segundos
      const notifInterval = setInterval(() => {
        fetchAuditLogs(true);
      }, 10000);
      return () => clearInterval(notifInterval);
    }
  }, [canViewAudit]);

  // Auto-cerrar toast emergente después de 8 segundos registrándolo como cerrado
  useEffect(() => {
    if (!latestToast) return;
    const timer = setTimeout(() => {
      dismissToast(latestToast);
    }, 8000);
    return () => clearTimeout(timer);
  }, [latestToast]);

  // Lista de modificaciones y eliminaciones no vistas
  const unreadAuditLogs = useMemo(() => {
    if (lastSeenAuditId === null) return [];
    return auditLogs.filter(l => (l.id > lastSeenAuditId) && (l.action === 'UPDATE_PERSONERO' || l.action === 'DELETE_PERSONERO'));
  }, [auditLogs, lastSeenAuditId]);

  const markAllAuditAsSeen = () => {
    if (auditLogs.length > 0) {
      const maxId = Math.max(...auditLogs.map(l => l.id || 0));
      lastShownToastIdRef.current = Math.max(lastShownToastIdRef.current || 0, maxId);
      setLastSeenAuditId(maxId);
      try { localStorage.setItem('supera_last_seen_audit_id', String(maxId)); } catch {}
    }
    setLatestToast(null);
    setShowNotifMenu(false);
  };

  const fetchData = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const res = await api.getDashboardSummary();
      // Solo actualizar si la respuesta tiene datos reales (evitar borrar por 304 o respuesta vacía)
      if (res && Array.isArray(res.records) && res.records.length > 0) {
        setData(res);
        try { localStorage.setItem('dashboard_cache', JSON.stringify(res)); } catch {}
        setErrorMsg(null);
      } else if (res && Array.isArray(res) && res.length > 0) {
        const shaped = { records: res };
        setData(shaped);
        try { localStorage.setItem('dashboard_cache', JSON.stringify(shaped)); } catch {}
        setErrorMsg(null);
      } else if (res && res.records) {
        // Puede ser un objeto válido aunque con 0 registros
        setData(prev => prev || res);
        try { localStorage.setItem('dashboard_cache', JSON.stringify(res)); } catch {}
        setErrorMsg(null);
      }
      // Si res es null (304 fue manejado por api.js) no hacemos nada
      setLastSync(new Date());
    } catch (err) {
      console.warn('Dashboard fetch notice:', err.message);
      // Solo mostrar error si no hay datos en caché
      if (!isBackground) {
        setData(prev => {
          if (!prev) setErrorMsg(err.message || 'Error al conectar con la base de datos.');
          return prev;
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    fetchData();

    // Sincronización automática periódica cada 20 segundos
    const interval = setInterval(() => {
      if (isMounted) {
        fetchData(true);
      }
    }, 20000);

    // Sincronizar al volver a la pestaña
    const handleFocus = () => {
      if (isMounted) {
        fetchData(true);
      }
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const allRecords = Array.isArray(data?.records) ? data.records : (Array.isArray(data) ? data : []);

  // Filtrado de seguridad según rol:
  // 1) Coordinador de Local: solo ve los personeros asignados a su colegio y distrito
  // 2) Coordinador Zonal: solo ve los colegios de su zona y sus coordinadores locales y personeros (NUNCA ve Coordinador Distrital ni Superadmin)
  // 3) Coordinador de Distrito: ve coordinadores zonales, coordinadores de local y personeros de su distrito (NUNCA Superadmin ni otros distritos)
  // 4) SuperAdmin (Eric, Paola, Susana, Admin): ve todos los niveles y todos los 43 distritos de Lima
  const records = useMemo(() => {
    if (isCoordinadorLocal && coordinatorDistrict && coordinatorLocal) {
      return allRecords.filter(r => {
        const d = r['Distrito Asignado'] || r['Distrito donde Vota'] || r.distritoAsignado || r.distritoDondeVota;
        const l = r['Local de Votación Asignado'] || r['Local de Votación'] || r.localDeVotacionAsignado || r.localDeVotacion;
        const rol = String(r['Rol a Desempeñar'] || r.rolADesempenar || '').toLowerCase();
        const isSelf = String(r['D.N.I.'] || r['DNI'] || r.dni || '') === String(user?.DNI || user?.dni || user?.['D.N.I.'] || '');
        if (isSelf) return true;
        if (rol.includes('distrito') || rol.includes('distrital') || rol.includes('zonal') || rol.includes('zona')) return false;
        return matchesDistrict(d, coordinatorDistrict) && matchesLocal(l, coordinatorLocal);
      });
    }

    if (isCoordinadorZonal) {
      const assignedSchoolsInZone = assignedVmtZone ? getSchoolsForVmtZone(assignedVmtZone) : [];
      const allZonalSchools = [...coordinatorZonalLocales, ...assignedSchoolsInZone];

      return allRecords.filter(r => {
        const d = r['Distrito Asignado'] || r['Distrito donde Vota'] || r.distritoAsignado || r.distritoDondeVota;
        const l = r['Local de Votación Asignado'] || r['Local de Votación'] || r.localDeVotacionAsignado || r.localDeVotacion;
        const rol = String(r['Rol a Desempeñar'] || r.rolADesempenar || '').toLowerCase();
        const isSelf = String(r['D.N.I.'] || r['DNI'] || r.dni || '') === String(user?.DNI || user?.dni || user?.['D.N.I.'] || '');
        if (isSelf) return true;
        
        // El Coordinador Zonal NO puede ver nada de Coordinador Distrital ni Superadministrador
        if (rol.includes('distrito') || rol.includes('distrital') || rol.includes('superadmin')) return false;
        if (coordinatorDistrict && !matchesDistrict(d, coordinatorDistrict)) return false;
        
        if (allZonalSchools.length > 0) {
          return allZonalSchools.some(zLocal => matchesLocal(l, zLocal));
        }
        return false;
      });
    }

    if ((isCoordinadorDistrital || isCoordinador) && coordinatorDistrict && !isSuperAdmin) {
      return allRecords.filter(r => {
        const d = r['Distrito Asignado'] || r['Distrito donde Vota'] || r.distritoAsignado || r.distritoDondeVota;
        const rol = String(r['Rol a Desempeñar'] || r.rolADesempenar || '').toLowerCase();
        const isSelf = String(r['D.N.I.'] || r['DNI'] || r.dni || '') === String(user?.DNI || user?.dni || user?.['D.N.I.'] || '');
        if (isSelf) return true;
        if (rol.includes('superadmin')) return false;
        return matchesDistrict(d, coordinatorDistrict);
      });
    }

    return allRecords;
  }, [allRecords, isCoordinadorLocal, isCoordinadorZonal, isCoordinadorDistrital, isCoordinador, isSuperAdmin, coordinatorDistrict, coordinatorLocal, coordinatorZonalLocales, assignedVmtZone, user]);

  // Exportación inteligente de Excel respetando el rol y ámbito del usuario
  const handleDownloadExcel = (targetDistrictFilter = null) => {
    if (isCoordinadorLocal && coordinatorLocal) {
      exportPadronToExcel({
        records,
        title: `Padrón - ${coordinatorLocal}`,
        fileName: `Padron_SomosPeru_${coordinatorLocal.replace(/[^A-Za-z0-9]/g, '_')}_2026.xlsx`,
        scopeType: 'colegio',
        scopeName: coordinatorLocal
      });
      return;
    }

    if (isCoordinadorZonal) {
      const scopeLabel = assignedVmtZone || 'Zona';
      exportPadronToExcel({
        records,
        title: `Padrón - ${scopeLabel}`,
        fileName: `Padron_SomosPeru_${scopeLabel.replace(/[^A-Za-z0-9]/g, '_')}_2026.xlsx`,
        scopeType: 'zona',
        scopeName: scopeLabel
      });
      return;
    }

    // Para Coordinador Distrital o Superadmin
    const targetDist = coordinatorDistrict || (targetDistrictFilter && targetDistrictFilter !== 'all' ? targetDistrictFilter : (dist1 !== 'all' ? dist1 : ''));
    let filteredForExport = records;
    if (targetDist && !coordinatorDistrict) {
      filteredForExport = records.filter(r => {
        const d = r['Distrito Asignado'] || r['Distrito donde Vota'] || r.distritoAsignado || r.distritoDondeVota;
        return matchesDistrict(d, targetDist);
      });
    }

    exportPadronToExcel({
      records: filteredForExport,
      title: targetDist ? `Padrón - ${targetDist}` : 'Padrón General Somos Perú',
      fileName: `Padron_SomosPeru_${(targetDist || 'Lima_Metropolitana').replace(/[^A-Za-z0-9]/g, '_')}_2026.xlsx`,
      scopeType: targetDist ? 'distrital' : 'general',
      scopeName: targetDist
    });
  };

  // =========================================================================
  // DISTRIBUCIÓN DE PERSONEROS Y COORDINADORES POR DISTRITO PARA EL GRÁFICO
  // =========================================================================
  const { personerosByDist, coordsLocalByDist, coordsZonalByDist, coordsDistByDist } = useMemo(() => {
    const pMap = {};
    const clMap = {};
    const czMap = {};
    const cdMap = {};
    DISTRITOS_LIMA.forEach(d => {
      pMap[d] = 0;
      clMap[d] = 0;
      czMap[d] = 0;
      cdMap[d] = 0;
    });

    records.forEach(r => {
      const rawDist = r['Distrito Asignado'] || r['Distrito donde Vota'] || r.distritoAsignado || r.distritoDondeVota || '';
      const rawRol = String(r['Rol a Desempeñar'] || r.rolADesempenar || '').toLowerCase();
      const isCoordDist = rawRol.includes('distrito') || rawRol.includes('distrital');
      const isCoordZonal = !isCoordDist && (rawRol.includes('zonal') || rawRol.includes('zona'));
      const isCoordLocal = !isCoordDist && !isCoordZonal && (rawRol.includes('local') || (rawRol.includes('coordinador') && !rawRol.includes('central')));

      DISTRITOS_LIMA.forEach(d => {
        if (matchesDistrict(rawDist, d)) {
          if (isCoordDist) cdMap[d]++;
          else if (isCoordZonal) czMap[d]++;
          else if (isCoordLocal) clMap[d]++;
          else pMap[d]++;
        }
      });
    });

    return { personerosByDist: pMap, coordsLocalByDist: clMap, coordsZonalByDist: czMap, coordsDistByDist: cdMap };
  }, [records]);

  // =========================================================================
  // MONITOREO ZONAL: COLEGIOS Y COORDINADORES LOCALES ASIGNADOS A CADA COLEGIO
  // =========================================================================
  const zonalSchoolsOverview = useMemo(() => {
    if (!isCoordinadorZonal || coordinatorZonalLocales.length === 0) return [];
    
    return coordinatorZonalLocales.map(schoolName => {
      // Coordinadores Locales asignados a este colegio específico
      const schoolCoords = allRecords.filter(r => {
        const d = r['Distrito Asignado'] || r['Distrito donde Vota'] || r.distritoAsignado || '';
        const l = r['Local de Votación Asignado'] || r['Local de Votación'] || r.localDeVotacionAsignado || '';
        const rol = String(r['Rol a Desempeñar'] || r.rolADesempenar || '').toLowerCase();
        const isCoordLocal = rol.includes('local') || (rol.includes('coordinador') && !rol.includes('distrito') && !rol.includes('distrital') && !rol.includes('zonal') && !rol.includes('zona'));
        return matchesDistrict(d, coordinatorDistrict) && matchesLocal(l, schoolName) && isCoordLocal;
      });

      // Personeros asignados a este colegio específico
      const schoolPersoneros = allRecords.filter(r => {
        const d = r['Distrito Asignado'] || r['Distrito donde Vota'] || r.distritoAsignado || '';
        const l = r['Local de Votación Asignado'] || r['Local de Votación'] || r.localDeVotacionAsignado || '';
        const rol = String(r['Rol a Desempeñar'] || r.rolADesempenar || '').toLowerCase();
        const isPersonero = rol.includes('mesa') || (!rol.includes('coordinador') && !rol.includes('distrito') && !rol.includes('zonal'));
        return matchesDistrict(d, coordinatorDistrict) && matchesLocal(l, schoolName) && isPersonero;
      });

      const accreditedPersoneros = schoolPersoneros.filter(p => {
        const cred = String(p['Credenciales'] || p.credenciales || '').toLowerCase();
        const preg = String(p['Preguntas'] || p.preguntas || '').toLowerCase();
        return cred === 'confirmado' || preg.includes('aprob') || preg.includes('pasad');
      });

      const schoolMesas = getMesasForLocal(schoolName);

      return {
        schoolName,
        coordinadoresLocales: schoolCoords,
        personerosCount: schoolPersoneros.length,
        accreditedCount: accreditedPersoneros.length,
        mesasColegio: schoolMesas
      };
    });
  }, [isCoordinadorZonal, coordinatorZonalLocales, allRecords, coordinatorDistrict]);

  // =========================================================================
  // MONITOREO DISTRITAL: COORDINADORES DISTRITALES
  // =========================================================================
  const districtDistritalOverview = useMemo(() => {
    const targetDist = coordinatorDistrict || (dist1 !== 'all' ? dist1 : null);
    if (!targetDist) {
      return (allRecords || []).filter(r => {
        const rol = String(r['Rol a Desempeñar'] || r.rolADesempenar || '').toLowerCase();
        return rol.includes('distrital') || rol.includes('distrito');
      });
    }

    return (allRecords || []).filter(r => {
      const d = r['Distrito Asignado'] || r['Distrito donde Vota'] || r.distritoAsignado || r.distritoDondeVota || '';
      const rol = String(r['Rol a Desempeñar'] || r.rolADesempenar || '').toLowerCase();
      return matchesDistrict(d, targetDist) && (rol.includes('distrital') || rol.includes('distrito'));
    });
  }, [allRecords, coordinatorDistrict, dist1]);

  // =========================================================================
  // MONITOREO ZONAL: ESTRUCTURA DE COORDINADORES ZONALES (VILLA MARÍA DEL TRIUNFO Y DISTRITAL)
  // =========================================================================
  const vmtZonalesOverview = useMemo(() => {
    const zonalesInVMT = (allRecords || []).filter(r => {
      const d = r['Distrito Asignado'] || r['Distrito donde Vota'] || r.distritoAsignado || r.distritoDondeVota || '';
      const rol = String(r['Rol a Desempeñar'] || r.rolADesempenar || '').toLowerCase();
      return matchesDistrict(d, 'VILLA MARIA DEL TRIUNFO') && (rol.includes('zonal') || rol.includes('zona'));
    });

    return zonalesInVMT.map(z => {
      const zName = z['Nombres y Apellidos'] || z.nombresApellidos || 'Coordinador Zonal';
      const zDni = z['D.N.I.'] || z['DNI'] || z.dni || '';
      const zCel = z['Celular'] || z.celular || '';
      const zCred = String(z['Credenciales'] || z.credenciales || '').toLowerCase();
      const rawLocales = z['Local de Votación Asignado'] || z.localDeVotacionAsignado || z['Local de Votación'] || '';
      const zSchools = rawLocales.split(',').map(s => s.trim()).filter(Boolean);

      let totalMesasZona = 0;
      let personerosEnZona = 0;
      let plvsEnZona = 0;

      zSchools.forEach(sch => {
        totalMesasZona += getMesasForLocal(sch) || 1;

        (allRecords || []).forEach(r => {
          const rDist = r['Distrito Asignado'] || r['Distrito donde Vota'] || r.distritoAsignado || '';
          const rLoc = r['Local de Votación Asignado'] || r['Local de Votación'] || r.localDeVotacionAsignado || '';
          const rRol = String(r['Rol a Desempeñar'] || r.rolADesempenar || '').toLowerCase();
          if (!matchesDistrict(rDist, 'VILLA MARIA DEL TRIUNFO') || !matchesLocal(rLoc, sch)) return;

          if (rRol.includes('local') || rRol.includes('plv') || rRol.includes('pcv')) {
            plvsEnZona++;
          } else if (rRol.includes('mesa') || (!rRol.includes('coordinador') && !rRol.includes('distrit') && !rRol.includes('zonal') && !rRol.includes('zona'))) {
            personerosEnZona++;
          }
        });
      });

      return {
        raw: z,
        nombre: zName,
        dni: zDni,
        celular: zCel,
        credencial: zCred === 'confirmado' ? 'Confirmado' : 'Bloqueado',
        colegios: zSchools,
        totalColegios: zSchools.length,
        totalMesas: totalMesasZona,
        personerosEnZona,
        plvsEnZona
      };
    });
  }, [allRecords]);

  // districtZonalesOverview: entrega los coordinadores zonales al Coordinador Distrital o al distrito seleccionado
  const districtZonalesOverview = useMemo(() => {
    const targetDist = coordinatorDistrict || (dist1 !== 'all' ? dist1 : null);
    if (!targetDist) return [];

    const zonalesInDist = (allRecords || []).filter(r => {
      const d = r['Distrito Asignado'] || r['Distrito donde Vota'] || r.distritoAsignado || r.distritoDondeVota || '';
      const rol = String(r['Rol a Desempeñar'] || r.rolADesempenar || '').toLowerCase();
      return matchesDistrict(d, targetDist) && (rol.includes('zonal') || rol.includes('zona'));
    });

    return zonalesInDist.map(z => {
      const zName = z['Nombres y Apellidos'] || z.nombresApellidos || 'Coordinador Zonal';
      const zDni = z['D.N.I.'] || z['DNI'] || z.dni || '';
      const zCel = z['Celular'] || z.celular || '';
      const zCred = String(z['Credenciales'] || z.credenciales || '').toLowerCase();
      const rawLocales = z['Local de Votación Asignado'] || z.localDeVotacionAsignado || z['Local de Votación'] || '';
      const zSchools = rawLocales.split(',').map(s => s.trim()).filter(Boolean);

      let totalMesasZona = 0;
      let personerosEnZona = 0;
      let plvsEnZona = 0;

      zSchools.forEach(sch => {
        totalMesasZona += getMesasForLocal(sch) || 1;

        (allRecords || []).forEach(r => {
          const rDist = r['Distrito Asignado'] || r['Distrito donde Vota'] || r.distritoAsignado || '';
          const rLoc = r['Local de Votación Asignado'] || r['Local de Votación'] || r.localDeVotacionAsignado || '';
          const rRol = String(r['Rol a Desempeñar'] || r.rolADesempenar || '').toLowerCase();
          if (!matchesDistrict(rDist, targetDist) || !matchesLocal(rLoc, sch)) return;

          if (rRol.includes('local') || rRol.includes('plv') || rRol.includes('pcv')) {
            plvsEnZona++;
          } else if (rRol.includes('mesa') || (!rRol.includes('coordinador') && !rRol.includes('distrit') && !rRol.includes('zonal') && !rRol.includes('zona'))) {
            personerosEnZona++;
          }
        });
      });

      return {
        raw: z,
        nombre: zName,
        dni: zDni,
        celular: zCel,
        credencial: zCred === 'confirmado' ? 'Confirmado' : 'Bloqueado',
        colegios: zSchools,
        totalColegios: zSchools.length,
        totalMesas: totalMesasZona,
        personerosEnZona,
        plvsEnZona
      };
    });
  }, [allRecords, coordinatorDistrict, dist1]);

  // Mapa rápido de locales que tienen Personero de Centro (PCV) registrado
  const schoolsWithPlvSet = useMemo(() => {
    const set = new Set();
    (records || []).forEach(r => {
      const rRol = String(r['Rol a Desempeñar'] || r.rolADesempenar || '').toLowerCase();
      const isPLV = rRol.includes('local') || rRol.includes('pcv') || rRol.includes('plv') || (rRol.includes('coordinador') && !rRol.includes('distrito') && !rRol.includes('distrital') && !rRol.includes('zonal') && !rRol.includes('zona'));
      if (!isPLV) return;
      const rawLoc = r['Local de Votación Asignado'] || r.localDeVotacionAsignado || r['Local de Votación'] || r.localDeVotacion || '';
      if (!rawLoc || rawLoc === '-' || rawLoc.toLowerCase() === 'no aplica') return;
      const schoolNames = rawLoc.includes(',') ? rawLoc.split(',').map(s => s.trim()).filter(Boolean) : [rawLoc.trim()];
      schoolNames.forEach(loc => {
        set.add(normalizeLocalName(loc));
      });
    });
    return set;
  }, [records]);

  // =========================================================================
  // FILTRADO TAB 1 (PANEL GENERAL)
  // =========================================================================
  const filteredRecords1 = useMemo(() => {
    return records.filter(r => {
      const q = search1.toLowerCase().trim();

      // Pre-filtro Bloom Filter ultra-rápido: descarta el 90%+ de personeros que no coinciden en nanosegundos
      if (q && !bloomSearchAccelerator.mightMatch(r, q)) {
        return false;
      }

      const dni = String(r['D.N.I.'] || r['DNI'] || '').toLowerCase();
      const name = String(r['Nombres y Apellidos'] || '').toLowerCase();
      const email = String(r['Correo Electrónico'] || r['correo_electronico'] || '').toLowerCase();
      const local = String(r['Local de Votación Asignado'] || r['Local de Votación'] || '').toLowerCase();
      const mesa = String(r['Mesa Asignada'] || r['Mesa de Sufragio'] || '').toLowerCase();
      const cel = String(r['Celular'] || '').toLowerCase();
      const dist = r['Distrito Asignado'] || r['Distrito donde Vota'] || '';
      const rol = r['Rol a Desempeñar'] || '';

      const mSearch = !q || dni.includes(q) || name.includes(q) || local.includes(q) || mesa.includes(q) || cel.includes(q) || email.includes(q);
      const mDist = coordinatorDistrict ? matchesDistrict(dist, coordinatorDistrict) : matchesDistrict(dist, dist1);
      const mLocalZonal = !isCoordinadorZonal || localZonal1 === 'all' || matchesLocal(local, localZonal1);
      const mRole = matchesRole(rol, role1);

      // Filtro Con / Sin Coordinador Local o Personero de Centro (PCV)
      const rRolLower = String(rol).toLowerCase();
      const isPlvRole = rRolLower.includes('local') || rRolLower.includes('pcv') || rRolLower.includes('plv');
      const normLoc = normalizeLocalName(local);
      const schoolHasPlv = schoolsWithPlvSet.has(normLoc) || isPlvRole;

      const mCoordLocal = coordLocalFilter1 === 'all' || (
        coordLocalFilter1 === 'con_pcv' ? schoolHasPlv : (!schoolHasPlv && !isPlvRole)
      );

      const mExp = exp1 === 'all' || (exp1 === 'si' ? getExp(r) === 'Sí' : getExp(r) === 'No');
      const mMov = mov1 === 'all' || (mov1 === 'si' ? getMov(r) === 'Sí' : getMov(r) === 'No');
      const mComp = comp1 === 'all' || (comp1 === 'si' ? getComp(r) === 'Sí' : getComp(r) === 'No');
      const mColegio = colegio1 === 'all' || matchesLocal(local, colegio1);

      return mSearch && mDist && mLocalZonal && mRole && mColegio && mCoordLocal && mExp && mMov && mComp;
    });
  }, [records, search1, dist1, localZonal1, role1, colegio1, coordLocalFilter1, exp1, mov1, comp1, coordinatorDistrict, isCoordinadorZonal, schoolsWithPlvSet]);

  // Lista de colegios disponibles para el filtro según el distrito activo
  const availableSchoolsList = useMemo(() => {
    const targetDist = coordinatorDistrict || (dist1 !== 'all' ? dist1 : null);
    if (targetDist) {
      const catalog = getLocalesByDistrito(targetDist) || [];
      if (catalog.length > 0) return catalog.map(c => c.nombre).sort((a, b) => a.localeCompare(b));
    }
    const set = new Set();
    (records || []).forEach(r => {
      const loc = r['Local de Votación Asignado'] || r.localDeVotacionAsignado || r['Local de Votación'] || r.localDeVotacion || '';
      if (loc && loc !== '-' && loc.toLowerCase() !== 'no aplica') {
        if (loc.includes(',')) {
          loc.split(',').forEach(s => { if (s.trim()) set.add(s.trim()); });
        } else {
          set.add(loc.trim());
        }
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [coordinatorDistrict, dist1, records]);

  // KPIs dinámicos sobre los registros filtrados de Tab 1
  let tab1Total = filteredRecords1.length;
  let tab1CoordsDistrital = 0;
  let tab1CoordsZonal = 0;
  let tab1CoordsLocal = 0;
  let tab1Personeros = 0;
  let tab1Exp = 0;
  let tab1Mov = 0;

  filteredRecords1.forEach(r => {
    const rol = String(r['Rol a Desempeñar'] || r.rolADesempenar || '').toLowerCase();
    if (rol.includes('distrito') || rol.includes('distrital')) {
      tab1CoordsDistrital++;
    } else if (rol.includes('zonal') || rol.includes('zona')) {
      tab1CoordsZonal++;
    } else if (rol.includes('local') || (rol.includes('coordinador') && !rol.includes('central'))) {
      tab1CoordsLocal++;
    } else {
      tab1Personeros++;
    }

    if (getExp(r) === 'Sí') tab1Exp++;
    if (getMov(r) === 'Sí') tab1Mov++;
  });

  const isFiltered1 = search1 !== '' || (!isCoordinador && dist1 !== 'all') || (isCoordinadorZonal && localZonal1 !== 'all') || role1 !== 'all' || colegio1 !== 'all' || coordLocalFilter1 !== 'all' || alertFilter1 !== 'all' || exp1 !== 'all' || mov1 !== 'all' || comp1 !== 'all';

  // Meta territorial dinámica según el distrito asignado o seleccionado, o colegio, o zona
  const activeDistrictName = (isCoordinador && coordinatorDistrict) ? coordinatorDistrict : (dist1 !== 'all' ? dist1 : null);
  
  let targetElectores = TOTAL_ELECTORES_LIMA_METROPOLITANA; // 7,905,300
  let targetMesas = TOTAL_MESAS_LIMA_METROPOLITANA; // 26,351
  let targetLocales = TOTAL_LOCALES_LIMA_METROPOLITANA; // 1,904
  let scopeLabel = 'Lima Metropolitana';

  if (isCoordinadorLocal && coordinatorLocal) {
    const schoolMesas = getMesasForLocal(coordinatorLocal) || 1;
    targetMesas = schoolMesas;
    targetElectores = schoolMesas * 300;
    targetLocales = 1;
    scopeLabel = coordinatorLocal;
  } else if (isCoordinadorZonal && coordinatorDistrict) {
    if (localZonal1 !== 'all') {
      const schoolMesas = getMesasForLocal(localZonal1) || 1;
      targetMesas = schoolMesas;
      targetElectores = schoolMesas * 300;
      targetLocales = 1;
      scopeLabel = localZonal1;
    } else {
      const sumZonaMesas = coordinatorZonalLocales.reduce((acc, loc) => acc + (getMesasForLocal(loc) || 0), 0);
      targetMesas = sumZonaMesas > 0 ? sumZonaMesas : 1;
      targetElectores = targetMesas * 300;
      targetLocales = coordinatorZonalLocales.length > 0 ? coordinatorZonalLocales.length : 1;
      scopeLabel = `Zona de ${coordinatorDistrict}`;
    }
  } else if (activeDistrictName) {
    const dMesas = getMesasForDistrito(activeDistrictName);
    targetMesas = dMesas > 0 ? dMesas : 1;
    targetElectores = getElectoresForDistrito(activeDistrictName) || (targetMesas * 300);
    targetLocales = getLocalesCountForDistrito(activeDistrictName) || 1;
    scopeLabel = activeDistrictName;
  }
  // (La meta se ajustará dinámicamente más adelante, después de computar filteredDistrictSchools)

  // Cálculo reactivo de locales con PLV basado exactamente en los registros filtrados
  const countLocalesConPLV = useMemo(() => {
    if (isCoordinadorLocal) {
      return tab1CoordsLocal > 0 ? 1 : 0;
    }
    const distinctSchoolsWithPLV = new Set();
    (filteredRecords1 || []).forEach(r => {
      const rol = String(r['Rol a Desempeñar'] || r.rolADesempenar || '').toLowerCase();
      const isPLV = rol.includes('local') || rol.includes('plv') || rol.includes('pcv') || (rol.includes('coordinador') && !rol.includes('distrito') && !rol.includes('distrital') && !rol.includes('zonal') && !rol.includes('zona'));
      if (!isPLV) return;

      const rLoc = r['Local de Votación Asignado'] || r['Local de Votación'] || r.localDeVotacionAsignado || '';
      if (!rLoc || rLoc === '-' || rLoc.toLowerCase() === 'no aplica') return;

      distinctSchoolsWithPLV.add(normalizeLocalName(rLoc));
    });
    return distinctSchoolsWithPLV.size;
  }, [filteredRecords1, isCoordinadorLocal, tab1CoordsLocal]);


  // Solo muestra colegios con personeros registrados; si hay filtro de distrito, incluye catálogo del distrito.
  const districtSchools = useMemo(() => {
    // Construir un mapa de colegio -> personeros desde los registros reales
    const schoolMap = new Map(); // norm -> { school info, personeros[] }

    // Primero, agregar todos los personeros agrupados por colegio
    // Si un coordinador zonal tiene múltiples colegios separados por comas, agregarlo a cada colegio individual
    (records || []).forEach(r => {
      const rawLoc = r['Local de Votación Asignado'] || r.localDeVotacionAsignado || r['Local de Votación'] || r.localDeVotacion || '';
      if (!rawLoc || rawLoc === '-' || rawLoc.toLowerCase() === 'no aplica') return;

      const schoolNames = rawLoc.includes(',')
        ? rawLoc.split(',').map(s => s.trim()).filter(Boolean)
        : [rawLoc.trim()];

      schoolNames.forEach(loc => {
        if (!loc || loc === '-' || loc.toLowerCase() === 'no aplica') return;
        const norm = normalizeLocalName(loc);
        if (!schoolMap.has(norm)) {
          const dist = r['Distrito Asignado'] || r.distritoAsignado || r['Distrito donde Vota'] || r.distritoDondeVota || (dist1 !== 'all' ? dist1 : 'Lima');
          const official = findOfficialLocal(loc, dist);
          schoolMap.set(norm, {
            nombre: official?.nombre || loc,
            distrito: official?.distrito || dist,
            direccion: official?.direccion || '',
            mesas: official?.mesas || 1,
            electores: official?.electores || 300,
            personeros: []
          });
        } else {
          const existing = schoolMap.get(norm);
          if (!existing.direccion) {
            const official = findOfficialLocal(loc, existing.distrito);
            if (official?.direccion) existing.direccion = official.direccion;
            if (official?.mesas && (!existing.mesas || existing.mesas === 1)) existing.mesas = official.mesas;
            if (official?.electores && (!existing.electores || existing.electores === 300)) existing.electores = official.electores;
          }
        }
        const existingList = schoolMap.get(norm).personeros;
        const dni = String(r['D.N.I.'] || r['DNI'] || r.dni || '');
        if (!existingList.some(p => String(p['D.N.I.'] || p['DNI'] || p.dni || '') === dni)) {
          existingList.push(r);
        }
      });
    });

    // Si hay un filtro de distrito activo, agregar los colegios del catálogo de ese distrito (aunque estén vacíos)
    const targetDist = isCoordinadorLocal && coordinatorLocal ? coordinatorDistrict
      : (dist1 !== 'all' ? dist1 : (coordinatorDistrict || null));

    if (targetDist) {
      const catalogSchools = getLocalesByDistrito(targetDist);
      catalogSchools.forEach(cs => {
        const norm = normalizeLocalName(cs.nombre);
        if (!schoolMap.has(norm)) {
          schoolMap.set(norm, { ...cs, personeros: [] });
        } else {
          // Enriquecer con datos del catálogo (dirección, mesas reales, etc.)
          const existing = schoolMap.get(norm);
          existing.direccion = existing.direccion || cs.direccion || '';
          existing.mesas = cs.mesas || existing.mesas;
          existing.electores = cs.electores || existing.electores;
        }
      });
    }

    // Si es coordinador de local, filtrar solo su colegio
    if (isCoordinadorLocal && coordinatorLocal) {
      const normLocal = normalizeLocalName(coordinatorLocal);
      const official = findOfficialLocal(coordinatorLocal, coordinatorDistrict);
      const entry = schoolMap.get(normLocal);
      const rawSchool = entry || {
        nombre: official?.nombre || coordinatorLocal,
        distrito: official?.distrito || coordinatorDistrict || '',
        direccion: official?.direccion || '',
        mesas: official?.mesas || 1,
        electores: official?.electores || 300,
        personeros: []
      };
      if (official && !rawSchool.direccion) rawSchool.direccion = official.direccion;
      if (official && (!rawSchool.mesas || rawSchool.mesas === 1)) rawSchool.mesas = official.mesas;
      if (official && (!rawSchool.electores || rawSchool.electores === 300)) rawSchool.electores = official.electores;

      const allPersoneros = rawSchool.personeros || [];
      const mesaPersoneros = allPersoneros.filter(r => {
        const rol = normalizeDistrictName(r['Rol a Desempeñar'] || r.rolADesempenar || '');
        return !rol.includes('LOCAL') && !rol.includes('PLV') && !rol.includes('PCV') && !rol.includes('DISTRIT');
      });
      return [{
        ...rawSchool,
        allPersoneros,
        mesaPersoneros,
        asignadas: mesaPersoneros.length,
        cobertura: 0,
        totalMesas: rawSchool.mesas || 1,
        totalElectores: rawSchool.electores || 300,
        statusLabel: 'Activo', statusColor: '#10b981',
        zonalPersonero: null, plvPersonero: null
      }];
    }

    // Mapear todas las entradas del mapa a objetos school enriquecidos con catálogo oficial
    const mapped = Array.from(schoolMap.values()).map(school => {
      const official = findOfficialLocal(school.nombre, school.distrito);
      const officialDir = official?.direccion || '';
      const officialMesas = official?.mesas || null;
      const officialElectores = official?.electores || null;

      const schoolPersoneros = school.personeros;
      const distritoNombre = school.distrito || official?.distrito || (dist1 !== 'all' ? dist1 : 'Lima');
      const direccion = school.direccion || officialDir || '';
      const normDist = normalizeDistrictName(distritoNombre);
      const normSchool = normalizeLocalName(school.nombre);

      const zonalPersonero = schoolPersoneros.find(r => {
        const rol = normalizeDistrictName(r['Rol a Desempeñar'] || r.rolADesempenar || '');
        return rol.includes('ZONAL');
      }) || (records || []).find(r => {
        const rol = normalizeDistrictName(r['Rol a Desempeñar'] || r.rolADesempenar || '');
        if (!rol.includes('ZONAL')) return false;
        const d = normalizeDistrictName(r['Distrito Asignado'] || r.distritoAsignado || r['Distrito donde Vota'] || r.distritoDondeVota || '');
        const asig = normalizeLocalName(r['Local de Votación Asignado'] || r.localDeVotacionAsignado || '');
        return (d === normDist) && (asig.includes(normSchool) || normSchool.includes(asig));
      });

      const zonalRawSchools = zonalPersonero
        ? (zonalPersonero['Local de Votación Asignado'] || zonalPersonero.localDeVotacionAsignado || zonalPersonero['Local de Votación'] || '')
        : '';
      const zonalAssignedSchoolsList = zonalRawSchools.split(',').map(s => s.trim()).filter(Boolean);
      const zonalTotalColegios = zonalAssignedSchoolsList.length;

      const plvPersonero = schoolPersoneros.find(r => {
        const rol = normalizeDistrictName(r['Rol a Desempeñar'] || r.rolADesempenar || '');
        return rol.includes('LOCAL') || rol.includes('PLV') || rol.includes('PCV');
      });

      const mesaPersoneros = schoolPersoneros.filter(r => {
        const rol = normalizeDistrictName(r['Rol a Desempeñar'] || r.rolADesempenar || '');
        return !rol.includes('LOCAL') && !rol.includes('PLV') && !rol.includes('PCV') && !rol.includes('DISTRIT') && !rol.includes('ZONAL');
      });

      const totalMesas = school.mesas || officialMesas || Math.max(1, Math.round((school.electores || officialElectores || 300) / 300));
      const asignadas = mesaPersoneros.length;
      const cobertura = totalMesas > 0 ? Math.round((asignadas / totalMesas) * 100) : 0;
      const totalElectores = school.electores || officialElectores || totalMesas * 300;
      const isExceeded = asignadas > totalMesas;

      let statusLabel = 'Crítico';
      let statusColor = '#ef4444';
      let statusBg = 'rgba(239, 68, 68, 0.15)';
      let statusBorder = '#f87171';
      let statusBadgeText = `🔴 Crítico (${cobertura}%)`;

      if (isExceeded) {
        statusLabel = 'Excedido';
        statusColor = '#e11d48';
        statusBg = 'rgba(225, 29, 72, 0.15)';
        statusBorder = '#fda4af';
        statusBadgeText = `🚨 Excedido (+${asignadas - totalMesas})`;
      } else if (cobertura >= 76) {
        statusLabel = 'Óptimo';
        statusColor = '#10b981';
        statusBg = 'rgba(16, 185, 129, 0.15)';
        statusBorder = '#86efac';
        statusBadgeText = `🟢 Óptimo (${cobertura}%)`;
      } else if (cobertura >= 31) {
        statusLabel = 'Parcial';
        statusColor = '#f59e0b';
        statusBg = 'rgba(245, 158, 11, 0.15)';
        statusBorder = '#fde68a';
        statusBadgeText = `🟡 Parcial (${cobertura}%)`;
      } else {
        statusLabel = 'Crítico';
        statusColor = '#ef4444';
        statusBg = 'rgba(239, 68, 68, 0.15)';
        statusBorder = '#f87171';
        statusBadgeText = `🔴 Crítico (${cobertura}%)`;
      }

      return {
        nombre: school.nombre,
        distrito: distritoNombre,
        direccion: direccion,
        mesas: totalMesas,
        electores: totalElectores,
        totalMesas, asignadas, cobertura, totalElectores,
        isExceeded, statusLabel, statusColor, statusBg, statusBorder, statusBadgeText,
        zonalPersonero, plvPersonero, mesaPersoneros,
        zonalTotalColegios,
        zonalAssignedSchoolsList,
        allPersoneros: schoolPersoneros
      };
    });

    // Si es coordinador zonal, filtrar solo los colegios de su zona
    if (isCoordinadorZonal && coordinatorZonalLocales.length > 0) {
      const zonalSet = new Set(coordinatorZonalLocales.map(s => normalizeLocalName(s)));
      const zonalFiltered = mapped.filter(s => {
        const normS = normalizeLocalName(s.nombre);
        return zonalSet.has(normS) || coordinatorZonalLocales.some(zl => normalizeLocalName(zl).includes(normS) || normS.includes(normalizeLocalName(zl)));
      });
      return zonalFiltered.sort((a, b) => (b.allPersoneros.length - a.allPersoneros.length) || (b.asignadas - a.asignadas) || a.nombre.localeCompare(b.nombre));
    }

    // Filtrar por distrito si hay filtro activo (modo superadmin con distrito seleccionado)
    const filtered = (dist1 !== 'all' && !coordinatorDistrict)
      ? mapped.filter(s => normalizeDistrictName(s.distrito) === normalizeDistrictName(dist1))
      : mapped;

    // Solo mostrar colegios que tienen personeros (a menos que sea el colegio del coord. de local)
    // O si hay filtro de distrito activo, mostrar todos los del catálogo
    const withPersoneros = filtered.filter(s => s.allPersoneros.length > 0);
    const result = (dist1 !== 'all' || coordinatorDistrict)
      ? filtered
      : (withPersoneros.length > 0 ? withPersoneros : filtered.slice(0, 50));

    return result.sort((a, b) => (b.allPersoneros.length - a.allPersoneros.length) || (b.asignadas - a.asignadas) || a.nombre.localeCompare(b.nombre));
  }, [records, dist1, coordinatorDistrict, isCoordinadorLocal, coordinatorLocal, isCoordinadorZonal, coordinatorZonalLocales]);


  // Contadores por tipo de asignación zonal
  const countMultiZoneSchools = useMemo(() => districtSchools.filter(s => s.zonalTotalColegios > 1).length, [districtSchools]);
  const countSingleZoneSchools = useMemo(() => districtSchools.filter(s => s.zonalTotalColegios === 1).length, [districtSchools]);
  const countUnassignedZoneSchools = useMemo(() => districtSchools.filter(s => !s.zonalPersonero).length, [districtSchools]);

  // Contadores por Alertas de Cobertura en Colegios:
  // 0% – 30%: 🔴 Crítico (#ef4444)
  // 31% – 75%: 🟡 Parcial (#f59e0b)
  // 76% – 100%: 🟢 Óptimo (#10b981)
  // > 100%: 🚨 Excedido (#e11d48)
  const countCriticoSchools = useMemo(() => districtSchools.filter(s => s.statusLabel === 'Crítico').length, [districtSchools]);
  const countParcialSchools = useMemo(() => districtSchools.filter(s => s.statusLabel === 'Parcial').length, [districtSchools]);
  const countOptimoSchools = useMemo(() => districtSchools.filter(s => s.statusLabel === 'Óptimo').length, [districtSchools]);
  const countExcedidoSchools = useMemo(() => districtSchools.filter(s => s.statusLabel === 'Excedido').length, [districtSchools]);

  // Contadores por Con / Sin Personero de Centro (PCV)
  const countConPcvSchools = useMemo(() => districtSchools.filter(s => !!s.plvPersonero).length, [districtSchools]);
  const countSinPcvSchools = useMemo(() => districtSchools.filter(s => !s.plvPersonero).length, [districtSchools]);

  const filteredDistrictSchools = useMemo(() => {
    let list = districtSchools;

    // 0. Filtrado por Con / Sin Coordinador Local o Personero de Centro (PCV)
    if (coordLocalFilter1 === 'con_pcv') {
      list = list.filter(s => !!s.plvPersonero);
    } else if (coordLocalFilter1 === 'sin_pcv') {
      list = list.filter(s => !s.plvPersonero);
    }

    // 1. Filtrado por Alertas de Cobertura en Colegios (Crítico 0-30%, Parcial 31-75%, Óptimo 76-100%, Excedido >100%)
    if (alertFilter1 === 'critico') {
      list = list.filter(s => s.statusLabel === 'Crítico');
    } else if (alertFilter1 === 'parcial') {
      list = list.filter(s => s.statusLabel === 'Parcial');
    } else if (alertFilter1 === 'optimo') {
      list = list.filter(s => s.statusLabel === 'Óptimo');
    } else if (alertFilter1 === 'excedido') {
      list = list.filter(s => s.statusLabel === 'Excedido');
    }

    // 2. Filtrado por Tipo de Zona (Multi-Colegio, Único, Sin Zonal)
    if (zoneType1 === 'multi') {
      list = list.filter(s => s.zonalTotalColegios > 1);
    } else if (zoneType1 === 'single') {
      list = list.filter(s => s.zonalTotalColegios === 1);
    } else if (zoneType1 === 'unassigned') {
      list = list.filter(s => !s.zonalPersonero);
    }

    // 3. Si hay filtros de personeros activos (Rol, Experiencia, Movilidad, Compromiso)
    const hasPersoneroFilters = role1 !== 'all' || exp1 !== 'all' || mov1 !== 'all' || comp1 !== 'all';
    if (hasPersoneroFilters) {
      if (role1 === 'Coordinador Distrital') {
        // Los Coordinadores Distritales son distritales y no están asignados dentro de s.allPersoneros de un colegio específico
      } else {
        const validDnis = new Set(filteredRecords1.map(r => String(r['D.N.I.'] || r['DNI'] || r.dni || '')));
        list = list.filter(s => (s.allPersoneros || []).some(p => validDnis.has(String(p['D.N.I.'] || p['DNI'] || p.dni || ''))));
      }
    }

    // 4. Filtrado por Búsqueda de Texto (preciso: nombre de colegio, dirección, distrito o personas asignadas a este local)
    if (search1.trim()) {
      const rawTerm = search1.trim().toLowerCase();
      const normTerm = normalizeLocalName(rawTerm);

      list = list.filter(s => {
        // Pre-filtro Bloom Filter ultra-rápido: descarta el 90%+ de colegios en nanosegundos
        if (!bloomSearchAccelerator.mightMatch(s, rawTerm)) {
          return false;
        }

        const sNorm = normalizeLocalName(s.nombre || '');
        const dNorm = normalizeDistrictName(s.distrito || '');
        const addrNorm = normalizeLocalName(s.direccion || '');

        const matchSchoolName = sNorm.includes(normTerm) || (s.nombre && s.nombre.toLowerCase().includes(rawTerm));
        const matchAddress = addrNorm.includes(normTerm) || (s.direccion && s.direccion.toLowerCase().includes(rawTerm));
        const matchDistrict = dNorm.includes(normTerm) || (s.distrito && s.distrito.toLowerCase().includes(rawTerm));

        // Personero de Mesa asignado a este colegio
        const matchMesaPersonero = (s.mesaPersoneros || []).some(p => {
          const pName = (p['Nombres y Apellidos'] || p.nombresApellidos || '').toLowerCase();
          const pDni = String(p['D.N.I.'] || p['DNI'] || p.dni || '');
          return pName.includes(rawTerm) || pDni.includes(rawTerm);
        });

        // Coordinador de Local asignado a este colegio
        const matchPlv = s.plvPersonero && (
          (s.plvPersonero['Nombres y Apellidos'] || s.plvPersonero.nombresApellidos || '').toLowerCase().includes(rawTerm) ||
          String(s.plvPersonero['D.N.I.'] || s.plvPersonero.dni || '').includes(rawTerm)
        );

        // Coordinador Zonal a cargo de este colegio
        const matchZonal = s.zonalPersonero && (
          (s.zonalPersonero['Nombres y Apellidos'] || s.zonalPersonero.nombresApellidos || '').toLowerCase().includes(rawTerm) ||
          String(s.zonalPersonero['D.N.I.'] || s.zonalPersonero.dni || '').includes(rawTerm)
        );

        return matchSchoolName || matchAddress || matchDistrict || matchMesaPersonero || matchPlv || matchZonal;
      });
    }

    // 5. Ordenamiento de Centros según criterio seleccionado (Zona, Nombre, Cobertura, Personeros, Mesas)
    const sorted = [...list].sort((a, b) => {
      // --- 1. Agrupar por Coordinador Zonal (Default) ---
      if (sortBySchool1 === 'zonal_group') {
        const nameA = a.zonalPersonero ? (a.zonalPersonero['Nombres y Apellidos'] || a.zonalPersonero.nombresApellidos || '').trim() : 'zzzz_sin_zona';
        const nameB = b.zonalPersonero ? (b.zonalPersonero['Nombres y Apellidos'] || b.zonalPersonero.nombresApellidos || '').trim() : 'zzzz_sin_zona';
        const cmpZ = nameA.localeCompare(nameB);
        if (cmpZ !== 0) return cmpZ;
        return a.nombre.localeCompare(b.nombre);
      }
      // --- 2. Nombre Alfabético (A - Z) ---
      if (sortBySchool1 === 'alfabetico_asc') {
        return a.nombre.localeCompare(b.nombre);
      }
      // --- 3. Mayor Cobertura de Personeros (100% a 0%) ---
      if (sortBySchool1 === 'cobertura_desc') {
        return (b.cobertura - a.cobertura) || (b.asignadas - a.asignadas) || a.nombre.localeCompare(b.nombre);
      }
      // --- 4. Menor Cobertura de Personeros (0% a 100% - Faltan personeros) ---
      if (sortBySchool1 === 'cobertura_asc') {
        return (a.cobertura - b.cobertura) || (a.asignadas - b.asignadas) || a.nombre.localeCompare(b.nombre);
      }
      // --- 5. Más Personeros Registrados en el Centro ---
      if (sortBySchool1 === 'personeros_desc') {
        return ((b.allPersoneros?.length || b.asignadas || 0) - (a.allPersoneros?.length || a.asignadas || 0)) || (b.cobertura - a.cobertura) || a.nombre.localeCompare(b.nombre);
      }
      // --- 6. Mayor Cantidad de Mesas de Sufragio ---
      if (sortBySchool1 === 'mesas_desc') {
        return ((b.totalMesas || 0) - (a.totalMesas || 0)) || a.nombre.localeCompare(b.nombre);
      }

      return (b.cobertura - a.cobertura) || (b.asignadas - a.asignadas) || a.nombre.localeCompare(b.nombre);
    });

    return sorted;
  }, [districtSchools, filteredRecords1, coordLocalFilter1, alertFilter1, zoneType1, search1, role1, exp1, mov1, comp1, sortBySchool1]);
  // Ajuste de metas por búsqueda activa (ahora que filteredDistrictSchools está disponible)
  if (search1.trim() && filteredDistrictSchools.length > 0 && filteredDistrictSchools.length < targetLocales) {
    targetLocales = filteredDistrictSchools.length;
    targetMesas = filteredDistrictSchools.reduce((acc, s) => acc + (s.totalMesas || 0), 0) || 1;
    targetElectores = filteredDistrictSchools.reduce((acc, s) => acc + (s.totalElectores || 0), 0) || (targetMesas * 300);
    scopeLabel = filteredDistrictSchools.length === 1 ? filteredDistrictSchools[0].nombre : `${filteredDistrictSchools.length} Locales de Votación`;
  }

  // Coberturas dinámicas en Porcentaje
  const coberturaMesasPct = targetMesas > 0 ? Math.min(100, ((tab1Personeros / targetMesas) * 100)).toFixed(1) : '0.0';
  const coberturaLocalesPct = targetLocales > 0 ? Math.min(100, ((countLocalesConPLV / targetLocales) * 100)).toFixed(1) : '0.0';



  // =========================================================================
  // FILTRADO TAB 2 (CAPACITACIONES)
  // =========================================================================
  const filteredRecords2 = useMemo(() => {
    return (records || []).filter(r => {
      if (!r) return false;
      const q = search2.toLowerCase().trim();
      const dni = String(r['D.N.I.'] || r['DNI'] || r.dni || '').toLowerCase();
      const name = String(r['Nombres y Apellidos'] || r.nombresApellidos || '').toLowerCase();
      const local = String(r['Local de Votación Asignado'] || r['Local de Votación'] || r.localDeVotacionAsignado || r.localDeVotacion || '').toLowerCase();
      const dist = r['Distrito Asignado'] || r['Distrito donde Vota'] || r.distritoAsignado || r.distritoDondeVota || '';
      const rol = r['Rol a Desempeñar'] || r.rolADesempenar || '';
      const cred = String(r.Credenciales || r.credenciales || '').toLowerCase();

      const mSearch = !q || dni.includes(q) || name.includes(q) || local.includes(q);
      const mStatus = status2 === 'all' || (status2 === 'confirmado' ? cred === 'confirmado' : cred !== 'confirmado');
      const mDist = coordinatorDistrict ? matchesDistrict(dist, coordinatorDistrict) : matchesDistrict(dist, dist2);
      const mLocalZonal = !isCoordinadorZonal || localZonal2 === 'all' || matchesLocal(local, localZonal2);
      const mRole = matchesRole(rol, role2);

      return mSearch && mStatus && mDist && mLocalZonal && mRole;
    });
  }, [records, search2, status2, dist2, localZonal2, role2, coordinatorDistrict, isCoordinadorZonal]);

  const isFiltered2 = search2 !== '' || status2 !== 'all' || (!coordinatorDistrict && dist2 !== 'all') || (isCoordinadorZonal && localZonal2 !== 'all') || role2 !== 'all';

  let tab2Confirmados = 0;
  let tab2Pendientes = 0;
  let tab2Videos = 0;
  let tab2Pdfs = 0;
  let v0 = 0, v1 = 0, v2 = 0;
  let p0 = 0, p1 = 0, p2 = 0;

  (filteredRecords2 || []).forEach(r => {
    if (!r) return;
    const cred = String(r.Credenciales || r.credenciales || '').toLowerCase();
    if (cred === 'confirmado') tab2Confirmados++;
    else tab2Pendientes++;

    const v = parseInt(r.Video ?? r.video, 10) || 0;
    const p = parseInt(r.PDF ?? r.pdf, 10) || 0;
    if (v >= 2) tab2Videos++;
    if (p >= 2) tab2Pdfs++;

    if (v === 0) v0++; else if (v === 1) v1++; else v2++;
    if (p === 0) p0++; else if (p === 1) p1++; else p2++;
  });

  const doughnutData2 = useMemo(() => ({
    labels: ['Confirmados (Acreditados)', 'Pendientes / Bloqueados'],
    datasets: [
      {
        data: [tab2Confirmados || 0, tab2Pendientes || 0],
        backgroundColor: ['#10b981', '#f59e0b'],
        borderWidth: 0
      }
    ]
  }), [tab2Confirmados, tab2Pendientes]);

  const barData2 = useMemo(() => ({
    labels: ['0/2 (Sin iniciar)', '1/2 (En proceso)', '2/2 (Completado)'],
    datasets: [
      {
        label: 'Videos Vistos',
        data: [v0 || 0, v1 || 0, v2 || 0],
        backgroundColor: '#0284c7',
        borderRadius: 6
      },
      {
        label: 'Manuales PDF',
        data: [p0 || 0, p1 || 0, p2 || 0],
        backgroundColor: '#8b5cf6',
        borderRadius: 6
      }
    ]
  }), [v0, v1, v2, p0, p1, p2]);

  // Variables de estilo reactivas al Modo Oscuro / Claro con contraste equilibrado
  const bgMain = isDark ? '#0b1329' : '#f8fafc';
  const bgCard = isDark ? '#131b2e' : '#ffffff';
  const bgHeader = isDark ? '#111827' : '#ffffff';
  const bgSidebar = isDark ? '#131b2e' : '#ffffff';
  const borderCol = isDark ? '#233554' : '#cbd5e1';
  const textTitle = isDark ? '#ffffff' : '#0f172a';
  const textSub = isDark ? '#94a3b8' : '#334155';
  const textBody = isDark ? '#e2e8f0' : '#0f172a';
  const bgInput = isDark ? '#141c30' : '#ffffff';
  const tableHeadBg = isDark ? '#111827' : '#f1f5f9';
  const tableRowBorder = isDark ? '#1e293b' : '#e2e8f0';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: bgMain, color: textBody, fontFamily: "'Outfit', 'Montserrat', sans-serif", transition: 'all 0.2s ease' }}>
      
      {/* BARRA LATERAL IZQUIERDA — FIJA CON BOTÓN PARA COLAPSAR/EXPANDIR */}
      {!isMobile && (
        <aside
          style={{
            position: 'sticky',
            top: 0,
            height: '100vh',
            width: isSidebarCollapsed ? '68px' : '230px',
            background: bgSidebar,
            borderRight: `1px solid ${borderCol}`,
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
            transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            zIndex: 40,
            overflowY: 'auto',
            overflowX: 'hidden'
          }}
        >
          {/* Sello Somos Perú / Logo + Botón Colapsar */}
          <div
            style={{
              padding: isSidebarCollapsed ? '14px 8px' : '14px 14px',
              borderBottom: `1px solid ${borderCol}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: isSidebarCollapsed ? 'center' : 'space-between',
              minHeight: '62px'
            }}
          >
            {!isSidebarCollapsed ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                <img
                  src="/images/logo_somos_peru.svg"
                  alt="Somos Perú"
                  style={{ width: '36px', height: 'auto', maxHeight: '34px', objectFit: 'contain', flexShrink: 0 }}
                />
                <div style={{ whiteSpace: 'nowrap' }}>
                  <div style={{ fontSize: '0.92rem', fontWeight: 900, color: textTitle, lineHeight: 1.1 }}>ConteoLima</div>
                  <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#0284c7' }}>Somos Perú 2026</div>
                </div>
              </div>
            ) : (
              <img
                src="/images/logo_somos_peru.svg"
                alt="Somos Perú"
                style={{ width: '32px', height: 'auto', maxHeight: '32px', objectFit: 'contain' }}
              />
            )}

            <button
              onClick={toggleSidebar}
              title={isSidebarCollapsed ? 'Expandir menú lateral' : 'Colapsar menú a solo íconos'}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                border: `1px solid ${borderCol}`,
                background: isDark ? '#1e293b' : '#f1f5f9',
                color: textTitle,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
                marginLeft: isSidebarCollapsed ? 0 : '6px',
                marginTop: isSidebarCollapsed ? '8px' : 0
              }}
            >
              {isSidebarCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Navegación */}
          <div style={{ padding: isSidebarCollapsed ? '14px 6px' : '14px 10px', flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {!isSidebarCollapsed && (
              <div style={{ fontSize: '0.64rem', fontWeight: 800, color: textSub, letterSpacing: '0.8px', marginBottom: '8px', paddingLeft: '6px' }}>
                PANEL DE CONTROL
              </div>
            )}

            {/* Tab 1: Panel General */}
            <button
              onClick={() => setActiveTab('overview')}
              title={isSidebarCollapsed ? (isCoordinadorLocal ? `Panel Colegio (${coordinatorLocal})` : ((isCoordinadorDistrital || isCoordinador) ? `Panel Distrital (${coordinatorDistrict})` : 'Panel General')) : undefined}
              style={{
                padding: isSidebarCollapsed ? '10px' : '10px 12px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'overview' ? (isDark ? '#1e293b' : '#e0f2fe') : 'transparent',
                color: activeTab === 'overview' ? '#0284c7' : textSub,
                fontWeight: 700,
                fontSize: '0.84rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
                gap: '10px',
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
            >
              <LayoutGrid className="w-4 h-4 flex-shrink-0" />
              {!isSidebarCollapsed && (
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {isCoordinadorLocal && coordinatorLocal
                    ? `Panel Colegio`
                    : ((isCoordinadorDistrital || isCoordinador) && coordinatorDistrict
                      ? `Panel Distrital`
                      : 'Panel General')}
                </span>
              )}
            </button>

            {/* Tab 2: Progreso de Capacitaciones */}
            <button
              onClick={() => setActiveTab('capacitacion')}
              title={isSidebarCollapsed ? 'Progreso de Capacitaciones' : undefined}
              style={{
                padding: isSidebarCollapsed ? '10px' : '10px 12px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'capacitacion' ? (isDark ? '#1e293b' : '#e0f2fe') : 'transparent',
                color: activeTab === 'capacitacion' ? '#0284c7' : textSub,
                fontWeight: 700,
                fontSize: '0.84rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
                gap: '10px',
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
            >
              <GraduationCap className="w-4 h-4 flex-shrink-0" />
              {!isSidebarCollapsed && (
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  Capacitaciones
                </span>
              )}
            </button>

            {/* Tab 3: Trayecto y Rutas de Personeros (Para SuperAdmin y Coordinadores) */}
            <button
              onClick={() => setActiveTab('trayecto')}
              title={isSidebarCollapsed ? 'Trayecto y Rutas' : undefined}
              style={{
                padding: isSidebarCollapsed ? '10px' : '10px 12px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'trayecto' ? (isDark ? '#1e293b' : '#e0f2fe') : 'transparent',
                color: activeTab === 'trayecto' ? '#0284c7' : textSub,
                fontWeight: 700,
                fontSize: '0.84rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
                gap: '10px',
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
            >
              <Navigation className="w-4 h-4 text-sky-500 flex-shrink-0" />
              {!isSidebarCollapsed && (
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  Trayecto
                </span>
              )}
            </button>

            {/* Tab: Mapa Zonal (Villa María del Triunfo) - Oculto para Coordinador Local */}
            {!isCoordinadorLocal && (
              <button
                onClick={() => setActiveTab('mapa')}
                title={isSidebarCollapsed ? 'Mapa Zonal (VMT)' : undefined}
                style={{
                  padding: isSidebarCollapsed ? '10px' : '10px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: activeTab === 'mapa' ? (isDark ? '#1e293b' : '#e0f2fe') : 'transparent',
                  color: activeTab === 'mapa' ? '#0284c7' : textSub,
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
                  gap: '10px',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
              >
                <MapPin className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                {!isSidebarCollapsed && (
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    Mapa Zonal
                  </span>
                )}
              </button>
            )}

            {/* Tab 4: Historial de Cambios / Auditoría (Exclusivo Superadmin Master) */}
            {canViewAudit && (
              <button
                onClick={() => {
                  setActiveTab('auditoria');
                  markAllAuditAsSeen();
                }}
                title={isSidebarCollapsed ? `Historial de Cambios y Auditoría${unreadAuditLogs.length > 0 ? ` (${unreadAuditLogs.length} nuevos)` : ''}` : undefined}
                style={{
                  padding: isSidebarCollapsed ? '10px' : '10px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: activeTab === 'auditoria' ? (isDark ? '#1e293b' : '#e0f2fe') : 'transparent',
                  color: activeTab === 'auditoria' ? '#0284c7' : textSub,
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: isSidebarCollapsed ? 'center' : 'space-between',
                  gap: '8px',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                  <History className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  {!isSidebarCollapsed && (
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      Historial de Cambios
                    </span>
                  )}
                </div>

                {unreadAuditLogs.length > 0 && (
                  <span style={{
                    background: '#ef4444',
                    color: '#fff',
                    fontSize: '0.66rem',
                    fontWeight: 900,
                    padding: '2px 6px',
                    borderRadius: '10px',
                    boxShadow: '0 0 8px rgba(239, 68, 68, 0.6)',
                    animation: 'pulse 1.5s infinite'
                  }}>
                    {unreadAuditLogs.length}
                  </span>
                )}
              </button>
            )}

            {/* Opción para Coordinadores Aprobados: Ver Constancia de Capacitación */}
            {isCoordinatorApproved && (
              <button
                onClick={() => setShowCertificate(true)}
                title={isSidebarCollapsed ? "Ver mi Constancia de Capacitación" : undefined}
                style={{
                  padding: isSidebarCollapsed ? '10px' : '10px 12px',
                  borderRadius: '8px',
                  border: '1.5px solid rgba(16, 185, 129, 0.4)',
                  background: isDark ? 'rgba(16, 185, 129, 0.15)' : '#ecfdf5',
                  color: isDark ? '#34d399' : '#047857',
                  fontWeight: 800,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
                  gap: '10px',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  boxShadow: '0 2px 6px rgba(16, 185, 129, 0.15)'
                }}
              >
                <Award className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                {!isSidebarCollapsed && (
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    Mi Constancia de Capacitación
                  </span>
                )}
              </button>
            )}

          </div>

          {/* Footer Sidebar */}
          {!isSidebarCollapsed && (
            <div style={{ padding: '12px', borderTop: `1px solid ${borderCol}`, fontSize: '0.68rem', color: textSub, textAlign: 'center' }}>
              <strong>Somos Perú 2026</strong>
            </div>
          )}
        </aside>
      )}

      {/* CONTENIDO PRINCIPAL */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, paddingBottom: isMobile ? '70px' : 0 }}>
        
        {/* ENCABEZADO SUPERIOR COMPACTO Y SIN ESPACIOS VACÍOS */}
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 30,
            background: bgHeader,
            borderBottom: `1px solid ${borderCol}`,
            padding: isMobile ? '8px 12px' : '10px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '10px',
            transition: 'all 0.2s ease',
            minHeight: '52px'
          }}
        >
          {/* Lado Izquierdo: Título Compacto */}
          <div style={{ minWidth: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isMobile && (
              <img
                src="/images/logo_somos_peru.svg"
                alt="Somos Perú"
                style={{ width: '26px', height: 'auto', flexShrink: 0 }}
              />
            )}
            <div style={{ minWidth: 0 }}>
              <h1 style={{ fontSize: isMobile ? '0.88rem' : '1rem', fontWeight: 900, color: textTitle, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {activeTab === 'overview' && (
                  isCoordinadorLocal && coordinatorLocal
                    ? `Control Electoral • ${coordinatorLocal}`
                    : (isCoordinadorZonal
                      ? `Control Zonal • ${coordinatorDistrict} (${coordinatorZonalLocales.length} Colegios)`
                      : ((isCoordinadorDistrital || isCoordinador) && coordinatorDistrict
                        ? `Control Electoral • ${coordinatorDistrict}`
                        : 'Control Electoral y Monitoreo'))
                )}
                {activeTab === 'capacitacion' && (
                  isCoordinadorZonal
                    ? `Capacitaciones Zona • ${coordinatorDistrict}`
                    : ((isCoordinadorDistrital || isCoordinador) && coordinatorDistrict
                      ? `Capacitaciones • ${coordinatorDistrict}`
                      : 'Progreso de Capacitaciones')
                )}
                {activeTab === 'zonas' && 'Zonas Electorales • Villa María del Triunfo'}
                {activeTab === 'mapa' && 'Mapa Zonal Territorial • Villa María del Triunfo'}
                {activeTab === 'sql' && 'Conexión Base de Datos'}
              </h1>
            </div>
          </div>

          {/* Lado Derecho: Toolbar Compacto */}
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '5px' : '8px', flexShrink: 0 }}>
            
            {/* Badge de Usuario / Coordinador */}
            {!isMobile && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  borderRadius: '16px',
                  background: isDark ? 'rgba(2, 132, 199, 0.15)' : '#e0f2fe',
                  border: '1px solid rgba(2, 132, 199, 0.3)',
                  color: '#0284c7',
                  fontWeight: 700,
                  fontSize: '0.76rem'
                }}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>
                  {user?.['Nombres y Apellidos'] || user?.fullName || 'Usuario'}
                  {coordinatorDistrict ? ` (${coordinatorDistrict})` : ''}
                </span>
              </div>
            )}

            {/* Sincronización en vivo */}
            {!isMobile && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  background: isDark ? 'rgba(16, 185, 129, 0.12)' : '#ecfdf5',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  fontSize: '0.72rem',
                  color: isDark ? '#34d399' : '#047857',
                  fontWeight: 700
                }}
              >
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 4px #10b981' }}></div>
                <span>{lastSync ? lastSync.toLocaleTimeString() : 'En vivo'}</span>
              </div>
            )}

            {/* Campana de Notificaciones en Tiempo Real (Exclusivo Superadmin Master) */}
            {canViewAudit && (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowNotifMenu(prev => !prev)}
                  title="Notificaciones de Cambios en Vivo"
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    border: `1.5px solid ${unreadAuditLogs.length > 0 ? '#ef4444' : borderCol}`,
                    background: unreadAuditLogs.length > 0 ? (isDark ? 'rgba(239, 68, 68, 0.2)' : '#fef2f2') : bgCard,
                    color: unreadAuditLogs.length > 0 ? '#ef4444' : textTitle,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.15s ease',
                    boxShadow: unreadAuditLogs.length > 0 ? '0 0 10px rgba(239, 68, 68, 0.4)' : 'none'
                  }}
                >
                  <Bell className={`w-4 h-4 ${unreadAuditLogs.length > 0 ? 'animate-bounce' : ''}`} />
                  {unreadAuditLogs.length > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '-6px',
                      right: '-6px',
                      background: '#ef4444',
                      color: '#ffffff',
                      fontSize: '0.62rem',
                      fontWeight: 900,
                      minWidth: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0 3px',
                      boxShadow: '0 0 6px rgba(239, 68, 68, 0.9)'
                    }}>
                      {unreadAuditLogs.length}
                    </span>
                  )}
                </button>

                {/* Popover / Menú Desplegable de Notificaciones */}
                {showNotifMenu && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '40px',
                      width: isMobile ? '310px' : '400px',
                      maxWidth: '92vw',
                      background: bgCard,
                      border: `1.5px solid ${isDark ? '#334155' : '#bae6fd'}`,
                      borderRadius: '16px',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.35)',
                      zIndex: 1000,
                      overflow: 'hidden',
                      animation: 'fadeIn 0.15s ease-out'
                    }}
                  >
                    {/* Header del Popover */}
                    <div style={{
                      padding: '12px 16px',
                      borderBottom: `1px solid ${borderCol}`,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: isDark ? '#0f172a' : '#f8fafc'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '1.1rem' }}>🔔</span>
                        <strong style={{ fontSize: '0.86rem', color: textTitle }}>
                          Nuevas Modificaciones ({unreadAuditLogs.length})
                        </strong>
                      </div>

                      {unreadAuditLogs.length > 0 && (
                        <button
                          onClick={markAllAuditAsSeen}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#0284c7',
                            fontSize: '0.74rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          <span>Marcar leídas</span>
                        </button>
                      )}
                    </div>

                    {/* Lista de Notificaciones */}
                    <div style={{ maxHeight: '350px', overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {unreadAuditLogs.length === 0 ? (
                        <div style={{ padding: '24px 12px', textAlign: 'center' }}>
                          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>✨</div>
                          <div style={{ fontSize: '0.86rem', fontWeight: 800, color: textTitle }}>Sin modificaciones recientes</div>
                          <p style={{ fontSize: '0.74rem', color: textSub, margin: '4px 0 0 0', lineHeight: 1.4 }}>
                            Apenas un usuario o coordinador distrital modifique o elimine un personero, te avisará aquí en vivo con el <strong>Antes</strong> y <strong>Ahora</strong>.
                          </p>
                        </div>
                      ) : (
                        unreadAuditLogs.map((item, idx) => {
                          const d = item.details || {};
                          const isDelete = item.action === 'DELETE_PERSONERO';
                          const author = d.author || item.userIdentifier || 'Usuario';
                          const authorRole = d.authorRole || item.role || 'Superadmin';
                          const pName = d.nombres || d.fullName || 'Personero';
                          const pDni = d.dni || '—';
                          const dateObj = item.createdAt ? new Date(item.createdAt) : null;
                          const timeStr = dateObj ? dateObj.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '';

                          return (
                            <div
                              key={item.id || idx}
                              style={{
                                background: isDark ? '#1e293b' : '#f8fafc',
                                border: `1.5px solid ${isDelete ? '#fca5a5' : '#bfdbfe'}`,
                                borderRadius: '12px',
                                padding: '12px',
                                fontSize: '0.76rem',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '6px'
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{
                                  background: isDelete ? '#fee2e2' : '#e0f2fe',
                                  color: isDelete ? '#b91c1c' : '#0369a1',
                                  fontWeight: 800,
                                  fontSize: '0.68rem',
                                  padding: '2px 8px',
                                  borderRadius: '6px'
                                }}>
                                  {isDelete ? '🗑️ ELIMINACIÓN' : '✏️ MODIFICACIÓN'}
                                </span>
                                <span style={{ fontSize: '0.7rem', color: textSub, fontWeight: 700 }}>⏰ {timeStr}</span>
                              </div>

                              <div>
                                <div style={{ fontWeight: 800, color: textTitle }}>
                                  👤 {author} <span style={{ color: textSub, fontWeight: 600, fontSize: '0.7rem' }}>({authorRole})</span>
                                </div>
                                <div style={{ color: isDelete ? '#dc2626' : textTitle, fontWeight: 700, marginTop: '2px' }}>
                                  {isDelete ? '❌ Eliminó a: ' : '🎯 Modificó a: '}<strong>{pName}</strong> (DNI: {pDni})
                                </div>
                              </div>

                              {/* Comparación Antes vs Ahora */}
                              {d.changes && Object.keys(d.changes).length > 0 ? (
                                <div style={{
                                  background: isDark ? '#0f172a' : '#ffffff',
                                  border: `1px solid ${borderCol}`,
                                  borderRadius: '8px',
                                  padding: '8px 10px',
                                  marginTop: '2px',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '4px'
                                }}>
                                  {Object.entries(d.changes).map(([fKey, fVal], fIdx) => (
                                    <div key={fIdx} style={{ fontSize: '0.73rem', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                      <strong style={{ color: '#0284c7', textTransform: 'capitalize' }}>{fKey}:</strong>
                                      <span style={{ color: '#dc2626', background: '#fee2e2', padding: '1px 5px', borderRadius: '4px', textDecoration: 'line-through' }}>
                                        {String(fVal?.antes ?? '—')}
                                      </span>
                                      <strong style={{ color: '#0284c7' }}>➔</strong>
                                      <span style={{ color: '#16a34a', background: '#dcfce7', padding: '1px 5px', borderRadius: '4px', fontWeight: 800 }}>
                                        {String(fVal?.despues ?? '—')}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              ) : (!isDelete && (
                                <div style={{
                                  background: isDark ? '#0f172a' : '#ffffff',
                                  border: `1px solid ${borderCol}`,
                                  borderRadius: '8px',
                                  padding: '6px 8px',
                                  marginTop: '2px',
                                  fontSize: '0.72rem',
                                  color: textSub
                                }}>
                                  💾 <strong>Revalidación de Ficha:</strong> Guardado y confirmación de datos del personero.
                                </div>
                              ))}

                              {isDelete && (
                                <div style={{ fontSize: '0.72rem', color: '#b91c1c', background: '#fef2f2', padding: '6px 8px', borderRadius: '6px' }}>
                                  ⚠️ <strong>Antes:</strong> Activo en el padrón ➔ <strong>Ahora:</strong> Borrado de la base de datos.
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Footer del Popover */}
                    <div style={{
                      padding: '10px 14px',
                      borderTop: `1px solid ${borderCol}`,
                      background: isDark ? '#0f172a' : '#f8fafc',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <button
                        onClick={() => {
                          setActiveTab('auditoria');
                          markAllAuditAsSeen();
                        }}
                        style={{
                          background: '#0284c7',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '8px 14px',
                          fontSize: '0.78rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          boxShadow: '0 2px 6px rgba(2, 132, 199, 0.3)'
                        }}
                      >
                        <History className="w-4 h-4" />
                        <span>Ver Historial Completo</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Toggle Modo Oscuro / Claro */}
            <button
              onClick={toggleTheme}
              title={isDark ? 'Modo Claro' : 'Modo Oscuro'}
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '6px',
                border: `1px solid ${borderCol}`,
                background: bgCard,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-700" />}
            </button>

            {/* Botón Salir */}
            <button
              onClick={logout}
              title="Cerrar Sesión"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '5px 10px',
                borderRadius: '6px',
                border: '1px solid #fecaca',
                background: isDark ? 'rgba(239, 68, 68, 0.15)' : '#fef2f2',
                color: '#ef4444',
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <LogOut className="w-3 h-3" />
              {!isMobile && <span>Salir</span>}
            </button>
          </div>
        </header>

        {/* CUERPO DEL TAB SELECCIONADO */}
        <div style={{ padding: isMobile ? '14px 12px' : '24px 28px', flex: 1, overflowY: 'auto' }}>
          
          {/* =========================================================================
              TAB 1: PANEL GENERAL
              ========================================================================= */}
          {activeTab === 'overview' && (
            <div>

              {/* SECCIÓN DE MONITOREO DISTRITAL: COORDINADOR DISTRITAL Y COORDINADORES ZONALES (VISIBLE PARA SUPERADMIN Y COORDINADOR DISTRITAL) */}
              {(isCoordinadorDistrital || isSuperAdmin) && (
                <div style={{
                  background: bgCard,
                  border: `1.5px solid ${isDark ? '#0284c7' : '#bae6fd'}`,
                  borderRadius: '16px',
                  padding: isMobile ? '14px' : '20px',
                  marginBottom: '20px',
                  boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.3)' : '0 4px 20px rgba(2, 132, 199, 0.08)'
                }}>
                  {/* Encabezado Principal */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <div style={{ background: '#002B66', color: '#fff', padding: '4px 8px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.76rem', fontWeight: 800 }}>
                          <ShieldCheck className="w-4 h-4" />
                          <span>JERARQUÍA DISTRITAL</span>
                        </div>
                        <h2 style={{ fontSize: isMobile ? '1rem' : '1.2rem', fontWeight: 900, color: textTitle, margin: 0 }}>
                          {coordinatorDistrict || dist1 !== 'all' ? `Coordinación Distrital • ${coordinatorDistrict || dist1}` : `Red de Coordinadores Distritales de Lima (${districtDistritalOverview.length})`}
                        </h2>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: textSub, margin: 0 }}>
                        {coordinatorDistrict || dist1 !== 'all' ? (
                          <>Estructura de <strong>{coordinatorDistrict || dist1}</strong> &bull; <strong>{districtDistritalOverview.length} Coordinador Distrital</strong> &bull; <strong>{countLocalesConPLV} Centros con Personero (PCV)</strong>{districtZonalesOverview.length > 0 ? <> &bull; <span style={{ color: textSub }}>({districtZonalesOverview.length} Zonales registrados)</span></> : null}</>
                        ) : (
                          <>Monitoreo general de Lima Metropolitana &bull; Selecciona un distrito para ver su equipo completo.</>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* CASO A: DISTRITO ESPECÍFICO SELECCIONADO O ASIGNADO */}
                  {(coordinatorDistrict || dist1 !== 'all') ? (
                    <div>
                      {/* 1. Tarjeta(s) del Coordinador Distrital */}
                      {districtDistritalOverview.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                          {districtDistritalOverview.map((cd, cdIdx) => {
                            const cdName = cd['Nombres y Apellidos'] || cd.nombresApellidos || 'Coordinador Distrital';
                            const cdDni = cd['D.N.I.'] || cd['DNI'] || cd.dni || '—';
                            const cdCel = cd['Celular'] || cd.celular || '';
                            const cdEmail = cd['Correo Electrónico'] || cd.correoElectronico || cd.email || '';
                            const cdCred = String(cd['Credenciales'] || cd.credenciales || '').toLowerCase();
                            const cdPreg = String(cd['Preguntas'] || cd.preguntas || '').toLowerCase();
                            const isAcred = cdCred === 'confirmado' || cdPreg.includes('aprob');

                            return (
                              <div
                                key={cdIdx}
                                style={{
                                  background: isDark ? 'rgba(30, 58, 138, 0.25)' : '#eff6ff',
                                  border: '1.5px solid #93c5fd',
                                  borderRadius: '12px',
                                  padding: isMobile ? '12px' : '14px 16px',
                                  display: 'flex',
                                  flexDirection: isMobile ? 'column' : 'row',
                                  alignItems: isMobile ? 'flex-start' : 'center',
                                  justifyContent: 'space-between',
                                  gap: '12px'
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                                  <div style={{
                                    width: isMobile ? '36px' : '42px',
                                    height: isMobile ? '36px' : '42px',
                                    borderRadius: '10px',
                                    background: '#1e40af',
                                    color: '#fff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: isMobile ? '1rem' : '1.2rem',
                                    flexShrink: 0
                                  }}>
                                    🏛️
                                  </div>
                                  <div style={{ minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                      <span style={{ fontSize: '0.68rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px', background: '#1e40af', color: '#fff', padding: '1px 7px', borderRadius: '4px' }}>
                                        Coordinador Distrital
                                      </span>
                                      <strong style={{ fontSize: isMobile ? '0.88rem' : '0.96rem', color: textTitle }}>
                                        {cdName}
                                      </strong>
                                      <span style={{
                                        fontSize: '0.68rem',
                                        fontWeight: 800,
                                        padding: '1px 6px',
                                        borderRadius: '4px',
                                        background: isAcred ? '#dcfce7' : '#fef9c3',
                                        color: isAcred ? '#15803d' : '#854d0e',
                                        border: `1px solid ${isAcred ? '#bbf7d0' : '#fef08a'}`
                                      }}>
                                        {isAcred ? '✅ Acreditado' : '⏳ En Proceso'}
                                      </span>
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: textSub, marginTop: '3px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                      <span>DNI: <strong>{cdDni}</strong></span>
                                      {cdCel && <span>📱 <strong>{cdCel}</strong></span>}
                                      {cdEmail && <span>✉️ {cdEmail}</span>}
                                    </div>
                                  </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: isMobile ? '100%' : 'auto', justifyContent: isMobile ? 'stretch' : 'flex-end' }}>
                                  {cdCel && (
                                    <a
                                      href={`https://wa.me/51${String(cdCel).replace(/\D/g, '')}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      style={{
                                        flex: isMobile ? 1 : 'none',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '5px',
                                        background: '#16a34a',
                                        color: '#fff',
                                        padding: '6px 12px',
                                        borderRadius: '8px',
                                        fontSize: '0.74rem',
                                        fontWeight: 800,
                                        textDecoration: 'none'
                                      }}
                                    >
                                      <Phone className="w-3.5 h-3.5" />
                                      <span>WhatsApp Distrital</span>
                                    </a>
                                  )}
                                  <button
                                    onClick={() => setSelectedPersonero(cd)}
                                    style={{
                                      flex: isMobile ? 1 : 'none',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: '4px',
                                      background: isDark ? '#1e293b' : '#ffffff',
                                      border: `1px solid ${borderCol}`,
                                      color: textTitle,
                                      padding: '6px 12px',
                                      borderRadius: '8px',
                                      fontSize: '0.74rem',
                                      fontWeight: 800,
                                      cursor: 'pointer'
                                    }}
                                  >
                                    <Edit3 className="w-3.5 h-3.5 text-sky-500" />
                                    <span>Ver Ficha</span>
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div style={{ padding: '12px 14px', background: isDark ? 'rgba(234, 179, 8, 0.1)' : '#fefce8', border: '1px solid #fde047', borderRadius: '10px', color: isDark ? '#facc15' : '#a16207', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          <span>Aún no hay Coordinador Distrital registrado para el distrito de {coordinatorDistrict || dist1}.</span>
                        </div>
                      )}

                      {/* 2. Sección de Coordinadores Zonales para Coordinador Distrital y Vista de Distrito */}
                      {districtZonalesOverview.length > 0 && (
                        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: `1px dashed ${borderCol}` }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{
                                background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                                color: '#ffffff',
                                padding: '4px 10px',
                                borderRadius: '8px',
                                fontSize: '0.75rem',
                                fontWeight: 900,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                boxShadow: '0 2px 6px rgba(139, 92, 246, 0.3)'
                              }}>
                                🗺️ COORDINADORES ZONALES ({districtZonalesOverview.length})
                              </span>
                              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: textSub }}>
                                {coordinatorDistrict || dist1}
                              </span>
                            </div>
                            <span style={{ fontSize: '0.74rem', color: textSub, fontWeight: 600 }}>
                              Desliza horizontalmente para ver todos ({districtZonalesOverview.length}) &rarr;
                            </span>
                          </div>

                          <div style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'stretch',
                            gap: '14px',
                            overflowX: 'auto',
                            overflowY: 'hidden',
                            paddingBottom: '8px',
                            scrollbarWidth: 'thin',
                            WebkitOverflowScrolling: 'touch'
                          }}>
                            {districtZonalesOverview.map((zonal, zIdx) => (
                              <div
                                key={zIdx}
                                style={{
                                  flex: '0 0 auto',
                                  width: isMobile ? '280px' : '340px',
                                  display: 'flex'
                                }}
                              >
                                <ZonalOverviewCard
                                  zonal={zonal}
                                  isDark={isDark}
                                  borderCol={borderCol}
                                  onEdit={setSelectedPersonero}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  ) : (
                    /* CASO B: SUPERADMIN EN VISTA GENERAL (TODOS LOS DISTRITOS) */
                    <div>
                      {districtDistritalOverview.length > 0 ? (
                        <div style={{
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'stretch',
                          gap: '14px',
                          overflowX: 'auto',
                          overflowY: 'hidden',
                          paddingBottom: '8px',
                          scrollbarWidth: 'thin',
                          WebkitOverflowScrolling: 'touch'
                        }}>
                          {districtDistritalOverview.map((cd, cdIdx) => {
                            const cdName = cd['Nombres y Apellidos'] || cd.nombresApellidos || 'Coordinador Distrital';
                            const cdDni = cd['D.N.I.'] || cd['DNI'] || cd.dni || '—';
                            const cdCel = cd['Celular'] || cd.celular || '';
                            const cdDist = cd['Distrito Asignado'] || cd['Distrito donde Vota'] || cd.distritoAsignado || 'Lima';
                            const cdCred = String(cd['Credenciales'] || cd.credenciales || '').toLowerCase();
                            const isAcred = cdCred === 'confirmado';

                            return (
                              <div
                                key={cdIdx}
                                style={{
                                  flex: '0 0 auto',
                                  width: isMobile ? '280px' : '320px',
                                  background: isDark ? '#1e293b' : '#f8fafc',
                                  border: '1.5px solid #93c5fd',
                                  borderRadius: '12px',
                                  padding: '14px',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '8px',
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                                }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                  <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    background: '#1e40af',
                                    color: '#fff',
                                    padding: '2px 8px',
                                    borderRadius: '6px',
                                    fontSize: '0.68rem',
                                    fontWeight: 900
                                  }}>
                                    📍 {cdDist}
                                  </span>
                                  <span style={{
                                    fontSize: '0.68rem',
                                    fontWeight: 800,
                                    padding: '1px 6px',
                                    borderRadius: '4px',
                                    background: isAcred ? '#dcfce7' : '#fef9c3',
                                    color: isAcred ? '#15803d' : '#854d0e'
                                  }}>
                                    {isAcred ? '✅ Acreditado' : '⏳ Pendiente'}
                                  </span>
                                </div>

                                <div>
                                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: textTitle }}>
                                    {cdName}
                                  </div>
                                  <div style={{ fontSize: '0.74rem', color: textSub, marginTop: '2px' }}>
                                    DNI: <strong>{cdDni}</strong>
                                  </div>
                                </div>

                                <div style={{ marginTop: 'auto', paddingTop: '6px', borderTop: `1px dashed ${borderCol}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                                  {cdCel ? (
                                    <a
                                      href={`https://wa.me/51${String(cdCel).replace(/\D/g, '')}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      style={{
                                        color: '#16a34a',
                                        fontSize: '0.74rem',
                                        fontWeight: 800,
                                        textDecoration: 'none',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '3px'
                                      }}
                                    >
                                      <Phone className="w-3 h-3" />
                                      <span>{cdCel}</span>
                                    </a>
                                  ) : (
                                    <span style={{ fontSize: '0.72rem', color: textSub }}>Sin Celular</span>
                                  )}

                                  <button
                                    onClick={() => setDist1(cdDist)}
                                    style={{
                                      padding: '3px 8px',
                                      borderRadius: '6px',
                                      border: '1px solid #0284c7',
                                      background: isDark ? 'rgba(2,132,199,0.15)' : '#e0f2fe',
                                      color: '#0284c7',
                                      fontSize: '0.7rem',
                                      fontWeight: 800,
                                      cursor: 'pointer'
                                    }}
                                  >
                                    Ver Distrito &rarr;
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div style={{ padding: '12px 14px', background: isDark ? 'rgba(234, 179, 8, 0.1)' : '#fefce8', border: '1px solid #fde047', borderRadius: '10px', color: isDark ? '#facc15' : '#a16207', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          <span>Aún no hay Coordinadores Distritales registrados en la base de datos.</span>
                        </div>
                      )}

                      {/* Coordinadores Zonales de Villa María del Triunfo para Superadmin (supera, eric, paola, susana) */}
                      {isSuperAdmin && vmtZonalesOverview.length > 0 && (
                        <div style={{ marginTop: '18px', paddingTop: '16px', borderTop: `1px dashed ${borderCol}` }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{
                                background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                                color: '#ffffff',
                                padding: '4px 10px',
                                borderRadius: '8px',
                                fontSize: '0.75rem',
                                fontWeight: 900,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                boxShadow: '0 2px 6px rgba(139, 92, 246, 0.3)'
                              }}>
                                🗺️ COORDINADORES ZONALES • VILLA MARÍA DEL TRIUNFO ({vmtZonalesOverview.length})
                              </span>
                              <span style={{ fontSize: '0.76rem', color: textSub, fontWeight: 600 }}>
                                (Zonas electorales territoriales de V.M.T.)
                              </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '0.74rem', color: textSub, fontWeight: 600 }}>
                                Desliza horizontalmente &rarr;
                              </span>
                              <button
                                onClick={() => setDist1('VILLA MARIA DEL TRIUNFO')}
                                style={{
                                  padding: '4px 12px',
                                  borderRadius: '6px',
                                  border: '1px solid #8b5cf6',
                                  background: isDark ? 'rgba(139, 92, 246, 0.15)' : '#ede9fe',
                                  color: '#7c3aed',
                                  fontSize: '0.72rem',
                                  fontWeight: 800,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <span>Filtrar solo V.M.T.</span>
                                <span>&rarr;</span>
                              </button>
                            </div>
                          </div>

                          <div style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'stretch',
                            gap: '14px',
                            overflowX: 'auto',
                            overflowY: 'hidden',
                            paddingBottom: '8px',
                            scrollbarWidth: 'thin',
                            WebkitOverflowScrolling: 'touch'
                          }}>
                            {vmtZonalesOverview.map((zonal, zIdx) => (
                              <div
                                key={zIdx}
                                style={{
                                  flex: '0 0 auto',
                                  width: isMobile ? '280px' : '340px',
                                  display: 'flex'
                                }}
                              >
                                <ZonalOverviewCard
                                  zonal={zonal}
                                  isDark={isDark}
                                  borderCol={borderCol}
                                  onEdit={setSelectedPersonero}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}



              {/* SECCIÓN EXCLUSIVA DE MONITOREO LOCAL (PCV): MI CENTRO DE VOTACIÓN Y PERSONEROS DE MESA */}
              {isCoordinadorLocal && (
                <div style={{
                  background: bgCard,
                  border: `1.5px solid ${isDark ? '#10b981' : '#a7f3d0'}`,
                  borderRadius: '16px',
                  padding: isMobile ? '14px' : '20px',
                  marginBottom: '20px',
                  boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.3)' : '0 4px 20px rgba(16, 185, 129, 0.08)'
                }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <div style={{ background: '#10b981', color: '#fff', padding: '4px 8px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.76rem', fontWeight: 800 }}>
                          <School className="w-4 h-4" />
                          <span>MI CENTRO DE VOTACIÓN ASIGNADO</span>
                        </div>
                        <h2 style={{ fontSize: isMobile ? '1.05rem' : '1.25rem', fontWeight: 900, color: textTitle, margin: 0 }}>
                          {coordinatorLocal || 'Centro de Votación'}
                        </h2>
                      </div>
                      <p style={{ fontSize: '0.82rem', color: textSub, margin: 0 }}>
                        Distrito de <strong>{coordinatorDistrict}</strong> &bull; Personero de Centro: <strong>{user?.nombresApellidos || user?.['Nombres y Apellidos'] || 'Tú'}</strong>
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        background: isDark ? 'rgba(16, 185, 129, 0.15)' : '#ecfdf5',
                        border: '1px solid #10b981',
                        borderRadius: '10px',
                        padding: '6px 14px',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: isDark ? '#34d399' : '#047857' }}>COBERTURA DE MESAS</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#10b981' }}>{coberturaMesasPct}%</div>
                      </div>
                    </div>
                  </div>

                  {/* Resumen de Mesas y Personeros de este local */}
                  <div style={{
                    background: isDark ? '#0f172a' : '#f8fafc',
                    border: `1px solid ${borderCol}`,
                    borderRadius: '12px',
                    padding: '12px 16px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', fontSize: '0.82rem' }}>
                      <span>🗳️ Total Mesas: <strong>{targetMesas}</strong></span>
                      <span>👥 Personeros Registrados: <strong style={{ color: '#0284c7' }}>{tab1Personeros}</strong></span>
                      <span>⭐ Con Experiencia: <strong style={{ color: '#16a34a' }}>{tab1Exp}</strong></span>
                      <span>🚗 Con Movilidad: <strong style={{ color: '#8b5cf6' }}>{tab1Mov}</strong></span>
                    </div>

                    <div style={{ fontSize: '0.78rem', color: textSub }}>
                      {tab1Personeros >= targetMesas ? (
                        <span style={{ color: '#10b981', fontWeight: 800 }}>✅ Todas las mesas cubiertas</span>
                      ) : (
                        <span style={{ color: '#f59e0b', fontWeight: 800 }}>⚠️ Faltan {Math.max(0, targetMesas - tab1Personeros)} personeros</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Barra de Filtros Limpia */}
              <div style={{ background: bgCard, border: `1px solid ${borderCol}`, borderRadius: '12px', padding: isMobile ? '12px 14px' : '16px 18px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: isMobile ? '8px' : '10px', alignItems: 'center' }}>
                  
                  {/* Búsqueda por texto */}
                  <div style={{ position: 'relative', flex: isMobile ? '1 1 100%' : '1 1 200px' }}>
                    <Search className="w-4 h-4 text-sky-500" style={{ position: 'absolute', left: '12px', top: '10px' }} />
                    <input
                      type="text"
                      placeholder="Buscar por Nombre, DNI, Local..."
                      value={search1}
                      onChange={(e) => setSearch1(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px 8px 34px', borderRadius: '8px', border: `1px solid ${borderCol}`, background: bgInput, color: textTitle, fontSize: '0.82rem', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  {/* Filtro Distrito */}
                  {coordinatorDistrict ? (
                    <div
                      title="Distrito asignado permanentemente a tu cuenta de coordinador"
                      style={{
                        padding: '8px 14px',
                        borderRadius: '8px',
                        border: '1.5px solid #0284c7',
                        fontSize: '0.82rem',
                        background: isDark ? 'rgba(2, 132, 199, 0.15)' : '#e0f2fe',
                        color: '#0284c7',
                        fontWeight: 800,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        userSelect: 'none',
                        flex: isMobile ? '1 1 100%' : 'none',
                        justifyContent: isMobile ? 'center' : 'flex-start'
                      }}
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Distrito: {coordinatorDistrict}</span>
                    </div>
                  ) : (
                    <select
                      value={dist1}
                      onChange={(e) => setDist1(e.target.value)}
                      style={{ padding: '8px 10px', borderRadius: '8px', border: dist1 !== 'all' ? '1.5px solid #0284c7' : `1px solid ${borderCol}`, fontSize: '0.82rem', background: dist1 !== 'all' ? (isDark ? '#1e293b' : '#f0f9ff') : bgInput, color: textTitle, fontWeight: dist1 !== 'all' ? 700 : 500, flex: isMobile ? '1 1 calc(50% - 4px)' : 'none', minWidth: 0 }}
                    >
                      <option value="all">📍 Todos Distritos</option>
                      {DISTRITOS_LIMA.map((d, i) => (
                        <option key={i} value={d}>{d}</option>
                      ))}
                    </select>
                  )}

                  {/* Filtro Local para Coordinador de Local */}
                  {isCoordinadorLocal && coordinatorLocal && (
                    <div style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid #10b981',
                      fontSize: '0.82rem',
                      background: isDark ? 'rgba(16, 185, 129, 0.15)' : '#ecfdf5',
                      color: isDark ? '#34d399' : '#047857',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      flex: isMobile ? '1 1 100%' : 'none',
                      justifyContent: isMobile ? 'center' : 'flex-start'
                    }}>
                      <School className="w-3.5 h-3.5" />
                      <span>{coordinatorLocal}</span>
                    </div>
                  )}

                  {/* Filtro Roles según Jerarquía */}
                  <select
                    value={role1}
                    onChange={(e) => setRole1(e.target.value)}
                    style={{ padding: '8px 10px', borderRadius: '8px', border: role1 !== 'all' ? '1.5px solid #0284c7' : `1px solid ${borderCol}`, fontSize: '0.82rem', background: role1 !== 'all' ? (isDark ? '#1e293b' : '#f0f9ff') : bgInput, color: textTitle, fontWeight: role1 !== 'all' ? 700 : 500, flex: isMobile ? '1 1 calc(50% - 4px)' : 'none', minWidth: 0 }}
                  >
                    <option value="all">🛡️ Todos los Roles</option>
                    <option value="Personero de Mesa">Personero de Mesa</option>
                    {!isCoordinadorLocal && <option value="Personero de Local de Votación">Personero de Centro (PCV)</option>}
                    {(isSuperAdmin || normalizeDistrictName(coordinatorDistrict || dist1) === 'VILLA MARIA DEL TRIUNFO') && <option value="Coordinador Zonal">Coordinador Zonal (VMT)</option>}
                    {isSuperAdmin && <option value="Coordinador Distrital">Coordinador Distrital</option>}
                  </select>

                  {/* Filtro Colegio / Centro de Votación */}
                  <select
                    value={colegio1}
                    onChange={(e) => setColegio1(e.target.value)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: colegio1 !== 'all' ? '1.5px solid #0284c7' : `1px solid ${borderCol}`,
                      fontSize: '0.82rem',
                      background: colegio1 !== 'all' ? (isDark ? '#1e293b' : '#f0f9ff') : bgInput,
                      color: textTitle,
                      fontWeight: colegio1 !== 'all' ? 700 : 500,
                      flex: isMobile ? '1 1 calc(50% - 4px)' : 'none',
                      maxWidth: isMobile ? 'none' : '220px',
                      minWidth: 0
                    }}
                  >
                    <option value="all">🏫 Todos los Colegios</option>
                    {availableSchoolsList.map((sch, i) => (
                      <option key={i} value={sch}>{sch}</option>
                    ))}
                  </select>

                  {/* Filtro Experiencia */}
                  <select
                    value={exp1}
                    onChange={(e) => setExp1(e.target.value)}
                    style={{ padding: '8px 10px', borderRadius: '8px', border: exp1 !== 'all' ? '1.5px solid #0284c7' : `1px solid ${borderCol}`, fontSize: '0.82rem', background: exp1 !== 'all' ? (isDark ? '#1e293b' : '#f0f9ff') : bgInput, color: textTitle, fontWeight: exp1 !== 'all' ? 700 : 500, flex: isMobile ? '1 1 calc(50% - 4px)' : 'none', minWidth: 0 }}
                  >
                    <option value="all">⭐ Exp: Todos</option>
                    <option value="si">Exp: Sí</option>
                    <option value="no">Exp: No</option>
                  </select>

                  {/* Filtro Movilidad */}
                  <select
                    value={mov1}
                    onChange={(e) => setMov1(e.target.value)}
                    style={{ padding: '8px 10px', borderRadius: '8px', border: mov1 !== 'all' ? '1.5px solid #0284c7' : `1px solid ${borderCol}`, fontSize: '0.82rem', background: mov1 !== 'all' ? (isDark ? '#1e293b' : '#f0f9ff') : bgInput, color: textTitle, fontWeight: mov1 !== 'all' ? 700 : 500, flex: isMobile ? '1 1 calc(50% - 4px)' : 'none', minWidth: 0 }}
                  >
                    <option value="all">🚗 Mov: Todos</option>
                    <option value="si">Movilidad: Sí</option>
                    <option value="no">Movilidad: No</option>
                  </select>

                  {/* Botón Limpiar Filtros */}
                  {isFiltered1 && (
                    <button
                      onClick={() => { setSearch1(''); setDist1(coordinatorDistrict || 'all'); setRole1('all'); setColegio1('all'); setCoordLocalFilter1('all'); setAlertFilter1('all'); setExp1('all'); setMov1('all'); }}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '8px',
                        border: '1px solid #f87171',
                        background: isDark ? 'rgba(239, 68, 68, 0.15)' : '#fef2f2',
                        color: '#ef4444',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        flex: isMobile ? '1 1 100%' : 'none'
                      }}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Limpiar Todo</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Indicadores Electorales Clave (KPIs Electorales Sincronizados con Animación Suave) */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', fontWeight: 900, color: textTitle }}>
                    <LayoutGrid className="w-4 h-4 text-sky-500" />
                    <span>Indicadores Electorales • {scopeLabel}</span>
                  </div>
                  <span style={{ fontSize: '0.74rem', color: textSub }}>
                    {isFiltered1 ? `Métricas para ${tab1Total} seleccionados` : `Padrón y metas de ${scopeLabel}`}
                  </span>
                </div>

                <div
                  key={`kpi-grid-${dist1}-${role1}-${exp1}-${mov1}-${comp1}`}
                  style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(140px, 1fr))', gap: isMobile ? '8px' : '12px' }}
                >
                  
                  {/* KPI 1 - Personeros de Mesa Registrados (Azul Marino Somos Perú) */}
                  <div style={{ background: bgCard, border: `1px solid ${borderCol}`, borderLeft: '4px solid #002B66', borderRadius: '10px', padding: isMobile ? '10px 12px' : '14px', minWidth: 0, transition: 'all 0.3s ease', boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.2)' : '0 1px 4px rgba(0, 43, 102, 0.08)' }}>
                    <div style={{ fontSize: '0.66rem', fontWeight: 800, color: '#002B66' }}>PERSONEROS DE MESA</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '4px 0' }}>
                      <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: isDark ? 'rgba(0, 43, 102, 0.35)' : '#e0e7ff', color: '#002B66', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Users className="w-3.5 h-3.5" /></div>
                      <span style={{ fontSize: isMobile ? '1.2rem' : '1.45rem', fontWeight: 900, color: textTitle, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tab1Personeros.toLocaleString()}</span>
                    </div>
                    <div style={{ fontSize: '0.65rem', color: textSub }}>
                      {isCoordinadorLocal ? 'En tu centro de votación' : `En ${scopeLabel}`}
                    </div>
                  </div>

                  {/* KPI 2 - Centros de Votación (Azul Rey Somos Perú) */}
                  {!isCoordinadorLocal && (
                    <div style={{ background: bgCard, border: `1px solid ${borderCol}`, borderLeft: '4px solid #1e40af', borderRadius: '10px', padding: isMobile ? '10px 12px' : '14px', minWidth: 0, transition: 'all 0.3s ease' }}>
                      <div style={{ fontSize: '0.66rem', fontWeight: 800, color: '#1e40af' }}>
                        CENTROS DE VOTACIÓN
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '4px 0' }}>
                        <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: isDark ? 'rgba(30, 64, 175, 0.25)' : '#eff6ff', color: '#1e40af', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><School className="w-3.5 h-3.5" /></div>
                        <span style={{ fontSize: isMobile ? '1.2rem' : '1.45rem', fontWeight: 900, color: textTitle, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{districtSchools.length.toLocaleString()}</span>
                      </div>
                      <div style={{ fontSize: '0.65rem', color: textSub }}>
                        Centros en {scopeLabel}
                      </div>
                    </div>
                  )}

                  {/* KPI 3 - Personeros de Centro de Votación (Rojo Corazón Somos Perú) */}
                  {!isCoordinadorLocal && (
                    <div style={{ background: bgCard, border: `1px solid ${borderCol}`, borderLeft: '4px solid #dc2626', borderRadius: '10px', padding: isMobile ? '10px 12px' : '14px', minWidth: 0, transition: 'all 0.3s ease' }}>
                      <div style={{ fontSize: '0.66rem', fontWeight: 800, color: '#dc2626' }}>CENTROS CON PCV (LOCAL)</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '4px 0' }}>
                        <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: isDark ? 'rgba(220, 38, 38, 0.2)' : '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><UserCheck className="w-3.5 h-3.5" /></div>
                        <span style={{ fontSize: isMobile ? '1.2rem' : '1.45rem', fontWeight: 900, color: textTitle, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{countLocalesConPLV}</span>
                      </div>
                      <div style={{ fontSize: '0.65rem', color: textSub }}>Personeros de Centro Asignados</div>
                    </div>
                  )}

                  {/* KPI 4 - Coordinadores Zonales (Púrpura Somos Perú - Exclusivo Villa María del Triunfo) */}
                  {(isSuperAdmin || normalizeDistrictName(coordinatorDistrict || dist1) === 'VILLA MARIA DEL TRIUNFO') && (
                    <div style={{ background: bgCard, border: `1px solid ${borderCol}`, borderLeft: '4px solid #8b5cf6', borderRadius: '10px', padding: isMobile ? '10px 12px' : '14px', minWidth: 0, transition: 'all 0.3s ease', boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.2)' : '0 1px 4px rgba(139, 92, 246, 0.08)' }}>
                      <div style={{ fontSize: '0.66rem', fontWeight: 800, color: '#7c3aed' }}>COORD. ZONALES (VMT)</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '4px 0' }}>
                        <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: isDark ? 'rgba(139, 92, 246, 0.25)' : '#ede9fe', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Navigation className="w-3.5 h-3.5" /></div>
                        <span style={{ fontSize: isMobile ? '1.2rem' : '1.45rem', fontWeight: 900, color: textTitle, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{vmtZonalesOverview.length}</span>
                      </div>
                      <div style={{ fontSize: '0.65rem', color: textSub }}>Coordinadores en V.M.T.</div>
                    </div>
                  )}

                  {/* KPI 5 - Coordinadores Distritales (Dorado Institucional Somos Perú) */}
                  {(isSuperAdmin || isCoordinadorDistrital) && (
                    <div style={{ background: bgCard, border: `1px solid ${borderCol}`, borderLeft: '4px solid #c59b27', borderRadius: '10px', padding: isMobile ? '10px 12px' : '14px', minWidth: 0, transition: 'all 0.3s ease' }}>
                      <div style={{ fontSize: '0.66rem', fontWeight: 800, color: '#b45309' }}>COORD. DISTRITALES</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '4px 0' }}>
                        <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: isDark ? 'rgba(197, 155, 39, 0.25)' : '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><ShieldCheck className="w-3.5 h-3.5" /></div>
                        <span style={{ fontSize: isMobile ? '1.2rem' : '1.45rem', fontWeight: 900, color: textTitle, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tab1CoordsDistrital}</span>
                      </div>
                      <div style={{ fontSize: '0.65rem', color: textSub }}>Distritales Activos</div>
                    </div>
                  )}

                </div>
              </div>

              {/* BOTONES DE VISTA DE TAB 1: [ Centros y Mesas ] [ Padrón Detallado ] [ Descargar Excel ] */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => {
                      setViewMode1('cards');
                      if (role1 === 'Coordinador Distrital' || role1 === 'Coordinador Zonal') {
                        setRole1('all');
                      }
                    }}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: 'none',
                      background: viewMode1 === 'cards' ? '#002B66' : (isDark ? '#1e293b' : '#f1f5f9'),
                      color: viewMode1 === 'cards' ? '#ffffff' : textSub,
                      fontWeight: 800,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <School className="w-4 h-4" />
                    <span>Centros y Mesas</span>
                  </button>

                  <button
                    onClick={() => setViewMode1('tabla')}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: 'none',
                      background: viewMode1 === 'tabla' ? '#002B66' : (isDark ? '#1e293b' : '#f1f5f9'),
                      color: viewMode1 === 'tabla' ? '#ffffff' : textSub,
                      fontWeight: 800,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <LayoutGrid className="w-4 h-4" />
                    <span>Padrón Detallado</span>
                  </button>
                </div>

                <button
                  onClick={() => handleDownloadExcel(dist1)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#10b981',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    textDecoration: 'none',
                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.35)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.25)';
                  }}
                  title={isCoordinadorLocal ? `Exportar Padrón de ${coordinatorLocal}` : (isCoordinadorZonal ? `Exportar Padrón de Zona ${assignedVmtZone || ''}` : 'Descargar Padrón Oficial')}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Descargar Excel {isCoordinadorLocal ? '(Mi Colegio)' : (isCoordinadorZonal && assignedVmtZone ? `(${assignedVmtZone.replace('ZONA ', '')})` : '')}</span>
                </button>
              </div>

              {/* VISTA TARJETAS DE COORDINADORES (CUANDO SE FILTRA POR ROL COORDINADOR) */}
              {viewMode1 === 'cards' && (role1 === 'Coordinador Distrital' || role1 === 'Coordinador Zonal') && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* SECCIÓN 1: COORDINADORES DISTRITALES */}
                  {role1 === 'Coordinador Distrital' && (
                    <div style={{ background: bgCard, border: `1px solid ${borderCol}`, borderRadius: '16px', padding: isMobile ? '14px' : '20px', boxShadow: isDark ? '0 4px 16px rgba(0,0,0,0.2)' : '0 2px 10px rgba(0,0,0,0.04)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ background: 'linear-gradient(135deg, #1e40af 0%, #002B66 100%)', color: '#fff', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 900, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                            🏛️ COORDINADORES DISTRITALES
                          </span>
                          <strong style={{ fontSize: '0.92rem', color: textTitle }}>
                            ({filteredRecords1.filter(r => {
                              const rol = String(r['Rol a Desempeñar'] || r.rolADesempenar || '').toLowerCase();
                              return rol.includes('distrital') || rol.includes('distrito');
                            }).length} registrados)
                          </strong>
                        </div>
                        <span style={{ fontSize: '0.74rem', color: textSub }}>
                          {dist1 !== 'all' ? `Distrito: ${dist1}` : 'Todos los distritos de Lima'}
                        </span>
                      </div>

                      {filteredRecords1.filter(r => {
                        const rol = String(r['Rol a Desempeñar'] || r.rolADesempenar || '').toLowerCase();
                        return rol.includes('distrital') || rol.includes('distrito');
                      }).length === 0 ? (
                        <div style={{ padding: '24px 16px', textAlign: 'center', background: isDark ? 'rgba(234, 179, 8, 0.08)' : '#fefce8', border: '1px solid #fde047', borderRadius: '12px', color: isDark ? '#facc15' : '#a16207', fontSize: '0.84rem', fontWeight: 700 }}>
                          ⚠️ Aún no hay Coordinador Distrital registrado para los filtros seleccionados ({dist1 !== 'all' ? dist1 : 'Lima'}).
                        </div>
                      ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>
                          {filteredRecords1.filter(r => {
                            const rol = String(r['Rol a Desempeñar'] || r.rolADesempenar || '').toLowerCase();
                            return rol.includes('distrital') || rol.includes('distrito');
                          }).map((cd, cdIdx) => {
                            const cdName = cd['Nombres y Apellidos'] || cd.nombresApellidos || 'Coordinador Distrital';
                            const cdDni = cd['D.N.I.'] || cd['DNI'] || cd.dni || '—';
                            const cdCel = cd['Celular'] || cd.celular || '';
                            const cdEmail = cd['Correo Electrónico'] || cd.correoElectronico || cd.email || '';
                            const cdDist = cd['Distrito Asignado'] || cd['Distrito donde Vota'] || cd.distritoAsignado || 'Lima';
                            const cdCred = String(cd['Credenciales'] || cd.credenciales || '').toLowerCase();
                            const isAcred = cdCred === 'confirmado';
                            const exp = getExp(cd);
                            const mov = getMov(cd);
                            const comp = getComp(cd);

                            return (
                              <div
                                key={cdIdx}
                                style={{
                                  background: isDark ? '#1e293b' : '#ffffff',
                                  border: `1.5px solid ${isAcred ? '#86efac' : borderCol}`,
                                  borderLeft: '5px solid #1e40af',
                                  borderRadius: '14px',
                                  padding: '16px',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '10px',
                                  boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.2)' : '0 1px 6px rgba(0,0,0,0.04)'
                                }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span style={{
                                    background: '#1e40af',
                                    color: '#ffffff',
                                    padding: '3px 9px',
                                    borderRadius: '6px',
                                    fontSize: '0.72rem',
                                    fontWeight: 900,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}>
                                    📍 {cdDist}
                                  </span>
                                  <span style={{
                                    fontSize: '0.7rem',
                                    fontWeight: 800,
                                    padding: '2px 8px',
                                    borderRadius: '6px',
                                    background: isAcred ? '#dcfce7' : '#fef9c3',
                                    color: isAcred ? '#15803d' : '#854d0e',
                                    border: `1px solid ${isAcred ? '#86efac' : '#fde047'}`
                                  }}>
                                    {isAcred ? '✅ Acreditado' : '⏳ Pendiente'}
                                  </span>
                                </div>

                                <div>
                                  <div style={{ fontWeight: 900, fontSize: '0.96rem', color: textTitle }}>
                                    {cdName}
                                  </div>
                                  <div style={{ fontSize: '0.76rem', color: textSub, marginTop: '2px' }}>
                                    DNI: <strong>{cdDni}</strong> {cdEmail && <span style={{ marginLeft: '6px' }}>✉️ {cdEmail}</span>}
                                  </div>
                                </div>

                                <div style={{ display: 'flex', gap: '8px', fontSize: '0.72rem', fontWeight: 800 }}>
                                  <span style={{ color: exp === 'Sí' ? '#16a34a' : '#94a3b8' }}>⭐ Exp: {exp}</span>
                                  <span style={{ color: mov === 'Sí' ? '#16a34a' : '#94a3b8' }}>🚗 Mov: {mov}</span>
                                  <span style={{ color: comp === 'Sí' ? '#16a34a' : '#ef4444' }}>📅 Comp: {comp}</span>
                                </div>

                                <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: `1px dashed ${borderCol}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                  {cdCel ? (
                                    <a
                                      href={`https://wa.me/51${String(cdCel).replace(/\D/g, '')}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      style={{
                                        background: '#16a34a',
                                        color: '#ffffff',
                                        padding: '5px 10px',
                                        borderRadius: '6px',
                                        fontSize: '0.72rem',
                                        fontWeight: 800,
                                        textDecoration: 'none',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                      }}
                                    >
                                      <Phone className="w-3 h-3" />
                                      <span>{cdCel}</span>
                                    </a>
                                  ) : (
                                    <span style={{ fontSize: '0.72rem', color: textSub }}>Sin Celular</span>
                                  )}

                                  <div style={{ display: 'flex', gap: '6px' }}>
                                    <button
                                      onClick={() => setSelectedPersonero(cd)}
                                      style={{
                                        padding: '5px 10px',
                                        borderRadius: '6px',
                                        border: `1px solid ${borderCol}`,
                                        background: isDark ? '#1e293b' : '#f8fafc',
                                        color: textTitle,
                                        fontSize: '0.72rem',
                                        fontWeight: 800,
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '3px'
                                      }}
                                    >
                                      <Edit3 className="w-3 h-3 text-sky-500" />
                                      <span>Ver Ficha</span>
                                    </button>

                                    <button
                                      onClick={() => { setDist1(cdDist); setRole1('all'); setViewMode1('cards'); }}
                                      style={{
                                        padding: '5px 10px',
                                        borderRadius: '6px',
                                        border: '1px solid #0284c7',
                                        background: isDark ? 'rgba(2,132,199,0.15)' : '#e0f2fe',
                                        color: '#0284c7',
                                        fontSize: '0.72rem',
                                        fontWeight: 800,
                                        cursor: 'pointer'
                                      }}
                                    >
                                      Ver Centros &rarr;
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* SECCIÓN 2: COORDINADORES ZONALES */}
                  {role1 === 'Coordinador Zonal' && (
                    <div style={{ background: bgCard, border: `1px solid ${borderCol}`, borderRadius: '16px', padding: isMobile ? '14px' : '20px', boxShadow: isDark ? '0 4px 16px rgba(0,0,0,0.2)' : '0 2px 10px rgba(0,0,0,0.04)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', color: '#fff', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 900, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                            🗺️ COORDINADORES ZONALES
                          </span>
                          <strong style={{ fontSize: '0.92rem', color: textTitle }}>
                            ({filteredRecords1.filter(r => {
                              const rol = String(r['Rol a Desempeñar'] || r.rolADesempenar || '').toLowerCase();
                              return rol.includes('zonal') || rol.includes('zona');
                            }).length} registrados)
                          </strong>
                        </div>
                        <span style={{ fontSize: '0.74rem', color: textSub }}>
                          Zonas electorales asignadas
                        </span>
                      </div>

                      {filteredRecords1.filter(r => {
                        const rol = String(r['Rol a Desempeñar'] || r.rolADesempenar || '').toLowerCase();
                        return rol.includes('zonal') || rol.includes('zona');
                      }).length === 0 ? (
                        <div style={{ padding: '24px 16px', textAlign: 'center', background: isDark ? 'rgba(139, 92, 246, 0.08)' : '#ede9fe', border: '1px solid #c4b5fd', borderRadius: '12px', color: '#7c3aed', fontSize: '0.84rem', fontWeight: 700 }}>
                          ℹ️ No hay Coordinadores Zonales registrados con los filtros seleccionados ({dist1 !== 'all' ? dist1 : 'Lima'}).
                        </div>
                      ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(340px, 1fr))', gap: '14px' }}>
                          {filteredRecords1.filter(r => {
                            const rol = String(r['Rol a Desempeñar'] || r.rolADesempenar || '').toLowerCase();
                            return rol.includes('zonal') || rol.includes('zona');
                          }).map((z, zIdx) => {
                            const zName = z['Nombres y Apellidos'] || z.nombresApellidos || 'Coordinador Zonal';
                            const zDni = z['D.N.I.'] || z['DNI'] || z.dni || '—';
                            const zCel = z['Celular'] || z.celular || '';
                            const zDist = z['Distrito Asignado'] || z['Distrito donde Vota'] || z.distritoAsignado || 'Lima';
                            const rawLocales = z['Local de Votación Asignado'] || z.localDeVotacionAsignado || z['Local de Votación'] || '';
                            const zSchools = rawLocales.split(',').map(s => s.trim()).filter(Boolean);
                            const zCred = String(z['Credenciales'] || z.credenciales || '').toLowerCase();
                            const isAcred = zCred === 'confirmado';

                            return (
                              <div
                                key={zIdx}
                                style={{
                                  background: isDark ? '#1e293b' : '#ffffff',
                                  border: `1.5px solid ${isAcred ? '#86efac' : borderCol}`,
                                  borderLeft: '5px solid #8b5cf6',
                                  borderRadius: '14px',
                                  padding: '16px',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '10px',
                                  boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.2)' : '0 1px 6px rgba(0,0,0,0.04)'
                                }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span style={{
                                    background: '#7c3aed',
                                    color: '#ffffff',
                                    padding: '3px 9px',
                                    borderRadius: '6px',
                                    fontSize: '0.72rem',
                                    fontWeight: 900
                                  }}>
                                    🗺️ {zDist}
                                  </span>
                                  <span style={{
                                    fontSize: '0.7rem',
                                    fontWeight: 800,
                                    padding: '2px 8px',
                                    borderRadius: '6px',
                                    background: isAcred ? '#dcfce7' : '#fef9c3',
                                    color: isAcred ? '#15803d' : '#854d0e',
                                    border: `1px solid ${isAcred ? '#86efac' : '#fde047'}`
                                  }}>
                                    {isAcred ? '✅ Acreditado' : '⏳ Pendiente'}
                                  </span>
                                </div>

                                <div>
                                  <div style={{ fontWeight: 900, fontSize: '0.96rem', color: textTitle }}>
                                    {zName}
                                  </div>
                                  <div style={{ fontSize: '0.76rem', color: textSub, marginTop: '2px' }}>
                                    DNI: <strong>{zDni}</strong>
                                  </div>
                                </div>

                                <div style={{ background: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc', padding: '8px 10px', borderRadius: '8px', border: `1px solid ${borderCol}` }}>
                                  <div style={{ fontSize: '0.72rem', color: textSub, fontWeight: 700, marginBottom: '4px' }}>
                                    🏫 Locales de votación a cargo ({zSchools.length}):
                                  </div>
                                  <AssignedSchoolsPillList schools={zSchools} isDark={isDark} borderCol={borderCol} />
                                </div>

                                <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: `1px dashed ${borderCol}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                                  {zCel ? (
                                    <a
                                      href={`https://wa.me/51${String(zCel).replace(/\D/g, '')}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      style={{
                                        background: '#16a34a',
                                        color: '#ffffff',
                                        padding: '5px 10px',
                                        borderRadius: '6px',
                                        fontSize: '0.72rem',
                                        fontWeight: 800,
                                        textDecoration: 'none',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                      }}
                                    >
                                      <Phone className="w-3 h-3" />
                                      <span>{zCel}</span>
                                    </a>
                                  ) : (
                                    <span style={{ fontSize: '0.72rem', color: textSub }}>Sin Celular</span>
                                  )}

                                  <button
                                    onClick={() => setSelectedPersonero(z)}
                                    style={{
                                      padding: '5px 12px',
                                      borderRadius: '6px',
                                      border: `1px solid ${borderCol}`,
                                      background: isDark ? '#1e293b' : '#f8fafc',
                                      color: textTitle,
                                      fontSize: '0.72rem',
                                      fontWeight: 800,
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px'
                                    }}
                                  >
                                    <Edit3 className="w-3 h-3 text-sky-500" />
                                    <span>Ver Ficha</span>
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* VISTA 1: CARDS DE COLEGIOS Y MESAS */}
              {viewMode1 === 'cards' && role1 !== 'Coordinador Distrital' && role1 !== 'Coordinador Zonal' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Centros de Votación */}
                  <div>
                    {/* Barra de Filtros y Ordenamiento Adaptativa de Centros y Mesas */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      marginBottom: '16px',
                      background: isDark ? 'rgba(30, 41, 59, 0.7)' : '#ffffff',
                      padding: isMobile ? '12px 14px' : '14px 18px',
                      borderRadius: '16px',
                      border: `1px solid ${borderCol}`,
                      boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.2)' : '0 2px 12px rgba(0,0,0,0.04)',
                      backdropFilter: 'blur(8px)'
                    }}>
                      {/* Fila 1: Título y Contadores + Selector de Ordenamiento */}
                      <div style={{
                        display: 'flex',
                        flexDirection: isMobile ? 'column' : 'row',
                        alignItems: isMobile ? 'flex-start' : 'center',
                        justifyContent: 'space-between',
                        gap: '10px',
                        borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9'}`,
                        paddingBottom: '10px'
                      }}>
                        {/* Título de Centros */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.86rem', fontWeight: 800, color: textTitle, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <School className="w-4 h-4 text-sky-500" />
                            <span>Centros de Votación</span>
                          </span>
                          <span style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '12px',
                            background: isDark ? 'rgba(14, 165, 233, 0.15)' : '#e0f2fe',
                            color: '#0284c7',
                            border: '1px solid rgba(14, 165, 233, 0.3)'
                          }}>
                            {filteredDistrictSchools.length} {filteredDistrictSchools.length === 1 ? 'mostrado' : `de ${districtSchools.length}`}
                          </span>
                        </div>

                        {/* Selector de Ordenamiento (Limpio, sin duplicados ni redundancias) */}
                        {!isCoordinadorLocal ? (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            width: isMobile ? '100%' : 'auto',
                            justifyContent: isMobile ? 'space-between' : 'flex-end'
                          }}>
                            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: textSub, display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                              <ArrowUpDown className="w-3.5 h-3.5 text-sky-500" />
                              <span>Ordenar:</span>
                            </span>
                            <select
                              value={sortBySchool1}
                              onChange={(e) => setSortBySchool1(e.target.value)}
                              style={{
                                padding: '6px 12px',
                                borderRadius: '10px',
                                border: `1px solid ${borderCol}`,
                                background: isDark ? '#0f172a' : '#f8fafc',
                                color: textTitle,
                                fontSize: '0.74rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                outline: 'none',
                                width: isMobile ? '100%' : 'auto',
                                flex: isMobile ? 1 : 'none',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <option value="zonal_group">🗺️ Por Coordinador Zonal</option>
                              <option value="alfabetico_asc">🔤 Nombre del Centro (A → Z)</option>
                              <option value="cobertura_desc">📈 Mayor Cobertura (%)</option>
                              <option value="cobertura_asc">📉 Menor Cobertura (%)</option>
                              <option value="personeros_desc">👥 Más Personeros Asignados</option>
                              <option value="mesas_desc">🗳️ Más Mesas de Sufragio</option>
                            </select>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              background: isDark ? 'rgba(16, 185, 129, 0.2)' : '#dcfce7',
                              color: '#15803d',
                              border: '1px solid #86efac',
                              padding: '4px 12px',
                              borderRadius: '20px',
                              fontSize: '0.78rem',
                              fontWeight: 800
                            }}>
                              <School className="w-3.5 h-3.5" />
                              <span>{coordinatorLocal} • Mesas y Personeros</span>
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Fila 2: Filtros de Cobertura y Personero de Centro (PCV) */}
                      {!isCoordinadorLocal && (
                        <div style={{
                          display: 'flex',
                          flexDirection: isMobile ? 'column' : 'row',
                          alignItems: isMobile ? 'stretch' : 'center',
                          gap: isMobile ? '8px' : '14px',
                          flexWrap: 'wrap'
                        }}>
                          {/* Grupo Cobertura */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: textSub, marginRight: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              Cobertura:
                            </span>

                            <button
                              type="button"
                              onClick={() => { setAlertFilter1('all'); setCoordLocalFilter1('all'); }}
                              style={{
                                padding: '4px 10px',
                                borderRadius: '20px',
                                border: (alertFilter1 === 'all' && coordLocalFilter1 === 'all') ? '1.5px solid #0284c7' : `1px solid ${borderCol}`,
                                background: (alertFilter1 === 'all' && coordLocalFilter1 === 'all') ? (isDark ? '#0369a1' : '#e0f2fe') : (isDark ? '#1e293b' : '#ffffff'),
                                color: (alertFilter1 === 'all' && coordLocalFilter1 === 'all') ? (isDark ? '#ffffff' : '#0369a1') : textSub,
                                fontSize: '0.72rem',
                                fontWeight: (alertFilter1 === 'all' && coordLocalFilter1 === 'all') ? 800 : 600,
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              Todos ({districtSchools.length})
                            </button>

                            <button
                              type="button"
                              onClick={() => setAlertFilter1(alertFilter1 === 'critico' ? 'all' : 'critico')}
                              title="0% – 30% Cobertura"
                              style={{
                                padding: '4px 10px',
                                borderRadius: '20px',
                                border: alertFilter1 === 'critico' ? '1.5px solid #ef4444' : (countCriticoSchools > 0 ? '1px solid #fca5a5' : `1px solid ${borderCol}`),
                                background: alertFilter1 === 'critico' ? '#ef4444' : (countCriticoSchools > 0 ? (isDark ? 'rgba(239, 68, 68, 0.15)' : '#fef2f2') : 'transparent'),
                                color: alertFilter1 === 'critico' ? '#ffffff' : (countCriticoSchools > 0 ? '#ef4444' : textSub),
                                fontSize: '0.72rem',
                                fontWeight: alertFilter1 === 'critico' ? 800 : 600,
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <span>🔴 Crítico (0-30%)</span>
                              <span style={{
                                background: alertFilter1 === 'critico' ? 'rgba(255,255,255,0.3)' : 'rgba(239,68,68,0.2)',
                                padding: '1px 5px',
                                borderRadius: '10px',
                                fontSize: '0.66rem',
                                fontWeight: 800
                              }}>{countCriticoSchools}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setAlertFilter1(alertFilter1 === 'parcial' ? 'all' : 'parcial')}
                              title="31% – 75% Cobertura"
                              style={{
                                padding: '4px 10px',
                                borderRadius: '20px',
                                border: alertFilter1 === 'parcial' ? '1.5px solid #f59e0b' : (countParcialSchools > 0 ? '1px solid #fcd34d' : `1px solid ${borderCol}`),
                                background: alertFilter1 === 'parcial' ? '#f59e0b' : (countParcialSchools > 0 ? (isDark ? 'rgba(245, 158, 11, 0.15)' : '#fffbeb') : 'transparent'),
                                color: alertFilter1 === 'parcial' ? '#ffffff' : (countParcialSchools > 0 ? '#d97706' : textSub),
                                fontSize: '0.72rem',
                                fontWeight: alertFilter1 === 'parcial' ? 800 : 600,
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <span>🟡 Parcial (31-75%)</span>
                              <span style={{
                                background: alertFilter1 === 'parcial' ? 'rgba(255,255,255,0.3)' : 'rgba(245,158,11,0.2)',
                                padding: '1px 5px',
                                borderRadius: '10px',
                                fontSize: '0.66rem',
                                fontWeight: 800
                              }}>{countParcialSchools}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setAlertFilter1(alertFilter1 === 'optimo' ? 'all' : 'optimo')}
                              title="76% – 100% Cobertura"
                              style={{
                                padding: '4px 10px',
                                borderRadius: '20px',
                                border: alertFilter1 === 'optimo' ? '1.5px solid #10b981' : (countOptimoSchools > 0 ? '1px solid #86efac' : `1px solid ${borderCol}`),
                                background: alertFilter1 === 'optimo' ? '#10b981' : (countOptimoSchools > 0 ? (isDark ? 'rgba(16, 185, 129, 0.15)' : '#ecfdf5') : 'transparent'),
                                color: alertFilter1 === 'optimo' ? '#ffffff' : (countOptimoSchools > 0 ? '#059669' : textSub),
                                fontSize: '0.72rem',
                                fontWeight: alertFilter1 === 'optimo' ? 800 : 600,
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <span>🟢 Óptimo (76-100%)</span>
                              <span style={{
                                background: alertFilter1 === 'optimo' ? 'rgba(255,255,255,0.3)' : 'rgba(16,185,129,0.2)',
                                padding: '1px 5px',
                                borderRadius: '10px',
                                fontSize: '0.66rem',
                                fontWeight: 800
                              }}>{countOptimoSchools}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setAlertFilter1(alertFilter1 === 'excedido' ? 'all' : 'excedido')}
                              title="> 100% Cobertura (Mesas sobrepasadas)"
                              style={{
                                padding: '4px 10px',
                                borderRadius: '20px',
                                border: alertFilter1 === 'excedido' ? '1.5px solid #e11d48' : (countExcedidoSchools > 0 ? '1px solid #fda4af' : `1px solid ${borderCol}`),
                                background: alertFilter1 === 'excedido' ? '#e11d48' : (countExcedidoSchools > 0 ? (isDark ? 'rgba(225, 29, 72, 0.15)' : '#fff1f2') : 'transparent'),
                                color: alertFilter1 === 'excedido' ? '#ffffff' : (countExcedidoSchools > 0 ? '#e11d48' : textSub),
                                fontSize: '0.72rem',
                                fontWeight: alertFilter1 === 'excedido' ? 800 : 600,
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <span>🚨 Excedido (&gt;100%)</span>
                              <span style={{
                                background: alertFilter1 === 'excedido' ? 'rgba(255,255,255,0.3)' : 'rgba(225,29,72,0.2)',
                                padding: '1px 5px',
                                borderRadius: '10px',
                                fontSize: '0.66rem',
                                fontWeight: 800
                              }}>{countExcedidoSchools}</span>
                            </button>
                          </div>

                          {/* Divisor en Desktop */}
                          {!isMobile && <div style={{ height: '20px', width: '1px', background: borderCol }} />}

                          {/* Grupo PCV (Personero de Centro) */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: textSub, marginRight: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              Personero Centro:
                            </span>

                            <button
                              type="button"
                              onClick={() => setCoordLocalFilter1(coordLocalFilter1 === 'con_pcv' ? 'all' : 'con_pcv')}
                              title="Colegios CON Personero de Centro (PCV)"
                              style={{
                                padding: '4px 10px',
                                borderRadius: '20px',
                                border: coordLocalFilter1 === 'con_pcv' ? '1.5px solid #0284c7' : (countConPcvSchools > 0 ? '1px solid #bae6fd' : `1px solid ${borderCol}`),
                                background: coordLocalFilter1 === 'con_pcv' ? '#0284c7' : (countConPcvSchools > 0 ? (isDark ? 'rgba(2, 132, 199, 0.15)' : '#e0f2fe') : 'transparent'),
                                color: coordLocalFilter1 === 'con_pcv' ? '#ffffff' : (countConPcvSchools > 0 ? '#0284c7' : textSub),
                                fontSize: '0.72rem',
                                fontWeight: coordLocalFilter1 === 'con_pcv' ? 800 : 600,
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <span>✅ Con PCV</span>
                              <span style={{
                                background: coordLocalFilter1 === 'con_pcv' ? 'rgba(255,255,255,0.3)' : 'rgba(2,132,199,0.2)',
                                padding: '1px 5px',
                                borderRadius: '10px',
                                fontSize: '0.66rem',
                                fontWeight: 800
                              }}>{countConPcvSchools}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setCoordLocalFilter1(coordLocalFilter1 === 'sin_pcv' ? 'all' : 'sin_pcv')}
                              title="Colegios SIN Personero de Centro (PCV)"
                              style={{
                                padding: '4px 10px',
                                borderRadius: '20px',
                                border: coordLocalFilter1 === 'sin_pcv' ? '1.5px solid #f59e0b' : (countSinPcvSchools > 0 ? '1px solid #fcd34d' : `1px solid ${borderCol}`),
                                background: coordLocalFilter1 === 'sin_pcv' ? '#f59e0b' : (countSinPcvSchools > 0 ? (isDark ? 'rgba(245, 158, 11, 0.15)' : '#fffbeb') : 'transparent'),
                                color: coordLocalFilter1 === 'sin_pcv' ? '#ffffff' : (countSinPcvSchools > 0 ? '#d97706' : textSub),
                                fontSize: '0.72rem',
                                fontWeight: coordLocalFilter1 === 'sin_pcv' ? 800 : 600,
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <span>⚠️ Sin PCV</span>
                              <span style={{
                                background: coordLocalFilter1 === 'sin_pcv' ? 'rgba(255,255,255,0.3)' : 'rgba(245,158,11,0.2)',
                                padding: '1px 5px',
                                borderRadius: '10px',
                                fontSize: '0.66rem',
                                fontWeight: 800
                              }}>{countSinPcvSchools}</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div
                      key={`schools-grid-${dist1}-${role1}-${zoneType1}-${sortBySchool1}`}
                      style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(340px, 1fr))', gap: '14px' }}
                    >
                      {filteredDistrictSchools.length === 0 ? (
                        <div style={{
                          textAlign: 'center',
                          padding: isMobile ? '36px 16px' : '50px 24px',
                          background: bgCard,
                          border: `1.5px dashed ${isDark ? '#334155' : '#cbd5e1'}`,
                          borderRadius: '16px',
                          gridColumn: '1 / -1',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '12px'
                        }}>
                          <div style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '50%',
                            background: isDark ? 'rgba(245, 158, 11, 0.15)' : '#fef3c7',
                            color: '#f59e0b',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.6rem'
                          }}>
                            🔍
                          </div>

                          <div>
                            <div style={{ fontWeight: 900, fontSize: isMobile ? '1rem' : '1.15rem', color: textTitle, marginBottom: '6px' }}>
                              {search1.trim()
                                ? `No se encontraron resultados para "${search1}"`
                                : 'No hay centros de votación que coincidan con los filtros seleccionados'}
                            </div>
                            <p style={{ fontSize: '0.84rem', color: textSub, maxWidth: '520px', margin: '0 auto 14px auto', lineHeight: 1.4 }}>
                              {zoneType1 !== 'all' || isFiltered1
                                ? 'Prueba ajustando el término de búsqueda, seleccionando otra categoría o restableciendo los filtros para ver todos los colegios.'
                                : 'No hay registros cargados actualmente para esta sección.'}
                            </p>

                            {/* Tags de filtros activos que causan 0 resultados */}
                            {(isFiltered1 || zoneType1 !== 'all') && (
                              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '6px', marginBottom: '16px' }}>
                                {search1.trim() && (
                                  <span style={{ background: isDark ? '#1e293b' : '#f1f5f9', border: `1px solid ${borderCol}`, padding: '3px 10px', borderRadius: '12px', fontSize: '0.74rem', color: textTitle }}>
                                    🔍 Búsqueda: <strong>{search1}</strong>
                                  </span>
                                )}
                                {zoneType1 !== 'all' && (
                                  <span style={{ background: isDark ? '#1e293b' : '#f1f5f9', border: `1px solid ${borderCol}`, padding: '3px 10px', borderRadius: '12px', fontSize: '0.74rem', color: textTitle }}>
                                    🗺️ Tipo Zona: <strong>{zoneType1 === 'multi' ? 'Multi-Colegio' : (zoneType1 === 'single' ? 'Colegio Único' : 'Sin Zonal')}</strong>
                                  </span>
                                )}
                                {dist1 !== 'all' && (
                                  <span style={{ background: isDark ? '#1e293b' : '#f1f5f9', border: `1px solid ${borderCol}`, padding: '3px 10px', borderRadius: '12px', fontSize: '0.74rem', color: textTitle }}>
                                    📍 Distrito: <strong>{dist1}</strong>
                                  </span>
                                )}
                                {role1 !== 'all' && (
                                  <span style={{ background: isDark ? '#1e293b' : '#f1f5f9', border: `1px solid ${borderCol}`, padding: '3px 10px', borderRadius: '12px', fontSize: '0.74rem', color: textTitle }}>
                                    🛡️ Rol: <strong>{role1}</strong>
                                  </span>
                                )}
                                {exp1 !== 'all' && (
                                  <span style={{ background: isDark ? '#1e293b' : '#f1f5f9', border: `1px solid ${borderCol}`, padding: '3px 10px', borderRadius: '12px', fontSize: '0.74rem', color: textTitle }}>
                                    ⭐ Exp: <strong>{exp1 === 'si' ? 'Sí' : 'No'}</strong>
                                  </span>
                                )}
                                {mov1 !== 'all' && (
                                  <span style={{ background: isDark ? '#1e293b' : '#f1f5f9', border: `1px solid ${borderCol}`, padding: '3px 10px', borderRadius: '12px', fontSize: '0.74rem', color: textTitle }}>
                                    🚗 Mov: <strong>{mov1 === 'si' ? 'Sí' : 'No'}</strong>
                                  </span>
                                )}
                                {comp1 !== 'all' && (
                                  <span style={{ background: isDark ? '#1e293b' : '#f1f5f9', border: `1px solid ${borderCol}`, padding: '3px 10px', borderRadius: '12px', fontSize: '0.74rem', color: textTitle }}>
                                    📅 Comp: <strong>{comp1 === 'si' ? 'Sí' : 'No'}</strong>
                                  </span>
                                )}
                              </div>
                            )}

                            {(isFiltered1 || zoneType1 !== 'all') && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSearch1('');
                                  setDist1(coordinatorDistrict || 'all');
                                  setRole1('all');
                                  setCoordLocalFilter1('all');
                                  setExp1('all');
                                  setMov1('all');
                                  setComp1('all');
                                  setZoneType1('all');
                                  setSortBySchool1('zonal_group');
                                }}
                                style={{
                                  padding: '9px 20px',
                                  background: '#0284c7',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '10px',
                                  fontWeight: 800,
                                  fontSize: '0.84rem',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  boxShadow: '0 2px 8px rgba(2, 132, 199, 0.3)',
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Restablecer Filtros y Ver Todos</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        filteredDistrictSchools.map((school, sIdx) => {
                          const isExceeded = school.isExceeded;
                          const borderColorLeft = school.statusColor;

                          return (
                            <React.Fragment key={`school-frag-${sIdx}`}>
                              <div
                                className="animate-filter-in"
                                onClick={() => setSelectedSchoolDetail(school)}
                                style={{
                                  background: bgCard,
                                  border: `1px solid ${isExceeded ? '#fda4af' : borderCol}`,
                                  borderLeft: `5px solid ${borderColorLeft}`,
                                  borderRadius: '14px',
                                  padding: '14px 16px',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '10px',
                                  cursor: 'pointer',
                                  boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.2)' : '0 1px 6px rgba(0,0,0,0.04)',
                                  animationDelay: `${Math.min(sIdx * 20, 250)}ms`,
                                  transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.transform = 'translateY(-2px)';
                                  e.currentTarget.style.boxShadow = isDark ? '0 8px 24px rgba(0,0,0,0.35)' : '0 6px 16px rgba(0,0,0,0.08)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.transform = 'translateY(0)';
                                  e.currentTarget.style.boxShadow = isDark ? '0 4px 12px rgba(0,0,0,0.2)' : '0 1px 6px rgba(0,0,0,0.04)';
                                }}
                              >
                                {/* Tags superiores: Distrito + Indicador de Alerta de Cobertura + Indicador de PCV */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', flexWrap: 'wrap' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                    <span style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      background: isDark ? 'rgba(2, 132, 199, 0.2)' : '#e0f2fe',
                                      color: '#0284c7',
                                      padding: '2px 8px',
                                      borderRadius: '6px',
                                      fontSize: '0.71rem',
                                      fontWeight: 800
                                    }}>
                                      📍 {school.distrito}
                                    </span>

                                    {/* Badge Alerta de Cobertura: 0-30% Crítico, 31-75% Parcial, 76-100% Óptimo, >100% Excedido */}
                                    <span style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      background: isDark ? school.statusBg : (school.cobertura >= 76 && !school.isExceeded ? '#dcfce7' : (school.cobertura >= 31 && !school.isExceeded ? '#fef3c7' : (school.isExceeded ? '#ffe4e6' : '#fee2e2'))),
                                      color: school.statusColor,
                                      border: `1px solid ${school.statusBorder}`,
                                      padding: '2px 8px',
                                      borderRadius: '6px',
                                      fontSize: '0.71rem',
                                      fontWeight: 900
                                    }}>
                                      {school.statusBadgeText}
                                    </span>
                                  </div>

                                  {isCoordinadorLocal ? (
                                    <span style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      background: isDark ? 'rgba(16, 185, 129, 0.15)' : '#dcfce7',
                                      color: '#15803d',
                                      border: '1px solid #86efac',
                                      padding: '2px 8px',
                                      borderRadius: '6px',
                                      fontSize: '0.71rem',
                                      fontWeight: 900
                                    }}>
                                      🏫 Tu Centro Asignado
                                    </span>
                                  ) : school.plvPersonero ? (
                                    <span style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      background: isDark ? 'rgba(2, 132, 199, 0.15)' : '#e0f2fe',
                                      color: '#0284c7',
                                      border: '1px solid #bae6fd',
                                      padding: '2px 8px',
                                      borderRadius: '6px',
                                      fontSize: '0.71rem',
                                      fontWeight: 900
                                    }}>
                                      ✅ Con Personero de Centro
                                    </span>
                                  ) : (
                                    <span style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      background: isDark ? 'rgba(245, 158, 11, 0.15)' : '#fef3c7',
                                      color: '#b45309',
                                      border: '1px solid #fde68a',
                                      padding: '2px 8px',
                                      borderRadius: '6px',
                                      fontSize: '0.71rem',
                                      fontWeight: 900
                                    }}>
                                      ⚠️ Sin Personero de Centro
                                    </span>
                                  )}
                                </div>

                                {/* Cabecera del Card: Nombre del Centro de Votación */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', minWidth: 0 }}>
                                    <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>🏫</span>
                                    <strong style={{ fontSize: '0.94rem', fontWeight: 900, color: textTitle, lineHeight: 1.25 }}>
                                      {school.nombre}
                                    </strong>
                                  </div>
                                </div>

                                {/* Dirección */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.73rem', color: textSub }}>
                                  <span>📍</span>
                                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {school.direccion || findOfficialLocal(school.nombre, school.distrito)?.direccion || 'DIRECCIÓN NO REGISTRADA'}
                                  </span>
                                </div>

                                {/* Mando del Centro de Votación: Personero de Centro (PCV) + Cobertura de Mesas */}
                                <div style={{
                                  background: isDark ? 'rgba(255,255,255,0.03)' : '#f1f5f9',
                                  borderRadius: '8px',
                                  padding: '8px 10px',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '6px',
                                  border: `1px solid ${isExceeded ? '#fda4af' : borderCol}`
                                }}>
                                  {isCoordinadorLocal ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '0.74rem' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                                        <span style={{ color: textSub, fontWeight: 700 }}>Personero de Centro (Tú):</span>
                                        <strong style={{ color: '#0284c7' }}>{user?.nombresApellidos || user?.['Nombres y Apellidos'] || 'Asignado'}</strong>
                                      </div>
                                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                                        <span style={{ color: textSub, fontWeight: 700 }}>Cobertura de Mesas:</span>
                                        <strong style={{
                                          color: isExceeded ? '#e11d48' : school.statusColor,
                                          fontWeight: 900
                                        }}>
                                          {isExceeded
                                            ? `🚨 ${school.asignadas} de ${school.totalMesas || 1} mesas (Sobrepasó por +${school.asignadas - (school.totalMesas || 1)})`
                                            : `${school.asignadas} de ${school.totalMesas || 1} mesas (${school.cobertura}%) • ${school.statusLabel}`}
                                        </strong>
                                      </div>
                                    </div>
                                  ) : (
                                    <>
                                      {/* 1. Personero de Centro de Votación (PCV) */}
                                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', fontSize: '0.74rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden', minWidth: 0 }}>
                                          <span style={{
                                            background: school.plvPersonero ? '#e0f2fe' : (isDark ? 'rgba(245, 158, 11, 0.15)' : '#fef3c7'),
                                            color: school.plvPersonero ? '#0369a1' : '#b45309',
                                            border: school.plvPersonero ? '1px solid #bae6fd' : '1px solid #fde68a',
                                            padding: '2px 6px',
                                            borderRadius: '4px',
                                            fontWeight: 800,
                                            fontSize: '0.66rem',
                                            flexShrink: 0
                                          }}>
                                            🏫 PCV
                                          </span>
                                          <span style={{ fontWeight: 700, color: school.plvPersonero ? textTitle : '#b45309', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {school.plvPersonero ? (school.plvPersonero['Nombres y Apellidos'] || school.plvPersonero.nombresApellidos) : '⚠️ Sin Personero de Centro'}
                                          </span>
                                        </div>
                                        {school.plvPersonero && (school.plvPersonero['Celular'] || school.plvPersonero.celular) && (
                                          <a
                                            href={`https://wa.me/51${String(school.plvPersonero['Celular'] || school.plvPersonero.celular).replace(/\D/g, '')}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            style={{
                                              color: '#16a34a',
                                              fontWeight: 800,
                                              fontSize: '0.7rem',
                                              flexShrink: 0,
                                              textDecoration: 'none',
                                              display: 'inline-flex',
                                              alignItems: 'center',
                                              gap: '2px',
                                              background: isDark ? 'rgba(22, 163, 74, 0.15)' : '#dcfce7',
                                              padding: '1px 5px',
                                              borderRadius: '4px'
                                            }}
                                          >
                                            <Phone className="w-2.5 h-2.5" />
                                            <span>{school.plvPersonero['Celular'] || school.plvPersonero.celular}</span>
                                          </a>
                                        )}
                                      </div>

                                      {/* 2. Cobertura de Mesas y Personeros */}
                                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', fontSize: '0.72rem' }}>
                                        <span style={{ color: textSub, fontWeight: 700 }}>Cobertura de Mesas:</span>
                                        <strong style={{
                                          color: isExceeded ? '#e11d48' : school.statusColor,
                                          fontWeight: 900
                                        }}>
                                          {isExceeded
                                            ? `🚨 ${school.asignadas} de ${school.totalMesas || 1} mesas (Sobrepasó por +${school.asignadas - (school.totalMesas || 1)})`
                                            : `${school.asignadas} de ${school.totalMesas || 1} mesas (${school.cobertura}%) • ${school.statusLabel}`}
                                        </strong>
                                      </div>
                                    </>
                                  )}
                                </div>

                              </div>
                            </React.Fragment>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* VISTA 2: PADRÓN DETALLADO (TABLA COMPLETA) */}
              {viewMode1 === 'tabla' && (
                <div style={{ background: bgCard, border: `1px solid ${borderCol}`, borderRadius: '12px', overflow: 'hidden' }}>
                  <div style={{ padding: '16px 20px', borderBottom: `1px solid ${borderCol}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', fontWeight: 900, color: textTitle }}>
                      <LayoutGrid className="w-4 h-4 text-amber-500" />
                      <span>
                        {isCoordinadorLocal && coordinatorLocal
                          ? `Padrón de Personeros de Mesa • Colegio ${coordinatorLocal}`
                          : ((isCoordinadorDistrital || isCoordinador) && coordinatorDistrict
                            ? `Padrón Electoral de ${coordinatorDistrict} (Personeros de Local y Mesa)`
                            : 'Padrón Electoral de Personeros')}
                      </span>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: textSub, marginLeft: '8px' }}>
                        ({filteredRecords1.length} {filteredRecords1.length === 1 ? 'resultado' : 'resultados'})
                      </span>
                    </div>
                  </div>

                  {/* ---- VISTA TABLA (escritorio) / TARJETAS (móvil) CON ANIMACIÓN FLUIDA ---- */}
                  {filteredRecords1.length > 0 ? (
                    isMobile ? (
                      /* TARJETAS EN MÓVIL */
                      <div
                        key={`cards-mobile-${dist1}-${role1}`}
                        style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}
                      >
                        {filteredRecords1.map((r, idx) => {
                          const dni = r['D.N.I.'] || r['DNI'] || r.dni || '—';
                          const cel = r['Celular'] || r.celular || '—';
                          const rol = r['Rol a Desempeñar'] || r.rolADesempenar || 'Personero de Mesa';
                          const isPersonero = rol === 'Personero de Mesa';
                          const mesaAsig = r['Mesa Asignada'] || r.mesaAsignada || '';
                          const hasMesa = mesaAsig && mesaAsig.trim() !== '' && mesaAsig !== '-' && mesaAsig.toLowerCase() !== 'no aplica';
                          const local = r['Local de Votación Asignado'] || r.localDeVotacionAsignado || r['Local de Votación'] || r.localDeVotacion || '—';
                          const distrito = r['Distrito Asignado'] || r.distritoAsignado || r['Distrito donde Vota'] || r.distritoDondeVota || '—';
                          const exp = getExp(r);
                          const mov = getMov(r);
                          const comp = getComp(r);

                          // Fecha y Hora de Registro
                          const rawDate = r['Marca temporal'] || r['Fecha de Registro'] || r.fecha_de_registro || r.fechaRegistro;
                          let formattedDate = '—';
                          let formattedTime = '';
                          if (rawDate) {
                            const d = new Date(rawDate);
                            if (!isNaN(d.getTime())) {
                              formattedDate = d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
                              formattedTime = d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: true });
                            }
                          }

                          // Jerarquía Visual: Colores e Íconos
                          let hierarchyBadge = { label: rol, icon: '🛡️', bg: '#dcfce7', color: '#15803d', border: '#bbf7d0' };
                          const rolLower = rol.toLowerCase();
                          if (rolLower.includes('distrital') || rolLower.includes('distrito')) {
                            hierarchyBadge = { label: 'Coordinador Distrital', icon: '🏛️', bg: '#dbeafe', color: '#1e40af', border: '#bfdbfe' };
                          } else if (rolLower.includes('zonal') || rolLower.includes('zona')) {
                            hierarchyBadge = { label: 'Coordinador Zonal', icon: '🗺️', bg: '#ede9fe', color: '#7c3aed', border: '#ddd6fe' };
                          } else if (rolLower.includes('local') || rolLower.includes('plv') || rolLower.includes('pcv') || rolLower.includes('centro')) {
                            hierarchyBadge = { label: 'Personero de Centro de Votación', icon: '🏫', bg: '#e0f2fe', color: '#0369a1', border: '#bae6fd' };
                          }

                          return (
                            <div
                              key={idx}
                              className="animate-filter-in"
                              style={{
                                background: isDark ? '#1e293b' : '#ffffff',
                                border: `1px solid ${borderCol}`,
                                borderLeft: `4px solid ${hierarchyBadge.color}`,
                                borderRadius: '10px',
                                padding: '12px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '6px',
                                animationDelay: `${Math.min(idx * 20, 260)}ms`,
                                transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                              }}
                            >
                              {/* Fila 1: Nombre + DNI + #ID */}
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                  <div style={{ fontWeight: 800, fontSize: '0.88rem', color: textTitle }}>
                                    {r['Nombres y Apellidos'] || r.nombresApellidos || '—'}
                                  </div>
                                  <div style={{ fontSize: '0.72rem', color: textSub }}>DNI: <strong>{dni}</strong></div>
                                </div>
                                <span style={{ background: isDark ? 'rgba(2,132,199,0.2)' : '#e0f2fe', color: '#0284c7', padding: '3px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0 }}>
                                  #{idx + 1}
                                </span>
                              </div>

                              {/* Fila 2: Jerarquía / Rol + Fecha y Hora */}
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                                <span style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  background: isDark ? 'rgba(2, 132, 199, 0.15)' : hierarchyBadge.bg,
                                  color: hierarchyBadge.color,
                                  padding: '3px 8px',
                                  borderRadius: '6px',
                                  fontSize: '0.7rem',
                                  fontWeight: 800,
                                  border: `1px solid ${isDark ? 'rgba(2,132,199,0.3)' : hierarchyBadge.border}`
                                }}>
                                  <span>{hierarchyBadge.icon}</span>
                                  <span>{hierarchyBadge.label}</span>
                                </span>

                                <span style={{ fontSize: '0.68rem', color: textSub, fontWeight: 700 }}>
                                  📅 {formattedDate} {formattedTime}
                                </span>
                              </div>

                              {/* Fila 3: Distrito / Local / Mesa */}
                              <div style={{ background: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc', borderRadius: '8px', padding: '8px 10px', fontSize: '0.75rem' }}>
                                <div style={{ display: 'flex', gap: '6px', marginBottom: '2px' }}>
                                  <span style={{ color: textSub, fontWeight: 600 }}>📍 Distrito:</span>
                                  <span style={{ fontWeight: 800, color: '#0284c7' }}>{distrito}</span>
                                </div>
                                <div style={{ display: 'flex', gap: '6px', marginBottom: isPersonero ? '2px' : '0px' }}>
                                  <span style={{ color: textSub, fontWeight: 600 }}>🏫 Local:</span>
                                  <span style={{ fontWeight: 700, color: textBody }}>{local}</span>
                                </div>
                                {isPersonero && (
                                  <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
                                    <span style={{ color: textSub, fontWeight: 600 }}>🗳️ Mesa:</span>
                                    <span style={{
                                      fontSize: '0.7rem',
                                      fontWeight: 800,
                                      padding: '2px 6px',
                                      borderRadius: '4px',
                                      background: hasMesa ? '#dcfce7' : (isDark ? '#0f172a' : '#f0f9ff'),
                                      color: hasMesa ? '#15803d' : '#0284c7',
                                      border: `1px solid ${hasMesa ? '#86efac' : '#bae6fd'}`
                                    }}>
                                      {hasMesa ? `Mesa ${mesaAsig}` : 'En Padrón (Asignado al Local)'}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Fila 4: Celular + Logística */}
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 700 }}>📱 {cel}</div>
                                <div style={{ display: 'flex', gap: '6px', fontSize: '0.7rem', fontWeight: 800 }}>
                                  <span style={{ color: exp === 'Sí' ? '#16a34a' : '#94a3b8' }}>Exp:{exp}</span>
                                  <span style={{ color: mov === 'Sí' ? '#16a34a' : '#94a3b8' }}>Mov:{mov}</span>
                                  <span style={{ color: comp === 'Sí' ? '#16a34a' : '#ef4444' }}>Comp:{comp}</span>
                                </div>
                              </div>

                              {/* Acción */}
                              <button
                                onClick={() => setSelectedPersonero(r)}
                                style={{
                                  width: '100%',
                                  padding: '8px',
                                  borderRadius: '8px',
                                  border: '1.5px solid #0284c7',
                                  background: isDark ? 'rgba(2,132,199,0.15)' : '#e0f2fe',
                                  color: '#0284c7',
                                  fontWeight: 800,
                                  fontSize: '0.8rem',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '6px'
                                }}
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Modificar Datos</span>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      /* TABLA EN ESCRITORIO */
                      <div
                        key={`table-wrap-${dist1}-${role1}-${exp1}-${mov1}-${comp1}`}
                        style={{ overflowX: 'auto' }}
                      >
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                          <thead>
                            <tr style={{ background: tableHeadBg, borderBottom: `1px solid ${borderCol}`, color: textSub, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              <th style={{ padding: '12px 14px' }}>ID</th>
                              <th style={{ padding: '12px 14px' }}>FECHA Y HORA REGISTRO</th>
                              <th style={{ padding: '12px 14px' }}>INTEGRANTE / DNI / CORREO</th>
                              <th style={{ padding: '12px 14px' }}>JERARQUÍA / ROL</th>
                              <th style={{ padding: '12px 14px' }}>ASIGNACIÓN ELECTORAL</th>
                              <th style={{ padding: '12px 14px' }}>VOTACIÓN (DNI)</th>
                              <th style={{ padding: '12px 14px' }}>CONTACTO & CELULAR</th>
                              <th style={{ padding: '12px 14px' }}>LOGÍSTICA</th>
                              <th style={{ padding: '12px 14px', textAlign: 'center' }}>ACCIONES</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredRecords1.map((r, idx) => {
                              const dni = r['D.N.I.'] || r['DNI'] || r.dni || '—';
                              const cel = r['Celular'] || r.celular || '—';
                              const rol = r['Rol a Desempeñar'] || r.rolADesempenar || 'Personero de Mesa';
                              const isPersonero = rol === 'Personero de Mesa';
                              const mesaAsig = r['Mesa Asignada'] || r.mesaAsignada || '';
                              const hasMesa = mesaAsig && mesaAsig.trim() !== '' && mesaAsig !== '-' && mesaAsig.toLowerCase() !== 'no aplica';
                              const exp = getExp(r);
                              const mov = getMov(r);
                              const comp = getComp(r);

                              // Fecha y Hora de Registro
                              const rawDate = r['Marca temporal'] || r['Fecha de Registro'] || r.fecha_de_registro || r.fechaRegistro;
                              let formattedDate = '—';
                              let formattedTime = '';
                              if (rawDate) {
                                const d = new Date(rawDate);
                                if (!isNaN(d.getTime())) {
                                  formattedDate = d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
                                  formattedTime = d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: true });
                                }
                              }

                              // Jerarquía Visual: Colores e Íconos
                              let hierarchyBadge = { label: rol, icon: '🛡️', bg: '#dcfce7', color: '#15803d', border: '#bbf7d0' };
                              const rolLower = rol.toLowerCase();
                              if (rolLower.includes('distrital') || rolLower.includes('distrito')) {
                                hierarchyBadge = { label: 'Coordinador Distrital', icon: '🏛️', bg: '#dbeafe', color: '#1e40af', border: '#bfdbfe' };
                              } else if (rolLower.includes('zonal') || rolLower.includes('zona')) {
                                hierarchyBadge = { label: 'Coordinador Zonal', icon: '🗺️', bg: '#ede9fe', color: '#7c3aed', border: '#ddd6fe' };
                              } else if (rolLower.includes('local') || rolLower.includes('centro') || rolLower.includes('plv') || rolLower.includes('pcv')) {
                                hierarchyBadge = { label: 'Personero de Centro de Votación', icon: '🏫', bg: '#e0f2fe', color: '#0369a1', border: '#bae6fd' };
                              }

                              return (
                                <tr
                                  key={idx}
                                  className="animate-filter-in"
                                  style={{
                                    borderBottom: `1px solid ${tableRowBorder}`,
                                    animationDelay: `${Math.min(idx * 15, 200)}ms`
                                  }}
                                >
                                  <td style={{ padding: '12px 14px', color: textSub, fontWeight: 700 }}>#{idx + 1}</td>
                                  <td style={{ padding: '12px 14px', fontSize: '0.74rem' }}>
                                    <div style={{ fontWeight: 800, color: textTitle }}>📅 {formattedDate}</div>
                                    {formattedTime && <div style={{ fontSize: '0.68rem', color: '#0284c7', fontWeight: 700 }}>⏰ {formattedTime}</div>}
                                  </td>
                                  <td style={{ padding: '12px 14px' }}>
                                    <div style={{ fontWeight: 800, color: textTitle }}>{r['Nombres y Apellidos'] || r.nombresApellidos || '—'}</div>
                                    <div style={{ fontSize: '0.72rem', color: textSub }}>DNI: <strong>{dni}</strong></div>
                                    <div style={{ fontSize: '0.7rem', color: textSub }}>{r['Correo Electrónico'] || r.correoElectronico || ''}</div>
                                  </td>
                                  <td style={{ padding: '12px 14px' }}>
                                    <span style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      background: isDark ? 'rgba(2, 132, 199, 0.15)' : hierarchyBadge.bg,
                                      color: hierarchyBadge.color,
                                      padding: '4px 10px',
                                      borderRadius: '6px',
                                      fontSize: '0.74rem',
                                      fontWeight: 800,
                                      border: `1px solid ${isDark ? 'rgba(2,132,199,0.3)' : hierarchyBadge.border}`
                                    }}>
                                      <span>{hierarchyBadge.icon}</span>
                                      <span>{hierarchyBadge.label}</span>
                                    </span>
                                  </td>
                                  <td style={{ padding: '12px 14px', fontSize: '0.75rem', minWidth: '180px' }}>
                                    <div style={{ fontWeight: 700, color: '#0284c7', marginBottom: '3px' }}>📍 {r['Distrito Asignado'] || '-'}</div>
                                    <AssignedSchoolsPillList schools={r['Local de Votación Asignado']} isDark={isDark} borderCol={tableRowBorder} />
                                    {isPersonero && (
                                      <div style={{ marginTop: '4px' }}>
                                        <span style={{
                                          fontSize: '0.68rem',
                                          fontWeight: 800,
                                          padding: '2px 6px',
                                          borderRadius: '4px',
                                          background: hasMesa ? '#dcfce7' : (isDark ? '#0f172a' : '#f0f9ff'),
                                          color: hasMesa ? '#15803d' : '#0284c7',
                                          border: `1px solid ${hasMesa ? '#86efac' : '#bae6fd'}`
                                        }}>
                                          {hasMesa ? `Mesa ${mesaAsig}` : '🗳️ En Padrón (Asignado al Local)'}
                                        </span>
                                      </div>
                                    )}
                                  </td>
                                  <td style={{ padding: '12px 14px', fontSize: '0.75rem' }}>
                                    <div style={{ color: textBody }}>{r['Distrito donde Vota'] || '-'}</div>
                                    <div style={{ color: textSub }}>Local: {r['Local de Votación'] || '-'}</div>
                                  </td>
                                  <td style={{ padding: '12px 14px' }}>
                                    <div style={{ fontWeight: 700, color: textTitle }}>{cel}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#16a34a', fontSize: '0.75rem', fontWeight: 700 }}>
                                      <span>📱 {cel}</span>
                                    </div>
                                  </td>
                                  <td style={{ padding: '12px 14px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '0.72rem', fontWeight: 800 }}>
                                      <span style={{ color: exp === 'Sí' ? '#16a34a' : '#94a3b8' }}>Exp: <strong>{exp}</strong></span>
                                      <span style={{ color: mov === 'Sí' ? '#16a34a' : '#94a3b8' }}>Mov: <strong>{mov}</strong></span>
                                      <span style={{ color: comp === 'Sí' ? '#16a34a' : '#ef4444' }}>Comp: <strong>{comp}</strong></span>
                                    </div>
                                  </td>
                                  <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                                    <button
                                      onClick={() => setSelectedPersonero(r)}
                                      title="Modificar datos o asignar número de mesa"
                                      style={{
                                        padding: '6px 12px',
                                        borderRadius: '6px',
                                        border: '1px solid #0284c7',
                                        background: isDark ? 'rgba(2, 132, 199, 0.15)' : '#e0f2fe',
                                        color: '#0284c7',
                                        fontWeight: 700,
                                        fontSize: '0.75rem',
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                      }}
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                      <span>Modificar</span>
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )
                  ) : (
                    <div style={{
                      padding: isMobile ? '36px 16px' : '50px 24px',
                      textAlign: 'center',
                      background: bgCard,
                      border: `1.5px dashed ${isDark ? '#334155' : '#cbd5e1'}`,
                      borderRadius: '16px',
                      margin: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '12px'
                    }}>
                      <div style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        background: isDark ? 'rgba(245, 158, 11, 0.15)' : '#fef3c7',
                        color: '#f59e0b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.6rem'
                      }}>
                        🔍
                      </div>

                      <div>
                        <div style={{ fontWeight: 900, fontSize: isMobile ? '1rem' : '1.15rem', color: textTitle, marginBottom: '6px' }}>
                          {search1.trim()
                            ? `No se encontraron personeros para "${search1}"`
                            : 'No hay personeros registrados que coincidan con estos filtros'}
                        </div>
                        <p style={{ fontSize: '0.84rem', color: textSub, maxWidth: '520px', margin: '0 auto 14px auto', lineHeight: 1.4 }}>
                          Pruebe cambiando los filtros de rol, experiencia o movilidad, o restablezca la búsqueda para visualizar todos los personeros.
                        </p>

                        {(isFiltered1 || zoneType1 !== 'all') && (
                          <button
                            type="button"
                            onClick={() => {
                              setSearch1('');
                              setDist1(coordinatorDistrict || 'all');
                              setRole1('all');
                              setExp1('all');
                              setMov1('all');
                              setComp1('all');
                              setZoneType1('all');
                              setSortBySchool1('zonal_group');
                            }}
                            style={{
                              padding: '9px 20px',
                              background: '#0284c7',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '10px',
                              fontWeight: 800,
                              fontSize: '0.84rem',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              boxShadow: '0 2px 8px rgba(2, 132, 199, 0.3)',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Restablecer Filtros y Ver Todos</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}


            </div>
          )}

          {/* =========================================================================
              TAB 2: PROGRESO DE CAPACITACIONES
              ========================================================================= */}
          {activeTab === 'capacitacion' && (
            <div>
              {/* Banner Top con Botón Exportar Excel */}
              <div style={{ background: bgCard, border: `1px solid ${borderCol}`, borderRadius: '12px', padding: '16px 20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', fontWeight: 900, color: textTitle }}>
                    <GraduationCap className="w-5 h-5 text-sky-500" />
                    <span>Progreso de las Capacitaciones en Gráficas</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: textSub, marginTop: '2px' }}>
                    Estadísticas y visualización gráfica del avance en videos formativos, manuales PDF y habilitación de credenciales
                  </div>
                </div>

                <button
                  onClick={() => handleDownloadExcel(dist2)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '9px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#10b981',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    textDecoration: 'none',
                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.35)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.25)';
                  }}
                  title={isCoordinadorLocal ? `Exportar Padrón de ${coordinatorLocal}` : (isCoordinadorZonal ? `Exportar Padrón de Zona ${assignedVmtZone || ''}` : 'Exportar Padrón Oficial')}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Exportar Excel {isCoordinadorLocal ? '(Mi Colegio)' : (isCoordinadorZonal && assignedVmtZone ? `(${assignedVmtZone.replace('ZONA ', '')})` : '')}</span>
                </button>
              </div>

              {/* Barra de Filtros Tab 2 */}
              <div style={{ background: bgCard, border: `1px solid ${borderCol}`, borderRadius: '12px', padding: '14px 18px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
                  <div style={{ position: 'relative', flex: '1 1 200px' }}>
                    <Search className="w-4 h-4 text-sky-500" style={{ position: 'absolute', left: '12px', top: '10px' }} />
                    <input
                      type="text"
                      placeholder="Buscar personero por Nombre, DNI, Local..."
                      value={search2}
                      onChange={(e) => setSearch2(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px 8px 34px', borderRadius: '8px', border: `1px solid ${borderCol}`, background: bgInput, color: textTitle, fontSize: '0.82rem', outline: 'none' }}
                    />
                  </div>

                  <select
                    value={status2}
                    onChange={(e) => setStatus2(e.target.value)}
                    style={{ padding: '8px 12px', borderRadius: '8px', border: status2 !== 'all' ? '1.5px solid #0284c7' : `1px solid ${borderCol}`, fontSize: '0.82rem', background: status2 !== 'all' ? (isDark ? '#1e293b' : '#f0f9ff') : bgInput, color: textTitle, fontWeight: status2 !== 'all' ? 700 : 500 }}
                  >
                    <option value="all">Todos los Estados</option>
                    <option value="confirmado">Confirmado</option>
                    <option value="bloqueado">Bloqueado</option>
                  </select>

                  {coordinatorDistrict ? (
                    <div
                      title="Distrito asignado permanentemente a tu cuenta de coordinador"
                      style={{
                        padding: '8px 14px',
                        borderRadius: '8px',
                        border: '1.5px solid #0284c7',
                        fontSize: '0.82rem',
                        background: isDark ? 'rgba(2, 132, 199, 0.15)' : '#e0f2fe',
                        color: '#0284c7',
                        fontWeight: 800,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        userSelect: 'none'
                      }}
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Distrito: {coordinatorDistrict}</span>
                    </div>
                  ) : (
                    <select
                      value={dist2}
                      onChange={(e) => setDist2(e.target.value)}
                      style={{ padding: '8px 12px', borderRadius: '8px', border: dist2 !== 'all' ? '1.5px solid #0284c7' : `1px solid ${borderCol}`, fontSize: '0.82rem', background: dist2 !== 'all' ? (isDark ? '#1e293b' : '#f0f9ff') : bgInput, color: textTitle, fontWeight: dist2 !== 'all' ? 700 : 500 }}
                    >
                      <option value="all">📍 Todos los Distritos</option>
                      {DISTRITOS_LIMA.map((d, i) => (
                        <option key={i} value={d}>{d}</option>
                      ))}
                    </select>
                  )}

                  {/* Filtro Local para Coordinador de Local en Tab 2 */}
                  {isCoordinadorLocal && coordinatorLocal && (
                    <div style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid #10b981',
                      fontSize: '0.82rem',
                      background: isDark ? 'rgba(16, 185, 129, 0.15)' : '#ecfdf5',
                      color: isDark ? '#34d399' : '#047857',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <School className="w-3.5 h-3.5" />
                      <span>{coordinatorLocal}</span>
                    </div>
                  )}

                  <select
                    value={role2}
                    onChange={(e) => setRole2(e.target.value)}
                    style={{ padding: '8px 12px', borderRadius: '8px', border: role2 !== 'all' ? '1.5px solid #0284c7' : `1px solid ${borderCol}`, fontSize: '0.82rem', background: role2 !== 'all' ? (isDark ? '#1e293b' : '#f0f9ff') : bgInput, color: textTitle, fontWeight: role2 !== 'all' ? 700 : 500 }}
                  >
                    <option value="all">🛡️ Todos los Roles</option>
                    <option value="Personero de Mesa">Personero de Mesa</option>
                    {!isCoordinadorLocal && <option value="Personero de Local de Votación">Personero de Centro de Votación (PCV)</option>}
                    {(isSuperAdmin || normalizeDistrictName(coordinatorDistrict || dist2) === 'VILLA MARIA DEL TRIUNFO') && <option value="Coordinador Zonal">Coordinador Zonal (VMT)</option>}
                    {isSuperAdmin && <option value="Coordinador Distrital">Coordinador Distrital</option>}
                  </select>

                  {isFiltered2 && (
                    <button
                      onClick={() => { setSearch2(''); setStatus2('all'); setDist2(coordinatorDistrict || 'all'); setRole2('all'); }}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '8px',
                        border: '1px solid #f87171',
                        background: isDark ? 'rgba(239, 68, 68, 0.15)' : '#fef2f2',
                        color: '#ef4444',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Limpiar Todo</span>
                    </button>
                  )}
                </div>

                {/* Resumen del Filtro Activo Tab 2 */}
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: textSub, borderTop: `1px solid ${borderCol}`, paddingTop: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: isDark ? 'rgba(2, 132, 199, 0.2)' : '#e0f2fe',
                      color: '#0284c7',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      fontWeight: 800
                    }}>
                      <Filter className="w-3.5 h-3.5" />
                      <span>{filteredRecords2.length} {filteredRecords2.length === 1 ? 'personero encontrado' : 'personeros encontrados'}</span>
                    </div>

                    {dist2 !== 'all' && (
                      <span style={{ background: isDark ? '#1e293b' : '#f1f5f9', padding: '3px 8px', borderRadius: '6px', border: `1px solid ${borderCol}` }}>
                        📍 {dist2} <strong style={{ color: '#ef4444', cursor: 'pointer', marginLeft: '4px' }} onClick={() => setDist2('all')}>×</strong>
                      </span>
                    )}

                    {status2 !== 'all' && (
                      <span style={{ background: isDark ? '#1e293b' : '#f1f5f9', padding: '3px 8px', borderRadius: '6px', border: `1px solid ${borderCol}` }}>
                        ⚡ Estado: {status2} <strong style={{ color: '#ef4444', cursor: 'pointer', marginLeft: '4px' }} onClick={() => setStatus2('all')}>×</strong>
                      </span>
                    )}

                    {role2 !== 'all' && (
                      <span style={{ background: isDark ? '#1e293b' : '#f1f5f9', padding: '3px 8px', borderRadius: '6px', border: `1px solid ${borderCol}` }}>
                        🛡️ {role2} <strong style={{ color: '#ef4444', cursor: 'pointer', marginLeft: '4px' }} onClick={() => setRole2('all')}>×</strong>
                      </span>
                    )}
                  </div>

                  <span style={{ fontSize: '0.74rem' }}>
                    Total capacitaciones: <strong>{records.length}</strong>
                  </span>
                </div>
              </div>

              {/* 4 KPIs de Capacitación Sincronizados */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '20px' }}>
                
                <div style={{ background: bgCard, border: `1px solid ${borderCol}`, borderLeft: '4px solid #10b981', borderRadius: '10px', padding: '16px' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: textSub }}>CREDENCIALES CONFIRMADAS</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '6px 0' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: isDark ? 'rgba(16, 185, 129, 0.2)' : '#dcfce7', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckCircle2 className="w-5 h-5" /></div>
                    <span style={{ fontSize: '1.6rem', fontWeight: 900, color: textTitle }}>{tab2Confirmados}</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: textSub }}>Capacitación Completa</div>
                </div>

                <div style={{ background: bgCard, border: `1px solid ${borderCol}`, borderLeft: '4px solid #f59e0b', borderRadius: '10px', padding: '16px' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: textSub }}>CREDENCIALES PENDIENTES</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '6px 0' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: isDark ? 'rgba(245, 158, 11, 0.2)' : '#fef3c7', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Lock className="w-5 h-5" /></div>
                    <span style={{ fontSize: '1.6rem', fontWeight: 900, color: textTitle }}>{tab2Pendientes}</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: textSub }}>Pendiente de completar</div>
                </div>

                <div style={{ background: bgCard, border: `1px solid ${borderCol}`, borderLeft: '4px solid #0284c7', borderRadius: '10px', padding: '16px' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: textSub }}>VIDEOS COMPLETADOS</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '6px 0' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: isDark ? 'rgba(2, 132, 199, 0.2)' : '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Video className="w-5 h-5" /></div>
                    <span style={{ fontSize: '1.6rem', fontWeight: 900, color: textTitle }}>{tab2Videos}</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: textSub }}>Módulos de Video (2/2)</div>
                </div>

                <div style={{ background: bgCard, border: `1px solid ${borderCol}`, borderLeft: '4px solid #8b5cf6', borderRadius: '10px', padding: '16px' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: textSub }}>MANUALES PDF LEÍDOS</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '6px 0' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: isDark ? 'rgba(139, 92, 246, 0.2)' : '#ede9fe', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FileText className="w-5 h-5" /></div>
                    <span style={{ fontSize: '1.6rem', fontWeight: 900, color: textTitle }}>{tab2Pdfs}</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: textSub }}>Guía de Procedimientos (2/2)</div>
                </div>

              </div>

              {/* 2 GRÁFICOS RESPONSIVOS DE CAPACITACIÓN */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '16px',
                marginBottom: '20px'
              }}>
                {/* Gráfico 1: Estado de Credenciales (Doughnut) */}
                <div style={{
                  background: bgCard,
                  border: `1px solid ${borderCol}`,
                  borderRadius: '14px',
                  padding: isMobile ? '14px' : '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', fontWeight: 900, color: textTitle }}>
                      <div style={{ width: '3px', height: '14px', background: '#10b981', borderRadius: '2px' }} />
                      <span>Estado de Credenciales {dist2 !== 'all' ? `(${dist2})` : ''}</span>
                    </div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#10b981', background: isDark ? 'rgba(16, 185, 129, 0.15)' : '#dcfce7', padding: '2px 8px', borderRadius: '12px' }}>
                      {tab2Confirmados} Acreditados
                    </span>
                  </div>

                  <div style={{ position: 'relative', height: isMobile ? '200px' : '230px', width: '100%' }}>
                    <Doughnut
                      key={`doughnut-cred-${isDark ? 'dark' : 'light'}-${isMobile ? 'mob' : 'desk'}`}
                      data={doughnutData2}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          tooltip: { enabled: true, intersect: false },
                          legend: {
                            position: 'bottom',
                            labels: {
                              color: textTitle,
                              font: { size: isMobile ? 10 : 11, weight: 'bold' },
                              boxWidth: 12,
                              padding: 10
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Gráfico 2: Avance Videos vs Manuales PDF (Bar) */}
                <div style={{
                  background: bgCard,
                  border: `1px solid ${borderCol}`,
                  borderRadius: '14px',
                  padding: isMobile ? '14px' : '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', fontWeight: 900, color: textTitle }}>
                      <div style={{ width: '3px', height: '14px', background: '#0284c7', borderRadius: '2px' }} />
                      <span>Avance de Videos vs Manuales PDF</span>
                    </div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0284c7', background: isDark ? 'rgba(2, 132, 199, 0.15)' : '#e0f2fe', padding: '2px 8px', borderRadius: '12px' }}>
                      {filteredRecords2.length} Evaluados
                    </span>
                  </div>

                  <div style={{ position: 'relative', height: isMobile ? '200px' : '230px', width: '100%' }}>
                    <Bar
                      key={`bar-progreso-${isDark ? 'dark' : 'light'}-${isMobile ? 'mob' : 'desk'}`}
                      data={barData2}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          x: {
                            ticks: {
                              color: textSub,
                              font: { size: isMobile ? 9 : 10, weight: 'bold' }
                            },
                            grid: { display: false }
                          },
                          y: {
                            ticks: { color: textSub, stepSize: 1 },
                            beginAtZero: true,
                            grid: { color: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }
                          }
                        },
                        plugins: {
                          tooltip: { enabled: true, intersect: false },
                          legend: {
                            position: 'top',
                            labels: {
                              color: textTitle,
                              font: { size: isMobile ? 10 : 11, weight: 'bold' },
                              boxWidth: 12
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Tabla de Progreso Tab 2 */}
              <div style={{ background: bgCard, border: `1px solid ${borderCol}`, borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  {filteredRecords2.length > 0 ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ background: tableHeadBg, borderBottom: `1px solid ${borderCol}`, color: textSub, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          <th style={{ padding: '12px 14px' }}>ID</th>
                          <th style={{ padding: '12px 14px' }}>FECHA DE CREACIÓN</th>
                          <th style={{ padding: '12px 14px' }}>PERSONERO / DNI</th>
                          <th style={{ padding: '12px 14px' }}>ROL</th>
                          <th style={{ padding: '12px 14px' }}>DISTRITO ASIGNADO</th>
                          <th style={{ padding: '12px 14px' }}>PROGRESO VIDEO</th>
                          <th style={{ padding: '12px 14px' }}>PROGRESO PDF</th>
                          <th style={{ padding: '12px 14px' }}>ESTADO CREDENCIAL</th>
                          <th style={{ padding: '12px 14px' }}>WHATSAPP RECORDATORIO</th>
                          <th style={{ padding: '12px 14px', textAlign: 'center' }}>ACCIONES</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRecords2.map((r, idx) => {
                          const dni = r['D.N.I.'] || r['DNI'] || r.dni || '—';
                          const cel = r['Celular'] || r.celular || r['Número de Celular'] || '';
                          const v = parseInt(r.Video, 10) || 0;
                          const p = parseInt(r.PDF, 10) || 0;
                          const isAcc = String(r.Credenciales).toLowerCase() === 'confirmado';

                          // Fecha y Hora de Registro / Creación
                          const rawDate = r['Marca temporal'] || r['Fecha de Registro'] || r.fecha_de_registro || r.fechaRegistro;
                          let formattedDate = '—';
                          let formattedTime = '';
                          if (rawDate) {
                            const d = new Date(rawDate);
                            if (!isNaN(d.getTime())) {
                              formattedDate = d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
                              formattedTime = d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: true });
                            }
                          }

                          return (
                            <tr key={idx} style={{ borderBottom: `1px solid ${tableRowBorder}` }}>
                              <td style={{ padding: '12px 14px', fontWeight: 800, color: '#0284c7' }}>#{idx + 1}</td>
                              <td style={{ padding: '12px 14px', fontSize: '0.74rem', whiteSpace: 'nowrap' }}>
                                <div style={{ fontWeight: 800, color: textTitle }}>📅 {formattedDate}</div>
                                {formattedTime && <div style={{ fontSize: '0.68rem', color: '#0284c7', fontWeight: 700 }}>⏰ {formattedTime}</div>}
                              </td>
                              <td style={{ padding: '12px 14px' }}>
                                <div style={{ fontWeight: 800, color: textTitle }}>{r['Nombres y Apellidos'] || r.nombresApellidos || '—'}</div>
                                <div style={{ fontSize: '0.72rem', color: textSub }}>DNI: {dni}</div>
                              </td>
                              <td style={{ padding: '12px 14px' }}>
                                <span style={{ background: isDark ? 'rgba(2, 132, 199, 0.2)' : '#e0f2fe', color: '#0284c7', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                                  {r['Rol a Desempeñar'] || r.rolADesempenar || 'Personero de Mesa'}
                                </span>
                              </td>
                              <td style={{ padding: '12px 14px', color: textBody }}>
                                {r['Distrito Asignado'] || r.distritoAsignado || r['Distrito donde Vota'] || r.distritoDondeVota || '-'}
                              </td>
                              <td style={{ padding: '12px 14px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <div style={{ flex: 1, height: '6px', background: isDark ? '#1e293b' : '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                                    <div style={{ width: `${(v / 2) * 100}%`, height: '100%', background: '#0284c7' }}></div>
                                  </div>
                                  <span style={{ fontWeight: 800, color: '#0284c7', fontSize: '0.75rem' }}>{v}/2</span>
                                </div>
                              </td>
                              <td style={{ padding: '12px 14px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <div style={{ flex: 1, height: '6px', background: isDark ? '#1e293b' : '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                                    <div style={{ width: `${(p / 2) * 100}%`, height: '100%', background: '#a855f7' }}></div>
                                  </div>
                                  <span style={{ fontWeight: 800, color: '#a855f7', fontSize: '0.75rem' }}>{p}/2</span>
                                </div>
                              </td>
                              <td style={{ padding: '12px 14px' }}>
                                <span style={{
                                  display: 'inline-block',
                                  padding: '4px 10px',
                                  borderRadius: '6px',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  background: isAcc ? (isDark ? 'rgba(16, 185, 129, 0.2)' : '#dcfce7') : (isDark ? 'rgba(239, 68, 68, 0.2)' : '#fee2e2'),
                                  color: isAcc ? '#10b981' : '#ef4444',
                                  border: isAcc ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)'
                                }}>
                                  {isAcc ? 'Confirmado' : 'Bloqueado'}
                                </span>
                              </td>
                              <td style={{ padding: '12px 14px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                  {cel ? (
                                    <a
                                      href={`https://wa.me/51${String(cel).replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${r['Nombres y Apellidos'] || ''}, te recordamos ingresar a capacitarte como personero de Somos Perú para completar tus módulos: ${window.location.origin}`)}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        color: '#16a34a',
                                        fontWeight: 700,
                                        textDecoration: 'none',
                                        fontSize: '0.75rem'
                                      }}
                                    >
                                      <span>📱 Recordatorio</span>
                                    </a>
                                  ) : (
                                    <span style={{ color: textSub, fontSize: '0.75rem', fontWeight: 600 }}>📱 Sin número</span>
                                  )}
                                  <div style={{ fontSize: '0.72rem', color: cel ? '#16a34a' : textSub, fontWeight: 700 }}>
                                    {cel ? `📞 ${cel}` : '—'}
                                  </div>
                                </div>
                              </td>
                              <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                                <button
                                  onClick={() => setSelectedPersonero(r)}
                                  title="Modificar datos o asignar mesa"
                                  style={{
                                    padding: '6px 12px',
                                    borderRadius: '6px',
                                    border: '1px solid #0284c7',
                                    background: isDark ? 'rgba(2, 132, 199, 0.15)' : '#e0f2fe',
                                    color: '#0284c7',
                                    fontWeight: 700,
                                    fontSize: '0.75rem',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                  <span>Modificar</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  ) : (
                    <div style={{ padding: '40px 20px', textAlign: 'center', color: textSub }}>
                      <AlertCircle className="w-8 h-8 mx-auto text-amber-500 mb-2" />
                      <div style={{ fontWeight: 800, fontSize: '0.95rem', color: textTitle }}>No se encontraron personeros con los filtros actuales</div>
                      <p style={{ fontSize: '0.8rem', margin: '6px 0 14px 0' }}>Pruebe cambiando o limpiando los criterios de búsqueda de capacitación.</p>
                      <button
                        onClick={() => { setSearch2(''); setStatus2('all'); setDist2('all'); setRole2('all'); }}
                        style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#0284c7', color: '#fff', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
                      >
                        Restablecer Filtros
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 3: CONEXIÓN A SQL SERVER
              ========================================================================= */}
          {activeTab === 'sql' && (
            <div>
              {/* Banner Top */}
              <div style={{ background: bgCard, border: `1px solid ${borderCol}`, borderRadius: '12px', padding: '16px 20px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', fontWeight: 900, color: textTitle }}>
                  <Cable className="w-5 h-5 text-sky-500" />
                  <span>Conexión a SQL Server Management Studio</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: textSub, marginTop: '2px' }}>
                  Configuración de tablas SQL Server (dbo.personero y dbo.coordinadores)
                </div>
              </div>

              {savedUrlMsg && (
                <div style={{ padding: '12px 16px', borderRadius: '10px', background: isDark ? 'rgba(16, 185, 129, 0.2)' : '#dcfce7', border: '1px solid #bbf7d0', color: '#10b981', fontSize: '0.85rem', fontWeight: 700, marginBottom: '20px' }}>
                  ✓ {savedUrlMsg}
                </div>
              )}

              {/* 2 Cards side by side */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                
                {/* Card 1: Estado de la Conexión SQL Server */}
                <div style={{ background: bgCard, border: `1px solid ${borderCol}`, borderRadius: '12px', padding: '24px' }}>
                  <h3 style={{ fontSize: '0.98rem', fontWeight: 900, color: textTitle, margin: '0 0 16px 0' }}>
                    Estado de la Conexión SQL Server
                  </h3>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: `1px solid ${borderCol}` }}>
                    <span style={{ fontSize: '0.85rem', color: textSub, fontWeight: 600 }}>Registros en SQL Server:</span>
                    <span style={{ background: isDark ? 'rgba(2, 132, 199, 0.2)' : '#e0f2fe', color: '#0284c7', padding: '4px 12px', borderRadius: '14px', fontSize: '0.82rem', fontWeight: 800 }}>
                      {records.length} registros
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
                    <span style={{ fontSize: '0.85rem', color: textSub, fontWeight: 600 }}>Última Sincronización:</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: textTitle }}>
                      {new Date().toLocaleTimeString('es-PE')}
                    </span>
                  </div>
                </div>

                {/* Card 2: URL del Servidor API (SQL Server) */}
                <div style={{ background: bgCard, border: `1px solid ${borderCol}`, borderRadius: '12px', padding: '24px' }}>
                  <h3 style={{ fontSize: '0.98rem', fontWeight: 900, color: textTitle, margin: '0 0 12px 0' }}>
                    URL del Servidor API (SQL Server)
                  </h3>

                  <div style={{ fontSize: '0.78rem', color: textSub, fontWeight: 700, marginBottom: '6px' }}>
                    URL API Activa:
                  </div>

                  <textarea
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: `1px solid ${borderCol}`,
                      background: bgInput,
                      fontSize: '0.85rem',
                      fontFamily: 'monospace',
                      color: textTitle,
                      marginBottom: '16px',
                      outline: 'none'
                    }}
                  />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button
                      onClick={() => setApiUrl('http://localhost:3000/api')}
                      style={{ padding: '8px 16px', borderRadius: '8px', border: `1px solid ${borderCol}`, background: isDark ? '#1e293b' : '#f8fafc', color: textTitle, fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Restaurar Defecto
                    </button>

                    <button
                      onClick={() => {
                        setSavedUrlMsg('Configuración guardada y sincronizada con SQL Server.');
                        fetchData();
                        setTimeout(() => setSavedUrlMsg(null), 3000);
                      }}
                      style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: 'rgb(14, 165, 233)', color: '#ffffff', fontSize: '0.82rem', fontWeight: 800, cursor: 'pointer' }}
                    >
                      Guardar y Conectar
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 3: TRAYECTO TERRITORIAL Y RUTAS DE PERSONEROS
              ========================================================================= */}
          {activeTab === 'trayecto' && (
            <TrayectoView
              records={records}
              isDark={isDark}
              defaultDistrict={coordinatorDistrict || 'San Isidro'}
            />
          )}

          {/* =========================================================================
              TAB: ZONAS ELECTORALES (VILLA MARÍA DEL TRIUNFO)
              ========================================================================= */}
          {activeTab === 'zonas' && (
            <div className="animate-fade-in" style={{ width: '100%' }}>
              <ZonasElectoralesView
                isDark={isDark}
                allPersoneros={records}
                userDistrito={coordinatorDistrict || dist1 || 'VILLA MARIA DEL TRIUNFO'}
                assignedZona={assignedVmtZone}
                user={user}
                onSelectPersonero={(p) => setSelectedPersonero(p)}
                onFilterByLocal={(colegio) => {
                  setDist1('Villa María del Triunfo');
                  setLocalZonal1(colegio);
                  setActiveTab('overview');
                }}
              />
            </div>
          )}

          {/* =========================================================================
              TAB: MAPA ZONAL (VILLA MARÍA DEL TRIUNFO)
              ========================================================================= */}
          {activeTab === 'mapa' && (
            <div className="animate-fade-in" style={{ width: '100%' }}>
              <MapaZonasVMTView
                isDark={isDark}
                allPersoneros={records}
                assignedZona={assignedVmtZone}
                user={user}
                onFilterByLocal={(colegio) => {
                  setDist1('Villa María del Triunfo');
                  setLocalZonal1(colegio);
                  setActiveTab('overview');
                }}
                onSelectPersonero={(p) => setSelectedPersonero(p)}
                onGoToZonasTab={() => setActiveTab('zonas')}
              />
            </div>
          )}

          {/* =========================================================================
              TAB 4: HISTORIAL DE CAMBIOS Y AUDITORÍA (EXCLUSIVO SUPERADMIN MASTER)
              ========================================================================= */}
          {activeTab === 'auditoria' && canViewAudit && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              
              {/* Header Tab Auditoría Compacto */}
              <div style={{
                background: bgCard,
                border: `1.5px solid ${isDark ? '#334155' : '#bae6fd'}`,
                borderRadius: '12px',
                padding: isMobile ? '12px 14px' : '12px 18px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '10px',
                boxShadow: isDark ? '0 4px 16px rgba(0,0,0,0.2)' : '0 2px 12px rgba(2, 132, 199, 0.06)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ background: '#0284c7', color: '#fff', padding: '3px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.74rem', fontWeight: 800 }}>
                    <History className="w-3.5 h-3.5" />
                    <span>AUDITORÍA</span>
                  </div>
                  <h2 style={{ fontSize: isMobile ? '0.98rem' : '1.15rem', fontWeight: 900, color: textTitle, margin: 0 }}>
                    Historial de Modificaciones y Eliminaciones
                  </h2>
                </div>
              </div>

              {/* Barra KPI Compacta */}
              {/* Barra KPI Compacta (Colores Oficiales Somos Perú) */}
              {(() => {
                const totalUpdates = auditLogs.filter(l => l.action === 'UPDATE_PERSONERO').length;
                const totalDeletes = auditLogs.filter(l => l.action === 'DELETE_PERSONERO').length;
                const totalChanges = totalUpdates + totalDeletes;

                return (
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)', gap: '8px' }}>
                    <div style={{ background: bgCard, border: `1.5px solid ${isDark ? '#002B66' : '#93c5fd'}`, borderLeft: '4px solid #002B66', borderRadius: '8px', padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.2)' : '0 1px 4px rgba(0, 43, 102, 0.08)' }}>
                      <span style={{ fontSize: '0.72rem', color: isDark ? '#93c5fd' : '#002B66', fontWeight: 800 }}>⚡ TOTAL MODIFICACIONES:</span>
                      <strong style={{ fontSize: '1.15rem', fontWeight: 900, color: isDark ? '#60a5fa' : '#002B66' }}>{totalChanges}</strong>
                    </div>
                    <div style={{ background: bgCard, border: `1.5px solid ${isDark ? '#c59b27' : '#fde68a'}`, borderLeft: '4px solid #c59b27', borderRadius: '8px', padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.2)' : '0 1px 4px rgba(197, 155, 39, 0.08)' }}>
                      <span style={{ fontSize: '0.72rem', color: isDark ? '#fde68a' : '#b45309', fontWeight: 800 }}>✏️ DATOS EDITADOS:</span>
                      <strong style={{ fontSize: '1.15rem', fontWeight: 900, color: isDark ? '#facc15' : '#b45309' }}>{totalUpdates}</strong>
                    </div>
                    <div style={{ background: bgCard, border: `1.5px solid ${isDark ? '#dc2626' : '#fca5a5'}`, borderLeft: '4px solid #dc2626', borderRadius: '8px', padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.2)' : '0 1px 4px rgba(220, 38, 38, 0.08)' }}>
                      <span style={{ fontSize: '0.72rem', color: '#dc2626', fontWeight: 800 }}>🗑️ PERSONEROS ELIMINADOS:</span>
                      <strong style={{ fontSize: '1.15rem', fontWeight: 900, color: '#dc2626' }}>{totalDeletes}</strong>
                    </div>
                  </div>
                );
              })()}

              {/* Filtros de Auditoría Compactos con Selector de Fecha */}
              <div style={{
                background: bgCard,
                border: `1px solid ${borderCol}`,
                borderRadius: '10px',
                padding: '10px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                {/* Fila 1: Buscador + Tipo de Acción */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                  <div style={{ position: 'relative', flex: '1 1 200px' }}>
                    <Search className="w-3.5 h-3.5 text-sky-500" style={{ position: 'absolute', left: '10px', top: '9px' }} />
                    <input
                      type="text"
                      placeholder="Buscar por DNI, Nombre de personero, Autor..."
                      value={auditSearch}
                      onChange={(e) => setAuditSearch(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px 10px 6px 30px',
                        borderRadius: '6px',
                        border: `1px solid ${borderCol}`,
                        background: bgInput,
                        color: textTitle,
                        fontSize: '0.78rem',
                        outline: 'none'
                      }}
                    />
                    {auditSearch && (
                      <button
                        type="button"
                        onClick={() => setAuditSearch('')}
                        style={{ position: 'absolute', right: '8px', top: '7px', background: 'none', border: 'none', color: textSub, cursor: 'pointer' }}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div style={{ minWidth: '180px' }}>
                    <select
                      value={auditFilterAction}
                      onChange={(e) => setAuditFilterAction(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        border: `1px solid ${borderCol}`,
                        background: bgInput,
                        color: textTitle,
                        fontSize: '0.78rem',
                        outline: 'none',
                        fontWeight: 700
                      }}
                    >
                      <option value="modificaciones">⚡ Solo Modificaciones y Eliminaciones</option>
                      <option value="UPDATE_PERSONERO">✏️ Solo Datos Modificados</option>
                      <option value="DELETE_PERSONERO">🗑️ Solo Eliminaciones</option>
                      <option value="all">📁 Ver Todo el Historial</option>
                    </select>
                  </div>
                </div>

                {/* Fila 2: Filtro por Fechas */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center', fontSize: '0.74rem' }}>
                  <span style={{ color: textSub, fontWeight: 800, marginRight: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar className="w-3.5 h-3.5 text-sky-500" />
                    <span>Fecha:</span>
                  </span>

                  {[
                    { key: 'all', label: 'Todas' },
                    { key: 'today', label: 'Hoy' },
                    { key: 'yesterday', label: 'Ayer' },
                    { key: 'last7', label: 'Últimos 7 días' }
                  ].map(tab => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => {
                        setAuditDateFilter(tab.key);
                        if (tab.key !== 'custom') setAuditCustomDate('');
                      }}
                      style={{
                        padding: '3px 9px',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: auditDateFilter === tab.key ? 800 : 600,
                        border: auditDateFilter === tab.key ? '1px solid #0284c7' : `1px solid ${borderCol}`,
                        background: auditDateFilter === tab.key ? (isDark ? 'rgba(2, 132, 199, 0.25)' : '#e0f2fe') : (isDark ? '#1e293b' : '#f8fafc'),
                        color: auditDateFilter === tab.key ? '#0284c7' : textSub,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}

                  {/* Selector de fecha específica */}
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginLeft: 'auto' }}>
                    <span style={{ color: textSub, fontSize: '0.7rem' }}>O elegir día:</span>
                    <input
                      type="date"
                      value={auditCustomDate}
                      onChange={(e) => {
                        setAuditCustomDate(e.target.value);
                        if (e.target.value) setAuditDateFilter('custom');
                        else setAuditDateFilter('all');
                      }}
                      style={{
                        padding: '3px 6px',
                        borderRadius: '6px',
                        border: `1px solid ${auditDateFilter === 'custom' ? '#0284c7' : borderCol}`,
                        background: bgInput,
                        color: textTitle,
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Lista / Timeline de Auditoría Compacta */}
              {(() => {
                const searchClean = auditSearch.trim().toLowerCase();

                const isSameDay = (d1, d2) =>
                  d1.getFullYear() === d2.getFullYear() &&
                  d1.getMonth() === d2.getMonth() &&
                  d1.getDate() === d2.getDate();

                const filtered = auditLogs.filter(log => {
                  // Filtro por acción
                  if (auditFilterAction === 'modificaciones') {
                    if (log.action !== 'UPDATE_PERSONERO' && log.action !== 'DELETE_PERSONERO') return false;
                  } else if (auditFilterAction !== 'all') {
                    if (log.action !== auditFilterAction) return false;
                  }

                  // Filtro por fecha
                  if (log.createdAt && auditDateFilter !== 'all') {
                    const logDate = new Date(log.createdAt);
                    const now = new Date();

                    if (auditDateFilter === 'today') {
                      if (!isSameDay(logDate, now)) return false;
                    } else if (auditDateFilter === 'yesterday') {
                      const yest = new Date(now);
                      yest.setDate(now.getDate() - 1);
                      if (!isSameDay(logDate, yest)) return false;
                    } else if (auditDateFilter === 'last7') {
                      const sevenDaysAgo = new Date(now);
                      sevenDaysAgo.setDate(now.getDate() - 7);
                      if (logDate < sevenDaysAgo) return false;
                    } else if (auditDateFilter === 'custom' && auditCustomDate) {
                      const parts = auditCustomDate.split('-');
                      if (parts.length === 3) {
                        const customD = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
                        if (!isSameDay(logDate, customD)) return false;
                      }
                    }
                  }

                  if (!searchClean) return true;

                  const detailsStr = JSON.stringify(log.details || '').toLowerCase();
                  const userStr = String(log.userIdentifier || '').toLowerCase();
                  const roleStr = String(log.role || '').toLowerCase();
                  const actionStr = String(log.action || '').toLowerCase();

                  return detailsStr.includes(searchClean) || userStr.includes(searchClean) || roleStr.includes(searchClean) || actionStr.includes(searchClean);
                });

                if (auditLoading && auditLogs.length === 0) {
                  return (
                    <div style={{ padding: '30px', textAlign: 'center', background: bgCard, borderRadius: '10px', border: `1px solid ${borderCol}` }}>
                      <RefreshCw className="w-6 h-6 text-sky-500 animate-spin" style={{ margin: '0 auto 8px auto' }} />
                      <p style={{ color: textSub, fontSize: '0.82rem', fontWeight: 700, margin: 0 }}>Cargando historial...</p>
                    </div>
                  );
                }

                if (filtered.length === 0) {
                  return (
                    <div style={{ padding: '36px 20px', textAlign: 'center', background: bgCard, borderRadius: '12px', border: `1.5px dashed ${borderCol}` }}>
                      <div style={{ fontSize: '2rem', marginBottom: '6px' }}>✨</div>
                      <h4 style={{ fontWeight: 800, color: textTitle, margin: '0 0 4px 0', fontSize: '0.94rem' }}>
                        No se encontraron modificaciones para este filtro
                      </h4>
                      <p style={{ color: textSub, fontSize: '0.78rem', margin: 0 }}>
                        {auditSearch || auditDateFilter !== 'all'
                          ? 'Pruebe seleccionando otra fecha o limpiando la búsqueda.'
                          : 'El historial está completamente limpio.'}
                      </p>
                    </div>
                  );
                }

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {filtered.map((log, idx) => {
                      const dateObj = log.createdAt ? new Date(log.createdAt) : null;
                      const dateFormatted = dateObj ? dateObj.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';
                      const timeFormatted = dateObj ? dateObj.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '';

                      const d = log.details || {};
                      const isDelete = log.action === 'DELETE_PERSONERO';
                      const isUpdate = log.action === 'UPDATE_PERSONERO';

                      let badgeBg = isDark ? '#1e293b' : '#f0f9ff';
                      let badgeColor = '#0284c7';
                      let badgeBorder = isDark ? '#334155' : '#bae6fd';
                      let badgeIcon = '✏️';
                      let badgeText = 'MODIFICACIÓN';

                      if (isDelete) {
                        badgeBg = isDark ? 'rgba(239, 68, 68, 0.15)' : '#fef2f2';
                        badgeColor = '#dc2626';
                        badgeBorder = '#fca5a5';
                        badgeIcon = '🗑️';
                        badgeText = 'ELIMINACIÓN';
                      }

                      const author = d.author || log.userIdentifier || 'Usuario';
                      const authorRole = d.authorRole || log.role || 'Superadministrador';
                      const personName = d.nombres || d.fullName || d.name || '—';
                      const personDni = d.dni || log.userIdentifier || '—';
                      const district = d.distrito || d.distritoAsignado || '—';

                      return (
                        <div
                          key={log.id || idx}
                          style={{
                            background: bgCard,
                            border: `1px solid ${isDelete ? '#fca5a5' : borderCol}`,
                            borderRadius: '8px',
                            padding: '8px 12px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                            fontSize: '0.76rem',
                            transition: 'all 0.12s ease'
                          }}
                        >
                          {/* Fila 1: Identificador + Fecha/Hora + Autor + Personero */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                              <span style={{
                                background: badgeBg,
                                color: badgeColor,
                                border: `1px solid ${badgeBorder}`,
                                padding: '1px 6px',
                                borderRadius: '4px',
                                fontSize: '0.68rem',
                                fontWeight: 800,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px'
                              }}>
                                <span>{badgeIcon} #{log.id}</span>
                              </span>

                              <span style={{ fontSize: '0.72rem', color: textSub, fontWeight: 700 }}>
                                📅 {dateFormatted} {timeFormatted}
                              </span>

                              <span style={{ color: textSub }}>&bull;</span>

                              <span>
                                👤 <strong>{author}</strong> <span style={{ color: '#0284c7', fontSize: '0.7rem' }}>({authorRole})</span>
                              </span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span style={{ color: isDelete ? '#dc2626' : textTitle, fontWeight: 800 }}>
                                {isDelete ? '❌ Eliminó: ' : '🎯 Afectado: '}<strong>{personName}</strong>
                              </span>
                              <span style={{ color: textSub, fontSize: '0.7rem' }}>
                                (DNI: {personDni} {district && district !== '—' ? `• ${district}` : ''})
                              </span>
                            </div>
                          </div>

                          {/* Fila 2: Comparativa Antes vs Ahora Compacta */}
                          {isUpdate && d.changes && Object.keys(d.changes).length > 0 ? (
                            <div style={{
                              display: 'flex',
                              flexWrap: 'wrap',
                              gap: '6px',
                              alignItems: 'center',
                              background: isDark ? '#0f172a' : '#f8fafc',
                              border: `1px solid ${borderCol}`,
                              borderRadius: '6px',
                              padding: '4px 8px',
                              marginTop: '2px'
                            }}>
                              <span style={{ fontWeight: 800, color: '#0284c7', fontSize: '0.7rem' }}>🔍 Detalle:</span>
                              {Object.entries(d.changes).map(([field, val], cIdx) => (
                                <div key={cIdx} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem' }}>
                                  <strong style={{ color: textTitle, textTransform: 'capitalize' }}>{field}:</strong>
                                  <span style={{ color: '#dc2626', background: '#fee2e2', padding: '0 4px', borderRadius: '3px', textDecoration: 'line-through' }}>
                                    {String(val?.antes ?? '—')}
                                  </span>
                                  <strong style={{ color: '#0284c7' }}>➔</strong>
                                  <span style={{ color: '#16a34a', background: '#dcfce7', padding: '0 4px', borderRadius: '3px', fontWeight: 800 }}>
                                    {String(val?.despues ?? '—')}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (isUpdate && (
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              background: isDark ? '#0f172a' : '#f8fafc',
                              border: `1px solid ${borderCol}`,
                              borderRadius: '6px',
                              padding: '4px 8px',
                              fontSize: '0.71rem',
                              color: textSub,
                              marginTop: '2px'
                            }}>
                              <span>💾 <strong>Revalidación de Ficha:</strong> Guardado y confirmación de asignación sin cambios.</span>
                              {d.local && <span>&bull; Local: <strong>{d.local}</strong></span>}
                              {d.mesa && <span>&bull; Mesa: <strong>{d.mesa}</strong></span>}
                              {d.rol && <span>&bull; Rol: <strong>{d.rol}</strong></span>}
                            </div>
                          ))}

                          {isDelete && (
                            <div style={{
                              background: isDark ? 'rgba(239, 68, 68, 0.1)' : '#fef2f2',
                              border: '1px solid #fecaca',
                              borderRadius: '6px',
                              padding: '4px 8px',
                              fontSize: '0.71rem',
                              color: '#b91c1c',
                              marginTop: '2px'
                            }}>
                              ⚠️ <strong>Eliminado definitivamente:</strong> El personero fue retirado del padrón.
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

            </div>
          )}

        </div>
      </div>

      {/* BOTTOM NAV BAR — solo en móvil */}
      {isMobile && (
        <nav style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '64px',
          background: bgSidebar,
          borderTop: `1px solid ${borderCol}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          zIndex: 100,
          boxShadow: '0 -2px 12px rgba(0,0,0,0.1)'
        }}>
          <button
            onClick={() => setActiveTab('overview')}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '3px',
              border: 'none',
              background: 'transparent',
              color: activeTab === 'overview' ? '#0284c7' : textSub,
              fontWeight: activeTab === 'overview' ? 800 : 500,
              fontSize: '0.62rem',
              cursor: 'pointer',
              padding: '8px 0'
            }}
          >
            <LayoutGrid style={{ width: '20px', height: '20px' }} />
            <span>Panel</span>
          </button>

          <button
            onClick={() => setActiveTab('capacitacion')}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '3px',
              border: 'none',
              background: 'transparent',
              color: activeTab === 'capacitacion' ? '#0284c7' : textSub,
              fontWeight: activeTab === 'capacitacion' ? 800 : 500,
              fontSize: '0.62rem',
              cursor: 'pointer',
              padding: '8px 0'
            }}
          >
            <GraduationCap style={{ width: '20px', height: '20px' }} />
            <span>Capacitaciones</span>
          </button>

          <button
            onClick={() => setActiveTab('trayecto')}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '3px',
              border: 'none',
              background: 'transparent',
              color: activeTab === 'trayecto' ? '#0284c7' : textSub,
              fontWeight: activeTab === 'trayecto' ? 800 : 500,
              fontSize: '0.62rem',
              cursor: 'pointer',
              padding: '8px 0'
            }}
          >
            <Navigation style={{ width: '20px', height: '20px' }} />
            <span>Trayecto</span>
          </button>

          <button
            onClick={() => setActiveTab('zonas')}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '3px',
              border: 'none',
              background: 'transparent',
              color: activeTab === 'zonas' ? '#0284c7' : textSub,
              fontWeight: activeTab === 'zonas' ? 800 : 500,
              fontSize: '0.62rem',
              cursor: 'pointer',
              padding: '8px 0'
            }}
          >
            <Layers style={{ width: '20px', height: '20px' }} />
            <span>Zonas</span>
          </button>

          <button
            onClick={() => setActiveTab('mapa')}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '3px',
              border: 'none',
              background: 'transparent',
              color: activeTab === 'mapa' ? '#0284c7' : textSub,
              fontWeight: activeTab === 'mapa' ? 800 : 500,
              fontSize: '0.62rem',
              cursor: 'pointer',
              padding: '8px 0'
            }}
          >
            <MapPin style={{ width: '20px', height: '20px' }} />
            <span>Mapa</span>
          </button>

          {canViewAudit && (
            <button
              onClick={() => setActiveTab('auditoria')}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '3px',
                border: 'none',
                background: 'transparent',
                color: activeTab === 'auditoria' ? '#0284c7' : textSub,
                fontWeight: activeTab === 'auditoria' ? 800 : 500,
                fontSize: '0.62rem',
                cursor: 'pointer',
                padding: '8px 0'
              }}
            >
              <History style={{ width: '20px', height: '20px' }} />
              <span>Auditoría</span>
            </button>
          )}

        </nav>
      )}

      {/* MODAL / DRAWER DE DETALLE DE MESAS Y ZONA DE UN COLEGIO */}
      {selectedSchoolDetail && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: isMobile ? '8px' : '16px',
          zIndex: 1000,
          animation: 'fadeIn 0.15s ease-out'
        }}>
          <div style={{
            background: bgCard,
            border: `1.5px solid ${borderCol}`,
            borderRadius: isMobile ? '14px' : '20px',
            maxWidth: '560px',
            width: '100%',
            maxHeight: isMobile ? '94vh' : '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
          }}>
            {/* Header del Modal */}
            <div style={{ padding: isMobile ? '12px 14px' : '16px 20px', borderBottom: `1px solid ${borderCol}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: isDark ? '#0f172a' : '#f8fafc' }}>
              <div style={{ minWidth: 0, flex: 1, paddingRight: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: isMobile ? '1rem' : '1.2rem' }}>🏫</span>
                  <strong style={{ fontSize: isMobile ? '0.88rem' : '0.98rem', fontWeight: 900, color: textTitle, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {selectedSchoolDetail.nombre}
                  </strong>
                </div>
                <div style={{ fontSize: '0.72rem', color: textSub, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <span>📍 <strong>{selectedSchoolDetail.direccion || findOfficialLocal(selectedSchoolDetail.nombre, selectedSchoolDetail.distrito)?.direccion || selectedSchoolDetail.distrito}</strong> ({selectedSchoolDetail.distrito})</span>
                  <span>&bull;</span>
                  <span><strong>{selectedSchoolDetail.allPersoneros.length}</strong> {selectedSchoolDetail.allPersoneros.length === 1 ? 'personero' : 'personeros'}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedSchoolDetail(null);
                  setExpandedMesa(null);
                  setSchoolDetailTab('personeros');
                }}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  border: `1px solid ${borderCol}`,
                  background: isDark ? '#1e293b' : '#ffffff',
                  color: textTitle,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontWeight: 900,
                  flexShrink: 0
                }}
              >
                ✕
              </button>
            </div>

            {/* Contenido del Modal: Coordinación y Personeros de Mesa */}
            <div style={{ padding: '16px 20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                
                {/* 1. SECCIÓN DE COORDINACIÓN (LOCAL Y ZONAL) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '0.74rem', fontWeight: 900, color: textSub, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    🏛️ Estructura de Coordinación:
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '8px' }}>
                    {/* Tarjeta Coordinador de Local (PCV) */}
                    <div style={{
                      background: selectedSchoolDetail.plvPersonero ? (isDark ? 'rgba(2, 132, 199, 0.12)' : '#f0f9ff') : (isDark ? 'rgba(245, 158, 11, 0.12)' : '#fefce8'),
                      border: `1.5px solid ${selectedSchoolDetail.plvPersonero ? '#38bdf8' : '#fde047'}`,
                      borderRadius: '12px',
                      padding: '10px 12px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '6px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 900,
                          color: selectedSchoolDetail.plvPersonero ? '#0284c7' : '#b45309',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <School className="w-3.5 h-3.5" />
                          <span>Coord. de Local (PCV)</span>
                        </span>
                        {selectedSchoolDetail.plvPersonero ? (
                          <span style={{ fontSize: '0.65rem', fontWeight: 800, background: '#10b981', color: '#fff', padding: '1px 6px', borderRadius: '8px' }}>
                            ASIGNADO
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.65rem', fontWeight: 800, background: '#f59e0b', color: '#fff', padding: '1px 6px', borderRadius: '8px' }}>
                            VACANTE
                          </span>
                        )}
                      </div>

                      {selectedSchoolDetail.plvPersonero ? (
                        <div>
                          <strong style={{ fontSize: '0.86rem', color: textTitle, display: 'block', lineHeight: 1.2 }}>
                            {selectedSchoolDetail.plvPersonero['Nombres y Apellidos'] || selectedSchoolDetail.plvPersonero.nombresApellidos}
                          </strong>
                          <div style={{ fontSize: '0.72rem', color: textSub, marginTop: '2px' }}>
                            DNI: <strong>{selectedSchoolDetail.plvPersonero['D.N.I.'] || selectedSchoolDetail.plvPersonero.dni}</strong>
                          </div>
                          {(selectedSchoolDetail.plvPersonero['Celular'] || selectedSchoolDetail.plvPersonero.celular) && (
                            <a
                              href={`https://wa.me/51${String(selectedSchoolDetail.plvPersonero['Celular'] || selectedSchoolDetail.plvPersonero.celular).replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                background: '#16a34a',
                                color: '#ffffff',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                fontSize: '0.7rem',
                                fontWeight: 800,
                                textDecoration: 'none',
                                marginTop: '4px'
                              }}
                            >
                              <Phone className="w-2.5 h-2.5" />
                              <span>{selectedSchoolDetail.plvPersonero['Celular'] || selectedSchoolDetail.plvPersonero.celular}</span>
                            </a>
                          )}
                        </div>
                      ) : (
                        <div style={{ fontSize: '0.72rem', color: '#b45309', fontWeight: 600 }}>
                          ⚠️ Sin Coordinador de Local asignado.
                        </div>
                      )}
                    </div>

                    {/* Tarjeta Coordinador Zonal */}
                    <div style={{
                      background: selectedSchoolDetail.zonalPersonero ? (isDark ? 'rgba(139, 92, 246, 0.12)' : '#f5f3ff') : (isDark ? 'rgba(100, 116, 139, 0.12)' : '#f8fafc'),
                      border: `1.5px solid ${selectedSchoolDetail.zonalPersonero ? '#a78bfa' : borderCol}`,
                      borderRadius: '12px',
                      padding: '10px 12px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '6px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 900,
                          color: selectedSchoolDetail.zonalPersonero ? '#7c3aed' : textSub,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <span>🗺️</span>
                          <span>Coordinador Zonal</span>
                        </span>
                        {selectedSchoolDetail.zonalPersonero ? (
                          <span style={{ fontSize: '0.65rem', fontWeight: 800, background: '#8b5cf6', color: '#fff', padding: '1px 6px', borderRadius: '8px' }}>
                            A CARGO
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.65rem', fontWeight: 800, background: '#64748b', color: '#fff', padding: '1px 6px', borderRadius: '8px' }}>
                            SIN ZONAL
                          </span>
                        )}
                      </div>

                      {selectedSchoolDetail.zonalPersonero ? (
                        <div>
                          <strong style={{ fontSize: '0.86rem', color: textTitle, display: 'block', lineHeight: 1.2 }}>
                            {selectedSchoolDetail.zonalPersonero['Nombres y Apellidos'] || selectedSchoolDetail.zonalPersonero.nombresApellidos}
                          </strong>
                          <div style={{ fontSize: '0.72rem', color: textSub, marginTop: '2px' }}>
                            DNI: <strong>{selectedSchoolDetail.zonalPersonero['D.N.I.'] || selectedSchoolDetail.zonalPersonero.dni}</strong>
                          </div>
                          {(selectedSchoolDetail.zonalPersonero['Celular'] || selectedSchoolDetail.zonalPersonero.celular) && (
                            <a
                              href={`https://wa.me/51${String(selectedSchoolDetail.zonalPersonero['Celular'] || selectedSchoolDetail.zonalPersonero.celular).replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                background: '#16a34a',
                                color: '#ffffff',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                fontSize: '0.7rem',
                                fontWeight: 800,
                                textDecoration: 'none',
                                marginTop: '4px'
                              }}
                            >
                              <Phone className="w-2.5 h-2.5" />
                              <span>{selectedSchoolDetail.zonalPersonero['Celular'] || selectedSchoolDetail.zonalPersonero.celular}</span>
                            </a>
                          )}
                        </div>
                      ) : (
                        <div style={{ fontSize: '0.72rem', color: textSub, fontWeight: 600 }}>
                          No asignado a una zona específica.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. SECCIÓN EXCLUSIVA DE PERSONEROS DE MESA */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <span style={{ fontSize: '0.74rem', fontWeight: 900, color: textSub, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      👥 Personeros de Mesa Registrados ({sortedModalMesaPersoneros.length} de {selectedSchoolDetail.totalMesas || 1} mesas):
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        color: sortedModalMesaPersoneros.length >= (selectedSchoolDetail.totalMesas || 1) ? '#16a34a' : '#0284c7'
                      }}>
                        {selectedSchoolDetail.cobertura}% Cubierto
                      </span>
                      {sortedModalMesaPersoneros.length > 1 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <ArrowUpDown className="w-3 h-3 text-emerald-500" />
                          <select
                            value={sortByMesa}
                            onChange={(e) => setSortByMesa(e.target.value)}
                            style={{
                              padding: '3px 8px',
                              borderRadius: '6px',
                              border: `1px solid ${borderCol}`,
                              background: isDark ? '#1e293b' : '#ffffff',
                              color: textTitle,
                              fontSize: '0.7rem',
                              fontWeight: 800,
                              cursor: 'pointer',
                              outline: 'none'
                            }}
                          >
                            <optgroup label="🗳️ MESA ASIGNADA">
                              <option value="mesa_asc">🔢 Mesa Asignada: Menor a Mayor</option>
                              <option value="mesa_desc">🔢 Mesa Asignada: Mayor a Menor</option>
                            </optgroup>
                            <optgroup label="👤 DATOS DEL PERSONERO">
                              <option value="nombre_asc">🔤 Nombre del Personero (A → Z)</option>
                            </optgroup>
                            <optgroup label="📋 ESTADO Y LOGÍSTICA">
                              <option value="acreditados_primero">✅ Personeros Acreditados primero</option>
                              <option value="movilidad_primero">🚗 Personeros con Movilidad primero</option>
                              <option value="experiencia_primero">⭐ Personeros con Experiencia primero</option>
                            </optgroup>
                          </select>
                        </div>
                      )}
                    </div>
                  </div>

                  {sortedModalMesaPersoneros.length === 0 ? (
                    <div style={{
                      textAlign: 'center',
                      padding: '24px 16px',
                      background: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc',
                      borderRadius: '10px',
                      border: `1px dashed ${borderCol}`,
                      color: textSub,
                      fontSize: '0.82rem'
                    }}>
                      ⚠️ No hay personeros de mesa registrados todavía en este local de votación.
                    </div>
                  ) : (
                    sortedModalMesaPersoneros.map((assignedPerson, mIdx) => {
                      const pName = assignedPerson['Nombres y Apellidos'] || assignedPerson.nombresApellidos || 'Sin Nombre';
                      const pDni = assignedPerson['D.N.I.'] || assignedPerson.dni || '-';
                      const pCel = assignedPerson['Celular'] || assignedPerson.celular || '';
                      const pMesa = assignedPerson['Mesa de Votación'] || assignedPerson.mesa || assignedPerson.mesa_asignada || assignedPerson.mesaAsignada || 'Por Asignar';
                      const pAcc = (assignedPerson['Acreditado'] || '').toLowerCase() === 'si';
                      const isExpanded = expandedMesa === `p-${mIdx}`;

                      return (
                        <div
                          key={`mesa-p-${mIdx}`}
                          style={{
                            background: isDark ? '#0f172a' : '#ffffff',
                            border: `1px solid ${borderCol}`,
                            borderLeft: '5px solid #10b981',
                            borderRadius: '10px',
                            padding: '10px 12px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                          onClick={() => setExpandedMesa(isExpanded ? null : `p-${mIdx}`)}
                        >
                          {/* Fila Principal del Personero de Mesa */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <div style={{ fontSize: '0.88rem', fontWeight: 900, color: textTitle }}>
                                {pName}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '0.7rem', fontWeight: 800, background: '#dcfce7', color: '#15803d', padding: '1px 6px', borderRadius: '4px' }}>
                                  🗳️ Mesa: {pMesa}
                                </span>
                                <span style={{ fontSize: '0.72rem', color: textSub }}>
                                  DNI: <strong>{pDni}</strong>
                                </span>
                              </div>
                            </div>

                            {pCel && (
                              <a
                                href={`https://wa.me/51${String(pCel).replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  background: '#16a34a',
                                  color: '#ffffff',
                                  padding: '4px 8px',
                                  borderRadius: '6px',
                                  fontSize: '0.7rem',
                                  fontWeight: 800,
                                  textDecoration: 'none'
                                }}
                              >
                                <Phone className="w-2.5 h-2.5" />
                                <span>{pCel}</span>
                              </a>
                            )}
                          </div>

                          {/* DETALLE EXPANDIDO */}
                          {isExpanded && (
                            <div style={{
                              marginTop: '6px',
                              paddingTop: '6px',
                              borderTop: `1px dashed ${borderCol}`,
                              fontSize: '0.74rem',
                              color: textSub,
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '4px'
                            }}>
                              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '4px' }}>
                                <div>📱 <strong>WhatsApp:</strong> {pCel || '-'}</div>
                                <div>✉️ <strong>Email:</strong> {assignedPerson['Correo Electrónico'] || assignedPerson.correoElectronico || assignedPerson.email || '-'}</div>
                              </div>
                              <div>📍 Distrito donde vota: <strong>{assignedPerson['Distrito donde Vota'] || assignedPerson.distritoDondeVota || assignedPerson.distrito || '-'}</strong></div>
                              <div>⭐ Experiencia previa: <strong>{assignedPerson['Tiene Experiencia'] || assignedPerson.tieneExperiencia || 'No'}</strong></div>
                              <div>🚗 Movilidad propia: <strong>{assignedPerson['Cuenta con Movilidad'] || assignedPerson.cuentaConMovilidad || 'No'}</strong></div>
                              <div>📅 Compromiso: <strong>{assignedPerson['Se Compromete'] || assignedPerson.seCompromete || 'Sí'}</strong></div>

                              {(isSuperAdmin || isCoordinadorDistrital) && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedPersonero(assignedPerson);
                                  }}
                                  style={{
                                    marginTop: '6px',
                                    padding: '6px 12px',
                                    borderRadius: '6px',
                                    border: '1px solid #0284c7',
                                    background: isDark ? 'rgba(2, 132, 199, 0.15)' : '#e0f2fe',
                                    color: '#0284c7',
                                    fontWeight: 800,
                                    fontSize: '0.74rem',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '5px'
                                  }}
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                  <span>{isSuperAdmin ? 'Modificar Registro Completo' : 'Reasignar Centro / Mesa'}</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

              </div>
            </div>
          </div>
        )}

      {/* Modal Ficha / Edición */}
      {selectedPersonero && (
        <EditAssignmentModal
          personero={selectedPersonero}
          mode={activeTab === 'capacitacion' ? 'capacitacion' : 'full'}
          onClose={() => setSelectedPersonero(null)}
          onSaved={fetchData}
        />
      )}

      {/* Modal Certificado Oficial */}
      {showCertificate && (
        <CertificateModal
          user={user}
          onClose={() => setShowCertificate(false)}
        />
      )}

      {/* Toast Flotante en Tiempo Real para Supera */}
      {canViewAudit && latestToast && (
        <div style={{
          position: 'fixed',
          bottom: isMobile ? '70px' : '24px',
          right: isMobile ? '12px' : '24px',
          left: isMobile ? '12px' : 'auto',
          maxWidth: isMobile ? 'none' : '420px',
          width: isMobile ? 'auto' : '420px',
          background: isDark ? '#0f172a' : '#ffffff',
          border: `2px solid ${latestToast.action === 'DELETE_PERSONERO' ? '#ef4444' : '#0284c7'}`,
          borderRadius: '16px',
          padding: '14px 16px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.35)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          animation: 'fadeIn 0.25s ease-out'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.3rem' }}>{latestToast.action === 'DELETE_PERSONERO' ? '🗑️' : '🔔'}</span>
              <div>
                <strong style={{ fontSize: '0.84rem', color: textTitle, display: 'block' }}>
                  {latestToast.action === 'DELETE_PERSONERO' ? 'Eliminación en Vivo' : 'Modificación en Vivo'}
                </strong>
                <span style={{ fontSize: '0.7rem', color: textSub }}>
                  Por: <strong>{latestToast.details?.author || latestToast.userIdentifier || 'Usuario'}</strong> ({latestToast.details?.authorRole || latestToast.role || 'Rol'})
                </span>
              </div>
            </div>
            <button
              onClick={() => dismissToast(latestToast)}
              style={{ background: 'none', border: 'none', color: textSub, cursor: 'pointer', padding: '2px' }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div style={{ fontSize: '0.76rem', color: textTitle, fontWeight: 600 }}>
            {latestToast.action === 'DELETE_PERSONERO' ? '❌ Se eliminó a: ' : '🎯 Se editó a: '}
            <strong>{latestToast.details?.nombres || latestToast.details?.fullName || 'Personero'}</strong> (DNI: {latestToast.details?.dni || '—'})
          </div>

          {/* Comparación Antes vs Ahora en el Toast */}
          {latestToast.details?.changes && Object.keys(latestToast.details.changes).length > 0 && (
            <div style={{
              background: isDark ? '#1e293b' : '#f8fafc',
              border: `1px solid ${borderCol}`,
              borderRadius: '8px',
              padding: '6px 8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              maxHeight: '120px',
              overflowY: 'auto'
            }}>
              {Object.entries(latestToast.details.changes).map(([fKey, fVal], fIdx) => (
                <div key={fIdx} style={{ fontSize: '0.71rem', display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
                  <strong style={{ color: '#0284c7', textTransform: 'capitalize' }}>{fKey}:</strong>
                  <span style={{ color: '#dc2626', background: '#fee2e2', padding: '1px 4px', borderRadius: '3px', textDecoration: 'line-through' }}>
                    {String(fVal?.antes ?? '—')}
                  </span>
                  <strong style={{ color: '#0284c7' }}>➔</strong>
                  <span style={{ color: '#16a34a', background: '#dcfce7', padding: '1px 4px', borderRadius: '3px', fontWeight: 800 }}>
                    {String(fVal?.despues ?? '—')}
                  </span>
                </div>
              ))}
            </div>
          )}

          {latestToast.action === 'DELETE_PERSONERO' && (
            <div style={{ fontSize: '0.72rem', color: '#b91c1c', background: '#fef2f2', padding: '4px 8px', borderRadius: '6px' }}>
              ⚠️ <strong>Antes:</strong> Registrado en Padrón ➔ <strong>Ahora:</strong> Eliminado definitivamente.
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
            <button
              onClick={() => {
                setActiveTab('auditoria');
                dismissToast(latestToast);
              }}
              style={{
                background: '#0284c7',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '0.72rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Ver en Historial Completo</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardView;
