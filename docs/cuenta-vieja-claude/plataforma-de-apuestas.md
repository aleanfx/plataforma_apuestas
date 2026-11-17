# Proyecto de claude.ai: Plataforma de Apuestas

Creado 2026-05-28.

## Descripción

Construir una plataforma web de apuestas con múltiples juegos (dominó, póker, bingo, parley y caballos), sistema de usuarios, billetera virtual, depósitos/retiros y panel administrativo. Desarrollo por fases: primero dominó y póker, luego los demás.

## Instrucciones

Eres el asistente de desarrollo de una plataforma web de apuestas online para un cliente venezolano. El proyecto se llama BetPlatform (nombre provisional).

STACK TECNOLÓGICO:
- Frontend: Next.js 14 + Tailwind CSS + shadcn/ui
- Backend: Node.js + Express + Socket.IO
- Base de datos: MongoDB Atlas
- Auth: JWT
- Hosting: Vercel (frontend) + Railway (backend)
- Juego 1 (Dominó): basado en github.com/eufelipemateus/domino-game
- Juego 2 (Póker): basado en github.com/Raghuboi/multiplayer-poker-game

CONTEXTO DEL DESARROLLADOR:
Soy principiante en programación. Necesito instrucciones paso a paso, claras y sin saltarme nada. Si algo requiere instalar dependencias, dímelo. Si hay que ejecutar comandos en terminal, dámelos completos y en orden.

FASE ACTUAL: Fase 1 - Frontend visual (interfaz de la plataforma, sin funcionalidad aún)

LO QUE DEBE INCLUIR LA PLATAFORMA:
- Landing page / login / registro
- Lobby con los juegos disponibles
- Perfil de usuario con saldo
- Sección de depósito y retiro
- Panel administrativo
- Historial de apuestas

ESTILO VISUAL:
Oscuro, moderno, estilo casino premium. Colores: negro, dorado y verde oscuro. Similar a plataformas como Stake.com o Bet365 pero más simple.

REGLAS IMPORTANTES:
- Siempre dame el código completo del archivo, nunca parcial
- Si necesito crear un archivo, dime exactamente dónde va
- Si algo puede fallar, avísame antes
- Prioriza que funcione antes que que sea perfecto

## Documento: _chat.txt

[2/12/25, 3:43:57 p. m.] Plataforma De Apuestas: ‎Los mensajes y las llamadas están cifrados de extremo a extremo. Solo las personas en este chat pueden leerlos, escucharlos o compartirlos.
[2/12/25, 3:43:57 p. m.] Plataforma De Apuestas: ‎Plataforma De Apuestas es un contacto.
[2/12/25, 3:43:29 p. m.] Plataforma De Apuestas: Buenas tardes
[2/12/25, 3:43:33 p. m.] Plataforma De Apuestas: Vengo del foro
[2/12/25, 3:45:27 p. m.] Alejandro G. Smith: Buenas tardes amigo, eres el que quiere la web de apuestas?
[2/12/25, 3:45:36 p. m.] Plataforma De Apuestas: Si sr
[2/12/25, 3:45:40 p. m.] Plataforma De Apuestas: Cuénteme como es la cosa
[2/12/25, 3:47:24 p. m.] Alejandro G. Smith: Puedo programarla, he echo un proyecto similar, pero es un juego *PlayToEarn* donde la gente invierte y gana dinero.

Ya te lo muestro
[2/12/25, 3:47:28 p. m.] Alejandro G. Smith: https://fondo-minecraft.vercel.app/
[2/12/25, 3:47:36 p. m.] Alejandro G. Smith: Un cliente me lo pidió, y se la hice
[2/12/25, 3:47:47 p. m.] Alejandro G. Smith: https://portafolio-desarrollo-web-tau.vercel.app/
[2/12/25, 3:48:00 p. m.] Plataforma De Apuestas: Puede ponérsela juegos?
[2/12/25, 3:48:02 p. m.] Alejandro G. Smith: Ese es mi portafolio también, he puesto los proyectos más importantes allí
[2/12/25, 3:48:02 p. m.] Plataforma De Apuestas: Online
[2/12/25, 3:48:06 p. m.] Plataforma De Apuestas: Domino, poker
[2/12/25, 3:48:34 p. m.] Alejandro G. Smith: Quieres añadir múltiples juegos de apuestas?
[2/12/25, 3:48:50 p. m.] Plataforma De Apuestas: Estoy manejando las 2 posibilidades
[2/12/25, 3:49:00 p. m.] Plataforma De Apuestas: Haz visto la app de domino vamos
[2/12/25, 3:49:02 p. m.] Plataforma De Apuestas: Supongo
[2/12/25, 3:49:08 p. m.] Plataforma De Apuestas: Indíqueme los precios
[2/12/25, 4:04:20 p. m.] Alejandro G. Smith: Sí puedo agregar juegos como póker, dominó, blackjack, slots, etc., pero es importante aclarar algo:

Los juegos no se desarrollan desde cero, sino que se integran desde proveedores externos mediante API o iframe. Así es como funcionan la mayoría de las plataformas de apuestas.

Lo que puedo hacer es:
	•	Crear toda la interfaz de la web (diseño, lobby, menú, usuario, recargas, retiros, etc.)
	•	Tu backend manejaría saldos, apuestas y movimientos
	•	Y los juegos se integran listos desde un proveedor compatible

Con esto se pueden agregar juegos reales sin tener que crearlos manualmente.
[2/12/25, 4:04:26 p. m.] Alejandro G. Smith: Si claro
[2/12/25, 4:04:45 p. m.] Alejandro G. Smith: Esos proveedores suelen cobrar algo mensualmente
[2/12/25, 4:05:27 p. m.] Plataforma De Apuestas: Indicame
[2/12/25, 4:05:35 p. m.] Plataforma De Apuestas: Cobro suyo, cobro de las api
[2/12/25, 4:05:40 p. m.] Plataforma De Apuestas: Y que juegos
[2/12/25, 4:12:06 p. m.] Alejandro G. Smith: 1️⃣ Mi trabajo (frontend + Backend + integración)

Depende de si quieres un solo juego o varios:
	•	Un solo juego (Dominó): desde $200
	•	Plataforma con varios juegos: desde $470
(Incluye diseño completo, lobby, usuario, recargas, retiros, interfaz del juego y toda la integración visual)

⸻

2️⃣ Costo de las APIs (los juegos)

✔ Juegos profesionales (póker, slots, blackjack, casino):
Los proveedores cobran normalmente entre $50–150 al mes, dependiendo del catálogo y del país.
[2/12/25, 4:12:24 p. m.] Alejandro G. Smith: *Juegos disponibles para integrar*

Puedo integrar cualquiera de estos:
	•	Dominó
	•	Poker simple
	•	Blackjack
	•	Ruleta
	•	Slots (máquinas)
	•	Plinko / Aviator
	•	Juegos HTML5 estilo casino

Tú eliges cuántos quieres y armamos el presupuesto final.
[2/12/25, 4:13:07 p. m.] Alejandro G. Smith: Podemos desarrollar lo que sea que tengas en mente
[2/12/25, 4:13:28 p. m.] Plataforma De Apuestas: Domino y poker
[2/12/25, 4:13:32 p. m.] Plataforma De Apuestas: Y parley se puede?
[2/12/25, 4:13:41 p. m.] Plataforma De Apuestas: Caballos?
[2/12/25, 4:20:45 p. m.] Plataforma De Apuestas: A futuro
[2/12/25, 4:20:53 p. m.] Plataforma De Apuestas: Por si empezó solo con domino
[2/12/25, 4:21:06 p. m.] Alejandro G. Smith: Sí se puede incluir Parley, pero debo aclararte algo:
El módulo de apuestas deportivas es más complejo que dominó o póker, porque requiere manejar:
	•	cuotas
	•	partidos
	•	resultados
	•	slips de apuestas
	•	y cálculo de ganancias

Si prefieres, podemos empezar con Dominó + Poker, y el Parley dejarlo como fase 2, porque es la parte más avanzada del proyecto. ‎<Se editó este mensaje.>
[2/12/25, 4:21:19 p. m.] Alejandro G. Smith: Caballos también se puede pero sería igual de difícil que el parley
[2/12/25, 4:21:25 p. m.] Alejandro G. Smith: Pero sí que podemos
[2/12/25, 4:21:34 p. m.] Alejandro G. Smith: Quieres solo domino por ahora?
[2/12/25, 4:22:11 p. m.] Plataforma De Apuestas: Domino y poker
[2/12/25, 4:22:19 p. m.] Plataforma De Apuestas: Osea para empezar
[2/12/25, 4:22:24 p. m.] Plataforma De Apuestas: Api
[2/12/25, 4:22:46 p. m.] Alejandro G. Smith: Vale déjame comentarlo con mi compañero para ver si está de acuerdo con los precios y te digo hermano
[2/12/25, 4:22:59 p. m.] Alejandro G. Smith: Yo me encargo del front y el de el backend
[2/12/25, 4:23:13 p. m.] Alejandro G. Smith: Vale
[2/12/25, 4:23:33 p. m.] Plataforma De Apuestas: Dame precios de eso a ver que se hace
[2/12/25, 4:26:14 p. m.] Plataforma De Apuestas: De domino y poker
[2/12/25, 4:26:25 p. m.] Plataforma De Apuestas: Y de domino, poker, parley, caballos
[2/12/25, 4:28:14 p. m.] Alejandro G. Smith: Ok amigo, ahorita ando en el trabajo. Llegó a las 8pm a esa hora te envío los precios va?
[2/12/25, 4:28:24 p. m.] Plataforma De Apuestas: Quedo atento
[2/12/25, 4:37:00 p. m.] Alejandro G. Smith: Vale hermano
[2/12/25, 9:03:23 p. m.] Alejandro G. Smith: Así unos *320$*
[2/12/25, 9:04:06 p. m.] Alejandro G. Smith: Pero así 535$ porque un sistema de parley y caballos es mas complicado, más opciones y datos.
[2/12/25, 9:04:28 p. m.] Alejandro G. Smith: Tú me dices si comenzamos
[2/12/25, 9:04:35 p. m.] Plataforma De Apuestas: Métodos de pago
[2/12/25, 9:05:14 p. m.] Alejandro G. Smith: Binance Pay, Cryptos, Airtm, o por saldo de Forobeta, como quieras bro
[2/12/25, 9:05:38 p. m.] Alejandro G. Smith: Pagas cuando el proyecto esté listo
[2/12/25, 9:05:54 p. m.] Alejandro G. Smith: Aunque normalmente pido algo adelante para asegurar
[2/12/25, 9:06:41 p. m.] Alejandro G. Smith: Ah bueno puede ser por saldo retenido en *Forobeta*
[2/12/25, 9:06:44 p. m.] Alejandro G. Smith: Si, mejor
[2/12/25, 9:07:04 p. m.] Alejandro G. Smith: Solo liberas cuando te entregue el proyecto
[2/12/25, 9:09:48 p. m.] Alejandro G. Smith: *La plataforma completa incluye:*

✔ Dominó online
✔ Poker online
✔ Sistema de apuestas
✔ Billetera y saldo
✔ Depósitos y retiros
✔ Panel administrativo
✔ Juego en tiempo real
✔ Seguridad completa
✔ Diseño web profesional
✔ Usuarios y perfiles
✔ Historial de apuestas
✔ Logs del sistema

