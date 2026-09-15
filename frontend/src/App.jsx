import { useState } from 'react';
import Login from './Login';
import Menu from './menu';
import Zonas from './Zonas';
import Usuarios from './usuarios';
import Grupos from './grupos';
import Rutas from './rutas';
import Cuestionarios from './cuestionarios';

const VISTAS = {
  zonas: Zonas,
  usuarios: Usuarios,
  grupos: Grupos,
  rutas: Rutas,
  cuestionarios: Cuestionarios,
};

function App() {
  const [logueado, setLogueado] = useState(!!localStorage.getItem('access'));
  const [seccion, setSeccion] = useState('zonas');

  const logout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    setLogueado(false);
  };

  if (!logueado) return <Login onLogin={() => setLogueado(true)} />;

  const Vista = VISTAS[seccion];

  return (
    <div>
      <Menu activo={seccion} onCambiar={setSeccion} onLogout={logout} />
      <Vista />
    </div>
  );
}

export default App;