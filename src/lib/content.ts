/** Contenu éditorial — Hôtel Le Cheval d'Or, Anié (centre du Togo) */

export const HOTEL = {
  name: "Hôtel Le Cheval d'Or",
  tagline: "Votre référence hôtelière à Anié : confort, hospitalité et excellence pour vos séjours et événements.",
  slogan: "Vivez une expérience unique au cœur d'Anié — confort, authenticité et excellence.",
  address: "Centre-ville, Anié, Région des Plateaux, Togo",
  phone: "+228 22 21 45 00",
  whatsapp: "22890123456",
  email: "reservation@chevaldor.tg",
  concierge: "conciergerie@chevaldor.tg",
  social: {
    facebook: "https://www.facebook.com/chevaldor",
    instagram: "https://www.instagram.com/chevaldor",
    linkedin: "https://www.linkedin.com/company/cheval-d-or-hotel",
  },
  coords: { lat: 7.5833, lng: 1.2 },
  hours: { checkIn: "14h00", checkOut: "12h00", restaurant: "7h00 – 22h00" },
  stats: [
    { value: "48", label: "Chambres climatisées" },
    { value: "4.8", label: "Note moyenne" },
    { value: "15+", label: "Années d'expérience" },
    { value: "24/7", label: "Accueil & réception" },
  ],
};

export const STORY = {
  founded: 2010,
  vision:
    "Offrir à Anié une adresse hôtelière de référence, où confort moderne, hospitalité togolaise et professionnalisme se rencontrent au cœur du pays.",
  values: ["Hospitalité", "Sécurité", "Excellence", "Authenticité"],
  paragraphs: [
    "Situé à Anié, au centre stratégique du Togo, l'Hôtel Le Cheval d'Or est bien plus qu'un lieu de passage : c'est une destination où se mêlent repos, efficacité professionnelle et découverte culturelle. Dans une ville paisible et accueillante, nous accueillons voyageurs d'affaires, touristes, familles et organisateurs d'événements avec le même souci d'excellence.",
    "Nos chambres spacieuses et climatisées, notre restaurant aux saveurs togolaises et internationales, notre grande salle de conférence équipée et notre équipe attentive font de nous la référence hôtelière de la région centrale. Que vous veniez pour un séminaire, une formation, une réunion d'entreprise ou un séjour de détente, chaque détail est pensé pour votre confort.",
    "À deux pas des axes routiers reliant les principales villes du Togo, Anié offre un cadre calme et sécurisé, propice au travail comme à la détente. Ici, vous profitez d'un environnement authentique, d'une population chaleureuse et d'un patrimoine culturel riche — le tout avec les standards d'un établissement moderne et professionnel.",
  ],
};

export const WHY_CHOOSE = {
  label: "Vos avantages",
  title: "Pourquoi choisir notre hôtel à Anié ?",
  subtitle:
    "Une adresse centrale, un service personnalisé et des équipements pensés pour les séjours professionnels comme les escapades en famille.",
  reasons: [
    {
      title: "Emplacement stratégique",
      desc: "Au cœur du Togo, Anié facilite vos déplacements vers Lomé, Sokodé, Kara et les principales localités du pays.",
    },
    {
      title: "Cadre paisible & sécurisé",
      desc: "Une ville calme et accueillante, idéale pour se ressourcer, travailler en concentration ou organiser vos réunions.",
    },
    {
      title: "Accueil personnalisé",
      desc: "Une équipe qualifiée, disponible 24h/24, attentive à chaque demande — du check-in au départ.",
    },
    {
      title: "Salle de conférence moderne",
      desc: "Un espace équipé pour séminaires, formations, colloques et événements privés dans les meilleures conditions.",
    },
    {
      title: "Confort & services complets",
      desc: "Chambres climatisées, Wi-Fi haut débit, restaurant, parking sécurisé et blanchisserie sur place.",
    },
    {
      title: "Excellent rapport qualité-prix",
      desc: "Une expérience hôtelière de qualité au cœur d'Anié, accessible aux voyageurs d'affaires et aux familles.",
    },
  ],
};

export const CONFERENCE = {
  label: "Événements professionnels",
  title: "Une salle de conférence moderne pour vos événements",
  subtitle:
    "Un cadre confortable, calme et professionnel, avec des équipements adaptés pour accueillir vos participants dans les meilleures conditions.",
  capacity: "Jusqu'à 80 participants",
  features: [
    "Écran & vidéoprojecteur",
    "Sonorisation & micros",
    "Wi-Fi haut débit",
    "Climatisation",
    "Pause-café & restauration sur demande",
    "Disposition modulable (théâtre, U, classe)",
  ],
  uses: [
    "Séminaires professionnels",
    "Formations & ateliers",
    "Réunions d'entreprises",
    "Conférences & colloques",
    "Assemblées générales",
    "Cérémonies & événements privés",
  ],
};

