import React, { useState, useEffect } from 'react';
import { getUsuarios, crearUsuario, modificarCorreoUsuario, darDeBajaUsuario, restablecerClave, getRoles } from './api';
import './Usuarios.css';

const Usuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [roles, setRoles] = useState([]);
    const [formData, setFormData] = useState({ 
        dni: '', 
        first_name: '', 
        last_name: '', 
        email: '', 
        clave: '', 
        id_rol: '' // Usamos id_rol tal cual lo espera el backend (el grupo queda nulo por ahora)
    });
    const [editId, setEditId] = useState(null);
    const [nuevaClave, setNuevaClave] = useState('');

    useEffect(() => {
        cargarUsuarios();
        cargarRoles();
    }, []);

    const cargarUsuarios = async () => {
        try {
            const response = await getUsuarios();
            setUsuarios(response.data);
        } catch (error) {
            console.error("Error al cargar usuarios", error);
        }
    };

    const cargarRoles = async () => {
        try {
            const response = await getRoles();
            setRoles(response.data);
        } catch (error) {
            console.error("Error al cargar roles", error);
        }
    };

    const handleCrear = async (e) => {
        e.preventDefault();
        try {
            await crearUsuario(formData);
            alert("Usuario creado exitosamente.");
            cargarUsuarios();
            setFormData({ dni: '', first_name: '', last_name: '', email: '', clave: '', id_rol: '' });
        } catch (error) {
            console.error("Detalle del error:", error.response?.data);
            const mensajeError = JSON.stringify(error.response?.data || error.message);
            alert("Error al crear: " + mensajeError);
        }
    };

    const handleModificarCorreo = async (id, nuevoEmail) => {
        try {
            await modificarCorreoUsuario(id, nuevoEmail);
            alert("Correo actualizado.");
            cargarUsuarios();
            setEditId(null);
        } catch (error) {
            console.error("Error al modificar", error);
        }
    };

    const handleBaja = async (id) => {
        if(window.confirm("¿Estás seguro de dar de baja a este usuario?")) {
            try {
                await darDeBajaUsuario(id);
                alert("Usuario dado de baja (inactivo).");
                cargarUsuarios();
            } catch (error) {
                console.error("Error al dar de baja", error);
            }
        }
    };

    const handleRestablecerClave = async (id) => {
        if(!nuevaClave || nuevaClave.length < 8) {
            alert("La clave debe tener al menos 8 caracteres.");
            return;
        }
        try {
            await restablecerClave(id, nuevaClave);
            alert("Clave restablecida. Se envió un correo al usuario.");
            setNuevaClave('');
        } catch (error) {
            console.error("Error al restablecer clave", error);
        }
    };

    return (
        <div className="usuarios-container">
            <h2 className="usuarios-header">Gestión de Usuarios</h2>
            
            <div className="usuarios-card">
                <h3>Alta de Nuevo Usuario</h3>
                <form onSubmit={handleCrear} className="form-alta">
                    <input 
                        className="input-field" 
                        type="number" 
                        placeholder="DNI" 
                        value={formData.dni} 
                        onChange={e => setFormData({...formData, dni: e.target.value})} 
                        required 
                    />
                    <input 
                        className="input-field" 
                        type="text" 
                        placeholder="Nombre" 
                        value={formData.first_name} 
                        onChange={e => setFormData({...formData, first_name: e.target.value})} 
                        required 
                    />
                    <input 
                        className="input-field" 
                        type="text" 
                        placeholder="Apellido" 
                        value={formData.last_name} 
                        onChange={e => setFormData({...formData, last_name: e.target.value})} 
                        required 
                    />
                    <input 
                        className="input-field" 
                        type="email" 
                        placeholder="Correo" 
                        value={formData.email} 
                        onChange={e => setFormData({...formData, email: e.target.value})} 
                        required 
                    />
                    <input 
                        className="input-field" 
                        type="password" 
                        placeholder="Clave Provisoria" 
                        value={formData.clave} 
                        onChange={e => setFormData({...formData, clave: e.target.value})} 
                        required 
                    />
                    
                    {/* Selector de Rol dinámico */}
                    <select 
                        className="input-field" 
                        value={formData.id_rol} 
                        onChange={e => setFormData({...formData, id_rol: e.target.value})} 
                        required
                    >
                        <option value="">Seleccione un Rol...</option>
                        {roles.map(rol => (
                            <option key={rol.idRol || rol.id} value={rol.idRol || rol.id}>
                                {rol.NombreRol || rol.nombre}
                            </option>
                        ))}
                    </select>

                    <button type="submit" className="btn-primary">Registrar Usuario</button>
                </form>
            </div>

            <div className="usuarios-card">
                <h3>Directorio Activo</h3>
                <table className="usuarios-table">
                    <thead>
                        <tr>
                            <th>Usuario</th>
                            <th>Nombre y Apellido</th>
                            <th>Correo</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usuarios.map(user => (
                            <tr key={user.id}>
                                <td>{user.username}</td>
                                <td>{user.first_name} {user.last_name}</td>
                                <td>
                                    {editId === user.id ? (
                                        <input 
                                            className="input-field"
                                            style={{padding: '6px', fontSize: '13px'}}
                                            type="email" 
                                            defaultValue={user.email} 
                                            onBlur={(e) => handleModificarCorreo(user.id, e.target.value)}
                                        />
                                    ) : (
                                        <span onDoubleClick={() => setEditId(user.id)} title="Doble clic para editar" style={{cursor: 'pointer'}}>
                                            {user.email} ✏️
                                        </span>
                                    )}
                                </td>
                                <td>
                                    <span style={{ color: user.is_active ? 'green' : 'red', fontWeight: 'bold' }}>
                                        {user.is_active ? "Activo" : "Inactivo"}
                                    </span>
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <button className="btn-secondary" onClick={() => handleBaja(user.id)} disabled={!user.is_active}>
                                            Dar de Baja
                                        </button>
                                        
                                        <div style={{ display: 'flex', marginTop: '5px' }}>
                                            <input 
                                                className="input-field"
                                                style={{padding: '6px', fontSize: '12px', width: '60%'}}
                                                type="password" 
                                                placeholder="Nueva Clave" 
                                                onChange={(e) => setNuevaClave(e.target.value)} 
                                            />
                                            <button className="btn-accent" onClick={() => handleRestablecerClave(user.id)}>
                                                Reset
                                            </button>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Usuarios;