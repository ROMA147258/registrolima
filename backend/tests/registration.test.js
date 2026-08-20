import test from 'node:test';
import assert from 'node:assert/strict';
import { RegisterPersoneroUseCase } from '../src/application/use-cases/RegisterPersoneroUseCase.js';

class MockPersoneroRepository {
  constructor() {
    this.records = [];
  }

  async findByDni(dni) {
    const found = this.records.find(r => r.dni === String(dni).trim());
    if (!found) return null;
    return { entity: found, tableName: 'mock' };
  }

  async findByFullName(fullName) {
    const found = this.records.find(r => r.nombresApellidos?.toLowerCase().trim() === String(fullName).toLowerCase().trim());
    if (!found) return null;
    return { entity: found, tableName: 'mock' };
  }

  async findByPhone(phone) {
    const found = this.records.find(r => r.celular === String(phone).trim() || r.numeroWhatsAppAlterno === String(phone).trim());
    if (!found) return null;
    return { entity: found, tableName: 'mock' };
  }

  async findByEmail(email) {
    const found = this.records.find(r => r.correoElectronico?.toLowerCase().trim() === String(email).toLowerCase().trim());
    if (!found) return null;
    return { entity: found, tableName: 'mock' };
  }

  async findByWhatsapp(phone) {
    const found = this.records.find(r => r.numeroWhatsAppAlterno === String(phone).trim() || r.celular === String(phone).trim());
    if (!found) return null;
    return { entity: found, tableName: 'mock' };
  }

  async countPersonerosByMesa(mesaAsignada, excludeDni = null) {
    return this.records.filter(r => 
      r.mesaAsignada === String(mesaAsignada).trim() && 
      (!excludeDni || r.dni !== excludeDni)
    ).length;
  }

  async countCoordinadoresByDistrito(distritoAsignado, excludeDni = null) {
    return this.records.filter(r => 
      r.distritoAsignado?.toLowerCase().trim() === distritoAsignado?.toLowerCase().trim() &&
      r.rolADesempenar?.toLowerCase().includes('coordinador') &&
      !r.rolADesempenar?.toLowerCase().includes('distrito') &&
      (!excludeDni || r.dni !== excludeDni)
    ).length;
  }

  async countCoordinadoresByLocal(distritoAsignado, localAsignado, excludeDni = null) {
    return this.records.filter(r => 
      r.distritoAsignado?.toLowerCase().trim() === distritoAsignado?.toLowerCase().trim() &&
      r.localDeVotacionAsignado?.toLowerCase().trim() === localAsignado?.toLowerCase().trim() &&
      (!excludeDni || r.dni !== excludeDni)
    ).length;
  }

  async countCoordinadoresDistritales(distritoAsignado, excludeDni = null) {
    return this.records.filter(r => 
      r.distritoAsignado?.toLowerCase().trim() === distritoAsignado?.toLowerCase().trim() &&
      r.rolADesempenar?.toLowerCase().includes('distrito') &&
      (!excludeDni || r.dni !== excludeDni)
    ).length;
  }

  async save(entity) {
    const data = entity.toJSON ? entity.toJSON() : entity;
    this.records.push(data);
    return { entity: data, tableName: 'mock' };
  }
}

class MockAuditRepository {
  async log() { return true; }
}

test('Validation Rule 1: DNI duplication is strictly prevented', async () => {
  const repo = new MockPersoneroRepository();
  const audit = new MockAuditRepository();
  const useCase = new RegisterPersoneroUseCase(repo, audit);

  const p1 = {
    nombres_apellidos: 'Carlos Gomez',
    dni: '12345678',
    celular: '987654321',
    rol_electoral: 'Personero de Mesa',
    distrito_asignado: 'Miraflores',
    mesa_asignada: '100001'
  };

  const res = await useCase.execute(p1);
  assert.equal(res.status, 'success');

  // Attempt to register same DNI again
  await assert.rejects(
    async () => {
      await useCase.execute({
        nombres_apellidos: 'Carlos Gomez Copia',
        dni: '12345678',
        celular: '987654322',
        rol_electoral: 'Personero de Mesa',
        distrito_asignado: 'Miraflores',
        mesa_asignada: '100002'
      });
    },
    /ya se encuentra registrado en el sistema/
  );
});

