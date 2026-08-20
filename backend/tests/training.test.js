import test from 'node:test';
import assert from 'node:assert/strict';
import { UpdateTrainingProgressUseCase } from '../src/application/use-cases/UpdateTrainingProgressUseCase.js';
import { Personero } from '../src/domain/entities/Personero.js';

class MockPersoneroRepository {
  constructor() {
    this.personeros = new Map();
  }

  seed(personero) {
    this.personeros.set(personero.dni, personero);
  }

  async findByDni(dni) {
    const p = this.personeros.get(dni);
    if (!p) return null;
    return { entity: p, tableName: 'rpersoneros' };
  }

  async updateProgress(dni, updates) {
    const p = this.personeros.get(dni);
    if (!p) throw new Error('Not found');

    p.video = updates.video ?? p.video;
    p.pdf = updates.pdf ?? p.pdf;
    p.preguntas = updates.preguntas ?? p.preguntas;
    p.credenciales = updates.credenciales ?? p.credenciales;

    return { entity: p, tableName: 'rpersoneros' };
  }
}

class MockAuditRepository {
  async log() {
    return true;
  }
}

test('Training Flow - Video increments 1 by 1 and saves', async () => {
  const repo = new MockPersoneroRepository();
  const audit = new MockAuditRepository();
  const useCase = new UpdateTrainingProgressUseCase(repo, audit);

  repo.seed(new Personero({ nombresApellidos: 'Test Personero', dni: '44556677', video: 0, pdf: 0, preguntas: 'Pendiente' }));

  // Video 1
  const step1 = await useCase.execute({ dni: '44556677', type: 'video', current: 0 });
  assert.equal(step1.video, 1);
  assert.equal(step1.pdf, 0);
  assert.equal(step1.credenciales, 'Bloqueado');

  // Video 2
  const step2 = await useCase.execute({ dni: '44556677', type: 'video', current: 1 });
  assert.equal(step2.video, 2);
  assert.equal(step2.credenciales, 'Bloqueado');
});

test('Training Flow - PDF increments 1 by 1 and saves', async () => {
  const repo = new MockPersoneroRepository();
  const audit = new MockAuditRepository();
  const useCase = new UpdateTrainingProgressUseCase(repo, audit);

  repo.seed(new Personero({ nombresApellidos: 'Test Personero', dni: '44556677', video: 2, pdf: 0, preguntas: 'Pendiente' }));

  // PDF 1
  const step1 = await useCase.execute({ dni: '44556677', type: 'pdf', current: 0 });
  assert.equal(step1.pdf, 1);
  assert.equal(step1.credenciales, 'Bloqueado');

  // PDF 2
  const step2 = await useCase.execute({ dni: '44556677', type: 'pdf', current: 1 });
  assert.equal(step2.video, 2);
  assert.equal(step2.pdf, 2);
  assert.equal(step2.credenciales, 'Bloqueado'); // Still blocked until quiz is passed
});

test('Training Flow - Quiz passed (5/5) unlocks certificate and sets Confirmado', async () => {
  const repo = new MockPersoneroRepository();
  const audit = new MockAuditRepository();
  const useCase = new UpdateTrainingProgressUseCase(repo, audit);

  repo.seed(new Personero({ nombresApellidos: 'Test Personero', dni: '44556677', video: 2, pdf: 2, preguntas: 'Pendiente' }));

  const stepQuiz = await useCase.execute({ dni: '44556677', type: 'quiz', current: 0 });
  assert.equal(stepQuiz.video, 2);
  assert.equal(stepQuiz.pdf, 2);
  assert.equal(stepQuiz.quiz, 'Aprobado');
  assert.equal(stepQuiz.credenciales, 'Confirmado');
  assert.equal(stepQuiz.user.Credenciales, 'Confirmado');
  assert.equal(stepQuiz.user.Preguntas, 'Aprobado');
});
