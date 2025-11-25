const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const { testConnection } = require('./config/database');

// Importar rutas
const clientesRoutes = require('./routes/clientes');
const productosRoutes = require('./routes/productos');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar Helmet con CSP más permisivo para desarrollo
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
    crossOriginEmbedderPolicy: false
}));

// Middleware
//app.use(cors());
//app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Ruta básica - ahora sirve el HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check (mantener para API)
app.get('/health', async (req, res) => {
    const dbStatus = await testConnection();
    
    res.status(dbStatus ? 200 : 503).json({
        success: dbStatus,
        message: dbStatus ? '✅ Servicio funcionando correctamente' : '❌ Error en la base de datos',
        database: dbStatus ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString()
    });
});

// Rutas de la API
app.use('/api/clientes', clientesRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/auth', authRoutes);

// Manejo de rutas no encontradas
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
    });
});

// Manejo de errores global
app.use((error, req, res, next) => {
    console.error('Error del servidor:', error);
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong!'
    });
});

// Iniciar servidor
const startServer = async () => {
    try {
        // Probar conexión a la base de datos
        await testConnection();
        
        app.listen(PORT, () => {
            console.log(` Servidor ECOMARKET FUNCIONANDO ${PORT}`);
            console.log(` Ambiente: ${process.env.NODE_ENV}`);
            console.log(` URL: http://localhost:${PORT}`);
            console.log(` Frontend disponible en: http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ No se pudo iniciar el servidor:', error.message);
        process.exit(1);
    }
};

startServer();

module.exports = app;