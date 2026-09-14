import { useEffect, useState } from 'react';
import api from './api';

function Zonas() {
  const [zonas, setZonas] = useState([]);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [editId, setEditId] = useState(null);

  const cargar = () => api.get('zonas/').then(res => setZonas(res.data));

  useEffect(() => { cargar(); }, []);

  const guardar = async (e) => {
    e.preventDefault();
    const data = { nombre, descripcion };
    if (editId) {
      await api.put(`zonas/${editId}/`, data);
    } else {
      await api.post('zonas/', data);
    }
    setNombre(''); setDescripcion(''); setEditId(null);
    cargar();
  };

  const editar = (z) => {
    setEditId(z.id); setNombre(z.nombre); setDescripcion(z.descripcion);
  };

  const eliminar = async (id) => {
    await api.delete(`zonas/${id}/`);
    cargar();
  };

  return (
    <div>
      <h2>Zonas</h2>
      <form onSubmit={guardar}>
        <input placeholder="Nombre" value={nombre} onChange={e => setNombre(e.target.value)} />
        <input placeholder="Descripción" value={descripcion} onChange={e => setDescripcion(e.target.value)} />
        <button type="submit">{editId ? 'Actualizar' : 'Crear'}</button>
      </form>
      <ul>
        {zonas.map(z => (
          <li key={z.id}>
            {z.nombre} — {z.descripcion}
            <button onClick={() => editar(z)}>Editar</button>
            <button onClick={() => eliminar(z.id)}>Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Zonas;