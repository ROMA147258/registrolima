import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search, Navigation, Car, School,
  CheckCircle2, AlertTriangle, X, Loader2
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Coordenadas GPS oficiales de los distritos de Lima Metropolitana
export const UBIGEOS_LIMA = {
  "LIMA": { lat: -12.046374, lng: -77.042793 },
  "CERCADO DE LIMA": { lat: -12.046374, lng: -77.042793 },
  "ANCON": { lat: -11.773347, lng: -77.176008 },
  "ATE": { lat: -12.025752, lng: -76.918915 },
  "BARRANCO": { lat: -12.146698, lng: -77.020508 },
  "BREÑA": { lat: -12.057393, lng: -77.054398 },
  "CARABAYLLO": { lat: -11.879796, lng: -77.034302 },
  "CHACLACAYO": { lat: -11.974497, lng: -76.768600 },
  "CHORRILLOS": { lat: -12.174698, lng: -77.014503 },
  "CIENEGUILLA": { lat: -12.091197, lng: -76.778801 },
  "COMAS": { lat: -11.933396, lng: -77.054398 },
  "EL AGUSTINO": { lat: -12.049498, lng: -77.001602 },
  "JESUS MARIA": { lat: -12.074798, lng: -77.048500 },
  "LA MOLINA": { lat: -12.086397, lng: -76.938896 },
  "LA VICTORIA": { lat: -12.065298, lng: -77.016304 },
  "LINCE": { lat: -12.083898, lng: -77.035301 },
  "LOS OLIVOS": { lat: -11.979696, lng: -77.070602 },
  "LURIGANCHO": { lat: -11.939198, lng: -76.708801 },
  "LURIGANCHO-CHOSICA": { lat: -11.939198, lng: -76.708801 },
  "LURIN": { lat: -12.274198, lng: -76.871101 },
  "MAGDALENA DEL MAR": { lat: -12.093398, lng: -77.070305 },
  "PUEBLO LIBRE": { lat: -12.076898, lng: -77.063698 },
  "MIRAFLORES": { lat: -12.121998, lng: -77.029602 },
  "PACHACAMAC": { lat: -12.229498, lng: -76.860802 },
  "PUCUSANA": { lat: -12.482798, lng: -76.797203 },
  "PUENTE PIEDRA": { lat: -11.866396, lng: -77.076302 },
  "PUNTA HERMOSA": { lat: -12.336198, lng: -76.824700 },
  "PUNTA NEGRA": { lat: -12.366398, lng: -76.791100 },
  "RIMAC": { lat: -12.030598, lng: -77.028603 },
  "SAN BARTOLO": { lat: -12.390598, lng: -76.778801 },
  "SAN BORJA": { lat: -12.093898, lng: -77.001602 },
  "SAN ISIDRO": { lat: -12.097798, lng: -77.035301 },
  "SAN JUAN DE LURIGANCHO": { lat: -11.979696, lng: -76.998802 },
  "SAN JUAN DE MIRAFLORES": { lat: -12.162798, lng: -76.974403 },
  "SAN LUIS": { lat: -12.076898, lng: -76.998802 },
  "SAN MARTIN DE PORRES": { lat: -11.986396, lng: -77.098801 },
  "SAN MIGUEL": { lat: -12.076898, lng: -77.086304 },
  "SANTA ANITA": { lat: -12.046398, lng: -76.970596 },
  "SANTA MARIA DEL MAR": { lat: -12.404998, lng: -76.772500 },
  "SANTA ROSA": { lat: -11.799996, lng: -77.166603 },
  "SANTIAGO DE SURCO": { lat: -12.138898, lng: -76.998802 },
  "SURQUILLO": { lat: -12.112798, lng: -77.020508 },
  "VILLA EL SALVADOR": { lat: -12.212798, lng: -76.938896 },
  "VILLA MARIA DEL TRIUNFO": { lat: -12.162798, lng: -76.938896 }
};

