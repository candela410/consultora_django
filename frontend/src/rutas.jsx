import { useEffect, useState } from 'react';
import api from './api';

function Rutas() {
  const [rutas, setRutas] = useState([]);
  const [zonas, setZonas] = useState([]);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [zona, setZona] = useState('');
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);

  const cargar = () => {
    setCargando(true);
    return api.get('rutas/')
      .then(res => setRutas(res.data))
      .catch(() => setError('No se pudieron cargar las rutas.'))
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
        await api.patch(`rutas/${editId}/`, data);
      } else {
        await api.post('rutas/', data);
      }
      limpiar();
      await cargar();
    } catch (err) {
      setError('No se pudo guardar la ruta.');
    }
  };

  const editar = (r) => {
    setEditId(r.id); setNombre(r.nombre); setDescripcion(r.descripcion); setZona(r.zona);
    setError('');
  };

  const alternarActivo = async (r) => {
    try {
      await api.patch(`rutas/${r.id}/`, { activo: !r.activo });
      await cargar();
    } catch (err) {
      setError('No se pudo cambiar el estado de la ruta.');
    }
  };

  const eliminar = async (id) => {
    if (!window.confirm('Esto elimina la ruta de forma permanente. ¿Preferís desactivarla en su lugar?\n\nAceptar = eliminar definitivamente.')) return;
    try {
      await api.delete(`rutas/${id}/`);
      await cargar();
    } catch (err) {
      setError('No se pudo eliminar la ruta.');
    }
  };

  return (
    <div>
      <h2>Rutas</h2>
      <form onSubmit={guardar}>
        <input placeholder="Nombre" value={nombre} onChange={e => setNombre(e.target.value)} required />
        <input placeholder="Descripción" value={descripcion} onChange={e => setDescripcion(e.target.value)} />
        <select value={zona} onChange={e => setZona(e.target.value)} required>
          {zonas.map(z => <option key={z.id} value={z.id}>{z.nombre}</option>)}
        </select>
        <button type="submit">{editId ? 'Actualizar' : 'Crear'}</button>
        {editId && <button type="button" onClick={limpiar}>Cancelar</button>}
      </form>
      {zonas.length === 0 && <p>Primero creá una zona para poder asignar rutas.</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {cargando && <p>Cargando...</p>}
      {!cargando && rutas.length === 0 && <p>Todavía no hay rutas cargadas.</p>}
      <ul>
        {rutas.map(r => (
          <li key={r.id} style={{ opacity: r.activo ? 1 : 0.5, marginBottom: '0.5rem' }}>
            <strong>{r.nombre}</strong> — {r.descripcion} — Zona: {r.zona_nombre}
            {' '}— <em>{r.activo ? 'Activa' : 'Inactiva'}</em>
            {' '}
            <button onClick={() => editar(r)}>Editar</button>
            <button onClick={() => alternarActivo(r)}>{r.activo ? 'Desactivar' : 'Activar'}</button>
            <button onClick={() => eliminar(r.id)}>Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Rutas;