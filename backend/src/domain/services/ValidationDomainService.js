export class ValidationDomainService {
  static validateDni(dni) {
    const cleanDni = String(dni || '').trim();
    if (!/^\d{8}$/.test(cleanDni)) {
      throw new Error('El DNI debe contener exactamente 8 dígitos numéricos.');
    }
    return cleanDni;
  }

  static validateEmail(email) {
    if (!email || !email.trim()) return null;
    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      throw new Error('El formato del correo electrónico no es válido.');
    }
    return cleanEmail;
  }

  static validatePhone(phone) {
    if (!phone || !phone.trim()) return null;
    const cleanPhone = phone.trim().replace(/[^\d+]/g, '');
    if (cleanPhone.length < 7 || cleanPhone.length > 15) {
      throw new Error('El número telefónico debe tener entre 7 y 15 dígitos.');
    }
    return cleanPhone;
  }

  static validateRegistrationPayload(data) {
    if (!data.nombres_apellidos && !data['Nombres y Apellidos']) {
      throw new Error('Nombres y Apellidos son obligatorios.');
    }
    const dni = this.validateDni(data.dni || data['DNI'] || data['D.N.I.']);
    const email = this.validateEmail(data.correo || data.correo_electronico || data['Correo Electrónico']);
    const phone = this.validatePhone(data.celular || data['Celular']);
    
    return {
      dni,
      email,
      phone
    };
  }
}
