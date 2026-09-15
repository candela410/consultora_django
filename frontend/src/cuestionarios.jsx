import { useEffect, useState } from 'react';
import api from './api';

const TIPOS = [
  { value: 'texto', label: 'Texto libre' },
  { value: 'opcion', label: 'Opción múltiple' },
  { value: 'sino', label: 'Sí / No' },
];

function vacia() {
  return { texto: '', tipo: 'texto' };
}

function Cuestionarios() {
  const [cuestionarios, setCuestionarios] = useState([]);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [preguntas, setPreguntas] = useState([vacia()]);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);

  const cargar = () => {
    setCargando(true);
    return api.get('cuestionarios/')
      .then(res => setCuestionarios(res.data))
      .catch(() => setError('No se pudieron cargar los cuestionarios.'))
      .finally(() => setCargando(false));
  };

  useEffect(() => { cargar(); }, []);

  const limpiar = () => {
    setTitulo(''); setDescripcion(''); setPreguntas([vacia()]); setEditId(null);
  };

  const actualizarPregunta = (i, campo, valor) => {
    setPreguntas(prev => prev.map((p, idx) => idx === i ? { ...p, [campo]: valor } : p));
  };

  const agregarPregunta = () => setPreguntas(prev => [...prev, vacia()]);

  const quitarPregunta = (i) => setPreguntas(prev => prev.filter((_, idx) => idx !== i));

  const guardar = async (e) => {
    e.preventDefault();
    setError('');
    const data = {
      titulo,
      descripcion,
      preguntas: preguntas
        .filter(p => p.texto.trim() !== '')
        .map((p, i) => ({ texto: p.texto, tipo: p.tipo, orden: i })),
    };
    try {
      if (editId) {
        await api.put(`cuestionarios/${editId}/`, data);
      } else {
        await api.post('cuestionarios/', data);
      }
      limpiar();
      await cargar();
    } catch (err) {
      setError('No se pudo guardar el cuestionario.');
    }
  };

  const editar = (c) => {
    setEditId(c.id);
    setTitulo(c.titulo);
    setDescripcion(c.descripcion);
    setPreguntas(c.preguntas.length ? c.preguntas.map(p => ({ texto: p.texto, tipo: p.tipo })) : [vacia()]);
    setError('');
  };

  const alternarActivo = async (c) => {
    try {
      await api.patch(`cuestionarios/${c.id}/`, { activo: !c.activo });
      await cargar();
    } catch (err) {
      setError('No se pudo cambiar el estado del cuestionario.');
    }
  };

  const eliminar = async (id) => {
    if (!window.confirm('Esto elimina el cuestionario de forma permanente. ¿Preferís desactivarlo en su lugar?\n\nAceptar = eliminar definitivamente.')) return;
    try {
      await api.delete(`cuestionarios/${id}/`);
      await cargar();
    } catch (err) {
      setError('No se pudo eliminar el cuestionario.');
    }
  };

  return (
    <div>
      <h2>Cuestionarios</h2>
      <form onSubmit={guardar}>
        <input placeholder="Título" value={titulo} onChange={e => setTitulo(e.target.value)} required />
        <input placeholder="Descripción" value={descripcion} onChange={e => setDescripcion(e.target.value)} />

        <h4>Preguntas</h4>
        {preguntas.map((p, i) => (
          <div key={i}>
            <input
              placeholder={`Pregunta ${i + 1}`}
              value={p.texto}
              onChange={e => actualizarPregunta(i, 'texto', e.target.value)}
            />
            <select value={p.tipo} onChange={e => actualizarPregunta(i, 'tipo', e.target.value)}>
              {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            {preguntas.length > 1 && (
              <button type="button" onClick={() => quitarPregunta(i)}>Quitar</button>
            )}
          </div>
        ))}
        <button type="button" onClick={agregarPregunta}>+ Agregar pregunta</button>
        <br />
        <button type="submit">{editId ? 'Actualizar' : 'Crear'}</button>
        {editId && <button type="button" onClick={limpiar}>Cancelar</button>}
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {cargando && <p>Cargando...</p>}
      {!cargando && cuestionarios.length === 0 && <p>Todavía no hay cuestionarios cargados.</p>}
      <ul>
        {cuestionarios.map(c => (
          <li key={c.id} style={{ opacity: c.activo ? 1 : 0.5, marginBottom: '0.5rem' }}>
            <strong>{c.titulo}</strong> — {c.descripcion}
            {' '}— <em>{c.activo ? 'Activo' : 'Inactivo'}</em>
            <ul>
              {c.preguntas.map(p => (
                <li key={p.id}>{p.texto} ({TIPOS.find(t => t.value === p.tipo)?.label || p.tipo})</li>
              ))}
            </ul>
            <button onClick={() => editar(c)}>Editar</button>
            <button onClick={() => alternarActivo(c)}>{c.activo ? 'Desactivar' : 'Activar'}</button>
            <button onClick={() => eliminar(c.id)}>Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Cuestionarios;