/** Contenu éditorial premium — Cheval d'Or (inspiré Four Seasons, Aman, Mandarin Oriental) */

export const HOTEL = {
  name: "Hôtel Le Cheval d'Or",
  tagline: "L'art de recevoir à la togolaise",
  address: "Boulevard du Mono, Quartier Administratif, Lomé, Togo",
  phone: "+228 22 21 45 00",
  whatsapp: "22890123456",
  email: "reservation@chevaldor.tg",
  concierge: "conciergerie@chevaldor.tg",
  social: {
    facebook: "https://www.facebook.com/chevaldor",
    instagram: "https://www.instagram.com/chevaldor",
    linkedin: "https://www.linkedin.com/company/cheval-d-or-hotel",
  },
  coords: { lat: 6.1319, lng: 1.2228 },
  hours: { checkIn: "14h00", checkOut: "12h00", restaurant: "19h00 – 23h00" },
  stats: [
    { value: "48", label: "Chambres & suites" },
    { value: "4.9", label: "Note moyenne" },
    { value: "15+", label: "Années d'excellence" },
    { value: "24/7", label: "Conciergerie" },
  ],
};

export const STORY = {
  founded: 2010,
  vision: "Offrir une hospitalité de classe mondiale ancrée dans la culture togolaise, où chaque détail respire l'élégance et la chaleur humaine.",
  values: ["Excellence", "Discrétion", "Authenticité", "Durabilité"],
  paragraphs: [
    "Fondé en 2010 au cœur de Lomé, Le Cheval d'Or est devenu la référence de l'hôtellerie premium au Togo. Notre bâtiment allie architecture contemporaine et touches artisanales locales.",
    "Inspirés par les plus grands palaces — Four Seasons, Aman, The Peninsula — nous avons conçu chaque espace pour éveiller les sens : lumière dorée, textures nobles, service personnalisé.",
    "Notre équipe multilingue anticipe vos besoins avant même que vous les exprimiez. Du check-in digital à la conciergerie sur-mesure, votre séjour est orchestré avec la précision d'un grand hôtel international.",
  ],
};

export const SERVICES = [
  { id: "wifi", title: "Wifi haut débit", desc: "Connexion fibre gratuite dans tout l'établissement.", icon: "wifi" },
  { id: "pool", title: "Piscine infinity", desc: "Bassin chauffé avec vue jardin tropical, serviettes et bar.", icon: "waves" },
  { id: "spa", title: "Spa & bien-être", desc: "Massages, soins visage et rituels africains par nos thérapeutes.", icon: "sparkles" },
  { id: "breakfast", title: "Petit-déjeuner gourmet", desc: "Buffet continental et spécialités togolaises, inclus selon formule.", icon: "coffee" },
  { id: "parking", title: "Parking sécurisé", desc: "Place privée surveillée 24h/24, voiturier sur demande.", icon: "car" },
  { id: "concierge", title: "Conciergerie Clef d'Or", desc: "Réservations, transferts aéroport, excursions sur mesure.", icon: "bell" },
  { id: "roomservice", title: "Room service", desc: "Carte 24h/24, livraison discrète en chambre.", icon: "utensils" },
  { id: "security", title: "Sécurité 24h/24", desc: "Surveillance, accès contrôlé, coffre-fort en chambre.", icon: "shield" },
  { id: "business", title: "Centre d'affaires", desc: "Salles de réunion, imprimante, traduction.", icon: "briefcase" },
  { id: "laundry", title: "Blanchisserie express", desc: "Nettoyage et repassage, retour en 4h.", icon: "shirt" },
  { id: "transfer", title: "Transfert aéroport", desc: "Accueil personnalisé à l'aéroport de Lomé.", icon: "plane" },
  { id: "kids", title: "Family welcome", desc: "Lit bébé, menu enfant, activités familiales.", icon: "baby" },
];

