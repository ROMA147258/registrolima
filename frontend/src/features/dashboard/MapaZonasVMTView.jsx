import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  MapPin, School, Users, Building2,
  Search, ZoomIn, ZoomOut, Maximize2, Minimize2,
  Shield, Phone, CheckCircle2, AlertTriangle,
  XCircle, ChevronRight, ChevronLeft, ExternalLink, Eye, RotateCcw,
  Map as MapIcon, X, Copy, Check, Trash2, Undo2, Layers, Filter,
  Download, FileSpreadsheet
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import * as XLSX from 'xlsx';
import { VMT_ZONAS_GEO, VMT_SCHOOLS_GEO } from '../../constants/vmtSchoolsGeo.js';
import { getVmtAssignedZoneForUser } from '../../constants/vmtCoordinadoresZonales.js';

export function MapaZonasVMTView({
  isDark = false,
  allPersoneros = [],
  onFilterByLocal,
  onSelectPersonero,
  assignedZona = null,
  user = null
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersGroupRef = useRef(null);
  const pointMarkersGroupRef = useRef(null);
  const polylineLayerRef = useRef(null);
  const polygonsGroupRef = useRef(null);

  const effectiveAssignedZona = useMemo(() => {
    if (assignedZona) return assignedZona;
    if (user) return getVmtAssignedZoneForUser(user);
    return null;
  }, [assignedZona, user]);

  const [selectedZona, setSelectedZona] = useState(() => effectiveAssignedZona || 'all');
  const [coverageFilter, setCoverageFilter] = useState('all'); // 'all', 'full', 'partial', 'empty'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSchool, setSelectedSchool] = useState(null);

  useEffect(() => {
    if (effectiveAssignedZona) {
      setSelectedZona(effectiveAssignedZona);
    }
  }, [effectiveAssignedZona]);

  // Lista de coordenadas marcadas
  const [pointCoordinates, setPointCoordinates] = useState([]); // [ { id, order, lat, lng } ]
  const [copiedAll, setCopiedAll] = useState(false);
  const [showSchoolsLayer, setShowSchoolsLayer] = useState(true);

  const bgCard = isDark ? '#1e293b' : '#ffffff';
  const borderCol = isDark ? '#334155' : '#e2e8f0';
  const textTitle = isDark ? '#f8fafc' : '#0f172a';
  const textSub = isDark ? '#94a3b8' : '#64748b';

  // Normalizador de texto
  const normalize = (s) => (s || '').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Z0-9]/g, ' ').replace(/\s+/g, ' ').trim();

  // Roles helpers estrictos
  const isZonalRole = (rol) => {
    const r = String(rol || '').toLowerCase();
    return r.includes('zonal') || r.includes('zona');
  };

  const isPCVRole = (rol) => {
    const r = String(rol || '').toLowerCase();
    return r.includes('centro') || r.includes('local') || r.includes('pcv') || r.includes('plv');
  };

  const isMesaRole = (rol) => {
    const r = String(rol || '').toLowerCase();
    if (isZonalRole(r) || isPCVRole(r) || r.includes('distrital') || r.includes('distrito')) return false;
    return true;
  };

  // Clasificación estricta de personeros por colegio
  const schoolPersonnelMap = useMemo(() => {
    const map = new Map();

    allPersoneros.forEach(p => {
      const locAsig = p['Local de Votación Asignado'] || p.localDeVotacionAsignado || p.localAsignado || '';
      const locVota = p['Local de Votación'] || p.localDeVotacion || p.local || p['Colegio'] || p.colegio || '';
      const loc = locAsig || locVota;
      if (!loc) return;

      const pRol = p['Rol a Desempeñar'] || p.rolADesempenar || p.rol_electoral || '';

      const locs = loc.includes(',') ? loc.split(',').map(s => s.trim()) : [loc];
      locs.forEach(singleLoc => {
        const norm = normalize(singleLoc);
        if (!norm) return;
        if (!map.has(norm)) {
          map.set(norm, { mesaPersoneros: [], pcv: null, zonal: null });
        }
        const entry = map.get(norm);

        if (isZonalRole(pRol)) {
          if (!entry.zonal) entry.zonal = p;
        } else if (isPCVRole(pRol)) {
          if (!entry.pcv) entry.pcv = p;
        } else if (isMesaRole(pRol)) {
          entry.mesaPersoneros.push(p);
        }
      });
    });

    return map;
  }, [allPersoneros]);

  // Lista enriquecida de los colegios con datos de personeros y estado (filtrada por zona si el coordinador es zonal)
  const enrichedSchools = useMemo(() => {
    let baseList = VMT_SCHOOLS_GEO;
    if (effectiveAssignedZona) {
      baseList = baseList.filter(s => s.zona === effectiveAssignedZona);
    }

    return baseList.map(col => {
      const norm = normalize(col.colegio);
      let pData = schoolPersonnelMap.get(norm);
      if (!pData) {
        for (const [k, v] of schoolPersonnelMap.entries()) {
          if (k.includes(norm) || norm.includes(k)) {
            pData = v;
            break;
          }
        }
      }

      const mesaPersoneros = pData ? pData.mesaPersoneros : [];
      const pcv = pData ? pData.pcv : null;
      const zonal = pData ? pData.zonal : null;

      const assignedCount = mesaPersoneros.length;
      const acreditadosCount = mesaPersoneros.filter(p => {
        const cred = String(p.Credenciales || p.credenciales || '').toLowerCase();
        return cred === 'confirmado';
      }).length;

      let status = 'empty';
      if (assignedCount >= col.mesas && col.mesas > 0) {
        status = 'full';
      } else if (assignedCount > 0) {
        status = 'partial';
      }

      return {
        ...col,
        assignedCount,
        acreditadosCount,
        coveragePct: col.mesas > 0 ? Math.min(100, Math.round((assignedCount / col.mesas) * 100)) : 0,
        mesaPersoneros,
        pcv,
        zonal,
        status
      };
    });
  }, [schoolPersonnelMap]);

  // Resumen global de métricas
  const metrics = useMemo(() => {
    let totalLocales = enrichedSchools.length;
    let totalMesas = 0;
    let totalPersoneros = 0;
    let cubiertos = 0;
    let parciales = 0;
    let vacios = 0;

    enrichedSchools.forEach(s => {
      totalMesas += s.mesas;
      totalPersoneros += s.assignedCount;
      if (s.status === 'full') cubiertos++;
      else if (s.status === 'partial') parciales++;
      else vacios++;
    });

    return {
      totalLocales,
      totalMesas,
      totalPersoneros,
      cubiertos,
      parciales,
      vacios,
      coveragePct: totalMesas > 0 ? Math.min(100, Math.round((totalPersoneros / totalMesas) * 100)) : 0
    };
  }, [enrichedSchools]);

  // Filtrado de colegios
  const filteredSchools = useMemo(() => {
    return enrichedSchools.filter(col => {
      if (selectedZona !== 'all' && col.zona !== selectedZona) return false;
      if (coverageFilter !== 'all' && col.status !== coverageFilter) return false;

      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;

      const matchName = col.colegio.toLowerCase().includes(q) || (col.direccion && col.direccion.toLowerCase().includes(q));
      const matchZona = col.zona.toLowerCase().includes(q) || col.zonaShort.toLowerCase().includes(q);
      const matchPersonero = col.mesaPersoneros.some(p => {
        const pName = String(p['Nombres y Apellidos'] || p.nombresApellidos || '').toLowerCase();
        const pDni = String(p['D.N.I.'] || p.dni || '');
        return pName.includes(q) || pDni.includes(q);
      });

      return matchName || matchZona || matchPersonero;
    });
  }, [enrichedSchools, selectedZona, coverageFilter, searchQuery]);

  // INICIALIZACIÓN DEL MAPA LEAFLET
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialCenter = effectiveAssignedZona && VMT_ZONAS_GEO[effectiveAssignedZona]
        ? VMT_ZONAS_GEO[effectiveAssignedZona].center
        : [-12.1640, -76.9320];
      const initialZoom = effectiveAssignedZona ? 14.5 : 13.5;

      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: initialZoom,
        minZoom: 11,
        maxZoom: 19,
        zoomControl: false
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      const tileUrl = isDark
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

      L.tileLayer(tileUrl, {
        attribution: '&copy; OpenStreetMap contributors | VMT Zonas Electorales',
        maxZoom: 19
      }).addTo(map);

      polygonsGroupRef.current = L.layerGroup().addTo(map);
      markersGroupRef.current = L.layerGroup().addTo(map);
      pointMarkersGroupRef.current = L.layerGroup().addTo(map);
      polylineLayerRef.current = L.layerGroup().addTo(map);

      // CLICK EN EL MAPA PARA AGREGAR PUNTO DE COORDENADA
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        const latNum = Number(lat.toFixed(6));
        const lngNum = Number(lng.toFixed(6));

        setPointCoordinates(prev => {
          const newOrder = prev.length + 1;
          const newPoint = {
            id: `pt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            order: newOrder,
            lat: latNum,
            lng: lngNum
          };
          return [...prev, newPoint];
        });
      });

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isDark, effectiveAssignedZona]);

  // ACTUALIZACIÓN DE PUNTOS DE COORDENADAS MARCADAS (PUNTOS ROJOS DISCRETOS Y LÍNEAS)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !pointMarkersGroupRef.current || !polylineLayerRef.current) return;

    pointMarkersGroupRef.current.clearLayers();
    polylineLayerRef.current.clearLayers();

    if (pointCoordinates.length > 1) {
      const latLngs = pointCoordinates.map(p => [p.lat, p.lng]);
      const polyline = L.polyline(latLngs, {
        color: '#ef4444',
        weight: 2,
        dashArray: '4, 4',
        opacity: 0.8
      });
      polyline.addTo(polylineLayerRef.current);
    }

    pointCoordinates.forEach((pt) => {
      const markerHtml = `
        <div style="
          width: 14px;
          height: 14px;
          background: #ef4444;
          border: 2px solid #ffffff;
          border-radius: 50%;
          box-shadow: 0 0 6px rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 8px;
          color: #fff;
          font-weight: 900;
          cursor: pointer;
        ">
          ${pt.order}
        </div>
      `;

      const pinIcon = L.divIcon({
        className: 'vmt-coord-point-dot',
        html: markerHtml,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      const marker = L.marker([pt.lat, pt.lng], { icon: pinIcon });
      marker.bindTooltip(`Punto ${pt.order}: [${pt.lat}, ${pt.lng}]`, { direction: 'top' });
      marker.addTo(pointMarkersGroupRef.current);
    });
  }, [pointCoordinates]);

  // POLÍGONOS DE ZONAS
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !polygonsGroupRef.current) return;

    polygonsGroupRef.current.clearLayers();

    const zonesToShow = effectiveAssignedZona
      ? Object.entries(VMT_ZONAS_GEO).filter(([zName]) => zName === effectiveAssignedZona)
      : Object.entries(VMT_ZONAS_GEO);

    zonesToShow.forEach(([zName, zGeo]) => {
      const isCurrentZona = selectedZona === 'all' || selectedZona === zName;
      const opacity = isCurrentZona ? 0.25 : 0.05;
      const strokeOpacity = isCurrentZona ? 0.9 : 0.3;

      const polygon = L.polygon(zGeo.polygon, {
        color: zGeo.color,
        weight: isCurrentZona ? 3.5 : 1.5,
        opacity: strokeOpacity,
        fillColor: zGeo.fillColor,
        fillOpacity: opacity,
        dashArray: isCurrentZona ? '4, 4' : '2, 6'
      });

      polygon.bindTooltip(`<strong>${zGeo.badge} ${zGeo.name}</strong>`, {
        permanent: false,
        direction: 'center'
      });

      if (!effectiveAssignedZona) {
        polygon.on('click', () => {
          setSelectedZona(zName);
          map.flyTo(zGeo.center, 15, { duration: 0.8 });
        });
      }

      polygon.addTo(polygonsGroupRef.current);
    });
  }, [selectedZona, effectiveAssignedZona]);

  // MARCADORES DE COLEGIOS
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !markersGroupRef.current) return;

    markersGroupRef.current.clearLayers();

    if (!showSchoolsLayer) return;

    filteredSchools.forEach(col => {
      const statusColor = col.status === 'full' ? '#16a34a' : col.status === 'partial' ? '#f59e0b' : '#dc2626';
      const statusBg = col.status === 'full' ? '#dcfce7' : col.status === 'partial' ? '#fef9c3' : '#fee2e2';
      const isSelected = selectedSchool?.colegio === col.colegio;

      const customIcon = L.divIcon({
        className: 'vmt-school-marker-container',
        html: `
          <div style="
            position: relative;
            background: ${isSelected ? '#0284c7' : statusBg};
            color: ${isSelected ? '#ffffff' : statusColor};
            border: 2px solid ${isSelected ? '#ffffff' : statusColor};
            width: ${isSelected ? '30px' : '24px'};
            height: ${isSelected ? '30px' : '24px'};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: ${isSelected ? '11px' : '9px'};
            font-weight: 900;
            box-shadow: 0 ${isSelected ? '6px 14px' : '2px 6px'} rgba(0,0,0,0.3);
            transform: translate(-50%, -50%);
            cursor: pointer;
            transition: all 0.2s ease;
          ">
            <span>${col.assignedCount}</span>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const marker = L.marker([col.lat, col.lng], { icon: customIcon });

      const popupContent = `
        <div style="font-family: system-ui, sans-serif; min-width: 220px; padding: 4px;">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
            <span style="font-size: 14px;">🏫</span>
            <strong style="font-size: 12px; color: #0f172a;">${col.colegio}</strong>
          </div>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">📍 ${col.direccion || 'Sin dirección'}</div>
          <div style="font-size: 11px; margin-bottom: 6px;">Mesas: <strong>${col.mesas}</strong> &bull; Personeros: <strong style="color: ${statusColor};">${col.assignedCount}</strong></div>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on('click', () => setSelectedSchool(col));
      marker.addTo(markersGroupRef.current);
    });
  }, [showSchoolsLayer, filteredSchools, selectedSchool]);

  // Centrar mapa en un colegio seleccionado desde la lista
  const handleSelectSchoolFromList = (col) => {
    setSelectedSchool(col);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([col.lat, col.lng], 16, { duration: 0.8 });
    }
  };

  // Acciones de retroceder y copiar
  const handleUndoPoint = () => {
    setPointCoordinates(prev => prev.slice(0, -1));
  };

  const handleClearAllPoints = () => {
    setPointCoordinates([]);
  };

  const handleCopyCoordinates = () => {
    if (pointCoordinates.length === 0) return;
    const arrayFormat = JSON.stringify(pointCoordinates.map(p => [p.lat, p.lng]));
    navigator.clipboard.writeText(arrayFormat);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  // EXPORTAR EXCEL DETALLADO DONDE CADA ZONA ES UNA HOJA NUEVA
  const handleExportExcelZonal = () => {
    const isSpecificZona = selectedZona !== 'all';

    // Función auxiliar para construir los datos detallados de colegios y personeros de una lista de colegios
    const buildZoneSheetData = (schoolsInZone) => {
      const sheetData = [];
      let rowIdx = 1;

      schoolsInZone.forEach(sch => {
        const pcvName = sch.pcv ? (sch.pcv['Nombres y Apellidos'] || sch.pcv.nombresApellidos || '') : 'PENDIENTE';
        const pcvDni = sch.pcv ? (sch.pcv['D.N.I.'] || sch.pcv.dni || '') : '-';
        const pcvCel = sch.pcv ? (sch.pcv['Celular'] || sch.pcv.celular || '') : '-';

        const zonalName = sch.zonal ? (sch.zonal['Nombres y Apellidos'] || sch.zonal.nombresApellidos || '') : 'POR ASIGNAR';
        const zonalDni = sch.zonal ? (sch.zonal['D.N.I.'] || sch.zonal.dni || '') : '-';
        const zonalCel = sch.zonal ? (sch.zonal['Celular'] || sch.zonal.celular || '') : '-';

        if (sch.mesaPersoneros.length === 0) {
          sheetData.push({
            'N°': rowIdx++,
            'Colegio / Local': sch.colegio,
            'Dirección del Local': sch.direccion || 'Sin dirección',
            'Mesas Totales': sch.mesas,
            'Personeros de Mesa': 0,
            'Coord. Local (PCV)': pcvName,
            'DNI PCV': pcvDni,
            'Celular PCV': pcvCel,
            'Coordinador Zonal': zonalName,
            'DNI Zonal': zonalDni,
            'Celular Zonal': zonalCel,
            'Rol Integrante': 'Sin personeros de mesa',
            'Nombres y Apellidos Personero': '(No hay personeros de mesa registrados aún)',
            'DNI': '-',
            'Celular': '-',
            'Mesa Asignada': '-',
            'Acreditación': 'Pendiente',
            'Capacitación': 'Pendiente',
            'Experiencia': '-',
            'Movilidad': '-'
          });
        } else {
          sch.mesaPersoneros.forEach(p => {
            const cred = String(p['Credenciales'] || p.credenciales || '').toLowerCase();
            const isAcred = cred === 'confirmado' ? 'Confirmado' : 'Pendiente';
            const preg = String(p['Preguntas'] || p.preguntas || '').toLowerCase();
            const isAprob = preg.includes('aprob') ? 'Aprobado' : 'Pendiente';

            sheetData.push({
              'N°': rowIdx++,
              'Colegio / Local': sch.colegio,
              'Dirección del Local': sch.direccion || 'Sin dirección',
              'Mesas Totales': sch.mesas,
              'Personeros de Mesa': sch.assignedCount,
              'Coord. Local (PCV)': pcvName,
              'DNI PCV': pcvDni,
              'Celular PCV': pcvCel,
              'Coordinador Zonal': zonalName,
              'DNI Zonal': zonalDni,
              'Celular Zonal': zonalCel,
              'Rol Integrante': 'Personero de Mesa',
              'Nombres y Apellidos Personero': p['Nombres y Apellidos'] || p.nombresApellidos || '',
              'DNI': p['D.N.I.'] || p.dni || '',
              'Celular': p['Celular'] || p.celular || '',
              'Mesa Asignada': p['Mesa de Sufragio'] || p.mesaDeSufragio || p.mesa || 'Sin mesa',
              'Acreditación': isAcred,
              'Capacitación': isAprob,
              'Experiencia': p['Experiencia como Personero'] || p.experiencia || 'No',
              'Movilidad': p['Cuenta con Movilidad'] || p.movilidad || 'No'
            });
          });
        }
      });

      return sheetData;
    };

    // Función auxiliar para auto-ajustar ancho de columnas en hojas Excel
    const autoFitColumns = (ws) => {
      const colWidths = [];
      const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
      for (let C = range.s.c; C <= range.e.c; ++C) {
        let maxLen = 12;
        for (let R = range.s.r; R <= range.e.r; ++R) {
          const cell = ws[XLSX.utils.encode_cell({ r: R, c: C })];
          if (cell && cell.v) {
            const valLen = String(cell.v).length;
            if (valLen > maxLen) maxLen = valLen;
          }
        }
        colWidths.push({ wch: Math.min(maxLen + 3, 50) });
      }
      ws['!cols'] = colWidths;
    };

    // Crear nuevo libro Excel
    const wb = XLSX.utils.book_new();

    // 1. HOJA 1: RESUMEN GENERAL CONSOLIDADOR DE TODAS LAS ZONAS
    const zonasSummary = {};
    enrichedSchools.forEach(sch => {
      if (!zonasSummary[sch.zona]) {
        zonasSummary[sch.zona] = {
          zona: sch.zona,
          short: sch.zonaShort,
          totalColegios: 0,
          totalMesas: 0,
          totalPersoneros: 0,
          zonal: sch.zonal ? (sch.zonal['Nombres y Apellidos'] || sch.zonal.nombresApellidos || '') : 'POR ASIGNAR',
          celularZonal: sch.zonal ? (sch.zonal['Celular'] || sch.zonal.celular || '-') : '-'
        };
      }
      zonasSummary[sch.zona].totalColegios++;
      zonasSummary[sch.zona].totalMesas += sch.mesas;
      zonasSummary[sch.zona].totalPersoneros += sch.assignedCount;
    });

    const summaryData = Object.values(zonasSummary).map((z, idx) => ({
      'N°': idx + 1,
      'Zona Territorial': z.zona,
      'Total Colegios': z.totalColegios,
      'Total Mesas': z.totalMesas,
      'Personeros de Mesa Registrados': z.totalPersoneros,
      'Mesas Faltantes': Math.max(0, z.totalMesas - z.totalPersoneros),
      '% Cobertura': z.totalMesas > 0 ? `${Math.min(100, Math.round((z.totalPersoneros / z.totalMesas) * 100))}%` : '0%',
      'Coordinador Zonal': z.zonal,
      'Celular Coordinador': z.celularZonal
    }));

    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    autoFitColumns(wsSummary);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumen General VMT');

    // 2. CREAR UNA HOJA DEDICADA POR CADA ZONA TERRITORIAL
    const zonesToExport = isSpecificZona
      ? [selectedZona]
      : Object.keys(VMT_ZONAS_GEO);

    zonesToExport.forEach(zoneKey => {
      const schoolsInThisZone = enrichedSchools.filter(s => s.zona === zoneKey);
      if (schoolsInThisZone.length === 0) return;

      const zoneSheetData = buildZoneSheetData(schoolsInThisZone);
      const wsZone = XLSX.utils.json_to_sheet(zoneSheetData);
      autoFitColumns(wsZone);

      // Nombre de la pestaña (límite Excel 31 caracteres)
      const geoInfo = VMT_ZONAS_GEO[zoneKey];
      const tabName = geoInfo ? `Zona ${geoInfo.short}` : zoneKey.replace('ZONA ', 'Zona ');
      const cleanTabName = tabName.substring(0, 31);

      XLSX.utils.book_append_sheet(wb, wsZone, cleanTabName);
    });

    // Descargar archivo Excel con nombre claro
    const cleanName = isSpecificZona ? selectedZona.replace(/[^A-Za-z0-9]/g, '_') : 'Todas_Las_Zonas_Separadas';
    const fileName = `Reporte_VMT_${cleanName}_2026.xlsx`;

    XLSX.writeFile(wb, fileName);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%', boxSizing: 'border-box' }}>
      
      {/* HEADER COMPACTO CON SELECTOR DE ZONAS Y BOTÓN EXPORTAR EXCEL */}
      <div style={{
        background: bgCard,
        border: `1px solid ${borderCol}`,
        borderRadius: '12px',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.2rem' }}>🗺️</span>
          <div>
            <h2 style={{ fontSize: '0.98rem', fontWeight: 900, color: textTitle, margin: 0 }}>
              Mapa Territorial GPS • Villa María del Triunfo
            </h2>
            <span style={{ fontSize: '0.72rem', color: textSub }}>
              {selectedZona === 'all' ? 'Mostrando todas las 7 zonas' : `Filtrado por: ${selectedZona}`} &bull; {filteredSchools.length} colegios
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Botón Exportar Excel de la Zona */}
          <button
            onClick={handleExportExcelZonal}
            title={selectedZona === 'all' ? "Exportar Excel de todas las zonas" : `Exportar Excel de ${selectedZona}`}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1.5px solid #16a34a',
              background: isDark ? 'rgba(22, 163, 74, 0.15)' : '#dcfce7',
              color: '#15803d',
              fontSize: '0.74rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 6px rgba(22, 163, 74, 0.2)'
            }}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Exportar Excel {effectiveAssignedZona ? `(Zona ${VMT_ZONAS_GEO[effectiveAssignedZona]?.short || effectiveAssignedZona.replace('ZONA ', '')})` : (selectedZona === 'all' ? '(Todas las Zonas)' : `(${selectedZona.replace('ZONA ', 'Zona ')})`)}</span>
          </button>
        </div>

        {/* Filtros de zona */}
        <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', scrollbarWidth: 'none', paddingTop: '6px', borderTop: `1px dashed ${borderCol}` }}>
          {effectiveAssignedZona ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '2px 0' }}>
              <span style={{ fontSize: '0.74rem', color: textSub, fontWeight: 700 }}>
                Tu Zona Territorial Asignada:
              </span>
              <span style={{
                padding: '4px 12px',
                borderRadius: '12px',
                background: VMT_ZONAS_GEO[effectiveAssignedZona]?.color || '#0284c7',
                color: '#ffffff',
                fontSize: '0.76rem',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
              }}>
                {VMT_ZONAS_GEO[effectiveAssignedZona]?.badge || '📍'} {effectiveAssignedZona} ({filteredSchools.length} Colegios)
              </span>
            </div>
          ) : (
            <>
              <button
                onClick={() => {
                  setSelectedZona('all');
                  if (mapInstanceRef.current) mapInstanceRef.current.flyTo([-12.1640, -76.9320], 13.5, { duration: 0.8 });
                }}
                style={{
                  padding: '4px 10px',
                  borderRadius: '12px',
                  border: `1px solid ${selectedZona === 'all' ? '#0284c7' : borderCol}`,
                  background: selectedZona === 'all' ? '#0284c7' : 'transparent',
                  color: selectedZona === 'all' ? '#fff' : textTitle,
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                Todas ({metrics.totalLocales})
              </button>
              {Object.entries(VMT_ZONAS_GEO).map(([zKey, zGeo]) => (
                <button
                  key={zKey}
                  onClick={() => {
                    setSelectedZona(zKey);
                    if (mapInstanceRef.current) mapInstanceRef.current.flyTo(zGeo.center, 15, { duration: 0.8 });
                  }}
                  style={{
                    padding: '4px 9px',
                    borderRadius: '12px',
                    border: `1px solid ${selectedZona === zKey ? zGeo.color : borderCol}`,
                    background: selectedZona === zKey ? zGeo.color : 'transparent',
                    color: selectedZona === zKey ? '#fff' : textSub,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {zGeo.badge} {zGeo.name.replace('ZONA ', '')}
                </button>
              ))}
            </>
          )}
        </div>
      </div>

      {/* CONTENEDOR PRINCIPAL DE 2 COLUMNAS: MAPA + LISTA DETALLADA DE COLEGIOS AL COSTADO */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) 380px',
        gap: '16px',
        alignItems: 'start'
      }}>
        
        {/* COLUMNA 1: MAPA LEAFLET */}
        <div style={{
          background: bgCard,
          border: `1.5px solid ${borderCol}`,
          borderRadius: '16px',
          overflow: 'hidden',
          position: 'relative',
          boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.3)' : '0 4px 16px rgba(0,0,0,0.06)'
        }}>
          
          {/* LIENZO LEAFLET */}
          <div
            ref={mapContainerRef}
            style={{
              width: '100%',
              height: '660px',
              background: isDark ? '#0f172a' : '#f8fafc',
              cursor: 'crosshair',
              zIndex: 1
            }}
          />

          {/* WIDGET / LISTA PEQUEÑA FLOTANTE DE COORDENADAS MARCADAS */}
          {pointCoordinates.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              width: '260px',
              maxHeight: '320px',
              background: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(8px)',
              border: `1.5px solid ${isDark ? '#334155' : '#cbd5e1'}`,
              borderRadius: '12px',
              padding: '10px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              animation: 'fadeIn 0.15s ease-out'
            }}>
              {/* Header del Widget */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ fontSize: '0.9rem' }}>📍</span>
                  <strong style={{ fontSize: '0.78rem', color: textTitle }}>
                    Coordenadas ({pointCoordinates.length})
                  </strong>
                </div>

                <button
                  onClick={handleClearAllPoints}
                  title="Limpiar todo"
                  style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.68rem', fontWeight: 800, cursor: 'pointer', padding: '2px' }}
                >
                  Limpiar
                </button>
              </div>

              {/* Lista Pequeña y Compacta con Scroll */}
              <div style={{
                maxHeight: '130px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                paddingRight: '2px'
              }}>
                {pointCoordinates.map((pt) => (
                  <div
                    key={pt.id}
                    style={{
                      background: isDark ? '#1e293b' : '#f8fafc',
                      border: `1px solid ${borderCol}`,
                      borderRadius: '6px',
                      padding: '4px 8px',
                      fontSize: '0.7rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontFamily: 'monospace'
                    }}
                  >
                    <span style={{ color: '#ef4444', fontWeight: 900 }}>#{pt.order}</span>
                    <span style={{ color: textTitle }}>[{pt.lat}, {pt.lng}]</span>
                  </div>
                ))}
              </div>

              {/* BOTONES DE ACCIÓN: RETROCEDER Y COPIAR */}
              <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
                <button
                  onClick={handleUndoPoint}
                  style={{
                    flex: 1,
                    padding: '6px 8px',
                    borderRadius: '6px',
                    border: `1px solid ${borderCol}`,
                    background: isDark ? '#334155' : '#f1f5f9',
                    color: textTitle,
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  <Undo2 className="w-3.5 h-3.5 text-amber-500" />
                  <span>Retroceder</span>
                </button>

                <button
                  onClick={handleCopyCoordinates}
                  style={{
                    flex: 1.2,
                    padding: '6px 8px',
                    borderRadius: '6px',
                    border: 'none',
                    background: copiedAll ? '#16a34a' : '#0284c7',
                    color: '#ffffff',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    boxShadow: '0 2px 6px rgba(2, 132, 199, 0.3)'
                  }}
                >
                  {copiedAll ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedAll ? '¡Copiado!' : 'Copiar'}</span>
                </button>
              </div>
            </div>
          )}

          {/* BARRA INFORMATIVA INFERIOR */}
          <div style={{
            padding: '8px 12px',
            background: isDark ? 'rgba(255,255,255,0.02)' : '#f1f5f9',
            borderTop: `1px solid ${borderCol}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.72rem',
            color: textSub
          }}>
            <span>📍 Haz clic en el mapa para marcar puntos de coordenadas</span>
            <span>{filteredSchools.length} colegios en la vista</span>
          </div>
        </div>

        {/* COLUMNA 2: PANEL LATERAL DETALLADO DE COLEGIOS */}
        <div style={{
          background: bgCard,
          border: `1.5px solid ${borderCol}`,
          borderRadius: '16px',
          padding: '14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          height: '660px',
          boxSizing: 'border-box',
          boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.3)' : '0 4px 16px rgba(0,0,0,0.06)'
        }}>
          
          {/* CASO A: DETALLE EXTENDIDO DE UN COLEGIO SELECCIONADO */}
          {selectedSchool ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', height: '100%', overflowY: 'auto' }}>
              {/* Botón Volver a la Lista */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  onClick={() => setSelectedSchool(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#0284c7',
                    fontWeight: 800,
                    fontSize: '0.76rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: 0
                  }}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Volver a lista de colegios</span>
                </button>
                <span style={{
                  background: selectedSchool.status === 'full' ? '#dcfce7' : selectedSchool.status === 'partial' ? '#fef9c3' : '#fee2e2',
                  color: selectedSchool.status === 'full' ? '#166534' : selectedSchool.status === 'partial' ? '#854d0e' : '#991b1b',
                  fontSize: '0.66rem',
                  fontWeight: 800,
                  padding: '2px 6px',
                  borderRadius: '4px'
                }}>
                  {selectedSchool.status === 'full' ? 'Cubierto' : selectedSchool.status === 'partial' ? 'Parcial' : 'Sin Personero'}
                </span>
              </div>

              {/* Nombre y datos del colegio */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                  <span style={{ fontSize: '1rem' }}>🏫</span>
                  <h3 style={{ fontSize: '0.92rem', fontWeight: 900, color: textTitle, margin: 0 }}>
                    {selectedSchool.colegio}
                  </h3>
                </div>
                <div style={{ fontSize: '0.72rem', color: textSub, marginTop: '2px' }}>
                  📍 {selectedSchool.direccion || 'Sin dirección registrada'}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#8b5cf6', fontWeight: 800, marginTop: '2px' }}>
                  {selectedSchool.zonaBadge} {selectedSchool.zona}
                </div>
              </div>

              {/* Cobertura y Mesas */}
              <div style={{
                background: isDark ? '#0f172a' : '#f8fafc',
                border: `1px solid ${borderCol}`,
                borderRadius: '8px',
                padding: '8px 10px',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.74rem'
              }}>
                <div>
                  <div style={{ fontSize: '0.66rem', color: textSub, fontWeight: 700 }}>MESAS DE SUFRAGIO</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 900, color: textTitle }}>{selectedSchool.mesas} Mesas</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.66rem', color: textSub, fontWeight: 700 }}>PERSONEROS DE MESA</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 900, color: selectedSchool.assignedCount >= selectedSchool.mesas ? '#16a34a' : '#f59e0b' }}>
                    {selectedSchool.assignedCount} ({selectedSchool.coveragePct}%)
                  </div>
                </div>
              </div>

              {/* Estructura de Coordinación: PCV y Zonal */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ fontSize: '0.74rem', fontWeight: 800, color: textTitle }}>🏛️ Estructura de Coordinación:</div>

                {/* PCV */}
                <div style={{
                  background: isDark ? 'rgba(2, 132, 199, 0.1)' : '#f0f9ff',
                  border: '1.5px solid #bae6fd',
                  borderRadius: '8px',
                  padding: '8px 10px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#0369a1' }}>🛡️ Coord. de Local (PCV)</span>
                    <span style={{ fontSize: '0.6rem', fontWeight: 800, color: selectedSchool.pcv ? '#166534' : '#991b1b' }}>
                      {selectedSchool.pcv ? 'ASIGNADO' : 'PENDIENTE'}
                    </span>
                  </div>
                  {selectedSchool.pcv ? (
                    <div style={{ marginTop: '2px' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.78rem', color: textTitle }}>
                        {selectedSchool.pcv['Nombres y Apellidos'] || selectedSchool.pcv.nombresApellidos}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: textSub, display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
                        <span>DNI: {selectedSchool.pcv['D.N.I.'] || selectedSchool.pcv.dni}</span>
                        {(selectedSchool.pcv['Celular'] || selectedSchool.pcv.celular) && (
                          <a
                            href={`https://wa.me/51${String(selectedSchool.pcv['Celular'] || selectedSchool.pcv.celular).replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: '#16a34a', fontWeight: 800, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '2px' }}
                          >
                            <Phone className="w-3 h-3" />
                            <span>{selectedSchool.pcv['Celular'] || selectedSchool.pcv.celular}</span>
                          </a>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.7rem', color: '#ef4444', fontStyle: 'italic', marginTop: '2px' }}>
                      Sin PCV asignado
                    </div>
                  )}
                </div>

                {/* Zonal */}
                <div style={{
                  background: isDark ? 'rgba(139, 92, 246, 0.1)' : '#f5f3ff',
                  border: '1.5px solid #ddd6fe',
                  borderRadius: '8px',
                  padding: '8px 10px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#7c3aed' }}>🗺️ Coordinador Zonal</span>
                    <span style={{ fontSize: '0.6rem', fontWeight: 800, color: selectedSchool.zonal ? '#6d28d9' : '#854d0e' }}>
                      {selectedSchool.zonal ? 'A CARGO' : 'POR ASIGNAR'}
                    </span>
                  </div>
                  {selectedSchool.zonal ? (
                    <div style={{ marginTop: '2px' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.78rem', color: textTitle }}>
                        {selectedSchool.zonal['Nombres y Apellidos'] || selectedSchool.zonal.nombresApellidos}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: textSub, display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
                        <span>DNI: {selectedSchool.zonal['D.N.I.'] || selectedSchool.zonal.dni}</span>
                        {(selectedSchool.zonal['Celular'] || selectedSchool.zonal.celular) && (
                          <a
                            href={`https://wa.me/51${String(selectedSchool.zonal['Celular'] || selectedSchool.zonal.celular).replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: '#16a34a', fontWeight: 800, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '2px' }}
                          >
                            <Phone className="w-3 h-3" />
                            <span>{selectedSchool.zonal['Celular'] || selectedSchool.zonal.celular}</span>
                          </a>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.7rem', color: textSub, fontStyle: 'italic', marginTop: '2px' }}>
                      Coordinador Zonal de {selectedSchool.zonaShort}
                    </div>
                  )}
                </div>
              </div>

              {/* Personeros de Mesa */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: textTitle }}>
                    👥 Personeros de Mesa ({selectedSchool.assignedCount} de {selectedSchool.mesas}):
                  </span>
                  <span style={{ fontSize: '0.68rem', color: textSub }}>{selectedSchool.coveragePct}% Cubierto</span>
                </div>

                {selectedSchool.mesaPersoneros.length === 0 ? (
                  <div style={{
                    background: isDark ? '#0f172a' : '#f8fafc',
                    border: `1px dashed ${borderCol}`,
                    borderRadius: '8px',
                    padding: '10px',
                    textAlign: 'center',
                    fontSize: '0.72rem',
                    color: '#ef4444'
                  }}>
                    ⚠️ No hay personeros de mesa registrados todavía en este local de votación.
                  </div>
                ) : (
                  <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                    {selectedSchool.mesaPersoneros.map((p, pIdx) => {
                      const cred = String(p.Credenciales || p.credenciales || '').toLowerCase();
                      const isAcred = cred === 'confirmado';
                      const mesaNum = p['Mesa de Sufragio'] || p.mesaDeSufragio || p.mesa || 'Sin mesa';

                      return (
                        <div
                          key={pIdx}
                          style={{
                            background: isDark ? '#0f172a' : '#f8fafc',
                            border: `1px solid ${borderCol}`,
                            borderRadius: '6px',
                            padding: '6px 8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '6px'
                          }}
                        >
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ fontWeight: 800, fontSize: '0.74rem', color: textTitle, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {p['Nombres y Apellidos'] || p.nombresApellidos}
                            </div>
                            <div style={{ fontSize: '0.66rem', color: textSub }}>
                              Mesa: <strong>{mesaNum}</strong> &bull; DNI: {p['D.N.I.'] || p.dni}
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <span style={{
                              fontSize: '0.58rem',
                              fontWeight: 800,
                              padding: '1px 4px',
                              borderRadius: '3px',
                              background: isAcred ? '#dcfce7' : '#fef9c3',
                              color: isAcred ? '#166534' : '#854d0e'
                            }}>
                              {isAcred ? '✅ Acreditado' : '⏳ Pendiente'}
                            </span>
                            {onSelectPersonero && (
                              <button
                                onClick={() => onSelectPersonero(p)}
                                title="Ver ficha"
                                style={{ background: 'none', border: 'none', color: '#0284c7', cursor: 'pointer', padding: '2px' }}
                              >
                                <Eye className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Botón ver en panel general */}
              {onFilterByLocal && (
                <button
                  onClick={() => onFilterByLocal(selectedSchool.colegio)}
                  style={{
                    width: '100%',
                    padding: '7px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#0284c7',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '0.74rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  <span>Ver Personeros en Panel General</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            /* CASO B: LISTA GENERAL DE COLEGIOS CON BÚSQUEDA Y FILTROS */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', height: '100%' }}>
              {/* Header de la lista */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '1rem' }}>🏫</span>
                    <strong style={{ fontSize: '0.88rem', color: textTitle }}>
                      Colegios Electorales ({filteredSchools.length})
                    </strong>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: textSub, fontWeight: 700 }}>
                    {selectedZona === 'all' ? 'Todas las Zonas' : selectedZona}
                  </span>
                </div>

                {/* Buscador de Colegios */}
                <div style={{ position: 'relative' }}>
                  <Search className="w-3.5 h-3.5 text-sky-500" style={{ position: 'absolute', left: '10px', top: '8px' }} />
                  <input
                    type="text"
                    placeholder="Buscar colegio, dirección..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '5px 8px 5px 28px',
                      borderRadius: '6px',
                      border: `1px solid ${borderCol}`,
                      background: isDark ? '#0f172a' : '#ffffff',
                      color: textTitle,
                      fontSize: '0.76rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Filtros de estado rápidos */}
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setCoverageFilter('all')}
                  style={{
                    padding: '2px 6px',
                    borderRadius: '10px',
                    border: `1px solid ${coverageFilter === 'all' ? '#0284c7' : borderCol}`,
                    background: coverageFilter === 'all' ? '#0284c7' : 'transparent',
                    color: coverageFilter === 'all' ? '#fff' : textSub,
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Todos ({enrichedSchools.length})
                </button>
                <button
                  onClick={() => setCoverageFilter('full')}
                  style={{
                    padding: '2px 6px',
                    borderRadius: '10px',
                    border: `1px solid ${coverageFilter === 'full' ? '#16a34a' : borderCol}`,
                    background: coverageFilter === 'full' ? '#16a34a' : 'transparent',
                    color: coverageFilter === 'full' ? '#fff' : '#16a34a',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  🟢 Cubiertos ({metrics.cubiertos})
                </button>
                <button
                  onClick={() => setCoverageFilter('partial')}
                  style={{
                    padding: '2px 6px',
                    borderRadius: '10px',
                    border: `1px solid ${coverageFilter === 'partial' ? '#f59e0b' : borderCol}`,
                    background: coverageFilter === 'partial' ? '#f59e0b' : 'transparent',
                    color: coverageFilter === 'partial' ? '#fff' : '#d97706',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  🟡 Parciales ({metrics.parciales})
                </button>
                <button
                  onClick={() => setCoverageFilter('empty')}
                  style={{
                    padding: '2px 6px',
                    borderRadius: '10px',
                    border: `1px solid ${coverageFilter === 'empty' ? '#ef4444' : borderCol}`,
                    background: coverageFilter === 'empty' ? '#ef4444' : 'transparent',
                    color: coverageFilter === 'empty' ? '#fff' : '#dc2626',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  🔴 Sin personeros ({metrics.vacios})
                </button>
              </div>

              {/* LISTA SCROLLEABLE DE COLEGIOS */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                paddingRight: '2px'
              }}>
                {filteredSchools.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px 10px', color: textSub, fontSize: '0.78rem' }}>
                    No se encontraron colegios con los filtros seleccionados.
                  </div>
                ) : (
                  filteredSchools.map((col, idx) => {
                    const statusColor = col.status === 'full' ? '#16a34a' : col.status === 'partial' ? '#f59e0b' : '#dc2626';
                    const statusBg = col.status === 'full' ? '#dcfce7' : col.status === 'partial' ? '#fef9c3' : '#fee2e2';

                    return (
                      <div
                        key={idx}
                        onClick={() => handleSelectSchoolFromList(col)}
                        style={{
                          background: isDark ? '#0f172a' : '#f8fafc',
                          border: `1px solid ${borderCol}`,
                          borderLeft: `4px solid ${statusColor}`,
                          borderRadius: '8px',
                          padding: '8px 10px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '6px' }}>
                          <strong style={{ fontSize: '0.78rem', color: textTitle, lineHeight: 1.2 }}>
                            {col.colegio}
                          </strong>
                          <span style={{
                            background: statusBg,
                            color: statusColor,
                            fontSize: '0.62rem',
                            fontWeight: 800,
                            padding: '1px 5px',
                            borderRadius: '4px',
                            flexShrink: 0
                          }}>
                            {col.assignedCount}/{col.mesas} mesas
                          </span>
                        </div>

                        <div style={{ fontSize: '0.68rem', color: textSub, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
                            📍 {col.direccion || 'Sin dirección'}
                          </span>
                          <span style={{ color: '#8b5cf6', fontWeight: 800 }}>{col.zonaShort}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
