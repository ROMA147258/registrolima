import test from 'node:test';
import assert from 'node:assert/strict';
import { Personero } from '../src/domain/entities/Personero.js';
import { Coordinador } from '../src/domain/entities/Coordinador.js';
import { ValidationDomainService } from '../src/domain/services/ValidationDomainService.js';

test('Personero Entity - Initial state should be blocked', () => {
  const p = new Personero({
    nombresApellidos: 'Juan Perez',
    dni: '12345678'
  });

  assert.equal(p.dni, '12345678');
  assert.equal(p.video, 0);
  assert.equal(p.pdf, 0);
  assert.equal(p.preguntas, 'Pendiente');
  assert.equal(p.credenciales, 'Bloqueado');
  assert.equal(p.isTrainingComplete(), false);
});

test('Coordinador Entity - Handles district and role correctly', () => {
  const c = new Coordinador({
    nombresApellidos: 'Nilton Alex Montalvo policarpio',
    dni: '40231051',
    rolADesempenar: 'Coordinador de Local',
    distritoAsignado: 'Comas'
  });

  assert.equal(c.dni, '40231051');
  assert.equal(c.rolADesempenar, 'Coordinador de Local');
  assert.equal(c.distritoAsignado, 'Comas');
});

test('Personero Entity - When 2 videos, 2 pdfs and approved quiz, credential is Confirmed', () => {
  const p = new Personero({
    nombresApellidos: 'Maria Gomez',
    dni: '87654321',
    video: 2,
    pdf: 2,
    preguntas: 'Aprobado'
  });

  assert.equal(p.isTrainingComplete(), true);
  assert.equal(p.evaluateCredentialStatus(), 'Confirmado');
});

test('ValidationDomainService - Validates 8-digit DNI properly', () => {
  assert.equal(ValidationDomainService.validateDni('12345678'), '12345678');
  assert.throws(() => ValidationDomainService.validateDni('1234'), /8 dígitos/);
  assert.throws(() => ValidationDomainService.validateDni('123456789'), /8 dígitos/);
  assert.throws(() => ValidationDomainService.validateDni('abcdefgh'), /8 dígitos/);
});

test('ValidationDomainService - Validates Email properly', () => {
  assert.equal(ValidationDomainService.validateEmail('test@somosperu.pe'), 'test@somosperu.pe');
  assert.equal(ValidationDomainService.validateEmail(null), null);
  assert.throws(() => ValidationDomainService.validateEmail('invalid-email'), /no es válido/);
});
