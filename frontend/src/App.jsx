import { useState } from 'react';
import Login from './Login';
import Zonas from './Zonas';

function App() {
  const [logueado, setLogueado] = useState(!!localStorage.getItem('access'));

  if (!logueado) return <Login onLogin={() => setLogueado(true)} />;
  return <Zonas />;
}

export default App;