export const EXPERIENCES = [
  { title: "Sunset sur la plage", desc: "Coucher de soleil privatisé avec champagne et fruits tropicaux.", price: "45 000 XOF", duration: "2h", image: "hero" },
  { title: "Tour gastronomique Lomé", desc: "Marché aux poissons, dégustation street food guidée par notre chef.", price: "35 000 XOF", duration: "4h", image: "restaurant" },
  { title: "Rituel spa africain", desc: "Gommage au karité, massage aux baobab, tisane locale.", price: "55 000 XOF", duration: "90min", image: "room" },
  { title: "Excursion Togoville", desc: "Histoire, lac Togo, pirogue traditionnelle.", price: "80 000 XOF", duration: "Journée", image: "hero" },
  { title: "Dîner romantique", desc: "Table privée terrasse, menu dégustation 5 services, violoniste.", price: "120 000 XOF", duration: "3h", image: "restaurant" },
  { title: "Yoga au lever du soleil", desc: "Séance en bord de piscine, petit-déjeuner detox.", price: "25 000 XOF", duration: "1h30", image: "room" },
];

export const PACKS = [
  { id: "romantic", name: "Pack Romantique", price: 185000, includes: ["Suite Deluxe 2 nuits", "Dîner aux chandelles", "Décoration florale", "Champagne"], badge: "Couple" },
  { id: "business", name: "Pack Business", price: 145000, includes: ["Chambre Supérieure", "Petit-déjeuner", "Accès salle réunion 2h", "Wifi premium"], badge: "Pro" },
  { id: "family", name: "Pack Famille", price: 220000, includes: ["Chambre Familiale 3 nuits", "Piscine + activités kids", "Demi-pension", "Transfert aéroport"], badge: "Famille" },
  { id: "wellness", name: "Pack Bien-être", price: 165000, includes: ["Chambre 2 nuits", "Spa 2 soins", "Yoga matinal", "Menu detox"], badge: "Spa" },
];

export const PROMOTIONS = [
  { code: "CHEVAL20", title: "Early Bird -20%", desc: "Réservez 30 jours à l'avance et économisez 20% sur votre séjour.", discount: 20, until: "2026-12-31" },
  { code: "WEEKEND", title: "Week-end Lomé", desc: "2 nuits + petit-déjeuner + dîner pour 2 personnes.", discount: 15, until: "2026-09-30" },
  { code: "TABLE15", title: "Restaurant -15%", desc: "15% sur la carte du mardi au jeudi.", discount: 15, until: "2026-08-31" },
];

export const FAQ = [
  { q: "Quels sont les horaires de check-in et check-out ?", a: `Check-in à partir de ${HOTEL.hours.checkIn}, check-out avant ${HOTEL.hours.checkOut}. Un early check-in ou late check-out peut être arrangé selon disponibilité.` },
  { q: "Quels modes de paiement acceptez-vous ?", a: "Espèces (XOF), cartes Visa/Mastercard, Mobile Money (Flooz, T-Money) et virement bancaire." },
  { q: "Le petit-déjeuner est-il inclus ?", a: "Il est inclus dans nos formules Pack et certaines offres. Sinon, comptez 8 000 XOF par personne." },
  { q: "Puis-je annuler ma réservation ?", a: "Annulation gratuite jusqu'à 48h avant l'arrivée. Au-delà, la première nuit peut être facturée." },
  { q: "L'hôtel est-il adapté aux enfants ?", a: "Oui. Lit bébé gratuit, menu enfant au restaurant, piscine surveillée." },
  { q: "Proposez-vous un transfert aéroport ?", a: "Oui, sur réservation. Comptez 15 000 XOF aller simple depuis l'aéroport de Lomé." },
  { q: "Le restaurant accepte-t-il les réservations ?", a: "Oui, en ligne ou par téléphone. Tenue élégante souhaitée le soir." },
  { q: "Y a-t-il un parking ?", a: "Parking privé gratuit et sécurisé 24h/24 pour tous les clients." },
];

export const BLOG_POSTS = [
  { slug: "lome-guide-2026", title: "Lomé en 48 heures : le guide Cheval d'Or", excerpt: "Plages, marchés, art contemporain — notre sélection des incontournables.", date: "2026-03-15", category: "Tourisme", readMin: 6 },
  { slug: "cuisine-togolaise", title: "L'art culinaire togolais revisité", excerpt: "Notre chef partage ses inspirations entre tradition et gastronomie française.", date: "2026-02-20", category: "Gastronomie", readMin: 5 },
  { slug: "spa-rituels", title: "Rituels bien-être inspirés de Six Senses", excerpt: "Karité, baobab, hibiscus : découvrez nos soins signature.", date: "2026-01-10", category: "Bien-être", readMin: 4 },
  { slug: "mariages-lome", title: "Organiser votre mariage au Cheval d'Or", excerpt: "Salons, terrasse, menu sur mesure — un cadre d'exception.", date: "2025-12-05", category: "Événements", readMin: 7 },
];

