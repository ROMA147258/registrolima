import { TRAINING_RULES } from '../../config/constants.js';

export class UpdateTrainingProgressUseCase {
  constructor(personeroRepository, auditRepository) {
    this.personeroRepo = personeroRepository;
    this.auditRepo = auditRepository;
  }

  async execute({ dni, type, current }, context = {}) {
    const cleanDni = String(dni || '').trim();
    if (!cleanDni) throw new Error('El DNI es obligatorio.');

    const match = await this.personeroRepo.findByDni(cleanDni);
    if (!match || !match.entity) {
      throw new Error(`Personero con DNI ${cleanDni} no encontrado.`);
    }

    const entity = match.entity;
    let videoCount = entity.video || 0;
    let pdfCount = entity.pdf || 0;
    let quizStatus = entity.preguntas || 'Pendiente';

    if (type === 'video') {
      videoCount = Math.min(2, Math.max(videoCount, (parseInt(current, 10) || 0) + 1));
    } else if (type === 'pdf') {
      pdfCount = Math.min(2, Math.max(pdfCount, (parseInt(current, 10) || 0) + 1));
    } else if (type === 'quiz' || type === 'preguntas') {
      quizStatus = TRAINING_RULES.PASSING_QUIZ_STATUS;
    }

    const isQuizPassed = quizStatus === TRAINING_RULES.PASSING_QUIZ_STATUS;
    const credencialesStatus = (videoCount >= 2 && pdfCount >= 2 && isQuizPassed)
      ? TRAINING_RULES.CREDENTIAL_CONFIRMED
      : TRAINING_RULES.CREDENTIAL_BLOCKED;

    const updated = await this.personeroRepo.updateProgress(cleanDni, {
      video: videoCount,
      pdf: pdfCount,
      preguntas: quizStatus,
      credenciales: credencialesStatus
    });

    await this.auditRepo.log({
      action: 'UPDATE_TRAINING',
      userIdentifier: cleanDni,
      role: entity.rolADesempenar,
      details: { type, video: videoCount, pdf: pdfCount, quiz: quizStatus, credenciales: credencialesStatus },
      ipAddress: context.ip,
      userAgent: context.userAgent
    });

    return {
      status: 'success',
      video: videoCount,
      pdf: pdfCount,
      quiz: quizStatus,
      credenciales: credencialesStatus,
      data: updated.entity
    };
  }
}
