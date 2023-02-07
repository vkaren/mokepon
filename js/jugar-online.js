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

  function terminoElJuego() {
    fetch(`http://localhost:8080/mokepon/${jugadorId}/combate-terminado`, {
      method: "post",
    });
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