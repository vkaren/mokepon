const sectionSeleccionJuego = document.getElementById("seleccion-juego");
sectionSeleccionJuego.classList.add("visible");
document.getElementById("offline").addEventListener("click", elegirTipoDeJuego);
document.getElementById("online").addEventListener("click", elegirTipoDeJuego);

const sectionSeleccionMascota = document.getElementById("seleccion-mascota");
const opcionesMascotas = document.getElementById("opciones-mascotas");

const sectionMapa = document.getElementById("mapa-jugadores");
const canvas = document.getElementById("mapa");
const mapa = canvas.getContext("2d");
const cajaDeMensajes = document.getElementById("caja-de-mensajes");
cajaDeMensajes.style.display = "none";

const sectionCombate = document.getElementById("combate");
const barraVidaJugador = document.getElementById("barra-vida-jugador");
const barraVidaEnemigo = document.getElementById("barra-vida-enemigo");
const spanVictoriasJugador = document.getElementById("victorias-jugador");
const spanVictoriasEnemigo = document.getElementById("victorias-enemigo");
const botonesAtaques = document.getElementById("botones-ataques");
const mensajeText = document.getElementById("mensajes");
const botonReiniciar = document.getElementById("boton-reiniciar");
botonReiniciar.addEventListener("click", reiniciar);

let opcionDeJuego = "";
let mascotaJugador;
let mascotaEnemiga;
let jugadorId = "";
let enemigoId = "";
let jugadoresOnline = [];
const posicionFija = { x: 7, y: 66 };
let interval;

class Mokepon {
  constructor(
    nombre,
    tipo,
    imagen,
    imagenEnMapa,
    posicionEnMapa,
    ataques,
    ataquesDisponibles
  ) {
    this.id = "";
    this.nombre = nombre;
    this.tipo = tipo;
    this.imagen = imagen;
    this.enMapa = {
      imagen: imagenEnMapa,
      size: { ancho: 40, alto: 20 },
      posicion: posicionEnMapa,
      velocidad: { x: 0, y: 0 },
    };
    this.ataques = ataques;
    this.ataquesDisponibles = ataquesDisponibles;
    this.ataqueActual;
    this.vidas = 100; //porcentaje barra de vidas
    this.victorias = 0;
    this.enemigo = {};
    this.ataque = function ataque(ataque) {
      if (!this.ataqueActual) {
        this.ataqueActual = {};
      }
      this.ataqueActual.nombre = this.ataques[ataque].nombre;
      this.ataqueActual.valor = this.ataques[ataque].valor;
      this.ataqueActual.img = this.ataques[ataque].img;

      let fnEjecutarLuego;
  ///!!!!!!!!!!!!!!!
      if (opcionDeJuego === "offline") {
        fnEjecutarLuego = () => this.enemigo.ataqueAleatorio();
      } else {
        fnEjecutarLuego = () => {
          enviarAtaque(this.ataqueActual);
          botonesEsperandoAtaqueEnemigo();
          interval = setInterval(obtenerAtaqueEnemigo, 50);
        };
      }

      animacionAtaque(
        "jugador",
        this.ataqueActual.img,
        this.ataqueActual.nombre,
        fnEjecutarLuego
      );
    };
    this.ataqueAleatorio = function ataqueAleatorio() {
      let ataquesDisponibles = Object.values(this.ataques).filter(
        (ataques) => ataques.cantidad > 0
      );

      if (!this.ataqueActual) {
        this.ataqueActual = {};
      }

      if (ataquesDisponibles.length > 0) {
        let ataqueAleatorio = aleatorio(ataquesDisponibles);

        ataqueAleatorio.cantidad--;

        this.ataqueActual.nombre = ataqueAleatorio.nombre;
        this.ataqueActual.valor = ataqueAleatorio.valor;
        this.ataqueActual.img = ataqueAleatorio.img;

        animacionAtaque(
          "enemigo",
          this.ataqueActual.img,
          this.ataqueActual.nombre,
          combate
        );
      } else {
        this.ataqueActual.nombre = "";
        this.ataqueActual.valor = 0;
        combate();
      }
    };
    this.pintar = function pintar() {
      const imagen = new Image();
      imagen.src = this.enMapa.imagen;

      mapa.drawImage(
        imagen,
        this.enMapa.posicion.x,
        this.enMapa.posicion.y,
        this.enMapa.size.ancho,
        this.enMapa.size.alto
      );
    };
  }
}