test('Validation Rule 2: Personero de Mesa cannot be assigned to the same mesa twice', async () => {
  const repo = new MockPersoneroRepository();
  const audit = new MockAuditRepository();
  const useCase = new RegisterPersoneroUseCase(repo, audit);

  // Register Personero 1 on Mesa 123456
  await useCase.execute({
    nombres_apellidos: 'Personero 1',
    dni: '11112222',
    celular: '911112222',
    rol_electoral: 'Personero de Mesa',
    distrito_asignado: 'Ate',
    mesa_asignada: '123456'
  });

  // Attempt to register Personero 2 on same Mesa 123456
  await assert.rejects(
    async () => {
      await useCase.execute({
        nombres_apellidos: 'Personero 2',
        dni: '33334444',
        celular: '933334444',
        rol_electoral: 'Personero de Mesa',
        distrito_asignado: 'Ate',
        mesa_asignada: '123456'
      });
    },
    /ya se encuentra asignada a otro personero/
  );
});

test('Validation Rule 3: Coordinador de Local allows max 2 per district', async () => {
  const repo = new MockPersoneroRepository();
  const audit = new MockAuditRepository();
  const useCase = new RegisterPersoneroUseCase(repo, audit);

  // Coordinator 1 in Barranco
  await useCase.execute({
    nombres_apellidos: 'Coordinador Local 1',
    dni: '55551111',
    celular: '955551111',
    rol_electoral: 'Coordinador de Local',
    distrito_asignado: 'Barranco',
    local_asignado: 'IE Mercedes Indacochea'
  });

  // Coordinator 2 in Barranco (Allowed)
  await useCase.execute({
    nombres_apellidos: 'Coordinador Local 2',
    dni: '55552222',
    celular: '955552222',
    rol_electoral: 'Coordinador de Local',
    distrito_asignado: 'Barranco',
    local_asignado: 'IE Corazon de Jesus'
  });

  // Coordinator 3 in Barranco (Exceeds district limit of 2 -> Must fail)
  await assert.rejects(
    async () => {
      await useCase.execute({
        nombres_apellidos: 'Coordinador Local 3',
        dni: '55553333',
        celular: '955553333',
        rol_electoral: 'Coordinador de Local',
        distrito_asignado: 'Barranco',
        local_asignado: 'IE San Martin'
      });
    },
    /límite máximo de 2 Coordinadores de Local/
  );
});

test('Validation Rule 4: Coordinador de Distritos allows strictly 1 user per assigned district', async () => {
  const repo = new MockPersoneroRepository();
  const audit = new MockAuditRepository();
  const useCase = new RegisterPersoneroUseCase(repo, audit);

  // District Coordinator 1
  await useCase.execute({
    nombres_apellidos: 'Coordinador Distrital Comas',
    dni: '88881111',
    celular: '988881111',
    rol_electoral: 'Coordinador de Distritos',
    distrito_asignado: 'Comas'
  });

  // District Coordinator 2 for same district -> Must fail
  await assert.rejects(
    async () => {
      await useCase.execute({
        nombres_apellidos: 'Coordinador Distrital Comas 2',
        dni: '88882222',
        celular: '988882222',
        rol_electoral: 'Coordinador de Distritos',
        distrito_asignado: 'Comas'
      });
    },
    /Solo se permite 1 usuario por distrito asignado/
  );
});

test('Validation Rule 5: Email and WhatsApp Alternativo cannot be duplicated', async () => {
  const repo = new MockPersoneroRepository();
  const audit = new MockAuditRepository();
  const useCase = new RegisterPersoneroUseCase(repo, audit);

  // Register Personero 1 with Email and Alt WhatsApp
  await useCase.execute({
    nombres_apellidos: 'Juan Perez',
    dni: '10002000',
    celular: '910002000',
    correo_electronico: 'juan@somosperu.pe',
    numero_whatsapp_alterno: '999888777',
    rol_electoral: 'Personero de Mesa',
    distrito_asignado: 'Surco',
    mesa_asignada: '300001'
  });

  // Attempt duplicate email
  await assert.rejects(
    async () => {
      await useCase.execute({
        nombres_apellidos: 'Maria Lopez',
        dni: '10003000',
        celular: '910003000',
        correo_electronico: 'juan@somosperu.pe',
        rol_electoral: 'Personero de Mesa',
        distrito_asignado: 'Surco',
        mesa_asignada: '300002'
      });
    },
    /El correo electrónico 'juan@somosperu.pe' ya se encuentra registrado/
  );

  // Attempt duplicate alternative WhatsApp
  await assert.rejects(
    async () => {
      await useCase.execute({
        nombres_apellidos: 'Carlos Rivas',
        dni: '10004000',
        celular: '910004000',
        correo_electronico: 'carlos@somosperu.pe',
        numero_whatsapp_alterno: '999888777',
        rol_electoral: 'Personero de Mesa',
        distrito_asignado: 'Surco',
        mesa_asignada: '300003'
      });
    },
    /El número de WhatsApp alternativo 999888777 ya se encuentra registrado/
  );
});