Todo funcionando integrado.
[2/12/25, 9:10:05 p. m.] Alejandro G. Smith: O quieres integrar todo el parley y caballos de una vez?
[2/12/25, 9:12:52 p. m.] Alejandro G. Smith: Si quieres explícame o muéstrame un ejemplo de cómo quieres que sea para tener una idea, o yo puedo hacerlo no hay problema después me dices que cambio.
[2/12/25, 9:13:59 p. m.] Plataforma De Apuestas: Echo lápiz y hablo con mi socio
[2/12/25, 9:14:27 p. m.] Plataforma De Apuestas: Se hoy tené que pagar api?
[2/12/25, 9:16:00 p. m.] Alejandro G. Smith: Vale si quieres que integramos otra cosa está bien podemos hacerlo
[2/12/25, 9:16:04 p. m.] Alejandro G. Smith: Como así bro?
[2/12/25, 9:16:43 p. m.] Plataforma De Apuestas: Poker Online
[2/12/25, 9:16:47 p. m.] Plataforma De Apuestas: Domino Online
[2/12/25, 9:17:31 p. m.] Alejandro G. Smith: Vale, *320$* entonces
[2/12/25, 9:17:55 p. m.] Alejandro G. Smith: Me dices a ver cuando quieres comenzar
[2/12/25, 9:18:22 p. m.] Plataforma De Apuestas: Y si se puede agregar lo otro después
[2/12/25, 9:18:32 p. m.] Alejandro G. Smith: Si amigo, lo que sea
[2/12/25, 9:18:36 p. m.] Alejandro G. Smith: Desarrollamos lo que sea
[2/12/25, 9:18:46 p. m.] Alejandro G. Smith: Quedará perfecto
[2/12/25, 9:18:53 p. m.] Alejandro G. Smith: Lo piensas, lo creamos
[2/12/25, 9:19:08 p. m.] Plataforma De Apuestas: A que horas puedo llamarte mañana
[2/12/25, 9:19:21 p. m.] Plataforma De Apuestas: Que hable con mi socio
[2/12/25, 9:20:06 p. m.] Alejandro G. Smith: Mañana en la tarde amigo
[2/12/25, 9:20:17 p. m.] Alejandro G. Smith: Suelo concretar solo por mensajes pero bueno
[2/12/25, 9:20:34 p. m.] Plataforma De Apuestas: Bueno
[2/12/25, 9:20:35 p. m.] Alejandro G. Smith: Que sería lo que quiere hablar amigo?
[2/12/25, 9:20:41 p. m.] Plataforma De Apuestas: O le escribo
[2/12/25, 9:20:45 p. m.] Plataforma De Apuestas: Y hablamos
‎[2/12/25, 9:20:58 p. m.] Alejandro G. Smith: ‎audio omitido
[2/12/25, 9:21:25 p. m.] Alejandro G. Smith: De qué parte de Venezuela es usted?
[2/12/25, 9:21:37 p. m.] Alejandro G. Smith: Yo de Anzoátegui
[2/12/25, 9:21:48 p. m.] Plataforma De Apuestas: Apure
[2/12/25, 9:22:03 p. m.] Alejandro G. Smith: Ah bueno estamos un poquito lejos
[2/12/25, 9:22:14 p. m.] Alejandro G. Smith: Me avisa entonces
[3/12/25, 9:51:09 a. m.] Plataforma De Apuestas: Bingo también me interesa
[3/12/25, 1:15:19 p. m.] Alejandro G. Smith: Buenas tardes amigo, entonces serían esos 3 juegos?
[3/12/25, 1:16:32 p. m.] Plataforma De Apuestas: Dime presupuesto para organizarme
[3/12/25, 1:24:12 p. m.] Alejandro G. Smith: Si es solo 1: Domino o Poker *250$*

Si son 2: *320$*

Si son 3: *390$*

Si son 4: *450$*

Puedes comenzar con poco e ir integrando uno por uno ‎<Se editó este mensaje.>
[3/12/25, 1:24:20 p. m.] Alejandro G. Smith: O como quieras bro
[3/12/25, 1:26:10 p. m.] Alejandro G. Smith: Juegos como parley y caballos donde los datos son muchos es un poquito más complicado pero claro que se puede
[3/12/25, 1:28:09 p. m.] Plataforma De Apuestas: Y este 3s completo?
[3/12/25, 1:29:28 p. m.] Alejandro G. Smith: Si, allí sería *535$* porque parley y caballos es un poco complicado
[3/12/25, 1:51:23 p. m.] Plataforma De Apuestas: Ando echando lapiz
[3/12/25, 1:51:32 p. m.] Plataforma De Apuestas: Porq ando buscando presupuesto en varias partes
[3/12/25, 2:00:45 p. m.] Alejandro G. Smith: Entiendo amigo, es un proyecto muy bueno al que puedes sacarle muchas más ganancias si sabes hacer las cosas
[3/12/25, 2:00:51 p. m.] Alejandro G. Smith: Publicidad, etc
[3/12/25, 2:01:06 p. m.] Plataforma De Apuestas: Si Claro
[3/12/25, 2:01:10 p. m.] Plataforma De Apuestas: Eso lo tengo claro
[3/12/25, 2:01:15 p. m.] Plataforma De Apuestas: Pero la inversión es larga
[3/12/25, 2:01:25 p. m.] Plataforma De Apuestas: Porq a mi me están haciendo otra página
[3/12/25, 2:01:29 p. m.] Plataforma De Apuestas: De tlf a crédito
[3/12/25, 2:01:37 p. m.] Plataforma De Apuestas: Tengo los 2 proyectos
[3/12/25, 2:02:01 p. m.] Plataforma De Apuestas: No si anclar en el otro y hacer 1 solo
[3/12/25, 2:02:05 p. m.] Plataforma De Apuestas: O por separado
[3/12/25, 2:02:13 p. m.] Alejandro G. Smith: Cuéntame de esa? Cuánto te cobraron por hacerla?
[3/12/25, 2:02:16 p. m.] Alejandro G. Smith: Entiendo
[3/12/25, 2:02:36 p. m.] Alejandro G. Smith: Si son completamente distintos es mejor separados
[3/12/25, 2:02:42 p. m.] Plataforma De Apuestas: Por una aplicación como cashea
[3/12/25, 2:02:46 p. m.] Plataforma De Apuestas: Me. Cobraron
[3/12/25, 2:03:46 p. m.] Alejandro G. Smith: Esa es relativamente fácil de programar, aunque si le pones automatizaciones, etc si puede aumentar la complejidad
[3/12/25, 2:03:55 p. m.] Alejandro G. Smith: Pero es mucho más sencilla que una de apuestas
[3/12/25, 2:04:05 p. m.] Alejandro G. Smith: 10 veces más sencilla
[3/12/25, 2:04:42 p. m.] Plataforma De Apuestas: A bueno imaginate
[3/12/25, 2:04:46 p. m.] Plataforma De Apuestas: Por una así cuanto cobras?
[3/12/25, 2:04:53 p. m.] Plataforma De Apuestas: Para ver si me estafaron
[3/12/25, 2:04:54 p. m.] Plataforma De Apuestas: Jaja
[3/12/25, 2:04:59 p. m.] Plataforma De Apuestas: Por eso busco y busco
[3/12/25, 2:05:39 p. m.] Plataforma De Apuestas: Me cobraron pa ser sincero 518 a bcv
[3/12/25, 2:05:47 p. m.] Plataforma De Apuestas: Página web y app
[3/12/25, 2:06:13 p. m.] Alejandro G. Smith: Si es sencilla unos 200$ - 230$ pero si tienes automatizaciones, etc.

350$ hasta 450$
[3/12/25, 2:06:17 p. m.] Plataforma De Apuestas: Pero aun no ha terminado 3l hombre
[3/12/25, 2:06:27 p. m.] Alejandro G. Smith: Bueno si te la está haciendo muy bien bien con automatizaciones y todo ‎<Se editó este mensaje.>
[3/12/25, 2:06:32 p. m.] Plataforma De Apuestas: Entonces no me robaron
[3/12/25, 2:06:33 p. m.] Alejandro G. Smith: No está mal
[3/12/25, 2:06:35 p. m.] Plataforma De Apuestas: Si con todo
[3/12/25, 2:06:40 p. m.] Plataforma De Apuestas: Panel admin
[3/12/25, 2:06:42 p. m.] Alejandro G. Smith: No no
[3/12/25, 2:06:50 p. m.] Plataforma De Apuestas: Panel de otras vainas
[3/12/25, 2:06:55 p. m.] Plataforma De Apuestas: Porq pienso expandir me
[3/12/25, 2:06:58 p. m.] Plataforma De Apuestas: Poco a poco
[3/12/25, 2:07:06 p. m.] Plataforma De Apuestas: Y lo bueno es que me cobro a bcv
[3/12/25, 2:07:13 p. m.] Plataforma De Apuestas: Y sacando las cuentas no estaba mal
[3/12/25, 2:07:18 p. m.] Alejandro G. Smith: Si si buenisimo
[3/12/25, 2:07:33 p. m.] Plataforma De Apuestas: Y también le consulte lo qye te consulte a ti
[3/12/25, 2:07:38 p. m.] Alejandro G. Smith: Yo no suelo cobrar a bcv  😬
[3/12/25, 2:07:42 p. m.] Plataforma De Apuestas: Pero no me ha entregado el otro
[3/12/25, 2:07:55 p. m.] Plataforma De Apuestas: Y eso es lo 1ue me tiene parado
[3/12/25, 2:08:11 p. m.] Alejandro G. Smith: Y que te dijo?
[3/12/25, 2:08:17 p. m.] Alejandro G. Smith: No le preguntaste cuando cobraba?
[3/12/25, 2:08:29 p. m.] Plataforma De Apuestas: Me dijo que si se podía hacer
[3/12/25, 2:09:04 p. m.] Alejandro G. Smith: Sí claro todo eso tiene que ir incluido
[3/12/25, 2:09:04 p. m.] Plataforma De Apuestas: Pero si me dijo que salía más o menos como en 700
[3/12/25, 2:09:23 p. m.] Plataforma De Apuestas: Pero como le meto otro proyecto si me tiene uno en marcha
[3/12/25, 2:09:25 p. m.] Alejandro G. Smith: Entiendo, si bueno cada quien tiene sus precios y su forma de trabajar
[3/12/25, 2:09:31 p. m.] Alejandro G. Smith: Exacto
[3/12/25, 2:09:31 p. m.] Plataforma De Apuestas: No Claro
[3/12/25, 2:09:41 p. m.] Plataforma De Apuestas: Y por eso no me quedo con una sola opinión
[3/12/25, 2:09:49 p. m.] Alejandro G. Smith: Si te entiedno
[3/12/25, 2:09:53 p. m.] Plataforma De Apuestas: Indago y trato de ser directo
[3/12/25, 2:10:01 p. m.] Alejandro G. Smith: Bueno siempre se puede llegar a un acuerdo
[3/12/25, 2:10:05 p. m.] Alejandro G. Smith: Claro
[3/12/25, 2:10:06 p. m.] Alejandro G. Smith: Así es
[3/12/25, 2:10:31 p. m.] Plataforma De Apuestas: Porq no me. Sirve de nada hacer perder el tiempo a la gente
[3/12/25, 2:10:49 p. m.] Alejandro G. Smith: Claro bro, también me gusta ser directo
[3/12/25, 2:10:51 p. m.] Alejandro G. Smith: Así es
[3/12/25, 2:11:36 p. m.] Plataforma De Apuestas: Odio 2 cosas
1. Ponerle precio a lo ajeno
2. Hacer perder el tiempo
[3/12/25, 2:12:51 p. m.] Plataforma De Apuestas: Que propones
[3/12/25, 2:17:25 p. m.] Alejandro G. Smith: Me refiero a que si encuentras una muy buena propuesta con alguien más, vienes y lo conversas conmigo a ver si podemos darte un mejor precio que los demás ‎<Se editó este mensaje.>
[3/12/25, 2:17:48 p. m.] Alejandro G. Smith: Porque de trabajo profesional ya lo hacemos 🙌🏻
[3/12/25, 2:18:07 p. m.] Alejandro G. Smith: Juegos NFT incluso llegué a programar
[3/12/25, 2:18:17 p. m.] Alejandro G. Smith: Pero no llegue a ponerlo en el portafolio
[3/12/25, 2:18:38 p. m.] Alejandro G. Smith: Son juegos donde la gente  invierte dinero de por medio
[3/12/25, 2:21:37 p. m.] Plataforma De Apuestas: Eso es vdd
[3/12/25, 2:21:50 p. m.] Plataforma De Apuestas: Hazme una propuesta
[3/12/25, 2:21:53 p. m.] Plataforma De Apuestas: Y la hablamos
[3/12/25, 2:21:56 p. m.] Plataforma De Apuestas: El. Proyecto va
[3/12/25, 2:48:55 p. m.] Alejandro G. Smith: Déjame ver amigo
[3/12/25, 2:53:13 p. m.] Plataforma De Apuestas: Si va
[3/12/25, 2:53:17 p. m.] Plataforma De Apuestas: Quedo atento
[3/12/25, 2:53:23 p. m.] Plataforma De Apuestas: Porq al parecer le daré yo solo
[3/12/25, 2:56:42 p. m.] Alejandro G. Smith: Vale amigo mira te puedo integrar todos estos:

• Dominó
• ⁠Poker
• ⁠Bingo
• ⁠Parley
• ⁠Caballos

Por *480$*
[3/12/25, 2:56:52 p. m.] Alejandro G. Smith: O prefieres comenzar con menos?
[3/12/25, 2:56:57 p. m.] Alejandro G. Smith: Con un juego y así
[3/12/25, 4:19:14 p. m.] Plataforma De Apuestas: Una pregunta
[3/12/25, 4:19:32 p. m.] Plataforma De Apuestas: Que tiempo de entrega manejas?
[3/12/25, 4:50:32 p. m.] Alejandro G. Smith: Aproximadamente 10 días terminamos esa
[3/12/25, 4:50:45 p. m.] Alejandro G. Smith: Pero varía aveces
[4/12/25, 8:39:44 p. m.] Plataforma De Apuestas: Epale
[4/12/25, 8:39:58 p. m.] Plataforma De Apuestas: Una pregunta
[4/12/25, 8:40:08 p. m.] Plataforma De Apuestas: Quiero una app solo con pollas hipicas
[4/12/25, 8:43:18 p. m.] Alejandro G. Smith: Como pollas hípicas no entiendo amigo
[4/12/25, 8:43:49 p. m.] Plataforma De Apuestas: Es carreras de caballos
[4/12/25, 8:43:54 p. m.] Plataforma De Apuestas: Pero que sea solo de pollas
[4/12/25, 8:43:58 p. m.] Plataforma De Apuestas: Así mismo más o menos
[4/12/25, 8:52:05 p. m.] Alejandro G. Smith: De qué no se es que es pollas pero ya investigo
‎[4/12/25, 8:55:32 p. m.] Plataforma De Apuestas: ‎audio omitido
‎[4/12/25, 9:03:38 p. m.] Plataforma De Apuestas: ‎audio omitido
‎[4/12/25, 9:03:51 p. m.] Plataforma De Apuestas: ‎audio omitido
‎[4/12/25, 9:04:10 p. m.] Plataforma De Apuestas: ‎audio omitido
‎[4/12/25, 9:04:22 p. m.] Plataforma De Apuestas: ‎audio omitido
[5/12/25, 2:35:32 p. m.] Alejandro G. Smith: Ok amigo entiendo, pero entonces vas a querer 2 aplicaciones diferentes o como?
[5/12/25, 2:35:42 p. m.] Alejandro G. Smith: O una sola de pollas hípicas?
[5/12/25, 2:51:28 p. m.] Plataforma De Apuestas: Precio de esta
[5/12/25, 2:51:29 p. m.] Plataforma De Apuestas: A ver
[5/12/25, 4:10:11 p. m.] Alejandro G. Smith: Quieres que las carreras sean reales o simuladas?
[5/12/25, 4:10:23 p. m.] Alejandro G. Smith: Y es necesario que se vea la carrera visualmente?
[5/12/25, 4:10:58 p. m.] Alejandro G. Smith: Como elijas esas cosas influye mucho en el precio
[5/12/25, 4:12:25 p. m.] Plataforma De Apuestas: Te explico
[5/12/25, 4:13:11 p. m.] Plataforma De Apuestas: Yo como jugador
[5/12/25, 4:13:20 p. m.] Plataforma De Apuestas: Meto datos de ingreso
[5/12/25, 4:13:41 p. m.] Plataforma De Apuestas: Recargo saldo para jugar una pilla
[5/12/25, 4:13:42 p. m.] Plataforma De Apuestas: Polla
[5/12/25, 4:13:59 p. m.] Plataforma De Apuestas: En la página me aparecen las carreras que están disponibles para combinar
[5/12/25, 4:14:13 p. m.] Plataforma De Apuestas: Yo agarro 6, 12 o más caballos qué me gusten
[5/12/25, 4:14:22 p. m.] Plataforma De Apuestas: Ya sea individual o combinada
[5/12/25, 4:14:25 p. m.] Plataforma De Apuestas: Y sello
[5/12/25, 4:14:43 p. m.] Plataforma De Apuestas: Los puntos se asignan de la siguiente manera
[5/12/25, 4:14:54 p. m.] Plataforma De Apuestas: 1. 5 ptos
2. 3 ptos
3. 1 pto
[5/12/25, 4:14:57 p. m.] Plataforma De Apuestas: Al final del día
[5/12/25, 4:15:07 p. m.] Plataforma De Apuestas: Si de esas 6 carreras
[5/12/25, 4:15:34 p. m.] Plataforma De Apuestas: Quedaron
1. 4to
2. 1ro
3. 6to
4. 1ro
5. 1ro
6. 1ro
[5/12/25, 4:15:43 p. m.] Plataforma De Apuestas: Sumaria 20 ptos
[5/12/25, 6:01:15 p. m.] Alejandro G. Smith: Entiendo, no quieres que se vea una carrera visual?
[5/12/25, 6:01:25 p. m.] Alejandro G. Smith: Solamente que apuesten y todo el sistema?
[5/12/25, 7:01:46 p. m.] Plataforma De Apuestas: Correcto
[5/12/25, 9:49:29 p. m.] Alejandro G. Smith: Vale pues si es solamente de eso *250$*
[5/12/25, 9:50:21 p. m.] Alejandro G. Smith: Se me hace un poco más difícil que Domino y Poker pero igual se puede
[5/12/25, 10:24:22 p. m.] Plataforma De Apuestas: Ok
[5/12/25, 10:28:02 p. m.] Alejandro G. Smith: Cuando comenzamos?
[6/12/25, 4:13:48 p. m.] Plataforma De Apuestas: Estoy en eso veo
[6/12/25, 4:13:56 p. m.] Plataforma De Apuestas: Bro
‎[6/12/25, 4:59:19 p. m.] Plataforma De Apuestas: ‎imagen omitida
[10/12/25, 8:58:41 p. m.] Plataforma De Apuestas: Háblame mi pana
[10/12/25, 8:58:46 p. m.] Plataforma De Apuestas: Estaba por escribirte
[10/12/25, 9:01:09 p. m.] Alejandro G. Smith: Buenas noches amigo, cuéntame
[10/12/25, 9:04:32 p. m.] Plataforma De Apuestas: Todo bien?
[10/12/25, 9:04:38 p. m.] Plataforma De Apuestas: Hoy me. Reuní con el pana
[10/12/25, 9:04:49 p. m.] Plataforma De Apuestas: Le pase los juegos que se pueden poner y ese tipo de cosas
[10/12/25, 9:15:14 p. m.] Alejandro G. Smith: Entiendo amigo
[10/12/25, 9:17:04 p. m.] Alejandro G. Smith: Y en qué quedaron?
[10/12/25, 9:22:37 p. m.] Plataforma De Apuestas: Ps ahí vamos
[10/12/25, 9:22:50 p. m.] Plataforma De Apuestas: Porq me iba a lanzar solo
[10/12/25, 9:22:58 p. m.] Plataforma De Apuestas: Pero en sociedad mejor
[10/12/25, 9:33:13 p. m.] Alejandro G. Smith: Claro, siempre es mejor en conjunto
[10/12/25, 9:33:32 p. m.] Alejandro G. Smith: Para que tenga éxito
[10/12/25, 9:33:43 p. m.] Plataforma De Apuestas: Si Claro
[10/12/25, 9:33:49 p. m.] Plataforma De Apuestas: Ya le. Pase toda la inf
[10/12/25, 9:55:48 p. m.] Alejandro G. Smith: Ok amigo me avisas
[17/12/25, 9:12:44 a. m.] Plataforma De Apuestas: Buenos días amigo
[17/12/25, 9:12:48 a. m.] Plataforma De Apuestas: Como es el método de pago?
[17/12/25, 12:21:26 p. m.] Alejandro G. Smith: Saludos amigo, puede ser por Binance o el mismo Forobeta
[17/12/25, 12:21:44 p. m.] Alejandro G. Smith: Sería mitad al comenzar y la otra mitad al terminar, sería lo óptimo
[17/12/25, 1:10:15 p. m.] Alejandro G. Smith: Podríamos por algún banco de Venezuela o pago móvil pero lo que pasa es que a BCV no trabajamos 🥺
[17/12/25, 1:10:43 p. m.] Plataforma De Apuestas: A colo recibes
[17/12/25, 1:10:58 p. m.] Plataforma De Apuestas: Como apareces en foro?
[17/12/25, 1:20:48 p. m.] Alejandro G. Smith: Sería unos puntos por debajo de Binance bro tendría que ver la tasa ese día
‎[17/12/25, 1:21:40 p. m.] Alejandro G. Smith: Salgo como: dubra1 ‎imagen omitida
[17/12/25, 1:25:27 p. m.] Plataforma De Apuestas: Unos puntos cuantos
[17/12/25, 1:25:40 p. m.] Plataforma De Apuestas: Escríbeme
[17/12/25, 1:34:56 p. m.] Alejandro G. Smith: Por ejemplo si está en 444 en Binance redondo 440 y ya
[17/12/25, 1:35:12 p. m.] Alejandro G. Smith: Como sales tú en Forobeta amigo
[17/12/25, 1:35:22 p. m.] Plataforma De Apuestas: Pecar866
[17/12/25, 1:37:21 p. m.] Alejandro G. Smith: Allí te acabo de escribir bro
[17/12/25, 1:55:16 p. m.] Plataforma De Apuestas: Hay un detalle mano
[17/12/25, 1:55:20 p. m.] Plataforma De Apuestas: Que si no me gusta
[17/12/25, 1:55:28 p. m.] Plataforma De Apuestas: Es la antigüedad en el foro
[17/12/25, 2:03:20 p. m.] Alejandro G. Smith: Si bro, sé que soy nuevo en el foro, pero ya he echo muchos trabajos fuera del foro y quiero agarrar buena reputación en el foro
[17/12/25, 2:03:35 p. m.] Alejandro G. Smith: Además por eso puse que acepto pago con saldo retenido con forobeta
[17/12/25, 2:03:47 p. m.] Alejandro G. Smith: Es decir hasta que no termine el proyecto completo no liberas
[17/12/25, 2:03:56 p. m.] Alejandro G. Smith: Hasta que lo tengas en tus manos
[17/12/25, 2:04:30 p. m.] Alejandro G. Smith: Y si tuviera mala intención no aceptara pagos en bs a mi cuenta ni siquiera 😅
[17/12/25, 2:05:16 p. m.] Plataforma De Apuestas: Si Claro
[17/12/25, 2:05:21 p. m.] Alejandro G. Smith: Podría mostrarme y todo
[17/12/25, 2:05:24 p. m.] Alejandro G. Smith: No hay problema
[17/12/25, 2:05:25 p. m.] Plataforma De Apuestas: No he dicho que tengas mala intensión
[17/12/25, 2:05:41 p. m.] Plataforma De Apuestas: Solo dije que no me gustaba la antigüedad en el foro
[17/12/25, 2:05:49 p. m.] Alejandro G. Smith: Entiendo
[17/12/25, 2:05:58 p. m.] Alejandro G. Smith: Solo es porque recién conocí la plataforma
[17/12/25, 2:06:39 p. m.] Alejandro G. Smith: Pero puedes ver mis trabajos también
[17/12/25, 2:07:17 p. m.] Alejandro G. Smith: Actualice el portafolio
[17/12/25, 2:07:40 p. m.] Alejandro G. Smith: Hay otros proyectos que he echo que no he puesto allí también
[17/12/25, 2:08:14 p. m.] Plataforma De Apuestas: Te comento lo siguiente y con eso no quiero decir que seas igual
[17/12/25, 2:08:22 p. m.] Plataforma De Apuestas: Ya me robaron una vez por ahí
[17/12/25, 2:08:27 p. m.] Plataforma De Apuestas: Con unas cuentas de Netflix
[17/12/25, 2:08:45 p. m.] Alejandro G. Smith: 😬 y tenía buena reputación?
[17/12/25, 2:08:53 p. m.] Plataforma De Apuestas: Demás
[17/12/25, 2:08:56 p. m.] Plataforma De Apuestas: De buena
[17/12/25, 2:09:04 p. m.] Plataforma De Apuestas: Pero se dio a la fuga con varios
[17/12/25, 2:09:08 p. m.] Plataforma De Apuestas: A mi me robo 350
[17/12/25, 2:09:12 p. m.] Plataforma De Apuestas: Imaginate
[17/12/25, 2:09:26 p. m.] Alejandro G. Smith: Entiendo claro ya sé porque tú miedo
[17/12/25, 2:09:43 p. m.] Alejandro G. Smith: Bueno te propongo que hasta que no tengas el proyecto en tus manos no liberas
[17/12/25, 2:09:51 p. m.] Alejandro G. Smith: Así si no corres ningún riesgo
[17/12/25, 2:09:57 p. m.] Plataforma De Apuestas: Es que yo no meto saldo en el foro
[17/12/25, 2:10:06 p. m.] Alejandro G. Smith: Porque bro?
[17/12/25, 2:10:31 p. m.] Alejandro G. Smith: Yo lo he echo comprando así y me parece muy seguro
[17/12/25, 2:10:32 p. m.] Plataforma De Apuestas: Solo cuando pago la suscripción del vip
[17/12/25, 2:11:16 p. m.] Alejandro G. Smith: Otra forma no sé cuál sería
[17/12/25, 2:11:23 p. m.] Alejandro G. Smith: La idea es que sea segura para ambos
[17/12/25, 2:11:46 p. m.] Alejandro G. Smith: Con saldo retenido en el foro me parecía segura para ambos
[17/12/25, 2:11:48 p. m.] Plataforma De Apuestas: Ps la vdd seguro es lo que está en manos de uno
[17/12/25, 2:11:52 p. m.] Plataforma De Apuestas: En este caso
[17/12/25, 2:12:03 p. m.] Plataforma De Apuestas: El acceso a la página la tiene ud
[17/12/25, 2:12:10 p. m.] Plataforma De Apuestas: El acceso a la programación igual
[17/12/25, 2:13:46 p. m.] Alejandro G. Smith: Claro yo tengo la habilidad y usted el dinero
[17/12/25, 2:13:49 p. m.] Alejandro G. Smith: Como todo
[17/12/25, 2:13:56 p. m.] Plataforma De Apuestas: Es correcto
[17/12/25, 2:13:56 p. m.] Alejandro G. Smith: Pero no sé cómo haríamos alli
[17/12/25, 2:14:08 p. m.] Plataforma De Apuestas: Después que alaga la plata como la retorno si pasa algo?
[17/12/25, 2:14:17 p. m.] Plataforma De Apuestas: En cambio ud tiene todo bajo control
[17/12/25, 2:14:20 p. m.] Plataforma De Apuestas: La idea es trabajar
[17/12/25, 2:14:33 p. m.] Plataforma De Apuestas: Las api que precio tienen?
[17/12/25, 2:14:38 p. m.] Plataforma De Apuestas: Es lo que no me haz dicho
[17/12/25, 2:22:09 p. m.] Alejandro G. Smith: No existe una API específica para “pollas de caballos”.
Las APIs que existen son de carreras hípicas reales en tiempo real, pensadas para casas de apuestas grandes, no para sistemas de puntos como el tuyo.