const hipodoge = new Mokepon(
  "hipodoge",
  "agua",
  "./img/mokepons_mokepon_hipodoge_attack.png",
  "./img/hipodoge.png",
  { x: 98, y: 41 },
  {
    agua: {
      nombre: "agua",
      cantidad: 3,
      valor: 25,
      img: "https://img.icons8.com/arcade/64/null/water.png",
      id: "boton-agua",
    },
    fuego: {
      nombre: "fuego",
      cantidad: 1,
      valor: 12.5,
      img: "https://img.icons8.com/arcade/64/null/fire-element.png",
      id: "boton-fuego",
    },
    tierra: {
      nombre: "tierra",
      cantidad: 1,
      valor: 12.5,
      img: "https://img.icons8.com/arcade/64/null/sprout.png",
      id: "boton-tierra",
    },
  },
  5
);
const capipepo = new Mokepon(
  "capipepo",
  "tierra",
  "./img/mokepons_mokepon_capipepo_attack.png",
  "./img/capipepo.png",
  { x: 31, y: 24 },
  {
    tierra: {
      nombre: "tierra",
      cantidad: 3,
      valor: 25,
      img: "https://img.icons8.com/arcade/64/null/sprout.png",
      id: "boton-tierra",
    },
    fuego: {
      nombre: "fuego",
      cantidad: 1,
      valor: 12.5,
      img: "https://img.icons8.com/arcade/64/null/fire-element.png",
      id: "boton-fuego",
    },
    agua: {
      nombre: "agua",
      cantidad: 1,
      valor: 12.5,
      img: "https://img.icons8.com/arcade/64/null/water.png",
      id: "boton-agua",
    },
  },
  5
);
const ratigueya = new Mokepon(
  "ratigueya",
  "fuego",
  "./img/mokepons_mokepon_ratigueya_attack.png",
  "./img/ratigueya.png",
  { x: 224, y: 107 },
  {
    fuego: {
      nombre: "fuego",
      cantidad: 3,
      valor: 25,
      img: "https://img.icons8.com/arcade/64/null/fire-element.png",
      id: "boton-fuego",
    },
    agua: {
      nombre: "agua",
      cantidad: 1,
      valor: 12.5,
      img: "https://img.icons8.com/arcade/64/null/water.png",
      id: "boton-agua",
    },
    tierra: {
      nombre: "tierra",
      cantidad: 1,
      valor: 12.5,
      img: "https://img.icons8.com/arcade/64/null/sprout.png",
      id: "boton-tierra",
    },
  },
  5
);
const pydos = new Mokepon(
  "pydos",
  "agua",
  "./img/mokepons_mokepon_pydos_attack.png",
  "./img/pydos.png",
  { x: 51, y: 110 },
  {
    agua: {
      nombre: "agua",
      cantidad: 4,
      valor: 20,
      img: "https://img.icons8.com/arcade/64/null/water.png",
      id: "boton-agua",
    },
    fuego: {
      nombre: "fuego",
      cantidad: 1,
      valor: 10,
      img: "https://img.icons8.com/arcade/64/null/fire-element.png",
      id: "boton-fuego",
    },
    tierra: {
      nombre: "tierra",
      cantidad: 1,
      valor: 10,
      img: "https://img.icons8.com/arcade/64/null/sprout.png",
      id: "boton-tierra",
    },
  },
  6
);
const tucapalma = new Mokepon(
  "tucapalma",
  "tierra",
  "./img/mokepons_mokepon_tucapalma_attack.png",
  "./img/tucapalma.png",
  { x: 190, y: 20 },
  {
    tierra: {
      nombre: "tierra",
      cantidad: 4,
      valor: 20,
      img: "https://img.icons8.com/arcade/64/null/sprout.png",
      id: "boton-tierra",
    },
    fuego: {
      nombre: "fuego",
      cantidad: 1,
      valor: 10,
      img: "https://img.icons8.com/arcade/64/null/fire-element.png",
      id: "boton-fuego",
    },
    agua: {
      nombre: "agua",
      cantidad: 1,
      valor: 10,
      img: "https://img.icons8.com/arcade/64/null/water.png",
      id: "boton-agua",
    },
  },
  6
);
const langostelvis = new Mokepon(
  "langostelvis",
  "fuego",
  "./img/mokepons_mokepon_langostelvis_attack.png",
  "./img/langostelvis.png",
  { x: 249, y: 71 },
  {
    fuego: {
      nombre: "fuego",
      cantidad: 4,
      valor: 20,
      img: "https://img.icons8.com/arcade/64/null/fire-element.png",
      id: "boton-fuego",
    },
    agua: {
      nombre: "agua",
      cantidad: 1,
      valor: 10,
      img: "https://img.icons8.com/arcade/64/null/water.png",
      id: "boton-agua",
    },
    tierra: {
      nombre: "tierra",
      cantidad: 1,
      valor: 10,
      img: "https://img.icons8.com/arcade/64/null/sprout.png",
      id: "boton-tierra",
    },
  },
  6
);

