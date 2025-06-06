
const express = require('express');
const cors = require('cors');
const fs = require('fs').promises; 
const path = require('path'); 

const app = express();
const PORT = 3000; 


app.use(cors()); 
app.use(express.json()); 


const usuariosJsonPath = path.join(__dirname, '../dat/usuarios.json');
const cultivosRegistradosJsonPath = path.join(__dirname, '../dat/cultivos_registrados.json');
const medicionesJsonPath = path.join(__dirname, '../dat/mediciones.json');
const cultivosTiposJsonPath = path.join(__dirname, '../dat/cultivos.json'); 

async function readJsonFile(filePath) {
    try {
        const fileContent = await fs.readFile(filePath, 'utf8');
        return JSON.parse(fileContent);
    } catch (error) {
        if (error.code === 'ENOENT') { 
            console.warn(`Archivo no encontrado: ${filePath}. Creando con un array vacío.`);
            await fs.writeFile(filePath, '[]', 'utf8'); 
            return [];
        }
        console.error(`Error al leer el archivo ${filePath}:`, error);
        throw error;
    }
}

async function writeJsonFile(filePath, data) {
    try {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error(`Error al escribir en el archivo ${filePath}:`, error);
        throw error;
    }
}


app.get('/api/data', async (req, res) => {
    try {
        const [
            usuarios,
            cultivosRegistrados,
            mediciones,
            cultivosTipos
        ] = await Promise.all([
            readJsonFile(usuariosJsonPath),
            readJsonFile(cultivosRegistradosJsonPath),
            readJsonFile(medicionesJsonPath),
            readJsonFile(cultivosTiposJsonPath)
        ]);

        res.json({
            usuarios,
            cultivos_registrados: cultivosRegistrados,
            mediciones,
            tipos_cultivos: cultivosTipos
        });
    } catch (error) {
        console.error('Error al obtener todos los datos:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener datos.' });
    }
});


app.get('/api/usuarios', async (req, res) => {
    try {
        const usuarios = await readJsonFile(usuariosJsonPath);
        res.json(usuarios);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener usuarios.' });
    }
});



app.post('/api/usuarios/registrar', async (req, res) => {
    const newUser = req.body;
    if (!newUser || !newUser.username || !newUser.password) {
        return res.status(400).json({ message: 'Faltan datos de usuario (username o password).' });
    }

    try {
        const usuarios = await readJsonFile(usuariosJsonPath);
        if (usuarios.find(u => u.username === newUser.username)) {
            return res.status(409).json({ message: 'El nombre de usuario ya existe.' });
        }
        

        newUser.id = Date.now(); 
        usuarios.push(newUser);
        await writeJsonFile(usuariosJsonPath, usuarios);
        
        res.status(201).json({ message: 'Usuario registrado exitosamente.', user: newUser });
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        res.status(500).json({ message: 'Error interno del servidor al registrar el usuario.' });
    }
});



app.post('/api/cultivos_registrados', async (req, res) => {
    const nuevoCultivo = req.body; 

    if (!nuevoCultivo || !nuevoCultivo.usuarioId || !nuevoCultivo.tipo || !nuevoCultivo.nombre) {
        return res.status(400).json({ message: 'Faltan datos en el nuevo cultivo.' });
    }

    try {
        const cultivosRegistrados = await readJsonFile(cultivosRegistradosJsonPath);
        

        if (!nuevoCultivo.id) {
            nuevoCultivo.id = Date.now(); 
        }
        
        cultivosRegistrados.push(nuevoCultivo);
        await writeJsonFile(cultivosRegistradosJsonPath, cultivosRegistrados);
        
        res.status(201).json({ message: 'Cultivo registrado exitosamente.', cultivo: nuevoCultivo });
    } catch (error) {
        console.error('Error al registrar cultivo:', error);
        res.status(500).json({ message: 'Error interno del servidor al registrar el cultivo.' });
    }
});


app.post('/api/mediciones', async (req, res) => {
    const nuevoRegistroHumedad = req.body;

    if (!nuevoRegistroHumedad || !nuevoRegistroHumedad.cultivoId || !nuevoRegistroHumedad.humedad) { 
        return res.status(400).json({ message: 'Faltan datos en el registro de humedad (cultivoId o humedad).' });
    }

    try {
        const mediciones = await readJsonFile(medicionesJsonPath);
        mediciones.push(nuevoRegistroHumedad);
        await writeJsonFile(medicionesJsonPath, mediciones);
        
        res.status(201).json({ message: 'Registro de humedad exitoso.', registro: nuevoRegistroHumedad });
    } catch (error) {
        console.error('Error al registrar humedad:', error);
        res.status(500).json({ message: 'Error interno del servidor al registrar la humedad.' });
    }
});



app.listen(PORT, () => {
    console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
    console.log('Esperando peticiones...');
 
});