import { Component } from "react";
import dynamic from "next/dynamic";
import Header from "../components/Contenedores/header";
import Footer from "../components/Contenedores/footer";
import ArmonicasTonalidades from "../components/ListadoArmonicas/armonicasTonalidades";
import Posiciones from "../components/ListadoPosiciones/posiciones";
import Celdas from "../components/CeldasArmonica/celdas";
import ArmonicaActiva from "../components/ArmonicaActiva/ArmonicaActiva";
import ArmonicaDiatonica from "/TeoriaMusical/armonicaDiatonica";
import ArmonicaCromatica  from "/TeoriaMusical/armonicaCromatica";
import * as TeoriaMusical from "/TeoriaMusical/teoriaMusical";
import Tonalidad from "/TeoriaMusical/tonalidad";
import Escala from "/TeoriaMusical/escala";
import Arpegio from "/TeoriaMusical/arpegio";
import Escalas from "../components/ListadoEscalas/escalas";
import ModosGriegos from "../components/ListadoModosGriegos/modosGriegos";
import TiposArpegios from "../components/VisualizacionArpegios/tiposArpegios";
import { ArpegiosActivosContenedorGral, ArpegiosActivosContenedorArmonizacion } from "../components/VisualizacionArpegios/arpegiosActivosContenedor";
import ArpegiosArmonizacion from "../components/VisualizacionArpegios/arpegiosArmonizacion";
import Metronomo from "../components/Metronomo/metronomo";
import { Provider,connect } from 'react-redux';
import store, { trasposeArpegiosActivos } from '../Store/store';
import { addArpegioActivo, removeArpegioActivo } from '../Store/store';
import "bootstrap/dist/css/bootstrap.min.css"; 
const Afinador = dynamic(() => import("../components/Afinador/afinador"), {
  ssr: false,
});
import Microfono from "../components/Afinador/habilitarMicrofono";
import AddIcon from "@mui/icons-material/Add";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import { Container, Row, Col } from "react-bootstrap";
import { Tooltip, Select, MenuItem } from "@mui/material";
import { PolySynth, Synth, now, start } from 'tone';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tonalidadActiva: TeoriaMusical.tonalidadArmonicaActiva,
      tonalidadArmoniaActiva: TeoriaMusical.tonalidadArmonicaActiva,
      armonizacion: TeoriaMusical.tonalidadArmonicaActiva.getArmonizacionEscala(TeoriaMusical.TipoArmonizacion.Mayor),
      armonica: new ArmonicaDiatonica(),
      posiciones: TeoriaMusical.PosicionesArmonica,
      escalas: TeoriaMusical.EscalasDefinidas,
      escalaActiva: null,
      modos: TeoriaMusical.modosGriegos,
      modoActivo: null,
      modoArmonia: TeoriaMusical.TipoArmonizacion.Mayor,
      tiposArpegios: TeoriaMusical.ArpegiosRepo,
      posicionActivaItem: 1,
      armoniaActiva: null,
      tonoArpegioSeleccionado: new Tonalidad(TeoriaMusical.Notas.C),
      tipoArpegioSeleccionado: TeoriaMusical.ArpegiosRepo[0],
      arpegiosActivos: [],
      arpegioReproduciendo: 0,
      nombreArpegioActivo: "",
      notaAfinando: {},
      isClient: false,
    };
  }

  componentDidMount() { 
    this.setState({ isClient: true });   
  }

  reproducirArpegioComoAcorde = (arpegio, instrumentName = 'acoustic_grand_piano', duration = '1n', repeatCount = 4) => {
    //Tone.start();
    const synth = new Tone.PolySynth().toDestination();
    const now = Tone.now();
    var notas = arpegio.getNotas();
    for (let i = 0; i < repeatCount; i++) {
      synth.triggerAttackRelease(arpegio.notas, duration, now + i * Tone.Time(duration).toSeconds());
    } 
  }

   // Function to change the harmonica type
   cambiarArmonica = () => {
    this.setState((prevState) => ({
      armonica: prevState.armonica instanceof ArmonicaDiatonica
        ? new ArmonicaCromatica(3)
        : new ArmonicaDiatonica()
    }));
  };

  cambiarTonalidadActiva = (e) => {
    var nuevaTonalidad = new Tonalidad(TeoriaMusical.Notas[e.target.value]);
    if (this.state.armonica instanceof ArmonicaDiatonica) {
      this.setState({ tonalidadActiva: nuevaTonalidad });      
    }
    this.setState({ armonizacion: nuevaTonalidad.getArmonizacionEscala(this.state.modoArmonia.value) });
  };

  cambiarArmoniaActiva = (e) => {   
    var nuevaTonalidad = new Tonalidad(TeoriaMusical.Notas[e.target.value]);
    this.setState({ tonalidadArmoniaActiva: nuevaTonalidad });
    this.setState({ armonizacion: nuevaTonalidad.getArmonizacionEscala(this.state.modoArmonia.value) });
  };

  trasponerArpegiosActivos = (e) => {
    const { arpegiosActivos } = this.props;
    const { tonalidadActiva } = this.state;
    const tonalidad = new Tonalidad(TeoriaMusical.Notas[e.target.value]);    
    const diferenciaGrados =  tonalidad.tonica.value - tonalidadActiva.tonica.value;  
    const arpegiosTranspuestos = arpegiosActivos.map((arpegioPlain) => {        
      const arpegio = new Arpegio(arpegioPlain.tipo, arpegioPlain.tonica,arpegioPlain.arpegioOriginal);      
      var gradoArpegioTraspuesto = arpegio.arpegioOriginal.tonica.value;    
      var trasponerGrado = gradoArpegioTraspuesto + diferenciaGrados;
      trasponerGrado = trasponerGrado > 12 ? trasponerGrado - 12 : trasponerGrado < 0 ? trasponerGrado + 12 : trasponerGrado;
      const nota = Object.values(TeoriaMusical.Notas).find(nota => nota.value == trasponerGrado)               
      var tonalidadTraspuesta = new Tonalidad(nota);     
      arpegio.trasponerArpegio(tonalidadTraspuesta)        
      return arpegio      
    });      
    if  (arpegiosTranspuestos.length > 0)     
      this.trasposeArpegiosActivos(arpegiosTranspuestos);    
  };

  cambiarModoArmoniaActiva = (e) => {  
    var modoArmonia = Object.values(TeoriaMusical.TipoArmonizacion).filter(function (tipo) { return tipo.value == e.target.value })[0];       
    this.setState({ modoArmonia: modoArmonia });
    this.setState({ armonizacion: this.state.tonalidadArmoniaActiva.getArmonizacionEscala(modoArmonia.value) });  
  };

  cambiarPosicionActiva = (e) =>
    this.setState({ posicionActivaItem: e.target.value });

  cambiarPosicionActivaDesdeTono = (e) =>
    this.setState({
      posicionActivaItem: this.state.tonalidadActiva.getPosicionDeTono(
        e.target.value
      ),
    });

  cambioArmoniaActiva = (e) => {
    this.setState({
      armoniaActiva: this.state.tonalidadActiva
        .getPosicion(this.state.posicionActivaItem)
        .getArmonia(e.target.value.gradosEscala),
    });
    this.setState({
      escalaActiva: e.target.value
    });

  }

  cambioArmoniaActivaModo = (e) => {
    this.setState({ armoniaActiva: e.target.value.getArmonia() });
    this.setState({ modoActivo: e.target.value });
  }


  cambioArmoniaActivaArpegio = (e) => {
    this.setState({ armoniaActiva: e.arpegio });
    this.setState({ nombreArpegioActivo: e.nombre });
  };

  cambioTipoArpegioActivo = (e) => {
    this.setState({
      armoniaActiva: this.state.tonoArpegioSeleccionado.getArmonia(
        e.target.value.gradosArpegio
      ),
    });
    this.setState({ tipoArpegioSeleccionado: e.target.value }); 
  };

  cambiarTonoArpegioSeleccionado = (e) => {
    let tonalidad = new Tonalidad(TeoriaMusical.Notas[e.target.value]);
    this.setState({
        tonoArpegioSeleccionado: tonalidad,
        armoniaActiva: tonalidad.getArmonia(
            this.state.tipoArpegioSeleccionado.gradosArpegio
        )
    });
  }

  //TODO: refactor agregar arpegio activo, integrar interfaz para que funcionen de la misma menera modos, escalas y arpegios

  agregarEscalaActiva = () => {
    const { tonalidadActiva, escalaActiva } = this.state;

    var escala = escalaActiva.obtenerNotas(tonalidadActiva.tonica);

    const arpegio = {
      nombre: tonalidadActiva.tonica.name + " " + escalaActiva.nombre,
      arpegio: escala,
    }
   
    this.agregarArpegioActivo(arpegio);
  };

  agregarModoActivo = () => {
    const { tonalidadActiva, modoActivo } = this.state;

    var modo = modoActivo.getArmonia(tonalidadActiva.tonica);

    const arpegio = {
      nombre: tonalidadActiva.tonica.name + " " + modoActivo.nombre,
      arpegio: modo,
    }
   
    this.agregarArpegioActivo(arpegio);
  };

  armarArpegioParaAgregar = () => {
    const { tipoArpegioSeleccionado, tonoArpegioSeleccionado } = this.state;
    const arpegioNuevo = new Arpegio(
      tipoArpegioSeleccionado,
      TeoriaMusical.Notas[tonoArpegioSeleccionado.tonalidad.I.code]
    );
    this.agregarArpegioActivo(arpegioNuevo);
  }

  agregarArpegioActivo = (arpegio) => {      
    this.props.dispatch(addArpegioActivo(arpegio)); 
  };

  removeUltimoArpegio = () => {          
    this.props.dispatch(removeArpegioActivo()); 
  };  

  trasposeArpegiosActivos = (arpegiosTraspuestos) => {          
    this.props.dispatch(trasposeArpegiosActivos(arpegiosTraspuestos)); 
  };  


  arpegiosActivosReproducirSiguiente = () => {
    const { arpegiosActivos } = this.props;
    const { arpegioReproduciendo } = this.state;
    if (arpegiosActivos.length > 1) {
      let nextArpegioIndex = arpegioReproduciendo >= arpegiosActivos.length - 1 ? 0 : arpegioReproduciendo + 1;
      this.cambioArmoniaActivaArpegio(arpegiosActivos[nextArpegioIndex]);
      this.setState({ arpegioReproduciendo: nextArpegioIndex });
    }
  };

  obtenerNotaAudio = (notaAudio, desafinacion) => {
    let afinacion = 100 - desafinacion;
    this.setState({
      notaAfinando: { nota: notaAudio, desafinacion: afinacion },
    });
    //TODO: aca faltaria setear nota anterior o posterior a la desafinada, para que el renderizado y la afinacion sea mas real
  };
  

  render() {
    return (
      <div className="App">      
        <Header></Header>
        <div className={"filtros"}>          
          <Row>
          {this.state.armonica instanceof ArmonicaDiatonica ? (
            <Col md={3}>
              <div>
                <label>Tonalidad Armónica Diatonica</label>
                <ArmonicasTonalidades
                  tonalidades={TeoriaMusical.TonalidadesArmonia}
                  onChangeValue={this.cambiarTonalidadActiva}
                />
                <Select value={this.state.modoArmonia.value} defaultValue={TeoriaMusical.TipoArmonizacion.Mayor} onChange={this.cambiarModoArmoniaActiva}>
                {Object.values(TeoriaMusical.TipoArmonizacion).map((tipo) => (
                  <MenuItem key={tipo.value} value={tipo.value}>
                    {tipo.name}
                  </MenuItem>
                ))}
              </Select>
              </div>
            </Col>
          ) : (
            <Col md={3}>
              <div>
                <label>Tonalidad Armonia</label>
                <ArmonicasTonalidades
                  tonalidades={TeoriaMusical.TonalidadesArmonia}
                  onChangeValue={this.cambiarArmoniaActiva}
                />
                <Select value={this.state.modoArmonia.value} defaultValue={TeoriaMusical.TipoArmonizacion.Mayor} onChange={this.cambiarModoArmoniaActiva}>
                {Object.values(TeoriaMusical.TipoArmonizacion).map((tipo) => (
                  <MenuItem key={tipo.value} value={tipo.value}>
                    {tipo.name}
                  </MenuItem>
                ))}
              </Select>
              </div>
             
            </Col>
            
          )}        
          {this.state.armonica instanceof ArmonicaDiatonica ? (  
            <Col md={4}>
              <label>Posición</label>
              <Posiciones
                posiciones={this.state.posiciones}
                onChangeValue={this.cambiarPosicionActiva}
                value={this.state.posicionActivaItem}
              ></Posiciones>
              <ArmonicasTonalidades
                tonalidades={TeoriaMusical.TonalidadesArmonia}
                onChangeValue={this.cambiarPosicionActivaDesdeTono}
                value={
                  this.state.tonalidadActiva.getPosicion(
                    this.state.posicionActivaItem
                  ).tonalidad["I"].code
                }
              ></ArmonicasTonalidades>
            </Col>
          ) : ""  }
            <Col md={5}>
              <div>
                <label>Escalas</label>
                <Escalas
                  escalas={this.state.escalas}
                  onChangeValue={this.cambioArmoniaActiva}
                ></Escalas>                 
                <IconButton
                  color="primary"
                  onClick={this.agregarEscalaActiva}
                  style={{ marginLeft: 15 }}
                >
                  <AddIcon />                  
                </IconButton>                    
                <label>Modos</label>
                <ModosGriegos
                  modos={this.state.modos}
                  onChangeValue={this.cambioArmoniaActivaModo}
                ></ModosGriegos>                
                <IconButton
                  color="primary"
                  onClick={this.agregarModoActivo}
                  style={{ marginLeft: 15 }}
                >
                  <AddIcon />                  
                </IconButton>       
              </div>
            </Col>
          </Row>

          <Row>
            <Col md={4}>
              <label>Arpegios</label>
              <ArmonicasTonalidades
                tonalidades={TeoriaMusical.TonalidadesArmonia}
                onChangeValue={this.cambiarTonoArpegioSeleccionado}
              ></ArmonicasTonalidades>
              <TiposArpegios
                tiposArpegios={TeoriaMusical.ArpegiosRepo}
                onChangeValue={this.cambioTipoArpegioActivo}
              ></TiposArpegios>
              <Tooltip title="Agregar a acceso rápido de acordes para reproducción con metrónomo">
                <IconButton
                  color="primary"
                  onClick={this.armarArpegioParaAgregar}
                  style={{ marginLeft: 15 }}
                >
                  <AddIcon />                  
                </IconButton>
              </Tooltip>
              <Tooltip title="Remover último acorde de acceso rápido">
                <DeleteIcon
                  color="primary"
                  onClick={this.removeUltimoArpegio}
                  style={{ marginLeft: 15 }}
                >
                  <AddIcon />                  
                </DeleteIcon>
              </Tooltip>
             
            </Col>
            <Col md={8}>
              <div className={"armoniaActiva"}>
                <label>Intervalos:</label>
                <label style={{ marginRight: 15, marginLeft: 15 }}>
                  {this.state.armoniaActiva
                    ? this.state.armoniaActiva
                        .map((grado) => {
                          return grado.name;
                        })
                        .join(" - ")
                    : ""}
                </label>
                <label>Notas:</label>
                <label style={{ marginRight: 15, marginLeft: 15 }}>
                  {this.state.armoniaActiva
                    ? this.state.armoniaActiva
                        .map((grado) => {
                          return grado.code;
                        })
                        .join(" - ")
                    : ""}
                </label>
                <Tooltip title="Se tomará como referencia C, armar progresion en base a C y luego trasponer">
                <label>*Trasponer Arpegios a:</label>
                <ArmonicasTonalidades
                tonalidades={TeoriaMusical.TonalidadesArmonia}
                onChangeValue={this.trasponerArpegiosActivos}                
              ></ArmonicasTonalidades>
              </Tooltip>
              </div>
            </Col>
          </Row>

          <Row style={{ "justify-content": "center" }}>
            <Col md={10}>
              <div style={{ marginTop: 15 }}>
                <label style={{ marginRight: 15, fontSize: 30 }}>
                  {this.state.nombreArpegioActivo}
                </label>
                {this.state.isClient && (
                <ArpegiosActivosContenedorGral
                  arpegiosActivos={this.props.arpegiosActivos}
                  onArpegioActivoClick={this.cambioArmoniaActivaArpegio}
                />
              )}
              </div>
            </Col>
            <Col md={2}>                       
              <ArmonicaActiva cambiarArmonica={this.cambiarArmonica}></ArmonicaActiva>              
              <Afinador handlerNotaAudio={this.obtenerNotaAudio}></Afinador>
              
            <Metronomo
              cambioArpegio={this.arpegiosActivosReproducirSiguiente}
            ></Metronomo>
          </Col>
           
          </Row>
        </div>

        <Row className={"ArmonicaContenedor"}>          
          <Col md={2}>
            <label
              style={{
                display: "block",
                "font-weight": "bold",
                "font-size": "20px",
              }}
            >
              Armonización
            </label>
            <ArpegiosArmonizacion
              orientation={"vertical"}
              arpegiosActivos={this.state.armonizacion}
              onArpegioActivoClick={this.cambioArmoniaActivaArpegio}
              agregarArpegioActivo={this.agregarArpegioActivo}
            ></ArpegiosArmonizacion>
          </Col>          
          <Col className={"imagenArmonica"} md={8}>
            <Celdas
              tonalidadActiva={this.state.tonalidadActiva}
              armonia={this.state.armoniaActiva}
              armonica={this.state.armonica}
              notaAfinar={this.state.notaAfinando}
            ></Celdas>
          </Col>        
        </Row>

        <Footer></Footer>
        
        

        <style jsx global>{`         

          $primary-color: #de6b62;

          #root{
            overflow: hidden; 
          }
          
          .App {
            text-align: center; 
            background-image: url(./iconos/light-grey-terrazzo.png);  
            /* background-image: url(./iconos/memphis-colorful.png); */
            /* background-image: url(./iconos/light-grey-terrazzo.png);   */
          }
          
          .App-logo {
            height: 40vmin;
            pointer-events: none;
          }
          
          @media (prefers-reduced-motion: no-preference) {
            .App-logo {
              animation: App-logo-spin infinite 20s linear;
            }
          }
          
          .App-header {
            background-color: #282c34;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-size: calc(10px + 2vmin);
            color: white;
          }
          
          .App-link {
            color: #61dafb;
          }
          
          @keyframes App-logo-spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
          
          .combosIzquierda{
            float: left;  
            margin-top: 15px;
          }
          
          .comboEscalas{
            float: left;
            margin-left: 8%;
            margin-top: 15px;
          }
          
          .armoniaActiva{
            float: left;
            margin-top: 15px;
            margin-left: 4%;
          }
          
          .tiposArpegio{
            float: left;
            margin-left: 100px;
            margin-top: 15px;
          }
          
          .textoFiltros{
            font-family: 'Bitter', serif;
            font-size: 20px;
          }
          
          .filtros{
            display: block;
            margin: auto;    
            /* margin-bottom: 0px!important; */
            padding-left: 15px;
            padding-right: 15px;
            margin-top: 15px;
            margin-bottom: 10px;
            width: 95%;    
            background: rgba(255, 153, 153, 0.4);    
            border-radius: 15px;
            height: 175px; 
            color: #413636;
            font-weight: bold;
          }
          
          .ArmonicaContenedor{
            height: 590px; 
          }
          
          .imagenArmonica{
            background-image: url(./iconos/harmonicaBack.png);
            background-position: -4rem 7rem;
            background-size: 90rem; 
            background-attachment: initial;
            background-repeat: no-repeat;  
          }
          
          /* FULL HD */
          #table {  
            display: grid;
            grid-auto-flow: column;
            grid-template-rows: auto auto auto 1fr auto auto auto auto;
            width: 100%;
            margin: auto; 
            padding-left: 10%;
            padding-right: 10%;
          }
          
          /* CELULARES */
          @media only screen and (max-width: 768px) {
            .filtros{
              width: 90% !important;
              height: 300px;  
            }
            .ArmonicaContenedor{
              height: 725px!important;
            }
            .imagenArmonica{
              background:none;
            }
          }
          
          /* NOTEBOOK / LAPTOP */
          @media screen and (min-width: 1200px) and (max-width: 1450px){  
            .ArmonicaContenedor{
              height: 450px!important;
            }
            .imagenArmonica{
              background-position: -3rem 5rem;
              background-size: 64rem;
            }
          }
          
          /* IPAD */
          @media screen and (min-width: 769px) and (max-width: 1200px){  
            .ArmonicaContenedor{
              height: 420px;
            }
            .imagenArmonica{
              background-position: -3rem 4.4rem;
              background-size: 55rem;
            }  
          }
          
          @media screen and (min-width: 1450px) and (max-width: 1800px){   
            .imagenArmonica{
              background-position: -4rem 6.8rem;
              background-size: 80rem;  
            }
          }
          
          
          
          footer {   
            left: 0;
            position: relative;
            right: 0;    
            bottom: 10px;   
            z-index: 10;   
          }
          footer div.social-media-links {
            /* background: #889499; */
            overflow: hidden;
            padding-bottom: 4px;
            text-align: center;
            height: 60px;
          }
          footer div.social-media-links ul {
            margin: 0;
            padding: 0;
          }
          footer div.social-media-links li {
            display: inline;
            margin: 0;
            padding: 0;
          }
          footer div.social-media-links a {
            border-bottom: 0px solid rgba(0, 0, 0, 0.95);
            border-radius: 4px;
            box-shadow: inset 0 -3px 0 0 rgba(0, 0, 0, 0), 0 6px 8px rgba(0, 0, 0, 0), 0 24px 24px rgba(0, 0, 0, 0), 0 36px 36px rgba(0, 0, 0, 0), 0 64px 64px rgba(0, 0, 0, 0), 0 64px 128px rgba(0, 0, 0, 0), 0 120px 0 rgba(0, 0, 0, 0), 0 86px 8px 6px rgba(0, 0, 0, 0);
            display: inline-block;
            height: 30px;
            padding: 20px;
            position: relative;
            -webkit-transition: 0.2s ease-in;
            transition: 0.2s ease-in;
            width: 30px;
            margin:10px
          }
          footer div.social-media-links a svg {
            left: 2px;
            position: absolute;
            top: 7px;
            height: 35px;
            width: 35px;
          }
          footer div.social-media-links a svg.glow path,
          footer div.social-media-links a svg.glow circle {
            fill: rgba(0, 0, 0, 0);
          }
          footer div.social-media-links a svg path,
          footer div.social-media-links a svg circle {
            fill: $primary-color;
            -webkit-transition: 0.2s ease-in;
            transition: 0.2s ease-in;
          }
          footer div.social-media-links a:hover {
            -webkit-transform: translateY(-4px);
                    transform: translateY(-4px);
            box-shadow: inset 0 -3px 0 0 rgba(0, 0, 0, 0.1), 0 6px 8px rgba(0, 0, 0, 0.05), 0 24px 24px rgba(0, 0, 0, 0.05), 0 36px 36px rgba(0, 0, 0, 0.05), 0 64px 64px rgba(0, 0, 0, 0.15), 0 64px 128px rgba(0, 0, 0, 0.15), 0 86px 8px 6px rgba(14, 186, 199, 0.25), 0 83px 4px 0px rgba(14, 186, 199, 0.95);
          }
          footer div.social-media-links a:hover svg.glow {
            filter: url('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg"><f…ter id="filter"><feGaussianBlur stdDeviation="10" /></filter></svg>#filter');
            -webkit-filter: blur(2px);
                    filter: blur(2px);
          }
          footer div.social-media-links a:hover svg.glow path,
          footer div.social-media-links a:hover svg.glow circle {
            fill: rgba(14, 186, 199, 0.6);
          }
          footer div.social-media-links a:hover svg path,
          footer div.social-media-links a:hover svg circle {
            fill: $primary-color;
          }
          
          .developedBy{
            display: flex;
            position: inherit;
            margin-top: 25px;
            margin-left: 25px;
            color: $primary-color;
            opacity: 0.5;
          }
          
          `}</style>
         
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  arpegiosActivos: state.main.arpegiosActivos,
});

const ConnectedApp = connect(mapStateToProps)(App);

const Main = () => (
  <Provider store={store}>
    <ConnectedApp />
  </Provider>
);

export default Main;