const mascotas = {
  hipodoge,
  capipepo,
  ratigueya,
  langostelvis,
  pydos,
  tucapalma,
};

function opcionesMascotasLoad() {
  document
    .getElementById("volver-al-inicio")
    .addEventListener("click", volverAlInicio);
  document
    .getElementById("boton-seleccionar")
    .addEventListener("click", seleccionandoMascota);

  Object.values(mascotas).forEach((mascota) => {
    let html = `
     <input type="radio" name="mascota" id=${mascota.nombre} />
     <label for=${mascota.nombre} class=${mascota.tipo}>
       <p>${mascota.nombre[0].toUpperCase() + mascota.nombre.substring(1)}</p>
       <img
         src=${mascota.imagen}
         alt=${mascota.nombre} />
     </label>
     `;

    opcionesMascotas.innerHTML += html;
  });

  inputsEvent();
}
function inputsEvent() {
  const inputsMascotas = document.getElementsByTagName("input");

  Object.values(inputsMascotas).forEach((input) => {
    input.addEventListener("change", seleccionandoMascota);
    input.autocomplete = "off";
  });
}
function volverAlInicio() {
  sectionSeleccionMascota.classList.remove("visible");
  sectionSeleccionJuego.classList.add("visible");
}
function sectionMapaLoad() {
  sectionMapa.classList.add("visible");
  document
    .getElementById("elegir-mascota")
    .addEventListener("click", elegirOtraMascota);
  botonesMovimientosEvent();
  window.addEventListener("keydown", moverMascota);
  window.addEventListener("keyup", detenerMovimiento);
  interval = setInterval(pintarCanvas, 50);
}
function elegirOtraMascota() {
  clearInterval(interval);
  sectionMapa.classList.remove("visible");
  sectionSeleccionMascota.classList.add("visible");
}
function botonesMovimientosEvent() {
  const botones = document.getElementsByClassName("boton-movimiento");

  Object.values(botones).forEach((boton) => {
    boton.addEventListener("mousedown", moverMascota);
    boton.addEventListener("mouseup", detenerMovimiento);
    boton.addEventListener("touchstart", moverMascota);
    boton.addEventListener("touchend", detenerMovimiento);
  });
}
function botonesAtaquesLoad(mascotaJugador) {
  Object.values(mascotaJugador.ataques).forEach((ataque) => {
    let cantidadBotones = ataque.cantidad;
    let html = `
    <button class=${ataque.id}>
    <img src=${ataque.img} alt=${ataque.nombre}/>
    </button>
    `;

    while (cantidadBotones > 0) {
      botonesAtaques.innerHTML += html;
      cantidadBotones--;
    }
  });

  botonesAtaquesEvent();
}
function botonesAtaquesEvent() {
  Object.values(botonesAtaques.children).forEach((botonAtaque) => {
    botonAtaque.addEventListener("click", (event) => {
      let ataque = event.currentTarget.className.split("-")[1];

      botonAtaque.disabled = true;
      botonAtaque.classList.add("ataque-usado");
      mascotaJugador.ataques[ataque].cantidad--;
      mascotaJugador.ataque(ataque);
    });
  });
}
function animacionAtaque(ataqueDe, imagen, nombre, fnEjecutarLuego) {
  let ataqueAnimacion;
  let ataqueImg;

  if (ataqueDe === "jugador") {
    ataqueAnimacion = document.getElementById("ataque-jugador-animacion");
    ataqueImg = document.getElementById("ataque-jugador");
  } else {
    ataqueAnimacion = document.getElementById("ataque-enemigo-animacion");
    ataqueImg = document.getElementById("ataque-enemigo");
  }

  ataqueImg.src = imagen;
  ataqueImg.alt = nombre;
  ataqueAnimacion.classList.add("visible");

  //ejecutar luego de la animacion
  setTimeout(() => {
    ataqueAnimacion.classList.remove("visible");
    fnEjecutarLuego();
  }, 1000);
}
function botonesEsperandoAtaqueEnemigo() {
  Object.values(botonesAtaques.children).forEach((boton) => {
    if (!Object.values(boton.classList).includes("ataque-usado")) {
      boton.disabled = true;
      boton.classList.add("esperando-ataque-enemigo");
    }
  });
}
function botonesAtaqueEnemigoObtenido() {
  Object.values(botonesAtaques.children).forEach((boton) => {
    if (Object.values(boton.classList).includes("esperando-ataque-enemigo")) {
      boton.disabled = false;
      boton.classList.remove("esperando-ataque-enemigo");
    }
  });
}