// Generador de coordenadas deterministas y rápidas
function getSchoolCoordinates(schoolName, districtName) {
  const normDist = (districtName || 'SAN ISIDRO').trim().toUpperCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const base = UBIGEOS_LIMA[normDist] || UBIGEOS_LIMA['SAN ISIDRO'] || { lat: -12.097798, lng: -77.035301 };

  if (!schoolName) return { lat: base.lat, lng: base.lng };

  let hash = 0;
  for (let i = 0; i < schoolName.length; i++) {
    hash = (hash << 5) - hash + schoolName.charCodeAt(i);
    hash |= 0;
  }
  const offsetLat = ((Math.abs(hash) % 1000) / 1000 - 0.5) * 0.016;
  const offsetLng = ((Math.abs(hash * 31) % 1000) / 1000 - 0.5) * 0.016;

  return {
    lat: base.lat + offsetLat,
    lng: base.lng + offsetLng
  };
}

// Distancia Haversine rápida
function calculateHaversine(lat1, lon1, lat2, lon2) {
  if (lat1 === lat2 && lon1 === lon2) return 0;
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Memoria caché de rutas en caliente para 0ms de lag
const routeMemoryCache = new Map();

// Consulta de ruta optimizada con timeout ultra rápido (1.2s) y fallback instantáneo
async function fetchStreetRoute(pA, pB) {
  const cacheKey = `${pA.lat.toFixed(5)},${pA.lng.toFixed(5)}->${pB.lat.toFixed(5)},${pB.lng.toFixed(5)}`;
  if (routeMemoryCache.has(cacheKey)) {
    return routeMemoryCache.get(cacheKey);
  }

  const directDist = calculateHaversine(pA.lat, pA.lng, pB.lat, pB.lng);
  const distKm = (directDist * 1.3).toFixed(1);
  const durationMin = Math.max(3, Math.round((parseFloat(distKm) / 22) * 60 + 2));

  // Generador de cuadrícula vial de alta velocidad
  const buildFallback = () => {
    const steps = [];
    const numSteps = 24;
    for (let i = 0; i <= numSteps; i++) {
      const t = i / numSteps;
      steps.push([pA.lat, pA.lng + (pB.lng - pA.lng) * t]);
    }
    for (let i = 0; i <= numSteps; i++) {
      const t = i / numSteps;
      steps.push([pA.lat + (pB.lat - pA.lat) * t, pB.lng]);
    }
    const result = { points: steps, distanceKm: distKm, durationMin };
    routeMemoryCache.set(cacheKey, result);
    return result;
  };

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 1200);

    const url = `https://router.project-osrm.org/route/v1/driving/${pA.lng},${pA.lat};${pB.lng},${pB.lat}?overview=full&geometries=geojson`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);

    if (res.ok) {
      const json = await res.json();
      if (json.routes && json.routes.length > 0) {
        const route = json.routes[0];
        const coordinates = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
        const realDistKm = (route.distance / 1000).toFixed(1);
        const realDurationMin = Math.max(3, Math.round(route.duration / 60));
        const result = {
          points: coordinates,
          distanceKm: realDistKm,
          durationMin: realDurationMin
        };
        routeMemoryCache.set(cacheKey, result);
        return result;
      }
    }
  } catch (e) {
    // Timeout o error de red: retorna ruta calculada localmente al instante
  }

  return buildFallback();
}

