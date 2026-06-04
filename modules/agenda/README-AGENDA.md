# Módulo de agenda reutilizable

## Archivos creados

- agenda.html: calendario público para reservar.
- agenda.css: estilos del módulo.
- agenda.js: lógica pública.
- agenda-admin.html: panel privado.
- agenda-admin.js: lógica administrativa.
- agenda-config.js: configuración por empresa.
- apps-script-backend.gs: backend gratuito en Google Apps Script.

## Funcionamiento

La agenda muestra horarios de lunes a viernes, desde las 8:00 a.m. hasta las 5:00 p.m. Cuando el usuario reserva, el sistema guarda la cita y envía un correo al dueño.

## Modo demo

Mientras `appsScriptUrl` tenga el texto `PASTE_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE`, las reservas se guardan solo en el navegador usando localStorage. Sirve para probar la interfaz, pero no bloquea horarios para otros usuarios.

## Modo real económico

1. Crear un Google Sheet.
2. Ir a Extensions > Apps Script.
3. Pegar el contenido de `apps-script-backend.gs`.
4. Cambiar:
   - `SHEET_ID`
   - `OWNER_EMAIL`
   - `ADMIN_PIN`
5. Deploy > New deployment > Web app.
6. Execute as: Me.
7. Who has access: Anyone.
8. Copiar la URL del Web App.
9. Pegarla en `agenda-config.js`, propiedad `appsScriptUrl`.

## URLs

Página pública:

`/modules/agenda/agenda.html`

Panel privado:

`/modules/agenda/agenda-admin.html`

## Reutilización

Para usarlo en otra web, copiar la carpeta `/modules/agenda/` y editar solo `agenda-config.js`.