function elegirTipoDeJuego(event) {
  sectionSeleccionJuego.classList.remove("visible");
  opcionDeJuego = event.currentTarget.id;

  if (opcionDeJuego === "online") {
    jugarOnline();
  } else {
    sectionSeleccionMascota.classList.add("visible");
    if (opcionesMascotas.innerHTML.length === 0) {
      opcionesMascotasLoad();
    }
  }
}

function jugarOnline() {
  fetch("http://localhost:8080/unirse").then((res) => {
    if (res.ok) {
      res.text().then((id) => {
        jugadorId = id;
        sectionSeleccionJuego.classList.remove("visible");
        sectionSeleccionMascota.classList.add("visible");
        if (opcionesMascotas.innerHTML.length === 0) {
          opcionesMascotasLoad();
        }
        alCerrarORefrescarPagina();
      });
    }
  });
}

function seleccionandoMascota(event) {
  if (event.currentTarget.id !== "boton-seleccionar") {
    let mascotaSeleccionada = event.currentTarget.id;
    mascotaJugador = copiaProfundaObjeto(mascotas[mascotaSeleccionada]);
  } else {
    if (mascotaJugador) {
      seleccionarMascota(mascotaJugador);
    }
  }
}

function seleccionarMascota(mascotaJugador) {
  sectionSeleccionMascota.classList.remove("visible");

  mascotaJugador.id = jugadorId;
  mascotaJugador.enMapa.posicion.x = posicionFija.x;
  mascotaJugador.enMapa.posicion.y = posicionFija.y;
////!!!!!!!!!
  if (opcionDeJuego === "online") {
    seleccionarMokeponBackend();
  }

  sectionMapaLoad();
}

function seleccionarMokeponBackend() {
  fetch(`http:localhost:8080/mokepon/${jugadorId}`, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      mokepon: mascotaJugador.nombre,
    }),
  });
}

function moverMascota(event) {
  let direccion = event.currentTarget.id || event.key;

  switch (direccion) {
    case "arriba":
    case "ArrowUp":
      mascotaJugador.enMapa.velocidad.y -= 5;
      break;
    case "abajo":
    case "ArrowDown":
      mascotaJugador.enMapa.velocidad.y += 5;
      break;
    case "derecha":
    case "ArrowRight":
      mascotaJugador.enMapa.velocidad.x += 5;
      break;
    case "izquierda":
    case "ArrowLeft":
      mascotaJugador.enMapa.velocidad.x -= 5;
      break;
  }
}

function detenerMovimiento() {
  mascotaJugador.enMapa.velocidad.x = 0;
  mascotaJugador.enMapa.velocidad.y = 0;
}

