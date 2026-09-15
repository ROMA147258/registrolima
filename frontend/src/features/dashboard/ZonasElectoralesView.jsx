import React, { useState, useMemo } from 'react';
import {
  MapPin, School, Users, Layers, Building2,
  Search, ChevronDown, ChevronUp, Filter
} from 'lucide-react';
import { ZONAS_CONFIG } from '../../constants/zonasCatalog.js';

const ZONA_COLORS = {
  "ZONA MARIATEGUI": { bg: "rgba(139, 92, 246, 0.12)", border: "#8b5cf6", text: "#7c3aed", light: "#ede9fe", badge: "🟣" },
  "ZONA CERCADO": { bg: "rgba(2, 132, 199, 0.12)", border: "#0284c7", text: "#0369a1", light: "#e0f2fe", badge: "🔵" },
  "ZONA INCA PACHACUTEC": { bg: "rgba(16, 185, 129, 0.12)", border: "#10b981", text: "#059669", light: "#d1fae5", badge: "🟢" },
  "ZONA NUEVA ESPERANZA": { bg: "rgba(245, 158, 11, 0.12)", border: "#f59e0b", text: "#d97706", light: "#fef3c7", badge: "🟡" },
  "ZONA NUEVO MILENIO": { bg: "rgba(244, 63, 94, 0.12)", border: "#f43f5e", text: "#e11d48", light: "#ffe4e6", badge: "🔴" },
  "ZONA JOSE GALVEZ": { bg: "rgba(99, 102, 241, 0.12)", border: "#6366f1", text: "#4f46e5", light: "#e0e7ff", badge: "🔷" },
  "ZONA TABLADA": { bg: "rgba(14, 165, 233, 0.12)", border: "#0ea5e9", text: "#0284c7", light: "#e0f2fe", badge: "🟦" }
};

