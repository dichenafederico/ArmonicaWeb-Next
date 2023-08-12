import { Component } from "react";
import dynamic from "next/dynamic";
import Header from "../components/Contenedores/header";
import Footer from "../components/Contenedores/footer";
import ArmonicasTonalidades from "../components/ListadoArmonicas/armonicasTonalidades";
import Posiciones from "../components/ListadoPosiciones/posiciones";
import Celdas from "../components/CeldasArmonica/celdas";
import { ArmonicaActiva } from "../TeoriaMusical/armonicaDiatonica";
import * as TeoriaMusical from "../TeoriaMusical/teoriaMusical";
import Tonalidad from "../TeoriaMusical/tonalidad";
import Arpegio from "../TeoriaMusical/arpegio";
import Escalas from "../components/ListadoEscalas/escalas";
import ModosGriegos from "../components/ListadoModosGriegos/modosGriegos";
import TiposArpegios from "../components/VisualizacionArpegios/tiposArpegios";
import ArpegiosActivosContenedor from "../components/VisualizacionArpegios/arpegiosActivosContenedor";
import Metronomo from "../components/Metronomo/metronomo";
// const Metronomo = dynamic(() => import("../components/Metronomo/metronomo"), {
//   ssr: false,
// });
// import Afinador  from "../components/Afinador/afinador";
const Afinador = dynamic(() => import("../components/Afinador/afinador"), {
  ssr: false,
});
import Microfono from "../components/Afinador/habilitarMicrofono";
import AddIcon from "@mui/icons-material/Add";
import IconButton from "@mui/material/IconButton";
import { Container, Row, Col } from "react-bootstrap";
import { Tooltip } from "@mui/material";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tonalidadActiva: TeoriaMusical.tonalidadArmonicaActiva,
      armonizacion: TeoriaMusical.tonalidadArmonicaActiva.getArmonizacionEscala(),
      armonica: ArmonicaActiva,
      posiciones: TeoriaMusical.PosicionesArmonica,
      escalas: TeoriaMusical.EscalasDefinidas,
      modos: TeoriaMusical.modosGriegos,
      tiposArpegios: TeoriaMusical.ArpegiosRepo,
      posicionActivaItem: 1,
      armoniaActiva: null,
      tonoArpegioSeleccionado: new Tonalidad(TeoriaMusical.Notas.C),
      tipoArpegioSeleccionado: TeoriaMusical.ArpegiosRepo[0],
      arpegiosActivos: [],
      arpegioReproduciendo: 0,
      nombreArpegioActivo: "",
      notaAfinando: {},
    };
  }

  componentDidMount() {
    console.log(TeoriaMusical.tonalidadArmonicaActiva.tonalidad);
  }

  cambiarTonalidadActiva = (e) => {
    var nuevaTonalidad = new Tonalidad(TeoriaMusical.Notas[e.target.value]);
    this.setState({ tonalidadActiva: nuevaTonalidad });
    this.setState({ armonizacion: nuevaTonalidad.getArmonizacionEscala() });
  };

  cambiarPosicionActiva = (e) =>
    this.setState({ posicionActivaItem: e.target.value });

  cambiarPosicionActivaDesdeTono = (e) =>
    this.setState({
      posicionActivaItem: this.state.tonalidadActiva.getPosicionDeTono(
        e.target.value
      ),
    });

  cambioArmoniaActiva = (e) =>
    this.setState({
      armoniaActiva: this.state.tonalidadActiva
        .getPosicion(this.state.posicionActivaItem)
        .getArmonia(e.target.value),
    });

  cambioArmoniaActivaModo = (e) =>
    this.setState({ armoniaActiva: e.target.value.getArmonia() });

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

  cambiarTonoArpegioSeleccionado = (e) =>
    this.setState({
      tonoArpegioSeleccionado: new Tonalidad(
        TeoriaMusical.Notas[e.target.value]
      ),
    });

  agregarArpegioActivo = () => {
    var nuevoArpegio = new Arpegio(
      this.state.tipoArpegioSeleccionado,
      TeoriaMusical.Notas[this.state.tonoArpegioSeleccionado.tonalidad.I.code]
    );
    this.state.arpegiosActivos.push(nuevoArpegio);
    this.setState({ arpegiosActivos: this.state.arpegiosActivos });
  };

  arpegiosActivosReproducirSiguiente = () => {
    if (this.state.arpegiosActivos.length > 1) {
      let arpegioReproduciendo =
        this.state.arpegioReproduciendo == this.state.arpegiosActivos.length
          ? 0
          : this.state.arpegioReproduciendo;
      this.cambioArmoniaActivaArpegio(
        this.state.arpegiosActivos[arpegioReproduciendo]
      );
      this.setState({ arpegioReproduciendo: arpegioReproduciendo + 1 });
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
          {/* <div className={"combosIzquierda"}> */}
          <Row>
            <Col md={3}>
              <div>
                <label>Tonalidad</label>
                <ArmonicasTonalidades
                  tonalidades={TeoriaMusical.TonalidadesArmonia}
                  onChangeValue={this.cambiarTonalidadActiva}
                ></ArmonicasTonalidades>
              </div>
            </Col>
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
            <Col md={5}>
              <div>
                <label>Escalas</label>
                <Escalas
                  escalas={this.state.escalas}
                  onChangeValue={this.cambioArmoniaActiva}
                ></Escalas>
                <label>Modos</label>
                <ModosGriegos
                  modos={this.state.modos}
                  onChangeValue={this.cambioArmoniaActivaModo}
                ></ModosGriegos>
              </div>
            </Col>
          </Row>

          <Row>
            <Col md={5}>
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
                  onClick={this.agregarArpegioActivo}
                  style={{ marginLeft: 15 }}
                >
                  <AddIcon />
                </IconButton>
              </Tooltip>
              {/* </div> */}
            </Col>
            <Col>
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
              </div>
            </Col>
          </Row>

          <Row style={{ "justify-content": "center" }}>
            <Col md={11}>
              <div style={{ marginTop: 15 }}>
                <label style={{ marginRight: 15, fontSize: 30 }}>
                  {this.state.nombreArpegioActivo}
                </label>
                <ArpegiosActivosContenedor
                  arpegiosActivos={this.state.arpegiosActivos}
                  onArpegioActivoClick={this.cambioArmoniaActivaArpegio}
                ></ArpegiosActivosContenedor>
              </div>
            </Col>
            <Col md={1}>
              <Afinador handlerNotaAudio={this.obtenerNotaAudio}></Afinador>
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
            <ArpegiosActivosContenedor
              orientation={"vertical"}
              arpegiosActivos={this.state.armonizacion}
              onArpegioActivoClick={this.cambioArmoniaActivaArpegio}
            ></ArpegiosActivosContenedor>
          </Col>          
          <Col className={"imagenArmonica"} md={8}>
            <Celdas
              tonalidadActiva={this.state.tonalidadActiva}
              armonia={this.state.armoniaActiva}
              armonica={this.state.armonica}
              notaAfinar={this.state.notaAfinando}
            ></Celdas>
          </Col>         
          <Col md={2}>
            <Metronomo
              cambioArpegio={this.arpegiosActivosReproducirSiguiente}
            ></Metronomo>
          </Col>
        </Row>

        <Footer></Footer>

        <style jsx>{`
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
          `}</style>

      </div>
    );
  }
}

export default App;
