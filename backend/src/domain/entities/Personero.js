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

    // Aliases con nombres en español para retrocompatibilidad con SQL Server y Dashboards
    this['ID'] = this.id;
    this['Fecha de Registro'] = this.fechaRegistro;
    this['Nombres y Apellidos'] = this.nombresApellidos;
    this['D.N.I.'] = this.dni;
    this['DNI'] = this.dni;
    this['Celular'] = this.celular;
    this['Correo Electrónico'] = this.correoElectronico;
    this['Usa WhatsApp en su Celular'] = this.usaWhatsApp;
    this['Número WhatsApp Alterno'] = this.numeroWhatsAppAlterno;
    this['Distrito donde Vota'] = this.distritoDondeVota;
    this['Mesa de Sufragio'] = this.mesaDeSufragio;
    this['Local de Votación'] = this.localDeVotacion;
    this['Rol a Desempeñar'] = this.rolADesempenar;
    this['Distrito Asignado'] = this.distritoAsignado;
    this['Mesa Asignada'] = this.mesaAsignada;
    this['Local de Votación Asignado'] = this.localDeVotacionAsignado;
    this['Tiene Experiencia como Personero'] = this.tieneExperiencia;
    this['Cuenta con Movilidad Propia'] = this.cuentaConMovilidad;
    this['Se compromete a colaborar el 4 de Octubre del 2026 en las Elecciones'] = this.seCompromete;
    this['Video'] = this.video;
    this['PDF'] = this.pdf;
    this['Preguntas'] = this.preguntas;
    this['Credenciales'] = this.credenciales;
    this['Token'] = this.tokenVerificacion;
  }

  isTrainingComplete() {
    const p = String(this.preguntas || '').trim().toLowerCase();
    const c = String(this.credenciales || '').trim().toLowerCase();
    return (this.video >= 2 && this.pdf >= 2 && (p.includes('aprob') || p.includes('pasad') || c === 'confirmado')) || c === 'confirmado';
  }

  evaluateCredentialStatus() {
    const c = String(this.credenciales || '').trim().toLowerCase();
    if (c === 'confirmado' || this.isTrainingComplete()) {
      this.credenciales = 'Confirmado';
      this.preguntas = 'Aprobado';
    } else {
      this.credenciales = 'Bloqueado';
    }
    this['Credenciales'] = this.credenciales;
    this['Preguntas'] = this.preguntas;
    return this.credenciales;
  }

  toJSON() {
    return {
      id: this.id,
      ID: this.id,
      fechaRegistro: this.fechaRegistro,
      'Fecha de Registro': this.fechaRegistro,
      nombresApellidos: this.nombresApellidos,
      'Nombres y Apellidos': this.nombresApellidos,
      dni: this.dni,
      DNI: this.dni,
      'D.N.I.': this.dni,
      celular: this.celular,
      Celular: this.celular,
      correoElectronico: this.correoElectronico,
      'Correo Electrónico': this.correoElectronico,
      usaWhatsApp: this.usaWhatsApp,
      'Usa WhatsApp en su Celular': this.usaWhatsApp,
      numeroWhatsAppAlterno: this.numeroWhatsAppAlterno,
      'Número WhatsApp Alterno': this.numeroWhatsAppAlterno,
      distritoDondeVota: this.distritoDondeVota,
      'Distrito donde Vota': this.distritoDondeVota,
      mesaDeSufragio: this.mesaDeSufragio,
      'Mesa de Sufragio': this.mesaDeSufragio,
      localDeVotacion: this.localDeVotacion,
      'Local de Votación': this.localDeVotacion,
      rolADesempenar: this.rolADesempenar,
      'Rol a Desempeñar': this.rolADesempenar,
      distritoAsignado: this.distritoAsignado,
      'Distrito Asignado': this.distritoAsignado,
      mesaAsignada: this.mesaAsignada,
      'Mesa Asignada': this.mesaAsignada,
      localDeVotacionAsignado: this.localDeVotacionAsignado,
      'Local de Votación Asignado': this.localDeVotacionAsignado,
      tieneExperiencia: this.tieneExperiencia,
      'Tiene Experiencia como Personero': this.tieneExperiencia,
      cuentaConMovilidad: this.cuentaConMovilidad,
      'Cuenta con Movilidad Propia': this.cuentaConMovilidad,
      seCompromete: this.seCompromete,
      'Se compromete a colaborar el 4 de Octubre del 2026 en las Elecciones': this.seCompromete,
      video: this.video,
      Video: this.video,
      pdf: this.pdf,
      PDF: this.pdf,
      preguntas: this.preguntas,
      Preguntas: this.preguntas,
      credenciales: this.credenciales,
      Credenciales: this.credenciales,
      tokenVerificacion: this.tokenVerificacion,
      Token: this.tokenVerificacion
    };
  }
}
