export class Personero {
  constructor({
    id = null,
    fechaRegistro = new Date(),
    nombresApellidos,
    dni,
    celular = null,
    correoElectronico = null,
    usaWhatsApp = 'Sí',
    numeroWhatsAppAlterno = null,
    distritoDondeVota = null,
    mesaDeSufragio = null,
    localDeVotacion = null,
    rolADesempenar = 'Personero de Mesa',
    distritoAsignado = null,
    mesaAsignada = null,
    localDeVotacionAsignado = null,
    tieneExperiencia = 'No',
    cuentaConMovilidad = 'No',
    seCompromete = 'Sí',
    video = 0,
    pdf = 0,
    preguntas = 'Pendiente',
    credenciales = 'Bloqueado',
    tokenVerificacion = null
  }) {
    this.id = id;
    this.fechaRegistro = fechaRegistro;
    this.nombresApellidos = nombresApellidos;
    this.dni = String(dni).trim();
    this.celular = celular;
    this.correoElectronico = correoElectronico;
    this.usaWhatsApp = usaWhatsApp;
    this.numeroWhatsAppAlterno = numeroWhatsAppAlterno;
    this.distritoDondeVota = distritoDondeVota;
    this.mesaDeSufragio = mesaDeSufragio;
    this.localDeVotacion = localDeVotacion;
    this.rolADesempenar = rolADesempenar;
    this.distritoAsignado = distritoAsignado;
    this.mesaAsignada = mesaAsignada;
    this.localDeVotacionAsignado = localDeVotacionAsignado;
    this.tieneExperiencia = tieneExperiencia;
    this.cuentaConMovilidad = cuentaConMovilidad;
    this.seCompromete = seCompromete;
    this.video = parseInt(video, 10) || 0;
    this.pdf = parseInt(pdf, 10) || 0;
    this.preguntas = preguntas;
    this.credenciales = credenciales;
    this.tokenVerificacion = tokenVerificacion || `SP-LM2026-${this.dni}`;
  }

  isTrainingComplete() {
    return this.video >= 2 && this.pdf >= 2 && this.preguntas === 'Aprobado';
  }

  evaluateCredentialStatus() {
    this.credenciales = this.isTrainingComplete() ? 'Confirmado' : 'Bloqueado';
    return this.credenciales;
  }
}
