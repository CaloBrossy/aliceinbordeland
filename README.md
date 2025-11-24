# Alice in Borderland - Multiplayer Web Game

Aplicación web multijugador inspirada en Alice in Borderland donde múltiples jugadores pueden unirse a una sala usando un código y jugar juntos en tiempo real.

## 🎮 Características

- **Sistema de Salas**: Crea o únete a salas con códigos únicos de 6 caracteres
- **Juegos por Palos**: 
  - 🔴 **Corazones** (Traición/Psicológicos): Witch Hunt, Trust Fall, Majority Rules
  - 🟢 **Tréboles** (Trabajo en Equipo): Riddle Room, Word Chain, Memory Palace
  - 🔵 **Diamantes** (Lógica/Inteligencia): Math Race, Pattern Break, Logic Gates
  - ⚫ **Picas** (Resistencia Física/Mental): Hot Seat, Dare or Dare, Endurance Test
- **Sincronización en Tiempo Real**: Estado compartido entre todos los dispositivos usando Supabase Realtime
- **Autenticación Anónima**: Juega sin necesidad de registro
- **Diseño Responsive**: Mobile-first, optimizado para dispositivos móviles

## 🛠️ Stack Tecnológico

- **Framework**: Next.js 16+ (App Router)
- **Lenguaje**: TypeScript
- **Styling**: Tailwind CSS
- **Base de Datos**: Supabase (PostgreSQL + Realtime)
- **Auth**: Supabase Auth (Anonymous)
- **Iconos**: lucide-react

## 📋 Prerrequisitos

- Node.js 18+ y npm
- Cuenta de Supabase (gratuita)

## 🚀 Configuración

### 1. Clonar e Instalar Dependencias

```bash
npm install
```

### 2. Configurar Supabase

1. Crea un proyecto en [Supabase](https://supabase.com)
2. Ve a **SQL Editor** y ejecuta el contenido de `supabase/schema.sql`
3. Ve a **Authentication** > **Providers** y habilita **Anonymous** authentication
4. Ve a **Project Settings** > **API** y copia:
   - Project URL
   - Anon public key

### 3. Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

### 4. Ejecutar el Proyecto

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📁 Estructura del Proyecto

```
aliceinborderland/
├── app/
│   ├── layout.tsx          # Layout principal
│   ├── page.tsx            # Página de inicio (Home)
│   ├── globals.css          # Estilos globales
│   └── room/[code]/
│       └── page.tsx        # Página de sala (Lobby/Game/Results)
├── components/
│   ├── Home.tsx            # Pantalla inicial
│   ├── Lobby.tsx           # Sala de espera
│   ├── GameScreen.tsx       # Pantalla de juego
│   ├── ResultScreen.tsx     # Pantalla de resultados
│   ├── Toast.tsx           # Componente de notificaciones
│   └── games/
│       ├── HeartsGame.tsx   # Juegos de corazones
│       ├── ClubsGame.tsx    # Juegos de tréboles
│       ├── DiamondsGame.tsx # Juegos de diamantes
│       └── SpadesGame.tsx   # Juegos de picas
├── lib/
│   ├── supabase/
│   │   ├── client.ts       # Cliente Supabase (cliente)
│   │   ├── server.ts       # Cliente Supabase (servidor)
│   │   └── types.ts        # Tipos TypeScript
│   ├── gameLogic.ts        # Lógica de juegos
│   ├── gameGenerator.ts    # Generador de juegos
│   ├── roomManager.ts      # Gestión de salas
│   ├── roomCleanup.ts     # Limpieza de salas
│   └── auth.ts            # Utilidades de autenticación
├── hooks/
│   ├── useAuth.ts         # Hook de autenticación
│   ├── useRoom.ts         # Hook de sincronización de sala
│   ├── useGame.ts         # Hook de estado del juego
│   └── useToast.ts        # Hook de notificaciones
├── data/
│   └── gamesLibrary.ts     # Biblioteca de juegos
├── types/
│   └── game.ts            # Tipos de TypeScript
└── supabase/
    └── schema.sql         # Schema de base de datos
```

## 🎯 Uso

### Crear una Sala

1. Haz clic en **"Crear Sala"**
2. Se generará un código único de 6 caracteres
3. Comparte el código con tus amigos

### Unirse a una Sala

1. Haz clic en **"Unirse a Sala"**
2. Ingresa el código de la sala
3. Opcionalmente, ingresa tu nombre
4. Haz clic en **"Unirse"**

### Jugar

1. El host puede iniciar el juego cuando haya al menos 2 jugadores
2. Se generará un juego aleatorio según el número de jugadores
3. Sigue las instrucciones del juego
4. Al finalizar, verás los resultados

## 🔒 Seguridad

- **Row Level Security (RLS)**: Configurado en todas las tablas
- **Autenticación Anónima**: Cada usuario tiene una sesión única
- **Validaciones**: Todas las acciones están validadas en el cliente y servidor

## 🐛 Solución de Problemas

### Error: "Sala no encontrada"
- Verifica que el código de la sala sea correcto
- Asegúrate de que la sala no haya sido eliminada

### Error: "Sala llena"
- El máximo de jugadores por sala es 10
- Crea una nueva sala o espera a que alguien salga

### Error: "El juego ya ha comenzado"
- No puedes unirte a una sala donde el juego ya está en curso
- Espera a que termine el juego o crea una nueva sala

### Problemas de Conexión
- Verifica tu conexión a internet
- Asegúrate de que las variables de entorno estén configuradas correctamente
- Revisa la consola del navegador para más detalles

## 📝 Notas

- Las salas vacías se eliminan automáticamente después de 5 minutos
- Los jugadores desconectados se marcan después de 30 segundos
- Si el host se desconecta, se promueve automáticamente un nuevo host
- El timer del juego se actualiza en tiempo real para todos los jugadores

## 🚀 Despliegue

### Vercel (Recomendado)

1. Conecta tu repositorio a Vercel
2. Agrega las variables de entorno:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Despliega

### Otros Proveedores

El proyecto es compatible con cualquier proveedor que soporte Next.js:
- Netlify
- Railway
- Render
- etc.

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue o pull request.

## 📧 Soporte

Si tienes preguntas o problemas, por favor abre un issue en el repositorio.
