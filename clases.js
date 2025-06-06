
export class ProductoAgricola {
    constructor(id, nombre) {
        this.id = id || Date.now();
        this.nombre = nombre;
    }

   
    obtenerDescripcion() {
        return `Producto: ${this.nombre}`;
    }

    
    static fromJSON(data) {
        console.warn("fromJSON en ProductoAgricola debe ser implementado por la clase derivada.");
        return new ProductoAgricola(data.id, data.nombre);
    }
}


export class Cultivo extends ProductoAgricola {
    constructor(id, usuarioId, tipo, nombre, hectareas, ubicacion, fechaRegistro) {
        
        super(id, nombre);

       
        this.usuarioId = usuarioId;
        this.tipo = tipo;
        this.hectareas = hectareas;
        this.ubicacion = ubicacion;
        this.fechaRegistro = fechaRegistro;
    }

    
    obtenerDescripcion() {
        return `Cultivo de ${this.nombre} (${this.tipo}) en ${this.hectareas} hectáreas en ${this.ubicacion}.`;
    }

   
    static fromJSON(data) {
        return new Cultivo(
            data.id,
            data.usuarioId,
            data.tipo,
            data.nombre,
            data.hectareas,
            data.ubicacion,
            data.fechaRegistro
        );
    }
}

export class Usuario {
    #password; 

    constructor(id, username, password) {
        this.id = id || Date.now();
        this.username = username;
        this.#password = password;
    }

    getPassword() {
        return this.#password;
    }

    setPassword(newPassword) {
        if (newPassword && newPassword.length >= 6) {
            this.#password = newPassword;
        } else {
            console.warn("Contraseña inválida. Debe tener al menos 6 caracteres.");
        }
    }

    validarCredenciales(password) {
        return this.#password === password;
    }

    static fromJSON(data) {
        return new Usuario(data.id, data.username, data.password);
    }

    toJSON() {
        return {
            id: this.id,
            username: this.username,
            password: this.#password
        };
    }
}

export class RegistroHumedad {
    constructor(id, cultivoId, fecha, humedad, observacion) {
        this.id = id || Date.now();
        this.cultivoId = cultivoId;
        this.fecha = fecha;
        this.humedad = humedad;
        this.observacion = observacion;
    }

    static fromJSON(data) {
        return new RegistroHumedad(
            data.id,
            data.cultivoId,
            data.fecha,
            data.humedad,
            data.observacion
        );
    }
}