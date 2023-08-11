import Head from 'next/head';
import styles from '../public/styles/Home.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1 className={styles.title}>
          Welcome to <a href="https://nextjs.org">Next.js!</a>
        </h1>

        <p className={styles.description}>
          Get started by editing <code>pages/index.js</code>
        </p>

        <div className={styles.grid}>
          <a href="https://nextjs.org/docs" className={styles.card}>
            <h3>Documentation &rarr;</h3>
            <p>Find in-depth information about Next.js features and API.</p>
          </a>

          <a href="https://nextjs.org/learn" className={styles.card}>
            <h3>Learn &rarr;</h3>
            <p>Learn about Next.js in an interactive course with quizzes!</p>
          </a>

          <a
            href="https://github.com/vercel/next.js/tree/master/examples"
            className={styles.card}
          >
            <h3>Examples &rarr;</h3>
            <p>Discover and deploy boilerplate example Next.js projects.</p>
          </a>

          <a
            href="https://vercel.com/import?filter=next.js&utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            className={styles.card}
          >
            <h3>Deploy &rarr;</h3>
            <p>
              Instantly deploy your Next.js site to a public URL with Vercel.
            </p>
          </a>
        </div>
      </main>

      <footer>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <img src="/vercel.svg" alt="Vercel" className={styles.logo} />
        </a>
      </footer>

      <style jsx>{`    

        main {
          padding: 5rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        footer {
          width: 100%;
          height: 100px;
          border-top: 1px solid #eaeaea;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        footer img {
          margin-left: 0.5rem;
        }
        footer a {
          display: flex;
          justify-content: center;
          align-items: center;
          text-decoration: none;
          color: inherit;
        }
        code {
          background: #fafafa;
          border-radius: 5px;
          padding: 0.75rem;
          font-size: 1.1rem;
          font-family: Menlo, Monaco, Lucida Console, Liberation Mono,
            DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace;
        }
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
      `}</style>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
        }
        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  )
}
