import { getReleaseBySlug } from "./releases";

export type Song = {
  slug: string;
  title: string;
  authors: string[];
  releaseSlugs: string[];
  lyrics: string;
};

export const SONGS: Song[] = [
  // Cuadrado (EP, 2025)
  {
    slug: "vision",
    title: "Visión",
    authors: ["Efraín Fernando Gutiérrez Salazar"],
    releaseSlugs: ["vision", "cuadrado"],
    lyrics: `Usando la imaginación
Podemos encontrarnos
Brincando en la habitación
Donde nadie nos ve

Y yo lo sé, baby, yo lo sé
De lejos también se quiere
Tus ojos en la web
Dieron la...

Visión, mi amor
De todo lo que vas a hacer de mí
De como me hace sentir tu amor
Y todo sin tener que estar aquí

La dulce seducción
Que llama a sentir
Que invita a morir
Junto a ti
Junto a ti bebé

Y no lo sé, baby, no lo sé
Si el tiempo nos junte de nuevo
Tomemos esta vez
Guárdala...

Visión, mi amor
De todo lo que vas a hacer de mí
De como me hace sentir tu amor
Y todo sin tener que estar aquí

Visión, mi amor
De todo lo que vas a hacer de mí
De como me hace sentir tu amor
Y todo sin tener que estar aquí

Sentir tu amor
Sentir tu amor`,
  },
  {
    slug: "oh-no",
    title: "Oh No",
    authors: ["Efraín Fernando Gutiérrez Salazar"],
    releaseSlugs: ["oh-no", "cuadrado"],
    lyrics: `Sentir la brisa, a cien en pista
Bólido rojo, y de fondo
El verde y azul
Pasando haciendo un zoom

Y aunque me mueva
Veo la meta
Fijada al alba
Corriendo sin un fin
Mi salida ya está aquí

Uh, no puedo más así
No quiero más de ti
No vuelvas por favor
Oh no

Encontrarse, no es algo fácil
Pero tengo que soltar
Para poder avanzar

Uh, no puedo más así
No quiero más de ti
No vuelvas por favor
Oh no

Uh, no puedo más así
No quiero más de ti
No vuelvas por favor
Oh no`,
  },
  {
    slug: "sed-de-ti",
    title: "Sed (De Ti)",
    authors: ["Efraín Fernando Gutiérrez Salazar"],
    releaseSlugs: ["sed-de-ti", "cuadrado"],
    lyrics: `Estoy cansado de esperar
Quiero mi turno de batear
Pero si quiero, debo ir por ello hoy

Hablar contigo, y confesar
La maleta soltar
Desparramando to lo que siento, oh

Todo este tiempo
Dando vueltas al deseo
Sed de ti
Tengo yo, tengo yo

Todo este tiempo
Te he querido dar un beso
Sed de ti
Sed de ti

No hay ningune como tu, llenas mi mente
A todos les demás rechazo, poca suerte
Pero si quiero, debo ir por ello hoy

En tu coche se hizo noche muy de repente
Suelto el derroche de palabras, que inocente
Rompecabezas de sentimientos oh

Todo este tiempo
Dando vueltas al deseo
Sed de ti
tengo yo tengo yo

Todo este tiempo
Y hoy puede darte un beso
Sed de ti
Sed de ti`,
  },
  {
    slug: "novedad",
    title: "Novedad",
    authors: ["Efraín Fernando Gutiérrez Salazar"],
    releaseSlugs: ["cuadrado"],
    lyrics: `Amor, no somos amantes
No no, ya no es cómo antes
Lo hecho hecho está
Solté mis lágrimas
Y ya no soy a quien dejaste aquí

Tu, bailando en luna azul
Yo, menguante con glamour
Amor, comprendeme, que al verte yo se bien
No hay novedad

Cambio, la única constante
Pero la mierda siempre es mierda

Mejor seguir adelante
Cantando voy tu tu tu tu tu tu

Tu, bailando en luna azul
Yo, menguante con glamour
Amor, comprendeme, que al verte yo se bien
No hay novedad`,
  },
  // Círculo (EP, 2023)
  {
    slug: "detalles",
    title: "Detalles",
    authors: ["Efraín Fernando Gutiérrez Salazar", "Luisa Monica Gutiérrez Salazar", "Samantha Lizbeth Vazquez Luna"],
    releaseSlugs: ["detalles", "circulo"],
    lyrics: `Fue un día duro de aguantar
Ya quiero llegar al chante
Siempre fresca sensación
Me perfora al mirarte
Hablar contigo y ver como éstas
De fondo algunas estrellas

No, no tienes que hablar
Tú me quieres de verdad
Me lo muestras en

Los detalles que tú me das
Los besos que me guardas
Cada día te quiero más
Por los detalles que regalas

Tus buenos días
Mi melodía
Un abrazo que
Mueve mi vida
Besitos tuyos
En las mejillas
Café y sandía
El mejor día

No, no tienes que hablar
Tú me quieres de verdad
Me lo muestras en

Corro por la vereda
Entre mis sueños y mi realidad
Todo parece perfecto
De rosa el cielo se empieza a pintar
Es que no puedo evitarlo
Tu suave aroma me hace delirar
Cuando nos damos la mano
Todo parece estar en su lugar
Los detalles que tú me das
Los besos que me guardas
Cada día te quiero más
Por los detalles que regalas

Los detalles que tú me das
Los besos que me guardas
Cada día te quiero más
Por los detalles que regalas`,
  },
  {
    slug: "como-tu",
    title: "Como Tú",
    authors: ["Efraín Fernando Gutiérrez Salazar"],
    releaseSlugs: ["como-tu", "circulo"],
    lyrics: `Perdido en el metro
Sin tener algún destino
A donde llegar
Donde llegar

Todo se revuelve
Miro al cielo, pierdo el tino
Voy a explotar
Voy a explotar

Como tú
Como tú

Otro día que no entiendo al mundo y a su gente
Pero ahí va
Pero ahí va

Todo lo que dicen me da vueltas en la mente
A pensar de más
Pensar de más

Como tú
Como tú

Como tú
Como tú`,
  },
  {
    slug: "ultramar",
    title: "Ultramar",
    authors: ["Efraín Fernando Gutiérrez Salazar"],
    releaseSlugs: ["ultramar", "circulo"],
    lyrics: `Mi instinto dice que no
Me acerque más a tus labios de miel
Tal vez deba terminar
Antes que explote otra vez mi piel

Mi mente es un molino
Gira por tus historias bebé
Cuento de nunca acabar
Que en esta página yo abandoné

Y no, no quiero más
De esos besos, de tus besos de ultramar
¿Para qué? Si no llenan a mi corazón

Estrellas veo pasar
Los ojos cierro, en mi mente estás
Dime que tengo que hacer
Para olvidarte de una buena vez

Y no, no quiero más
De esos besos, de tus besos de ultramar
¿Para qué? Si no llenan a mi corazón

Y no, no quiero más
De esos besos, de tus besos de ultramar
¿Para qué? Si no llenan a mi corazón`,
  },
  {
    slug: "ventana",
    title: "Ventana",
    authors: ["Efraín Fernando Gutiérrez Salazar"],
    releaseSlugs: ["circulo"],
    lyrics: `Tal vez sea hora de salir

Viviendo en cuatro paredes un tiempo ya
Cientos de atardeceres pero es igual
Aunque es diferente, se extraña poder hablar
Con todes mis panas, la gente que quiero más

Ay amor, hay dolor
Perdimos gente si
En su memoria

Veo a través de mi ventana
Y todo brilla allá fuera
Que estará esperándome
Tal vez sea hora de salir

Los meses van y vienen de un tiempo aca
No desesperes, se ve el final
Nada es para siempre y esto también pasará
Y creo que el mundo un lugar mejor será

Ay amor, hay dolor
La fé se agota si
Debemos continuar

Veo a través de mi ventana
Y todo brilla allá fuera
Que estará esperándome
Tal vez sea hora de salir

Nada es para siempre y esto también pasará`,
  },
  // Sueño en Stereo (EP, 2020)
  {
    slug: "luz",
    title: "Luz",
    authors: ["Efraín Gutiérrez", "Alejandra Luna"],
    releaseSlugs: ["sueno-en-stereo"],
    lyrics: `Cuanto tiempo hay que fingir
Que ya no quiero regresar al punto de siempre

Nos surgió cambiando el dolor del fin
Al regresar el tiempo todo me llevaba a ti

Nada cambiará al final
Siempre busco su mirar

Cuanto tiempo hay que fingir
Que ya no quiero regresar al punto de siempre
Su recuerdo va por ahí
Cambiando todo y al final
Sintiendo su quiebre

Cuanto tiempo hay que fingir
Que ya no quiero regresar al punto de siempre
Su recuerdo va por ahí
Cambiando todo y al final
Sintiendo su quiebre`,
  },
  {
    slug: "monzon",
    title: "Monzón",
    authors: ["Efraín Fernando Gutiérrez Salazar"],
    releaseSlugs: ["sueno-en-stereo"],
    lyrics: `A medianoche
Al fondo de este bar
Tu me miras
¿Qué va a pasar?

Me acerco lento
Un saludo nada más
Siento el monzón
Oh, corazón

Tal vez esta vez sea real

No quiero saber si hay algo ahí
Si te vas a ir esta vez
Sólo dime
Si vas a seguir siendo un lamento

Pero al mediodía
Todo se evapora
Pasó el monzón
Ay, corazón

Me voy convenciendo
De que mañana llamaras
Para salir
A uno de esos sitios
Al que solo van los amantes de verdad

No quiero saber si hay algo ahí
Si te vas a ir esta vez
Sólo dime
Si vas a seguir siendo un lamento

Un lamento
Un lamento`,
  },
  {
    slug: "deriva",
    title: "Deriva",
    authors: ["Efraín Fernando Gutiérrez Salazar"],
    releaseSlugs: ["sueno-en-stereo"],
    lyrics: `Otra vez que el destino
Altera mi camino
Cambió de humor, amor

Pero camino sin apuro
No hay prisa y perduro
Como árbol al sol

Los caminantes llenan la ciudad
Y cada uno tiene su verdad

No hay de forma de saber si acaso estaremos bien esta vez, esta vez
Tenemos que seguir para así saber

Todo lo que me dijiste aquí, se va
La deriva nos deja así, y se va, se va

Toda certeza es siempre pantalla
Pues nadie sabe bien qué pasará

Se forman dos caminos de cada decisión, o más, no lo sé
Pero lo que elegimos no siempre se ve

Todo lo que me dijiste aquí, se va
la deriva nos deja así, y se va, se va

Todo lo que me dijiste aquí, se va
la deriva nos deja así, y se va, se va`,
  },
  {
    slug: "abril",
    title: "Abril",
    authors: ["Alejandra Luna"],
    releaseSlugs: ["sueno-en-stereo"],
    lyrics: `¿Con quién vas a soñar
que te escaparas hacia otro lugar
y desear estar aquí?
I feel the sunshine
I feel the sunshine

Y me disfrace de tí
Para no sentir tu abril

I feel the sunshine
I feel the sunshine

Escóndeme en tu cuarto azul
Cada vez que yo florezca en Abril`,
  },
  {
    slug: "marfil",
    title: "Marfil",
    authors: ["Efraín Gutiérrez", "Alejandra Luna"],
    releaseSlugs: ["sueno-en-stereo"],
    lyrics: `Nene tú no te vas a arrepentir
de todo lo que hagamos aquí
encerrados en el marfil

Yo quiero medicina para mí
Tu eres medicina para mí
Arréglame este roto corazón

Yo quiero ser
Yo quiero ser de ti

No quiero que te vayas más
Que el tiempo borre mi lugar
Te esperaré siempre aquí
En donde está nuestro marfil`,
  },
  {
    slug: "corriendo-hacia-ti",
    title: "Corriendo Hacia Ti",
    authors: ["Efraín Gutiérrez", "Rubén Hernandez"],
    releaseSlugs: ["corriendo-hacia-ti"],
    lyrics: `Mira como me tienes
Aunque ya no es lo quiero
Si tu me marcas esta noche
Creo que iría corriendo hacia ti

Corriendo hacia ti, bebé
Corriendo, corriendo
Corriendo hacia ti, bebé
Corriendo, corriendo

Sintiendo roto ya mi corazón
Loopeando Mitski, no veo razón
Para esperarme a tu aparición
De qué me sirve ese falso amor que

Uh, hold up
Con una llamada me tienes allá
A la medianoche suena el ring
Me tienes corriendo hacia ti bebé
Corriendo hacia ti, eh

Mira como me tienes

Me tienes running
Marcando al phony
Todo fue por ti
Buscando le perdí
Encontrar, tropezar
But let us try
Una chance de más

Uh, bebé
Te fuiste clavada
De repeat, jamás
Contestar tus clamos y demás
Tanto tiempo he perdido
Por estar detrás de tu amor fugaz

Corriendo hacia ti, bebé
Corriendo, corriendo
Corriendo hacia ti, bebé
Corriendo, corriendo`,
  },
  {
    slug: "hair-down",
    title: "hair down",
    authors: ["Diego Alonso", "Efraín Gutiérrez"],
    releaseSlugs: ["hair-down"],
    lyrics: `If you wanna hang around when your hair is all down, baby
But you wanna be free
If you don't even care wether I feel fine, baby
What you trying us to be?

You're so far away
You never made it clear

And your hands are tied
Maybe it's not too late
To give us a try
And learn to love
To love again

Oh, you're so far away
You never made it clear

And your hands are tied
Maybe it's not too late
To give us a try
And learn to love
To love again

Oh, you're so far away
You never made it clear`,
  },
];

export function getSongBySlug(slug: string): Song | undefined {
  return SONGS.find((s) => s.slug === slug);
}

export function getSpotifyLinkForSong(song: Song): string | undefined {
  for (const releaseSlug of song.releaseSlugs) {
    const spotify = getReleaseBySlug(releaseSlug)?.links.find((link) => link.label === "Spotify");
    if (spotify) return spotify.href;
  }
  return undefined;
}
