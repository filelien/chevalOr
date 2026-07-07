/** English editorial content — Hôtel Le Cheval d'Or, Anié, Togo */

export const HOTEL = {
  name: "Hôtel Le Cheval d'Or",
  tagline: "Your hotel reference in Anié: comfort, hospitality and excellence for stays and events.",
  slogan: "Live a unique experience in the heart of Anié — comfort, authenticity and excellence.",
  address: "City centre, Anié, Plateaux Region, Togo",
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
  hours: { checkIn: "2:00 PM", checkOut: "12:00 PM", restaurant: "7:00 AM – 10:00 PM" },
  stats: [
    { value: "48", label: "Air-conditioned rooms" },
    { value: "4.8", label: "Average rating" },
    { value: "15+", label: "Years of experience" },
    { value: "24/7", label: "Front desk" },
  ],
};

export const STORY = {
  founded: 2010,
  vision: "To offer Anié a leading hotel address where modern comfort, Togolese hospitality and professionalism meet at the heart of the country.",
  values: ["Hospitality", "Security", "Excellence", "Authenticity"],
  paragraphs: [
    "Located in Anié, at the strategic centre of Togo, Hôtel Le Cheval d'Or is more than a stopover: it is a destination blending rest, business efficiency and cultural discovery.",
    "Our spacious air-conditioned rooms, restaurant with Togolese and international flavours, fully equipped conference hall and attentive team make us the hotel reference of the central region.",
    "Close to national road links, Anié offers a calm, secure setting ideal for work and relaxation with authentic surroundings and warm locals.",
  ],
};

export const WHY_CHOOSE = {
  label: "Your benefits",
  title: "Why choose our hotel in Anié?",
  subtitle: "A central location, personalised service and facilities designed for business and family stays.",
  reasons: [
    { title: "Strategic location", desc: "At the heart of Togo, Anié connects you easily to Lomé, Sokodé, Kara and major towns." },
    { title: "Peaceful & secure", desc: "A calm, welcoming city ideal to recharge, focus or host meetings." },
    { title: "Personalised welcome", desc: "A qualified team available 24/7 from check-in to departure." },
    { title: "Modern conference room", desc: "Equipped space for seminars, training and private events." },
    { title: "Full comfort & services", desc: "Air-conditioned rooms, high-speed Wi-Fi, restaurant, secure parking and laundry." },
    { title: "Excellent value", desc: "Quality hospitality in Anié for business travellers and families." },
  ],
};

export const CONFERENCE = {
  label: "Business events",
  title: "A modern conference room for your events",
  subtitle: "A comfortable, quiet and professional setting with equipment for your participants.",
  capacity: "Up to 80 participants",
  features: ["Screen & projector", "Sound system & mics", "High-speed Wi-Fi", "Air conditioning", "Coffee breaks & catering", "Flexible layouts"],
  uses: ["Professional seminars", "Training & workshops", "Corporate meetings", "Conferences", "General assemblies", "Private ceremonies"],
};

export const ANIE = {
  label: "Destination",
  title: "Discover Anié",
  intro: "Anié is a gem of central Togo: a peaceful city where hospitality, local traditions and a serene environment invite discovery.",
  highlights: [
    "Central geographic position on national road axes",
    "Peaceful and secure city",
    "Cultural richness of the Plateaux region",
    "Warm and welcoming population",
    "Local heritage and typical landscapes",
    "Authentic setting away from big-city hustle",
  ],
};

export const SERVICES = [
  { id: "rooms", title: "Modern air-conditioned rooms", desc: "Spacious rooms, comfortable bedding and AC for optimal rest.", icon: "bed" },
  { id: "wifi", title: "High-speed Wi-Fi", desc: "Fast free connection throughout the property.", icon: "wifi" },
  { id: "restaurant", title: "Restaurant", desc: "Togolese specialities and international cuisine.", icon: "utensils" },
  { id: "conference", title: "Conference room", desc: "Large equipped hall for seminars and events.", icon: "briefcase" },
  { id: "parking", title: "Secure parking", desc: "24/7 monitored parking.", icon: "car" },
  { id: "laundry", title: "Laundry", desc: "Cleaning and ironing for short or long stays.", icon: "shirt" },
  { id: "reception", title: "24/7 reception", desc: "Warm welcome and assistance around the clock.", icon: "bell" },
  { id: "leisure", title: "Relaxation areas", desc: "Pleasant spaces to unwind after work or sightseeing.", icon: "sparkles" },
];

