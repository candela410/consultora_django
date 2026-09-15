import { useEffect, useState } from 'react';
import api from './api';

function Zonas() {
  const [zonas, setZonas] = useState([]);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);

  const cargar = () => {
    setCargando(true);
    return api.get('zonas/')
      .then(res => setZonas(res.data))
      .catch(() => setError('No se pudieron cargar las zonas.'))
      .finally(() => setCargando(false));
  };

  useEffect(() => { cargar(); }, []);

  const limpiar = () => {
    setNombre(''); setDescripcion(''); setEditId(null);
  };

  const guardar = async (e) => {
    e.preventDefault();
    setError('');
    const data = { nombre, descripcion };
    try {
      if (editId) {
        await api.patch(`zonas/${editId}/`, data);
      } else {
        await api.post('zonas/', data);
      }
      limpiar();
      await cargar();
    } catch (err) {
      setError('No se pudo guardar la zona.');
    }
  };

  const editar = (z) => {
    setEditId(z.id); setNombre(z.nombre); setDescripcion(z.descripcion);
    setError('');
  };

  const alternarActivo = async (z) => {
    try {
      await api.patch(`zonas/${z.id}/`, { activo: !z.activo });
      await cargar();
    } catch (err) {
      setError('No se pudo cambiar el estado de la zona.');
    }
  };

  const eliminar = async (id) => {
    if (!window.confirm('Esto elimina la zona de forma permanente (y todo lo que dependa de ella). ¿Preferís desactivarla en su lugar?\n\nAceptar = eliminar definitivamente.')) return;
    try {
      await api.delete(`zonas/${id}/`);
      await cargar();
    } catch (err) {
      setError('No se pudo eliminar la zona.');
    }
  };

  return (
    <div>
      <h2>Zonas</h2>
      <form onSubmit={guardar}>
        <input placeholder="Nombre" value={nombre} onChange={e => setNombre(e.target.value)} required />
        <input placeholder="Descripción" value={descripcion} onChange={e => setDescripcion(e.target.value)} />
        <button type="submit">{editId ? 'Actualizar' : 'Crear'}</button>
        {editId && <button type="button" onClick={limpiar}>Cancelar</button>}
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {cargando && <p>Cargando...</p>}
      {!cargando && zonas.length === 0 && <p>Todavía no hay zonas cargadas.</p>}
      <ul>
        {zonas.map(z => (
          <li key={z.id} style={{ opacity: z.activo ? 1 : 0.5, marginBottom: '0.5rem' }}>
            <strong>{z.nombre}</strong> — {z.descripcion}
            {' '}— <em>{z.activo ? 'Activa' : 'Inactiva'}</em>
            {' '}
            <button onClick={() => editar(z)}>Editar</button>
            <button onClick={() => alternarActivo(z)}>{z.activo ? 'Desactivar' : 'Activar'}</button>
            <button onClick={() => eliminar(z.id)}>Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Zonas;