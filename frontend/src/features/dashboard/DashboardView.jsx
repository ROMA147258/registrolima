import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutGrid, GraduationCap, Cable, RefreshCw, LogOut, Moon, Sun,
  Users, UserCheck, ShieldCheck, CheckCircle2, Car, Calendar, Info,
  FileSpreadsheet, Phone, Search, X, Check, Lock, Video, FileText,
  AlertCircle, ChevronRight, ChevronLeft, Menu, Edit3, Heart, Filter, RotateCcw, School, Layers, Building2,
  Navigation, MapPin, ArrowUpDown
} from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { EditAssignmentModal } from '../../components/modals/EditAssignmentModal.jsx';
import { TrayectoView } from './TrayectoView.jsx';
import {
  DISTRITOS_LIMA, DISTRITO_METAS, ROLES, TOTAL_MESAS_LIMA,
  TOTAL_MESAS_LIMA_METROPOLITANA, TOTAL_LOCALES_LIMA_METROPOLITANA, TOTAL_ELECTORES_LIMA_METROPOLITANA,
  getMesasForLocal, getMesasForDistrito, getElectoresForDistrito, getLocalesCountForDistrito
} from '../../constants/catalogs.js';
import { getLocalesByDistrito } from '../../constants/localesCatalog.js';
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

