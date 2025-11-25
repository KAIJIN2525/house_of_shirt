// Nigeria States and Major Cities with distances from Lagos (in kilometers)
// This data will be used for Dijkstra's algorithm to calculate delivery costs and times

export const nigeriaLocations = {
  // Format: state name as key, cities as array with distance from Lagos
  Lagos: {
    cities: [
      { name: "Ikeja", distance: 10 },
      { name: "Victoria Island", distance: 15 },
      { name: "Lekki", distance: 25 },
      { name: "Ikorodu", distance: 35 },
      { name: "Epe", distance: 95 },
      { name: "Badagry", distance: 65 },
    ],
    baseDistance: 0, // Lagos is the hub
  },

  Ogun: {
    cities: [
      { name: "Abeokuta", distance: 80 },
      { name: "Ijebu-Ode", distance: 110 },
      { name: "Sagamu", distance: 60 },
      { name: "Ota", distance: 35 },
      { name: "Ilaro", distance: 95 },
    ],
    baseDistance: 80,
  },

  Oyo: {
    cities: [
      { name: "Ibadan", distance: 130 },
      { name: "Ogbomoso", distance: 220 },
      { name: "Oyo", distance: 180 },
      { name: "Iseyin", distance: 210 },
    ],
    baseDistance: 130,
  },

  Osun: {
    cities: [
      { name: "Osogbo", distance: 250 },
      { name: "Ile-Ife", distance: 230 },
      { name: "Ilesa", distance: 260 },
      { name: "Ede", distance: 240 },
    ],
    baseDistance: 250,
  },

  Ondo: {
    cities: [
      { name: "Akure", distance: 340 },
      { name: "Ondo", distance: 280 },
      { name: "Owo", distance: 360 },
    ],
    baseDistance: 340,
  },

  Ekiti: {
    cities: [
      { name: "Ado-Ekiti", distance: 310 },
      { name: "Ikere-Ekiti", distance: 320 },
      { name: "Efon-Alaaye", distance: 330 },
    ],
    baseDistance: 310,
  },

  Kwara: {
    cities: [
      { name: "Ilorin", distance: 310 },
      { name: "Offa", distance: 350 },
      { name: "Jebba", distance: 420 },
    ],
    baseDistance: 310,
  },

  Kogi: {
    cities: [
      { name: "Lokoja", distance: 480 },
      { name: "Okene", distance: 520 },
      { name: "Kabba", distance: 450 },
    ],
    baseDistance: 480,
  },

  Niger: {
    cities: [
      { name: "Minna", distance: 550 },
      { name: "Suleja", distance: 485 },
      { name: "Bida", distance: 600 },
    ],
    baseDistance: 550,
  },

  "Federal Capital Territory": {
    cities: [
      { name: "Abuja", distance: 760 },
      { name: "Gwagwalada", distance: 795 },
      { name: "Kuje", distance: 810 },
    ],
    baseDistance: 760,
  },

  Nasarawa: {
    cities: [
      { name: "Lafia", distance: 850 },
      { name: "Keffi", distance: 780 },
      { name: "Akwanga", distance: 820 },
    ],
    baseDistance: 850,
  },

  Plateau: {
    cities: [
      { name: "Jos", distance: 960 },
      { name: "Bukuru", distance: 970 },
    ],
    baseDistance: 960,
  },

  Benue: {
    cities: [
      { name: "Makurdi", distance: 800 },
      { name: "Gboko", distance: 850 },
      { name: "Otukpo", distance: 880 },
    ],
    baseDistance: 800,
  },

  Taraba: {
    cities: [
      { name: "Jalingo", distance: 1100 },
      { name: "Wukari", distance: 1050 },
    ],
    baseDistance: 1100,
  },

  Adamawa: {
    cities: [
      { name: "Yola", distance: 1200 },
      { name: "Jimeta", distance: 1205 },
      { name: "Mubi", distance: 1350 },
    ],
    baseDistance: 1200,
  },

  Gombe: {
    cities: [
      { name: "Gombe", distance: 1050 },
      { name: "Dukku", distance: 1090 },
    ],
    baseDistance: 1050,
  },

  Bauchi: {
    cities: [
      { name: "Bauchi", distance: 950 },
      { name: "Azare", distance: 1020 },
    ],
    baseDistance: 950,
  },

  Yobe: {
    cities: [
      { name: "Damaturu", distance: 1150 },
      { name: "Potiskum", distance: 1100 },
    ],
    baseDistance: 1150,
  },

  Borno: {
    cities: [
      { name: "Maiduguri", distance: 1320 },
      { name: "Biu", distance: 1200 },
    ],
    baseDistance: 1320,
  },

  Jigawa: {
    cities: [
      { name: "Dutse", distance: 1100 },
      { name: "Hadejia", distance: 1200 },
    ],
    baseDistance: 1100,
  },

  Kano: {
    cities: [
      { name: "Kano", distance: 1050 },
      { name: "Wudil", distance: 1080 },
    ],
    baseDistance: 1050,
  },

  Katsina: {
    cities: [
      { name: "Katsina", distance: 1150 },
      { name: "Daura", distance: 1250 },
      { name: "Funtua", distance: 1100 },
    ],
    baseDistance: 1150,
  },

  Kaduna: {
    cities: [
      { name: "Kaduna", distance: 760 },
      { name: "Zaria", distance: 840 },
      { name: "Kafanchan", distance: 700 },
    ],
    baseDistance: 760,
  },

  Zamfara: {
    cities: [
      { name: "Gusau", distance: 950 },
      { name: "Kaura Namoda", distance: 1000 },
    ],
    baseDistance: 950,
  },

  Sokoto: {
    cities: [
      { name: "Sokoto", distance: 1200 },
      { name: "Tambuwal", distance: 1150 },
    ],
    baseDistance: 1200,
  },

  Kebbi: {
    cities: [
      { name: "Birnin Kebbi", distance: 1100 },
      { name: "Argungu", distance: 1150 },
    ],
    baseDistance: 1100,
  },

  Edo: {
    cities: [
      { name: "Benin City", distance: 320 },
      { name: "Auchi", distance: 420 },
      { name: "Ekpoma", distance: 350 },
    ],
    baseDistance: 320,
  },

  Delta: {
    cities: [
      { name: "Asaba", distance: 420 },
      { name: "Warri", distance: 480 },
      { name: "Sapele", distance: 450 },
      { name: "Ughelli", distance: 490 },
    ],
    baseDistance: 420,
  },

  Anambra: {
    cities: [
      { name: "Awka", distance: 520 },
      { name: "Onitsha", distance: 480 },
      { name: "Nnewi", distance: 510 },
    ],
    baseDistance: 520,
  },

  Enugu: {
    cities: [
      { name: "Enugu", distance: 580 },
      { name: "Nsukka", distance: 650 },
      { name: "Agbani", distance: 600 },
    ],
    baseDistance: 580,
  },

  Ebonyi: {
    cities: [
      { name: "Abakaliki", distance: 720 },
      { name: "Afikpo", distance: 780 },
    ],
    baseDistance: 720,
  },

  Imo: {
    cities: [
      { name: "Owerri", distance: 480 },
      { name: "Orlu", distance: 520 },
      { name: "Okigwe", distance: 550 },
    ],
    baseDistance: 480,
  },

  Abia: {
    cities: [
      { name: "Umuahia", distance: 540 },
      { name: "Aba", distance: 520 },
      { name: "Arochukwu", distance: 650 },
    ],
    baseDistance: 540,
  },

  "Akwa Ibom": {
    cities: [
      { name: "Uyo", distance: 680 },
      { name: "Ikot Ekpene", distance: 650 },
      { name: "Eket", distance: 720 },
    ],
    baseDistance: 680,
  },

  "Cross River": {
    cities: [
      { name: "Calabar", distance: 860 },
      { name: "Ogoja", distance: 920 },
      { name: "Ikom", distance: 900 },
    ],
    baseDistance: 860,
  },

  Rivers: {
    cities: [
      { name: "Port Harcourt", distance: 620 },
      { name: "Eleme", distance: 640 },
      { name: "Bonny", distance: 680 },
    ],
    baseDistance: 620,
  },

  Bayelsa: {
    cities: [
      { name: "Yenagoa", distance: 680 },
      { name: "Brass", distance: 750 },
    ],
    baseDistance: 680,
  },
};

