# 🔐 Cómo Habilitar Autenticación Anónima en Supabase

## Paso a Paso Detallado

### Paso 1: Ve a tu Dashboard de Supabase
1. Abre tu navegador
2. Ve a: https://supabase.com/dashboard/project/geppisgcmrsbbhwrllcf
3. Inicia sesión si es necesario

### Paso 2: Navega a Authentication
1. En el menú lateral izquierdo, busca y haz clic en **"Authentication"**
   - Es el ícono de una llave 🔑 o un candado
   - Está en la sección de configuración del proyecto

### Paso 3: Ve a Providers
1. Dentro de la página de Authentication, busca en el **submenú** (arriba o a la izquierda)
2. Haz clic en **"Providers"** o **"Proveedores"**
   - También puede aparecer como "Auth Providers" o "Configuración de Autenticación"

### Paso 4: Busca Anonymous
1. En la lista de proveedores, desplázate hacia abajo
2. Busca **"Anonymous"** en la lista
   - Puede estar al final de la lista
   - También puedes usar Ctrl+F (Cmd+F en Mac) y buscar "Anonymous"

### Paso 5: Habilita Anonymous
1. Encuentra el toggle o switch junto a "Anonymous"
2. **Actívalo** (debe estar en verde o activado)
   - Si ves un botón que dice "Enable" o "Habilitar", haz clic en él
3. **Guarda los cambios** si hay un botón de guardar

### Paso 6: Verifica
1. Asegúrate de que el toggle esté **ON** o **Activo**
2. Debería verse en color verde o con un check ✓

## 📸 Ubicación Visual

La ruta completa es:
```
Dashboard → Authentication → Providers → Anonymous → Toggle ON
```

## ⚠️ Si No Ves la Opción "Anonymous"

1. Verifica que estés en el proyecto correcto
2. Intenta refrescar la página (F5)
3. Verifica que tu plan de Supabase incluya autenticación anónima (todos los planes la incluyen)
4. Busca en el buscador interno de Supabase: "Anonymous"

## ✅ Después de Habilitar

1. Recarga tu aplicación (F5 en el navegador)
2. Intenta crear o unirte a una sala nuevamente
3. El error debería desaparecer

## 🆘 Si Aún No Funciona

Si después de habilitar Anonymous sigues viendo el error:

1. Espera 1-2 minutos (a veces toma tiempo propagarse)
2. Cierra y vuelve a abrir tu aplicación
3. Verifica que las variables de entorno estén correctas en `.env.local`
4. Revisa la consola del navegador para ver si hay otros errores

