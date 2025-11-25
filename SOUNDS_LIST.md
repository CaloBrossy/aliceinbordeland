# Lista de Sonidos Necesarios

Esta es la lista completa de todos los sonidos que se están usando en la aplicación. Por favor, proporciona los links de los archivos de audio (deben ser accesibles sin problemas de CORS, preferiblemente alojados en un CDN o servidor propio).

## Sonidos de INTRO (GameIntro.tsx)
1. **cardReveal** - Metallic whoosh (sonido cuando se revela la carta del juego)
2. **textType** - Tick suave (sonido de escritura de texto)
3. **ruleReveal** - Ding (sonido cuando se revela una regla)
4. **countdown** - Beep (sonido del countdown antes de iniciar)
5. **gameStart** - Explosión épica (sonido cuando se inicia el juego)
6. **introMusic** - Música tensa para la intro (loop)

## Sonidos de JUEGO (GameScreen.tsx)
7. **ambientMusic** - Música ambiente durante el juego (loop)
8. **hover** - Sonido cuando se hace hover sobre botones/UI
9. **click** - Sonido de click en botones/UI

## Sonidos de TIMER (GameScreen.tsx)
10. **alert** - Alarma cuando quedan pocos segundos (15-10 segundos restantes)

## Sonidos de MUERTE/ELIMINACIÓN (DeathAnimation.tsx, ResultScreen.tsx)
11. **explosion** - Explosión (durante la animación de muerte)
12. **eliminated** - Gong dramático (cuando se elimina un jugador)
13. **fadeOut** - Sonido apagándose (fade out de la muerte)

## Sonidos OTROS
14. **revive** - Mágico celestial (si se implementa revivir)
15. **reset** - Whoosh reinicio (si se implementa reset)
16. **victory** - Música de victoria (loop)
17. **defeat** - Música de derrota (loop)
18. **heartbeat** - Latidos (loop, se acelera cuando queda 1 jugador)

## Sonidos Legacy (compatibilidad)
19. **success** - Sonido de éxito
20. **error** - Sonido de error
21. **gameClear** - Sonido de juego completado
22. **gameOver** - Sonido de juego terminado
23. **death** - Sonido de muerte
24. **elimination** - Sonido de eliminación
25. **vote** - Sonido de voto
26. **reveal** - Sonido de revelación
27. **tick** - Sonido de tick/timer
28. **tension** - Sonido de tensión (loop)

---

**Total: 28 sonidos**

**Nota importante**: Los archivos deben ser accesibles sin problemas de CORS. Si usas freesound.org o pixabay, necesitarás descargar los archivos y alojarlos en tu propio servidor o usar un CDN que permita CORS.

