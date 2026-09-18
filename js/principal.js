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

// ---------- Login.html y Register.html: cuentas simuladas con localStorage ----------
// No hay backend, asi que las "cuentas" se guardan en el navegador. No es seguro
// (la contraseña queda en texto plano) ni persiste entre dispositivos distintos,
// pero permite un login/registro que funciona de verdad dentro del mismo navegador.
const CLAVE_CUENTAS = "miprofe_cuentas";
const CLAVE_SESION = "miprofe_sesion";

function leerCuentas() {
  return JSON.parse(localStorage.getItem(CLAVE_CUENTAS) || "[]");
}

function iniciarSesion(cuenta) {
  localStorage.setItem(
    CLAVE_SESION,
    JSON.stringify({ nombre: cuenta.nombre, email: cuenta.email, rol: cuenta.rol })
  );
}

function irAlPanel(rol) {
  window.location.href = rol === "profesor" ? "profesor/PrincipalProfesor.html" : "alumno/principalAlumno.html";
}

const formLogin = document.querySelector(".auth-panel form.card");
if (formLogin) {
  formLogin.setAttribute("novalidate", "");
  formLogin.addEventListener("submit", (evento) => {
    evento.preventDefault();

    if (!formLogin.checkValidity()) {
      formLogin.classList.add("was-validated");
      return;
    }

    const email = document.getElementById("email").value.trim().toLowerCase();
    const contrasena = document.getElementById("password").value;
    const cuenta = leerCuentas().find((c) => c.email === email && c.password === contrasena);

    if (!cuenta) {
      mostrarToast("Email o contraseña incorrectos. ¿Ya te registraste?", "danger");
      return;
    }

    iniciarSesion(cuenta);
    mostrarToast(`¡Bienvenido/a, ${cuenta.nombre}! Te llevamos a tu panel...`);
    mostrarCargando();
    setTimeout(() => irAlPanel(cuenta.rol), 1200);
  });
}

const formRegistro = document.querySelector("form.form--register");
if (formRegistro) {
  formRegistro.setAttribute("novalidate", "");
  formRegistro.addEventListener("submit", (evento) => {
    evento.preventDefault();

    if (!formRegistro.checkValidity()) {
      formRegistro.classList.add("was-validated");
      return;
    }

    const email = document.getElementById("email").value.trim().toLowerCase();
    const cuentas = leerCuentas();

    if (cuentas.some((c) => c.email === email)) {
      mostrarToast("Ya existe una cuenta registrada con ese email.", "danger");
      return;
    }

    const cuenta = {
      nombre: document.getElementById("nombre").value.trim(),
      email,
      password: document.getElementById("password").value,
      rol: document.querySelector('input[name="rol"]:checked').value,
    };

    cuentas.push(cuenta);
    localStorage.setItem(CLAVE_CUENTAS, JSON.stringify(cuentas));
    iniciarSesion(cuenta);

    mostrarToast(`Cuenta creada, ${cuenta.nombre}. Te llevamos a tu panel...`);
    mostrarCargando();
    setTimeout(() => irAlPanel(cuenta.rol), 1200);
  });
}

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