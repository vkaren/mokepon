// framework para node js importamos esto
const express = require("express");
// framework especialmente diseñada para trabajar con express
// lo instalamos para que deje de salir los errores de cors
const cors = require("cors");
// creamos una app
const app = express();

app.use(cors());
// recibir peticiones tipo post que reciban json
app.use(express.json());

const jugadores = [];

class Jugador {
  constructor(id) {
    this.id = id;
    this.enCombate = null;
    this.mokepon = null;
  }
  asignarMokepon(mokepon) {
    this.mokepon = mokepon;
  }
  actualizarPosicion(x, y) {
    this.x = x;
    this.y = y;
  }
  asignarAtaque(ataque) {
    this.ataque = ataque;
  }
  combate(enCombate) {
    this.enCombate = enCombate;
  }
}

class Mokepon {
  constructor(nombre) {
    this.nombre = nombre;
  }
}

app.get("/unirse", (req, res) => {
  const id = Math.random() + "";

  const jugador = new Jugador(id);
  jugadores.push(jugador);

  res.send(id);
});

app.post("/mokepon/:jugadorId", (req, res) => {
  const jugadorId = req.params.jugadorId || "";
  const nombre = req.body.mokepon || "";
  const mokepon = new Mokepon(nombre);

  const jugadorIndex = jugadores.findIndex(
    (jugador) => jugadorId === jugador.id
  );

  if (jugadorIndex >= 0) {
    jugadores[jugadorIndex].asignarMokepon(mokepon);
  }

  res.end();
});

app.post("/mokepon/:jugadorId/posicion", (req, res) => {
  const jugadorId = req.params.jugadorId || "";
  const x = req.body.x || 0;
  const y = req.body.y || 0;

  const jugadorIndex = jugadores.findIndex(
    (jugador) => jugadorId === jugador.id
  );

  if (jugadorIndex >= 0) {
    jugadores[jugadorIndex].actualizarPosicion(x, y);
  }

  const jugadoresEnMapa = jugadores.filter(
    (jugador) => jugadorId !== jugador.id && jugador.mokepon 
  );

  res.send({ jugadoresEnMapa });
});

app.get("/mokepon/:enemigoId/colision", (req, res) => {
  const enemigoId = req.params.enemigoId || "";

  const enemigo = jugadores.find(
    (enemigoJugador) => enemigoJugador.id === enemigoId
  );

  if (enemigo.enCombate) {
    res.send("EN COMBATE");
  } else {
    enemigo.combate(true);
    res.send("puede jugar");
  }
});

app.post("/mokepon/:jugadorId/ataque", (req, res) => {
  const jugadorId = req.params.jugadorId || "";
  const ataque = req.body.ataque || {};
  const ataqueId = Math.random() + "";

  const jugadorIndex = jugadores.findIndex(
    (jugador) => jugadorId === jugador.id
  );

  if (jugadorIndex >= 0) {
    ataque.id = ataqueId;
    jugadores[jugadorIndex].asignarAtaque(ataque);
  }
  res.end();
});

app.get("/mokepon/:enemigoId/ataque", (req, res) => {
  const enemigoId = req.params.enemigoId || "";

  const enemigo = jugadores.find((jugador) => enemigoId === jugador.id);

  res.send({ ataque: enemigo.ataque || {} });
});

app.post("/mokepon/:jugadorId/combate-terminado", (req, res) => {
  const jugadorId = req.params.jugadorId || "";

  const jugador = jugadores.find((jugador) => jugador.id === jugadorId);

  jugador.ataque = ''
  jugador.combate(false);
  res.end();
});

app.post("/mokepon/:jugadorId/cerrar-pagina", (req, res) => {
  const jugadorId = req.params.jugadorId || "";

  const jugador = jugadores.findIndex((jugador) => jugador.id === jugadorId);

  if (jugador >= 0) {
    jugadores.splice(jugador, 1);
  }

  res.end();
});

// escuchar constantemente la app
app.listen(8080, () => {
  console.log("ando funcionando");
});