export const ANIE = {
  label: "Destination",
  title: "Découvrir Anié",
  intro:
    "Anié est une perle du centre du Togo : une ville paisible où l'hospitalité des habitants, les traditions locales et un environnement serein invitent à la découverte. Idéale pour les voyageurs en quête d'authenticité, elle constitue aussi un point de départ pratique pour explorer la région des Plateaux et le reste du pays.",
  highlights: [
    "Situation géographique centrale, au carrefour des axes routiers nationaux",
    "Ville paisible et sécurisée, propice au repos et à la concentration",
    "Richesse culturelle et traditions vivantes de la région des Plateaux",
    "Population chaleureuse et accueillante",
    "Patrimoine local et paysages typiques du centre du Togo",
    "Cadre authentique, loin de l'agitation des grandes métropoles",
  ],
};

export const SERVICES = [
  {
    id: "rooms",
    title: "Chambres modernes & climatisées",
    desc: "Espaces spacieux, literie confortable et climatisation pour un repos optimal.",
    icon: "bed",
  },
  {
    id: "wifi",
    title: "Wi-Fi haut débit",
    desc: "Connexion rapide et gratuite dans tout l'établissement, idéale pour le télétravail.",
    icon: "wifi",
  },
  {
    id: "restaurant",
    title: "Restaurant",
    desc: "Spécialités togolaises et cuisine internationale, du petit-déjeuner au dîner.",
    icon: "utensils",
  },
  {
    id: "conference",
    title: "Salle de conférence",
    desc: "Grande salle équipée pour séminaires, formations, réunions et événements privés.",
    icon: "briefcase",
  },
  {
    id: "parking",
    title: "Parking sécurisé",
    desc: "Stationnement surveillé 24h/24 pour votre tranquillité d'esprit.",
    icon: "car",
  },
  {
    id: "laundry",
    title: "Blanchisserie",
    desc: "Service de nettoyage et repassage pour les séjours courts ou longs.",
    icon: "shirt",
  },
  {
    id: "reception",
    title: "Réception 24h/24",
    desc: "Accueil chaleureux et assistance à toute heure, 7 jours sur 7.",
    icon: "bell",
  },
  {
    id: "leisure",
    title: "Espace détente & loisirs",
    desc: "Coins de relaxation agréables pour vous ressourcer après une journée de travail ou de visite.",
    icon: "sparkles",
  },
];

export const EXPERIENCES = [
  {
    title: "Découverte culturelle d'Anié",
    desc: "Visite guidée des traditions locales, artisanat et patrimoine de la région des Plateaux.",
    price: "25 000 XOF",
    duration: "3h",
    image: "hero",
  },
  {
    title: "Excursion région centrale",
    desc: "Circuit sur mesure vers les villages, marchés et sites naturels des environs.",
    price: "65 000 XOF",
    duration: "Journée",
    image: "room",
  },
  {
    title: "Dégustation togolaise",
    desc: "Menu découverte au restaurant : saveurs locales et accords du chef.",
    price: "18 000 XOF",
    duration: "2h",
    image: "restaurant",
  },
  {
    title: "Séminaire clé en main",
    desc: "Salle de conférence, pauses café et déjeuner — organisation complète.",
    price: "Sur devis",
    duration: "Journée",
    image: "hero",
  },
  {
    title: "Séjour famille",
    desc: "Chambre familiale, petit-déjeuner et activités adaptées aux enfants.",
    price: "Sur devis",
    duration: "Week-end",
    image: "room",
  },
  {
    title: "Réception privée",
    desc: "Anniversaire, cérémonie ou réunion — espace et restauration personnalisés.",
    price: "Sur devis",
    duration: "Soirée",
    image: "restaurant",
  },
];

export const PACKS = [
  {
    id: "business",
    name: "Pack Business",
    price: 145000,
    includes: ["Chambre Supérieure", "Petit-déjeuner", "Salle de réunion 4h", "Wi-Fi premium"],
    badge: "Pro",
  },
  {
    id: "seminar",
    name: "Pack Séminaire",
    price: 195000,
    includes: ["Salle de conférence journée", "Pause-café", "Déjeuner buffet", "Support technique"],
    badge: "Événement",
  },
  {
    id: "family",
    name: "Pack Famille",
    price: 180000,
    includes: ["Chambre Familiale 2 nuits", "Petit-déjeuner", "Parking", "Espace détente"],
    badge: "Famille",
  },
  {
    id: "discovery",
    name: "Pack Découverte Anié",
    price: 125000,
    includes: ["Chambre 2 nuits", "Visite culturelle guidée", "Dîner togolais", "Petit-déjeuner"],
    badge: "Tourisme",
  },
];