// Helper de roles (Personero de Mesa, Coordinador de Local, Coordinador Zonal y Coordinador de Distritos)
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
  if (f.includes('local')) {
    return (r.includes('local') || (r.includes('coordinador') && !r.includes('distrito') && !r.includes('distrital') && !r.includes('zonal') && !r.includes('zona'))) && !r.includes('zonal');
  }
  if (f.includes('mesa') || f.includes('personero')) {
    return r.includes('mesa') || (!r.includes('coordinador') && !r.includes('distrito') && !r.includes('distrital') && !r.includes('zonal'));
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
          <span>🗺️ Zona: {list.length} colegios asignados</span>
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
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#15803d' }}>🏫 Con PLV:</span>
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
              <span>🏫 Colegios ({total}):</span>
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
                  Total: <strong>{total} colegios asignados</strong> &bull; DNI: {zonal.dni}
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
  const { user, isCoordinador, isCoordinadorDistrital, isCoordinadorZonal, isCoordinadorLocal, isSuperAdmin, logout } = useAuth();
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

  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'capacitacion', 'sql'
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
  const [exp1, setExp1] = useState('all');
  const [mov1, setMov1] = useState('all');
  const [comp1, setComp1] = useState('all');
  const [zoneType1, setZoneType1] = useState('all'); // 'all', 'multi', 'single', 'unassigned'
  const [sortBySchool1, setSortBySchool1] = useState('zonal_group'); // 'zonal_group', 'personeros_desc', 'personeros_asc', 'alfabetico_asc', 'alfabetico_desc', 'mesas_desc', 'cobertura_desc', 'cobertura_asc'
  const [viewMode1, setViewMode1] = useState('cards'); // 'cards', 'tabla', 'directorio'
  const [selectedSchoolDetail, setSelectedSchoolDetail] = useState(null);
  const [schoolDetailTab, setSchoolDetailTab] = useState('personeros'); // 'personeros' | 'zona'
  const [expandedMesa, setExpandedMesa] = useState(null);

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

    if (isCoordinadorZonal && coordinatorDistrict && coordinatorZonalLocales.length > 0) {
      return allRecords.filter(r => {
        const d = r['Distrito Asignado'] || r['Distrito donde Vota'] || r.distritoAsignado || r.distritoDondeVota;
        const l = r['Local de Votación Asignado'] || r['Local de Votación'] || r.localDeVotacionAsignado || r.localDeVotacion;
        const rol = String(r['Rol a Desempeñar'] || r.rolADesempenar || '').toLowerCase();
        const isSelf = String(r['D.N.I.'] || r['DNI'] || r.dni || '') === String(user?.DNI || user?.dni || user?.['D.N.I.'] || '');
        if (isSelf) return true;
        
        // El Coordinador Zonal NO puede ver nada de Coordinador Distrital ni Superadministrador
        if (rol.includes('distrito') || rol.includes('distrital') || rol.includes('superadmin')) return false;
        if (!matchesDistrict(d, coordinatorDistrict)) return false;
        return coordinatorZonalLocales.some(zLocal => matchesLocal(l, zLocal));
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
  }, [allRecords, isCoordinadorLocal, isCoordinadorZonal, isCoordinadorDistrital, isCoordinador, isSuperAdmin, coordinatorDistrict, coordinatorLocal, coordinatorZonalLocales, user]);

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
  // MONITOREO DISTRITAL: ESTRUCTURA DE COORDINADORES ZONALES DEL DISTRITO
  // =========================================================================
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
          } else if (rRol.includes('mesa') || (!rRol.includes('coordinador') && !rRol.includes('distrit') && !rRol.includes('zonal'))) {
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

  // =========================================================================
  // FILTRADO TAB 1 (PANEL GENERAL)
  // =========================================================================
  const filteredRecords1 = useMemo(() => {
    return records.filter(r => {
      const q = search1.toLowerCase().trim();
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
      const mExp = exp1 === 'all' || (exp1 === 'si' ? getExp(r) === 'Sí' : getExp(r) === 'No');
      const mMov = mov1 === 'all' || (mov1 === 'si' ? getMov(r) === 'Sí' : getMov(r) === 'No');
      const mComp = comp1 === 'all' || (comp1 === 'si' ? getComp(r) === 'Sí' : getComp(r) === 'No');

      return mSearch && mDist && mLocalZonal && mRole && mExp && mMov && mComp;
    });
  }, [records, search1, dist1, localZonal1, role1, exp1, mov1, comp1, coordinatorDistrict, isCoordinadorZonal]);

  // KPIs dinámicos sobre los registros filtrados de Tab 1
  let tab1Total = filteredRecords1.length;
  let tab1CoordsDistrital = 0;
  let tab1CoordsZonal = 0;
  let tab1CoordsLocal = 0;
  let tab1Personeros = 0;
  let tab1Exp = 0;
  let tab1Mov = 0;
  let tab1Comp = 0;

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
    if (getComp(r) === 'Sí') tab1Comp++;
  });

  const isFiltered1 = search1 !== '' || (!isCoordinador && dist1 !== 'all') || (isCoordinadorZonal && localZonal1 !== 'all') || role1 !== 'all' || exp1 !== 'all' || mov1 !== 'all' || comp1 !== 'all';

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
          schoolMap.set(norm, { nombre: loc, distrito: dist, direccion: '', mesas: 1, personeros: [] });
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
      const entry = schoolMap.get(normLocal);
      const rawSchool = entry || { nombre: coordinatorLocal, distrito: coordinatorDistrict || '', direccion: '', mesas: 1, personeros: [] };
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

    // Mapear todas las entradas del mapa a objetos school enriquecidos
    const mapped = Array.from(schoolMap.values()).map(school => {
      const schoolPersoneros = school.personeros;
      const distritoNombre = school.distrito || (dist1 !== 'all' ? dist1 : 'Lima');
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

      const totalMesas = school.mesas || Math.max(1, Math.round((school.electores || 300) / 300));
      const asignadas = mesaPersoneros.length;
      const cobertura = totalMesas > 0 ? Math.min(100, Math.round((asignadas / totalMesas) * 100)) : 0;
      const totalElectores = school.electores || totalMesas * 300;

      let statusLabel = 'Crítico';
      let statusColor = '#ef4444';
      if (cobertura >= 80) { statusLabel = 'Completo'; statusColor = '#10b981'; }
      else if (cobertura >= 50) { statusLabel = 'Regular'; statusColor = '#f59e0b'; }

      return {
        nombre: school.nombre,
        distrito: distritoNombre,
        direccion: school.direccion || '',
        mesas: school.mesas,
        electores: school.electores,
        totalMesas, asignadas, cobertura, totalElectores, statusLabel, statusColor,
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
    const result = withPersoneros.length > 0 ? withPersoneros : filtered.slice(0, 20);

    return result.sort((a, b) => (b.allPersoneros.length - a.allPersoneros.length) || (b.asignadas - a.asignadas) || a.nombre.localeCompare(b.nombre));
  }, [records, dist1, coordinatorDistrict, isCoordinadorLocal, coordinatorLocal, isCoordinadorZonal, coordinatorZonalLocales]);


  // Contadores por tipo de asignación zonal
  const countMultiZoneSchools = useMemo(() => districtSchools.filter(s => s.zonalTotalColegios > 1).length, [districtSchools]);
  const countSingleZoneSchools = useMemo(() => districtSchools.filter(s => s.zonalTotalColegios === 1).length, [districtSchools]);
  const countUnassignedZoneSchools = useMemo(() => districtSchools.filter(s => !s.zonalPersonero).length, [districtSchools]);

  const filteredDistrictSchools = useMemo(() => {
    let list = districtSchools;

    // 1. Filtrado por Tipo de Zona (Multi-Colegio, Único, Sin Zonal)
    if (zoneType1 === 'multi') {
      list = list.filter(s => s.zonalTotalColegios > 1);
    } else if (zoneType1 === 'single') {
      list = list.filter(s => s.zonalTotalColegios === 1);
    } else if (zoneType1 === 'unassigned') {
      list = list.filter(s => !s.zonalPersonero);
    }

    // 2. Si hay filtros de personeros activos (Rol, Experiencia, Movilidad, Compromiso)
    const hasPersoneroFilters = role1 !== 'all' || exp1 !== 'all' || mov1 !== 'all' || comp1 !== 'all';
    if (hasPersoneroFilters) {
      const validDnis = new Set(filteredRecords1.map(r => String(r['D.N.I.'] || r['DNI'] || r.dni || '')));
      list = list.filter(s => (s.allPersoneros || []).some(p => validDnis.has(String(p['D.N.I.'] || p['DNI'] || p.dni || ''))));
    }

    // 3. Filtrado por Búsqueda de Texto
    if (search1.trim()) {
      const term = search1.toLowerCase().trim();
      const validDnis = new Set(filteredRecords1.map(r => String(r['D.N.I.'] || r['DNI'] || r.dni || '')));

      list = list.filter(s => {
        const matchSchoolName = s.nombre && s.nombre.toLowerCase().includes(term);
        const matchAddress = s.direccion && s.direccion.toLowerCase().includes(term);
        const matchDistrict = s.distrito && s.distrito.toLowerCase().includes(term);
        const matchZonalName = s.zonalPersonero && (String(s.zonalPersonero['Nombres y Apellidos'] || s.zonalPersonero.nombresApellidos || '').toLowerCase().includes(term));
        const matchPlvName = s.plvPersonero && (String(s.plvPersonero['Nombres y Apellidos'] || s.plvPersonero.nombresApellidos || '').toLowerCase().includes(term));
        const matchPersoneros = (s.allPersoneros || []).some(p => validDnis.has(String(p['D.N.I.'] || p['DNI'] || p.dni || '')));
        return matchSchoolName || matchAddress || matchDistrict || matchZonalName || matchPlvName || matchPersoneros;
      });
    }

    // 4. Ordenamiento
    const sorted = [...list].sort((a, b) => {
      if (sortBySchool1 === 'zonal_group') {
        const nameA = a.zonalPersonero ? (a.zonalPersonero['Nombres y Apellidos'] || a.zonalPersonero.nombresApellidos || '').trim() : 'zzzz_sin_zona';
        const nameB = b.zonalPersonero ? (b.zonalPersonero['Nombres y Apellidos'] || b.zonalPersonero.nombresApellidos || '').trim() : 'zzzz_sin_zona';
        const cmpZ = nameA.localeCompare(nameB);
        if (cmpZ !== 0) return cmpZ;
        return a.nombre.localeCompare(b.nombre);
      }
      if (sortBySchool1 === 'alfabetico_asc') {
        return a.nombre.localeCompare(b.nombre);
      }
      if (sortBySchool1 === 'alfabetico_desc') {
        return b.nombre.localeCompare(a.nombre);
      }
      if (sortBySchool1 === 'personeros_asc') {
        return (a.allPersoneros.length - b.allPersoneros.length) || a.nombre.localeCompare(b.nombre);
      }
      if (sortBySchool1 === 'mesas_desc') {
        return ((b.totalMesas || 0) - (a.totalMesas || 0)) || (b.allPersoneros.length - a.allPersoneros.length);
      }
      if (sortBySchool1 === 'cobertura_desc') {
        return (b.cobertura - a.cobertura) || (b.allPersoneros.length - a.allPersoneros.length);
      }
      if (sortBySchool1 === 'cobertura_asc') {
        return (a.cobertura - b.cobertura) || (a.allPersoneros.length - a.allPersoneros.length);
      }
      // 'personeros_desc'
      return (b.allPersoneros.length - a.allPersoneros.length) || (b.asignadas - a.asignadas) || a.nombre.localeCompare(b.nombre);
    });

    return sorted;
  }, [districtSchools, filteredRecords1, zoneType1, search1, role1, exp1, mov1, comp1, sortBySchool1]);
  // Ajuste de metas por búsqueda activa (ahora que filteredDistrictSchools está disponible)
  if (search1.trim() && filteredDistrictSchools.length > 0 && filteredDistrictSchools.length < targetLocales) {
    targetLocales = filteredDistrictSchools.length;
    targetMesas = filteredDistrictSchools.reduce((acc, s) => acc + (s.totalMesas || 0), 0) || 1;
    targetElectores = filteredDistrictSchools.reduce((acc, s) => acc + (s.totalElectores || 0), 0) || (targetMesas * 300);
    scopeLabel = filteredDistrictSchools.length === 1 ? filteredDistrictSchools[0].nombre : `${filteredDistrictSchools.length} Colegios`;
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
                          <>Estructura de <strong>{coordinatorDistrict || dist1}</strong> &bull; <strong>{districtDistritalOverview.length} Coordinador Distrital</strong> &bull; <strong>{districtZonalesOverview.length} Zonales</strong> &bull; <strong>{countLocalesConPLV} Locales con PLV</strong></>
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

                      {/* 2. Coordinadores Zonales de este Distrito */}
                      {districtZonalesOverview.length > 0 ? (
                        <div>
                          <div style={{ fontSize: '0.84rem', fontWeight: 800, color: textTitle, marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <MapPin className="w-4 h-4 text-purple-500" />
                              <span>Coordinadores Zonales del Distrito ({districtZonalesOverview.length})</span>
                            </div>
                            <span style={{ fontSize: '0.72rem', color: textSub, fontWeight: 600 }}>
                              ↔ Desliza para ver todos
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
                                  width: isMobile ? '290px' : '340px',
                                  maxWidth: '360px',
                                  display: 'flex'
                                }}
                              >
                                <div style={{ width: '100%' }}>
                                  <ZonalOverviewCard
                                    zonal={zonal}
                                    isDark={isDark}
                                    borderCol={borderCol}
                                    onEdit={setSelectedPersonero}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div style={{ padding: '12px 14px', background: isDark ? 'rgba(234, 179, 8, 0.1)' : '#fefce8', border: '1px solid #fde047', borderRadius: '10px', color: isDark ? '#facc15' : '#a16207', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          <span>Aún no hay Coordinadores Zonales registrados para el distrito de {coordinatorDistrict || dist1}.</span>
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
                    </div>
                  )}
                </div>
              )}

              {/* SECCIÓN EXCLUSIVA DE MONITOREO ZONAL: COLEGIOS Y COORDINADORES LOCALES DE SU ZONA */}
              {isCoordinadorZonal && (
                <div style={{
                  background: bgCard,
                  border: `1.5px solid ${isDark ? '#0369a1' : '#bae6fd'}`,
                  borderRadius: '16px',
                  padding: '20px',
                  marginBottom: '20px',
                  boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.3)' : '0 4px 20px rgba(2, 132, 199, 0.08)'
                }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <div style={{ background: '#0284c7', color: '#fff', padding: '4px 8px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.76rem', fontWeight: 800 }}>
                          <Layers className="w-4 h-4" />
                          <span>ZONA ASIGNADA</span>
                        </div>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: textTitle, margin: 0 }}>
                          Colegios y Coordinadores Locales de mi Zona
                        </h2>
                      </div>
                      <p style={{ fontSize: '0.82rem', color: textSub, margin: 0 }}>
                        Distrito de <strong>{coordinatorDistrict}</strong> &bull; Monitoreo de <strong>{coordinatorZonalLocales.length} colegios asignados</strong>
                      </p>
                    </div>
                  </div>

                  {/* Tarjetas de Colegios de la Zona con sus Coordinadores Locales (Uno al lado del otro en carrusel horizontal) */}
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
                    {zonalSchoolsOverview.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          flex: '0 0 auto',
                          width: isMobile ? '290px' : '340px',
                          maxWidth: '360px',
                          background: isDark ? '#1e293b' : '#f8fafc',
                          border: `1px solid ${borderCol}`,
                          borderRadius: '12px',
                          padding: '14px 16px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.82rem', flexShrink: 0 }}>
                              {idx + 1}
                            </div>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '2px' }}>
                                <strong style={{ fontSize: '0.9rem', color: textTitle, lineHeight: 1.25 }}>
                                  {item.schoolName}
                                </strong>
                                {item.coordinadoresLocales.length > 0 ? (
                                  <span style={{
                                    background: isDark ? 'rgba(2, 132, 199, 0.2)' : '#e0f2fe',
                                    color: '#0284c7',
                                    fontSize: '0.74rem',
                                    fontWeight: 800,
                                    padding: '2px 8px',
                                    borderRadius: '6px',
                                    border: '1px solid #bae6fd',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}>
                                    👤 Personero Local: {item.coordinadoresLocales[0]['Nombres y Apellidos'] || item.coordinadoresLocales[0].nombresApellidos}
                                  </span>
                                ) : (
                                  <span style={{
                                    background: isDark ? 'rgba(234, 179, 8, 0.15)' : '#fef3c7',
                                    color: '#d97706',
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    padding: '2px 6px',
                                    borderRadius: '6px',
                                    border: '1px solid #fde68a'
                                  }}>
                                    ⚠️ Pendiente de Asignación
                                  </span>
                                )}
                              </div>
                              <span style={{ fontSize: '0.74rem', color: textSub }}>
                                <strong>{item.personerosCount}</strong> / <strong>{item.mesasColegio || '-'}</strong> mesas cubiertas &bull; {item.accreditedCount} acreditados
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Coordinadores Locales de este Colegio */}
                        <div style={{ borderTop: `1px dashed ${borderCol}`, paddingTop: '8px' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
                            Personero(s) de Local de este colegio:
                          </span>

                          {item.coordinadoresLocales.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              {item.coordinadoresLocales.map((coord, cIdx) => {
                                const cName = coord['Nombres y Apellidos'] || coord.nombresApellidos || 'Coordinador';
                                const cDni = coord['D.N.I.'] || coord.dni || '--------';
                                const cCel = coord['Celular'] || coord.celular || '';
                                const cPreg = String(coord['Preguntas'] || coord.preguntas || '').toLowerCase();
                                const cCred = String(coord['Credenciales'] || coord.credenciales || '').toLowerCase();
                                const isAcred = cCred === 'confirmado' || cPreg.includes('aprob');

                                return (
                                  <div
                                    key={cIdx}
                                    style={{
                                      background: isDark ? '#0f172a' : '#ffffff',
                                      border: '1px solid #cbd5e1',
                                      borderRadius: '8px',
                                      padding: '8px 10px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      gap: '8px'
                                    }}
                                  >
                                    <div>
                                      <div style={{ fontSize: '0.82rem', fontWeight: 800, color: textTitle }}>
                                        {cName}
                                      </div>
                                      <div style={{ fontSize: '0.74rem', color: textSub, display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <span>DNI: <strong>{cDni}</strong></span>
                                        {cCel && <span>Cel: <strong>{cCel}</strong></span>}
                                      </div>
                                    </div>
                                    <span style={{
                                      padding: '3px 8px',
                                      borderRadius: '6px',
                                      fontSize: '0.72rem',
                                      fontWeight: 800,
                                      background: isAcred ? '#dcfce7' : '#fef9c3',
                                      color: isAcred ? '#166534' : '#854d0e',
                                      whiteSpace: 'nowrap'
                                    }}>
                                      {isAcred ? '✅ Acreditado' : '⏳ En Proceso'}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div style={{
                              background: isDark ? 'rgba(234, 179, 8, 0.1)' : '#fefce8',
                              border: '1px solid #fde047',
                              borderRadius: '8px',
                              padding: '8px 12px',
                              fontSize: '0.78rem',
                              color: isDark ? '#facc15' : '#a16207',
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}>
                              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                              <span>Aún no hay Personero de Local de Votación registrado para este colegio</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECCIÓN EXCLUSIVA DE MONITOREO LOCAL (PLV): MI LOCAL DE VOTACIÓN Y PERSONEROS DE MESA */}
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
                          <span>MI COLEGIO ASIGNADO</span>
                        </div>
                        <h2 style={{ fontSize: isMobile ? '1.05rem' : '1.25rem', fontWeight: 900, color: textTitle, margin: 0 }}>
                          {coordinatorLocal || 'Local de Votación'}
                        </h2>
                      </div>
                      <p style={{ fontSize: '0.82rem', color: textSub, margin: 0 }}>
                        Distrito de <strong>{coordinatorDistrict}</strong> &bull; Personero de Local: <strong>{user?.nombresApellidos || user?.['Nombres y Apellidos'] || 'Tú'}</strong>
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

                  {/* Filtro Colegios para Coordinador Zonal */}
                  {isCoordinadorZonal && coordinatorZonalLocales.length > 0 && (
                    <select
                      value={localZonal1}
                      onChange={(e) => setLocalZonal1(e.target.value)}
                      style={{ padding: '8px 10px', borderRadius: '8px', border: localZonal1 !== 'all' ? '1.5px solid #0284c7' : `1px solid ${borderCol}`, fontSize: '0.82rem', background: localZonal1 !== 'all' ? (isDark ? '#1e293b' : '#f0f9ff') : bgInput, color: textTitle, fontWeight: localZonal1 !== 'all' ? 700 : 500, flex: isMobile ? '1 1 calc(50% - 4px)' : 'none', minWidth: 0 }}
                    >
                      <option value="all">🏫 Mis Colegios ({coordinatorZonalLocales.length})</option>
                      {coordinatorZonalLocales.map((school, sIdx) => (
                        <option key={sIdx} value={school}>{school}</option>
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
                    <option value="Personero de Mesa">Personero Mesa</option>
                    {!isCoordinadorLocal && <option value="Personero de Local de Votación">Personero Local (PLV)</option>}
                    {(isSuperAdmin || isCoordinadorDistrital) && <option value="Coordinador Zonal">Coord. Zonal</option>}
                    {isSuperAdmin && <option value="Coordinador Distrital">Coord. Distrital</option>}
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

                  {/* Filtro Compromiso */}
                  <select
                    value={comp1}
                    onChange={(e) => setComp1(e.target.value)}
                    style={{ padding: '8px 10px', borderRadius: '8px', border: comp1 !== 'all' ? '1.5px solid #0284c7' : `1px solid ${borderCol}`, fontSize: '0.82rem', background: comp1 !== 'all' ? (isDark ? '#1e293b' : '#f0f9ff') : bgInput, color: textTitle, fontWeight: comp1 !== 'all' ? 700 : 500, flex: isMobile ? '1 1 calc(50% - 4px)' : 'none', minWidth: 0 }}
                  >
                    <option value="all">📅 Comp: Todos</option>
                    <option value="si">Compromiso: Sí</option>
                    <option value="no">Compromiso: No</option>
                  </select>

                  {/* Botón Limpiar Filtros */}
                  {isFiltered1 && (
                    <button
                      onClick={() => { setSearch1(''); setDist1(coordinatorDistrict || 'all'); setRole1('all'); setExp1('all'); setMov1('all'); setComp1('all'); }}
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

                {/* Resumen del Filtro Activo y Cantidad Encontrada */}
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
                      <span>{tab1Total} {tab1Total === 1 ? 'personero' : 'personeros'}</span>
                    </div>

                    {dist1 !== 'all' && (
                      <span style={{ background: isDark ? '#1e293b' : '#f1f5f9', padding: '3px 8px', borderRadius: '6px', border: `1px solid ${borderCol}` }}>
                        📍 {dist1} {!coordinatorDistrict && <strong style={{ color: '#ef4444', cursor: 'pointer', marginLeft: '4px' }} onClick={() => setDist1('all')}>×</strong>}
                      </span>
                    )}

                    {role1 !== 'all' && (
                      <span style={{ background: isDark ? '#1e293b' : '#f1f5f9', padding: '3px 8px', borderRadius: '6px', border: `1px solid ${borderCol}` }}>
                        🛡️ {role1} <strong style={{ color: '#ef4444', cursor: 'pointer', marginLeft: '4px' }} onClick={() => setRole1('all')}>×</strong>
                      </span>
                    )}

                    {exp1 !== 'all' && (
                      <span style={{ background: isDark ? '#1e293b' : '#f1f5f9', padding: '3px 8px', borderRadius: '6px', border: `1px solid ${borderCol}` }}>
                        ⭐ Exp: {exp1 === 'si' ? 'Sí' : 'No'} <strong style={{ color: '#ef4444', cursor: 'pointer', marginLeft: '4px' }} onClick={() => setExp1('all')}>×</strong>
                      </span>
                    )}

                    {mov1 !== 'all' && (
                      <span style={{ background: isDark ? '#1e293b' : '#f1f5f9', padding: '3px 8px', borderRadius: '6px', border: `1px solid ${borderCol}` }}>
                        🚗 Mov: {mov1 === 'si' ? 'Sí' : 'No'} <strong style={{ color: '#ef4444', cursor: 'pointer', marginLeft: '4px' }} onClick={() => setMov1('all')}>×</strong>
                      </span>
                    )}

                    {comp1 !== 'all' && (
                      <span style={{ background: isDark ? '#1e293b' : '#f1f5f9', padding: '3px 8px', borderRadius: '6px', border: `1px solid ${borderCol}` }}>
                        📅 Comp: {comp1 === 'si' ? 'Sí' : 'No'} <strong style={{ color: '#ef4444', cursor: 'pointer', marginLeft: '4px' }} onClick={() => setComp1('all')}>×</strong>
                      </span>
                    )}
                  </div>

                  <span style={{ fontSize: '0.74rem' }}>
                    Total {isCoordinadorLocal ? 'en colegio' : (coordinatorDistrict ? 'en distrito' : 'padrón')}: <strong>{records.length}</strong>
                  </span>
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
                  
                  {/* KPI 1 - Personeros Registrados */}
                  <div style={{ background: bgCard, border: `1px solid ${borderCol}`, borderLeft: '4px solid #0284c7', borderRadius: '10px', padding: isMobile ? '10px 12px' : '14px', minWidth: 0, transition: 'all 0.3s ease' }}>
                    <div style={{ fontSize: '0.66rem', fontWeight: 800, color: textSub }}>PERSONEROS REGISTRADOS</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '4px 0' }}>
                      <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: isDark ? 'rgba(2, 132, 199, 0.2)' : '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Users className="w-3.5 h-3.5" /></div>
                      <span style={{ fontSize: isMobile ? '1.2rem' : '1.45rem', fontWeight: 900, color: textTitle, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tab1Personeros.toLocaleString()}</span>
                    </div>
                    <div style={{ fontSize: '0.65rem', color: textSub }}>
                      {isCoordinadorLocal ? 'En tu colegio' : (isCoordinadorZonal ? 'En tu zona' : `En ${scopeLabel}`)}
                    </div>
                  </div>

                  {/* KPI 2 - Locales de Votación (No relevante para Coord Local) */}
                  {!isCoordinadorLocal && (
                    <div style={{ background: bgCard, border: `1px solid ${borderCol}`, borderLeft: '4px solid #0ea5e9', borderRadius: '10px', padding: isMobile ? '10px 12px' : '14px', minWidth: 0, transition: 'all 0.3s ease' }}>
                      <div style={{ fontSize: '0.66rem', fontWeight: 800, color: textSub }}>
                        {isCoordinadorZonal ? 'COLEGIOS EN TU ZONA' : 'LOCALES REGISTRADOS'}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '4px 0' }}>
                        <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: isDark ? 'rgba(14, 165, 233, 0.2)' : '#e0f2fe', color: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><School className="w-3.5 h-3.5" /></div>
                        <span style={{ fontSize: isMobile ? '1.2rem' : '1.45rem', fontWeight: 900, color: textTitle, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{districtSchools.length.toLocaleString()}</span>
                      </div>
                      <div style={{ fontSize: '0.65rem', color: textSub }}>
                        {isCoordinadorZonal ? `${coordinatorZonalLocales.length} colegios asignados` : 'Centros de Votación'}
                      </div>
                    </div>
                  )}

                  {/* KPI 3 - Personeros de Local (PLV) (No relevante para Coord Local) */}
                  {!isCoordinadorLocal && (
                    <div style={{ background: bgCard, border: `1px solid ${borderCol}`, borderLeft: '4px solid #f59e0b', borderRadius: '10px', padding: isMobile ? '10px 12px' : '14px', minWidth: 0, transition: 'all 0.3s ease' }}>
                      <div style={{ fontSize: '0.66rem', fontWeight: 800, color: textSub }}>LOCALES CON PLV</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '4px 0' }}>
                        <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: isDark ? 'rgba(245, 158, 11, 0.2)' : '#fef3c7', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><UserCheck className="w-3.5 h-3.5" /></div>
                        <span style={{ fontSize: isMobile ? '1.2rem' : '1.45rem', fontWeight: 900, color: textTitle, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{countLocalesConPLV}</span>
                      </div>
                      <div style={{ fontSize: '0.65rem', color: textSub }}>Personeros de Local Asignados</div>
                    </div>
                  )}

                  {/* KPI 4 - Coordinadores Zonales (Visible para Superadmin y Coordinador Distrital) */}
                  {(isSuperAdmin || isCoordinadorDistrital) && (
                    <div style={{ background: bgCard, border: `1px solid ${borderCol}`, borderLeft: '4px solid #8b5cf6', borderRadius: '10px', padding: isMobile ? '10px 12px' : '14px', minWidth: 0, transition: 'all 0.3s ease' }}>
                      <div style={{ fontSize: '0.66rem', fontWeight: 800, color: textSub }}>COORD. ZONALES</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '4px 0' }}>
                        <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: isDark ? 'rgba(139, 92, 246, 0.2)' : '#ede9fe', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><MapPin className="w-3.5 h-3.5" /></div>
                        <span style={{ fontSize: isMobile ? '1.2rem' : '1.45rem', fontWeight: 900, color: textTitle, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tab1CoordsZonal}</span>
                      </div>
                      <div style={{ fontSize: '0.65rem', color: textSub }}>Zonales en {scopeLabel}</div>
                    </div>
                  )}

                  {/* KPI 5 - Coordinadores Distritales (Visible para Superadmin y Coordinador Distrital) */}
                  {(isSuperAdmin || isCoordinadorDistrital) && (
                    <div style={{ background: bgCard, border: `1px solid ${borderCol}`, borderLeft: '4px solid #10b981', borderRadius: '10px', padding: isMobile ? '10px 12px' : '14px', minWidth: 0, transition: 'all 0.3s ease' }}>
                      <div style={{ fontSize: '0.66rem', fontWeight: 800, color: textSub }}>COORD. DISTRITALES</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '4px 0' }}>
                        <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: isDark ? 'rgba(16, 185, 129, 0.2)' : '#dcfce7', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><ShieldCheck className="w-3.5 h-3.5" /></div>
                        <span style={{ fontSize: isMobile ? '1.2rem' : '1.45rem', fontWeight: 900, color: textTitle, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tab1CoordsDistrital}</span>
                      </div>
                      <div style={{ fontSize: '0.65rem', color: textSub }}>Distritales Activos</div>
                    </div>
                  )}

                </div>
              </div>

              {/* BOTONES DE VISTA DE TAB 1: [ Cards ] [ Tabla Padrón ] [ Directorio ] [ Excel ] */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setViewMode1('cards')}
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

                <a
                  href={api.getExportUrl('xlsx', coordinatorDistrict || (dist1 !== 'all' ? dist1 : ''))}
                  download
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: '8px',
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
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Descargar Excel</span>
                </a>
              </div>

              {/* VISTA 1: CARDS DE COLEGIOS Y MESAS */}
              {viewMode1 === 'cards' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Centros de Votación */}
                  <div>
                    {/* Barra de Filtro Rápido por Tipo de Zona y Ordenamiento */}
                    <div style={{
                      display: 'flex',
                      flexDirection: isMobile ? 'column' : 'row',
                      alignItems: isMobile ? 'stretch' : 'center',
                      justifyContent: 'space-between',
                      gap: isMobile ? '10px' : '12px',
                      marginBottom: '14px',
                      background: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc',
                      padding: isMobile ? '10px 12px' : '10px 14px',
                      borderRadius: '12px',
                      border: `1px solid ${borderCol}`
                    }}>
                      {!isCoordinadorLocal ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '6px' : '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: textSub, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Filter className="w-3.5 h-3.5 text-sky-500" />
                            <span>Tipo:</span>
                          </span>

                          {/* Botón: Todos */}
                          <button
                            type="button"
                            onClick={() => setZoneType1('all')}
                            style={{
                              padding: isMobile ? '4px 10px' : '5px 12px',
                              borderRadius: '20px',
                              border: zoneType1 === 'all' ? '2px solid #0284c7' : `1px solid ${borderCol}`,
                              background: zoneType1 === 'all' ? (isDark ? 'rgba(2, 132, 199, 0.25)' : '#e0f2fe') : (isDark ? '#1e293b' : '#ffffff'),
                              color: zoneType1 === 'all' ? '#0284c7' : textTitle,
                              fontSize: isMobile ? '0.71rem' : '0.74rem',
                              fontWeight: 800,
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            Todos ({districtSchools.length})
                          </button>

                          {/* Botón: Zonas Multi-Colegio */}
                          <button
                            type="button"
                            onClick={() => setZoneType1('multi')}
                            style={{
                              padding: isMobile ? '4px 10px' : '5px 12px',
                              borderRadius: '20px',
                              border: zoneType1 === 'multi' ? '2px solid #8b5cf6' : `1px solid ${borderCol}`,
                              background: zoneType1 === 'multi' ? (isDark ? 'rgba(139, 92, 246, 0.25)' : '#ede9fe') : (isDark ? '#1e293b' : '#ffffff'),
                              color: zoneType1 === 'multi' ? '#7c3aed' : textTitle,
                              fontSize: isMobile ? '0.71rem' : '0.74rem',
                              fontWeight: 800,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <span>🗺️ Multi-Colegio</span>
                            <span style={{ background: '#8b5cf6', color: '#fff', padding: '1px 6px', borderRadius: '10px', fontSize: '0.66rem', fontWeight: 900 }}>
                              {countMultiZoneSchools}
                            </span>
                          </button>

                          {/* Botón: Colegios Únicos */}
                          <button
                            type="button"
                            onClick={() => setZoneType1('single')}
                            style={{
                              padding: isMobile ? '4px 10px' : '5px 12px',
                              borderRadius: '20px',
                              border: zoneType1 === 'single' ? '2px solid #10b981' : `1px solid ${borderCol}`,
                              background: zoneType1 === 'single' ? (isDark ? 'rgba(16, 185, 129, 0.25)' : '#dcfce7') : (isDark ? '#1e293b' : '#ffffff'),
                              color: zoneType1 === 'single' ? '#15803d' : textTitle,
                              fontSize: isMobile ? '0.71rem' : '0.74rem',
                              fontWeight: 800,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <span>🏫 Únicos</span>
                            <span style={{ background: '#10b981', color: '#fff', padding: '1px 6px', borderRadius: '10px', fontSize: '0.66rem', fontWeight: 900 }}>
                              {countSingleZoneSchools}
                            </span>
                          </button>

                          {/* Botón: Sin Coordinador Zonal */}
                          {countUnassignedZoneSchools > 0 && (
                            <button
                              type="button"
                              onClick={() => setZoneType1('unassigned')}
                              style={{
                                padding: isMobile ? '4px 10px' : '5px 12px',
                                borderRadius: '20px',
                                border: zoneType1 === 'unassigned' ? '2px solid #f59e0b' : `1px solid ${borderCol}`,
                                background: zoneType1 === 'unassigned' ? (isDark ? 'rgba(245, 158, 11, 0.25)' : '#fef3c7') : (isDark ? '#1e293b' : '#ffffff'),
                                color: zoneType1 === 'unassigned' ? '#d97706' : textTitle,
                                fontSize: isMobile ? '0.71rem' : '0.74rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <span>⚠️ Sin Zonal</span>
                              <span style={{ background: '#f59e0b', color: '#fff', padding: '1px 6px', borderRadius: '10px', fontSize: '0.66rem', fontWeight: 900 }}>
                                {countUnassignedZoneSchools}
                              </span>
                            </button>
                          )}
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

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: isMobile ? 'space-between' : 'flex-end', width: isMobile ? '100%' : 'auto', gap: isMobile ? '8px' : '12px', flexWrap: 'wrap' }}>
                        {/* Selector de Ordenamiento */}
                        {!isCoordinadorLocal && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: isMobile ? 1 : 'none' }}>
                            <span style={{ fontSize: '0.76rem', fontWeight: 800, color: textSub, display: 'flex', alignItems: 'center', gap: '3px', whiteSpace: 'nowrap' }}>
                              <ArrowUpDown className="w-3.5 h-3.5 text-amber-500" />
                              <span style={{ display: isMobile ? 'none' : 'inline' }}>Ordenar por:</span>
                            </span>
                            <select
                              value={sortBySchool1}
                              onChange={(e) => setSortBySchool1(e.target.value)}
                              style={{
                                padding: '5px 8px',
                                borderRadius: '8px',
                                border: `1px solid ${borderCol}`,
                                background: isDark ? '#1e293b' : '#ffffff',
                                color: textTitle,
                                fontSize: '0.74rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                outline: 'none',
                                width: isMobile ? '100%' : 'auto'
                              }}
                            >
                              <option value="zonal_group">🗺️ Agrupados por Zona / Coordinador (Juntos)</option>
                              <option value="personeros_desc">👥 Mayor cantidad de Personeros</option>
                              <option value="personeros_asc">👥 Menor cantidad de Personeros</option>
                              <option value="alfabetico_asc">🔤 Nombre Colegio (A - Z)</option>
                              <option value="alfabetico_desc">🔤 Nombre Colegio (Z - A)</option>
                              <option value="mesas_desc">🗳️ Mayor cantidad de Mesas</option>
                              <option value="cobertura_desc">📈 Mayor Cobertura (%)</option>
                              <option value="cobertura_asc">📉 Menor Cobertura (%)</option>
                            </select>
                          </div>
                        )}

                        <div style={{ fontSize: '0.74rem', color: textSub, whiteSpace: 'nowrap' }}>
                          <strong>{filteredDistrictSchools.length}</strong> {filteredDistrictSchools.length === 1 ? 'centro' : 'centros'}
                        </div>
                      </div>
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
                          const isMulti = school.zonalTotalColegios > 1;
                          const isSingle = school.zonalTotalColegios === 1;
                          const isUnassigned = !school.zonalPersonero;

                          const borderColorLeft = isCoordinadorLocal ? '#10b981' : (isMulti ? '#8b5cf6' : (isSingle ? '#10b981' : '#f59e0b'));

                          const prevSchool = sIdx > 0 ? filteredDistrictSchools[sIdx - 1] : null;
                          const prevZonalName = prevSchool?.zonalPersonero ? (prevSchool.zonalPersonero['Nombres y Apellidos'] || prevSchool.zonalPersonero.nombresApellidos || '').trim() : 'sin_zona';
                          const currentZonalName = school.zonalPersonero ? (school.zonalPersonero['Nombres y Apellidos'] || school.zonalPersonero.nombresApellidos || '').trim() : 'sin_zona';
                          const isMultiGroup = (school.zonalTotalColegios || 0) > 1;
                          const isNewGroup = !isCoordinadorLocal && isMultiGroup && sortBySchool1 === 'zonal_group' && (sIdx === 0 || prevZonalName !== currentZonalName);

                          return (
                            <React.Fragment key={`school-frag-${sIdx}`}>
                              {/* Separador visual de Zona Multi-Colegio (solo cuando agrupa más de 1 colegio) */}
                              {isNewGroup && (
                                <div
                                  style={{
                                    gridColumn: '1 / -1',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '8px 14px',
                                    background: isDark ? 'rgba(139, 92, 246, 0.12)' : '#f5f3ff',
                                    border: '1px solid #c4b5fd',
                                    borderRadius: '10px',
                                    marginTop: sIdx > 0 ? '12px' : '0',
                                    marginBottom: '2px',
                                    flexWrap: 'wrap',
                                    gap: '8px'
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                                    <span style={{ fontSize: '1.1rem' }}>🗺️</span>
                                    <div style={{ minWidth: 0 }}>
                                      <strong style={{ fontSize: '0.86rem', color: isDark ? '#ddd6fe' : '#5b21b6' }}>
                                        {school.zonalPersonero ? `Zona Multi-Colegio: ${school.zonalPersonero['Nombres y Apellidos'] || school.zonalPersonero.nombresApellidos}` : 'Centros sin Coordinador Zonal Asignado'}
                                      </strong>
                                      <span style={{ fontSize: '0.73rem', color: textSub, marginLeft: '8px' }}>
                                        ({school.zonalTotalColegios} colegios a cargo)
                                      </span>
                                    </div>
                                  </div>

                                  {school.zonalPersonero && (school.zonalPersonero['Celular'] || school.zonalPersonero.celular) && (
                                    <a
                                      href={`https://wa.me/51${String(school.zonalPersonero['Celular'] || school.zonalPersonero.celular).replace(/\D/g, '')}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        background: '#16a34a',
                                        color: '#fff',
                                        padding: '3px 8px',
                                        borderRadius: '6px',
                                        fontSize: '0.7rem',
                                        fontWeight: 800,
                                        textDecoration: 'none'
                                      }}
                                    >
                                      <Phone className="w-2.5 h-2.5" />
                                      <span>WhatsApp Zonal</span>
                                    </a>
                                  )}
                                </div>
                              )}

                              <div
                                className="animate-filter-in"
                                onClick={() => setSelectedSchoolDetail(school)}
                                style={{
                                  background: bgCard,
                                  border: `1px solid ${borderCol}`,
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
                                {/* Tags superiores: Distrito + Indicador Claro de Zona */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', flexWrap: 'wrap' }}>
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
                                      🏫 Tu Colegio Asignado
                                    </span>
                                  ) : isMulti ? (
                                    <span style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      background: isDark ? 'rgba(139, 92, 246, 0.2)' : '#ede9fe',
                                      color: '#6d28d9',
                                      border: '1px solid #c4b5fd',
                                      padding: '2px 8px',
                                      borderRadius: '6px',
                                      fontSize: '0.71rem',
                                      fontWeight: 900
                                    }}>
                                      🗺️ Zona Multi-Colegio ({school.zonalTotalColegios} col.)
                                    </span>
                                  ) : isSingle ? (
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
                                      🏫 Colegio Único
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
                                      ⚠️ Sin Coord. Zonal
                                    </span>
                                  )}
                                </div>

                                {/* Cabecera del Card: Nombre del Colegio */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', minWidth: 0 }}>
                                    <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>🏫</span>
                                    <strong style={{ fontSize: '0.94rem', fontWeight: 900, color: textTitle, lineHeight: 1.25 }}>
                                      {school.nombre}
                                    </strong>
                                  </div>

                                  {/* Badge Registrados */}
                                  <div style={{
                                    background: '#10b981',
                                    color: '#ffffff',
                                    padding: '3px 8px',
                                    borderRadius: '16px',
                                    fontSize: '0.72rem',
                                    fontWeight: 900,
                                    flexShrink: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}>
                                    <span>👥 {school.asignadas} {school.asignadas === 1 ? 'Reg.' : 'Reg.'}</span>
                                  </div>
                                </div>

                                {/* Dirección */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.73rem', color: textSub }}>
                                  <span>📍</span>
                                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {school.direccion || 'DIRECCIÓN NO REGISTRADA'}
                                  </span>
                                </div>

                                {/* Mando del Colegio: Para Coord Local muestra su resumen; para los demás muestra Zonal + PLV */}
                                <div style={{
                                  background: isDark ? 'rgba(255,255,255,0.03)' : '#f1f5f9',
                                  borderRadius: '8px',
                                  padding: '8px 10px',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '6px',
                                  border: `1px solid ${borderCol}`
                                }}>
                                  {isCoordinadorLocal ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '0.74rem' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                                        <span style={{ color: textSub, fontWeight: 700 }}>Personero de Local (Tú):</span>
                                        <strong style={{ color: '#0284c7' }}>{user?.nombresApellidos || user?.['Nombres y Apellidos'] || 'Asignado'}</strong>
                                      </div>
                                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                                        <span style={{ color: textSub, fontWeight: 700 }}>Mesas Cubiertas:</span>
                                        <strong style={{ color: school.asignadas >= (school.totalMesas || 1) ? '#16a34a' : '#f59e0b' }}>
                                          {school.asignadas} de {school.totalMesas || 1} mesas ({school.cobertura}%)
                                        </strong>
                                      </div>
                                    </div>
                                  ) : (
                                    <>
                                      {/* 1. Coordinador Zonal */}
                                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', fontSize: '0.74rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden', minWidth: 0 }}>
                                          <span style={{
                                            background: isMulti ? '#ede9fe' : (isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0'),
                                            color: isMulti ? '#6d28d9' : (isDark ? '#cbd5e1' : '#334155'),
                                            border: isMulti ? '1px solid #c4b5fd' : '1px solid #cbd5e1',
                                            padding: '2px 6px',
                                            borderRadius: '4px',
                                            fontWeight: 800,
                                            fontSize: '0.66rem',
                                            flexShrink: 0
                                          }}>
                                            🗺️ Zonal {isMulti ? `(${school.zonalTotalColegios} col.)` : ''}
                                          </span>
                                          <span style={{ fontWeight: 700, color: school.zonalPersonero ? textTitle : '#f59e0b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {school.zonalPersonero ? (school.zonalPersonero['Nombres y Apellidos'] || school.zonalPersonero.nombresApellidos) : 'Sin Coord. Zonal'}
                                          </span>
                                        </div>
                                        {school.zonalPersonero && (school.zonalPersonero['Celular'] || school.zonalPersonero.celular) && (
                                          <a
                                            href={`https://wa.me/51${String(school.zonalPersonero['Celular'] || school.zonalPersonero.celular).replace(/\D/g, '')}`}
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
                                            <span>{school.zonalPersonero['Celular'] || school.zonalPersonero.celular}</span>
                                          </a>
                                        )}
                                      </div>

                                      {/* 2. Personero de Local de Votación (PLV) */}
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
                                            🏫 PLV
                                          </span>
                                          <span style={{ fontWeight: 700, color: school.plvPersonero ? textTitle : '#b45309', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {school.plvPersonero ? (school.plvPersonero['Nombres y Apellidos'] || school.plvPersonero.nombresApellidos) : '⚠️ Sin Personero de Local'}
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
                            hierarchyBadge = { label: 'Coordinador Zonal', icon: '🗺️', bg: '#ede9fe', color: '#6d28d9', border: '#ddd6fe' };
                          } else if (rolLower.includes('local') || rolLower.includes('plv')) {
                            hierarchyBadge = { label: 'Personero de Local de Votación', icon: '🏫', bg: '#e0f2fe', color: '#0369a1', border: '#bae6fd' };
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
                                hierarchyBadge = { label: 'Coordinador Zonal', icon: '🗺️', bg: '#ede9fe', color: '#6d28d9', border: '#ddd6fe' };
                              } else if (rolLower.includes('local') || rolLower.includes('plv')) {
                                hierarchyBadge = { label: 'Personero de Local de Votación', icon: '🏫', bg: '#e0f2fe', color: '#0369a1', border: '#bae6fd' };
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

                <a
                  href={api.getExportUrl('xlsx', coordinatorDistrict || (dist2 !== 'all' ? dist2 : ''))}
                  download
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '9px 16px',
                    borderRadius: '8px',
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
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Exportar Excel Capacitación</span>
                </a>
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

                  {/* Filtro Colegios para Coordinador Zonal en Tab 2 */}
                  {isCoordinadorZonal && coordinatorZonalLocales.length > 0 && (
                    <select
                      value={localZonal2}
                      onChange={(e) => setLocalZonal2(e.target.value)}
                      style={{ padding: '8px 12px', borderRadius: '8px', border: localZonal2 !== 'all' ? '1.5px solid #0284c7' : `1px solid ${borderCol}`, fontSize: '0.82rem', background: localZonal2 !== 'all' ? (isDark ? '#1e293b' : '#f0f9ff') : bgInput, color: textTitle, fontWeight: localZonal2 !== 'all' ? 700 : 500 }}
                    >
                      <option value="all">🏫 Todos los Colegios de mi Zona ({coordinatorZonalLocales.length})</option>
                      {coordinatorZonalLocales.map((school, sIdx) => (
                        <option key={sIdx} value={school}>{school}</option>
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
                    {!isCoordinadorLocal && <option value="Personero de Local de Votación">Personero de Local de Votación</option>}
                    {(isSuperAdmin || isCoordinadorDistrital) && <option value="Coordinador Zonal">Coordinador Zonal</option>}
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
                          const dni = r['D.N.I.'] || r['DNI'];
                          const cel = r['Celular'] || '';
                          const v = parseInt(r.Video, 10) || 0;
                          const p = parseInt(r.PDF, 10) || 0;
                          const isAcc = String(r.Credenciales).toLowerCase() === 'confirmado';

                          return (
                            <tr key={idx} style={{ borderBottom: `1px solid ${tableRowBorder}` }}>
                              <td style={{ padding: '12px 14px', fontWeight: 800, color: '#0284c7' }}>#{idx + 1}</td>
                              <td style={{ padding: '12px 14px' }}>
                                <div style={{ fontWeight: 800, color: textTitle }}>{r['Nombres y Apellidos']}</div>
                                <div style={{ fontSize: '0.72rem', color: textSub }}>DNI: {dni}</div>
                              </td>
                              <td style={{ padding: '12px 14px' }}>
                                <span style={{ background: isDark ? 'rgba(2, 132, 199, 0.2)' : '#e0f2fe', color: '#0284c7', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                                  {r['Rol a Desempeñar'] || 'Personero de Mesa'}
                                </span>
                              </td>
                              <td style={{ padding: '12px 14px', color: textBody }}>
                                {r['Distrito Asignado'] || r['Distrito donde Vota'] || '-'}
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
                                <a
                                  href={`https://wa.me/51${cel}?text=${encodeURIComponent(`Hola ${r['Nombres y Apellidos']}, te recordamos ingresar a capacitarte como personero de Somos Perú para completar tus módulos: ${window.location.origin}`)}`}
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
                  <span>📍 Distrito: <strong>{selectedSchoolDetail.distrito}</strong></span>
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

            {/* Pestañas del Modal: [ Personeros de este Centro ] [ Desglose de Zona Completa ] */}
            {!isCoordinadorLocal && (
              <div style={{ display: 'flex', borderBottom: `1px solid ${borderCol}`, background: isDark ? '#0f172a' : '#f1f5f9', padding: isMobile ? '4px 8px' : '6px 12px', gap: isMobile ? '4px' : '8px' }}>
                <button
                  type="button"
                  onClick={() => setSchoolDetailTab('personeros')}
                  style={{
                    flex: 1,
                    padding: isMobile ? '6px 8px' : '7px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: schoolDetailTab === 'personeros' ? '#0284c7' : 'transparent',
                    color: schoolDetailTab === 'personeros' ? '#ffffff' : textSub,
                    fontSize: isMobile ? '0.7rem' : '0.76rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Users className="w-3 h-3" />
                  <span>Personeros ({selectedSchoolDetail.allPersoneros.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSchoolDetailTab('zona')}
                  style={{
                    flex: 1,
                    padding: isMobile ? '6px 8px' : '7px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: schoolDetailTab === 'zona' ? '#8b5cf6' : 'transparent',
                    color: schoolDetailTab === 'zona' ? '#ffffff' : textSub,
                    fontSize: isMobile ? '0.7rem' : '0.76rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Layers className="w-3 h-3" />
                  <span>Zona ({selectedSchoolDetail.zonalTotalColegios || 1} col.)</span>
                </button>
              </div>
            )}

            {/* TAB 1: Lista Real de Personeros del Colegio Seleccionado */}
            {(isCoordinadorLocal || schoolDetailTab === 'personeros') && (
              <div style={{ padding: '16px 20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {selectedSchoolDetail.allPersoneros.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px', color: textSub, fontSize: '0.85rem' }}>
                    No hay personeros registrados en este local aún.
                  </div>
                ) : (
                  selectedSchoolDetail.allPersoneros.map((assignedPerson, mIdx) => {
                    const pName = assignedPerson['Nombres y Apellidos'] || assignedPerson.nombresApellidos || 'Sin Nombre';
                    const pDni = assignedPerson['D.N.I.'] || assignedPerson.dni || '-';
                    const pCel = assignedPerson['Celular'] || assignedPerson.celular || '';
                    const pMesa = assignedPerson['Mesa de Votación'] || assignedPerson.mesa || '-';
                    const pAcc = (assignedPerson['Acreditado'] || '').toLowerCase() === 'si';
                    const pRol = assignedPerson['Rol'] || assignedPerson.rol || 'Personero de Mesa';
                    const pEmail = assignedPerson['Correo Electrónico'] || assignedPerson.correoElectronico || assignedPerson.email || '-';
                    const isExpanded = expandedMesa === `p-${mIdx}`;

                    return (
                      <div
                        key={mIdx}
                        style={{
                          background: isDark ? '#0f172a' : '#ffffff',
                          border: `1px solid ${borderCol}`,
                          borderLeft: '5px solid #10b981',
                          borderRadius: '12px',
                          padding: '12px 14px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                        onClick={() => setExpandedMesa(isExpanded ? null : `p-${mIdx}`)}
                      >
                        {/* Fila Principal del Personero */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontSize: '0.92rem', fontWeight: 900, color: textTitle }}>
                              {pName}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                              <span style={{ fontSize: '0.72rem', fontWeight: 800, background: '#dcfce7', color: '#15803d', padding: '1px 6px', borderRadius: '4px' }}>
                                {pRol}
                              </span>
                              <span style={{ fontSize: '0.72rem', color: textSub }}>
                                DNI: <strong>{pDni}</strong>
                              </span>
                            </div>
                          </div>

                          <div style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: '50%',
                            background: '#dcfce7',
                            color: '#15803d',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 900,
                            fontSize: '0.78rem'
                          }}>
                            ✓
                          </div>
                        </div>

                        {/* DETALLE EXPANDIDO */}
                        {isExpanded && (
                          <div style={{
                            marginTop: '8px',
                            paddingTop: '8px',
                            borderTop: `1px dashed ${borderCol}`,
                            fontSize: '0.75rem',
                            color: textSub,
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '6px'
                          }}>
                            <div>📱 <strong>Celular:</strong> {pCel}</div>
                            <div>✉️ <strong>Email:</strong> {pEmail}</div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* TAB 2: DESGLOSE DETALLADO DE TODA LA ZONA MULTI-COLEGIO */}
            {!isCoordinadorLocal && schoolDetailTab === 'zona' && (
              <div style={{ padding: '16px 20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                
                {/* Coordinador Zonal a Cargo */}
                <div style={{
                  background: isDark ? 'rgba(139, 92, 246, 0.15)' : '#ede9fe',
                  border: '1px solid #c4b5fd',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#8b5cf6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.86rem', flexShrink: 0 }}>
                      {selectedSchoolDetail.zonalPersonero ? (selectedSchoolDetail.zonalPersonero['Nombres y Apellidos'] || selectedSchoolDetail.zonalPersonero.nombresApellidos || 'Z').charAt(0).toUpperCase() : 'Z'}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#6d28d9', textTransform: 'uppercase' }}>
                        Coordinador Zonal a Cargo
                      </div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 900, color: textTitle, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {selectedSchoolDetail.zonalPersonero ? (selectedSchoolDetail.zonalPersonero['Nombres y Apellidos'] || selectedSchoolDetail.zonalPersonero.nombresApellidos) : '⚠️ Sin Coordinador Zonal asignado'}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: textSub, display: 'flex', gap: '8px', alignItems: 'center', marginTop: '1px' }}>
                        {selectedSchoolDetail.zonalPersonero && <span>DNI: <strong>{selectedSchoolDetail.zonalPersonero['D.N.I.'] || selectedSchoolDetail.zonalPersonero.dni || '-'}</strong></span>}
                        <span>&bull;</span>
                        <span><strong>{selectedSchoolDetail.zonalTotalColegios || 1}</strong> colegios en su zona</span>
                      </div>
                    </div>
                  </div>

                  {selectedSchoolDetail.zonalPersonero && (selectedSchoolDetail.zonalPersonero['Celular'] || selectedSchoolDetail.zonalPersonero.celular) && (
                    <a
                      href={`https://wa.me/51${String(selectedSchoolDetail.zonalPersonero['Celular'] || selectedSchoolDetail.zonalPersonero.celular).replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        padding: '6px 10px',
                        borderRadius: '6px',
                        background: '#16a34a',
                        color: '#fff',
                        fontSize: '0.74rem',
                        fontWeight: 800,
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        flexShrink: 0
                      }}
                    >
                      <Phone className="w-3 h-3" />
                      <span>WhatsApp</span>
                    </a>
                  )}
                </div>

                {/* Lista Completa de Colegios de la Misma Zona */}
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: textSub, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Colegios que integran esta Zona ({selectedSchoolDetail.zonalTotalColegios || (selectedSchoolDetail.zonalAssignedSchoolsList || []).length || 1}):
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(selectedSchoolDetail.zonalAssignedSchoolsList && selectedSchoolDetail.zonalAssignedSchoolsList.length > 0
                      ? selectedSchoolDetail.zonalAssignedSchoolsList
                      : [selectedSchoolDetail.nombre]
                    ).map((schName, schIdx) => {
                      const isCurrent = normalizeLocalName(schName) === normalizeLocalName(selectedSchoolDetail.nombre);
                      const matchingSchoolObj = districtSchools.find(s => normalizeLocalName(s.nombre) === normalizeLocalName(schName));
                      const plv = matchingSchoolObj?.plvPersonero;
                      const regCount = matchingSchoolObj?.allPersoneros?.length || 0;
                      const mesasCount = matchingSchoolObj?.totalMesas || matchingSchoolObj?.mesas || '-';

                      return (
                        <div
                          key={schIdx}
                          style={{
                            background: isCurrent ? (isDark ? 'rgba(2, 132, 199, 0.15)' : '#f0f9ff') : (isDark ? '#0f172a' : '#ffffff'),
                            border: `1.5px solid ${isCurrent ? '#0284c7' : borderCol}`,
                            borderRadius: '10px',
                            padding: '10px 12px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                              <div style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '6px',
                                background: isCurrent ? '#0284c7' : '#ede9fe',
                                color: isCurrent ? '#fff' : '#7c3aed',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 900,
                                fontSize: '0.72rem',
                                flexShrink: 0
                              }}>
                                {schIdx + 1}
                              </div>
                              <div style={{ minWidth: 0, flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                  <strong style={{ fontSize: '0.86rem', color: textTitle }}>
                                    {schName}
                                  </strong>
                                  {isCurrent && (
                                    <span style={{ background: '#0284c7', color: '#fff', fontSize: '0.65rem', fontWeight: 800, padding: '1px 6px', borderRadius: '4px' }}>
                                      ⭐ Colegio Actual
                                    </span>
                                  )}
                                </div>
                                <div style={{ fontSize: '0.72rem', color: textSub, marginTop: '2px' }}>
                                  <strong>{regCount}</strong> personeros registrados &bull; <strong>{mesasCount}</strong> mesas
                                </div>
                              </div>
                            </div>

                            {/* Botón para Inspeccionar este Colegio */}
                            {!isCurrent && matchingSchoolObj && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedSchoolDetail(matchingSchoolObj);
                                  setSchoolDetailTab('personeros');
                                }}
                                style={{
                                  padding: '4px 8px',
                                  borderRadius: '6px',
                                  border: `1px solid ${borderCol}`,
                                  background: isDark ? '#1e293b' : '#f1f5f9',
                                  color: textTitle,
                                  fontSize: '0.7rem',
                                  fontWeight: 800,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px',
                                  flexShrink: 0
                                }}
                              >
                                <Search className="w-2.5 h-2.5" />
                                <span>Ver Mesas</span>
                              </button>
                            )}
                          </div>

                          {/* Fila del Personero de Local de este colegio hermano */}
                          <div style={{ borderTop: `1px dashed ${borderCol}`, paddingTop: '5px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.73rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <span style={{
                                background: plv ? '#e0f2fe' : (isDark ? 'rgba(245, 158, 11, 0.15)' : '#fef3c7'),
                                color: plv ? '#0369a1' : '#b45309',
                                padding: '1px 5px',
                                borderRadius: '4px',
                                fontSize: '0.65rem',
                                fontWeight: 800
                              }}>
                                🏫 PLV
                              </span>
                              <span style={{ fontWeight: 700, color: plv ? textTitle : '#b45309' }}>
                                {plv ? (plv['Nombres y Apellidos'] || plv.nombresApellidos) : '⚠️ Sin Personero de Local asignado'}
                              </span>
                            </div>

                            {plv && (plv['Celular'] || plv.celular) && (
                              <a
                                href={`https://wa.me/51${String(plv['Celular'] || plv.celular).replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  color: '#16a34a',
                                  fontWeight: 800,
                                  fontSize: '0.68rem',
                                  textDecoration: 'none',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '2px'
                                }}
                              >
                                <Phone className="w-2.5 h-2.5" />
                                <span>{plv['Celular'] || plv.celular}</span>
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}

          </div>
        </div>
      )}

      {/* Modal Ficha / Edición */}
      {selectedPersonero && (
        <EditAssignmentModal
          personero={selectedPersonero}
          onClose={() => setSelectedPersonero(null)}
          onSaved={fetchData}
        />
      )}
    </div>
  );
}

export default DashboardView;
