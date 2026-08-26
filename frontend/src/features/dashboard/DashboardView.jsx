import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutGrid, GraduationCap, Cable, RefreshCw, LogOut, Moon, Sun,
  Users, UserCheck, ShieldCheck, CheckCircle2, Car, Calendar, Info,
  FileSpreadsheet, Phone, Search, X, Check, Lock, Video, FileText,
  AlertCircle, ChevronRight, ChevronLeft, Menu, Edit3, Heart, Filter, RotateCcw, School, Layers, Building2
} from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { EditAssignmentModal } from '../../components/modals/EditAssignmentModal.jsx';
import { DISTRITOS_LIMA, DISTRITO_METAS, ROLES } from '../../constants/catalogs.js';
import { api } from '../../services/api.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

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

  // Detección de pantalla móvil (< 768px)
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
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
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  // Filtros Tab 1 (Panel General)
  const [search1, setSearch1] = useState('');
  const [dist1, setDist1] = useState(() => (coordinatorDistrict ? coordinatorDistrict : 'all'));
  const [localZonal1, setLocalZonal1] = useState('all');
  const [role1, setRole1] = useState('all');
  const [exp1, setExp1] = useState('all');
  const [mov1, setMov1] = useState('all');
  const [comp1, setComp1] = useState('all');

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
    setErrorMsg(null);
    try {
      const res = await api.getDashboardSummary();
      setData(res);
      setLastSync(new Date());
    } catch (err) {
      if (!isBackground) setErrorMsg(err.message || 'Error al conectar con la base de datos.');
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Sincronización automática periódica cada 20 segundos
    const interval = setInterval(() => {
      fetchData(true);
    }, 20000);

    // Sincronizar al volver a la pestaña
    const handleFocus = () => {
      fetchData(true);
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const allRecords = data?.records || [];

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

      return {
        schoolName,
        coordinadoresLocales: schoolCoords,
        personerosCount: schoolPersoneros.length,
        accreditedCount: accreditedPersoneros.length
      };
    });
  }, [isCoordinadorZonal, coordinatorZonalLocales, allRecords, coordinatorDistrict]);

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

  // Meta territorial dinámica según el distrito asignado o seleccionado
  const activeDistrictName = (isCoordinador && coordinatorDistrict) ? coordinatorDistrict : (dist1 !== 'all' ? dist1 : null);
  const selectedDistMeta = activeDistrictName ? (DISTRITO_METAS[activeDistrictName] || 0) : 25397;
  const targetLabel = isCoordinadorLocal 
    ? `META ${coordinatorLocal.toUpperCase()}` 
    : (isCoordinadorZonal 
      ? `ZONA • ${coordinatorDistrict.toUpperCase()}` 
      : (activeDistrictName ? `META ${activeDistrictName.toUpperCase()}` : 'AVANCE META TOTAL'));
  const targetSub = isCoordinadorLocal 
    ? `Colegio: ${coordinatorLocal}` 
    : (isCoordinadorZonal 
      ? `${coordinatorZonalLocales.length} colegios en tu zona` 
      : (activeDistrictName ? `Meta distrital: ${selectedDistMeta.toLocaleString()}` : 'Meta Lima: 25,397'));
  const targetPct = selectedDistMeta > 0 ? Math.min(100, ((tab1Total / selectedDistMeta) * 100)).toFixed(1) : '0.0';

  // =========================================================================
  // GRÁFICO LIMA METROPOLITANA O DISTRITO DEL COORDINADOR
  // =========================================================================
  const isSingleDistrict = Boolean(
    (isCoordinador && coordinatorDistrict) ||
    (dist1 !== 'all') ||
    isCoordinadorLocal
  );

  const chartDistricts = useMemo(() => {
    if (isCoordinadorLocal && coordinatorLocal) return [coordinatorLocal];
    if (isCoordinador && coordinatorDistrict) return [coordinatorDistrict];
    if (dist1 !== 'all') return [dist1];
    return DISTRITOS_LIMA;
  }, [isCoordinadorLocal, coordinatorLocal, isCoordinador, coordinatorDistrict, dist1]);

  const barData1 = useMemo(() => {
    const isPersoneroActive = role1 === 'all' || role1 === 'Personero de Mesa';
    const isCoordLocalActive = (role1 === 'all' || role1 === 'Coordinador de Local') && !isCoordinadorLocal;
    const isCoordZonalActive = (role1 === 'all' || role1 === 'Coordinador Zonal') && (isSuperAdmin || isCoordinadorDistrital);
    const isCoordDistActive = (role1 === 'all' || role1 === 'Coordinador de Distritos') && isSuperAdmin;

    const datasets = [];

    if (isPersoneroActive) {
      datasets.push({
        label: 'Personeros de Mesa',
        data: chartDistricts.map(d => personerosByDist[d] || (isCoordinadorLocal ? tab1Personeros : 0)),
        backgroundColor: chartDistricts.map(d =>
          (dist1 !== 'all' && normalizeDistrictName(d) === normalizeDistrictName(dist1))
            ? '#f59e0b'
            : '#0284c7'
        ),
        borderRadius: 4
      });
    }

    if (isCoordLocalActive) {
      datasets.push({
        label: 'Coordinadores de Local',
        data: chartDistricts.map(d => coordsLocalByDist[d] || 0),
        backgroundColor: chartDistricts.map(d =>
          (dist1 !== 'all' && normalizeDistrictName(d) === normalizeDistrictName(dist1))
            ? '#fbbf24'
            : '#8b5cf6'
        ),
        borderRadius: 4
      });
    }

    if (isCoordZonalActive) {
      datasets.push({
        label: 'Coordinadores Zonales',
        data: chartDistricts.map(d => coordsZonalByDist[d] || 0),
        backgroundColor: chartDistricts.map(d =>
          (dist1 !== 'all' && normalizeDistrictName(d) === normalizeDistrictName(dist1))
            ? '#38bdf8'
            : '#0284c7'
        ),
        borderRadius: 4
      });
    }

    if (isCoordDistActive) {
      datasets.push({
        label: 'Coordinadores de Distrito',
        data: chartDistricts.map(d => coordsDistByDist[d] || 0),
        backgroundColor: chartDistricts.map(d =>
          (dist1 !== 'all' && normalizeDistrictName(d) === normalizeDistrictName(dist1))
            ? '#34d399'
            : '#0d9488'
        ),
        borderRadius: 4
      });
    }

    return {
      labels: isCoordinadorLocal ? [coordinatorLocal] : chartDistricts,
      datasets
    };
  }, [chartDistricts, role1, dist1, personerosByDist, coordsLocalByDist, coordsZonalByDist, coordsDistByDist, isCoordinadorLocal, isSuperAdmin, isCoordinadorDistrital, coordinatorLocal, tab1Personeros]);

  // =========================================================================
  // FILTRADO TAB 2 (CAPACITACIONES)
  // =========================================================================
  const filteredRecords2 = useMemo(() => {
    return records.filter(r => {
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

  filteredRecords2.forEach(r => {
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

  const doughnutData2 = {
    labels: ['Confirmados (OK)', 'Bloqueados (Pendiente)'],
    datasets: [
      {
        data: [tab2Confirmados, tab2Pendientes],
        backgroundColor: ['#10b981', '#f59e0b'],
        borderWidth: 0
      }
    ]
  };

  const barData2 = {
    labels: ['0/2 (Sin iniciar)', '1/2 (En proceso)', '2/2 (Completado)'],
    datasets: [
      {
        label: 'Videos Vistos',
        data: [v0, v1, v2],
        backgroundColor: '#38bdf8',
        borderRadius: 4
      },
      {
        label: 'Manuales PDF',
        data: [p0, p1, p2],
        backgroundColor: '#a855f7',
        borderRadius: 4
      }
    ]
  };

  // Variables de estilo reactivas al Modo Oscuro / Claro
  const bgMain = isDark ? '#0b1329' : '#f8fafc';
  const bgCard = isDark ? '#131b2e' : '#ffffff';
  const bgHeader = isDark ? '#111827' : '#ffffff';
  const bgSidebar = isDark ? '#131b2e' : '#ffffff';
  const borderCol = isDark ? '#233554' : '#e2e8f0';
  const textTitle = isDark ? '#ffffff' : '#0f172a';
  const textSub = isDark ? '#94a3b8' : '#64748b';
  const textBody = isDark ? '#e2e8f0' : '#334155';
  const bgInput = isDark ? '#141c30' : '#ffffff';
  const tableHeadBg = isDark ? '#111827' : '#f8fafc';
  const tableRowBorder = isDark ? '#1e293b' : '#f1f5f9';

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

            {/* Acceso a Certificado para Coordinadores */}
            {(isCoordinadorLocal || isCoordinadorDistrital || isCoordinador) && onGoToTraining && (
              <button
                onClick={onGoToTraining}
                title={isSidebarCollapsed ? 'Mi Ficha / Certificado' : undefined}
                style={{
                  padding: isSidebarCollapsed ? '10px' : '10px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'transparent',
                  color: textSub,
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
                <School className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                {!isSidebarCollapsed && (
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    Mi Certificado
                  </span>
                )}
              </button>
            )}

            {/* Tab 3: Conexión a Base de Datos (Solo Administrador) */}
            {isSuperAdmin && (
              <button
                onClick={() => setActiveTab('sql')}
                title={isSidebarCollapsed ? 'Conexión a Base de Datos' : undefined}
                style={{
                  padding: isSidebarCollapsed ? '10px' : '10px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: activeTab === 'sql' ? (isDark ? '#1e293b' : '#e0f2fe') : 'transparent',
                  color: activeTab === 'sql' ? '#0284c7' : textSub,
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
                <Cable className="w-4 h-4 flex-shrink-0" />
                {!isSidebarCollapsed && (
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    Base de Datos
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

            {/* Botón Sincronizar */}
            <button
              onClick={() => fetchData(false)}
              title="Sincronizar datos"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 10px',
                borderRadius: '6px',
                border: `1px solid ${borderCol}`,
                background: bgCard,
                color: textTitle,
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              {!isMobile && <span>Sincronizar</span>}
            </button>

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

                  {/* Tarjetas de Colegios de la Zona con sus Coordinadores Locales */}
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
                    {zonalSchoolsOverview.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
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
                                    👤 Coord. Local: {item.coordinadoresLocales[0]['Nombres y Apellidos'] || item.coordinadoresLocales[0].nombresApellidos}
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
                                {item.personerosCount} personeros asignados ({item.accreditedCount} acreditados)
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Coordinadores Locales de este Colegio */}
                        <div style={{ borderTop: `1px dashed ${borderCol}`, paddingTop: '8px' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
                            Coordinador(es) de Local de este colegio:
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
                              <span>Aún no hay Coordinador de Local registrado para este colegio</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Barra de Filtros Limpia */}
              <div style={{ background: bgCard, border: `1px solid ${borderCol}`, borderRadius: '12px', padding: '16px 18px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
                  
                  {/* Búsqueda por texto */}
                  <div style={{ position: 'relative', flex: '1 1 200px' }}>
                    <Search className="w-4 h-4 text-sky-500" style={{ position: 'absolute', left: '12px', top: '10px' }} />
                    <input
                      type="text"
                      placeholder="Buscar por Nombre, DNI, Local..."
                      value={search1}
                      onChange={(e) => setSearch1(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px 8px 34px', borderRadius: '8px', border: `1px solid ${borderCol}`, background: bgInput, color: textTitle, fontSize: '0.82rem', outline: 'none' }}
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
                        userSelect: 'none'
                      }}
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Distrito: {coordinatorDistrict}</span>
                    </div>
                  ) : (
                    <select
                      value={dist1}
                      onChange={(e) => setDist1(e.target.value)}
                      style={{ padding: '8px 12px', borderRadius: '8px', border: dist1 !== 'all' ? '1.5px solid #0284c7' : `1px solid ${borderCol}`, fontSize: '0.82rem', background: dist1 !== 'all' ? (isDark ? '#1e293b' : '#f0f9ff') : bgInput, color: textTitle, fontWeight: dist1 !== 'all' ? 700 : 500 }}
                    >
                      <option value="all">📍 Todos los Distritos</option>
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
                      style={{ padding: '8px 12px', borderRadius: '8px', border: localZonal1 !== 'all' ? '1.5px solid #0284c7' : `1px solid ${borderCol}`, fontSize: '0.82rem', background: localZonal1 !== 'all' ? (isDark ? '#1e293b' : '#f0f9ff') : bgInput, color: textTitle, fontWeight: localZonal1 !== 'all' ? 700 : 500 }}
                    >
                      <option value="all">🏫 Todos los Colegios de mi Zona ({coordinatorZonalLocales.length})</option>
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
                      gap: '6px'
                    }}>
                      <School className="w-3.5 h-3.5" />
                      <span>{coordinatorLocal}</span>
                    </div>
                  )}

                  {/* Filtro Roles */}
                  <select
                    value={role1}
                    onChange={(e) => setRole1(e.target.value)}
                    style={{ padding: '8px 12px', borderRadius: '8px', border: role1 !== 'all' ? '1.5px solid #0284c7' : `1px solid ${borderCol}`, fontSize: '0.82rem', background: role1 !== 'all' ? (isDark ? '#1e293b' : '#f0f9ff') : bgInput, color: textTitle, fontWeight: role1 !== 'all' ? 700 : 500 }}
                  >
                    <option value="all">🛡️ Todos los Roles</option>
                    <option value="Personero de Mesa">Personero de Mesa</option>
                    {!isCoordinadorLocal && <option value="Coordinador de Local">Coordinador de Local</option>}
                    {(isSuperAdmin || isCoordinadorDistrital) && <option value="Coordinador Zonal">Coordinador Zonal</option>}
                    {isSuperAdmin && <option value="Coordinador de Distritos">Coordinador de Distritos</option>}
                  </select>

                  {/* Filtro Experiencia */}
                  <select
                    value={exp1}
                    onChange={(e) => setExp1(e.target.value)}
                    style={{ padding: '8px 12px', borderRadius: '8px', border: exp1 !== 'all' ? '1.5px solid #0284c7' : `1px solid ${borderCol}`, fontSize: '0.82rem', background: exp1 !== 'all' ? (isDark ? '#1e293b' : '#f0f9ff') : bgInput, color: textTitle, fontWeight: exp1 !== 'all' ? 700 : 500 }}
                  >
                    <option value="all">⭐ Experiencia: Todos</option>
                    <option value="si">Experiencia: Sí</option>
                    <option value="no">Experiencia: No</option>
                  </select>

                  {/* Filtro Movilidad */}
                  <select
                    value={mov1}
                    onChange={(e) => setMov1(e.target.value)}
                    style={{ padding: '8px 12px', borderRadius: '8px', border: mov1 !== 'all' ? '1.5px solid #0284c7' : `1px solid ${borderCol}`, fontSize: '0.82rem', background: mov1 !== 'all' ? (isDark ? '#1e293b' : '#f0f9ff') : bgInput, color: textTitle, fontWeight: mov1 !== 'all' ? 700 : 500 }}
                  >
                    <option value="all">🚗 Movilidad: Todos</option>
                    <option value="si">Movilidad: Sí</option>
                    <option value="no">Movilidad: No</option>
                  </select>

                  {/* Filtro Compromiso */}
                  <select
                    value={comp1}
                    onChange={(e) => setComp1(e.target.value)}
                    style={{ padding: '8px 12px', borderRadius: '8px', border: comp1 !== 'all' ? '1.5px solid #0284c7' : `1px solid ${borderCol}`, fontSize: '0.82rem', background: comp1 !== 'all' ? (isDark ? '#1e293b' : '#f0f9ff') : bgInput, color: textTitle, fontWeight: comp1 !== 'all' ? 700 : 500 }}
                  >
                    <option value="all">📅 Compromiso: Todos</option>
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
                        gap: '4px'
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
                      <span>{tab1Total} {tab1Total === 1 ? 'personero encontrado' : 'personeros encontrados'}</span>
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

              {/* Indicadores Electorales Clave (KPIs Jerárquicos Sincronizados) */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', fontWeight: 900, color: textTitle }}>
                    <LayoutGrid className="w-4 h-4 text-sky-500" />
                    <span>Indicadores Electorales Sincronizados ({tab1Total})</span>
                  </div>
                  <span style={{ fontSize: '0.74rem', color: textSub }}>
                    {isFiltered1 ? `Métricas en vivo para ${tab1Total} seleccionados` : 'Métricas del padrón'}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                  
                  {/* KPI 1 - Total */}
                  <div style={{ background: bgCard, border: `1px solid ${borderCol}`, borderLeft: '4px solid #0284c7', borderRadius: '10px', padding: '14px', transition: 'all 0.2s ease' }}>
                    <div style={{ fontSize: '0.68rem', fontWeight: 800, color: textSub }}>TOTAL FILTRADOS</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: isDark ? 'rgba(2, 132, 199, 0.2)' : '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Users className="w-4 h-4" /></div>
                      <span style={{ fontSize: '1.45rem', fontWeight: 900, color: textTitle }}>{tab1Total}</span>
                    </div>
                    <div style={{ fontSize: '0.68rem', color: textSub }}>{isFiltered1 ? `De ${records.length} totales` : 'Padrón Somos Perú'}</div>
                  </div>

                  {/* KPI 2 - Coordinadores Distritales (Solo Superadministrador) */}
                  {isSuperAdmin && (
                    <div style={{ background: bgCard, border: `1px solid ${borderCol}`, borderLeft: '4px solid #0d9488', borderRadius: '10px', padding: '14px' }}>
                      <div style={{ fontSize: '0.68rem', fontWeight: 800, color: textSub }}>COORD. DISTRITALES</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: isDark ? 'rgba(13, 148, 136, 0.2)' : '#ccfbf1', color: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ShieldCheck className="w-4 h-4" /></div>
                        <span style={{ fontSize: '1.45rem', fontWeight: 900, color: textTitle }}>{tab1CoordsDistrital}</span>
                      </div>
                      <div style={{ fontSize: '0.68rem', color: textSub }}>Líderes de Distrito</div>
                    </div>
                  )}

                  {/* KPI 3 - Coordinadores Zonales (Superadmin y Distrital) */}
                  {(isSuperAdmin || isCoordinadorDistrital) && (
                    <div style={{ background: bgCard, border: `1px solid ${borderCol}`, borderLeft: '4px solid #0284c7', borderRadius: '10px', padding: '14px' }}>
                      <div style={{ fontSize: '0.68rem', fontWeight: 800, color: textSub }}>COORD. ZONALES</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: isDark ? 'rgba(2, 132, 199, 0.2)' : '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Layers className="w-4 h-4" /></div>
                        <span style={{ fontSize: '1.45rem', fontWeight: 900, color: textTitle }}>{tab1CoordsZonal}</span>
                      </div>
                      <div style={{ fontSize: '0.68rem', color: textSub }}>Líderes Zonales</div>
                    </div>
                  )}

                  {/* KPI 4 - Coordinadores de Local (Superadmin, Distrital y Zonal) */}
                  {!isCoordinadorLocal && (
                    <div style={{ background: bgCard, border: `1px solid ${borderCol}`, borderLeft: '4px solid #8b5cf6', borderRadius: '10px', padding: '14px' }}>
                      <div style={{ fontSize: '0.68rem', fontWeight: 800, color: textSub }}>COORD. DE LOCAL</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: isDark ? 'rgba(139, 92, 246, 0.2)' : '#ede9fe', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><UserCheck className="w-4 h-4" /></div>
                        <span style={{ fontSize: '1.45rem', fontWeight: 900, color: textTitle }}>{tab1CoordsLocal}</span>
                      </div>
                      <div style={{ fontSize: '0.68rem', color: textSub }}>Líderes de Colegio</div>
                    </div>
                  )}

                  {/* KPI 5 - Personeros Mesa */}
                  <div style={{ background: bgCard, border: `1px solid ${borderCol}`, borderLeft: '4px solid #6366f1', borderRadius: '10px', padding: '14px' }}>
                    <div style={{ fontSize: '0.68rem', fontWeight: 800, color: textSub }}>PERSONEROS MESA</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: isDark ? 'rgba(99, 102, 241, 0.2)' : '#e0e7ff', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ShieldCheck className="w-4 h-4" /></div>
                      <span style={{ fontSize: '1.45rem', fontWeight: 900, color: textTitle }}>{tab1Personeros}</span>
                    </div>
                    <div style={{ fontSize: '0.68rem', color: textSub }}>Defensa del Voto</div>
                  </div>

                  {/* KPI 4 */}
                  <div style={{ background: bgCard, border: `1px solid ${borderCol}`, borderLeft: '4px solid #10b981', borderRadius: '10px', padding: '14px' }}>
                    <div style={{ fontSize: '0.68rem', fontWeight: 800, color: textSub }}>CON EXPERIENCIA</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: isDark ? 'rgba(16, 185, 129, 0.2)' : '#dcfce7', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckCircle2 className="w-4 h-4" /></div>
                      <span style={{ fontSize: '1.45rem', fontWeight: 900, color: textTitle }}>{tab1Exp}</span>
                    </div>
                    <div style={{ fontSize: '0.68rem', color: textSub }}>Elecciones Previas</div>
                  </div>

                  {/* KPI 5 */}
                  <div style={{ background: bgCard, border: `1px solid ${borderCol}`, borderLeft: '4px solid #f97316', borderRadius: '10px', padding: '14px' }}>
                    <div style={{ fontSize: '0.68rem', fontWeight: 800, color: textSub }}>CON MOVILIDAD</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: isDark ? 'rgba(249, 115, 22, 0.2)' : '#ffedd5', color: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Car className="w-4 h-4" /></div>
                      <span style={{ fontSize: '1.45rem', fontWeight: 900, color: textTitle }}>{tab1Mov}</span>
                    </div>
                    <div style={{ fontSize: '0.68rem', color: textSub }}>Vehículo Propio</div>
                  </div>

                  {/* KPI 6 */}
                  <div style={{ background: bgCard, border: `1px solid ${borderCol}`, borderLeft: '4px solid #8b5cf6', borderRadius: '10px', padding: '14px' }}>
                    <div style={{ fontSize: '0.68rem', fontWeight: 800, color: textSub }}>COMPROMISO 2026</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: isDark ? 'rgba(139, 92, 246, 0.2)' : '#ede9fe', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Calendar className="w-4 h-4" /></div>
                      <span style={{ fontSize: '1.45rem', fontWeight: 900, color: textTitle }}>{tab1Comp}</span>
                    </div>
                    <div style={{ fontSize: '0.68rem', color: textSub }}>4 de Octubre</div>
                  </div>

                  {/* KPI 7 - Dinámico con respecto a la meta distrital o meta Lima */}
                  <div style={{ background: bgCard, border: `1px solid ${borderCol}`, borderLeft: '4px solid #eab308', borderRadius: '10px', padding: '14px' }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#eab308' }}>{targetLabel}</div>
                    <div style={{ fontSize: '0.72rem', color: textSub, fontWeight: 700 }}>{targetSub}</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 900, color: textTitle, marginTop: '6px' }}>
                      {tab1Total} / {selectedDistMeta.toLocaleString()} <span style={{ fontSize: '0.8rem', color: '#eab308' }}>{targetPct}%</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Gráfico Resultado Lima Metropolitana o Colegio / Distrito */}
              <div style={{ background: bgCard, border: `1px solid ${borderCol}`, borderRadius: '12px', padding: isMobile ? '14px' : '18px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: isMobile ? '0.85rem' : '0.92rem', fontWeight: 900, color: textTitle }}>
                    <div style={{ width: '3px', height: '14px', background: '#0284c7' }}></div>
                    <span>
                      {isCoordinadorLocal && coordinatorLocal
                        ? `Colegio: ${coordinatorLocal}`
                        : ((isCoordinadorDistrital || isCoordinador) && coordinatorDistrict
                          ? `Distrito: ${coordinatorDistrict}`
                          : (dist1 !== 'all' ? `Distrito: ${dist1}` : 'Lima Metropolitana (43 Distritos)'))}
                    </span>
                  </div>
                  <span style={{ background: isDark ? '#1e293b' : '#e0f2fe', color: '#0284c7', padding: '3px 10px', borderRadius: '12px', fontSize: '0.74rem', fontWeight: 800 }}>
                    {tab1Total} registros
                  </span>
                </div>
                <div style={{ height: isMobile ? '200px' : '230px' }}>
                  <Bar
                    data={barData1}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        x: {
                          ticks: {
                            color: textSub,
                            font: {
                              size: isSingleDistrict ? 13 : (isMobile ? 8 : 9),
                              weight: isSingleDistrict ? 'bold' : 'normal'
                            },
                            maxRotation: isSingleDistrict ? 0 : 45,
                            minRotation: isSingleDistrict ? 0 : 45
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
                        legend: {
                          display: true,
                          position: 'top',
                          labels: {
                            color: textTitle,
                            font: { size: 10, weight: 'bold' }
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>

              {/* Tabla Padrón Electoral de Personeros */}
              <div style={{ background: bgCard, border: `1px solid ${borderCol}`, borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: `1px solid ${borderCol}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', fontWeight: 900, color: textTitle }}>
                    <LayoutGrid className="w-4 h-4 text-amber-500" />
                    <span>
                      {isCoordinadorLocal && coordinatorLocal
                        ? `Padrón de Personeros de Mesa • Colegio ${coordinatorLocal}`
                        : ((isCoordinadorDistrital || isCoordinador) && coordinatorDistrict
                          ? `Padrón Electoral de ${coordinatorDistrict} (Coordinadores de Local y Personeros)`
                          : 'Padrón Electoral de Personeros')}
                    </span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: textSub, marginLeft: '8px' }}>
                      ({filteredRecords1.length} {filteredRecords1.length === 1 ? 'resultado' : 'resultados'})
                    </span>
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
                      textDecoration: 'none',
                      fontSize: '0.82rem',
                      fontWeight: 700
                    }}
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Descargar Excel {isCoordinadorLocal ? `(${coordinatorLocal})` : (coordinatorDistrict ? `(${coordinatorDistrict})` : (dist1 !== 'all' ? `(${dist1})` : ''))}</span>
                  </a>
                </div>

                {/* ---- VISTA TABLA (escritorio) / TARJETAS (móvil) ---- */}
                {filteredRecords1.length > 0 ? (
                  isMobile ? (
                    /* TARJETAS EN MÓVIL */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '10px' }}>
                      {filteredRecords1.map((r, idx) => {
                        const dni = r['D.N.I.'] || r['DNI'];
                        const cel = r['Celular'] || '-';
                        const exp = getExp(r);
                        const mov = getMov(r);
                        const comp = getComp(r);
                        const distrito = r['Distrito Asignado'] || r['Distrito donde Vota'] || '-';
                        const local = r['Local de Votación Asignado'] || r['Local de Votación'] || '-';
                        const mesa = r['Mesa Asignada'] || r['Mesa de Sufragio'] || '-';
                        return (
                          <div key={idx} style={{ background: bgCard, border: `1px solid ${borderCol}`, borderRadius: '12px', padding: '14px', boxShadow: isDark ? 'none' : '0 1px 4px rgba(0,0,0,0.06)' }}>
                            {/* Fila 1: Nombre + Número */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                              <div>
                                <div style={{ fontWeight: 900, color: textTitle, fontSize: '0.9rem' }}>{r['Nombres y Apellidos']}</div>
                                <div style={{ fontSize: '0.72rem', color: textSub, display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '2px' }}>
                                  <span>DNI: {dni}</span>
                                  {(r['Clave de Acceso'] || r.claveAcceso) && (
                                    <span style={{ background: '#fef3c7', color: '#b45309', padding: '1px 6px', borderRadius: '4px', fontWeight: 800, fontSize: '0.68rem', border: '1px solid #fde68a' }}>
                                      🔑 Clave: {r['Clave de Acceso'] || r.claveAcceso}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <span style={{ background: isDark ? 'rgba(2,132,199,0.2)' : '#e0f2fe', color: '#0284c7', padding: '3px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0 }}>
                                #{idx + 1}
                              </span>
                            </div>
                            {/* Fila 2: Rol */}
                            <div style={{ marginBottom: '8px' }}>
                              <span style={{ background: isDark ? 'rgba(2,132,199,0.15)' : '#f0f9ff', color: '#0284c7', padding: '3px 10px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, border: `1px solid ${isDark ? 'rgba(2,132,199,0.3)' : '#bae6fd'}` }}>
                                {r['Rol a Desempeñar'] || 'Personero de Mesa'}
                              </span>
                            </div>
                            {/* Fila 3: Distrito / Local / Mesa */}
                            <div style={{ background: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc', borderRadius: '8px', padding: '8px 10px', marginBottom: '8px', fontSize: '0.75rem' }}>
                              <div style={{ display: 'flex', gap: '6px', marginBottom: '2px' }}>
                                <span style={{ color: textSub, fontWeight: 600 }}>📍 Distrito:</span>
                                <span style={{ fontWeight: 800, color: '#0284c7' }}>{distrito}</span>
                              </div>
                              <div style={{ display: 'flex', gap: '6px', marginBottom: '2px' }}>
                                <span style={{ color: textSub, fontWeight: 600 }}>🏫 Local:</span>
                                <span style={{ fontWeight: 700, color: textBody }}>{local}</span>
                              </div>
                              <div style={{ display: 'flex', gap: '6px' }}>
                                <span style={{ color: textSub, fontWeight: 600 }}>🗳️ Mesa:</span>
                                <span style={{ fontWeight: 800, color: textTitle }}>{mesa}</span>
                              </div>
                            </div>
                            {/* Fila 4: Celular + Logística */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
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
                              style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1.5px solid #0284c7', background: isDark ? 'rgba(2,132,199,0.1)' : '#f0f9ff', color: '#0284c7', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
                            >
                              Ver Ficha Completa
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* TABLA EN ESCRITORIO */
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ background: tableHeadBg, borderBottom: `1px solid ${borderCol}`, color: textSub, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            <th style={{ padding: '12px 14px' }}>ID</th>
                            <th style={{ padding: '12px 14px' }}>FECHA</th>
                            <th style={{ padding: '12px 14px' }}>PERSONERO / DNI / CORREO</th>
                            <th style={{ padding: '12px 14px' }}>ROL A DESEMPEÑAR</th>
                            <th style={{ padding: '12px 14px' }}>ASIGNACIÓN SOMOS PERÚ</th>
                            <th style={{ padding: '12px 14px' }}>VOTACIÓN (DNI)</th>
                            <th style={{ padding: '12px 14px' }}>CONTACTO & WHATSAPP</th>
                            <th style={{ padding: '12px 14px' }}>LOGÍSTICA</th>
                            <th style={{ padding: '12px 14px', textAlign: 'center' }}>ACCIONES</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredRecords1.map((r, idx) => {
                            const dni = r['D.N.I.'] || r['DNI'];
                            const cel = r['Celular'] || '-';
                            const exp = getExp(r);
                            const mov = getMov(r);
                            const comp = getComp(r);

                            return (
                              <tr key={idx} style={{ borderBottom: `1px solid ${tableRowBorder}` }}>
                                <td style={{ padding: '12px 14px', fontWeight: 800, color: '#0284c7' }}>#{idx + 1}</td>
                                <td style={{ padding: '12px 14px', color: textSub, fontSize: '0.75rem' }}>{r['Fecha de Registro'] || '2026-08-17'}</td>
                                <td style={{ padding: '12px 14px' }}>
                                  <div style={{ fontWeight: 800, color: textTitle }}>{r['Nombres y Apellidos']}</div>
                                  <div style={{ fontSize: '0.72rem', color: textSub, display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '2px' }}>
                                    <span>DNI: {dni}</span>
                                    {(r['Clave de Acceso'] || r.claveAcceso) && (
                                      <span style={{ background: '#fef3c7', color: '#b45309', padding: '1px 6px', borderRadius: '4px', fontWeight: 800, fontSize: '0.68rem', border: '1px solid #fde68a' }}>
                                        🔑 Clave: {r['Clave de Acceso'] || r.claveAcceso}
                                      </span>
                                    )}
                                  </div>
                                  {r['Correo Electrónico'] && (
                                    <div style={{ fontSize: '0.7rem', color: textSub, marginTop: '1px' }}>{r['Correo Electrónico']}</div>
                                  )}
                                </td>
                                <td style={{ padding: '12px 14px' }}>
                                  <span style={{ background: isDark ? 'rgba(2, 132, 199, 0.2)' : '#e0f2fe', color: '#0284c7', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                                    {r['Rol a Desempeñar'] || 'Personero de Mesa'}
                                  </span>
                                </td>
                                <td style={{ padding: '12px 14px' }}>
                                  <div style={{ fontWeight: 800, color: '#0284c7' }}>{r['Distrito Asignado'] || r['Distrito donde Vota']}</div>
                                  <div style={{ fontSize: '0.72rem', color: textSub }}>{r['Local de Votación Asignado'] || r['Local de Votación']}</div>
                                  <div style={{ fontSize: '0.72rem', color: textTitle }}>Mesa Asignada: <strong>{r['Mesa Asignada'] || r['Mesa de Sufragio']}</strong></div>
                                </td>
                                <td style={{ padding: '12px 14px', fontSize: '0.75rem' }}>
                                  <div style={{ color: textBody }}>{r['Distrito donde Vota']}</div>
                                  <div style={{ color: textSub }}>Local: {r['Local de Votación']}</div>
                                  <div style={{ color: textSub }}>Mesa: {r['Mesa de Sufragio']}</div>
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
                                    style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid #0284c7', background: 'transparent', color: '#0284c7', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}
                                  >
                                    Ver Ficha
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
                  <div style={{ padding: '40px 20px', textAlign: 'center', color: textSub }}>
                    <AlertCircle className="w-8 h-8 mx-auto text-amber-500 mb-2" />
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: textTitle }}>No se encontraron personeros con los filtros actuales</div>
                    <p style={{ fontSize: '0.8rem', margin: '6px 0 14px 0' }}>Pruebe cambiando o limpiando los criterios de búsqueda.</p>
                    <button
                      onClick={() => { setSearch1(''); setDist1('all'); setRole1('all'); setExp1('all'); setMov1('all'); setComp1('all'); }}
                      style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#0284c7', color: '#fff', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
                    >
                      Restablecer Filtros
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 2: PROGRESO DE CAPACITACIONES
              ========================================================================= */}
          {activeTab === 'capacitacion' && (
            <div>
              {/* Banner Top */}
              <div style={{ background: bgCard, border: `1px solid ${borderCol}`, borderRadius: '12px', padding: '16px 20px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', fontWeight: 900, color: textTitle }}>
                  <GraduationCap className="w-5 h-5 text-sky-500" />
                  <span>Progreso de las Capacitaciones en Gráficas</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: textSub, marginTop: '2px' }}>
                  Estadísticas y visualización gráfica del avance en videos formativos, manuales PDF y habilitación de credenciales
                </div>
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
                    {!isCoordinadorLocal && <option value="Coordinador de Local">Coordinador de Local</option>}
                    {(isSuperAdmin || isCoordinadorDistrital) && <option value="Coordinador Zonal">Coordinador Zonal</option>}
                    {isSuperAdmin && <option value="Coordinador de Distritos">Coordinador de Distritos</option>}
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

              {/* 2 Gráficos de Capacitación Sincronizados con el Filtro */}
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1.5fr', gap: '16px', marginBottom: '24px' }}>
                <div style={{ background: bgCard, border: `1px solid ${borderCol}`, borderRadius: '12px', padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.92rem', fontWeight: 900, color: textTitle, marginBottom: '14px' }}>
                    <div style={{ width: '3px', height: '14px', background: '#0284c7' }}></div>
                    <span>Estado de Credenciales {dist2 !== 'all' ? `(${dist2})` : ''}</span>
                  </div>
                  <div style={{ height: '220px' }}>
                    <Doughnut data={doughnutData2} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: textTitle } } } }} />
                  </div>
                </div>

                <div style={{ background: bgCard, border: `1px solid ${borderCol}`, borderRadius: '12px', padding: isMobile ? '14px' : '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.92rem', fontWeight: 900, color: textTitle, marginBottom: '14px' }}>
                    <div style={{ width: '3px', height: '14px', background: '#0284c7' }}></div>
                    <span>Avance Videos vs Manuales PDF {dist2 !== 'all' ? `(${dist2})` : ''}</span>
                  </div>
                  <div style={{ height: isMobile ? '200px' : '220px' }}>
                    <Bar
                      data={barData2}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          x: {
                            ticks: {
                              color: textSub,
                              font: { size: isMobile ? 8 : 10, weight: 'bold' },
                              maxRotation: 0,
                              minRotation: 0
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
                          legend: {
                            labels: {
                              color: textTitle,
                              font: { size: 10, weight: 'bold' }
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
                                  style={{
                                    padding: '6px 14px',
                                    borderRadius: '6px',
                                    border: '1px solid #0284c7',
                                    background: 'transparent',
                                    color: '#0284c7',
                                    fontWeight: 700,
                                    fontSize: '0.75rem',
                                    cursor: 'pointer'
                                  }}
                                >
                                  Ver Ficha
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

          {isSuperAdmin && (
            <button
              onClick={() => setActiveTab('sql')}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '3px',
                border: 'none',
                background: 'transparent',
                color: activeTab === 'sql' ? '#0284c7' : textSub,
                fontWeight: activeTab === 'sql' ? 800 : 500,
                fontSize: '0.62rem',
                cursor: 'pointer',
                padding: '8px 0'
              }}
            >
              <Cable style={{ width: '20px', height: '20px' }} />
              <span>SQL</span>
            </button>
          )}

          <button
            onClick={fetchData}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '3px',
              border: 'none',
              background: 'transparent',
              color: textSub,
              fontSize: '0.62rem',
              cursor: 'pointer',
              padding: '8px 0'
            }}
          >
            <RefreshCw style={{ width: '20px', height: '20px' }} className={loading ? 'animate-spin' : ''} />
            <span>Sync</span>
          </button>
        </nav>
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