export const EXPERIENCES = [
  { title: "Cultural discovery of Anié", desc: "Guided visit of local traditions and Plateaux heritage.", price: "25,000 XOF", duration: "3h", image: "hero" },
  { title: "Central region excursion", desc: "Tailored tour to villages, markets and natural sites.", price: "65,000 XOF", duration: "Full day", image: "room" },
  { title: "Togolese tasting", desc: "Discovery menu at the restaurant.", price: "18,000 XOF", duration: "2h", image: "restaurant" },
  { title: "Turnkey seminar", desc: "Conference room, coffee breaks and lunch.", price: "On quote", duration: "Full day", image: "hero" },
  { title: "Family stay", desc: "Family room, breakfast and kids activities.", price: "On quote", duration: "Weekend", image: "room" },
  { title: "Private reception", desc: "Birthday, ceremony or meeting — personalised.", price: "On quote", duration: "Evening", image: "restaurant" },
];

export const PACKS = [
  { id: "business", name: "Business Pack", price: 145000, includes: ["Superior room", "Breakfast", "Meeting room 4h", "Premium Wi-Fi"], badge: "Pro" },
  { id: "seminar", name: "Seminar Pack", price: 195000, includes: ["Conference room full day", "Coffee break", "Buffet lunch", "Technical support"], badge: "Event" },
  { id: "family", name: "Family Pack", price: 180000, includes: ["Family room 2 nights", "Breakfast", "Parking", "Relaxation area"], badge: "Family" },
  { id: "discovery", name: "Anié Discovery Pack", price: 125000, includes: ["Room 2 nights", "Guided cultural tour", "Togolese dinner", "Breakfast"], badge: "Tourism" },
];

export const PROMOTIONS = [
  { code: "ANIE20", title: "Early Bird -20%", desc: "Book 21 days ahead and save 20% on your stay in Anié.", discount: 20, until: "2026-12-31" },
  { code: "SEMINAIRE", title: "Seminar -15%", desc: "15% off conference room rental on weekdays.", discount: 15, until: "2026-09-30" },
  { code: "TABLE15", title: "Restaurant -15%", desc: "15% off the menu Tuesday to Thursday.", discount: 15, until: "2026-08-31" },
];

export const FAQ = [
  { q: "What are check-in and check-out times?", a: `Check-in from ${HOTEL.hours.checkIn}, check-out before ${HOTEL.hours.checkOut}. Early/late options subject to availability.` },
  { q: "What payment methods do you accept?", a: "Cash (XOF), Visa/Mastercard, Mobile Money (Flooz, T-Money) and bank transfer." },
  { q: "Is parking available?", a: "Yes, free secure parking 24/7 for hotel guests." },
  { q: "Do you have a conference room?", a: "Yes, a modern hall for up to 80 people with projector, sound and Wi-Fi." },
  { q: "How do I book?", a: "Online on our website, by phone, email or WhatsApp. Confirmation within 24 hours." },
];

export const BLOG_POSTS = [
  { slug: "anie-guide-2026", title: "Anié and the central region: traveller's guide", excerpt: "Traditions, crafts and landscapes — our picks to discover the heart of Togo.", date: "2026-03-15", category: "Tourism", readMin: 6 },
  { slug: "cuisine-togolaise", title: "Togolese flavours at La Table du Cheval d'Or", excerpt: "Our chef celebrates local produce and international classics.", date: "2026-02-20", category: "Dining", readMin: 5 },
  { slug: "organiser-seminaire", title: "Organise your seminar in Anié", excerpt: "Equipped hall, catering and accommodation — all in one place.", date: "2026-01-10", category: "Events", readMin: 7 },
];

export const BLOG_CONTENT: Record<string, string[]> = {
  "anie-guide-2026": [
    "Anié, at the heart of Togo, is an authentic destination where tradition and modernity coexist. From the hotel, explore local markets, regional crafts and the legendary hospitality of the Plateaux.",
    "Our team organises guided tours in French and English. Discover cultural heritage, traditional dances and the green landscapes that make this region rich.",
  ],
  "cuisine-togolaise": [
    "At Cheval d'Or, Togolese cuisine is celebrated: poulet DG, grilled fish, akpan and spicy sauces alongside a refined international menu.",
    "Every morning our chef selects fresh produce from local growers for a generous, authentic table.",
  ],
  "organiser-seminaire": [
    "Our large conference hall hosts seminars, training and general assemblies in a professional, air-conditioned setting.",
    "Tailored packages: half-day or full-day hire, coffee breaks, buffet lunch and on-site accommodation for participants.",
  ],
};

export const GUIDE_ANIE = [
  { name: "Anié city centre", dist: "5 min", desc: "Markets, shops and authentic local life." },
  { name: "Plateaux crafts", dist: "10 min", desc: "Weaving, pottery and traditional objects." },
  { name: "Surrounding villages", dist: "20–45 min", desc: "Discover rural traditions and hospitality." },
  { name: "Central region landscapes", dist: "1h", desc: "Green hills and preserved nature." },
  { name: "Lomé", dist: "2h30", desc: "Capital, beaches and business — accessible via national road." },
  { name: "Sokodé", dist: "2h", desc: "Major northern city, commercial and cultural hub." },
];

export const GUIDE_LOME = GUIDE_ANIE;