Para este proyecto no es necesario usar ninguna API externa, el sistema se puede construir completamente con backend propio desde 0.
[17/12/25, 2:22:41 p. m.] Alejandro G. Smith: *VENTAJAS*

✔️ Proyecto más barato
✔️ Menos problemas técnicos
✔️ Más rápido de hacer
✔️ Más control
[17/12/25, 2:23:14 p. m.] Alejandro G. Smith: Por eso digo que por saldo retenido en Forobeta sería buenísimo
[17/12/25, 2:24:18 p. m.] Alejandro G. Smith: Pero la verdad sin ninguna seguridad de pago no comienzo a trabajar, más que nada por no perder el tiempo, ya que hay más proyectos que hacer
[17/12/25, 2:37:23 p. m.] Plataforma De Apuestas: Amigo
[17/12/25, 2:37:30 p. m.] Plataforma De Apuestas: Se supone que el interesado soy yo
[17/12/25, 2:37:37 p. m.] Plataforma De Apuestas: Y no es la primera que ando sacando
‎[17/12/25, 2:38:16 p. m.] Plataforma De Apuestas: ‎imagen omitida
[17/12/25, 2:41:24 p. m.] Plataforma De Apuestas: A este le di un adelanto de 200$
[17/12/25, 2:41:35 p. m.] Plataforma De Apuestas: Y debió entregar a principio de noviembre
[17/12/25, 2:41:38 p. m.] Plataforma De Apuestas: Y mira donde vamos
[17/12/25, 2:47:24 p. m.] Alejandro G. Smith: Claro, allí al tú enviar el no se enfoca en terminar porque ya le pagaste adelante
[17/12/25, 2:47:53 p. m.] Alejandro G. Smith: Por eso te digo que *Saldo retenido*
[17/12/25, 2:48:07 p. m.] Alejandro G. Smith: No liberas hasta que tengas el proyecto a tu nombre
[17/12/25, 2:48:48 p. m.] Plataforma De Apuestas: Déjame pensarlo y hablamos
[17/12/25, 2:49:57 p. m.] Plataforma De Apuestas: Se puede ir integrando poco a poco?
[17/12/25, 2:54:08 p. m.] Alejandro G. Smith: Está bien amigo
[17/12/25, 2:54:26 p. m.] Alejandro G. Smith: Sí claro todo eso es posible
[17/12/25, 2:54:48 p. m.] Plataforma De Apuestas: Ajá pero el precio sería ese o mayor?
[17/12/25, 2:56:18 p. m.] Alejandro G. Smith: Ese precio quedamos en que era solo de las pollas hípicas
[17/12/25, 2:56:47 p. m.] Alejandro G. Smith: Si agregamos otros juegos, etc. sería precio extra
[17/12/25, 2:57:23 p. m.] Alejandro G. Smith: Pero puedes ir metiéndole cosas poco a poco, en cuanto vayas capitalizándote
[17/12/25, 3:05:58 p. m.] Plataforma De Apuestas: Vale amigo mira te puedo integrar todos estos:

• Dominó
• ⁠Poker
• ⁠Bingo
• ⁠Parley
• ⁠Caballos

Por *480$*
[17/12/25, 3:06:03 p. m.] Plataforma De Apuestas: Habló de esto
[17/12/25, 3:08:22 p. m.] Alejandro G. Smith: Ah vale, si es así te dejo todo eso por ese precio
[17/12/25, 3:08:23 p. m.] Alejandro G. Smith: Si
[17/12/25, 3:13:03 p. m.] Plataforma De Apuestas: Mano con respecto al domino y poker en vivo
[17/12/25, 3:13:06 p. m.] Plataforma De Apuestas: Y bingo
[17/12/25, 3:13:09 p. m.] Plataforma De Apuestas: Es con apis?
[17/12/25, 4:38:58 p. m.] Alejandro G. Smith: Si vas a pagar APIs con proveedores externos te va a salir más caro porque vas a tener que pagar miles de dólares a los proveedores.