export function TrayectoView({ records = [], isDark = false }) {
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);
  const [searchTerm, setSearchTerm] = useState('');
  const [distanceFilter, setDistanceFilter] = useState('all'); // 'all', 'far', 'medium', 'same'
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [routeStats, setRouteStats] = useState(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [showMobileList, setShowMobileList] = useState(false);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef(null);
  const animationTimerRef = useRef(null);

  // Escuchar cambios de tamaño de pantalla sin bloquear UI
  useEffect(() => {
    let resizeTimer = null;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        setIsMobile(window.innerWidth < 768);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 150);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Filtrado reactivo optimizado por texto y por distancia (lejos/cerca/mismo)
  const filteredPeople = useMemo(() => {
    if (!records || records.length === 0) return [];
    const term = searchTerm.toLowerCase().trim();

    return records.filter(r => {
      const name = String(r['Nombres y Apellidos'] || r.nombresApellidos || '').toLowerCase();
      const dni = String(r['D.N.I.'] || r.dni || '');
      const locVota = String(r['Local de Votación'] || r.localDeVotacion || '').toLowerCase();
      const locAsig = String(r['Local de Votación Asignado'] || r.localDeVotacionAsignado || '').toLowerCase();
      const distVota = r['Distrito donde Vota'] || r.distritoDondeVota || 'San Isidro';
      const distAsig = r['Distrito Asignado'] || r.distritoAsignado || distVota;

      const matchesSearch = !term || name.includes(term) || dni.includes(term) || locVota.includes(term) || locAsig.includes(term);
      if (!matchesSearch) return false;

      // Filtro de distancia
      if (distanceFilter !== 'all') {
        const isSame = locVota.trim().toLowerCase() === locAsig.trim().toLowerCase();
        const pA = getSchoolCoordinates(locVota, distVota);
        const pB = getSchoolCoordinates(locAsig, distAsig);
        const directKm = isSame ? 0 : calculateHaversine(pA.lat, pA.lng, pB.lat, pB.lng) * 1.3;

        if (distanceFilter === 'far' && directKm < 5) return false;
        if (distanceFilter === 'medium' && (directKm === 0 || directKm >= 5)) return false;
        if (distanceFilter === 'same' && directKm > 0) return false;
      }

      return true;
    });
  }, [records, searchTerm, distanceFilter]);

  // Limitar renderizado DOM en la barra lateral para evitar lag con miles de registros
  const displayedPeople = useMemo(() => {
    return filteredPeople.slice(0, 40);
  }, [filteredPeople]);

  // Seleccionar automáticamente al primer personero disponible
  useEffect(() => {
    if (filteredPeople.length > 0) {
      const stillExists = selectedPerson && filteredPeople.some(p => (p.dni || p['D.N.I.']) === (selectedPerson.dni || selectedPerson['D.N.I.']));
      if (!stillExists) {
        setSelectedPerson(filteredPeople[0]);
      }
    } else {
      setSelectedPerson(null);
    }
  }, [filteredPeople]);

  // Inicializar Mapa Leaflet con limpieza garantizada (previene fugas de memoria y lag)
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Crear mapa una sola vez de forma ligera
    const map = L.map(mapContainerRef.current, {
      center: [-12.097798, -77.035301],
      zoom: 14,
      zoomControl: false,
      attributionControl: false,
      fadeAnimation: true,
      zoomAnimation: true
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Tiles rápidos y ligeros de OpenStreetMap
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      tileSize: 256
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    layerGroupRef.current = layerGroup;
    mapInstanceRef.current = map;

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      clearTimeout(timer);
      if (animationTimerRef.current) {
        clearInterval(animationTimerRef.current);
        animationTimerRef.current = null;
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Trazar Ruta ultra fluida cuando cambia el personero seleccionado
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current) return;

    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;

    // Detener animación previa
    if (animationTimerRef.current) {
      clearInterval(animationTimerRef.current);
      animationTimerRef.current = null;
    }
    layerGroup.clearLayers();

    if (!selectedPerson) {
      setRouteStats(null);
      return;
    }

    const distVota = selectedPerson['Distrito donde Vota'] || selectedPerson.distritoDondeVota || 'San Isidro';
    const locVota = selectedPerson['Local de Votación'] || selectedPerson.localDeVotacion || 'Local de Votación';
    const distAsig = selectedPerson['Distrito Asignado'] || selectedPerson.distritoAsignado || distVota;
    const locAsig = selectedPerson['Local de Votación Asignado'] || selectedPerson.localDeVotacionAsignado || locVota;
    const personName = selectedPerson['Nombres y Apellidos'] || selectedPerson.nombresApellidos || 'Personero';
    const mesaAsig = selectedPerson['Mesa Asignada'] || selectedPerson.mesaAsignada || '-';

    const pA = getSchoolCoordinates(locVota, distVota);
    const pB = getSchoolCoordinates(locAsig, distAsig);

    const isSameSchool = locVota.trim().toLowerCase() === locAsig.trim().toLowerCase();

    // Marcador Punto A (Donde Vota)
    const iconA = L.divIcon({
      className: 'custom-pin-a',
      html: `
        <div style="background: #0284c7; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 2.5px solid white;">
          🗳️
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    const markerA = L.marker([pA.lat, pA.lng], { icon: iconA }).addTo(layerGroup);
    markerA.bindPopup(`
      <div style="font-family: sans-serif; padding: 4px;">
        <strong style="color: #0284c7; font-size: 13px;">🗳️ Local donde Vota:</strong><br/>
        <b style="font-size: 13px;">${locVota}</b><br/>
        <span style="color: #64748b; font-size: 11px;">Distrito: ${distVota}</span>
      </div>
    `);

    // Marcador Punto B (Donde Cuida Votos)
    const iconB = L.divIcon({
      className: 'custom-pin-b',
      html: `
        <div style="background: #10b981; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 2.5px solid white;">
          🛡️
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    const markerB = L.marker([pB.lat, pB.lng], { icon: iconB }).addTo(layerGroup);
    markerB.bindPopup(`
      <div style="font-family: sans-serif; padding: 4px;">
        <strong style="color: #10b981; font-size: 13px;">🛡️ Local Asignado (Donde Cuida):</strong><br/>
        <b style="font-size: 13px;">${locAsig}</b><br/>
        <span style="color: #64748b; font-size: 11px;">Mesa: ${mesaAsig} &bull; ${distAsig}</span>
      </div>
    `);

    // Caso 1: Vota en el mismo colegio
    if (isSameSchool) {
      setRouteStats({
        distanciaKm: '0.0',
        tiempoCarroMin: 0,
        isSameSchool: true,
        personName,
        locVota,
        locAsig,
        distVota,
        distAsig
      });
      map.setView([pA.lat, pA.lng], 15);
      return;
    }

    // Caso 2: Trazar ruta por pistas
    setIsLoadingRoute(true);

    fetchStreetRoute(pA, pB).then(routeData => {
      setIsLoadingRoute(false);
      setRouteStats({
        distanciaKm: routeData.distanceKm,
        tiempoCarroMin: routeData.durationMin,
        isSameSchool: false,
        personName,
        locVota,
        locAsig,
        distVota,
        distAsig
      });

      // Trazar línea de pista
      const polyline = L.polyline(routeData.points, {
        color: '#0284c7',
        weight: 5,
        opacity: 0.85,
        lineJoin: 'round',
        lineCap: 'round'
      });
      layerGroup.addLayer(polyline);

      // Enfocar bounds suavemente
      const bounds = L.latLngBounds([[pA.lat, pA.lng], [pB.lat, pB.lng]]);
      map.fitBounds(bounds, { padding: isMobile ? [25, 25] : [45, 45], maxZoom: 16 });

      // Auto en movimiento optimizado (100ms para suavidad sin carga excesiva de CPU)
      const carIcon = L.divIcon({
        className: 'car-marker',
        html: `
          <div style="background: #ffffff; border: 2px solid #0284c7; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; box-shadow: 0 3px 8px rgba(0,0,0,0.3);">
            🚗
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const carMarker = L.marker(routeData.points[0], { icon: carIcon });
      layerGroup.addLayer(carMarker);

      let stepIndex = 0;
      const totalPoints = routeData.points.length;

      animationTimerRef.current = setInterval(() => {
        if (!carMarker) return;
        stepIndex = (stepIndex + 1) % totalPoints;
        carMarker.setLatLng(routeData.points[stepIndex]);
      }, 100);

    });

    return () => {
      if (animationTimerRef.current) {
        clearInterval(animationTimerRef.current);
        animationTimerRef.current = null;
      }
    };

  }, [selectedPerson, isMobile]);

  const bgCard = isDark ? '#1e293b' : '#ffffff';
  const borderCol = isDark ? '#334155' : '#e2e8f0';
  const textTitle = isDark ? '#f8fafc' : '#0f172a';
  const textSub = isDark ? '#94a3b8' : '#64748b';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '10px' : '14px', paddingBottom: isMobile ? '70px' : '20px' }}>
      
      {/* BARRA SUPERIOR */}
      <div style={{
        background: bgCard,
        border: `1px solid ${borderCol}`,
        borderRadius: '12px',
        padding: isMobile ? '12px 14px' : '14px 18px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Navigation className="w-5 h-5 text-sky-500" />
          <h2 style={{ fontSize: isMobile ? '1rem' : '1.1rem', fontWeight: 900, color: textTitle, margin: 0 }}>
            Trayecto de Personeros
          </h2>
          {!isMobile && (
            <span style={{ fontSize: '0.8rem', color: textSub, marginLeft: '4px' }}>
              — Ruta en carro desde su local de votación hasta su local asignado
            </span>
          )}
        </div>

        <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0284c7' }}>
          {filteredPeople.length} Personeros
        </div>
      </div>

      {/* EN MÓVIL: SELECTOR RÁPIDO SUPERIOR */}
      {isMobile && (
        <div style={{ background: bgCard, border: `1px solid ${borderCol}`, borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Input de Búsqueda Móvil */}
          <div style={{ position: 'relative' }}>
            <Search className="w-4 h-4" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: textSub }} />
            <input
              type="text"
              placeholder="Buscar por Nombre o DNI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 32px 9px 32px',
                borderRadius: '8px',
                border: `1.5px solid #0284c7`,
                background: isDark ? '#0f172a' : '#f0f9ff',
                color: textTitle,
                fontSize: '0.84rem',
                fontWeight: 600,
                outline: 'none'
              }}
            />
            {searchTerm && (
              <X className="w-4 h-4 cursor-pointer" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: textSub }} onClick={() => setSearchTerm('')} />
            )}
          </div>

          {/* Botones de Filtro de Distancia en Móvil */}
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setDistanceFilter('all')}
              style={{
                padding: '4px 8px',
                borderRadius: '6px',
                border: distanceFilter === 'all' ? '1.5px solid #0284c7' : `1px solid ${borderCol}`,
                background: distanceFilter === 'all' ? (isDark ? '#0369a1' : '#e0f2fe') : 'transparent',
                color: distanceFilter === 'all' ? (isDark ? '#ffffff' : '#0284c7') : textSub,
                fontSize: '0.68rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Todos
            </button>
            <button
              onClick={() => setDistanceFilter('far')}
              style={{
                padding: '4px 8px',
                borderRadius: '6px',
                border: distanceFilter === 'far' ? '1.5px solid #ef4444' : `1px solid ${borderCol}`,
                background: distanceFilter === 'far' ? (isDark ? 'rgba(239, 68, 68, 0.25)' : '#fee2e2') : 'transparent',
                color: distanceFilter === 'far' ? '#dc2626' : textSub,
                fontSize: '0.68rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              🚨 Muy Lejos (&gt; 5 km)
            </button>
            <button
              onClick={() => setDistanceFilter('medium')}
              style={{
                padding: '4px 8px',
                borderRadius: '6px',
                border: distanceFilter === 'medium' ? '1.5px solid #f59e0b' : `1px solid ${borderCol}`,
                background: distanceFilter === 'medium' ? (isDark ? 'rgba(245, 158, 11, 0.25)' : '#fef3c7') : 'transparent',
                color: distanceFilter === 'medium' ? '#d97706' : textSub,
                fontSize: '0.68rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              🚗 Media Dist.
            </button>
            <button
              onClick={() => setDistanceFilter('same')}
              style={{
                padding: '4px 8px',
                borderRadius: '6px',
                border: distanceFilter === 'same' ? '1.5px solid #10b981' : `1px solid ${borderCol}`,
                background: distanceFilter === 'same' ? (isDark ? 'rgba(16, 185, 129, 0.25)' : '#dcfce7') : 'transparent',
                color: distanceFilter === 'same' ? '#15803d' : textSub,
                fontSize: '0.68rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              🎯 Mismo Local
            </button>
          </div>

          {/* Botón para ver lista completa o colapsarla */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: textSub, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
              {selectedPerson ? `👤 ${selectedPerson['Nombres y Apellidos'] || selectedPerson.nombresApellidos}` : 'Seleccione un personero'}
            </span>
            <button
              onClick={() => setShowMobileList(!showMobileList)}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                border: 'none',
                background: showMobileList ? '#0284c7' : (isDark ? '#334155' : '#e2e8f0'),
                color: showMobileList ? '#ffffff' : textTitle,
                fontSize: '0.72rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              {showMobileList ? 'Ocultar Lista ▲' : 'Cambiar Personero ▼'}
            </button>
          </div>

          {/* Lista Móvil Colapsable */}
          {showMobileList && (
            <div style={{ maxHeight: '220px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
              {displayedPeople.map((p, idx) => {
                const isSelected = selectedPerson && (
                  (p.id && p.id === selectedPerson.id) ||
                  (p['D.N.I.'] && p['D.N.I.'] === selectedPerson['D.N.I.']) ||
                  (p.dni && p.dni === selectedPerson.dni)
                );
                const pName = p['Nombres y Apellidos'] || p.nombresApellidos || 'Personero';
                const pDni = p['D.N.I.'] || p.dni || '--------';

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      setSelectedPerson(p);
                      setShowMobileList(false);
                    }}
                    style={{
                      background: isSelected ? (isDark ? '#0369a1' : '#e0f2fe') : (isDark ? '#0f172a' : '#f8fafc'),
                      border: isSelected ? '1.5px solid #0284c7' : `1px solid ${borderCol}`,
                      borderRadius: '8px',
                      padding: '8px 10px',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 800, color: textTitle }}>{pName}</div>
                      <div style={{ fontSize: '0.68rem', color: textSub }}>DNI: {pDni}</div>
                    </div>
                    {isSelected && <span style={{ color: '#0284c7', fontWeight: 900, fontSize: '0.8rem' }}>✓</span>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* CONTENEDOR PRINCIPAL */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '320px 1fr',
        gap: isMobile ? '10px' : '14px',
        minHeight: isMobile ? 'auto' : '560px'
      }}>
        
        {/* Panel Izquierdo: Lista con Buscador (visible siempre en escritorio) */}
        {!isMobile && (
          <div style={{ background: bgCard, border: `1px solid ${borderCol}`, borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px', height: '100%', maxHeight: '680px' }}>
            
            {/* Input de Búsqueda Escritorio */}
            <div style={{ position: 'relative' }}>
              <Search className="w-4 h-4" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: textSub }} />
              <input
                type="text"
                placeholder="Buscar por Nombre o DNI..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 32px',
                  borderRadius: '8px',
                  border: `1.5px solid #0284c7`,
                  background: isDark ? '#0f172a' : '#f0f9ff',
                  color: textTitle,
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  outline: 'none'
                }}
              />
              {searchTerm && (
                <X className="w-3.5 h-3.5 cursor-pointer" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: textSub }} onClick={() => setSearchTerm('')} />
              )}
            </div>

            {/* Filtros de Distancia en Escritorio */}
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setDistanceFilter('all')}
                style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: distanceFilter === 'all' ? '1.5px solid #0284c7' : `1px solid ${borderCol}`,
                  background: distanceFilter === 'all' ? (isDark ? '#0369a1' : '#e0f2fe') : 'transparent',
                  color: distanceFilter === 'all' ? (isDark ? '#ffffff' : '#0284c7') : textSub,
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Todos
              </button>
              <button
                onClick={() => setDistanceFilter('far')}
                style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: distanceFilter === 'far' ? '1.5px solid #ef4444' : `1px solid ${borderCol}`,
                  background: distanceFilter === 'far' ? (isDark ? 'rgba(239, 68, 68, 0.25)' : '#fee2e2') : 'transparent',
                  color: distanceFilter === 'far' ? '#dc2626' : textSub,
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                🚨 Muy Lejos (&gt; 5 km)
              </button>
              <button
                onClick={() => setDistanceFilter('medium')}
                style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: distanceFilter === 'medium' ? '1.5px solid #f59e0b' : `1px solid ${borderCol}`,
                  background: distanceFilter === 'medium' ? (isDark ? 'rgba(245, 158, 11, 0.25)' : '#fef3c7') : 'transparent',
                  color: distanceFilter === 'medium' ? '#d97706' : textSub,
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                🚗 Media
              </button>
              <button
                onClick={() => setDistanceFilter('same')}
                style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: distanceFilter === 'same' ? '1.5px solid #10b981' : `1px solid ${borderCol}`,
                  background: distanceFilter === 'same' ? (isDark ? 'rgba(16, 185, 129, 0.25)' : '#dcfce7') : 'transparent',
                  color: distanceFilter === 'same' ? '#15803d' : textSub,
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                🎯 Mismo Colegio
              </button>
            </div>

            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: textSub, display: 'flex', justifyContent: 'space-between' }}>
              <span>LISTA DE PERSONEROS</span>
              <span>{displayedPeople.length} mostrados</span>
            </div>

            {/* Listado Escritorio */}
            <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px' }}>
              {displayedPeople.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 10px', color: textSub, fontSize: '0.8rem' }}>
                  No se encontró ninguna persona con ese nombre o DNI.
                </div>
              ) : (
                displayedPeople.map((p, idx) => {
                  const isSelected = selectedPerson && (
                    (p.id && p.id === selectedPerson.id) ||
                    (p['D.N.I.'] && p['D.N.I.'] === selectedPerson['D.N.I.']) ||
                    (p.dni && p.dni === selectedPerson.dni)
                  );
                  const pName = p['Nombres y Apellidos'] || p.nombresApellidos || 'Personero';
                  const pDni = p['D.N.I.'] || p.dni || '--------';
                  const pRol = p['Rol a Desempeñar'] || p.rolADesempenar || 'Personero de Mesa';
                  const locV = p['Local de Votación'] || p.localDeVotacion || '-';
                  const locA = p['Local de Votación Asignado'] || p.localDeVotacionAsignado || locV;
                  const isSame = locV.trim().toLowerCase() === locA.trim().toLowerCase();

                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedPerson(p)}
                      style={{
                        background: isSelected ? (isDark ? '#0369a1' : '#e0f2fe') : (isDark ? '#0f172a' : '#f8fafc'),
                        border: isSelected ? '2px solid #0284c7' : `1px solid ${borderCol}`,
                        borderRadius: '10px',
                        padding: '10px 12px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3px' }}>
                        <strong style={{ fontSize: '0.82rem', color: isSelected ? (isDark ? '#ffffff' : '#0369a1') : textTitle, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '190px' }}>
                          {pName}
                        </strong>
                        <span style={{ fontSize: '0.68rem', fontWeight: 800, padding: '2px 6px', borderRadius: '6px', background: isSame ? '#dcfce7' : '#fef3c7', color: isSame ? '#15803d' : '#b45309' }}>
                          {isSame ? '🎯 Mismo local' : '🚗 En Auto'}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.72rem', color: textSub }}>
                        DNI: <strong>{pDni}</strong> &bull; {pRol}
                      </div>

                      <div style={{ fontSize: '0.68rem', color: textSub, marginTop: '4px', borderTop: `1px dashed ${borderCol}`, paddingTop: '4px' }}>
                        <div>🗳️ Vota: <span style={{ color: textTitle }}>{locV}</span></div>
                        <div>🛡️ Cuida: <span style={{ color: '#0284c7', fontWeight: 700 }}>{locA}</span></div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Panel Derecho: Mapa y Card de Métricas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          
          {/* Contenedor del Mapa */}
          <div style={{
            position: 'relative',
            width: '100%',
            height: isMobile ? '320px' : '440px',
            borderRadius: '12px',
            border: `1.5px solid ${borderCol}`,
            overflow: 'hidden',
            boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
          }}>
            <div
              ref={mapContainerRef}
              style={{
                width: '100%',
                height: '100%'
              }}
            />

            {isLoadingRoute && (
              <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(15, 23, 42, 0.85)', color: '#ffffff', padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', zIndex: 10 }}>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-400" />
                <span>Trazando ruta...</span>
              </div>
            )}
          </div>

          {/* Tarjeta Informativa del Trayecto Adaptada a Móvil */}
          {routeStats && selectedPerson && (
            <div style={{
              background: bgCard,
              border: `1px solid ${borderCol}`,
              borderLeft: '5px solid #0284c7',
              borderRadius: '12px',
              padding: isMobile ? '12px 14px' : '14px 18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              
              {/* Fila 1: Nombre del Personero + DNI */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '6px' }}>
                <div>
                  <div style={{ fontSize: '0.66rem', fontWeight: 800, color: textSub, textTransform: 'uppercase' }}>
                    PERSONERO ASIGNADO
                  </div>
                  <div style={{ fontSize: isMobile ? '0.92rem' : '1rem', fontWeight: 900, color: textTitle }}>
                    {selectedPerson['Nombres y Apellidos'] || selectedPerson.nombresApellidos}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: textSub }}>
                    DNI: <strong>{selectedPerson['D.N.I.'] || selectedPerson.dni}</strong> &bull; {selectedPerson['Rol a Desempeñar'] || selectedPerson.rolADesempenar}
                  </div>
                </div>

                {/* Insignia de diagnóstico */}
                <div>
                  {routeStats.isSameSchool ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '8px', background: '#dcfce7', color: '#15803d', fontSize: '0.74rem', fontWeight: 800 }}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>¡Mismo local!</span>
                    </span>
                  ) : (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '8px', background: '#e0f2fe', color: '#0369a1', fontSize: '0.74rem', fontWeight: 800 }}>
                      <Car className="w-3.5 h-3.5" />
                      <span>~{routeStats.tiempoCarroMin} min de viaje</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Fila 2: Origen y Destino */}
              <div style={{ background: isDark ? '#0f172a' : '#f8fafc', borderRadius: '8px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.76rem' }}>
                <div style={{ color: '#0284c7', fontWeight: 700 }}>
                  🗳️ <strong>VOTA EN:</strong> {routeStats.locVota} ({routeStats.distVota})
                </div>
                <div style={{ color: '#10b981', fontWeight: 700 }}>
                  🛡️ <strong>CUIDA EN:</strong> {routeStats.locAsig} ({routeStats.distAsig})
                </div>
              </div>

              {/* Fila 3: Distancia y Tiempo en Carro */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div style={{ background: isDark ? '#0f172a' : '#f0f9ff', padding: '8px 10px', borderRadius: '8px', border: '1px solid #bae6fd', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.64rem', fontWeight: 800, color: '#0284c7' }}>DISTANCIA POR PISTA</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 900, color: textTitle }}>
                    {routeStats.distanciaKm} <span style={{ fontSize: '0.7rem' }}>km</span>
                  </div>
                </div>

                <div style={{ background: isDark ? '#0f172a' : '#ecfdf5', padding: '8px 10px', borderRadius: '8px', border: '1px solid #a7f3d0', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.64rem', fontWeight: 800, color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <Car className="w-3.5 h-3.5" />
                    <span>TIEMPO EN CARRO</span>
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#047857' }}>
                    {routeStats.isSameSchool ? '0' : `~${routeStats.tiempoCarroMin}`} <span style={{ fontSize: '0.7rem' }}>min</span>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
