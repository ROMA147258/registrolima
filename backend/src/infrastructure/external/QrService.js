import QRCode from 'qrcode';

export class QrService {
  static async generateQrDataUrl(text) {
    try {
      return await QRCode.toDataURL(text, {
        errorCorrectionLevel: 'H',
        margin: 1,
        width: 300,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
    } catch (err) {
      console.error('Error generando QR code:', err.message);
      throw err;
    }
  }
}