export function ZonasElectoralesView({
  isDark = false,
  allPersoneros = [],
  onSelectSchoolDetail,
  onFilterByLocal,
  userDistrito = 'VILLA MARIA DEL TRIUNFO'
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZonaFilter, setSelectedZonaFilter] = useState('all');
  const [expandedZonas, setExpandedZonas] = useState(() => ({
    "ZONA MARIATEGUI": true,
    "ZONA CERCADO": true,
    "ZONA INCA PACHACUTEC": true,
    "ZONA NUEVA ESPERANZA": true,
    "ZONA NUEVO MILENIO": true,
    "ZONA JOSE GALVEZ": true,
    "ZONA TABLADA": true
  }));

  const bgCard = isDark ? '#1e293b' : '#ffffff';
  const borderCol = isDark ? '#334155' : '#e2e8f0';
  const textTitle = isDark ? '#f8fafc' : '#0f172a';
  const textSub = isDark ? '#94a3b8' : '#64748b';

  // Normalize string helper
  const normalize = (s) => (s || '').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Z0-9]/g, ' ').replace(/\s+/g, ' ').trim();

  // Map personeros count by school
  const personerosBySchool = useMemo(() => {
    const map = new Map();
    allPersoneros.forEach(p => {
      const loc = p['Local de Votación'] || p.localDeVotacion || p.local || p['Colegio'] || p.colegio || '';
      if (!loc) return;
      const norm = normalize(loc);
      if (!map.has(norm)) {
        map.set(norm, { total: 0, acreditados: 0, items: [] });
      }
      const obj = map.get(norm);
      obj.total += 1;
      const cred = String(p.Credenciales || p.credenciales || '').toLowerCase();
      if (cred === 'confirmado') obj.acreditados += 1;
      obj.items.push(p);
    });
    return map;
  }, [allPersoneros]);

  const rawZonas = ZONAS_CONFIG["VILLA MARIA DEL TRIUNFO"] || {};

  // Compute metrics per zona
  const zonasMetrics = useMemo(() => {
    const res = {};
    for (const [zonaName, colegios] of Object.entries(rawZonas)) {
      let totalMesas = 0;
      let totalPersoneros = 0;
      let totalAcreditados = 0;
      let schoolsCount = colegios.length;

      const enrichedColegios = colegios.map(col => {
        totalMesas += col.mesas;
        const norm = normalize(col.colegio);
        let pData = personerosBySchool.get(norm);
        if (!pData) {
          // fuzzy match
          for (const [k, v] of personerosBySchool.entries()) {
            if (k.includes(norm) || norm.includes(k)) {
              pData = v;
              break;
            }
          }
        }
        const assignedCount = pData ? pData.total : 0;
        const acreditadosCount = pData ? pData.acreditados : 0;
        totalPersoneros += assignedCount;
        totalAcreditados += acreditadosCount;

        return {
          ...col,
          assignedCount,
          acreditadosCount,
          coveragePct: col.mesas > 0 ? Math.min(100, Math.round((assignedCount / col.mesas) * 100)) : 0,
          personeros: pData ? pData.items : []
        };
      });

      res[zonaName] = {
        colegios: enrichedColegios,
        totalMesas,
        totalPersoneros,
        totalAcreditados,
        schoolsCount,
        coveragePct: totalMesas > 0 ? Math.min(100, Math.round((totalPersoneros / totalMesas) * 100)) : 0
      };
    }
    return res;
  }, [rawZonas, personerosBySchool]);

  // Global summary metrics
  const globalSummary = useMemo(() => {
    let totalZonas = Object.keys(rawZonas).length;
    let totalLocales = 0;
    let totalMesas = 0;
    let totalPersoneros = 0;
    let totalAcreditados = 0;

    Object.values(zonasMetrics).forEach(z => {
      totalLocales += z.schoolsCount;
      totalMesas += z.totalMesas;
      totalPersoneros += z.totalPersoneros;
      totalAcreditados += z.totalAcreditados;
    });

    return {
      totalZonas,
      totalLocales,
      totalMesas,
      totalPersoneros,
      totalAcreditados,
      globalCoverage: totalMesas > 0 ? Math.min(100, Math.round((totalPersoneros / totalMesas) * 100)) : 0
    };
  }, [rawZonas, zonasMetrics]);

  // Filtered zonas & schools based on search and zona filter
  const filteredZonas = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const res = {};

    for (const [zonaName, zData] of Object.entries(zonasMetrics)) {
      if (selectedZonaFilter !== 'all' && selectedZonaFilter !== zonaName) {
        continue;
      }

      const filteredSchools = zData.colegios.filter(col => {
        if (!q) return true;
        return (
          col.colegio.toLowerCase().includes(q) ||
          (col.direccion && col.direccion.toLowerCase().includes(q)) ||
          zonaName.toLowerCase().includes(q)
        );
      });

      if (filteredSchools.length > 0) {
        res[zonaName] = {
          ...zData,
          colegios: filteredSchools
        };
      }
    }
    return res;
  }, [zonasMetrics, searchQuery, selectedZonaFilter]);

  const toggleZona = (zonaName) => {
    setExpandedZonas(prev => ({
      ...prev,
      [zonaName]: !prev[zonaName]
    }));
  };

  const toggleAll = (expand) => {
    const nextState = {};
    Object.keys(rawZonas).forEach(z => {
      nextState[z] = expand;
    });
    setExpandedZonas(nextState);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', boxSizing: 'border-box' }}>
      {/* HEADER BANNER */}
      <div style={{
        background: isDark
          ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95))'
          : 'linear-gradient(135deg, #f0f9ff 0%, #ede9fe 100%)',
        border: `1.5px solid ${isDark ? '#334155' : '#cbd5e1'}`,
        borderRadius: '16px',
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        boxShadow: isDark ? '0 10px 25px rgba(0,0,0,0.25)' : '0 10px 25px rgba(2, 132, 199, 0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #7c3aed, #0284c7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
              flexShrink: 0
            }}>
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: textTitle, margin: 0, letterSpacing: '-0.02em' }}>
                  🗺️ Mapeo y Distribución por Zonas Electorales
                </h2>
                <span style={{
                  background: '#0284c7',
                  color: '#ffffff',
                  fontSize: '0.72rem',
                  fontWeight: 900,
                  padding: '3px 9px',
                  borderRadius: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}>
                  Villa María del Triunfo
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: textSub, margin: '4px 0 0 0' }}>
                Organización territorial oficial: 7 zonas operativas, 90 locales de votación y 1,242 mesas de sufragio.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => toggleAll(true)}
              style={{
                background: isDark ? '#334155' : '#ffffff',
                border: `1px solid ${borderCol}`,
                color: textTitle,
                fontSize: '0.74rem',
                fontWeight: 700,
                padding: '6px 12px',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              ▼ Expandir Todo
            </button>
            <button
              onClick={() => toggleAll(false)}
              style={{
                background: isDark ? '#334155' : '#ffffff',
                border: `1px solid ${borderCol}`,
                color: textTitle,
                fontSize: '0.74rem',
                fontWeight: 700,
                padding: '6px 12px',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              ▲ Colapsar Todo
            </button>
          </div>
        </div>

        {/* 4 STATS CARDS */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px'
        }}>
          <div style={{
            background: bgCard,
            border: `1px solid ${borderCol}`,
            borderRadius: '12px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(124, 58, 237, 0.15)', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: textSub, textTransform: 'uppercase' }}>Zonas Electorales</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#7c3aed' }}>{globalSummary.totalZonas} Zonas</div>
            </div>
          </div>

          <div style={{
            background: bgCard,
            border: `1px solid ${borderCol}`,
            borderRadius: '12px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(2, 132, 199, 0.15)', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <School className="w-5 h-5" />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: textSub, textTransform: 'uppercase' }}>Locales de Votación</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0284c7' }}>{globalSummary.totalLocales} Colegios</div>
            </div>
          </div>

          <div style={{
            background: bgCard,
            border: `1px solid ${borderCol}`,
            borderRadius: '12px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: textSub, textTransform: 'uppercase' }}>Meta de Mesas</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#10b981' }}>{globalSummary.totalMesas} Mesas</div>
            </div>
          </div>

          <div style={{
            background: bgCard,
            border: `1px solid ${borderCol}`,
            borderRadius: '12px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: textSub, textTransform: 'uppercase' }}>Personeros Registrados</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#f59e0b' }}>
                {globalSummary.totalPersoneros} <span style={{ fontSize: '0.75rem', fontWeight: 700, color: textSub }}>({globalSummary.globalCoverage}%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FILTER BAR & SEARCH */}
      <div style={{
        background: bgCard,
        border: `1px solid ${borderCol}`,
        borderRadius: '14px',
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Search input */}
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search className="w-4 h-4" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Buscar colegio, dirección o zona en VMT..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px 9px 36px',
              borderRadius: '10px',
              border: `1px solid ${borderCol}`,
              background: isDark ? '#0f172a' : '#f8fafc',
              color: textTitle,
              fontSize: '0.82rem',
              fontWeight: 600,
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                fontSize: '0.8rem'
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Zona Pills Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.74rem', fontWeight: 800, color: textSub, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Filter className="w-3.5 h-3.5" /> Zona:
          </span>
          <button
            onClick={() => setSelectedZonaFilter('all')}
            style={{
              padding: '5px 10px',
              borderRadius: '8px',
              fontSize: '0.74rem',
              fontWeight: 800,
              cursor: 'pointer',
              border: `1px solid ${selectedZonaFilter === 'all' ? '#0284c7' : borderCol}`,
              background: selectedZonaFilter === 'all' ? '#0284c7' : (isDark ? '#0f172a' : '#f1f5f9'),
              color: selectedZonaFilter === 'all' ? '#ffffff' : textTitle
            }}
          >
            Todas ({Object.keys(rawZonas).length})
          </button>
          {Object.keys(rawZonas).map(z => {
            const isSel = selectedZonaFilter === z;
            const styleConf = ZONA_COLORS[z] || { border: '#64748b', text: '#0284c7', badge: '📍' };
            const cleanShort = z.replace('ZONA ', '');
            return (
              <button
                key={z}
                onClick={() => setSelectedZonaFilter(z)}
                style={{
                  padding: '5px 10px',
                  borderRadius: '8px',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  border: `1px solid ${isSel ? styleConf.border : borderCol}`,
                  background: isSel ? styleConf.border : (isDark ? '#0f172a' : '#f1f5f9'),
                  color: isSel ? '#ffffff' : (isDark ? '#e2e8f0' : styleConf.text)
                }}
              >
                {styleConf.badge} {cleanShort}
              </button>
            );
          })}
        </div>
      </div>

      {/* LIST OF ZONAS CARDS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {Object.entries(filteredZonas).map(([zonaName, zData]) => {
          const isExp = !!expandedZonas[zonaName];
          const styleConf = ZONA_COLORS[zonaName] || { bg: 'rgba(2,132,199,0.1)', border: '#0284c7', text: '#0284c7', light: '#e0f2fe', badge: '📍' };

          return (
            <div
              key={zonaName}
              style={{
                background: bgCard,
                border: `1.5px solid ${isDark ? borderCol : styleConf.border}`,
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: isDark ? 'none' : '0 4px 14px rgba(0,0,0,0.04)',
                transition: 'all 0.2s ease'
              }}
            >
              {/* ZONA HEADER ACCORDION */}
              <div
                onClick={() => toggleZona(zonaName)}
                style={{
                  padding: '14px 18px',
                  background: isDark ? 'rgba(255,255,255,0.02)' : styleConf.bg,
                  borderBottom: isExp ? `1px solid ${borderCol}` : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  userSelect: 'none',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.25rem' }}>{styleConf.badge}</span>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 900, color: textTitle, margin: 0 }}>
                        {zonaName}
                      </h3>
                      <span style={{
                        background: styleConf.border,
                        color: '#ffffff',
                        fontSize: '0.68rem',
                        fontWeight: 900,
                        padding: '2px 8px',
                        borderRadius: '10px'
                      }}>
                        {zData.colegios.length} Colegios
                      </span>
                    </div>
                    <div style={{ fontSize: '0.74rem', color: textSub, marginTop: '2px', display: 'flex', gap: '12px' }}>
                      <span>Mesas: <strong style={{ color: textTitle }}>{zData.totalMesas}</strong></span>
                      <span>Personeros: <strong style={{ color: styleConf.text }}>{zData.totalPersoneros}</strong></span>
                      <span>Acreditados: <strong style={{ color: '#16a34a' }}>{zData.totalAcreditados}</strong></span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  {/* Progress bar */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px', minWidth: '110px' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: textTitle }}>
                      Cobertura: {zData.coveragePct}%
                    </div>
                    <div style={{ width: '110px', height: '6px', background: isDark ? '#334155' : '#cbd5e1', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${zData.coveragePct}%`,
                        height: '100%',
                        background: zData.coveragePct >= 80 ? '#10b981' : zData.coveragePct >= 40 ? '#f59e0b' : '#ef4444',
                        borderRadius: '4px',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  </div>

                  <button
                    type="button"
                    style={{
                      background: isDark ? '#334155' : '#ffffff',
                      border: `1px solid ${borderCol}`,
                      borderRadius: '8px',
                      padding: '5px 8px',
                      cursor: 'pointer',
                      color: textTitle,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {isExp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* ZONA CONTENT: TABLE OF SCHOOLS */}
              {isExp && (
                <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                      <thead>
                        <tr style={{ borderBottom: `1.5px solid ${borderCol}`, textAlign: 'left', color: textSub }}>
                          <th style={{ padding: '8px 10px', width: '36px' }}>#</th>
                          <th style={{ padding: '8px 10px' }}>Local de Votación / Colegio</th>
                          <th style={{ padding: '8px 10px' }}>Dirección / Ubicación</th>
                          <th style={{ padding: '8px 10px', textAlign: 'center', width: '90px' }}>Mesas</th>
                          <th style={{ padding: '8px 10px', textAlign: 'center', width: '100px' }}>Personeros</th>
                          <th style={{ padding: '8px 10px', textAlign: 'center', width: '110px' }}>Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {zData.colegios.map((col, cIdx) => {
                          const hasFull = col.assignedCount >= col.mesas && col.mesas > 0;
                          const hasPartial = col.assignedCount > 0 && col.assignedCount < col.mesas;

                          return (
                            <tr
                              key={cIdx}
                              style={{
                                borderBottom: `1px solid ${borderCol}`,
                                background: cIdx % 2 === 0 ? 'transparent' : (isDark ? 'rgba(255,255,255,0.015)' : '#f8fafc'),
                                transition: 'background 0.15s'
                              }}
                            >
                              <td style={{ padding: '9px 10px', fontWeight: 800, color: textSub }}>
                                {cIdx + 1}
                              </td>

                              <td style={{ padding: '9px 10px' }}>
                                <div style={{ fontWeight: 800, color: textTitle, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <School className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                                  <span>{col.colegio}</span>
                                </div>
                              </td>

                              <td style={{ padding: '9px 10px', color: textSub }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                                  <span style={{ fontSize: '0.74rem' }}>{col.direccion || '—'}</span>
                                </div>
                              </td>

                              <td style={{ padding: '9px 10px', textAlign: 'center' }}>
                                <span style={{
                                  background: isDark ? 'rgba(2, 132, 199, 0.2)' : '#e0f2fe',
                                  color: '#0284c7',
                                  fontWeight: 900,
                                  fontSize: '0.74rem',
                                  padding: '2px 8px',
                                  borderRadius: '6px'
                                }}>
                                  {col.mesas}
                                </span>
                              </td>

                              <td style={{ padding: '9px 10px', textAlign: 'center' }}>
                                <span style={{
                                  background: hasFull ? '#dcfce7' : hasPartial ? '#fef9c3' : (isDark ? '#334155' : '#f1f5f9'),
                                  color: hasFull ? '#166534' : hasPartial ? '#854d0e' : textSub,
                                  fontWeight: 800,
                                  fontSize: '0.74rem',
                                  padding: '2px 8px',
                                  borderRadius: '6px'
                                }}>
                                  {col.assignedCount} / {col.mesas}
                                </span>
                              </td>

                              <td style={{ padding: '9px 10px', textAlign: 'center' }}>
                                <span style={{
                                  background: hasFull ? '#dcfce7' : hasPartial ? '#fef9c3' : '#fee2e2',
                                  color: hasFull ? '#166534' : hasPartial ? '#854d0e' : '#991b1b',
                                  fontSize: '0.68rem',
                                  fontWeight: 800,
                                  padding: '2px 7px',
                                  borderRadius: '6px',
                                  whiteSpace: 'nowrap'
                                }}>
                                  {hasFull ? '✅ Cubierto' : hasPartial ? '⏳ Parcial' : '❌ Sin Personero'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {Object.keys(filteredZonas).length === 0 && (
          <div style={{
            background: bgCard,
            border: `1px solid ${borderCol}`,
            borderRadius: '12px',
            padding: '40px 20px',
            textAlign: 'center',
            color: textSub
          }}>
            <Building2 className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p style={{ fontWeight: 700, margin: 0 }}>No se encontraron colegios con el filtro ingresado.</p>
          </div>
        )}
      </div>
    </div>
  );
}