export const BLOG_CONTENT: Record<string, string[]> = {
  "lome-guide-2026": [
    "Lomé, capitale dynamique du Togo, offre un mélange unique de modernité et de traditions. Commencez par la plage de Lomé, à quelques minutes de l'hôtel.",
    "Le Grand Marché est incontournable pour l'artisanat : pagnes, sculptures, épices. Notre conciergerie organise des visites guidées en français et anglais.",
    "Ne manquez pas le Musée International du Golfe de Guinée et une excursion en pirogue sur le lac Togo. Nous réservons tout pour vous.",
  ],
  "cuisine-togolaise": [
    "Au Cheval d'Or, la cuisine togolaise est célébrée avec respect et créativité. Le poulet DG, le poisson braisé et l'akpan trouvent leur place aux côtés de classiques français.",
    "Notre chef sélectionne chaque matin les produits au marché de Lomé. Fraîcheur, saisonnalité, traçabilité : les mêmes exigences qu'un palace international.",
  ],
  "spa-rituels": [
    "Inspirés des resorts Six Senses, nos rituels spa combinent ingrédients locaux et techniques professionnelles. Le gommage au karité purifie, le massage aux huiles de baobab relaxe en profondeur.",
  ],
  "mariages-lome": [
    "Le Salon Impérial accueille jusqu'à 150 convives. Terrasse vue jardin pour la cérémonie, menu dégustation personnalisé, suite nuptiale offerte. Notre équipe événements vous accompagne de A à Z.",
  ],
};

export const GUIDE_LOME = [
  { name: "Plage de Lomé", dist: "5 min", desc: "Sable fin, promenade, bars de plage." },
  { name: "Grand Marché", dist: "10 min", desc: "Artisanat, épices, immersion locale." },
  { name: "Musée du Golfe de Guinée", dist: "8 min", desc: "Histoire et cultures ouest-africaines." },
  { name: "Lac Togo & Togoville", dist: "45 min", desc: "Excursion pirogue, village historique." },
  { name: "Kpalimé", dist: "2h", desc: "Montagnes, cascades, café local." },
  { name: "Marché aux fétiches", dist: "15 min", desc: "Traditions vodun, art rituel." },
];

export const EVENTS = [
  { title: "Mariages & réceptions", desc: "Jusqu'à 150 personnes, traiteur sur mesure, décoration florale.", capacity: "150 pers." },
  { title: "Séminaires & conférences", desc: "Salles équipées, pause-café, formules demi-journée ou journée.", capacity: "80 pers." },
  { title: "Anniversaires privés", desc: "Terrasse privatisée, menu personnalisé, animation DJ.", capacity: "40 pers." },
  { title: "Dîners d'entreprise", desc: "Menus dégustation, accords mets-vins, service discret.", capacity: "60 pers." },
];

export const TESTIMONIALS = [
  { name: "Aïcha K.", role: "Directrice, Dakar", quote: "Un niveau Four Seasons au Togo. Service impeccable, chambres somptueuses.", stars: 5 },
  { name: "Jean-Marc L.", role: "Consultant, Paris", quote: "Le restaurant rivalise avec Mandarin Oriental. La table est exceptionnelle.", stars: 5 },
  { name: "Sarah M.", role: "Voyageuse, Londres", quote: "Design Aman, hospitalité togolaise. Mon séjour préféré en Afrique de l'Ouest.", stars: 5 },
  { name: "Fatou D.", role: "Entrepreneure, Lomé", quote: "Organisation mariage parfaite. Équipe attentionnée, cadre magique.", stars: 5 },
];

export const CHEF = {
  name: "Chef Emmanuel Agbeko",
  title: "Executive Chef",
  bio: "Formé en France et au Sénégal, le Chef Agbeko fusionne haute gastronomie française et saveurs ouest-africaines. Sa philosophie : respect du produit, créativité, émotion.",
  awards: ["Meilleur Chef Togo 2024", "Gault&Millau Afrique"],
};

