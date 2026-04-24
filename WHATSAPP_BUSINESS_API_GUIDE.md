# WhatsApp Business API - Guía Técnica

## Ventana de Respuesta de 24 Horas (CRÍTICO)

### ¿Qué es la Ventana de Respuesta?
- **Definición**: Período de 24 horas donde el negocio puede enviar mensajes libres al cliente después de que el cliente inicia la conversación.
- **Inicio**: Se activa con el PRIMER mensaje enviado por el cliente.
- **Duración**: 24 horas desde el último mensaje del cliente.
- **Reinicio**: Cada mensaje nuevo del cliente reinicia el contador de 24 horas.

### Comportamiento Durante la Ventana
- ✅ Mensajes libres (texto, multimedia, enlaces)
- ✅ Mensajes de soporte y ventas
- ✅ Sin restricciones de contenido
- ✅ Costos de mensajería normales

### Comportamiento Después de la Ventana
- ❌ Mensajes libres BLOQUEADOS
- ❌ Multimedia BLOQUEADA
- ✅ Solo mensajes de **plantilla pre-aprobados**
- ✅ Requiere aprobación de Meta
- ✅ Costos más altos (conversación iniciada por negocio)

### Casos que Abren la Ventana
- Mensaje directo del cliente ("Hola", "¿Precio?")
- Respuesta a plantilla enviada por el negocio
- Click en "Enviar mensaje" de un anuncio Click-to-WhatsApp
- Uso de botones de respuesta rápida

### Casos que NO Abren la Ventana
- Envío de plantilla por el negocio (solo respuestas abren ventana)
- Guardado del número de teléfono
- Mensajes de broadcast
- Mensajes automáticos sin interacción previa

### Errores Comunes
- **Error Code 100**: Intento de envío fuera de ventana
- **Mensajes no entregados**: WhatsApp filtra como spam
- **Conversaciones "bloqueadas"**: Requieren plantilla para continuar

### Mejores Prácticas
1. **Respuesta rápida**: Contestar dentro de las primeras horas
2. **Plantillas estratégicas**: Preparar plantillas para reabrir conversaciones
3. **Monitoreo**: Trackear ventanas activas en el CRM
4. **Automatización**: Usar chatbots para respuestas 24/7 dentro de ventana

### Configuración en SST IA Labs
- **Phone Number ID**: 1041139959089092
- **Business Account ID**: 2664906893719275
- **API Version**: v19.0
- **Base URL**: https://graph.facebook.com/v19.0/{phone_number_id}/messages

### Solución de Problemas
- Verificar logs de envío para códigos de error
- Confirmar estado de aprobación en Meta for Developers
- Revisar permisos del Access Token
- Validar formato internacional de números (+52XXXXXXXXXX)

**IMPORTANTE**: Nunca enviar mensajes promocionales o ventas fuera de la ventana de respuesta. Viola las políticas de WhatsApp y puede resultar en suspensión de la cuenta.

Última actualización: 2026-04-23</content>
<parameter name="filePath">WHATSAPP_BUSINESS_API_GUIDE.md