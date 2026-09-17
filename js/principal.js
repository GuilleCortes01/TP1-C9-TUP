// Funcionalidades JS de la seccion principal (index.html, Login.html, Register.html).
// Mismo criterio que profesor.js/alumno.js: cada bloque valida que sus elementos existan
// antes de engancharse, asi este archivo se puede incluir en las 3 paginas sin romper nada.

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

// ---------- Login.html y Register.html: mostrar/ocultar contraseña ----------
document.querySelectorAll("[data-toggle-password]").forEach((boton) => {
  const input = document.getElementById(boton.dataset.togglePassword);
  if (!input) return;

  boton.addEventListener("click", () => {
    const oculto = input.type === "password";
    input.type = oculto ? "text" : "password";
    boton.textContent = oculto ? "Ocultar" : "Mostrar";
  });
});

// ---------- Register.html: las contraseñas tienen que coincidir ----------
const password = document.getElementById("password");
const password2 = document.getElementById("password2");
if (password && password2) {
  const validarCoincidencia = () => {
    if (password2.value && password2.value !== password.value) {
      password2.setCustomValidity("Las contraseñas no coinciden.");
    } else {
      password2.setCustomValidity("");
    }
  };

  password.addEventListener("input", validarCoincidencia);
  password2.addEventListener("input", validarCoincidencia);
}

// ---------- Login.html y Register.html: enviar el formulario (sin backend) ----------
function activarFormularioSimulado(form, mensajeExito) {
  if (!form) return;

  form.setAttribute("novalidate", "");
  form.addEventListener("submit", (evento) => {
    evento.preventDefault();

    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }

    mostrarToast(mensajeExito, "success");
  });
}

activarFormularioSimulado(
  document.querySelector(".auth-panel form.card"),
  "Inicio de sesión simulado: todavía no hay backend conectado. Usá los accesos directos de abajo para entrar."
);
activarFormularioSimulado(
  document.querySelector("form.form--register"),
  "Cuenta creada (simulada). En un backend real, acá te llevaríamos a completar tu perfil."
);

// ---------- index.html: autocompletar el buscador con una materia popular ----------
const inputMateriaHero = document.querySelector('#hero input[name="materia"]');
if (inputMateriaHero) {
  document.querySelectorAll("[data-materia-rapida]").forEach((boton) => {
    boton.addEventListener("click", () => {
      inputMateriaHero.value = boton.dataset.materiaRapida;
      inputMateriaHero.focus();
    });
  });
}

// ---------- index.html: boton "volver arriba" ----------
const botonVolverArriba = document.getElementById("btnVolverArriba");
if (botonVolverArriba) {
  window.addEventListener("scroll", () => {
    botonVolverArriba.classList.toggle("d-none", window.scrollY < 400);
  });

  botonVolverArriba.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}
