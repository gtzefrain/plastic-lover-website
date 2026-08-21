export type Locale = "en" | "es";

export const locales: Locale[] = ["en", "es"];
export const defaultLocale: Locale = "es";
export const LOCALE_COOKIE = "pl_locale";

export type NavKey = "live" | "lyrics" | "videos" | "releases" | "contact";

type Dictionary = {
  site: {
    description: string;
  };
  nav: Record<NavKey, string> & {
    wordmark: string;
    openMenu: string;
    closeMenu: string;
    primaryLabel: string;
    skipToContent: string;
    skipToFooter: string;
  };
  languageSelector: {
    label: string;
  };
  footer: {
    home: string;
    replay: string;
  };
  home: {
    tagline: string;
    heroCta: string;
    scrollToRelease: string;
    scrollToPhotos: string;
    scrollToJoin: string;
    releaseKicker: string;
    releaseHeadline: string;
    releaseBody: string;
    releaseCta: string;
    releaseVideoTitle: string;
  };
  mailingList: {
    kicker: string;
    headline: string;
    namePlaceholder: string;
    emailPlaceholder: string;
    submit: string;
    joined: string;
    joinedNoEmail: string;
    error: string;
    footnote: string;
  };
  pages: {
    contact: {
      title: string;
      description: string;
      kicker: string;
      screenLabel: string;
      management: string;
      booking: string;
      press: string;
    };
    live: {
      title: string;
      description: string;
      kicker: string;
      screenLabel: string;
      tickets: string;
      requestHeadline: string;
      requestCityPlaceholder: string;
      requestEmailPlaceholder: string;
      requestSubmit: string;
      requestSent: string;
      requestFootnote: string;
    };
    lyrics: {
      title: string;
      description: string;
      kicker: string;
      screenLabel: string;
      read: string;
    };
    lyricsDetail: {
      fallbackTitle: string;
      fallbackDescription: string;
      descriptionPrefix: string;
      writtenBy: string;
    };
    releases: {
      title: string;
      description: string;
      kicker: string;
      screenLabel: string;
      stream: string;
      collaborations: string;
    };
    releaseDetail: {
      fallbackTitle: string;
      fallbackDescription: string;
      descriptionSuffix: string;
    };
    videos: {
      title: string;
      description: string;
      kicker: string;
      screenLabel: string;
    };
    subscribe: {
      title: string;
      description: string;
      screenLabel: string;
    };
    subscribeLanguage: {
      title: string;
      description: string;
      screenLabel: string;
    };
    lasOlas: {
      title: string;
      description: string;
      hiddenHeading: string;
      kicker: string;
      tapHint: string;
      listenButton: string;
      revealedStatus: string;
      replayButton: string;
    };
    press: {
      kicker: string;
      creditsLabel: string;
      photosLabel: string;
      viewPhotosLabel: string;
      backToKitLabel: string;
      downloadLabel: string;
      artistBioHeading: string;
      socialLabel: string;
      contactLabel: string;
      fallbackTitle: string;
      fallbackDescription: string;
      descriptionSuffix: string;
    };
  };
};

