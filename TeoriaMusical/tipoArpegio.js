export default class TipoArpegio {
    constructor(gradosArpegio, tipoArpegio, nombre, codigo) {
       this.gradosArpegio = gradosArpegio;
       this.tipoArpegio = tipoArpegio;
       this.nombre = nombre;
       this.codigo = codigo;
    }
    get getGradosArpegio() {
       return this.gradosArpegio;
    }
 };
 