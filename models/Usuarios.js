const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

class Usuario {

    // Buscar usuario por email
    static async findByEmail(email) {
        try {
            const [rows] = await pool.execute(
                `SELECT * 
                 FROM usuarios 
                 WHERE email = ? AND activo = TRUE`,
                [email]
            );
            return rows[0];
        } catch (error) {
            console.error('Error en findByEmail:', error);
            throw error;
        }
    }

    // Buscar usuario por ID
    static async findById(id) {
        try {
            const [rows] = await pool.execute(
                `SELECT * 
                 FROM usuarios 
                 WHERE id_usuario = ? AND activo = TRUE`,
                [id]
            );
            return rows[0];
        } catch (error) {
            console.error('Error en findById:', error);
            throw error;
        }
    }

    // Crear usuario nuevo
    static async create(usuarioData) {
        try {
            const { email, password, tipo_usuario } = usuarioData;

            const saltRounds = 10;
            const password_hash = await bcrypt.hash(password, saltRounds);

            const [result] = await pool.execute(
                `INSERT INTO usuarios (email, password_hash, tipo_usuario)
                 VALUES (?, ?, ?)`,
                [
                    email,
                    password_hash,
                    tipo_usuario || 'cliente'
                ]
            );

            return result.insertId;
        } catch (error) {
            console.error('Error en create:', error);
            throw error;
        }
    }

    // Comparar contraseña
    static async comparePassword(plainPassword, hashedPassword) {
        try {
            return await bcrypt.compare(plainPassword, hashedPassword);
        } catch (error) {
            console.error('Error en comparePassword:', error);
            return false;
        }
    }

    // Actualizar último acceso
    static async updateLastLogin(id) {
        try {
            await pool.execute(
                `UPDATE usuarios 
                 SET ultimo_acceso = CURRENT_TIMESTAMP
                 WHERE id_usuario = ?`,
                [id]
            );
        } catch (error) {
            console.error('Error en updateLastLogin:', error);
            throw error;
        }
    }
}

module.exports = Usuario;
