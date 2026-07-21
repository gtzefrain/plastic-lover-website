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
    listenNow: string;
    scrollToRelease: string;
    scrollToPhotos: string;
    latestRelease: string;
    releaseHeadline: string;
    releaseBody: string;
    streamEverywhere: string;
  };
  mailingList: {
    kicker: string;
    headline: string;
    placeholder: string;
    submit: string;
    joined: string;
    footnote: string;
  };
  pages: {
    contact: {
      title: string;
      kicker: string;
      screenLabel: string;
      management: string;
      booking: string;
      press: string;
    };
    live: {
      title: string;
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
      kicker: string;
      screenLabel: string;
      read: string;
    };
    lyricsDetail: {
      fallbackTitle: string;
      writtenBy: string;
    };
    releases: {
      title: string;
      kicker: string;
      screenLabel: string;
      stream: string;
      collaborations: string;
    };
    releaseDetail: {
      fallbackTitle: string;
    };
    videos: {
      title: string;
      kicker: string;
      screenLabel: string;
    };
    subscribe: {
      title: string;
      screenLabel: string;
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
    },
    languageSelector: {
      label: "Language",
    },
    footer: {
      home: "← HOME",
      replay: "↻ REPLAY",
    },
    home: {
      tagline: "New single coming soon. Be the first to hear it.",
      listenNow: "JOIN THE LIST",
      scrollToRelease: "Scroll to latest release",
      scrollToPhotos: "Scroll to photos",
      latestRelease: "LATEST RELEASE",
      releaseHeadline: "Plastic Lover — the new single, out now.",
      releaseBody: "Watch the official video, then take it with you — streaming on every platform.",
      streamEverywhere: "STREAM EVERYWHERE",
    },
    mailingList: {
      kicker: "MAILING LIST",
      headline: "New singles, tour dates and secret shows. Straight to your inbox.",
      placeholder: "your@email.com",
      submit: "JOIN THE LIST",
      joined: "YOU'RE ON THE LIST. STAY PLASTIC.",
      footnote: "NO SPAM. UNSUBSCRIBE ANYTIME.",
    },
    pages: {
      contact: {
        title: "Contact — Plastic Lover",
        kicker: "CONTACT",
        screenLabel: "Contact",
        management: "MANAGEMENT",
        booking: "BOOKING",
        press: "PRESS",
      },
      live: {
        title: "Live — Plastic Lover",
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
        kicker: "LYRICS",
        screenLabel: "Lyrics",
        read: "READ",
      },
      lyricsDetail: {
        fallbackTitle: "Lyrics — Plastic Lover",
        writtenBy: "WRITTEN BY",
      },
      releases: {
        title: "Releases — Plastic Lover",
        kicker: "RELEASES",
        screenLabel: "Releases",
        stream: "STREAM",
        collaborations: "COLLABORATIONS",
      },
      releaseDetail: {
        fallbackTitle: "Release — Plastic Lover",
      },
      videos: {
        title: "Videos — Plastic Lover",
        kicker: "VIDEOS",
        screenLabel: "Videos",
      },
      subscribe: {
        title: "Subscribe — Plastic Lover",
        screenLabel: "Subscribe",
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
    },
    languageSelector: {
      label: "Idioma",
    },
    footer: {
      home: "← INICIO",
      replay: "↻ REPETIR",
    },
    home: {
      tagline: "Nuevo sencillo muy pronto. Sé el primero en escucharlo.",
      listenNow: "UNIRSE A LA LISTA",
      scrollToRelease: "Ir al último lanzamiento",
      scrollToPhotos: "Ir a las fotos",
      latestRelease: "ÚLTIMO LANZAMIENTO",
      releaseHeadline: "Plastic Lover — el nuevo sencillo, ya disponible.",
      releaseBody: "Mira el video oficial y lleva la canción contigo — disponible en todas las plataformas.",
      streamEverywhere: "ESCUCHAR EN TODAS PARTES",
    },
    mailingList: {
      kicker: "LISTA DE CORREO",
      headline: "Nuevos sencillos, fechas en vivo y shows secretos. Directo a tu bandeja.",
      placeholder: "tu@correo.com",
      submit: "UNIRSE A LA LISTA",
      joined: "YA ESTÁS EN LA LISTA. SIGUE PLASTIC.",
      footnote: "SIN SPAM. CANCELA CUANDO QUIERAS.",
    },
    pages: {
      contact: {
        title: "Contacto — Plastic Lover",
        kicker: "CONTACTO",
        screenLabel: "Contacto",
        management: "MANAGEMENT",
        booking: "CONTRATACIONES",
        press: "PRENSA",
      },
      live: {
        title: "En Vivo — Plastic Lover",
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
        kicker: "LETRAS",
        screenLabel: "Letras",
        read: "LEER",
      },
      lyricsDetail: {
        fallbackTitle: "Letras — Plastic Lover",
        writtenBy: "ESCRITA POR",
      },
      releases: {
        title: "Lanzamientos — Plastic Lover",
        kicker: "LANZAMIENTOS",
        screenLabel: "Lanzamientos",
        stream: "ESCUCHAR",
        collaborations: "COLABORACIONES",
      },
      releaseDetail: {
        fallbackTitle: "Lanzamiento — Plastic Lover",
      },
      videos: {
        title: "Videos — Plastic Lover",
        kicker: "VIDEOS",
        screenLabel: "Videos",
      },
      subscribe: {
        title: "Suscríbete — Plastic Lover",
        screenLabel: "Suscribirse",
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