export const PROMOTIONS = [
  {
    code: "ANIE20",
    title: "Early Bird -20%",
    desc: "Réservez 21 jours à l'avance et économisez 20 % sur votre séjour à Anié.",
    discount: 20,
    until: "2026-12-31",
  },
  {
    code: "SEMINAIRE",
    title: "Séminaire -15%",
    desc: "15 % sur la location de la salle de conférence en semaine.",
    discount: 15,
    until: "2026-09-30",
  },
  {
    code: "TABLE15",
    title: "Restaurant -15%",
    desc: "15 % sur la carte du mardi au jeudi.",
    discount: 15,
    until: "2026-08-31",
  },
];

export const FAQ = [
  {
    q: "Quels sont les horaires de check-in et check-out ?",
    a: `Check-in à partir de ${HOTEL.hours.checkIn}, check-out avant ${HOTEL.hours.checkOut}. Un early check-in ou late check-out peut être arrangé selon disponibilité.`,
  },
  {
    q: "Quels modes de paiement acceptez-vous ?",
    a: "Espèces (XOF), cartes Visa/Mastercard, Mobile Money (Flooz, T-Money) et virement bancaire.",
  },
  {
    q: "Le petit-déjeuner est-il inclus ?",
    a: "Il est inclus dans nos formules Pack. Sinon, comptez 8 000 XOF par personne.",
  },
  {
    q: "Puis-je réserver la salle de conférence ?",
    a: "Oui, en ligne via notre page Contact ou par téléphone. Nous proposons des formules demi-journée, journée et séminaire clé en main.",
  },
  {
    q: "L'hôtel est-il adapté aux enfants et aux familles ?",
    a: "Oui. Chambres familiales, menu enfant au restaurant et cadre sécurisé pour un séjour serein.",
  },
  {
    q: "Y a-t-il un parking ?",
    a: "Parking privé gratuit et sécurisé 24h/24 pour tous les clients.",
  },
  {
    q: "Le Wi-Fi est-il disponible ?",
    a: "Oui, connexion haut débit gratuite dans les chambres, le restaurant et la salle de conférence.",
  },
  {
    q: "Pourquoi séjourner à Anié plutôt qu'à Lomé ?",
    a: "Anié offre un cadre plus calme et central, idéal pour les voyages d'affaires traversant le pays, les séminaires et la découverte authentique du Togo.",
  },
];

export const BLOG_POSTS = [
  {
    slug: "anie-guide-2026",
    title: "Anié et la région centrale : guide du voyageur",
    excerpt: "Traditions, artisanat et paysages — notre sélection pour découvrir le cœur du Togo.",
    date: "2026-03-15",
    category: "Tourisme",
    readMin: 6,
  },
  {
    slug: "cuisine-togolaise",
    title: "Saveurs togolaises à la Table du Cheval d'Or",
    excerpt: "Notre chef célèbre les produits locaux et les classiques internationaux.",
    date: "2026-02-20",
    category: "Gastronomie",
    readMin: 5,
  },
  {
    slug: "organiser-seminaire",
    title: "Organiser votre séminaire à Anié",
    excerpt: "Salle équipée, restauration et hébergement — tout au même endroit.",
    date: "2026-01-10",
    category: "Événements",
    readMin: 4,
  },
  {
    slug: "voyage-affaires-togo",
    title: "Voyage d'affaires au centre du Togo",
    excerpt: "Pourquoi Anié est le hub idéal entre Lomé et le nord du pays.",
    date: "2025-12-05",
    category: "Business",
    readMin: 5,
  },
];