export const EVENTS = [
  { title: "Seminars & conferences", desc: "Large equipped hall, sound, video projection. Half-day or full-day packages with catering.", capacity: "80 guests" },
  { title: "Training & workshops", desc: "Calm, professional setting ideal for focus and exchange.", capacity: "60 guests" },
  { title: "Weddings & receptions", desc: "Modular spaces, bespoke menu, dedicated events team.", capacity: "120 guests" },
];

export const TESTIMONIALS = [
  { name: "Kofi A.", role: "Business traveller", quote: "Perfect for my seminars in central Togo. Impeccable service.", stars: 5 },
  { name: "Marie L.", role: "Tourist", quote: "Warm welcome and excellent restaurant. I recommend!", stars: 5 },
  { name: "Enterprise TG", role: "Corporate client", quote: "Our annual meeting went smoothly thanks to the team.", stars: 5 },
];

export const CHEF = {
  name: "Chef Emmanuel Agbeko",
  title: "Executive Chef",
  bio: "Passionate about Togolese flavours and international cuisine, Chef Agbeko creates menus that celebrate local produce with creativity and generosity.",
  awards: ["Local & international cuisine", "Fresh market produce"],
};

export const GALLERY_IMAGES = [
  { src: "hero", alt: "Hotel facade", cat: "Hotel" },
  { src: "room", alt: "Deluxe room", cat: "Rooms" },
  { src: "restaurant", alt: "Restaurant", cat: "Dining" },
];

export const LOYALTY = {
  name: "Cheval d'Or Privilege",
  tiers: [
    { name: "Silver", points: 0, perks: ["5% off dining", "Late check-out 2 PM"] },
    { name: "Gold", points: 500, perks: ["10% dining", "Upgrade if available", "Welcome drink"] },
    { name: "Platinum", points: 1500, perks: ["15% dining", "Conference priority", "Room upgrade"] },
  ],
};

export const HOME = {
  hero: {
    eyebrow: "Anié · Heart of Togo",
    title: "Hôtel Le Cheval d'Or",
    subtitle: "An exceptional address in central Togo — refined rooms, local gastronomy and conference facilities.",
    scrollHint: "Discover the experience",
  },
  quote: {
    text: "In Anié, we don't just offer a room — we welcome you like family, with professionalism and warmth.",
    author: "Le Cheval d'Or Management",
  },
  pillars: [
    { icon: "location", title: "Heart of Togo", source: "Location", desc: "Anié connects major towns via national roads." },
    { icon: "service", title: "Hospitality & service", source: "Welcome", desc: "Attentive team, 24/7 reception and personalised support." },
    { icon: "conference", title: "Conference room", source: "Events", desc: "Modern hall for seminars and ceremonies." },
    { icon: "comfort", title: "Comfort & serenity", source: "Stay", desc: "Air-conditioned rooms, Wi-Fi, restaurant and secure parking." },
  ],
  awards: ["Hotel reference — central region", "Equipped conference room", "24/7 welcome", "Secure parking"],
  press: [
    { quote: "The ideal address to combine business travel and Togolese authenticity.", source: "Travel & Tourism Africa" },
    { quote: "Quality conference and accommodation in the heart of Anié.", source: "Business Togo" },
  ],
  spa: { title: "Relaxation & wellness", subtitle: "Spaces to recharge after work or sightseeing.", features: ["Relaxation area", "Calm atmosphere", "Green setting", "Guaranteed rest"] },
  digital: {
    title: "A unique experience in the heart of Anié",
    subtitle: "Rooms and conference hall — book online or by phone.",
    features: [
      { title: "Online booking", desc: "Rooms and live availability" },
      { title: "My guest account", desc: "Track reservations and invoices" },
      { title: "Event quotes", desc: "Tailored seminars and receptions" },
      { title: "WhatsApp support", desc: "Fast response 7 days a week" },
    ],
  },
  quickNav: [
    { label: "Rooms", to: "/chambres", desc: "Comfort & AC" },
    { label: "Book", to: "/reserver", desc: "Live availability" },
    { label: "Restaurant", to: "/restaurant", desc: "Local & international" },
    { label: "Services", to: "/services", desc: "Amenities" },
    { label: "Events", to: "/evenements", desc: "Conference room" },
    { label: "Anié Guide", to: "/guide", desc: "Explore the region" },
  ],
  location: {
    title: "In the heart of Anié",
    desc: "A peaceful, strategic city in central Togo — calm, security and accessibility.",
    highlights: ["Country centre", "National roads", "Peaceful setting", "Culture & traditions"],
  },
  cta: {
    title: "Live the Cheval d'Or experience",
    subtitle: "Refined rooms and conference hall in Anié. Our team responds within 24 hours.",
    primary: "Book a room",
    secondary: "Conference room",
    secondaryLink: "/conference",
  },
  audiences: ["Business travellers", "National & international tourists", "Families", "Seminars & training", "Private events"],
};
