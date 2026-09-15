const SECCIONES = [
  { key: 'zonas', label: 'Zonas' },
  { key: 'usuarios', label: 'Usuarios' },
  { key: 'grupos', label: 'Grupos' },
  { key: 'rutas', label: 'Rutas' },
  { key: 'cuestionarios', label: 'Cuestionarios' },
];

function Menu({ activo, onCambiar, onLogout }) {
  return (
    <nav style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
      {SECCIONES.map(s => (
        <button
          key={s.key}
          onClick={() => onCambiar(s.key)}
          disabled={activo === s.key}
        >
          {s.label}
        </button>
      ))}
      <button onClick={onLogout} style={{ marginLeft: 'auto' }}>Cerrar sesión</button>
    </nav>
  );
}

export default Menu;