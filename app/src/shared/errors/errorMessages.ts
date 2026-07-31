/**
 * Códigos de error de la app → mensaje para el usuario (español).
 *
 * Centralizar aquí los textos evita que mensajes crudos (`error.message`,
 * errores de red en inglés, etc.) lleguen a la UI, y deja la puerta abierta
 * a una futura adopción de i18n tocando solo este archivo.
 */
export const ERROR_MESSAGES: Record<string, string> = {
  UNKNOWN: "Algo salió mal. Inténtalo de nuevo",

  // auth
  "auth/invalid-credentials": "Credenciales inválidas",
  "auth/email-not-confirmed": "Correo no confirmado",
  "auth/email-in-use": "El correo ya está en uso",
  "auth/weak-password": "La contraseña es demasiado débil",
  "auth/username-required": "El nombre de usuario es obligatorio",
  "auth/passwords-do-not-match": "Las contraseñas no coinciden",
  "auth/login-failed": "Error al iniciar sesión",
  "auth/register-failed": "Error al crear la cuenta",
  "auth/logout-failed": "Error al cerrar sesión",

  // connection
  "connection/fetch-failed": "Error al obtener la conexión",
  "connection/create-failed": "Error al crear la conexión",
  "connection/break-failed": "No se pudo romper la conexión",
  "connection/link-failed": "Error al generar el enlace de conexión",
  "connection/request-failed": "Error con la solicitud de conexión",

  // notes
  "notes/fetch-failed": "Error al cargar las notas",
  "notes/send-failed": "No se pudo enviar la nota",

  // settings / store
  "store/read-failed": "No se pudo leer la configuración",
  "store/write-failed": "No se pudo guardar la configuración",
  "settings/theme-failed": "No se pudo aplicar el tema",
  "settings/color-failed": "No se pudo aplicar el color",
  "settings/behavior-failed": "No se pudo aplicar el comportamiento de ventana",
  "settings/autostart-failed": "No se pudo cambiar el arranque automático",

  // presence
  "presence/failed": "Error al actualizar el estado de presencia",

  // call
  "call/failed": "Error en la llamada",

  // deep link
  "deeplink/failed": "Error al procesar el enlace",
};

export const UNKNOWN_ERROR_MESSAGE = ERROR_MESSAGES.UNKNOWN;
