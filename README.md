# Nombre del Proyecto: Mi Profe

🔗 Sitio en producción: https://miprofe00.netlify.app/

## Integrantes:

- Hernan Alvarez
- Sofia Altamiranda
- Guillermo Cortes

## 📚 Descripción del proyecto

**MiProfe** es una plataforma web que conecta alumnos con profesores particulares según su **ubicación, materia y modalidad de enseñanza**.

Los alumnos podrán buscar profesores cercanos, consultar sus perfiles, experiencia, precios y modalidad de clases, además de dejar **calificaciones y referencias** sobre el servicio recibido.

Por otro lado, los profesores podrán registrarse, crear su perfil y ofrecer sus servicios a nuevos alumnos de manera sencilla.

## 🚦 Estado del proyecto

Por ahora es solo el front-end, todavía no está conectado a un backend ni a una base de datos. El login y el registro no autentican de verdad, y los profesores, solicitudes y mensajes que se ven son datos de ejemplo puestos directo en el HTML.

## 🛠️ Tecnologías utilizadas

- HTML5 — Estructura y contenido de la página web.
- CSS — Diseño, estilos y adaptación responsive.
- Bootstrap 5.3.8 — Navbar, cards, formularios y grid responsive.
- Google Fonts (Manrope y Plus Jakarta Sans).
- JavaScript — Interactividad, validaciones y simulación de cuentas/sesión con `localStorage` (sin backend).

## 🎨 Variables de diseño (CSS)

Todo el sitio toma sus colores, tipografías, sombras y bordes de un solo lugar: el `:root` de `Estilo/style.css`. Cambiar un valor ahí lo actualiza en todo el proyecto.

```css
:root {
  --color-primary: #2d8cf0;
  --color-secondary: #87ceeb;
  --font-color: #323232;
  --border-color: #000000;
  --shadow: 4px 4px var(--border-color);
  --font-heading: 'Plus Jakarta Sans', sans-serif;
  --font-body: 'Manrope', sans-serif;
  --border-radius: 5px;
  /* + colores de acento (--accent-verde, --accent-naranja, --accent-violeta, --accent-rojo) */
}
```

Además, hay un segundo bloque `:root` que pisa las variables propias de Bootstrap (`--bs-primary`, `--bs-border-radius`, etc.) reusando las de arriba. Así los componentes de Bootstrap (`.btn`, `.card`, `.badge`...) ya salen con los colores de la marca, sin tener que escribir CSS extra para cada uno.

## 📂 Estructura del proyecto

```
├── index.html              # Landing pública
├── Login.html               # Inicio de sesión
├── Register.html            # Registro
├── robots.txt / sitemap.xml
├── Estilo/                  # Hojas de estilo (una general + una por rol)
│   ├── style.css            # Variables (:root) + estilos compartidos
│   ├── styleAlumnos.css
│   └── profesor.css
├── js/                      # Un archivo de JS por sector
│   ├── principal.js         # index / Login / Register
│   ├── alumno.js
│   └── profesor.js
├── img/                     # Logos, íconos e imágenes del sitio
├── alumno/                  # Pantallas del panel de alumno
│   ├── principalAlumno.html
│   ├── MisProfesores.html
│   ├── perfilProfesor.html
│   ├── grupos.html
│   ├── chatGrupo.html
│   └── EditarPerfil.html
└── profesor/                # Pantallas del panel de profesor
    ├── PrincipalProfesor.html
    ├── Solicitudes.html
    ├── PublicarOferta.html
    ├── Grupos.html
    ├── Chat.html
    └── EditarPerfil.html
```

## ▶️ Cómo correrlo

Es HTML y CSS estático, no hace falta instalar nada. Cloná el repo y abrí `index.html` con Live Server (o directo con doble clic).

## ⚙️ JavaScript

Cada sector tiene su propio archivo (`js/principal.js`, `js/alumno.js`, `js/profesor.js`), pero comparten datos entre sí a través de `localStorage` (mismo origen, no hace falta backend):

- **Login/Registro**: crear una cuenta la guarda en el navegador y te loguea; iniciar sesión valida contra esas cuentas y te redirige a tu panel según el rol.
- **Perfil**: el nombre y los datos del dashboard (nivel, ubicación, materia, precio...) son los de la cuenta logueada, y "Editar perfil" los guarda de verdad.
- **Solicitudes**: cuando un alumno pide una clase, la solicitud le aparece al profesor en `Solicitudes.html` para aceptar o rechazar.
- Validación de formularios, chat (cambiar de conversación / enviar mensaje), filtro de búsqueda de profesores y un loader para las esperas (login/registro).

> No hay backend real: las contraseñas quedan en texto plano en el navegador y nada de esto se comparte entre dispositivos distintos. Es una simulación pensada para poder demostrar el flujo completo sin servidor.

## 🔍 SEO

Le agregamos algunas cosas básicas de SEO a `index.html`, que es la única página pública (Login, Register y los paneles de alumno/profesor no tiene sentido que aparezcan en buscadores):

- `meta description` + Open Graph/Twitter Cards, para que se vea bien el link al compartirlo (WhatsApp, redes)
- `rel="canonical"` apuntando a la URL de Netlify
- Arreglamos el `lang` de varias páginas que decía `en` en vez de `es`
- Un solo `h1` por página
- `alt` en las imágenes sueltas que no tenían texto al lado (el resto se dejó vacío a propósito porque son íconos decorativos)
- `robots.txt` bloqueando Login, Register y los paneles privados
- `sitemap.xml` con la home