export const BLOG_CONTENT: Record<string, string[]> = {
  "anie-guide-2026": [
    "Anié, au cœur du Togo, est une destination authentique où traditions et modernité coexistent harmonieusement. Depuis l'hôtel, explorez les marchés locaux, l'artisanat régional et l'hospitalité légendaire des Plateaux.",
    "Notre équipe organise des visites guidées en français et en anglais. Découvrez le patrimoine culturel, les danses traditionnelles et les paysages verdoyants qui font la richesse de cette région.",
  ],
  "cuisine-togolaise": [
    "Au Cheval d'Or, la cuisine togolaise est à l'honneur : poulet DG, poisson braisé, akpan et sauces épicées côtoient une carte internationale soignée.",
    "Chaque matin, notre chef sélectionne les produits frais auprès des producteurs locaux pour une table généreuse et authentique.",
  ],
  "organiser-seminaire": [
    "Notre grande salle de conférence accueille séminaires, formations et assemblées générales dans un cadre professionnel et climatisé.",
    "Formules sur mesure : location demi-journée ou journée, pauses café, déjeuner buffet et hébergement des participants sur place.",
  ],
  "voyage-affaires-togo": [
    "Positionnée au centre du pays, Anié réduit les temps de trajet entre les principales villes togolaises. Un atout majeur pour les entreprises et les délégations en déplacement.",
  ],
};

export const GUIDE_ANIE = [
  { name: "Centre-ville d'Anié", dist: "5 min", desc: "Marchés, commerces et vie locale authentique." },
  { name: "Artisanat des Plateaux", dist: "10 min", desc: "Tissage, poterie et objets traditionnels." },
  { name: "Villages environnants", dist: "20–45 min", desc: "Découverte des traditions et de l'hospitalité rurale." },
  { name: "Paysages de la région centrale", dist: "1h", desc: "Collines verdoyantes et nature préservée." },
  { name: "Lomé", dist: "2h30", desc: "Capitale, plages et affaires — accessible par la route nationale." },
  { name: "Sokodé", dist: "2h", desc: "Grande ville du nord, carrefour commercial et culturel." },
];

/** @deprecated Utiliser GUIDE_ANIE */
export const GUIDE_LOME = GUIDE_ANIE;

export const EVENTS = [
  {
    title: "Séminaires & conférences",
    desc: "Grande salle équipée, sonorisation, vidéoprojection. Formules demi-journée ou journée avec restauration.",
    capacity: "80 pers.",
  },
  {
    title: "Formations & ateliers",
    desc: "Cadre calme et professionnel, idéal pour la concentration et l'échange.",
    capacity: "60 pers.",
  },
  {
    title: "Mariages & réceptions",
    desc: "Espaces modulables, menu sur mesure, équipe événementielle dédiée.",
    capacity: "120 pers.",
  },
  {
    title: "Réunions d'entreprise",
    desc: "Hébergement + salle de réunion + restauration — solution tout-en-un à Anié.",
    capacity: "40 pers.",
  },
];

export const TESTIMONIALS = [
  {
    name: "Koffi A.",
    role: "Directeur RH, Lomé",
    quote: "Nous avons organisé notre séminaire annuel ici : salle impeccable, équipe réactive, cadre parfait pour travailler.",
    stars: 5,
  },
  {
    name: "Marie T.",
    role: "Consultante, Paris",
    quote: "Un havre de paix au centre du Togo. Chambres confortables et restaurant excellent.",
    stars: 5,
  },
  {
    name: "Aminata S.",
    role: "Touriste, Dakar",
    quote: "Découvrir Anié depuis cet hôtel a été une belle surprise. Accueil chaleureux et authenticité.",
    stars: 5,
  },
  {
    name: "Jean-Baptiste M.",
    role: "Entrepreneur, Kara",
    quote: "Emplacement idéal pour mes déplacements professionnels. Wi-Fi fiable et parking sécurisé.",
    stars: 5,
  },
];

export const CHEF = {
  name: "Chef Emmanuel Agbeko",
  title: "Chef exécutif",
  bio: "Passionné par la cuisine togolaise et les saveurs internationales, le Chef Agbeko compose une carte qui célèbre les produits locaux avec créativité et générosité.",
  awards: ["Cuisine locale & internationale", "Produits frais du marché"],
};

export const GALLERY_IMAGES = [
  { src: "hero", alt: "Façade de l'hôtel à Anié", cat: "Hôtel" },
  { src: "restaurant", alt: "Restaurant — spécialités togolaises", cat: "Restaurant" },
  { src: "room", alt: "Chambre climatisée", cat: "Chambres" },
  { src: "hero", alt: "Hall d'accueil", cat: "Hôtel" },
  { src: "restaurant", alt: "Salle de conférence", cat: "Événements" },
  { src: "room", alt: "Chambre familiale", cat: "Chambres" },
  { src: "hero", alt: "Espace détente", cat: "Loisirs" },
  { src: "restaurant", alt: "Terrasse restaurant", cat: "Restaurant" },
  { src: "room", alt: "Suite confort", cat: "Chambres" },
];