Si quieres te investigo cuánto cobran esas APIs de los proveedores actualmente
[17/12/25, 4:39:23 p. m.] Alejandro G. Smith: Yo te estoy ofreciendo crear todos los juegos + backend completo para que sea juego en vivo
[17/12/25, 4:39:43 p. m.] Alejandro G. Smith: Es decir todo eso por ese precio que te estoy dando, prácticamente es un regalo.
[17/12/25, 4:39:50 p. m.] Alejandro G. Smith: Pregunta a quien sea a ver si te da esos precios
[17/12/25, 4:40:05 p. m.] Alejandro G. Smith: Ahorita porque estoy comenzando y quiero buenas calificaciones en el foro sinceramente
[17/12/25, 4:40:46 p. m.] Alejandro G. Smith: Y así te sale más económico incluso porque no vas a tener que pagar mensualidad a los proveedores y te da total libertad para modificaciones
[17/12/25, 4:58:30 p. m.] Plataforma De Apuestas: Eso es lo que no he entendido mano
[17/12/25, 4:58:39 p. m.] Plataforma De Apuestas: Pero tu sabes el. Idioma en el que hablas
[17/12/25, 4:58:46 p. m.] Plataforma De Apuestas: Ahí no puedo yo hablar de nada
[17/12/25, 5:08:27 p. m.] Alejandro G. Smith: Bueno mi bro, te estoy ofreciendo algo que obviamente te conviene más, yendo a lo más económico siempre
[17/12/25, 5:08:34 p. m.] Alejandro G. Smith: Para que no dependas de proveedores externos
[17/12/25, 5:08:39 p. m.] Alejandro G. Smith: Sino que tengas el control total
[17/12/25, 11:23:42 p. m.] Plataforma De Apuestas: Ese golpe me gusta
[17/12/25, 11:23:48 p. m.] Plataforma De Apuestas: Pero quisiera despejar más duda
[17/12/25, 11:23:55 p. m.] Plataforma De Apuestas: Para que todo quede claro
[17/12/25, 11:51:28 p. m.] Alejandro G. Smith: Que dudas tienes amigo? ‎<Se editó este mensaje.>
[17/12/25, 11:58:58 p. m.] Plataforma De Apuestas: Has visto la página de domino vamos?
[18/12/25, 12:30:16 a. m.] Alejandro G. Smith: Cuál es esa? No amigo
[18/12/25, 6:00:30 a. m.] Plataforma De Apuestas: Mirala en la play store
[18/12/25, 6:00:34 a. m.] Plataforma De Apuestas: Y me comentas
[18/12/25, 6:42:16 a. m.] Alejandro G. Smith: Está en AppStore?
[18/12/25, 6:42:22 a. m.] Alejandro G. Smith: No tengo Android
[18/12/25, 6:42:28 a. m.] Alejandro G. Smith: Déjame ver si esta
‎[18/12/25, 6:42:58 a. m.] Alejandro G. Smith: Alguno de esos? ‎imagen omitida
[18/12/25, 8:05:06 a. m.] Plataforma De Apuestas: No
[18/12/25, 8:06:58 a. m.] Alejandro G. Smith: No me sale en iPhone bro
[18/12/25, 8:20:12 a. m.] Plataforma De Apuestas: Bueno
[18/12/25, 8:20:26 a. m.] Plataforma De Apuestas: Tendrías que verlo y así ver
[18/12/25, 8:20:36 a. m.] Plataforma De Apuestas: El porq o como se maneja
[18/12/25, 8:20:42 a. m.] Plataforma De Apuestas: Yo de eso no se nada manito
[18/12/25, 8:21:13 a. m.] Alejandro G. Smith: Quieres que el domino sea igual a ese que me dijiste?
[18/12/25, 8:24:16 a. m.] Plataforma De Apuestas: Igual igual no
[18/12/25, 8:24:22 a. m.] Plataforma De Apuestas: Pero ud es el que sabe el trabajo
[18/12/25, 8:24:31 a. m.] Plataforma De Apuestas: Porq quisiera una idea de como va a ser
[18/12/25, 8:38:28 a. m.] Alejandro G. Smith: Ah claro amigo pero es difícil mostrar rápido así, pero de qué va a quedar cómo quieres, va a quedar
[18/12/25, 8:38:46 a. m.] Alejandro G. Smith: Porque yo te voy mostrando y tú me vas diciendo para crearla detalladamente a tu gusto
[18/12/25, 8:38:58 a. m.] Plataforma De Apuestas: Ese coñazo si me gustó
[18/12/25, 8:49:23 a. m.] Alejandro G. Smith: Jaja si amigo
[18/12/25, 9:14:20 a. m.] Plataforma De Apuestas: Con respecto a caballos, me gusta mucho la que esta en sellatuparley
[18/12/25, 9:14:40 a. m.] Plataforma De Apuestas: Y el bingo me gusta mucho el de apuestas royal
[18/12/25, 9:14:51 a. m.] Alejandro G. Smith: Sellaruparley es una página? O una app?
[18/12/25, 9:15:19 a. m.] Plataforma De Apuestas: Página
[18/12/25, 9:15:31 a. m.] Plataforma De Apuestas: Lo tuyo es página web y app
[18/12/25, 9:15:33 a. m.] Plataforma De Apuestas: O app
[18/12/25, 9:15:35 a. m.] Plataforma De Apuestas: O pagina
[18/12/25, 9:24:07 a. m.] Alejandro G. Smith: No, me refiero a como la consigo para verla
[18/12/25, 9:24:15 a. m.] Alejandro G. Smith: Bueno tranquilo yo la busco
[18/12/25, 9:24:24 a. m.] Alejandro G. Smith: Lo que yo te haré es una webapp
[18/12/25, 9:24:37 a. m.] Alejandro G. Smith: Web pero que se pueda adaptar a celular también
[18/12/25, 9:24:41 a. m.] Alejandro G. Smith: Así es que quieres no?
[18/12/25, 9:41:41 a. m.] Plataforma De Apuestas: Página
[18/12/25, 9:41:48 a. m.] Plataforma De Apuestas: Si
[18/12/25, 9:41:53 a. m.] Plataforma De Apuestas: Porq la gente busca app
[18/12/25, 10:26:58 a. m.] Alejandro G. Smith: Vale hermano más tarde me pongo a ver todo eso, no he dormido nada. Voy a descansar jaja
[18/12/25, 10:28:27 a. m.] Plataforma De Apuestas: Dale si va
[21/12/25, 2:42:30 p. m.] Plataforma De Apuestas: Mano
[21/12/25, 5:12:19 p. m.] Alejandro G. Smith: Cuéntame hermano
[21/12/25, 5:27:01 p. m.] Plataforma De Apuestas: Viste la broma?
[22/12/25, 12:19:43 p. m.] Alejandro G. Smith: Hermano si
[22/12/25, 12:19:54 p. m.] Alejandro G. Smith: Podemos hacer algo parecido, si
[24/12/25, 11:48:16 p. m.] Plataforma De Apuestas: A listo
[24/12/25, 11:48:25 p. m.] Plataforma De Apuestas: El 26 vamos viendo que haremos
[24/12/25, 11:48:28 p. m.] Plataforma De Apuestas: Déjame el binance
[24/12/25, 11:48:34 p. m.] Plataforma De Apuestas: Pa ir mandando
[25/12/25, 1:44:21 a. m.] Alejandro G. Smith: Perfecto
[25/12/25, 1:45:19 a. m.] Alejandro G. Smith: *Binance ID* - *Sailet*
527832461
[25/12/25, 1:45:29 a. m.] Alejandro G. Smith: A ese recibo mi bro
[25/12/25, 1:45:45 a. m.] Plataforma De Apuestas: Eso va
[25/12/25, 1:45:53 a. m.] Plataforma De Apuestas: ‎Plataforma De Apuestas fijó un mensaje.
[25/12/25, 1:49:06 a. m.] Alejandro G. Smith: Excelente cuando usted quiera arrancamos 🫡 ‎<Se editó este mensaje.>
[25/12/25, 1:51:02 a. m.] Plataforma De Apuestas: Lo más probable es que sea para enero
[25/12/25, 1:51:13 a. m.] Plataforma De Apuestas: Pero ya esta hablado, el negocio va
[25/12/25, 1:51:37 a. m.] Alejandro G. Smith: Perfecto amigo
[25/12/25, 1:51:40 a. m.] Alejandro G. Smith: Está bien
[25/12/25, 1:51:57 a. m.] Alejandro G. Smith: Ahorita estoy haciendo una para un cliente, estilo WhatsApp pero con marketplace integrado ‎<Se editó este mensaje.>
[25/12/25, 1:52:04 a. m.] Alejandro G. Smith: Para que compren en su tienda
[25/12/25, 1:52:05 a. m.] Alejandro G. Smith: Mira
[25/12/25, 1:52:19 a. m.] Alejandro G. Smith: https://chat-prueba-ebon.vercel.app
[25/12/25, 1:52:28 a. m.] Alejandro G. Smith: Todavía no está terminada
[25/12/25, 1:52:39 a. m.] Alejandro G. Smith: Pero al terminarse se va a lanzar en Google Play y todo
[25/12/25, 1:53:02 a. m.] Alejandro G. Smith: Cobramos 700€ por esa
[25/12/25, 1:53:26 a. m.] Alejandro G. Smith: Y después de esa tengo programada otra app para otro cliente que quiere una estilo Netflix
[25/12/25, 1:53:31 a. m.] Alejandro G. Smith: Para películas y series
[25/12/25, 1:56:28 a. m.] Plataforma De Apuestas: Esta si me interesa amigo
[25/12/25, 1:56:35 a. m.] Plataforma De Apuestas: Tu me vas es a quebrar jaja
[25/12/25, 1:56:39 a. m.] Plataforma De Apuestas: Deja de darme ideas
[25/12/25, 1:57:31 a. m.] Plataforma De Apuestas: Podes hacer algo como netflix?
[25/12/25, 1:57:38 a. m.] Plataforma De Apuestas: Donde se pueda recargar por créditos
[25/12/25, 1:57:44 a. m.] Plataforma De Apuestas: Y eso lo asigne un panel
[25/12/25, 1:58:00 a. m.] Plataforma De Apuestas: Que el panel super
[25/12/25, 1:58:07 a. m.] Plataforma De Apuestas: Cree perfiles admin
[25/12/25, 1:58:10 a. m.] Plataforma De Apuestas: Para vendedores
[25/12/25, 1:58:28 a. m.] Plataforma De Apuestas: Y que la app no jale tanto Internet
[25/12/25, 1:58:37 a. m.] Alejandro G. Smith: Completamente, si
[25/12/25, 1:58:44 a. m.] Alejandro G. Smith: Jajajaja
[25/12/25, 1:58:56 a. m.] Alejandro G. Smith: Si se puede
[25/12/25, 1:59:01 a. m.] Plataforma De Apuestas: Ajá
[25/12/25, 1:59:06 a. m.] Plataforma De Apuestas: De cuanto estamos hablando
[25/12/25, 1:59:13 a. m.] Plataforma De Apuestas: Dichas películas que se verán ahí
[25/12/25, 1:59:23 a. m.] Alejandro G. Smith: Si amigo, se puede
[25/12/25, 1:59:23 a. m.] Plataforma De Apuestas: Deben ser de Netflix, Disney, Amazon
[25/12/25, 1:59:26 a. m.] Plataforma De Apuestas: Entre otras
[25/12/25, 1:59:32 a. m.] Alejandro G. Smith: También, si se comprimen los videos
[25/12/25, 2:00:02 a. m.] Plataforma De Apuestas: Ps yo tengo años vendiendo Netflix y estoy empapado más en ese tema
[25/12/25, 2:00:05 a. m.] Plataforma De Apuestas: Explicame más
[25/12/25, 2:00:12 a. m.] Plataforma De Apuestas: Si tenes tiempo cabe destacar
[25/12/25, 2:00:26 a. m.] Alejandro G. Smith: Mañana hablamos ese tema bien, en este momento voy a dormir bro
[25/12/25, 2:00:35 a. m.] Alejandro G. Smith: Uff mejor aun
[25/12/25, 2:00:47 a. m.] Plataforma De Apuestas: Hágale eso va
[25/12/25, 2:00:55 a. m.] Plataforma De Apuestas: Ps 5 años vendiendo streaming
[25/12/25, 2:01:08 a. m.] Plataforma De Apuestas: Clientes y vendedores de sobra hay
[25/12/25, 2:01:18 a. m.] Alejandro G. Smith: Cómo te va con eso? Bien?
[25/12/25, 2:01:26 a. m.] Plataforma De Apuestas: Si deja
[25/12/25, 2:01:40 a. m.] Plataforma De Apuestas: El 2024 me dejo una casa, carro y unas cuantas motos
[25/12/25, 2:01:49 a. m.] Plataforma De Apuestas: Ya gracias a eso no pago alquiler
[25/12/25, 2:01:52 a. m.] Plataforma De Apuestas: Ni transporte
[25/12/25, 2:01:56 a. m.] Alejandro G. Smith: Demasiado bueno
[25/12/25, 2:02:06 a. m.] Plataforma De Apuestas: Si querés hablamos de negocios
[25/12/25, 2:02:13 a. m.] Alejandro G. Smith: Me imagino que haces clientes con publicidad paga
[25/12/25, 2:02:17 a. m.] Alejandro G. Smith: Facebook ads y demas
[25/12/25, 2:02:23 a. m.] Plataforma De Apuestas: Si supieras que no
[25/12/25, 2:02:24 a. m.] Alejandro G. Smith: Meta
[25/12/25, 2:02:27 a. m.] Plataforma De Apuestas: Fueron a pulso
[25/12/25, 2:02:32 a. m.] Alejandro G. Smith: Dios
[25/12/25, 2:02:36 a. m.] Alejandro G. Smith: Imagínate con publicidad
[25/12/25, 2:02:52 a. m.] Plataforma De Apuestas: Más o. Menos un sistema de esos en cuanto esta?
[25/12/25, 2:03:10 a. m.] Alejandro G. Smith: Simple o completo?
[25/12/25, 2:03:17 a. m.] Alejandro G. Smith: Es que depende de muchos factores y funciones
[25/12/25, 2:03:19 a. m.] Plataforma De Apuestas: Dame ambos y beneficios
[25/12/25, 2:03:28 a. m.] Plataforma De Apuestas: De esos si te entiendo yo
[25/12/25, 2:03:46 a. m.] Plataforma De Apuestas: Con lo otro es una aventura que me voy a tirar
[25/12/25, 2:06:56 a. m.] Alejandro G. Smith: También depende de cuanta cantidad de películas y series tenga porque se debe pagar un servidor de almacenamiento donde se almacenan esos videos
[25/12/25, 2:07:05 a. m.] Alejandro G. Smith: Mañana saco bien cuentas
[25/12/25, 2:07:07 a. m.] Alejandro G. Smith: Y te digo
[25/12/25, 2:07:16 a. m.] Alejandro G. Smith: Cobro por debajo de todos
[25/12/25, 2:07:33 a. m.] Alejandro G. Smith: Así que verás los precios más accesibles para ese tipo de cosas
[25/12/25, 2:07:59 a. m.] Alejandro G. Smith: Porque la verdad un aplicación así es un proyecto grande
[25/12/25, 2:08:04 a. m.] Alejandro G. Smith: Y valioso
[25/12/25, 2:08:29 a. m.] Plataforma De Apuestas: Ps me da precio a ver que le propongo
[25/12/25, 2:08:50 a. m.] Plataforma De Apuestas: Quizás le haga una oferta tentadora
[25/12/25, 2:09:01 a. m.] Plataforma De Apuestas: Para beneficios de ambas partes
[25/12/25, 2:09:37 a. m.] Plataforma De Apuestas: Necesito:
1. Películas y series
2. Tv en vivo de algunos canales en especifico
[25/12/25, 2:09:46 a. m.] Plataforma De Apuestas: 3. Canales para adultos
[25/12/25, 2:09:54 a. m.] Plataforma De Apuestas: Tipo magistv
[25/12/25, 2:09:59 a. m.] Plataforma De Apuestas: Pero que no pese tanto
[25/12/25, 10:03:58 p. m.] Alejandro G. Smith: Uff bro bueno, quieres una plataforma completa
[25/12/25, 10:04:28 p. m.] Alejandro G. Smith: Pues hay 2 caminos, hacerla legal y pagar por licencias para que no tengas ningún problema y podrías hasta publicarla en Play Store
[25/12/25, 10:04:45 p. m.] Plataforma De Apuestas: Precios
[25/12/25, 10:04:54 p. m.] Alejandro G. Smith: O sin pagar licencias (pirata) poniendo el contenido sin tener que pagar por licencias
[25/12/25, 10:05:03 p. m.] Alejandro G. Smith: Alrededor de 1.000$
[25/12/25, 10:05:13 p. m.] Alejandro G. Smith: Es algo muchísimo más difícil que la de apuestas
[25/12/25, 10:12:52 p. m.] Plataforma De Apuestas: Y todo legalmente?
[25/12/25, 10:15:12 p. m.] Alejandro G. Smith: Siempre yo te voy a cobrar lo mismo por la mano de obra (Desarrollar la plataforma) lo que te va a salir más caro es pagar las licencias o permisos para usar sus canales, series o películas de otras plataformas
[25/12/25, 10:15:25 p. m.] Alejandro G. Smith: Dan distintos precios por ahí
[25/12/25, 10:15:35 p. m.] Alejandro G. Smith: Tendría que preguntar y decirte
[25/12/25, 10:16:46 p. m.] Alejandro G. Smith: Pregúntale a chatgp o a alguien cuánto cuesta desarrollar una plataforma así para que veas bro jaja
[13/1/26, 10:12:56 a. m.] Plataforma De Apuestas: Buenos días mi oana
[13/1/26, 10:12:59 a. m.] Plataforma De Apuestas: Feliz año
[13/1/26, 10:33:54 a. m.] Alejandro G. Smith: Buenos días hermano, feliz año
[13/1/26, 10:34:00 a. m.] Alejandro G. Smith: 😁
[13/1/26, 10:34:11 a. m.] Plataforma De Apuestas: Retomemos
[13/1/26, 10:34:16 a. m.] Plataforma De Apuestas: Lo hablado
[13/1/26, 10:45:57 a. m.] Alejandro G. Smith: Ah bueno amigo claro
[13/1/26, 10:46:19 a. m.] Alejandro G. Smith: Cuéntame qué es lo que quieres hacer?
[13/1/26, 10:55:20 a. m.] Plataforma De Apuestas: No conseguí el mensaje
[13/1/26, 10:55:25 a. m.] Plataforma De Apuestas: Pero básicamente quiero hacer
[13/1/26, 10:55:35 a. m.] Plataforma De Apuestas: Cual fue la oferta que me hiciste
[13/1/26, 10:57:05 a. m.] Plataforma De Apuestas: Aqu
[13/1/26, 10:57:09 a. m.] Plataforma De Apuestas: Ya lo ubique
[13/1/26, 10:57:17 a. m.] Plataforma De Apuestas: Empezamos con domino y poker
[13/1/26, 10:57:22 a. m.] Plataforma De Apuestas: Luego le vamos añadiendo
[13/1/26, 11:13:19 a. m.] Alejandro G. Smith: Ah bueno, está bien amigo
[13/1/26, 11:14:38 a. m.] Alejandro G. Smith: Entonces esperaría el 50% y comenzamos de una vez y al entregarte todo el otro 50%, te parece?
[13/1/26, 11:36:34 a. m.] Plataforma De Apuestas: Si perfecto
[13/1/26, 11:36:47 a. m.] Plataforma De Apuestas: Déjame ver si hacemos eso hoy
[13/1/26, 11:36:53 a. m.] Plataforma De Apuestas: Cuanto tiempo me dijiste que demora?
[13/1/26, 11:39:51 a. m.] Alejandro G. Smith: Creo que alrededor de 3 semanas mi bro
[14/1/26, 10:10:55 a. m.] Plataforma De Apuestas: Epale mi bro
[14/1/26, 10:11:00 a. m.] Plataforma De Apuestas: Aún no cuadro el dinero
[14/1/26, 10:11:10 a. m.] Plataforma De Apuestas: Osea si lo tengo pero ando en otro proyectico
[14/1/26, 10:11:13 a. m.] Plataforma De Apuestas: Pero eso va
[14/1/26, 10:11:14 a. m.] Plataforma De Apuestas: Saludos
[14/1/26, 4:25:34 p. m.] Alejandro G. Smith: Ok amigo está bien, me avisas
[17/1/26, 8:23:48 p. m.] Plataforma De Apuestas: Volví
[17/1/26, 8:23:50 p. m.] Plataforma De Apuestas: Estas?
[17/1/26, 10:16:33 p. m.] Alejandro G. Smith: Amigo si
‎[17/1/26, 11:12:46 p. m.] Plataforma De Apuestas: ‎imagen omitida
[17/1/26, 11:12:56 p. m.] Plataforma De Apuestas: Me pegunta un pana por eso
[17/1/26, 11:40:36 p. m.] Alejandro G. Smith: Puedo hacerlo
[17/1/26, 11:40:47 p. m.] Alejandro G. Smith: Que quiere? Hacer un plataforma así?
[17/1/26, 11:54:03 p. m.] Plataforma De Apuestas: Con tiendas?
[17/1/26, 11:54:17 p. m.] Plataforma De Apuestas: Que sale?
[17/1/26, 11:54:22 p. m.] Plataforma De Apuestas: Aparte de lo otro
[17/1/26, 11:54:55 p. m.] Alejandro G. Smith: Como con tienda? Para que los usuarios apuesten?
[17/1/26, 11:55:56 p. m.] Plataforma De Apuestas: Te explico
[17/1/26, 11:56:07 p. m.] Plataforma De Apuestas: Tengo unos panas
[17/1/26, 11:56:14 p. m.] Plataforma De Apuestas: Y desean varios tener como sucursales
[17/1/26, 11:56:27 p. m.] Plataforma De Apuestas: Pero yo quiero tener acceso a la raíz
[18/1/26, 1:30:14 a. m.] Alejandro G. Smith: Bueno si se puede amigo
[18/1/26, 1:30:27 a. m.] Plataforma De Apuestas: Quiero una cosa completa
[18/1/26, 1:30:34 a. m.] Plataforma De Apuestas: Osea tener de todo
[18/1/26, 1:30:39 a. m.] Alejandro G. Smith: Pero tienes que darme los detalles completo y así
[18/1/26, 1:30:42 a. m.] Plataforma De Apuestas: De lo que hemos hablado
[18/1/26, 1:30:48 a. m.] Alejandro G. Smith: Para entender bien lo que quieres y darte un precio
[18/1/26, 1:30:51 a. m.] Plataforma De Apuestas: Ajá qie necesitamos?
[18/1/26, 1:31:01 a. m.] Plataforma De Apuestas: Lo mismo que hemos hablado de los juegos
[18/1/26, 1:31:06 a. m.] Plataforma De Apuestas: Y lo de los caballos
[18/1/26, 1:31:15 a. m.] Plataforma De Apuestas: Pero esos caballos me imagino que neceito una api
[18/1/26, 1:40:41 a. m.] Alejandro G. Smith: Me dijiste entonces domino y poker
[18/1/26, 1:40:50 a. m.] Alejandro G. Smith: + lo de los caballos, no?
[18/1/26, 1:41:01 a. m.] Alejandro G. Smith: Depende pero creo que no
[18/1/26, 1:41:34 a. m.] Plataforma De Apuestas: Vamos a hacer una vaina completa
[18/1/26, 1:41:37 a. m.] Plataforma De Apuestas: De una vez
[18/1/26, 1:41:44 a. m.] Plataforma De Apuestas: Voh a irte mandando plata
[18/1/26, 1:41:46 a. m.] Plataforma De Apuestas: Porq te cuento
[18/1/26, 1:42:01 a. m.] Plataforma De Apuestas: Yo estoy abriendo un remate de caballo, parley y Animalitos
[18/1/26, 1:42:11 a. m.] Plataforma De Apuestas: Entonces lo que ando agarrando es pa meter ahí
[18/1/26, 1:44:54 a. m.] Alejandro G. Smith: Sería todo esto?
[18/1/26, 1:44:56 a. m.] Alejandro G. Smith: O más?
[18/1/26, 1:45:00 a. m.] Alejandro G. Smith: Entiendo
[18/1/26, 1:45:31 a. m.] Plataforma De Apuestas: Coño dame un precio
[18/1/26, 1:45:41 a. m.] Plataforma De Apuestas: De algo pa empezar a camella
[18/1/26, 1:45:52 a. m.] Plataforma De Apuestas: Y como te dije te iré lanzando para que vayas trabajando
[18/1/26, 1:47:58 a. m.] Alejandro G. Smith: Es que tengo que saber cuántas cosas va a incluir porque mientras más, es más trabajo y precio diferente
[18/1/26, 1:48:15 a. m.] Alejandro G. Smith: Pero si es así unos 550$
[18/1/26, 1:48:22 a. m.] Alejandro G. Smith: Puedes ir pagando en partes
[18/1/26, 1:48:24 a. m.] Alejandro G. Smith: Como quieras
[18/1/26, 2:00:29 a. m.] Plataforma De Apuestas: Domino, poker, bingo, parley y caballos
[18/1/26, 2:00:50 a. m.] Plataforma De Apuestas: Vale amigo mira te puedo integrar todos estos:

• Dominó
• ⁠Poker
• ⁠Bingo
• ⁠Parley
• ⁠Caballos

Por *480$*
[18/1/26, 2:00:54 a. m.] Plataforma De Apuestas: Esta que me pasaste
[18/1/26, 2:03:27 a. m.] Alejandro G. Smith: Si pero ese precio sería sin comodidad de pago
[18/1/26, 2:03:43 a. m.] Alejandro G. Smith: Sería mitad antes de comenzar para arrancar
[18/1/26, 2:03:51 a. m.] Alejandro G. Smith: Y la otra mitad al terminar
[18/1/26, 2:04:29 a. m.] Plataforma De Apuestas: Ok
[18/1/26, 2:04:35 a. m.] Plataforma De Apuestas: Déjame ver que me queda más fácil
[18/1/26, 2:04:53 a. m.] Plataforma De Apuestas: Porq es difícil tener 200 o 300
[18/1/26, 2:04:57 a. m.] Plataforma De Apuestas: Por lo que te comente
[18/1/26, 2:05:09 a. m.] Plataforma De Apuestas: Hoy por ejemplo realice como 200 a 500 en pagos
[18/1/26, 2:05:14 a. m.] Plataforma De Apuestas: Para el streaming
[18/1/26, 2:05:22 a. m.] Plataforma De Apuestas: Y me. Toca invertir a diario igual
[18/1/26, 2:07:14 a. m.] Alejandro G. Smith: Entiendo, bueno esos son mis precios amigo
[18/1/26, 2:07:17 a. m.] Alejandro G. Smith: Allí me vas comentando
[18/1/26, 2:25:08 a. m.] Plataforma De Apuestas: Si va
[18/1/26, 2:25:14 a. m.] Plataforma De Apuestas: Voy a ver cual de las 2 me conviene
[18/1/26, 2:25:16 a. m.] Plataforma De Apuestas: Pa salir de eso
[18/1/26, 2:25:22 a. m.] Plataforma De Apuestas: Lo que si quiere es que el panel admin
[18/1/26, 2:26:11 a. m.] Plataforma De Apuestas: Sería apk o página?
[18/1/26, 2:34:59 a. m.] Alejandro G. Smith: Si, eso va incluido
[18/1/26, 2:35:13 a. m.] Alejandro G. Smith: Como tú lo quieras
[18/1/26, 2:36:11 a. m.] Alejandro G. Smith: Puede ser web pero con diseño responsive para que lo puedas tener como APK también
[11/2/26, 10:54:34 a. m.] Plataforma De Apuestas: Hermano buenos días
[11/2/26, 12:46:26 p. m.] Alejandro G. Smith: Amigo buenas tardes, cuéntame
[11/2/26, 1:01:57 p. m.] Plataforma De Apuestas: Mano vamos a empezar con domino y poker
[11/2/26, 1:02:14 p. m.] Plataforma De Apuestas: Porq si no, no arrancamos nunca jaja
[11/2/26, 1:05:03 p. m.] Alejandro G. Smith: Jaja bueno amigo está bien
[11/2/26, 1:05:14 p. m.] Alejandro G. Smith: Cuando quieres comenzar?
[11/2/26, 1:05:31 p. m.] Plataforma De Apuestas: Dijera el influencer colombiano
[11/2/26, 1:05:35 p. m.] Plataforma De Apuestas: Yo afán no tengo jaja
[11/2/26, 1:05:46 p. m.] Plataforma De Apuestas: Ud me dice pa cuando estaría listo y ya
[11/2/26, 3:48:37 p. m.] Alejandro G. Smith: Para comenzar necesito 50% primero y el resto al final, o hacerlo por saldo retenido en Forobeta que es seguro para los 2
[11/2/26, 3:48:52 p. m.] Alejandro G. Smith: Y terminaría más o menos entre 15 días y 1 mes
[11/2/26, 3:48:59 p. m.] Alejandro G. Smith: Calculando más o menos amigo
[11/2/26, 5:01:34 p. m.] Plataforma De Apuestas: Mano lo de saldo foro no es opción
[11/2/26, 5:01:41 p. m.] Plataforma De Apuestas: Ud se ve que es serio
[11/2/26, 5:01:52 p. m.] Plataforma De Apuestas: Por eso no me enrollo
[11/2/26, 5:02:04 p. m.] Plataforma De Apuestas: Yo quiero empezar con alguno
[11/2/26, 5:02:12 p. m.] Plataforma De Apuestas: Y luego le puedo añadir el resto?
[11/2/26, 5:25:43 p. m.] Alejandro G. Smith: Está bien amigo, claro yo soy responsable con eso no te preocupes
[11/2/26, 5:25:57 p. m.] Alejandro G. Smith: Si, después puedes integrar el resto
[11/2/26, 5:26:25 p. m.] Alejandro G. Smith: Me ahorrarías muchísimo si me envías el enlace o foto de la app que deseas crear o similar
[11/2/26, 5:26:29 p. m.] Alejandro G. Smith: Para guiarme un poco
[11/2/26, 5:26:36 p. m.] Alejandro G. Smith: Para tener claridad de lo que quieres
[11/2/26, 5:37:10 p. m.] Plataforma De Apuestas: Domino vamos pro
[12/2/26, 11:13:03 a. m.] Plataforma De Apuestas: Me avisas
[12/2/26, 12:12:42 p. m.] Alejandro G. Smith: Como así amigo
[12/2/26, 12:12:44 p. m.] Alejandro G. Smith: No entendí eso
[12/2/26, 12:19:51 p. m.] Plataforma De Apuestas: .
[12/2/26, 12:28:05 p. m.] Alejandro G. Smith: Esa es una app?
[12/2/26, 12:28:23 p. m.] Alejandro G. Smith: Tienes alguna foto para ver cómo es?
[12/2/26, 8:13:45 p. m.] Plataforma De Apuestas: Voy
[12/2/26, 8:14:20 p. m.] Plataforma De Apuestas:
‎[12/2/26, 8:14:20 p. m.] Plataforma De Apuestas: ‎imagen omitida
‎[12/2/26, 8:14:20 p. m.] Plataforma De Apuestas: ‎imagen omitida
‎[12/2/26, 8:14:20 p. m.] Plataforma De Apuestas: ‎imagen omitida
[21/2/26, 9:29:29 p. m.] Plataforma De Apuestas:
‎[21/2/26, 9:29:34 p. m.] Plataforma De Apuestas: ‎Video omitido
‎[21/2/26, 9:29:51 p. m.] Plataforma De Apuestas: ‎Video omitido
‎[21/2/26, 9:29:51 p. m.] Plataforma De Apuestas: ‎imagen omitida
‎[21/2/26, 9:29:52 p. m.] Plataforma De Apuestas: ‎imagen omitida
‎[21/2/26, 9:29:52 p. m.] Plataforma De Apuestas: ‎imagen omitida
[23/2/26, 4:29:29 p. m.] Plataforma De Apuestas: ?
[23/2/26, 4:29:33 p. m.] Plataforma De Apuestas: Mano
[23/2/26, 4:29:35 p. m.] Plataforma De Apuestas: Estas?
[23/2/26, 4:29:48 p. m.] Alejandro G. Smith: Amigo si
[23/2/26, 4:30:22 p. m.] Alejandro G. Smith: Dime
[23/2/26, 4:30:38 p. m.] Alejandro G. Smith: Uff pues estuve viendo y tampoco es fácil de desarrollar
[23/2/26, 4:30:45 p. m.] Alejandro G. Smith: Si puedo igual
[23/2/26, 4:30:53 p. m.] Alejandro G. Smith: Pero tardaría un par de meses
[23/2/26, 4:31:07 p. m.] Plataforma De Apuestas: Y si empezamos con domino, poker
[23/2/26, 4:31:13 p. m.] Plataforma De Apuestas: Luego le vamos añadiendo los otros
[23/2/26, 4:31:19 p. m.] Alejandro G. Smith: Claro eso sería lo más óptimo
[23/2/26, 4:31:27 p. m.] Plataforma De Apuestas: Ps tu me. Dices
[23/2/26, 4:31:34 p. m.] Plataforma De Apuestas: Como. No sabía de ti desde el 12
[23/2/26, 4:31:40 p. m.] Plataforma De Apuestas: Dije, se me perdió el hombre
[23/2/26, 4:31:41 p. m.] Plataforma De Apuestas: Jaja
[23/2/26, 4:31:46 p. m.] Alejandro G. Smith: Déjame crear un plan de implementación y te aviso
[23/2/26, 4:31:47 p. m.] Alejandro G. Smith: Hoy lo hago
[23/2/26, 4:32:02 p. m.] Alejandro G. Smith: Estaba ocupado con otros proyectos
[23/2/26, 4:32:07 p. m.] Alejandro G. Smith: Ahorita estoy entregando una app
[23/2/26, 4:32:12 p. m.] Alejandro G. Smith: Publicada en Google Play
[23/2/26, 4:33:23 p. m.] Plataforma De Apuestas: Eso es lo que quiero
[23/2/26, 4:33:29 p. m.] Plataforma De Apuestas: Ya averigüe dichos permisos
[23/2/26, 4:33:53 p. m.] Plataforma De Apuestas: Y me toca si o si crear una CA y pagarle al registrador pa qué me apruebe eso
[23/2/26, 4:34:07 p. m.] Plataforma De Apuestas: Y obviamente perder ese dinero por unos meses mientras recupero
[23/2/26, 4:58:46 p. m.] Alejandro G. Smith: Si amigo
[23/2/26, 4:58:50 p. m.] Alejandro G. Smith: Debes hacer todo eso
[23/2/26, 4:59:02 p. m.] Plataforma De Apuestas: Pero ya conseguí quien
[23/2/26, 4:59:02 p. m.] Alejandro G. Smith: Te puedo pasar una guía de todo lo que se debe hacer
[23/2/26, 4:59:10 p. m.] Plataforma De Apuestas: Perfecto
[23/2/26, 5:00:00 p. m.] Alejandro G. Smith: Uff amigo pero publicarla en Google Play es otro precio porque es un proceso para hacer que la app sea aceptada, son un montón de requisitos que debes cumplir para estar publicada en Google Play
[23/2/26, 5:00:21 p. m.] Alejandro G. Smith: Pensé que la querías solo en web
[23/2/26, 5:00:31 p. m.] Alejandro G. Smith: Ósea conseguirla buscando en el navegador
[23/2/26, 5:00:42 p. m.] Alejandro G. Smith: Del celular, pc, etc
[23/2/26, 5:01:53 p. m.] Plataforma De Apuestas: Ps ud me dice el precio y a medida que vamos activando avanzamos
[23/2/26, 5:05:22 p. m.] Alejandro G. Smith: Vale entonces crearé el plan de implementación del paso a paso y cómo sería el proceso, más tarde te lo envío si lo tengo listo
[23/2/26, 5:05:26 p. m.] Alejandro G. Smith: Sino máximo mañana bro
[23/2/26, 5:12:29 p. m.] Plataforma De Apuestas: Si es mañana mejor
[23/2/26, 5:12:36 p. m.] Plataforma De Apuestas: Pero como te dije empezamos por algo
[23/2/26, 5:18:57 p. m.] Alejandro G. Smith: Claro, está bien amigo
[25/2/26, 11:30:55 a. m.] Plataforma De Apuestas: Dale si va
[25/2/26, 11:30:59 a. m.] Plataforma De Apuestas: Quedamos asi
[3/3/26, 2:43:28 p. m.] Plataforma De Apuestas: Epale rey
[3/3/26, 2:43:31 p. m.] Plataforma De Apuestas: Buenas tardes
[3/3/26, 2:55:12 p. m.] Alejandro G. Smith: Buenas tarde mi bro
[3/3/26, 2:55:25 p. m.] Alejandro G. Smith: Disculpa que no te haya escrito es que he estado ocupado con otros proyectos que me salieron
[3/3/26, 2:55:50 p. m.] Alejandro G. Smith: Y que la verdad el proyecto que me pediste es más serio (más difícil), entonces quiero desocuparme primero antes de comenzar ‎<Se editó este mensaje.>
[3/3/26, 2:56:28 p. m.] Plataforma De Apuestas: Me avisas
[3/3/26, 2:56:29 p. m.] Plataforma De Apuestas: A ver
[3/3/26, 2:56:35 p. m.] Plataforma De Apuestas: Como para cuando estarás disponible?
[20/3/26, 10:09:41 a. m.] Plataforma De Apuestas: Epale mi pana
[20/3/26, 10:09:43 a. m.] Plataforma De Apuestas: Todo bello?
[10/4/26, 9:11:45 a. m.] Plataforma De Apuestas: Epale rey
[30/4/26, 5:49:53 p. m.] Plataforma De Apuestas: Mano
[30/4/26, 5:50:00 p. m.] Plataforma De Apuestas: Haremos la broma?
[30/4/26, 7:51:51 p. m.] Alejandro G. Smith: Hermano buenas tardes, si tú me dices
[30/4/26, 7:52:49 p. m.] Alejandro G. Smith: Acuérdate que pido algo adelante para arrancar 🫡
[30/4/26, 8:08:41 p. m.] Plataforma De Apuestas: Estoy esperando por ti
[30/4/26, 8:08:57 p. m.] Plataforma De Apuestas: 1ue ibas a terminar un proyecto
[30/4/26, 8:11:08 p. m.] Alejandro G. Smith: Ya estoy disponible amigo
[21/5/26, 10:06:11 a. m.] Plataforma De Apuestas: Háblame rey
[21/5/26, 12:16:49 p. m.] Alejandro G. Smith: Hermano cuentame
[21/5/26, 2:50:27 p. m.] Plataforma De Apuestas: He andado ocupado
[21/5/26, 2:50:32 p. m.] Plataforma De Apuestas: Necesitaba hablar contigo
[21/5/26, 2:50:36 p. m.] Plataforma De Apuestas: Pa 2 cositas
[21/5/26, 3:25:53 p. m.] Alejandro G. Smith: Ok amigo
[21/5/26, 3:25:55 p. m.] Alejandro G. Smith: Dime
[21/5/26, 4:12:59 p. m.] Plataforma De Apuestas: Por eso no te he contactado
[21/5/26, 4:13:03 p. m.] Plataforma De Apuestas: Ya te digo
[21/5/26, 4:13:08 p. m.] Plataforma De Apuestas: Una app que necesito
[21/5/26, 4:15:13 p. m.] Plataforma De Apuestas: Descarga la app
[21/5/26, 4:15:17 p. m.] Plataforma De Apuestas: Yang0
[21/5/26, 4:15:19 p. m.] Plataforma De Apuestas: Yango
[21/5/26, 4:15:24 p. m.] Plataforma De Apuestas: Cusnto haces una así?
[21/5/26, 4:15:46 p. m.] Plataforma De Apuestas: Y lo de los juegos
[21/5/26, 4:15:49 p. m.] Plataforma De Apuestas: Donde te paso plata?
[21/5/26, 4:31:17 p. m.] Plataforma De Apuestas: Para empezar
‎[21/5/26, 4:35:51 p. m.] Alejandro G. Smith: ‎imagen omitida
‎[21/5/26, 4:35:56 p. m.] Alejandro G. Smith: ‎imagen omitida
[21/5/26, 4:36:01 p. m.] Alejandro G. Smith: Esa?
[21/5/26, 4:37:00 p. m.] Plataforma De Apuestas: Siza
[21/5/26, 4:37:03 p. m.] Plataforma De Apuestas: Dame. Presupuesto de esa
[21/5/26, 4:37:06 p. m.] Plataforma De Apuestas: Que es para un pana
[21/5/26, 4:37:09 p. m.] Plataforma De Apuestas: Y tiempo de entrega
[21/5/26, 4:45:38 p. m.] Alejandro G. Smith: Ok amigo déjame probarla ver qué cosas tiene y te digo
[21/5/26, 4:45:45 p. m.] Alejandro G. Smith: La quiere publicada?
[21/5/26, 4:45:56 p. m.] Alejandro G. Smith: En Google play y AppStore
[21/5/26, 4:46:04 p. m.] Alejandro G. Smith: O solo quiere crear y después la publica?
[21/5/26, 4:46:25 p. m.] Alejandro G. Smith: Y la quiere así tal cual de profesional como esa? Idéntica o cambiando cositas?
[21/5/26, 4:46:35 p. m.] Alejandro G. Smith: Porque la puedo hacer idéntica y todo
[21/5/26, 4:48:03 p. m.] Plataforma De Apuestas: Si
[21/5/26, 4:48:16 p. m.] Plataforma De Apuestas: Dame presupuesto y tiempo de entrega
[21/5/26, 6:16:29 p. m.] Alejandro G. Smith: Amigo si la quiere así tal cual como esa unos *5 mil $*

