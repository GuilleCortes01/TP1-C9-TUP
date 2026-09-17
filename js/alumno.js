// Funcionalidades JS del panel de alumno (Inicio, Perfil del profesor, Chat de grupo, Editar perfil).
// Mismo criterio que profesor.js: cada bloque valida que sus elementos existan antes de
// engancharse, asi este archivo se puede incluir en cualquier pagina de alumno/ sin romper nada.

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

function normalizar(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

function slugify(texto) {
  return normalizar(texto).replace(/[^a-z0-9]+/g, "-");
}

// ---------- principalAlumno.html: filtro de busqueda de profesores ----------
const formFiltros = document.querySelector("#filtros form");
if (formFiltros) {
  const cards = document.querySelectorAll("#cercanos .profesor-card, #recomendados .profesor-card");
  const resultadoFiltro = document.getElementById("resultadoFiltro");
  const total = cards.length;

  const textoDeCampo = (card, prefijo) => {
    const parrafo = Array.from(card.querySelectorAll(".card-text")).find((p) =>
      normalizar(p.textContent).startsWith(normalizar(prefijo))
    );
    return parrafo ? normalizar(parrafo.textContent) : "";
  };

  formFiltros.addEventListener("submit", (evento) => {
    evento.preventDefault();

    const materia = normalizar(document.getElementById("materia").value);
    const modalidad = normalizar(document.getElementById("modalidad").value);
    const precioMax = Number(document.getElementById("precio").value) || null;

    let visibles = 0;

    cards.forEach((card) => {
      const materiaCard = normalizar(card.querySelector(".badge")?.textContent || "");
      const modalidadCard = textoDeCampo(card, "modalidad:");
      const precioTexto = textoDeCampo(card, "precio:");
      const precioCard = precioTexto ? Number(precioTexto.replace(/[^0-9]/g, "")) : null;

      const coincideMateria = !materia || materiaCard.includes(materia);
      const coincideModalidad = !modalidad || modalidadCard.includes(modalidad);
      const coincidePrecio = !precioMax || precioCard === null || precioCard <= precioMax;

      const visible = coincideMateria && coincideModalidad && coincidePrecio;
      card.classList.toggle("d-none", !visible);
      if (visible) visibles += 1;
    });

    if (resultadoFiltro) {
      resultadoFiltro.textContent =
        visibles === 0
          ? "No encontramos profesores con esos filtros."
          : `Mostrando ${visibles} de ${total} profesores.`;
    }
  });
}

// ---------- perfilProfesor.html: solicitar clase ----------
const formSolicitarClase = document.getElementById("formSolicitarClase");
if (formSolicitarClase) {
  const CLAVE_SOLICITADOS = "miprofe_alumno_solicitudes_enviadas";
  const boton = document.getElementById("btnSolicitarClase");
  const nombreProfesor = document.querySelector("#datos-profesor .card-title").textContent.trim();
  const id = slugify(nombreProfesor);

  const solicitados = JSON.parse(localStorage.getItem(CLAVE_SOLICITADOS) || "[]");

  const marcarComoSolicitado = () => {
    boton.disabled = true;
    boton.textContent = "Solicitud enviada ✓";
  };

  if (solicitados.includes(id)) {
    marcarComoSolicitado();
  }

  formSolicitarClase.addEventListener("submit", (evento) => {
    evento.preventDefault();
    if (solicitados.includes(id)) return;

    solicitados.push(id);
    localStorage.setItem(CLAVE_SOLICITADOS, JSON.stringify(solicitados));
    marcarComoSolicitado();
    mostrarToast(`Le enviaste una solicitud de clase a ${nombreProfesor}.`);
  });
}

// ---------- chatGrupo.html: cambiar de conversacion y enviar mensajes ----------
const listaConversaciones = document.querySelectorAll("#conversacionesGrupo [data-conversacion]");
const mensajesContenedor = document.getElementById("mensajesGrupo");

if (listaConversaciones.length && mensajesContenedor) {
  const nombreActivo = document.getElementById("chatGrupoNombre");
  const formMensaje = document.getElementById("formMensajeGrupo");
  const inputMensaje = document.getElementById("mensaje");

  const horaActual = () => {
    const ahora = new Date();
    return `${String(ahora.getHours()).padStart(2, "0")}:${String(ahora.getMinutes()).padStart(2, "0")}`;
  };

  const conversaciones = {
    lucia: {
      mensajes: [
        { propio: false, texto: "Hola, ¿cómo estás? Nos vemos el miércoles a las 16hs.", hora: "10:30" },
        { propio: true, texto: "¡Perfecto! Ahí estaré.", hora: "10:32" },
      ],
    },
    "grupo-matematica": { mensajes: [] },
    sofia: { mensajes: [] },
  };

  let conversacionActiva = "lucia";

  const crearMensajeEl = ({ propio, texto, hora }) => {
    const div = document.createElement("div");
    div.className = `message ${propio ? "sent" : "received"}`;

    const parrafo = document.createElement("p");
    parrafo.textContent = texto;

    const spanHora = document.createElement("span");
    spanHora.className = "time";
    spanHora.textContent = hora;

    div.appendChild(parrafo);
    div.appendChild(spanHora);
    return div;
  };

  const pintarConversacion = (id) => {
    mensajesContenedor.innerHTML = "";
    const { mensajes } = conversaciones[id];

    if (mensajes.length === 0) {
      const vacio = document.createElement("p");
      vacio.className = "text-muted text-center mt-3";
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

      const nuevoMensaje = { propio: true, texto, hora: horaActual() };
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

// ---------- EditarPerfil.html y validaciones ----------
activarValidacion(document.querySelector("#editar-perfil form"), "Perfil actualizado correctamente.");

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