import React, { useState } from 'react';
import { User, Lock, LogIn, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export function LoginView({ onBackToRegister }) {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    const userVal = username.trim();
    const passVal = password.trim();

    if (!userVal || !passVal) {
      setErrorMsg('Por favor ingrese su usuario o nombre y su contraseña o DNI.');
      return;
    }

    setLoading(true);
    try {
      await login({
        username: userVal,
        fullName: userVal,
        password: passVal,
        dni: passVal
      });
    } catch (err) {
      setErrorMsg(err.message || 'Credenciales incorrectas. Verifique sus datos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'rgb(193, 229, 249)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '24px 16px',
      fontFamily: "'Outfit', 'Montserrat', sans-serif"
    }}>
      <div style={{
        background: '#ffffff',
        border: '1.5px solid #bae6fd',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '440px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.08)',
        color: '#0f172a',
        overflow: 'hidden',
        animation: 'fadeIn 0.2s ease-out'
      }}>
        
        {/* Encabezado con Sello Oficial del Partido Somos Perú (Sin círculo contenedor) */}
        <div style={{
          background: '#ffffff',
          padding: '28px 24px 16px',
          textAlign: 'center',
          borderBottom: '1px solid #e0f2fe'
        }}>
          {/* Sello Oficial del Partido sin círculo */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
            <img
              src="/images/logo_somos_peru.svg"
              alt="Sello Partido Democrático Somos Perú"
              style={{ width: '130px', height: 'auto', maxHeight: '75px', objectFit: 'contain' }}
            />
          </div>

          <h1 style={{
            fontFamily: 'Cinzel, serif',
            color: '#0f172a',
            fontSize: '1.35rem',
            fontWeight: 900,
            margin: '0 0 4px 0',
            letterSpacing: '0.5px'
          }}>
            SOMOS PERÚ 2026
          </h1>

          <div style={{
            color: '#0284c7',
            fontSize: '0.82rem',
            fontWeight: 800,
            letterSpacing: '0.8px',
            textTransform: 'uppercase'
          }}>
            Portal de Acceso y Control Electoral
          </div>

          <div style={{ display: 'flex', height: '3px', width: '100px', margin: '10px auto 0', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ flex: 1, background: '#e30613' }}></div>
            <div style={{ flex: 1, background: '#cbd5e1' }}></div>
            <div style={{ flex: 1, background: 'rgb(14, 165, 233)' }}></div>
          </div>
        </div>

        {/* Formulario */}
        <div style={{ padding: '24px' }}>
          
          {errorMsg && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '10px',
              padding: '12px 14px',
              marginBottom: '18px',
              color: '#dc2626',
              fontSize: '0.82rem',
              fontWeight: 700
            }}>
              ⚠️ {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Campo 1: Usuario / Nombre con icono bien visible */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#1e293b',
                marginBottom: '6px'
              }}>
                Usuario o Nombres <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <User className="w-5 h-5" style={{ position: 'absolute', left: '12px', top: '12px', color: '#0284c7' }} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder=""
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 40px',
                    borderRadius: '10px',
                    border: '1.5px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#0f172a',
                    fontSize: '0.92rem',
                    outline: 'none',
                    transition: 'all 0.15s ease'
                  }}
                  onFocus={(e) => { e.target.style.borderColor = 'rgb(14, 165, 233)'; e.target.style.boxShadow = '0 0 0 3px rgba(14, 165, 233, 0.2)'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#cbd5e1'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '4px', paddingLeft: '2px' }}>
                Ejemplo: Juan Pérez Quispe
              </div>
            </div>

            {/* Campo 2: Contraseña / DNI con icono bien visible */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#1e293b',
                marginBottom: '6px'
              }}>
                Contraseña o DNI <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Lock className="w-5 h-5" style={{ position: 'absolute', left: '12px', top: '12px', color: '#0284c7' }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder=""
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 40px',
                    borderRadius: '10px',
                    border: '1.5px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#0f172a',
                    fontSize: '0.92rem',
                    outline: 'none',
                    transition: 'all 0.15s ease'
                  }}
                  onFocus={(e) => { e.target.style.borderColor = 'rgb(14, 165, 233)'; e.target.style.boxShadow = '0 0 0 3px rgba(14, 165, 233, 0.2)'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#cbd5e1'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '4px', paddingLeft: '2px' }}>
                Ejemplo: Ingrese su DNI (o su Clave asignada si es Coordinador Distrital)
              </div>
            </div>

            {/* Botón Ingresar */}
            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '8px',
                padding: '14px',
                borderRadius: '10px',
                border: 'none',
                background: 'rgb(14, 165, 233)',
                color: '#ffffff',
                fontWeight: 900,
                fontSize: '0.98rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 15px rgba(14, 165, 233, 0.4)',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.98)'; }}
              onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              <LogIn className="w-5 h-5" />
              <span>{loading ? 'Ingresando...' : 'Ingresar al Sistema'}</span>
            </button>
          </form>

        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 24px',
          background: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          textAlign: 'center'
        }}>
          <button
            type="button"
            onClick={onBackToRegister}
            style={{
              background: 'none',
              border: 'none',
              color: '#0284c7',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>¿Aún no estás inscrito? Regístrate aquí</span>
          </button>
        </div>

      </div>
    </div>
  );
}