const dictionaries: Record<Locale, Dictionary> = {
  en: {
    site: {
      description: "New single coming soon. Be the first to hear it.",
    },
    nav: {
      live: "LIVE",
      lyrics: "LYRICS",
      videos: "VIDEOS",
      releases: "RELEASES",
      contact: "CONTACT",
      wordmark: "PLASTIC LOVER",
      openMenu: "Menu",
      closeMenu: "Close menu",
      primaryLabel: "Main navigation",
      skipToContent: "Skip to content",
      skipToFooter: "Skip to footer",
    },
    languageSelector: {
      label: "Language",
    },
    footer: {
      home: "← HOME",
      replay: "↻ REPLAY",
    },
    home: {
      tagline: "New single out now. Listen now!",
      heroCta: "LAS OLAS",
      scrollToRelease: "Scroll to the new single",
      scrollToPhotos: "Scroll to photos",
      scrollToJoin: "Scroll to the mailing list",
      releaseKicker: "NEW SINGLE",
      releaseHeadline: "Las Olas — the new single, out now.",
      releaseBody: "Hit play on the visualizer, then take it with you — streaming on every platform.",
      releaseCta: "STREAM IT NOW",
      releaseVideoTitle: "Plastic Lover — Las Olas [Visualizer]",
    },
    mailingList: {
      kicker: "MAILING LIST",
      headline: "New singles, tour dates and secret shows. Straight to your inbox.",
      namePlaceholder: "your name",
      emailPlaceholder: "your@email.com",
      submit: "JOIN THE LIST",
      joined: "YOU'RE ON THE LIST. CHECK YOUR INBOX",
      joinedNoEmail: "YOU'RE ON THE LIST",
      error: "SOMETHING WENT WRONG. PLEASE TRY AGAIN.",
      footnote: "NO SPAM. UNSUBSCRIBE ANYTIME.",
    },
    pages: {
      contact: {
        title: "Contact — Plastic Lover",
        description: "Booking, management, and press contacts for Plastic Lover.",
        kicker: "CONTACT",
        screenLabel: "Contact",
        management: "MANAGEMENT",
        booking: "BOOKING",
        press: "PRESS",
      },
      live: {
        title: "Live — Plastic Lover",
        description: "Tour dates for Plastic Lover. No shows booked yet — request one for your city.",
        kicker: "TOUR",
        screenLabel: "Live",
        tickets: "TICKETS",
        requestHeadline: "No dates on the books yet. Tell us where to play next.",
        requestCityPlaceholder: "Your city",
        requestEmailPlaceholder: "your@email.com",
        requestSubmit: "REQUEST A SHOW",
        requestSent: "GOT IT. WE'LL KEEP YOU POSTED.",
        requestFootnote: "WE READ EVERY REQUEST.",
      },
      lyrics: {
        title: "Lyrics — Plastic Lover",
        description: "Lyrics to every Plastic Lover song, in one place.",
        kicker: "LYRICS",
        screenLabel: "Lyrics",
        read: "READ",
      },
      lyricsDetail: {
        fallbackTitle: "Lyrics — Plastic Lover",
        fallbackDescription: "Lyrics by Plastic Lover.",
        descriptionPrefix: "Lyrics to",
        writtenBy: "WRITTEN BY",
      },
      releases: {
        title: "Releases — Plastic Lover",
        description: "Every Plastic Lover single and EP — stream on Spotify, Apple Music, and more.",
        kicker: "RELEASES",
        screenLabel: "Releases",
        stream: "STREAM",
        collaborations: "COLLABORATIONS",
      },
      releaseDetail: {
        fallbackTitle: "Release — Plastic Lover",
        fallbackDescription: "Stream this release by Plastic Lover on every platform.",
        descriptionSuffix: "Stream now on every platform.",
      },
      videos: {
        title: "Videos — Plastic Lover",
        description: "Official music videos and visualizers from Plastic Lover.",
        kicker: "VIDEOS",
        screenLabel: "Videos",
      },
      subscribe: {
        title: "Subscribe — Plastic Lover",
        description: "Join the Plastic Lover mailing list for new singles, tour dates, and secret shows.",
        screenLabel: "Subscribe",
      },
      subscribeLanguage: {
        title: "Newsletter language — Plastic Lover",
        description: "Change which language you get the Plastic Lover newsletter in.",
        screenLabel: "Newsletter language",
      },
      lasOlas: {
        title: "Las Olas — Plastic Lover",
        description: "The new single — out now. Tap to reveal.",
        hiddenHeading: "Las Olas — the new single",
        kicker: "🌊🌊🌊 — OUT NOW",
        tapHint: "TAP THE WATER",
        listenButton: "LISTEN NOW",
        revealedStatus: "Las Olas revealed. Listen link available below.",
        replayButton: "REPLAY",
      },
      press: {
        kicker: "ELECTRONIC PRESS KIT",
        creditsLabel: "CREDITS",
        photosLabel: "PHOTOS",
        viewPhotosLabel: "HD Photos",
        backToKitLabel: "← Back to press kit",
        downloadLabel: "DOWNLOAD",
        artistBioHeading: "PLASTIC LOVER",
        socialLabel: "SOCIAL",
        contactLabel: "PRESS CONTACT",
        fallbackTitle: "Press Kit — Plastic Lover",
        fallbackDescription: "Electronic press kit for a Plastic Lover release.",
        descriptionSuffix: "Electronic press kit — bio, photos, and streaming links.",
      },
    },
  },
  es: {
    site: {
      description: "Nuevo sencillo muy pronto. Sé el primero en escucharlo.",
    },
    nav: {
      live: "EN VIVO",
      lyrics: "LETRAS",
      videos: "VIDEOS",
      releases: "LANZAMIENTOS",
      contact: "CONTACTO",
      wordmark: "PLASTIC LOVER",
      openMenu: "Menú",
      closeMenu: "Cerrar menú",
      primaryLabel: "Navegación principal",
      skipToContent: "Saltar al contenido",
      skipToFooter: "Saltar al pie de página",
    },
    languageSelector: {
      label: "Idioma",
    },
    footer: {
      home: "← INICIO",
      replay: "↻ REPETIR",
    },
    home: {
      tagline: "Nuevo sencillo ya disponible. Escúchalo.",
      heroCta: "LAS OLAS",
      scrollToRelease: "Ir al nuevo sencillo",
      scrollToPhotos: "Ir a las fotos",
      scrollToJoin: "Ir a la lista de correo",
      releaseKicker: "NUEVO SENCILLO",
      releaseHeadline: "Las Olas — el nuevo sencillo, ya disponible.",
      releaseBody: "Dale play al visualizer y llévate la canción contigo — en todas las plataformas.",
      releaseCta: "ESCÚCHALO YA",
      releaseVideoTitle: "Plastic Lover — Las Olas [Visualizer]",
    },
    mailingList: {
      kicker: "LISTA DE CORREO",
      headline: "Nuevos sencillos, fechas en vivo y shows secretos. Directo a tu bandeja.",
      namePlaceholder: "tu nombre",
      emailPlaceholder: "tu@correo.com",
      submit: "UNIRSE A LA LISTA",
      joined: "YA ESTÁS EN LA LISTA. REVISA TU BANDEJA",
      joinedNoEmail: "YA ESTÁS EN LA LISTA",
      error: "ALGO SALIÓ MAL. INTÉNTALO DE NUEVO.",
      footnote: "SIN SPAM. CANCELA CUANDO QUIERAS.",
    },
    pages: {
      contact: {
        title: "Contacto — Plastic Lover",
        description: "Contactos de contrataciones, management y prensa de Plastic Lover.",
        kicker: "CONTACTO",
        screenLabel: "Contacto",
        management: "MANAGEMENT",
        booking: "CONTRATACIONES",
        press: "PRENSA",
      },
      live: {
        title: "En Vivo — Plastic Lover",
        description: "Fechas de gira de Plastic Lover. Todavía no hay shows confirmados — solicita uno en tu ciudad.",
        kicker: "GIRA",
        screenLabel: "En Vivo",
        tickets: "ENTRADAS",
        requestHeadline: "Todavía no hay fechas confirmadas. Dinos dónde tocar.",
        requestCityPlaceholder: "Tu ciudad",
        requestEmailPlaceholder: "tu@correo.com",
        requestSubmit: "SOLICITAR UN SHOW",
        requestSent: "LISTO. TE AVISAREMOS.",
        requestFootnote: "LEEMOS CADA SOLICITUD.",
      },
      lyrics: {
        title: "Letras — Plastic Lover",
        description: "Las letras de todas las canciones de Plastic Lover, en un solo lugar.",
        kicker: "LETRAS",
        screenLabel: "Letras",
        read: "LEER",
      },
      lyricsDetail: {
        fallbackTitle: "Letras — Plastic Lover",
        fallbackDescription: "Letra de una canción de Plastic Lover.",
        descriptionPrefix: "Letra de",
        writtenBy: "ESCRITA POR",
      },
      releases: {
        title: "Lanzamientos — Plastic Lover",
        description: "Todos los sencillos y EPs de Plastic Lover — disponibles en Spotify, Apple Music y más.",
        kicker: "LANZAMIENTOS",
        screenLabel: "Lanzamientos",
        stream: "ESCUCHAR",
        collaborations: "COLABORACIONES",
      },
      releaseDetail: {
        fallbackTitle: "Lanzamiento — Plastic Lover",
        fallbackDescription: "Escucha este lanzamiento de Plastic Lover en todas las plataformas.",
        descriptionSuffix: "Escucha ahora en todas las plataformas.",
      },
      videos: {
        title: "Videos — Plastic Lover",
        description: "Videos musicales oficiales y visualizers de Plastic Lover.",
        kicker: "VIDEOS",
        screenLabel: "Videos",
      },
      subscribe: {
        title: "Suscríbete — Plastic Lover",
        description: "Únete a la lista de correo de Plastic Lover: nuevos sencillos, fechas y shows secretos.",
        screenLabel: "Suscribirse",
      },
      subscribeLanguage: {
        title: "Idioma del boletín — Plastic Lover",
        description: "Cambia el idioma en el que recibes el boletín de Plastic Lover.",
        screenLabel: "Idioma del boletín",
      },
      lasOlas: {
        title: "Las Olas — Plastic Lover",
        description: "El nuevo sencillo — ya disponible. Toca para revelar.",
        hiddenHeading: "Las Olas — el nuevo sencillo",
        kicker: "🌊🌊🌊 — YA DISPONIBLE",
        tapHint: "TOCA EL AGUA",
        listenButton: "ESCUCHAR AHORA",
        revealedStatus: "Las Olas revelado. Enlace para escuchar disponible abajo.",
        replayButton: "REPETIR",
      },
      press: {
        kicker: "KIT DE PRENSA ELECTRÓNICO",
        creditsLabel: "CRÉDITOS",
        photosLabel: "FOTOS",
        viewPhotosLabel: "Fotografías en HD",
        backToKitLabel: "← Volver al kit de prensa",
        downloadLabel: "DESCARGAR",
        artistBioHeading: "PLASTIC LOVER",
        socialLabel: "REDES SOCIALES",
        contactLabel: "CONTACTO DE PRENSA",
        fallbackTitle: "Kit de Prensa — Plastic Lover",
        fallbackDescription: "Kit de prensa electrónico de un lanzamiento de Plastic Lover.",
        descriptionSuffix: "Kit de prensa electrónico — bio, fotos y enlaces para escuchar.",
      },
    },
  },
};

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export function isLocale(value: string | undefined | null): value is Locale {
  return value === "en" || value === "es";
}
