import { DISTRITOS_LIMA, DISTRITO_METAS } from '../../config/constants.js';

export class GetDashboardDataUseCase {
  constructor(personeroRepository) {
    this.personeroRepo = personeroRepository;
  }

  async execute() {
    const records = await this.personeroRepo.getAllCombined();

    let totalPersoneros = 0;
    let totalCoordinadores = 0;
    let videosCompletados = 0;
    let pdfsCompletados = 0;
    let quizzesAprobados = 0;
    let credencialesEmitidas = 0;

    const districtCount = {};
    const rolesDistribution = {};
    const coveredMesasSet = new Set();

    const canonicalMap = {};
    DISTRITOS_LIMA.forEach(d => {
      districtCount[d] = 0;
      let norm = d.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (norm.includes('LURIGANCHO') || norm.includes('CHOSICA')) norm = 'LURIGANCHO';
      if (norm.includes('CERCADO') || norm === 'LIMA' || norm === 'LIMA CERCADO') norm = 'LIMA';
      canonicalMap[norm] = d;
    });

    records.forEach(r => {
      const rol = String(r['Rol a Desempeñar'] || 'Personero de Mesa').trim();
      const isCoord = rol.toLowerCase().includes('coordinador');
      
      if (isCoord) totalCoordinadores++;
      else totalPersoneros++;

      rolesDistribution[rol] = (rolesDistribution[rol] || 0) + 1;

      const rawDist = String(r['Distrito Asignado'] || r['Distrito donde Vota'] || '').trim();
      let normDist = rawDist.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (normDist.includes('LURIGANCHO') || normDist.includes('CHOSICA')) normDist = 'LURIGANCHO';
      if (normDist.includes('CERCADO') || normDist === 'LIMA' || normDist === 'LIMA CERCADO') normDist = 'LIMA';

      const canonicalDist = canonicalMap[normDist] || rawDist;
      if (districtCount[canonicalDist] !== undefined) {
        districtCount[canonicalDist]++;
      }

      const mesa = String(r['Mesa Asignada'] || r['Mesa de Sufragio'] || '').trim();
      if (mesa && mesa !== '-') {
        coveredMesasSet.add(`${canonicalDist}__${mesa}`);
      }

      const v = parseInt(r.Video, 10) || 0;
      const p = parseInt(r.PDF, 10) || 0;
      const q = String(r.Preguntas || '').toLowerCase();
      const c = String(r.Credenciales || '').toLowerCase();

      if (v >= 2) videosCompletados++;
      if (p >= 2) pdfsCompletados++;
      if (q === 'aprobado' || q === 'pasado') quizzesAprobados++;
      if (c === 'confirmado') credencialesEmitidas++;
    });

    let totalMesasMeta = 0;
    Object.values(DISTRITO_METAS).forEach(m => { totalMesasMeta += m; });

    const totalMesasCubiertas = coveredMesasSet.size || records.length;
    const mesasPendientes = Math.max(0, totalMesasMeta - totalMesasCubiertas);
    const porcentajeCobertura = totalMesasMeta > 0 ? Math.round((totalMesasCubiertas / totalMesasMeta) * 100) : 0;

    return {
      status: 'success',
      metrics: {
        totalPersoneros,
        totalCoordinadores,
        totalRegistros: records.length,
        totalMesasMeta,
        totalMesasCubiertas,
        mesasPendientes,
        porcentajeCobertura,
        videosCompletados,
        pdfsCompletados,
        quizzesAprobados,
        credencialesEmitidas
      },
      charts: {
        districtCount,
        districtMetas: DISTRITO_METAS,
        rolesDistribution
      },
      records
    };
  }
}
