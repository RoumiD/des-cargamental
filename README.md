# Carga Mental

App para organizar salud, reembolsos, compras, viajes, finanzas y más, compartida con tu familia, con integración a Google Calendar.

## Qué hace y qué NO hace (léelo antes de configurar)

**Hace:**
- Categorías con auto-sugerencia por palabras clave (puedes corregirla siempre).
- Sincronización real entre dispositivos y personas vía Firebase Firestore.
- Botón para agregar un ítem con fecha a tu Google Calendar.
- Recordatorios locales (notificación del navegador) cuando la app está **abierta** y algo vence en la próxima hora.
- Instalable como app (PWA) en el celular/escritorio.

**NO hace (limitación técnica real, no un descuido):**
- **No envía notificaciones push si la app está completamente cerrada.** Para eso se necesita Firebase Cloud Messaging + una función programada en el backend (Cloud Functions), lo que obliga a activar el plan "Blaze" de Firebase (pago por uso — igual te mantienes en la capa gratuita con este volumen de uso, pero exige tarjeta registrada). No lo incluí en esta primera versión porque agrega complejidad y un requisito de facturación que tú debes decidir si quieres asumir. Si lo quieres, es la siguiente fase.

---

## Paso 1 — Crear proyecto en Firebase (tú, ~5 min)

1. Ve a https://console.firebase.google.com → "Agregar proyecto" → dale un nombre (ej. `carga-mental`).
2. Dentro del proyecto: **Compilación → Firestore Database → Crear base de datos** → modo producción → elige una región cercana (ej. `southamerica-east1`).
3. **Compilación → Authentication → Comenzar** → habilita el proveedor **Google**.
4. Ve a **Configuración del proyecto (ícono de engranaje) → General → Tus apps → Agregar app → Web (`</>`)**. Ponle un nombre y copia el objeto `firebaseConfig` que te muestra.
5. Pega esos valores en `firebase-config.js`, reemplazando los `TU_...`.

### Reglas de seguridad de Firestore (importante)

Por defecto Firestore en modo producción bloquea todo. Ve a **Firestore → Reglas** y pega esto:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /families/{familyId}/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

Esto permite que cualquier usuario autenticado con Google lea/escriba cualquier "familia" — es decir, la seguridad real de quién ve qué depende de que el código de familia no se comparta con quien no corresponde (como una contraseña simple, no como un permiso por usuario). Si más adelante quieres que un código de familia solo lo puedan usar personas invitadas explícitamente, hay que agregar una lista de miembros — dímelo y lo agregamos.

---

## Paso 2 — Google Cloud Console para Calendar (tú, ~5 min)

El acceso a Calendar en este proyecto usa el **mismo login de Google** que ya configuraste en el paso anterior (Firebase Authentication ya crea un proyecto de Google Cloud detrás). Solo falta habilitar la API:

1. Ve a https://console.cloud.google.com y selecciona el mismo proyecto que Firebase creó (mismo nombre).
2. Ve a **APIs y servicios → Biblioteca** → busca "Google Calendar API" → **Habilitar**.
3. Ve a **APIs y servicios → Pantalla de consentimiento OAuth**:
   - Tipo de usuario: Externo.
   - Completa nombre de la app, correo de soporte.
   - En "Scopes" agrega `.../auth/calendar.events`.
   - En "Test users" (mientras la app esté en modo prueba) agrega tu correo y el de tu familia — si no, Google bloqueará el login de cualquiera que no esté en esa lista.

No necesitas crear un Client ID por separado: Firebase Auth con el proveedor Google ya lo maneja.

---

## Paso 3 — Publicar en GitHub Pages

```bash
# dentro de la carpeta del proyecto
git init
git add .
git commit -m "Carga Mental — primera versión"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/carga-mental.git
git push -u origin main
```

Luego en GitHub: **Settings → Pages → Source: `main` / carpeta raíz** → guardar. En 1-2 minutos queda disponible en `https://TU_USUARIO.github.io/carga-mental/`.

**Importante:** agrega ese dominio (`TU_USUARIO.github.io`) en Firebase → Authentication → Settings → **Authorized domains**, o el login con Google fallará.

---

## Cómo se usa

1. Cada persona entra con su cuenta Google.
2. La primera vez elige un "código de familia" (ej. `familia-perez`) — cualquiera que ingrese el mismo código ve y edita la misma lista.
3. Escriben lo que necesitan organizar; la categoría se sugiere sola pero se puede cambiar.
4. Si algo tiene fecha, aparece un botón 📆 para mandarlo directo a Google Calendar.

## Próximos pasos posibles (no incluidos, para decidir después)

- Notificaciones push reales con app cerrada (requiere Blaze + Cloud Functions).
- Restringir familias por invitación en vez de por código compartido.
- Editar ítems existentes (hoy solo se pueden crear, marcar como hechos o eliminar).
