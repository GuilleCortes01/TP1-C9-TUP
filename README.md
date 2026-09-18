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

## 📂 Estructura del proyecto

```
├── index.html              # Landing pública
├── Login.html               # Inicio de sesión (maqueta)
├── Register.html            # Registro (maqueta)
├── robots.txt / sitemap.xml
├── Estilo/                  # Hojas de estilo (una general + una por rol)
│   ├── style.css
│   ├── styleAlumnos.css
│   └── profesor.css
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

## 🔍 SEO

Le agregamos algunas cosas básicas de SEO a `index.html`, que es la única página pública (Login, Register y los paneles de alumno/profesor no tiene sentido que aparezcan en buscadores):

- `meta description` + Open Graph/Twitter Cards, para que se vea bien el link al compartirlo (WhatsApp, redes)
- `rel="canonical"` apuntando a la URL de Netlify
- Arreglamos el `lang` de varias páginas que decía `en` en vez de `es`
- Un solo `h1` por página
- `alt` en las imágenes sueltas que no tenían texto al lado (el resto se dejó vacío a propósito porque son íconos decorativos)
- `robots.txt` bloqueando Login, Register y los paneles privados
- `sitemap.xml` con la home
