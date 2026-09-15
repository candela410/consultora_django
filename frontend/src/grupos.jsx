import { useEffect, useState } from 'react';
import api from './api';

function Grupos() {
  const [grupos, setGrupos] = useState([]);
  const [zonas, setZonas] = useState([]);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [zona, setZona] = useState('');
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);

  const cargar = () => {
    setCargando(true);
    return api.get('grupos/')
      .then(res => setGrupos(res.data))
      .catch(() => setError('No se pudieron cargar los grupos.'))
      .finally(() => setCargando(false));
  };
  const cargarZonas = () => api.get('zonas/').then(res => {
    setZonas(res.data);
    if (res.data.length && !zona) setZona(res.data[0].id);
  });

  useEffect(() => { cargar(); cargarZonas(); }, []);

  const limpiar = () => {
    setNombre(''); setDescripcion(''); setEditId(null);
    if (zonas.length) setZona(zonas[0].id);
  };

  const guardar = async (e) => {
    e.preventDefault();
    setError('');
    const data = { nombre, descripcion, zona };
    try {
      if (editId) {
        await api.patch(`grupos/${editId}/`, data);
      } else {
        await api.post('grupos/', data);
      }
      limpiar();
      await cargar();
    } catch (err) {
      setError('No se pudo guardar el grupo.');
    }
  };

  const editar = (g) => {
    setEditId(g.id); setNombre(g.nombre); setDescripcion(g.descripcion); setZona(g.zona);
    setError('');
  };

  const alternarActivo = async (g) => {
    try {
      await api.patch(`grupos/${g.id}/`, { activo: !g.activo });
      await cargar();
    } catch (err) {
      setError('No se pudo cambiar el estado del grupo.');
    }
  };

  const eliminar = async (id) => {
    if (!window.confirm('Esto elimina el grupo de forma permanente. ¿Preferís desactivarlo en su lugar?\n\nAceptar = eliminar definitivamente.')) return;
    try {
      await api.delete(`grupos/${id}/`);
      await cargar();
    } catch (err) {
      setError('No se pudo eliminar el grupo.');
    }
  };

  return (
    <div>
      <h2>Grupos</h2>
      <form onSubmit={guardar}>
        <input placeholder="Nombre" value={nombre} onChange={e => setNombre(e.target.value)} required />
        <input placeholder="Descripción" value={descripcion} onChange={e => setDescripcion(e.target.value)} />
        <select value={zona} onChange={e => setZona(e.target.value)} required>
          {zonas.map(z => <option key={z.id} value={z.id}>{z.nombre}</option>)}
        </select>
        <button type="submit">{editId ? 'Actualizar' : 'Crear'}</button>
        {editId && <button type="button" onClick={limpiar}>Cancelar</button>}
      </form>
      {zonas.length === 0 && <p>Primero creá una zona para poder asignar grupos.</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {cargando && <p>Cargando...</p>}
      {!cargando && grupos.length === 0 && <p>Todavía no hay grupos cargados.</p>}
      <ul>
        {grupos.map(g => (
          <li key={g.id} style={{ opacity: g.activo ? 1 : 0.5, marginBottom: '0.5rem' }}>
            <strong>{g.nombre}</strong> — {g.descripcion} — Zona: {g.zona_nombre}
            {' '}— <em>{g.activo ? 'Activo' : 'Inactivo'}</em>
            {' '}
            <button onClick={() => editar(g)}>Editar</button>
            <button onClick={() => alternarActivo(g)}>{g.activo ? 'Desactivar' : 'Activar'}</button>
            <button onClick={() => eliminar(g.id)}>Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Grupos;