function pintarCanvas() {
  mapa.clearRect(0, 0, canvas.width, canvas.height);

  mascotaJugador.enMapa.posicion.x += mascotaJugador.enMapa.velocidad.x;
  mascotaJugador.enMapa.posicion.y += mascotaJugador.enMapa.velocidad.y;

  mascotaJugador.pintar(
    mascotaJugador.enMapa.posicion.x,
    mascotaJugador.enMapa.posicion.y
  );
////!!!!!!!!
  if (opcionDeJuego === "offline") {
    pintarMascotasOffline();
    if (
      mascotaJugador.enMapa.velocidad.x !== 0 ||
      mascotaJugador.enMapa.velocidad.y !== 0
    ) {
      Object.values(mascotas).forEach((enemigo) => revisarColision(enemigo));
    }
  } else {
    enviarPosicion(
      mascotaJugador.enMapa.posicion.x,
      mascotaJugador.enMapa.posicion.y
    );

    jugadoresOnline.forEach((mascotaOnline) => {
      mascotaOnline.pintar();
      revisarColision(mascotaOnline);
    });
  }
}

function pintarMascotasOffline() {
  Object.values(mascotas).forEach((mascota) => mascota.pintar());
}

function enviarPosicion(x, y) {
  fetch(`http:localhost:8080/mokepon/${jugadorId}/posicion`, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      x,
      y,
    }),
  }).then((res) => {
    if (res.ok) {
      res.json().then(({ jugadoresEnMapa }) => {
        jugadoresOnline = jugadoresEnMapa.map((jugador) => {
          let mascotaJugadorOnline;

          Object.values(mascotas).forEach((mascota) => {
            const jugadorMascota = jugador.mokepon.nombre || "";

            if (jugadorMascota === mascota.nombre) {
              mascotaJugadorOnline = copiaProfundaObjeto(mascota);

              mascotaJugadorOnline.id = jugador.id;
              mascotaJugadorOnline.enMapa.posicion.x = jugador.x;
              mascotaJugadorOnline.enMapa.posicion.y = jugador.y;
            }
          });

          return mascotaJugadorOnline;
        });
      });
    }
  });
}

function revisarColision(enemigo) {
  const arribaEnemigo = enemigo.enMapa.posicion.y;
  const abajoEnemigo = enemigo.enMapa.posicion.y + enemigo.enMapa.size.alto;
  const derechaEnemigo = enemigo.enMapa.posicion.x + enemigo.enMapa.size.ancho;
  const izquierdaEnemigo = enemigo.enMapa.posicion.x;

  const arribaMascota = mascotaJugador.enMapa.posicion.y;
  const abajoMascota =
    mascotaJugador.enMapa.posicion.y + mascotaJugador.enMapa.size.alto;
  const derechaMascota =
    mascotaJugador.enMapa.posicion.x + mascotaJugador.enMapa.size.ancho;
  const izquierdaMascota = mascotaJugador.enMapa.posicion.x;

  if (
    abajoMascota > arribaEnemigo &&
    arribaMascota < abajoEnemigo &&
    derechaMascota > izquierdaEnemigo &&
    izquierdaMascota < derechaEnemigo &&
    (izquierdaMascota !== posicionFija.x || arribaMascota !== posicionFija.y) &&
    (izquierdaMascota > posicionFija.x + enemigo.enMapa.size.ancho ||
      arribaMascota < posicionFija.y - enemigo.enMapa.size.alto ||
      izquierdaMascota < posicionFija.x -  enemigo.enMapa.size.ancho ||
      arribaMascota > posicionFija.y +  enemigo.enMapa.size.alto)
  ) {
    detenerMovimiento();
    clearInterval(interval); //intervalo de pintar canvas
////!!!!!!!!
    if (opcionDeJuego === "offline") {
      seleccionarMascotaEnemigo(enemigo);
    } else {
      enColision(enemigo);
    }
  }
}

//preguntar si esta en combate
function enColision(enemigo) {
  fetch(`http:localhost:8080/mokepon/${enemigo.id}/colision`).then((res) => {
    if (res.ok) {
      res.text().then((respuesta) => {
        if (respuesta === "EN COMBATE") {
          mostrarMensaje("Esta en combate :S");
          interval = setInterval(pintarCanvas, 50);
        } else {
          seleccionarMascotaEnemigo(enemigo);
        }
      });
    }
  });
}

