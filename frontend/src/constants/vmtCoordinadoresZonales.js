import zonasVmtData from './zonasVMT.json';

// Mapeo oficial de Coordinadores Zonales de Villa María del Triunfo
export const VMT_COORDINADORES_ZONALES = [
  {
    nombres: "Tania Natividad Estacio Cangahuala",
    zona: "ZONA MARIATEGUI",
    zonaShort: "Mariátegui",
    color: "#8b5cf6",
    badge: "🟣"
  },
  {
    nombres: "Reynaldo Tica Osco",
    zona: "ZONA MARIATEGUI",
    zonaShort: "Mariátegui",
    color: "#8b5cf6",
    badge: "🟣"
  },
  {
    nombres: "Juana Yolanda Ureta Paita",
    zona: "ZONA INCA PACHACUTEC",
    zonaShort: "Inca Pachacútec",
    color: "#10b981",
    badge: "🟢"
  },
  {
    nombres: "Michel Enrique Rodriguez vega",
    zona: "ZONA TABLADA",
    zonaShort: "Tablada",
    color: "#0ea5e9",
    badge: "🟦"
  },
  {
    nombres: "Carmen Patricia Arias Baldeon",
    zona: "ZONA JOSE GALVEZ",
    zonaShort: "José Gálvez",
    color: "#6366f1",
    badge: "🔷"
  },
  {
    nombres: "Evelyn Ana Maria Portugal Cosio",
    zona: "ZONA NUEVA ESPERANZA",
    zonaShort: "Nueva Esperanza",
    color: "#f59e0b",
    badge: "🟡"
  },
  {
    nombres: "DENNIS RONAL VIRÚ COSIO",
    zona: "ZONA CERCADO",
    zonaShort: "Cercado",
    color: "#0284c7",
    badge: "🔵"
  },
  {
    nombres: "Esteban Tito Cirineo Condor",
    zona: "ZONA NUEVO MILENIO",
    zonaShort: "Nuevo Milenio",
    color: "#f43f5e",
    badge: "🔴"
  }
];

// Función para normalizar texto
function normalize(str) {
  if (!str) return '';
  return String(str)
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Obtiene la zona de VMT asignada a un usuario (si es coordinador zonal)
 * Si el usuario es Superadmin o Coordinador Distrital, retorna null (tienen acceso a todo).
 */
export function getVmtAssignedZoneForUser(user) {
  if (!user) return null;

  const rawRole = normalize(user['Rol a Desempeñar'] || user.role || user.rol_electoral || '');
  const username = normalize(user.username || user.usuario || '');
  const fullName = normalize(user['Nombres y Apellidos'] || user.fullName || user.nombresApellidos || '');
  const dni = String(user['D.N.I.'] || user['DNI'] || user.dni || '').trim();

  // Superadmin o Coordinador Distrital -> Sin restricción zonal (ve todo)
  if (
    username === 'SUPERA' || username === 'ADMIN' ||
    rawRole.includes('SUPERADMIN') || rawRole.includes('DISTRITAL') || rawRole.includes('DISTRITO')
  ) {
    return null;
  }

  // 1. Verificar si el nombre o DNI coincide con la lista oficial de Coordinadores Zonales
  for (const cz of VMT_COORDINADORES_ZONALES) {
    const normCz = normalize(cz.nombres);
    
    // Comparación por coincidencia de palabras clave o nombre completo
    if (fullName && (fullName.includes(normCz) || normCz.includes(fullName))) {
      return cz.zona;
    }

    // Coincidencia por apellidos / nombres clave
    const czParts = normCz.split(' ').filter(p => p.length > 2);
    const matchCount = czParts.filter(p => fullName.includes(p) || username.includes(p)).length;
    if (matchCount >= 2) {
      return cz.zona;
    }
  }

  // 2. Verificar campo 'Zona Asignada' o 'Local Asignado' si contiene el nombre de la zona
  const rawZona = normalize(user['Zona Asignada'] || user.zonaAsignada || user.zona || user['Local de Votación Asignado'] || user.localAsignado || '');
  if (rawZona) {
    if (rawZona.includes('MARIATEGUI')) return 'ZONA MARIATEGUI';
    if (rawZona.includes('PACHACUTEC') || rawZona.includes('INCA')) return 'ZONA INCA PACHACUTEC';
    if (rawZona.includes('TABLADA')) return 'ZONA TABLADA';
    if (rawZona.includes('GALVEZ') || rawZona.includes('JOSE GALVEZ')) return 'ZONA JOSE GALVEZ';
    if (rawZona.includes('ESPERANZA') || rawZona.includes('NUEVA ESPERANZA')) return 'ZONA NUEVA ESPERANZA';
    if (rawZona.includes('CERCADO')) return 'ZONA CERCADO';
    if (rawZona.includes('MILENIO') || rawZona.includes('NUEVO MILENIO')) return 'ZONA NUEVO MILENIO';
  }

  return null;
}

/**
 * Obtiene la lista de colegios que pertenecen a una zona de VMT
 */
export function getSchoolsForVmtZone(zonaName) {
  if (!zonaName) return [];
  const list = zonasVmtData[zonaName] || [];
  return list.map(s => s.colegio);
}
