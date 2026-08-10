export const defaultGoogleScriptUrl = 'https://script.google.com/macros/s/AKfycbz0dlFrxIV4l3MgQqcZvtd2MdduidYOmluqa9PFedbb5lYA3Sq_iU6s2BT8c-Yt1nytuQ/exec';
export const fallbackGoogleScriptUrl = 'https://script.google.com/macros/s/AKfycbz0dlFrxIV4l3MgQqcZvtd2MdduidYOmluqa9PFedbb5lYA3Sq_iU6s2BT8c-Yt1nytuQ/exec';

export function getGoogleScriptUrl() {
  const cached = localStorage.getItem('custom_google_script_url');
  if (cached && cached !== defaultGoogleScriptUrl) {
    localStorage.removeItem('custom_google_script_url');
  }
  return defaultGoogleScriptUrl;
}

export function setGoogleScriptUrl(url) {
  if (url && url.trim()) {
    localStorage.setItem('custom_google_script_url', url.trim());
  } else {
    localStorage.removeItem('custom_google_script_url');
  }
}

export const distritosLima = [
  "Ancón",
  "Ate",
  "Barranco",
  "Breña",
  "Carabayllo",
  "Cercado de Lima",
  "Chaclacayo",
  "Chorrillos",
  "Cieneguilla",
  "Comas",
  "El Agustino",
  "Independencia",
  "Jesús María",
  "La Molina",
  "La Victoria",
  "Lince",
  "Los Olivos",
  "Lurigancho-Chosica",
  "Lurín",
  "Magdalena del Mar",
  "Miraflores",
  "Pachacámac",
  "Pucusana",
  "Pueblo Libre",
  "Puente Piedra",
  "Punta Hermosa",
  "Punta Negra",
  "Rímac",
  "San Bartolo",
  "San Borja",
  "San Isidro",
  "San Juan de Lurigancho",
  "San Juan de Miraflores",
  "San Luis",
  "San Martín de Porres",
  "San Miguel",
  "Santa Anita",
  "Santa María del Mar",
  "Santa Rosa",
  "Santiago de Surco",
  "Surquillo",
  "Villa El Salvador",
  "Villa María del Triunfo"
];

export const distritoMetas = {
  "Ancón": 164,
  "Ate": 1650,
  "Barranco": 151,
  "Breña": 355,
  "Carabayllo": 855,
  "Cercado de Lima": 1030,
  "Chaclacayo": 139,
  "Chorrillos": 896,
  "Cieneguilla": 103,
  "Comas": 1493,
  "El Agustino": 572,
  "Independencia": 595,
  "Jesús María": 431,
  "La Molina": 571,
  "La Victoria": 642,
  "Lince": 294,
  "Los Olivos": 983,
  "Lurigancho-Chosica": 548,
  "Lurín": 247,
  "Magdalena del Mar": 255,
  "Miraflores": 480,
  "Pachacámac": 315,
  "Pucusana": 44,
  "Pueblo Libre": 337,
  "Puente Piedra": 889,
  "Punta Hermosa": 32,
  "Punta Negra": 25,
  "Rímac": 567,
  "San Bartolo": 24,
  "San Borja": 420,
  "San Isidro": 300,
  "San Juan de Lurigancho": 2800,
  "San Juan de Miraflores": 1000,
  "San Luis": 160,
  "San Martín de Porres": 1800,
  "San Miguel": 400,
  "Santa Anita": 550,
  "Santa María del Mar": 10,
  "Santa Rosa": 40,
  "Santiago de Surco": 850,
  "Surquillo": 280,
  "Villa El Salvador": 1100,
  "Villa María del Triunfo": 1000
};