export const GALLERY_IMAGES = [
  { src: "hero", alt: "Façade hôtel au coucher du soleil", cat: "Hôtel" },
  { src: "restaurant", alt: "Salle restaurant La Table", cat: "Restaurant" },
  { src: "room", alt: "Suite Deluxe", cat: "Chambres" },
  { src: "hero", alt: "Piscine infinity", cat: "Loisirs" },
  { src: "restaurant", alt: "Plat signature poisson braisé", cat: "Gastronomie" },
  { src: "room", alt: "Suite familiale", cat: "Chambres" },
  { src: "hero", alt: "Hall d'accueil", cat: "Hôtel" },
  { src: "restaurant", alt: "Terrasse restaurant", cat: "Restaurant" },
  { src: "room", alt: "Salle de bain marbre", cat: "Chambres" },
];

export const LOYALTY = {
  name: "Cheval d'Or Privilege",
  tiers: [
    { name: "Silver", points: 0, perks: ["5% sur restauration", "Late check-out 14h"] },
    { name: "Gold", points: 500, perks: ["10% restauration", "Upgrade si dispo", "Welcome drink"] },
    { name: "Platinum", points: 1500, perks: ["15% restauration", "Suite upgrade", "Spa offert 1h/an"] },
  ],
};

/** Contenu page d'accueil — rubriques inspirées top 10 hôtellerie mondiale */
export const HOME = {
  hero: {
    eyebrow: "Lomé · Togo · Afrique de l'Ouest",
    title: "Hôtel Le Cheval d'Or",
    subtitle: "L'élégance d'un palace international, l'âme chaleureuse du Togo.",
    scrollHint: "Découvrir",
  },
  quote: {
    text: "Chaque séjour est une histoire. Nous en écrivons le premier chapitre dès votre arrivée.",
    author: "Direction Le Cheval d'Or",
  },
  pillars: [
    { icon: "design", title: "Design & sérénité", source: "Inspiré Aman", desc: "Minimalisme luxueux, matières nobles, lumière dorée. Chaque espace respire le calme et la distinction." },
    { icon: "service", title: "Service sur-mesure", source: "Inspiré Four Seasons", desc: "Conciergerie Clef d'Or, anticipation discrète, attention personnalisée à chaque instant de votre séjour." },
    { icon: "gastronomy", title: "Table d'exception", source: "Inspiré Mandarin Oriental", desc: "Cuisine franco-togolaise, cave sélectionnée, chef executive primé. Le restaurant comme destination." },
    { icon: "wellness", title: "Bien-être total", source: "Inspiré Six Senses", desc: "Spa rituels africains, piscine infinity, yoga au lever du soleil. Corps et esprit en harmonie." },
  ],
  awards: [
    "Meilleur Hôtel Business Togo 2025",
    "Excellence Gastronomique — Lomé",
    "TripAdvisor Travellers' Choice",
    "Clef d'Or Concierge",
  ],
  press: [
    { quote: "Un niveau Four Seasons au cœur de l'Afrique de l'Ouest.", source: "Condé Nast Traveller" },
    { quote: "La table rivalise avec les grandes adresses parisiennes.", source: "Gault&Millau Afrique" },
  ],
  spa: {
    title: "Spa & bien-être",
    subtitle: "Rituels inspirés des resorts Six Senses — karité, baobab, sérénité absolue.",
    features: ["Massages signature", "Soins visage bio", "Hammam & sauna", "Yoga & méditation"],
  },
  digital: {
    title: "Séjour connecté",
    subtitle: "Comme chez Hilton & Hyatt — simplicité et contrôle.",
    features: [
      { title: "Check-in digital", desc: "Enregistrement depuis votre mobile" },
      { title: "Mon espace client", desc: "Réservations, factures, historique" },
      { title: "Room service QR", desc: "Commandez depuis votre chambre" },
      { title: "Conciergerie WhatsApp", desc: "Assistance instantanée 24h/24" },
    ],
  },
  quickNav: [
    { label: "Chambres", to: "/chambres", desc: "Suites & villas" },
    { label: "Réserver", to: "/reserver", desc: "Disponibilité live" },
    { label: "Restaurant", to: "/restaurant", desc: "Carte & tables" },
    { label: "Spa", to: "/services", desc: "Bien-être" },
    { label: "Événements", to: "/evenements", desc: "Mariages & séminaires" },
    { label: "Guide Lomé", to: "/guide", desc: "Excursions" },
  ],
  location: {
    title: "Au cœur de Lomé",
    desc: "À 15 min de l'aéroport, 5 min de la plage. Le Togo vous attend — marchés, lac Togo, culture vodun.",
    highlights: ["Plage 5 min", "Aéroport 15 min", "Centre-ville 8 min", "Lac Togo 45 min"],
  },
};
