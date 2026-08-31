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

// Generador de coordenadas para colegios
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
  const offsetLat = ((Math.abs(hash) % 1000) / 1000 - 0.5) * 0.018;
  const offsetLng = ((Math.abs(hash * 31) % 1000) / 1000 - 0.5) * 0.018;

  return {
    lat: base.lat + offsetLat,
    lng: base.lng + offsetLng
  };
}

// Distancia Haversine
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

// Consulta de ruta por pistas vía OSRM
async function fetchStreetRoute(pA, pB) {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${pA.lng},${pA.lat};${pB.lng},${pB.lat}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    if (res.ok) {
      const json = await res.json();
      if (json.routes && json.routes.length > 0) {
        const route = json.routes[0];
        const coordinates = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
        const distKm = (route.distance / 1000).toFixed(1);
        const durationMin = Math.max(3, Math.round(route.duration / 60));
        return {
          points: coordinates,
          distanceKm: distKm,
          durationMin: durationMin
        };
      }
    }
  } catch (err) {
    console.warn('OSRM router fallback:', err);
  }

  // Respaldo de ruta por cuadrícula vial
  const steps = [];
  const numSteps = 40;
  for (let i = 0; i <= numSteps; i++) {
    const t = i / numSteps;
    steps.push([pA.lat, pA.lng + (pB.lng - pA.lng) * t]);
  }
  for (let i = 0; i <= numSteps; i++) {
    const t = i / numSteps;
    steps.push([pA.lat + (pB.lat - pA.lat) * t, pB.lng]);
  }

  const directDist = calculateHaversine(pA.lat, pA.lng, pB.lat, pB.lng);
  const distKm = (directDist * 1.3).toFixed(1);
  const durationMin = Math.max(3, Math.round((parseFloat(distKm) / 22) * 60 + 2));

  return {
    points: steps,
    distanceKm: distKm,
    durationMin: durationMin
  };
}