function mostrarMensaje(mensaje) {
  cajaDeMensajes.style.display = "block";
  const botonQuitarMsj = document.getElementById("quitar-mensaje");
  const msj = document.getElementById("mensaje");

  msj.innerText = mensaje;
  botonQuitarMsj.addEventListener(
    "click",
    () => (cajaDeMensajes.style.display = "none")
  );
}

function seleccionarMascotaEnemigo(enemigo) {
  sectionMapa.classList.remove("visible");
  const mascotaEnemigaImg = document.getElementById("mascota-enemigo-img");
  const mascotaJugadorImg = document.getElementById("mascota-jugador-img");

  mascotaEnemiga = copiaProfundaObjeto(enemigo);

  mascotaJugadorImg.src = mascotaJugador.imagen;
  mascotaJugadorImg.alt = mascotaJugador.nombre;
  mascotaEnemigaImg.src = mascotaEnemiga.imagen;
  mascotaEnemigaImg.alt = mascotaEnemiga.nombre;

  mascotaJugador.enemigo = mascotaEnemiga;
  mascotaEnemiga.enemigo = mascotaJugador;
//////!!!!!
  if (opcionDeJuego === "online") {
    enemigoId = mascotaEnemiga.id;
  }

  sectionCombate.classList.add("visible");
  botonesAtaquesLoad(mascotaJugador);
}

//enviando ataques en juego online
function enviarAtaque(ataque) {
  fetch(`http:localhost:8080/mokepon/${jugadorId}/ataque`, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ataque,
    }),
  });
}

let ataqueIdAnterior = "";
function obtenerAtaqueEnemigo() {
  fetch(`http:localhost:8080/mokepon/${enemigoId}/ataque`).then((res) => {
    if (res.ok) {
      res.json().then(({ ataque }) => {
        if (!mascotaEnemiga.ataqueActual) {
          mascotaEnemiga.ataqueActual = {};
        }

        if (ataque.id && ataqueIdAnterior.length === 0) {
          ataqueIdAnterior = "primerAtaque";
        }

        if (
          ataque.id !== undefined &&
          ataque.id !== ataqueIdAnterior &&
          ataqueIdAnterior.length > 0
        ) {
          clearInterval(interval); //intervalo de obtenerAtaqueEnemigo
          mascotaEnemiga.ataqueActual.nombre = ataque.nombre;
          mascotaEnemiga.ataqueActual.valor = ataque.valor;
          mascotaEnemiga.ataqueActual.img = ataque.img;
          ataqueIdAnterior = ataque.id;

          animacionAtaque(
            "enemigo",
            mascotaEnemiga.ataqueActual.img,
            mascotaEnemiga.ataqueActual.nombre,
            () => {
              combate();
              botonesAtaqueEnemigoObtenido();
            }
          );
        }
      });
    }
  });
}

function combate() {
  let ataqueJugador = mascotaJugador.ataqueActual.nombre;
  let ataqueEnemigo = mascotaEnemiga.ataqueActual.nombre;
  let valorAtaqueJugador = mascotaJugador.ataqueActual.valor;
  let valorAtaqueEnemigo = mascotaEnemiga.ataqueActual.valor;

  if (
    (ataqueJugador === "fuego" && ataqueEnemigo === "tierra") ||
    (ataqueJugador === "agua" && ataqueEnemigo === "fuego") ||
    (ataqueJugador === "tierra" && ataqueEnemigo === "agua") ||
    ataqueEnemigo === ""
  ) {
    mascotaJugador.victorias++;
    mascotaEnemiga.vidas -= valorAtaqueJugador;
  } else if (ataqueJugador !== ataqueEnemigo) {
    mascotaEnemiga.victorias++;
    mascotaJugador.vidas -= valorAtaqueEnemigo;
  }

  mascotaJugador.ataquesDisponibles--;
  mascotaEnemiga.ataquesDisponibles--;

  revisarAtaquesDisponibles();
}