Pero le puedo ofrecer una versión más simplificada, parecida a esa pero más directa sin tantas cosas, solo que cumpla la función y ya por *1.500$* y puede ir escalando poco a poco.
[21/5/26, 6:16:35 p. m.] Alejandro G. Smith: No es una app fácil de crear
[21/5/26, 6:16:57 p. m.] Alejandro G. Smith: Estaría lista entre 2 - 3 meses
[21/5/26, 6:18:52 p. m.] Alejandro G. Smith: Una app así con una agencia de desarrollo puede costar entre *15.000$* a *100.000$* ‎<Se editó este mensaje.>
‎[21/5/26, 6:19:51 p. m.] Alejandro G. Smith: ‎imagen omitida
[21/5/26, 6:19:57 p. m.] Alejandro G. Smith: Ves
[21/5/26, 7:31:58 p. m.] Plataforma De Apuestas: Es carita entonces
[21/5/26, 7:32:09 p. m.] Plataforma De Apuestas: Ya le hago saber al pana que me pidió
[21/5/26, 7:32:15 p. m.] Plataforma De Apuestas: Vamos a lo de nosotros
[21/5/26, 7:32:20 p. m.] Plataforma De Apuestas: Creo qye es más fácil
[21/5/26, 8:08:36 p. m.] Alejandro G. Smith: Ok amigo
[21/5/26, 8:08:39 p. m.] Alejandro G. Smith: Sii
[21/5/26, 8:08:45 p. m.] Alejandro G. Smith: Si es un poco más facil
[21/5/26, 8:13:54 p. m.] Plataforma De Apuestas: Dale si va
[21/5/26, 8:14:08 p. m.] Plataforma De Apuestas: El juego en cuanto tiempo esta ese?
[21/5/26, 8:17:00 p. m.] Plataforma De Apuestas: Vamos a empezar con algo e ir integrando
[21/5/26, 8:17:02 p. m.] Plataforma De Apuestas: Te parece?
[21/5/26, 8:31:45 p. m.] Alejandro G. Smith: Como en 1 o 2 meses, depende de la intensidad con que me ponga a hacerla
[21/5/26, 8:31:50 p. m.] Alejandro G. Smith: Sí claro amigo
[21/5/26, 9:52:14 p. m.] Plataforma De Apuestas: Hágale
[21/5/26, 9:52:24 p. m.] Plataforma De Apuestas: Vamos a darle no hay de otra
[21/5/26, 10:05:38 p. m.] Alejandro G. Smith: Ok bro, me dijiste entonces de Domino y que más?
[21/5/26, 10:05:51 p. m.] Alejandro G. Smith: Cuál es el primero que hago?
[21/5/26, 10:05:54 p. m.] Alejandro G. Smith: Cuál juego
[21/5/26, 10:06:02 p. m.] Alejandro G. Smith: Y tiene a Binance, no?
[22/5/26, 12:59:23 a. m.] Plataforma De Apuestas: Ya busco el mensaje
[22/5/26, 12:59:57 a. m.] Plataforma De Apuestas: .
[22/5/26, 1:35:22 a. m.] Plataforma De Apuestas: ‎Fijaste un mensaje.
[22/5/26, 1:35:43 a. m.] Alejandro G. Smith: Okok podemos avanzar entonces
[22/5/26, 1:35:58 a. m.] Alejandro G. Smith: Me avisas que método de pago usarás y así
[22/5/26, 10:14:55 a. m.] Plataforma De Apuestas: Binance pa
[22/5/26, 10:21:10 a. m.] Alejandro G. Smith: *Binance ID*
527832461
[22/5/26, 10:21:31 a. m.] Plataforma De Apuestas: Como vamos a hacer los métodos de pago y entrega?
[22/5/26, 10:21:33 a. m.] Alejandro G. Smith: Ese es el ID del Binance que uso bro, allí envías y comenzamos de una vez
[22/5/26, 10:21:33 a. m.] Plataforma De Apuestas: Para organizarme
[22/5/26, 10:22:28 a. m.] Alejandro G. Smith: Cuánto esté listo el .zip del proyecto te lo envío por correo o Google Drive o Telegram para que lo guardes, pero la plataforma quedará subirla en un dominio y todo
[22/5/26, 10:22:53 a. m.] Alejandro G. Smith: Método de pago Binance
[22/5/26, 10:22:58 a. m.] Plataforma De Apuestas: Si
[22/5/26, 10:23:07 a. m.] Plataforma De Apuestas: Que días nos. Reunimos a ver los avances?
[22/5/26, 11:06:22 a. m.] Alejandro G. Smith: Cada finde semana puede ser
[22/5/26, 11:06:25 a. m.] Alejandro G. Smith: O cada domingo
[22/5/26, 11:09:45 a. m.] Plataforma De Apuestas: Hágale
[22/5/26, 11:09:48 a. m.] Plataforma De Apuestas: Cuanto es pa empezar?
[22/5/26, 12:24:22 p. m.] Alejandro G. Smith: No se bro, puedes dividir los pagos en varias cuotas y así
[22/5/26, 12:24:46 p. m.] Alejandro G. Smith: Igualmente se te entrega cuando pagues el monto final
[22/5/26, 3:15:11 p. m.] Plataforma De Apuestas: Te voy a mandar 100
[22/5/26, 3:15:18 p. m.] Plataforma De Apuestas: Y a medida que vayamos avanzando
[22/5/26, 3:15:20 p. m.] Plataforma De Apuestas: Sacsr más
[22/5/26, 3:15:29 p. m.] Plataforma De Apuestas: Porq ando aun con gastos de el negocio físico
[22/5/26, 3:15:33 p. m.] Plataforma De Apuestas: Con el problema de la licencia
[22/5/26, 3:15:36 p. m.] Plataforma De Apuestas: Y ando corto
[22/5/26, 3:15:40 p. m.] Plataforma De Apuestas: Pero si no empiezo
[22/5/26, 3:15:46 p. m.] Plataforma De Apuestas: No voy a terminar nunca maní
[22/5/26, 3:17:11 p. m.] Alejandro G. Smith: Ok amigo si, está bien
[22/5/26, 3:17:18 p. m.] Alejandro G. Smith: Para comenzar
‎[22/5/26, 3:18:07 p. m.] Plataforma De Apuestas: ‎imagen omitida
[22/5/26, 3:19:24 p. m.] Alejandro G. Smith: Listo amigo, ahí me llegó
[22/5/26, 3:19:42 p. m.] Alejandro G. Smith: Comenzamos entonces
[22/5/26, 3:20:25 p. m.] Plataforma De Apuestas: Hágale
[22/5/26, 3:20:26 p. m.] Alejandro G. Smith: Comenzaré con el Frontend (La interfaz de la plataforma) esta semana
[22/5/26, 3:20:30 p. m.] Plataforma De Apuestas: Quedo atento
[22/5/26, 3:20:36 p. m.] Plataforma De Apuestas: Me avisas y más nada
[22/5/26, 3:20:41 p. m.] Alejandro G. Smith: El próximo domingo te muestro avances de cómo vamos
[22/5/26, 3:20:49 p. m.] Plataforma De Apuestas: Yo voy terminando otras cositas
[22/5/26, 3:20:52 p. m.] Plataforma De Apuestas: Una pregunta
[22/5/26, 3:20:53 p. m.] Alejandro G. Smith: Si amigo cualquier cosa te pregunto
[22/5/26, 3:20:58 p. m.] Plataforma De Apuestas: Hacer una app
[22/5/26, 3:21:00 p. m.] Plataforma De Apuestas: Básica
[22/5/26, 3:21:08 p. m.] Plataforma De Apuestas: Pero básica y funcional
[22/5/26, 3:21:17 p. m.] Plataforma De Apuestas: De Delivery
[22/5/26, 3:21:19 p. m.] Plataforma De Apuestas: Mototaxi
[22/5/26, 3:21:21 p. m.] Plataforma De Apuestas: Taxi
[22/5/26, 3:21:23 p. m.] Plataforma De Apuestas: Y esas cosas
[22/5/26, 3:21:33 p. m.] Plataforma De Apuestas: No tan avanzada como yango
[22/5/26, 3:22:26 p. m.] Alejandro G. Smith: *1500$* aproximadamente si tiene lo de Google Maps integrado
[22/5/26, 3:22:39 p. m.] Alejandro G. Smith: Pero si es más básica aún, como 1.000$ por ahí
[22/5/26, 3:22:46 p. m.] Alejandro G. Smith: Es un promedio
[22/5/26, 3:23:28 p. m.] Plataforma De Apuestas: Ventajas y desventajas
[22/5/26, 3:23:30 p. m.] Plataforma De Apuestas: Igual
[22/5/26, 3:23:31 p. m.] Alejandro G. Smith: Porque es que una app es más difícil que una web por las normas y reglas que tienes que seguir para que las acepten en las Tiendas de Apps (Google Play y AppStore). ‎<Se editó este mensaje.>
[22/5/26, 3:24:17 p. m.] Alejandro G. Smith: Que con el Google maps el cliente ve un mapa interactivo como: saliendo desde - hasta tal punto
[22/5/26, 3:24:22 p. m.] Alejandro G. Smith: Y cuánto falta y esas cosas
[22/5/26, 3:24:27 p. m.] Alejandro G. Smith: Se ve el mapa con la ruta
[22/5/26, 3:24:38 p. m.] Alejandro G. Smith: En cambio sin eso igualmente será funcional pero no tan visual
[22/5/26, 3:33:37 p. m.] Plataforma De Apuestas: A ok
[22/5/26, 3:33:43 p. m.] Plataforma De Apuestas: Hablaré con mi pana a ver
[22/5/26, 3:34:06 p. m.] Alejandro G. Smith: Igualmente puede comenzar lo más básico posible e ir integrando cosas paso a paso
[22/5/26, 3:39:45 p. m.] Plataforma De Apuestas: Así mismo le. Diré

