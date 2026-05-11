/**
 * Logo — componente centralizado del logo de Infinity Inmobiliaria.
 *
 * Usar este componente en TODOS los lugares donde aparece el logo
 * para garantizar consistencia. Si el archivo del logo cambia,
 * solo hay que actualizar LOGO_SRC aquí.
 */

/** Ruta pública del logo (carpeta public/assets, servida por Vite) */
const LOGO_SRC = '/assets/Logo_Infinity.png';
const LOGO_ALT = 'Infinity Inmobiliaria - Constructora';

interface LogoProps {
  /** Clase Tailwind de altura. Por defecto: h-10 */
  className?: string;
  /** Si true, envuelve la imagen en un <a> que navega a "/" */
  asLink?: boolean;
}

export default function Logo({ className = 'h-10 w-auto object-contain', asLink = false }: LogoProps) {
  const img = (
    <img
      src={LOGO_SRC}
      alt={LOGO_ALT}
      className={className}
      draggable={false}
    />
  );

  if (asLink) {
    return (
      <a href="/" aria-label={LOGO_ALT}>
        {img}
      </a>
    );
  }

  return img;
}