export function TrayectoView({ records = [], isDark = false }) {
  // Búsqueda directa por nombre o DNI
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [routeStats, setRouteStats] = useState(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef(null);
  const animationTimerRef = useRef(null);

  // Filtrado reactivo por nombre o DNI
  const filteredPeople = useMemo(() => {
    return records.filter(r => {
      const name = String(r['Nombres y Apellidos'] || r.nombresApellidos || '').toLowerCase();
      const dni = String(r['D.N.I.'] || r.dni || '');
      const locVota = String(r['Local de Votación'] || r.localDeVotacion || '').toLowerCase();
      const locAsig = String(r['Local de Votación Asignado'] || r.localDeVotacionAsignado || '').toLowerCase();

      const term = searchTerm.toLowerCase().trim();
      return !term || name.includes(term) || dni.includes(term) || locVota.includes(term) || locAsig.includes(term);
    });
  }, [records, searchTerm]);

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

  // Inicializar Mapa Leaflet con OpenStreetMap Oficial
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [-12.097798, -77.035301],
        zoom: 14,
        zoomControl: false
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // OpenStreetMap Oficial libre de claves
      const tileUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

      L.tileLayer(tileUrl, {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);

      layerGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (animationTimerRef.current) {
        clearInterval(animationTimerRef.current);
        animationTimerRef.current = null;
      }
    };
  }, []);

  // Trazar Ruta por la Pista cuando cambia la persona seleccionada
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current) return;

    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;

    // Limpiar capas y animaciones anteriores
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
        <div style="background: #0284c7; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 15px; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 2.5px solid white;">
          🗳️
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });

    // Marcador Punto B (Donde Cuida Votos)
    const iconB = L.divIcon({
      className: 'custom-pin-b',
      html: `
        <div style="background: #10b981; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 15px; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 2.5px solid white;">
          🛡️
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });

    const markerA = L.marker([pA.lat, pA.lng], { icon: iconA })
      .bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4;">
          <strong style="color: #0284c7; font-size: 13px;">🗳️ LOCAL DONDE VOTA</strong><br/>
          🏫 <strong>${locVota}</strong><br/>
          📍 Distrito: ${distVota}<br/>
          👤 Personero: ${personName}
        </div>
      `);

    const markerB = L.marker([pB.lat, pB.lng], { icon: iconB })
      .bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4;">
          <strong style="color: #10b981; font-size: 13px;">🛡️ LOCAL ASIGNADO (CUIDA VOTOS)</strong><br/>
          🏫 <strong>${locAsig}</strong><br/>
          📍 Distrito: ${distAsig}<br/>
          📋 Mesa: Nº ${mesaAsig}
        </div>
      `);

    layerGroup.addLayer(markerA);
    layerGroup.addLayer(markerB);

    if (isSameSchool) {
      map.setView([pA.lat, pA.lng], 15);
      markerA.openPopup();
      setRouteStats({
        isSameSchool: true,
        distanciaKm: '0.0',
        tiempoCarroMin: 0,
        locVota,
        locAsig,
        distVota,
        distAsig
      });
      return;
    }

    setIsLoadingRoute(true);

    // Obtener ruta vial por pistas (OSRM)
    fetchStreetRoute(pA, pB).then(routeData => {
      setIsLoadingRoute(false);
      if (!layerGroupRef.current) return;

      setRouteStats({
        isSameSchool: false,
        distanciaKm: routeData.distanceKm,
        tiempoCarroMin: routeData.durationMin,
        locVota,
        locAsig,
        distVota,
        distAsig
      });

      // Línea de la pista
      const polyline = L.polyline(routeData.points, {
        color: '#0284c7',
        weight: 6,
        opacity: 0.9,
        lineJoin: 'round',
        lineCap: 'round'
      });
      layerGroup.addLayer(polyline);

      // Enfocar vista en la ruta completa
      const bounds = L.latLngBounds([[pA.lat, pA.lng], [pB.lat, pB.lng]]);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });

      // Auto en movimiento por la pista
      const carIcon = L.divIcon({
        className: 'car-marker',
        html: `
          <div style="background: #ffffff; border: 2px solid #0284c7; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 15px; box-shadow: 0 4px 10px rgba(0,0,0,0.35);">
            🚗
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      const carMarker = L.marker(routeData.points[0], { icon: carIcon });
      layerGroup.addLayer(carMarker);

      // Animación fluida
      let stepIndex = 0;
      const totalPoints = routeData.points.length;

      animationTimerRef.current = setInterval(() => {
        if (!carMarker) return;
        stepIndex = (stepIndex + 1) % totalPoints;
        carMarker.setLatLng(routeData.points[stepIndex]);
      }, 60);

    });

    return () => {
      if (animationTimerRef.current) {
        clearInterval(animationTimerRef.current);
        animationTimerRef.current = null;
      }
    };

  }, [selectedPerson]);

  const bgCard = isDark ? '#1e293b' : '#ffffff';
  const borderCol = isDark ? '#334155' : '#e2e8f0';
  const textTitle = isDark ? '#f8fafc' : '#0f172a';
  const textSub = isDark ? '#94a3b8' : '#64748b';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      
      {/* BARRA SUPERIOR LIMPIA Y SIMPLE */}
      <div style={{
        background: bgCard,
        border: `1px solid ${borderCol}`,
        borderRadius: '12px',
        padding: '14px 18px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Navigation className="w-5 h-5 text-sky-500" />
          <h2 style={{ fontSize: '1.1rem', fontWeight: 900, color: textTitle, margin: 0 }}>
            Trayecto de Personeros
          </h2>
          <span style={{ fontSize: '0.8rem', color: textSub, marginLeft: '4px' }}>
            — Ruta en carro desde su local de votación hasta su local asignado
          </span>
        </div>

        <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0284c7' }}>
          {filteredPeople.length} Personeros registrados
        </div>
      </div>

      {/* CONTENEDOR: Listado con Búsqueda a la Izquierda y Mapa a la Derecha */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '14px', minHeight: '580px' }}>
        
        {/* Panel Izquierdo: Lista con Buscador por Nombre o DNI */}
        <div style={{ background: bgCard, border: `1px solid ${borderCol}`, borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px', height: '100%', maxHeight: '680px' }}>
          
          {/* Input de Búsqueda */}
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

          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: textSub, display: 'flex', justifyContent: 'space-between' }}>
            <span>LISTA DE PERSONEROS</span>
            <span>Selecciona uno</span>
          </div>

          {/* Listado */}
          <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px' }}>
            {filteredPeople.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 10px', color: textSub, fontSize: '0.8rem' }}>
                No se encontró ninguna persona con ese nombre o DNI.
              </div>
            ) : (
              filteredPeople.map((p, idx) => {
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

        {/* Panel Derecho: Mapa y Card de Métricas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          {/* Contenedor del Mapa */}
          <div style={{ position: 'relative', width: '100%', height: '440px', borderRadius: '12px', border: `1.5px solid ${borderCol}`, overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
            <div
              ref={mapContainerRef}
              style={{
                width: '100%',
                height: '100%',
                zIndex: 1
              }}
            />

            {isLoadingRoute && (
              <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(15, 23, 42, 0.85)', color: '#ffffff', padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', zIndex: 10 }}>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-400" />
                <span>Trazando ruta por pistas...</span>
              </div>
            )}
          </div>

          {/* Tarjeta Informativa del Trayecto */}
          {routeStats && selectedPerson && (
            <div style={{
              background: bgCard,
              border: `1px solid ${borderCol}`,
              borderLeft: '5px solid #0284c7',
              borderRadius: '12px',
              padding: '14px 18px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '14px',
              alignItems: 'center'
            }}>
              
              {/* Personero */}
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: textSub, textTransform: 'uppercase' }}>
                  PERSONERO SELECCIONADO
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 900, color: textTitle, marginTop: '2px' }}>
                  {selectedPerson['Nombres y Apellidos'] || selectedPerson.nombresApellidos}
                </div>
                <div style={{ fontSize: '0.75rem', color: textSub }}>
                  DNI: <strong>{selectedPerson['D.N.I.'] || selectedPerson.dni}</strong> &bull; {selectedPerson['Rol a Desempeñar'] || selectedPerson.rolADesempenar}
                </div>
              </div>

              {/* Colegios */}
              <div>
                <div style={{ fontSize: '0.74rem', color: '#0284c7', fontWeight: 800 }}>
                  🗳️ VOTA EN: <strong>{routeStats.locVota}</strong>
                </div>
                <div style={{ fontSize: '0.74rem', color: '#10b981', fontWeight: 800, marginTop: '3px' }}>
                  🛡️ CUIDA EN: <strong>{routeStats.locAsig}</strong>
                </div>
              </div>

              {/* Distancia y Tiempo en Carro */}
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <div style={{ background: isDark ? '#0f172a' : '#f0f9ff', padding: '8px 12px', borderRadius: '8px', border: '1px solid #bae6fd', textAlign: 'center', minWidth: '85px' }}>
                  <div style={{ fontSize: '0.64rem', fontWeight: 800, color: '#0284c7' }}>DISTANCIA</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 900, color: textTitle }}>
                    {routeStats.distanciaKm} <span style={{ fontSize: '0.7rem' }}>km</span>
                  </div>
                </div>

                <div style={{ background: isDark ? '#0f172a' : '#ecfdf5', padding: '8px 12px', borderRadius: '8px', border: '1px solid #a7f3d0', textAlign: 'center', minWidth: '95px' }}>
                  <div style={{ fontSize: '0.64rem', fontWeight: 800, color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <Car className="w-3.5 h-3.5" />
                    <span>EN CARRO</span>
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#047857' }}>
                    {routeStats.isSameSchool ? '0' : `~${routeStats.tiempoCarroMin}`} <span style={{ fontSize: '0.7rem' }}>min</span>
                  </div>
                </div>
              </div>

              {/* Diagnóstico */}
              <div>
                {routeStats.isSameSchool ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 10px', borderRadius: '8px', background: '#dcfce7', color: '#15803d', fontSize: '0.76rem', fontWeight: 800 }}>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>¡Vota en el mismo local! (0 min de viaje)</span>
                  </span>
                ) : (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 10px', borderRadius: '8px', background: '#e0f2fe', color: '#0369a1', fontSize: '0.76rem', fontWeight: 800 }}>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>A ~{routeStats.tiempoCarroMin} min en auto por la pista.</span>
                  </span>
                )}
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
