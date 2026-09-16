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

// ---------- Solicitudes.html: aceptar / rechazar ----------
function slugify(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-");
}

const seccionSolicitudes = document.getElementById("solicitudes");
if (seccionSolicitudes) {
  const CLAVE_RESUELTAS = "miprofe_profesor_solicitudes_resueltas";
  const CLAVE_PENDIENTES = "miprofe_profesor_solicitudes_pendientes";

  const resueltas = JSON.parse(localStorage.getItem(CLAVE_RESUELTAS) || "[]");

  const actualizarPendientes = () => {
    const restantes = seccionSolicitudes.querySelectorAll(".card").length;
    localStorage.setItem(CLAVE_PENDIENTES, String(restantes));
  };

  seccionSolicitudes.querySelectorAll(".card").forEach((card) => {
    const nombre = card.querySelector(".card-title").textContent.trim();
    const id = slugify(nombre);

    if (resueltas.includes(id)) {
      card.remove();
      return;
    }

    card.querySelectorAll('button[name="accion"]').forEach((boton) => {
      boton.addEventListener("click", (evento) => {
        evento.preventDefault();
        const accion = boton.value; // "aceptar" | "rechazar"

        resueltas.push(id);
        localStorage.setItem(CLAVE_RESUELTAS, JSON.stringify(resueltas));

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
  });

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

// ---------- PublicarOferta.html y EditarPerfil.html: validacion + confirmacion ----------
activarValidacion(document.querySelector("#publicar-oferta form"), "Oferta publicada correctamente.", { reset: true });
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