export const LOYALTY = {
  name: "Cheval d'Or Privilege",
  tiers: [
    { name: "Silver", points: 0, perks: ["5 % sur restauration", "Late check-out 14h"] },
    { name: "Gold", points: 500, perks: ["10 % restauration", "Upgrade si dispo", "Welcome drink"] },
    { name: "Platinum", points: 1500, perks: ["15 % restauration", "Priorité salle conférence", "Surclassement"] },
  ],
};

/** Contenu page d'accueil */
export const HOME = {
  hero: {
    eyebrow: "Anié · Cœur du Togo",
    title: "Hôtel Le Cheval d'Or",
    subtitle: "Une adresse d'exception au centre du Togo — chambres raffinées, gastronomie locale et salle de conférence pour vos événements.",
    scrollHint: "Découvrir l'expérience",
  },
  quote: {
    text: "À Anié, nous ne vous offrons pas seulement une chambre — nous vous accueillons comme chez vous, avec professionnalisme et chaleur.",
    author: "Direction Le Cheval d'Or",
  },
  pillars: [
    {
      icon: "location",
      title: "Au cœur du Togo",
      source: "Emplacement",
      desc: "Anié, ville centrale et paisible, relie facilement les principales localités du pays par les axes routiers nationaux.",
    },
    {
      icon: "service",
      title: "Hospitalité & service",
      source: "Accueil",
      desc: "Équipe attentive, réception 24h/24 et accompagnement personnalisé pour chaque séjour ou événement.",
    },
    {
      icon: "conference",
      title: "Salle de conférence",
      source: "Événements",
      desc: "Grande salle moderne pour séminaires, formations, réunions et cérémonies — équipements professionnels inclus.",
    },
    {
      icon: "comfort",
      title: "Confort & sérénité",
      source: "Hébergement",
      desc: "Chambres climatisées, Wi-Fi haut débit, restaurant, parking sécurisé et espaces de détente.",
    },
  ],
  awards: [
    "Référence hôtelière — région centrale",
    "Salle de conférence équipée",
    "Accueil 24h/24",
    "Parking sécurisé",
  ],
  press: [
    { quote: "L'adresse idéale pour combiner voyage d'affaires et authenticité togolaise.", source: "Voyage & Tourisme Afrique" },
    { quote: "Une salle de conférence et un hébergement de qualité au cœur d'Anié.", source: "Business Togo" },
  ],
  spa: {
    title: "Détente & bien-être",
    subtitle: "Espaces de relaxation pour vous ressourcer après une journée de travail ou de découverte.",
    features: ["Espace détente", "Ambiance calme", "Cadre verdoyant", "Repos garanti"],
  },
  digital: {
    title: "Vivez une expérience unique au cœur d'Anié",
    subtitle: "Chambres et salle de conférence — réservation en ligne ou par téléphone.",
    features: [
      { title: "Réservation en ligne", desc: "Chambres et disponibilités en temps réel" },
      { title: "Mon espace client", desc: "Suivi de vos réservations et factures" },
      { title: "Devis événements", desc: "Séminaires et réceptions sur mesure" },
      { title: "Assistance WhatsApp", desc: "Réponse rapide 7j/7" },
    ],
  },
  quickNav: [
    { label: "Chambres", to: "/chambres", desc: "Confort & climatisation" },
    { label: "Réserver", to: "/reserver", desc: "Disponibilité live" },
    { label: "Restaurant", to: "/restaurant", desc: "Cuisine locale & internationale" },
    { label: "Services", to: "/services", desc: "Équipements" },
    { label: "Événements", to: "/evenements", desc: "Salle de conférence" },
    { label: "Guide Anié", to: "/guide", desc: "Découvrir la région" },
  ],
  location: {
    title: "Au cœur d'Anié",
    desc: "Une ville paisible et stratégique au centre du Togo — calme, sécurité et accessibilité pour vos déplacements professionnels et touristiques.",
    highlights: ["Centre du pays", "Axes routiers nationaux", "Cadre paisible", "Culture & traditions"],
  },
  cta: {
    title: "Vivez l'expérience Cheval d'Or",
    subtitle:
      "Chambres raffinées et salle de conférence au cœur d'Anié. Notre équipe vous répond sous 24 h.",
    primary: "Réserver une chambre",
    secondary: "Salle de conférence",
    secondaryLink: "/conference",
  },
  audiences: [
    "Voyageurs d'affaires",
    "Touristes nationaux & internationaux",
    "Familles",
    "Séminaires & formations",
    "Événements privés",
  ],
};
