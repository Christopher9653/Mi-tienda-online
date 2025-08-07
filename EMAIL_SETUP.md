# Configuración de Email para Restablecimiento de Contraseña

## Configuración de Gmail

Para que el sistema de restablecimiento de contraseña funcione correctamente, necesitas configurar las credenciales de Gmail en el archivo `server_v2/config.env`.

### Pasos para configurar Gmail:

1. **Habilitar la verificación en dos pasos** en tu cuenta de Gmail
2. **Generar una contraseña de aplicación**:
   - Ve a la configuración de tu cuenta de Google
   - Selecciona "Seguridad"
   - En "Iniciar sesión en Google", selecciona "Contraseñas de aplicación"
   - Selecciona "Otra" y dale un nombre (ej: "Mi Tienda Online")
   - Copia la contraseña generada (16 caracteres)

3. **Actualizar el archivo `server_v2/config.env`**:
   ```env
   EMAIL_USER=tu-email@gmail.com
   EMAIL_PASS=tu-password-de-app-generada
   ```

### Ejemplo de configuración:
```env
EMAIL_USER=mi-tienda@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop
```

### Notas importantes:
- La contraseña de aplicación es diferente a tu contraseña normal de Gmail
- No incluyas espacios en la contraseña de aplicación
- Asegúrate de que la verificación en dos pasos esté habilitada
- La contraseña de aplicación solo se muestra una vez, así que guárdala en un lugar seguro

### Prueba del sistema:
1. Inicia el servidor: `cd server_v2 && npm start`
2. Ve a la aplicación y prueba el enlace "¿Olvidaste tu contraseña?"
3. Ingresa un correo válido y verifica que recibas el código

### Solución de problemas:
- Si no recibes el correo, verifica que las credenciales sean correctas
- Revisa la carpeta de spam
- Asegúrate de que el servidor esté corriendo en el puerto 3001
- Verifica los logs del servidor para errores de conexión SMTP
