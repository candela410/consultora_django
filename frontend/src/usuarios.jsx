import { useEffect, useState } from 'react';
import api from './api';

const ROLES = [
  { value: 'admin', label: 'Administrador' },
  { value: 'supervisor', label: 'Supervisor' },
  { value: 'encuestador', label: 'Encuestador' },
];

function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('encuestador');
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);

  const cargar = () => {
    setCargando(true);
    return api.get('usuarios/')
      .then(res => setUsuarios(res.data))
      .catch(() => setError('No se pudieron cargar los usuarios.'))
      .finally(() => setCargando(false));
  };

  useEffect(() => { cargar(); }, []);

  const limpiar = () => {
    setUsername(''); setEmail(''); setPassword(''); setRol('encuestador'); setEditId(null);
  };

  const guardar = async (e) => {
    e.preventDefault();
    setError('');
    const data = { username, email, rol };
    if (password) data.password = password;
    try {
      if (editId) {
        await api.patch(`usuarios/${editId}/`, data);
      } else {
        await api.post('usuarios/', data);
      }
      limpiar();
      await cargar();
    } catch (err) {
      const detalle = err.response?.data ? JSON.stringify(err.response.data) : 'Error al guardar';
      setError(detalle);
    }
  };

  const editar = (u) => {
    setEditId(u.id); setUsername(u.username); setEmail(u.email); setRol(u.rol); setPassword('');
    setError('');
  };

  const alternarActivo = async (u) => {
    try {
      await api.patch(`usuarios/${u.id}/`, { is_active: !u.is_active });
      await cargar();
    } catch (err) {
      setError('No se pudo cambiar el estado del usuario.');
    }
  };

  const eliminar = async (id) => {
    if (!window.confirm('Esto elimina el usuario de forma permanente. ¿Preferís desactivarlo en su lugar?\n\nAceptar = eliminar definitivamente.')) return;
    try {
      await api.delete(`usuarios/${id}/`);
      await cargar();
    } catch (err) {
      setError('No se pudo eliminar el usuario.');
    }
  };

  return (
    <div>
      <h2>Usuarios</h2>
      <form onSubmit={guardar}>
        <input placeholder="Usuario" value={username} onChange={e => setUsername(e.target.value)} required />
        <input placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
        <input
          placeholder={editId ? 'Nueva contraseña (opcional)' : 'Contraseña'}
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <select value={rol} onChange={e => setRol(e.target.value)}>
          {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
        <button type="submit">{editId ? 'Actualizar' : 'Crear'}</button>
        {editId && <button type="button" onClick={limpiar}>Cancelar</button>}
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {cargando && <p>Cargando...</p>}
      {!cargando && usuarios.length === 0 && <p>Todavía no hay usuarios cargados.</p>}
      <ul>
        {usuarios.map(u => (
          <li key={u.id} style={{ opacity: u.is_active ? 1 : 0.5, marginBottom: '0.5rem' }}>
            <strong>{u.username}</strong> — {u.email || 'sin email'} — {ROLES.find(r => r.value === u.rol)?.label || u.rol}
            {' '}— <em>{u.is_active ? 'Activo' : 'Inactivo'}</em>
            {' '}
            <button onClick={() => editar(u)}>Editar</button>
            <button onClick={() => alternarActivo(u)}>{u.is_active ? 'Desactivar' : 'Activar'}</button>
            <button onClick={() => eliminar(u.id)}>Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Usuarios;