// Hybrid Delivery Pricing Model (Distance-based + Delivery Speed Options)
export const deliveryPricing = {
  baseRatePerKm: 6, // Base rate: ₦6 per kilometer
  minimumFee: 1500, // Minimum delivery fee for Lagos
  freeShippingThreshold: 50000, // Free shipping on orders ≥ ₦50,000

  // Delivery Speed Options (multipliers on base cost)
  speedOptions: {
    economy: {
      name: "Economy",
      multiplier: 0.7, // 30% discount
      description: "5-7 business days",
      daysMin: 5,
      daysMax: 7,
    },
    standard: {
      name: "Standard",
      multiplier: 1.0, // Base price
      description: "2-4 business days",
      daysMin: 2,
      daysMax: 4,
      isDefault: true,
    },
    express: {
      name: "Express",
      multiplier: 1.8, // 80% premium
      description: "1-2 business days",
      daysMin: 1,
      daysMax: 2,
    },
  },

  // Zone-based pricing (simplified for calculation)
  zones: {
    lagos: { maxDistance: 50, baseRate: 1500 },
    nearbyStates: { maxDistance: 200, ratePerKm: 5 },
    southWest: { maxDistance: 400, ratePerKm: 6 },
    southSouth: { maxDistance: 700, ratePerKm: 6 },
    southEast: { maxDistance: 700, ratePerKm: 6 },
    middleBelt: { maxDistance: 900, ratePerKm: 7 },
    northCentral: { maxDistance: 900, ratePerKm: 7 },
    northWest: { maxDistance: 1300, ratePerKm: 8 },
    northEast: { maxDistance: 1400, ratePerKm: 8 },
  },

  // Delivery time estimation (days based on distance and speed)
  deliveryTime: {
    lagos: { maxDistance: 50, standardDays: 1, economyDays: 2, expressDays: 1 },
    nearbyStates: {
      maxDistance: 200,
      standardDays: 2,
      economyDays: 4,
      expressDays: 1,
    },
    mediumDistance: {
      maxDistance: 600,
      standardDays: 3,
      economyDays: 5,
      expressDays: 2,
    },
    farDistance: {
      maxDistance: 1000,
      standardDays: 4,
      economyDays: 6,
      expressDays: 2,
    },
    veryFarDistance: {
      maxDistance: Infinity,
      standardDays: 5,
      economyDays: 7,
      expressDays: 3,
    },
  },
};

// Helper function to get all states
export const getAllStates = () => {
  return Object.keys(nigeriaLocations);
};

// Helper function to get cities in a state
export const getCitiesInState = (state) => {
  return nigeriaLocations[state]?.cities || [];
};

// Helper function to find location
export const findLocation = (state, city = null) => {
  const stateData = nigeriaLocations[state];
  if (!stateData) return null;

  if (city) {
    const cityData = stateData.cities.find(
      (c) => c.name.toLowerCase() === city.toLowerCase()
    );
    return cityData || { name: state, distance: stateData.baseDistance };
  }

  return { name: state, distance: stateData.baseDistance };
};

export default {
  nigeriaLocations,
  deliveryPricing,
  getAllStates,
  getCitiesInState,
  findLocation,
};
