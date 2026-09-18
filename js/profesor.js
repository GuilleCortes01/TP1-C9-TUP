// Funcionalidades JS del panel de profesor (Solicitudes, Inicio, Chat, Publicar oferta, Editar perfil).
// Cada bloque valida que sus elementos existan antes de engancharse, asi este mismo
// archivo se puede incluir en cualquier pagina de profesor/ sin romper nada.

function mostrarToast(mensaje, tipo = "success") {
  let contenedor = document.getElementById("miprofeToasts");
  if (!contenedor) {
    contenedor = document.createElement("div");
    contenedor.id = "miprofeToasts";
    contenedor.className = "toast-container position-fixed bottom-0 end-0 p-3";
    contenedor.style.zIndex = "1080";
    document.body.appendChild(contenedor);
  }

  const toastEl = document.createElement("div");
  toastEl.className = `toast align-items-center text-bg-${tipo} border-0`;
  toastEl.setAttribute("role", "alert");
  toastEl.setAttribute("aria-live", "assertive");
  toastEl.setAttribute("aria-atomic", "true");
  toastEl.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${mensaje}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Cerrar"></button>
    </div>
  `;
  contenedor.appendChild(toastEl);

  const toast = new bootstrap.Toast(toastEl, { delay: 3500 });
  toast.show();
  toastEl.addEventListener("hidden.bs.toast", () => toastEl.remove());
}

function mostrarCargando() {
  let overlay = document.getElementById("overlayCargando");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "overlayCargando";
    overlay.className = "overlay-cargando d-none";
    overlay.innerHTML = `
      <div class="loader">
        <span class="loader-text">Cargando</span>
        <span class="load"></span>
      </div>
    `;
    document.body.appendChild(overlay);
  }
  overlay.classList.remove("d-none");
}

function ocultarCargando() {
  document.getElementById("overlayCargando")?.classList.add("d-none");
}

function activarValidacion(form, mensajeExito, { reset = false } = {}) {
  if (!form) return;

  form.setAttribute("novalidate", "");
  form.addEventListener("submit", (evento) => {
    evento.preventDefault();

    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }

    mostrarToast(mensajeExito, "success");

    if (reset) {
      form.reset();
      form.classList.remove("was-validated");
    }
  });
}

function slugify(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-");
}

function iniciales(nombre) {
  return nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((palabra) => palabra[0].toUpperCase())
    .join("");
}

// ---------- Cuentas simuladas con localStorage (compartido con principal.js/alumno.js) ----------
const CLAVE_CUENTAS = "miprofe_cuentas";
const CLAVE_SESION = "miprofe_sesion";

function obtenerCuentaActual() {
  const sesion = JSON.parse(localStorage.getItem(CLAVE_SESION) || "null");
  if (!sesion) return null;
  const cuentas = JSON.parse(localStorage.getItem(CLAVE_CUENTAS) || "[]");
  return cuentas.find((c) => c.email === sesion.email) || null;
}

function guardarCuentaActual(cuentaActualizada) {
  const cuentas = JSON.parse(localStorage.getItem(CLAVE_CUENTAS) || "[]");
  const indice = cuentas.findIndex((c) => c.email === cuentaActualizada.email);
  if (indice === -1) return;

  cuentas[indice] = cuentaActualizada;
  localStorage.setItem(CLAVE_CUENTAS, JSON.stringify(cuentas));
  localStorage.setItem(
    CLAVE_SESION,
    JSON.stringify({ nombre: cuentaActualizada.nombre, email: cuentaActualizada.email, rol: cuentaActualizada.rol })
  );
}

function leerDatosFormulario(form) {
  const datos = {};
  const formData = new FormData(form);
  new Set(formData.keys()).forEach((campo) => {
    if (form.querySelector(`[name="${campo}"]`)?.type === "file") return;
    const valores = formData.getAll(campo);
    datos[campo] = valores.length > 1 ? valores : valores[0];
  });
  return datos;
}

function precargarFormulario(form, datos) {
  if (!datos) return;
  Object.entries(datos).forEach(([nombre, valor]) => {
    if (valor === undefined) return;
    const valores = Array.isArray(valor) ? valor : [valor];
    form.querySelectorAll(`[name="${nombre}"]`).forEach((campo) => {
      if (campo.type === "checkbox" || campo.type === "radio") {
        campo.checked = valores.includes(campo.value);
      } else {
        campo.value = valor;
      }
    });
  });
}

// ---------- Solicitudes.html: aceptar / rechazar ----------

const seccionSolicitudes = document.getElementById("solicitudes");
if (seccionSolicitudes) {
  const CLAVE_RESUELTAS = "miprofe_profesor_solicitudes_resueltas";
  const CLAVE_PENDIENTES = "miprofe_profesor_solicitudes_pendientes";
  const CLAVE_SOLICITUDES_COMPARTIDAS = "miprofe_solicitudes_compartidas";
  const contenedorSolicitudes = seccionSolicitudes.querySelector(".d-flex");

  const resueltas = JSON.parse(localStorage.getItem(CLAVE_RESUELTAS) || "[]");

  const actualizarPendientes = () => {
    const restantes = seccionSolicitudes.querySelectorAll(".card").length;
    localStorage.setItem(CLAVE_PENDIENTES, String(restantes));
  };

  const engancharAcciones = (card, id, nombre, { compartida = false } = {}) => {
    card.querySelectorAll('button[name="accion"]').forEach((boton) => {
      boton.addEventListener("click", (evento) => {
        evento.preventDefault();
        const accion = boton.value; // "aceptar" | "rechazar"

        if (compartida) {
          // Es una solicitud real enviada por un alumno: se saca de la lista compartida.
          const compartidas = JSON.parse(localStorage.getItem(CLAVE_SOLICITUDES_COMPARTIDAS) || "[]");
          localStorage.setItem(
            CLAVE_SOLICITUDES_COMPARTIDAS,
            JSON.stringify(compartidas.filter((s) => s.id !== id))
          );
        } else {
          resueltas.push(id);
          localStorage.setItem(CLAVE_RESUELTAS, JSON.stringify(resueltas));
        }

        card.classList.add("solicitud-resuelta");
        card.addEventListener(
          "transitionend",
          () => {
            card.remove();
            actualizarPendientes();
          },
          { once: true }
        );

        mostrarToast(
          accion === "aceptar"
            ? `Aceptaste la solicitud de ${nombre}.`
            : `Rechazaste la solicitud de ${nombre}.`,
          accion === "aceptar" ? "success" : "danger"
        );
      });
    });
  };

  // Solicitudes de ejemplo, ya escritas a mano en el HTML.
  seccionSolicitudes.querySelectorAll(".card").forEach((card) => {
    const nombre = card.querySelector(".card-title").textContent.trim();
    const id = slugify(nombre);

    if (resueltas.includes(id)) {
      card.remove();
      return;
    }

    engancharAcciones(card, id, nombre);
  });

  // Solicitudes reales que un alumno mando desde perfilProfesor.html (ver alumno.js).
  // localStorage es por navegador (no por pagina), asi que si se registro/solicito
  // desde este mismo navegador, aparece aca para aceptar o rechazar.
  if (contenedorSolicitudes) {
    const compartidas = JSON.parse(localStorage.getItem(CLAVE_SOLICITUDES_COMPARTIDAS) || "[]");

    compartidas.forEach((solicitud) => {
      const card = document.createElement("article");
      card.className = "card";
      card.innerHTML = `
        <div class="card-body d-flex align-items-center flex-wrap gap-3">
          <div class="avatar avatar--chico flex-shrink-0" aria-hidden="true">${iniciales(solicitud.alumno)}</div>
          <div class="solicitud-info flex-grow-1">
            <h3 class="card-title">${solicitud.alumno}</h3>
            <p><strong>Materia:</strong> ${solicitud.materia}</p>
            <p><strong>Horario propuesto:</strong> ${solicitud.horario}</p>
          </div>
          <form action="#" method="post" class="d-flex gap-2">
            <button type="submit" name="accion" value="aceptar" class="btn btn-success">Aceptar</button>
            <button type="submit" name="accion" value="rechazar" class="btn btn-danger">Rechazar</button>
          </form>
        </div>
      `;
      contenedorSolicitudes.appendChild(card);
      engancharAcciones(card, solicitud.id, solicitud.alumno, { compartida: true });
    });
  }

  actualizarPendientes();
}

// ---------- PrincipalProfesor.html: contador de solicitudes pendientes ----------
document.querySelectorAll("#resumen .card").forEach((card) => {
  const titulo = card.querySelector(".card-title");
  if (!titulo || titulo.textContent.trim() !== "Solicitudes nuevas") return;

  const pendientesGuardadas = localStorage.getItem("miprofe_profesor_solicitudes_pendientes");
  const numero = card.querySelector(".stat-numero");
  if (pendientesGuardadas !== null && numero) {
    numero.textContent = pendientesGuardadas;
  }
});

// ---------- Chat.html: cambiar de conversacion y enviar mensajes ----------
const listaConversaciones = document.querySelectorAll("#conversaciones [data-conversacion]");
const mensajesContenedor = document.getElementById("mensajes");

if (listaConversaciones.length && mensajesContenedor) {
  const avatarActivo = document.getElementById("chatAvatarActivo");
  const nombreActivo = document.getElementById("chatNombreActivo");
  const formMensaje = document.getElementById("formMensaje");
  const inputMensaje = document.getElementById("mensaje");

  const conversaciones = {
    martina: {
      mensajes: [
        { propio: false, autor: "Martina", texto: "Hola profe, ¿confirmamos la clase del miércoles?" },
        { propio: true, autor: "Vos", texto: "Sí, nos vemos a las 18hs." },
      ],
    },
    "grupo-matematica": { mensajes: [] },
    bruno: { mensajes: [] },
  };

  let conversacionActiva = "martina";

  const crearMensajeEl = ({ propio, autor, texto }) => {
    const li = document.createElement("li");
    li.className = `mensaje ${propio ? "mensaje-propio" : "mensaje-otro"}`;

    const spanAutor = document.createElement("span");
    spanAutor.className = "mensaje-autor";
    spanAutor.textContent = autor;

    li.appendChild(spanAutor);
    li.append(` ${texto}`);
    return li;
  };

  const pintarConversacion = (id) => {
    mensajesContenedor.innerHTML = "";
    const { mensajes } = conversaciones[id];

    if (mensajes.length === 0) {
      const vacio = document.createElement("li");
      vacio.className = "mensaje-vacio text-muted";
      vacio.textContent = "Todavía no hay mensajes en esta conversación.";
      mensajesContenedor.appendChild(vacio);
    } else {
      mensajes.forEach((mensaje) => mensajesContenedor.appendChild(crearMensajeEl(mensaje)));
    }

    mensajesContenedor.scrollTop = mensajesContenedor.scrollHeight;
  };

  listaConversaciones.forEach((item) => {
    item.addEventListener("click", (evento) => {
      evento.preventDefault();
      const id = item.dataset.conversacion;
      if (id === conversacionActiva) return;

      listaConversaciones.forEach((otro) => otro.classList.remove("active"));
      item.classList.add("active");

      if (avatarActivo) avatarActivo.textContent = item.dataset.iniciales;
      if (nombreActivo) nombreActivo.textContent = item.dataset.nombre;

      conversacionActiva = id;
      pintarConversacion(id);
    });
  });

  if (formMensaje && inputMensaje) {
    formMensaje.addEventListener("submit", (evento) => {
      evento.preventDefault();
      const texto = inputMensaje.value.trim();
      if (!texto) return;

      const nuevoMensaje = { propio: true, autor: "Vos", texto };
      const eraConversacionVacia = conversaciones[conversacionActiva].mensajes.length === 0;
      conversaciones[conversacionActiva].mensajes.push(nuevoMensaje);

      if (eraConversacionVacia) {
        mensajesContenedor.innerHTML = "";
      }
      mensajesContenedor.appendChild(crearMensajeEl(nuevoMensaje));
      mensajesContenedor.scrollTop = mensajesContenedor.scrollHeight;

      inputMensaje.value = "";
      inputMensaje.focus();
    });
  }
}

// ---------- PrincipalProfesor.html: mostrar el nombre y los datos del profesor logueado ----------
const seccionPerfilProfesor = document.getElementById("perfil");
if (seccionPerfilProfesor && seccionPerfilProfesor.querySelector(".perfil-info")) {
  const cuenta = obtenerCuentaActual();

  if (cuenta) {
    const titulo = seccionPerfilProfesor.querySelector(".card-title");
    const avatar = seccionPerfilProfesor.querySelector(".avatar");
    if (titulo) titulo.textContent = cuenta.nombre;
    if (avatar) avatar.textContent = iniciales(cuenta.nombre);

    const perfil = cuenta.perfil || {};
    const NIVELES = { primario: "Primario", secundario: "Secundario", universitario: "Universitario", adultos: "Adultos" };
    const MODALIDADES = { virtual: "Virtual", presencial: "Presencial" };

    const actualizarDato = (etiqueta, valor) => {
      if (!valor) return;
      const li = Array.from(seccionPerfilProfesor.querySelectorAll(".perfil-datos li")).find(
        (el) => el.querySelector("strong")?.textContent.trim().replace(":", "").toLowerCase() === etiqueta.toLowerCase()
      );
      if (!li) return;
      const strong = li.querySelector("strong");
      li.textContent = "";
      li.appendChild(strong);
      li.append(` ${valor}`);
    };

    const badge = seccionPerfilProfesor.querySelector(".badge");
    if (badge && perfil.materia) badge.textContent = perfil.materia;

    actualizarDato("Nivel", NIVELES[perfil.nivel] || perfil.nivel);
    actualizarDato("Ubicación", perfil.ubicacion);
    actualizarDato("Precio", perfil.precio ? `$${Number(perfil.precio).toLocaleString("es-AR")}/hora` : "");

    const modalidades = (Array.isArray(perfil.modalidad) ? perfil.modalidad : [perfil.modalidad]).filter(Boolean);
    if (modalidades.length) {
      actualizarDato("Modalidad", modalidades.map((m) => MODALIDADES[m] || m).join(" y "));
    }
  }
}

// ---------- PublicarOferta.html: validacion + confirmacion ----------
activarValidacion(document.querySelector("#publicar-oferta form"), "Oferta publicada correctamente.", { reset: true });

// ---------- EditarPerfil.html: precargar con los datos guardados y guardar los cambios ----------
const formEditarPerfilProfesor = document.querySelector("#editar-perfil form");
if (formEditarPerfilProfesor) {
  const cuenta = obtenerCuentaActual();

  if (cuenta) {
    precargarFormulario(formEditarPerfilProfesor, { nombre: cuenta.nombre, ...cuenta.perfil });
  }

  activarValidacion(formEditarPerfilProfesor, "Perfil actualizado correctamente.");

  formEditarPerfilProfesor.addEventListener("submit", () => {
    if (!cuenta || !formEditarPerfilProfesor.checkValidity()) return;

    const { nombre, ...perfil } = leerDatosFormulario(formEditarPerfilProfesor);
    guardarCuentaActual({ ...cuenta, nombre: nombre || cuenta.nombre, perfil });
  });
}

// ---------- EditarPerfil.html: preview de foto de perfil ----------
const inputFoto = document.getElementById("foto");
const avatarPreview = document.getElementById("avatarPreview");
if (inputFoto && avatarPreview) {
  inputFoto.addEventListener("change", (evento) => {
    const archivo = evento.target.files[0];
    if (!archivo) return;

    const lector = new FileReader();
    lector.onload = () => {
      avatarPreview.innerHTML = `<img src="${lector.result}" alt="">`;
    };
    lector.readAsDataURL(archivo);
  });
}