function revisarAtaquesDisponibles() {
  let victoriasJugador = mascotaJugador.victorias;
  let victoriasEnemigo = mascotaEnemiga.victorias;
  let vidasJugador = mascotaJugador.vidas;
  let vidasEnemigo = mascotaEnemiga.vidas;
  let ataquesDisponiblesJugador = mascotaJugador.ataquesDisponibles;
  let ataquesDisponiblesEnemigo = mascotaEnemiga.ataquesDisponibles;

  spanVictoriasJugador.innerText = victoriasJugador;
  spanVictoriasEnemigo.innerText = victoriasEnemigo;
  barraVidaJugador.style = `--bg-length: ${vidasJugador}%`;
  barraVidaEnemigo.style = `--bg-length: ${vidasEnemigo}%`;

  if (ataquesDisponiblesJugador <= 0 && ataquesDisponiblesEnemigo <= 0) {
    if (victoriasJugador === victoriasEnemigo) {
      mensajeFinal("EMPATE :S");
    } else if (victoriasJugador > victoriasEnemigo) {
      mensajeFinal("GANASTE!!!!!");
    } else {
      mensajeFinal("PERDISTE T-T");
    }
  } else if (ataquesDisponiblesJugador === 0 && ataquesDisponiblesEnemigo > 0) {
    mascotaJugador.ataqueActual.nombre = "";
    mascotaJugador.ataqueActual.valor = 0;
/////////!!!!!!!!!!!!!!
    if (opcionDeJuego === "offline") {
      mascotaEnemiga.ataqueAleatorio();
    } else {
      enviarAtaque(mascotaJugador.ataqueActual);
      interval = setInterval(obtenerAtaqueEnemigo, 50);
    }
  }
}

function mensajeFinal(resultadoFinal) {
  mensajeText.innerText = resultadoFinal;
  mensajeText.classList.add("visible");
  botonReiniciar.style.display = "block";
}

function terminoElJuego() {
  fetch(`http://localhost:8080/mokepon/${jugadorId}/combate-terminado`, {
    method: "post",
  });
}

function reiniciar() {
  mascotaJugador = copiaProfundaObjeto(mascotas[mascotaJugador.nombre]);
////!!!!!!!!!!!!
  if (opcionDeJuego === "online") {
    terminoElJuego();
    mascotaJugador.id = jugadorId;
  }

  mascotaJugador.enMapa.posicion.x = posicionFija.x;
  mascotaJugador.enMapa.posicion.y = posicionFija.y;

  mascotaEnemiga = {};

  barraVidaJugador.style = `--bg-length: ${100}%`;
  barraVidaEnemigo.style = `--bg-length: ${100}%`;
  spanVictoriasJugador.innerText = "0";
  spanVictoriasEnemigo.innerText = "0";
  botonesAtaques.innerHTML = "";
  mensajeText.innerText = "";
  mensajeText.classList.remove("visible");
  botonReiniciar.style.display = "none";

  sectionCombate.classList.remove("visible");
  sectionMapa.classList.add("visible");
  interval = setInterval(pintarCanvas, 50);
}

function alCerrarORefrescarPagina() {
  window.addEventListener("beforeunload", () => cerrarSesion(jugadorId));

  const reloading = window.sessionStorage.getItem("jugadorId");
  if (reloading) {
    cerrarSesion(reloading);
    window.sessionStorage.removeItem("jugadorId");
    window.sessionStorage.setItem("jugadorId", jugadorId);
  } else {
    window.sessionStorage.setItem("jugadorId", jugadorId);
  }
}

function cerrarSesion(jugador) {
  clearInterval(interval);
  fetch(`http://localhost:8080/mokepon/${jugador}/cerrar-pagina`, {
    method: "post",
    keepalive: true,
  });
}

function aleatorio(datos) {
  let datosKeys = Object.keys(datos);
  let numeroAleatorio = Math.floor(
    Math.random() * (datos.length - 1 - 0 + 1) + 0
  );
  return datos[datosKeys[numeroAleatorio]];
}

function copiaProfundaObjeto(object) {
  let copy = {};
  for (let key in object) {
    if (object[key] !== null && typeof object[key] === "object") {
      copy[key] = copiaProfundaObjeto(object[key]);
    } else {
      copy[key] = object[key];
    }
  }
  return copy;
}
