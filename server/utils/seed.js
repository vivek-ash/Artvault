const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Artwork = require('../models/Artwork');
const Notification = require('../models/Notification');

// ── Placeholder images (picsum) ─────────────────────────────────────────────
const img = (id, w = 800, h = 1000) => `https://picsum.photos/id/${id}/${w}/${h}`;
const thumb = (id) => img(id, 400, 500);

// ── Artists ──────────────────────────────────────────────────────────────────
const artists = [
  { name: 'Aria Chen', email: 'artist1@artvault.com', password: 'Artist@123', role: 'artist', bio: 'Digital painter specializing in ethereal landscapes and surreal portraits. Based in Taipei.', isVerifiedArtist: true },
  { name: 'Marcus Rivera', email: 'artist2@artvault.com', password: 'Artist@123', role: 'artist', bio: '3D artist and sculptor creating mesmerizing abstract digital forms.', isVerifiedArtist: true },
  { name: 'Yuki Tanaka', email: 'artist3@artvault.com', password: 'Artist@123', role: 'artist', bio: 'Concept artist for AAA game studios. Loves cyberpunk and fantasy worlds.', isVerifiedArtist: true },
  { name: 'Priya Sharma', email: 'artist4@artvault.com', password: 'Artist@123', role: 'artist', bio: 'Traditional-meets-digital artist inspired by Indian miniature paintings and folk art.', isVerifiedArtist: true },
  { name: 'Leo Fischer', email: 'artist5@artvault.com', password: 'Artist@123', role: 'artist', bio: 'Generative art pioneer. Code is my brush, algorithms are my muse.', isVerifiedArtist: true },
  { name: 'Sofia Morales', email: 'artist6@artvault.com', password: 'Artist@123', role: 'artist', bio: 'Illustrator and visual storyteller. Editorial and book cover specialist.', isVerifiedArtist: false },
  { name: 'James Okafor', email: 'artist7@artvault.com', password: 'Artist@123', role: 'artist', bio: 'Afrofuturist digital painter exploring identity, culture, and technology.', isVerifiedArtist: true },
  { name: 'Elena Volkov', email: 'artist8@artvault.com', password: 'Artist@123', role: 'artist', bio: 'Pixel art enthusiast. Retro aesthetics for the modern age.', isVerifiedArtist: false },
  { name: 'Ravi Patel', email: 'artist9@artvault.com', password: 'Artist@123', role: 'artist', bio: 'Photographer and digital collage artist. Finding beauty in chaos.', isVerifiedArtist: true },
  { name: 'Chloe Martin', email: 'artist10@artvault.com', password: 'Artist@123', role: 'artist', bio: 'Abstract expressionist working in bold colors and fluid forms.', isVerifiedArtist: true },
];

// ── Buyers ───────────────────────────────────────────────────────────────────
const buyers = [
  { name: 'Sarah Mitchell', email: 'buyer1@artvault.com', password: 'Buyer@123', role: 'buyer' },
  { name: 'David Park', email: 'buyer2@artvault.com', password: 'Buyer@123', role: 'buyer' },
  { name: 'Anika Gupta', email: 'buyer3@artvault.com', password: 'Buyer@123', role: 'buyer' },
  { name: 'Tom Williams', email: 'buyer4@artvault.com', password: 'Buyer@123', role: 'buyer' },
  { name: 'Mia Johnson', email: 'buyer5@artvault.com', password: 'Buyer@123', role: 'buyer' },
];

// ── Admin ────────────────────────────────────────────────────────────────────
const admin = { name: 'Admin User', email: 'surajjash2005@gmail.com', password: 'Admin@123', role: 'admin' };

// ── Artwork templates (120 artworks across all categories) ───────────────────
const artworkTemplates = [
  // Digital Painting (15)
  { title: 'Celestial Cascade', category: 'Digital Painting', medium: 'Digital', price: 4500, styleTags: ['Fantasy', 'Ethereal'], desc: 'A breathtaking waterfall of light pouring from a shattered moon.', pid: 10 },
  { title: 'Crimson Horizon', category: 'Digital Painting', medium: 'Digital', price: 3200, styleTags: ['Landscape', 'Sunset'], desc: 'Vast desert plains meeting an impossibly red sky at twilight.', pid: 11 },
  { title: 'Emerald Depths', category: 'Digital Painting', medium: 'Digital', price: 5800, styleTags: ['Underwater', 'Nature'], desc: 'Deep ocean bioluminescence illuminating ancient coral structures.', pid: 12 },
  { title: 'Whispers of Autumn', category: 'Digital Painting', medium: 'Digital', price: 2900, styleTags: ['Nature', 'Seasonal'], desc: 'Golden leaves swirling in a misty forest clearing at dawn.', pid: 13 },
  { title: 'Nebula Dreams', category: 'Digital Painting', medium: 'Digital', price: 7200, styleTags: ['Space', 'Cosmic'], desc: 'A cosmic nursery where new stars are born in vibrant gas clouds.', pid: 14 },
  { title: 'The Last Garden', category: 'Digital Painting', medium: 'Digital', price: 6100, styleTags: ['Post-apocalyptic', 'Nature'], desc: 'Flowers blooming defiantly through cracked concrete in an abandoned city.', pid: 15 },
  { title: 'Moonlit Pagoda', category: 'Digital Painting', medium: 'Digital', price: 4800, styleTags: ['Asian', 'Architectural'], desc: 'An ancient temple bathed in silver moonlight on a misty mountain.', pid: 16 },
  { title: 'Storm Chaser', category: 'Digital Painting', medium: 'Digital', price: 3500, styleTags: ['Weather', 'Dramatic'], desc: 'A lone figure standing before an approaching supercell thunderstorm.', pid: 17 },
  { title: 'Sakura Bridge', category: 'Digital Painting', medium: 'Digital', price: 4200, styleTags: ['Japanese', 'Spring'], desc: 'Cherry blossoms floating over a traditional stone bridge at sunrise.', pid: 18 },
  { title: 'Volcanic Dawn', category: 'Digital Painting', medium: 'Digital', price: 5500, styleTags: ['Volcanic', 'Dramatic'], desc: 'First light striking an active volcano with rivers of molten lava.', pid: 19 },
  { title: 'Azure Solitude', category: 'Digital Painting', medium: 'Digital', price: 3800, styleTags: ['Ocean', 'Minimalist'], desc: 'A single sailboat on an endless calm blue ocean under clear skies.', pid: 20 },
  { title: 'Enchanted Hollow', category: 'Digital Painting', medium: 'Digital', price: 4100, styleTags: ['Fantasy', 'Forest'], desc: 'A hidden forest clearing where fireflies dance among ancient oaks.', pid: 21 },
  { title: 'Frozen Kingdoms', category: 'Digital Painting', medium: 'Digital', price: 6800, styleTags: ['Ice', 'Fantasy'], desc: 'Crystal ice castles rising from a frozen lake under the aurora borealis.', pid: 22 },
  { title: 'Desert Mirage', category: 'Digital Painting', medium: 'Digital', price: 3100, styleTags: ['Desert', 'Surreal'], desc: 'Impossible water reflections in endless sand dunes at high noon.', pid: 23 },
  { title: 'Twilight City', category: 'Digital Painting', medium: 'Digital', price: 5200, styleTags: ['Urban', 'Twilight'], desc: 'A futuristic skyline where buildings merge with organic growth.', pid: 24 },

  // Illustration (15)
  { title: 'The Clockwork Fox', category: 'Illustration', medium: 'Digital Illustration', price: 2800, styleTags: ['Steampunk', 'Animal'], desc: 'A mechanical fox assembled from brass gears and copper springs.', pid: 25 },
  { title: 'Botanical Alphabet', category: 'Illustration', medium: 'Ink & Digital', price: 1800, styleTags: ['Typography', 'Botanical'], desc: 'Each letter of the alphabet formed by intertwining wildflowers and vines.', pid: 26 },
  { title: 'Midnight Express', category: 'Illustration', medium: 'Digital Illustration', price: 3400, styleTags: ['Transport', 'Vintage'], desc: 'An art deco style poster of a steam locomotive cutting through the night.', pid: 27 },
  { title: 'The Map Maker', category: 'Illustration', medium: 'Ink & Digital', price: 2200, styleTags: ['Fantasy', 'Map'], desc: 'A fantastical hand-drawn map of an imaginary archipelago.', pid: 28 },
  { title: 'Spice Market', category: 'Illustration', medium: 'Digital Illustration', price: 2600, styleTags: ['Cultural', 'Colorful'], desc: 'Vibrant illustration of an Indian spice market bustling with life.', pid: 29 },
  { title: 'Forest Spirits', category: 'Illustration', medium: 'Watercolor & Digital', price: 3100, styleTags: ['Mythology', 'Nature'], desc: 'Ethereal woodland spirits emerging from ancient trees.', pid: 30 },
  { title: 'Coffee Culture', category: 'Illustration', medium: 'Digital Illustration', price: 1500, styleTags: ['Food', 'Lifestyle'], desc: 'A whimsical journey through coffee-making traditions around the world.', pid: 31 },
  { title: 'Ocean Giants', category: 'Illustration', medium: 'Digital Illustration', price: 4200, styleTags: ['Marine', 'Nature'], desc: 'Majestic blue whales swimming through a cathedral of kelp forests.', pid: 32 },
  { title: 'The Alchemist', category: 'Illustration', medium: 'Ink & Digital', price: 2900, styleTags: ['Fantasy', 'Medieval'], desc: 'A wizened alchemist surrounded by bubbling potions and ancient tomes.', pid: 33 },
  { title: 'Urban Jungle', category: 'Illustration', medium: 'Digital Illustration', price: 2400, styleTags: ['Urban', 'Nature'], desc: 'City buildings reclaimed by tropical vegetation and wildlife.', pid: 34 },
  { title: 'Starship Diner', category: 'Illustration', medium: 'Digital Illustration', price: 1900, styleTags: ['Sci-fi', 'Retro'], desc: 'A 1950s-style diner floating in orbit around Saturn.', pid: 35 },
  { title: 'Rainy Day Cats', category: 'Illustration', medium: 'Watercolor & Digital', price: 1600, styleTags: ['Animals', 'Cute'], desc: 'Cats with tiny umbrellas navigating puddles on a rainy street.', pid: 36 },
  { title: 'The Book Thief', category: 'Illustration', medium: 'Digital Illustration', price: 2100, styleTags: ['Literary', 'Whimsical'], desc: 'A magical library where books fly off shelves to find their readers.', pid: 37 },
  { title: 'Harvest Moon', category: 'Illustration', medium: 'Gouache & Digital', price: 2700, styleTags: ['Seasonal', 'Rural'], desc: 'Farmers gathering crops under an impossibly large harvest moon.', pid: 38 },
  { title: 'Robot Garden', category: 'Illustration', medium: 'Digital Illustration', price: 3300, styleTags: ['Sci-fi', 'Nature'], desc: 'Gentle robots tending a garden of mechanical flowers.', pid: 39 },

  // 3D Art (12)
  { title: 'Möbius Sculpture', category: '3D Art', medium: '3D Render', price: 8500, styleTags: ['Abstract', 'Mathematical'], desc: 'A twisted metallic Möbius strip catching light from every angle.', pid: 40 },
  { title: 'Crystal Cavern', category: '3D Art', medium: '3D Render', price: 7200, styleTags: ['Fantasy', 'Environment'], desc: 'A vast underground cave filled with glowing amethyst crystals.', pid: 41 },
  { title: 'Neon Samurai', category: '3D Art', medium: '3D Render', price: 9800, styleTags: ['Cyberpunk', 'Character'], desc: 'A cybernetic samurai warrior in neon-lit rain-soaked streets.', pid: 42 },
  { title: 'Floating Islands', category: '3D Art', medium: '3D Render', price: 6500, styleTags: ['Fantasy', 'Landscape'], desc: 'Impossible floating landmasses connected by waterfalls and bridges.', pid: 43 },
  { title: 'Liquid Metal', category: '3D Art', medium: '3D Render', price: 5400, styleTags: ['Abstract', 'Metallic'], desc: 'Mercury-like substance frozen in mid-splash, catching prismatic light.', pid: 44 },
  { title: 'Ancient Golem', category: '3D Art', medium: '3D Sculpt', price: 11000, styleTags: ['Fantasy', 'Character'], desc: 'A moss-covered stone golem awakening in a forgotten temple.', pid: 45 },
  { title: 'Glass Cathedral', category: '3D Art', medium: '3D Render', price: 7800, styleTags: ['Architecture', 'Glass'], desc: 'A cathedral made entirely of stained glass, glowing from within.', pid: 46 },
  { title: 'Biomech Heart', category: '3D Art', medium: '3D Sculpt', price: 6200, styleTags: ['Biomechanical', 'Organic'], desc: 'A human heart reconstructed from mechanical and organic parts.', pid: 47 },
  { title: 'Zero Gravity', category: '3D Art', medium: '3D Render', price: 4900, styleTags: ['Space', 'Still Life'], desc: 'Everyday objects floating weightlessly in a space station.', pid: 48 },
  { title: 'Dragon Egg', category: '3D Art', medium: '3D Sculpt', price: 8900, styleTags: ['Fantasy', 'Detailed'], desc: 'An intricate dragon egg with hairline cracks revealing inner fire.', pid: 49 },
  { title: 'Coral City', category: '3D Art', medium: '3D Render', price: 7100, styleTags: ['Underwater', 'Architecture'], desc: 'A thriving underwater metropolis built into living coral reefs.', pid: 50 },
  { title: 'Time Machine', category: '3D Art', medium: '3D Render', price: 5600, styleTags: ['Steampunk', 'Mechanical'], desc: 'A Victorian-era time machine with spinning brass components.', pid: 51 },

  // Photography (10)
  { title: 'Golden Hour Peak', category: 'Photography', medium: 'Digital Photography', price: 2200, styleTags: ['Landscape', 'Mountain'], desc: 'Himalayan peaks kissed by the last golden rays of sunset.', pid: 52 },
  { title: 'Street Symphony', category: 'Photography', medium: 'Digital Photography', price: 1800, styleTags: ['Street', 'Urban'], desc: 'Bustling Tokyo crossing captured in long-exposure light trails.', pid: 53 },
  { title: 'Macro Universe', category: 'Photography', medium: 'Macro Photography', price: 2600, styleTags: ['Macro', 'Nature'], desc: 'Dewdrops on a spider web revealing a miniature universe.', pid: 54 },
  { title: 'Abandoned Beauty', category: 'Photography', medium: 'Digital Photography', price: 3100, styleTags: ['Urbex', 'Decay'], desc: 'An abandoned theater with nature reclaiming every surface.', pid: 55 },
  { title: 'Northern Lights', category: 'Photography', medium: 'Astrophotography', price: 4500, styleTags: ['Aurora', 'Night'], desc: 'Green and purple aurora dancing above an Icelandic glacial lagoon.', pid: 56 },
  { title: 'Market Colors', category: 'Photography', medium: 'Digital Photography', price: 1400, styleTags: ['Travel', 'Cultural'], desc: 'Piles of vibrant spice powders at a Moroccan market stall.', pid: 57 },
  { title: 'Silhouette Dance', category: 'Photography', medium: 'Digital Photography', price: 2800, styleTags: ['Dance', 'Artistic'], desc: 'A ballet dancer captured mid-leap against a fiery sunset.', pid: 58 },
  { title: 'Fog Forest', category: 'Photography', medium: 'Digital Photography', price: 1900, styleTags: ['Forest', 'Moody'], desc: 'Tall pine trees disappearing into thick morning fog.', pid: 59 },
  { title: 'Reflections', category: 'Photography', medium: 'Digital Photography', price: 2100, styleTags: ['Water', 'Abstract'], desc: 'Perfect mirror reflections of autumn trees in a still mountain lake.', pid: 60 },
  { title: 'Lightning Strike', category: 'Photography', medium: 'Digital Photography', price: 3400, styleTags: ['Weather', 'Dramatic'], desc: 'Multiple lightning bolts striking a lone tree on an open plain.', pid: 61 },

  // Abstract (10)
  { title: 'Chromatic Flow', category: 'Abstract', medium: 'Digital', price: 4200, styleTags: ['Fluid', 'Colorful'], desc: 'Rivers of pure color flowing and merging in organic patterns.', pid: 62 },
  { title: 'Geometric Pulse', category: 'Abstract', medium: 'Digital', price: 3600, styleTags: ['Geometric', 'Minimal'], desc: 'Pulsating geometric forms creating a hypnotic visual rhythm.', pid: 63 },
  { title: 'Neural Network', category: 'Abstract', medium: 'Generative', price: 5100, styleTags: ['Generative', 'Technical'], desc: 'Visual representation of neural pathways firing in sequence.', pid: 64 },
  { title: 'Ink Explosion', category: 'Abstract', medium: 'Digital', price: 2800, styleTags: ['Dynamic', 'Monochrome'], desc: 'Black ink exploding in water captured at 10000 fps then enhanced digitally.', pid: 65 },
  { title: 'Prismatic Void', category: 'Abstract', medium: 'Digital', price: 7500, styleTags: ['Space', 'Color'], desc: 'Light bending through an impossible prism into infinite color space.', pid: 66 },
  { title: 'Fractal Garden', category: 'Abstract', medium: 'Generative', price: 4800, styleTags: ['Fractal', 'Organic'], desc: 'Mandelbrot-inspired fractals blooming like digital flowers.', pid: 67 },
  { title: 'Entropy', category: 'Abstract', medium: 'Digital', price: 3200, styleTags: ['Chaos', 'Dynamic'], desc: 'Order dissolving into beautiful chaos, pixel by pixel.', pid: 68 },
  { title: 'Silk Waves', category: 'Abstract', medium: 'Digital', price: 2500, styleTags: ['Flowing', 'Elegant'], desc: 'Luminous silk-like waves undulating through dark space.', pid: 69 },
  { title: 'Binary Sunset', category: 'Abstract', medium: 'Generative', price: 6300, styleTags: ['Generative', 'Warm'], desc: 'Algorithmic interpretation of a sunset using only circles and gradients.', pid: 70 },
  { title: 'Quantum Foam', category: 'Abstract', medium: 'Digital', price: 4400, styleTags: ['Scientific', 'Micro'], desc: 'Artistic visualization of quantum mechanics at the Planck scale.', pid: 71 },

  // Concept Art (10)
  { title: 'Sky Citadel', category: 'Concept Art', medium: 'Digital', price: 6500, styleTags: ['Fantasy', 'Architecture'], desc: 'A massive fortress city built on clouds held aloft by ancient magic.', pid: 72 },
  { title: 'Mech Warrior', category: 'Concept Art', medium: 'Digital', price: 5800, styleTags: ['Sci-fi', 'Mech'], desc: 'A 40-ton bipedal combat mech in a devastated urban battlefield.', pid: 73 },
  { title: 'Alien Bazaar', category: 'Concept Art', medium: 'Digital', price: 4200, styleTags: ['Sci-fi', 'Cultural'], desc: 'A vibrant marketplace on a distant planet with exotic alien species.', pid: 74 },
  { title: 'Dragon Rider', category: 'Concept Art', medium: 'Digital', price: 7200, styleTags: ['Fantasy', 'Character'], desc: 'An armored warrior astride a massive storm dragon above the clouds.', pid: 75 },
  { title: 'Underwater Lab', category: 'Concept Art', medium: 'Digital', price: 5100, styleTags: ['Sci-fi', 'Underwater'], desc: 'A secret deep-sea research facility studying alien artifacts.', pid: 76 },
  { title: 'Forest Titan', category: 'Concept Art', medium: 'Digital', price: 6800, styleTags: ['Fantasy', 'Creature'], desc: 'An ancient tree-like titan slowly walking through primeval forests.', pid: 77 },
  { title: 'Cyberpunk Alley', category: 'Concept Art', medium: 'Digital', price: 4500, styleTags: ['Cyberpunk', 'Urban'], desc: 'A neon-drenched back alley in a dystopian megacity.', pid: 78 },
  { title: 'Portal Chamber', category: 'Concept Art', medium: 'Digital', price: 5500, styleTags: ['Fantasy', 'Interior'], desc: 'A grand chamber with an active portal to another dimension.', pid: 79 },
  { title: 'Desert Nomad', category: 'Concept Art', medium: 'Digital', price: 3800, styleTags: ['Post-apocalyptic', 'Character'], desc: 'A weathered traveler crossing nuclear wastelands with a robotic companion.', pid: 80 },
  { title: 'Space Station Alpha', category: 'Concept Art', medium: 'Digital', price: 8200, styleTags: ['Sci-fi', 'Space'], desc: 'A massive orbital station serving as humanitys last bastion.', pid: 81 },

  // Character Design (10)
  { title: 'Shadow Thief', category: 'Character Design', medium: 'Digital', price: 3500, styleTags: ['Fantasy', 'Rogue'], desc: 'A lithe rogue character who can manipulate shadows.', pid: 82 },
  { title: 'Flame Dancer', category: 'Character Design', medium: 'Digital', price: 4100, styleTags: ['Fantasy', 'Elemental'], desc: 'A fire mage whose body is made of living flame.', pid: 83 },
  { title: 'Iron Saint', category: 'Character Design', medium: 'Digital', price: 5200, styleTags: ['Dark Fantasy', 'Knight'], desc: 'A corrupted paladin in ornate blackened armor.', pid: 84 },
  { title: 'Neon Hacker', category: 'Character Design', medium: 'Digital', price: 3800, styleTags: ['Cyberpunk', 'Tech'], desc: 'A young hacker with holographic implants and neon highlights.', pid: 85 },
  { title: 'Spirit Walker', category: 'Character Design', medium: 'Digital', price: 4600, styleTags: ['Fantasy', 'Spiritual'], desc: 'A shaman who walks between the physical and spirit worlds.', pid: 86 },
  { title: 'Void Knight', category: 'Character Design', medium: 'Digital', price: 5900, styleTags: ['Dark Fantasy', 'Cosmic'], desc: 'A warrior whose armor is made from crystallized void energy.', pid: 87 },
  { title: 'Clockwork Queen', category: 'Character Design', medium: 'Digital', price: 4400, styleTags: ['Steampunk', 'Royalty'], desc: 'A queen whose body has been replaced with clockwork mechanisms.', pid: 88 },
  { title: 'Reef Guardian', category: 'Character Design', medium: 'Digital', price: 3200, styleTags: ['Fantasy', 'Ocean'], desc: 'An aquatic warrior who protects coral reef ecosystems.', pid: 89 },
  { title: 'Star Pilot', category: 'Character Design', medium: 'Digital', price: 3700, styleTags: ['Sci-fi', 'Space'], desc: 'A daring intergalactic pilot with a custom flight suit.', pid: 90 },
  { title: 'Bone Witch', category: 'Character Design', medium: 'Digital', price: 4800, styleTags: ['Horror', 'Fantasy'], desc: 'A necromancer adorned with bone jewelry and dark sigils.', pid: 91 },

  // Landscape (8)
  { title: 'Bioluminescent Bay', category: 'Landscape', medium: 'Digital', price: 3900, styleTags: ['Ocean', 'Night'], desc: 'A tropical bay glowing blue with millions of bioluminescent plankton.', pid: 92 },
  { title: 'Lavender Fields', category: 'Landscape', medium: 'Digital', price: 2600, styleTags: ['Rural', 'Floral'], desc: 'Endless rows of lavender stretching to a Provencal village at sunset.', pid: 93 },
  { title: 'Glacier Valley', category: 'Landscape', medium: 'Digital', price: 4500, styleTags: ['Ice', 'Mountain'], desc: 'A vast glacier-carved valley with turquoise meltwater streams.', pid: 94 },
  { title: 'Bamboo Forest', category: 'Landscape', medium: 'Digital', price: 3100, styleTags: ['Asian', 'Forest'], desc: 'Sunlight filtering through a dense bamboo grove in Kyoto.', pid: 95 },
  { title: 'Volcanic Beach', category: 'Landscape', medium: 'Digital', price: 3400, styleTags: ['Beach', 'Volcanic'], desc: 'Black sand beach with crashing waves and distant volcanic peaks.', pid: 96 },
  { title: 'Alpine Meadow', category: 'Landscape', medium: 'Digital', price: 2800, styleTags: ['Mountain', 'Floral'], desc: 'Wildflower-filled meadow beneath snow-capped Swiss Alps.', pid: 97 },
  { title: 'Canyon Light', category: 'Landscape', medium: 'Digital', price: 5200, styleTags: ['Canyon', 'Light'], desc: 'A beam of sunlight cutting through a narrow slot canyon.', pid: 98 },
  { title: 'Misty Cliffs', category: 'Landscape', medium: 'Digital', price: 3600, styleTags: ['Coastal', 'Moody'], desc: 'Dramatic sea cliffs shrouded in rolling fog and crashing surf.', pid: 99 },

  // Portrait (5)
  { title: 'The Dreamer', category: 'Portrait', medium: 'Digital', price: 4100, styleTags: ['Surreal', 'Emotional'], desc: 'A portrait where the subjects hair transforms into a starfield.', pid: 100 },
  { title: 'Warrior Queen', category: 'Portrait', medium: 'Digital', price: 5500, styleTags: ['Fantasy', 'Powerful'], desc: 'A regal warrior with battle scars and a crown of thorns.', pid: 101 },
  { title: 'Neon Portrait', category: 'Portrait', medium: 'Digital', price: 3200, styleTags: ['Cyberpunk', 'Modern'], desc: 'A face illuminated only by neon sign reflections on a rainy night.', pid: 102 },
  { title: 'Elder Sage', category: 'Portrait', medium: 'Digital', price: 4800, styleTags: ['Fantasy', 'Wisdom'], desc: 'A wise old wizard with eyes that contain galaxies.', pid: 103 },
  { title: 'Digital Muse', category: 'Portrait', medium: 'Digital', price: 3600, styleTags: ['Modern', 'Fashion'], desc: 'A fashion-forward portrait blending reality with digital glitch art.', pid: 104 },

  // Pixel Art (5)
  { title: 'Pixel Sunset City', category: 'Pixel Art', medium: 'Pixel Art', price: 1200, styleTags: ['Retro', 'City'], desc: 'A retro pixel art cityscape at sunset with animated neon signs.', pid: 105 },
  { title: '8-Bit Dungeon', category: 'Pixel Art', medium: 'Pixel Art', price: 900, styleTags: ['Gaming', 'Retro'], desc: 'A classic dungeon crawler scene in authentic 8-bit style.', pid: 106 },
  { title: 'Pixel Ramen Shop', category: 'Pixel Art', medium: 'Pixel Art', price: 1100, styleTags: ['Food', 'Japanese'], desc: 'A cozy ramen shop with steam rising from bowls, pixel by pixel.', pid: 107 },
  { title: 'Retro Space Battle', category: 'Pixel Art', medium: 'Pixel Art', price: 1500, styleTags: ['Sci-fi', 'Action'], desc: 'An epic space dogfight rendered in glorious 16-bit pixel art.', pid: 108 },
  { title: 'Pixel Garden', category: 'Pixel Art', medium: 'Pixel Art', price: 800, styleTags: ['Nature', 'Peaceful'], desc: 'A serene Japanese zen garden in minimalist pixel art style.', pid: 109 },

  // Generative Art (5)
  { title: 'Fibonacci Spiral', category: 'Generative Art', medium: 'Code', price: 6200, styleTags: ['Mathematical', 'Organic'], desc: 'Golden ratio spiral visualized through 10,000 precisely placed dots.', pid: 110 },
  { title: 'Data Bloom', category: 'Generative Art', medium: 'Code', price: 5400, styleTags: ['Data Viz', 'Organic'], desc: 'Real-time weather data transformed into blooming flower patterns.', pid: 111 },
  { title: 'Sound Sculpture', category: 'Generative Art', medium: 'Code', price: 4800, styleTags: ['Audio', 'Visual'], desc: 'Beethovens 5th symphony converted into a 3D sculptural form.', pid: 112 },
  { title: 'Cellular Automata', category: 'Generative Art', medium: 'Code', price: 3900, styleTags: ['Mathematical', 'Evolving'], desc: 'Conways Game of Life creating emergent beauty from simple rules.', pid: 113 },
  { title: 'Random Walker', category: 'Generative Art', medium: 'Code', price: 5100, styleTags: ['Algorithmic', 'Abstract'], desc: 'A million random walks creating an emergent portrait of chaos.', pid: 114 },

  // Fan Art (5)
  { title: 'Cyber Samurai', category: 'Fan Art', medium: 'Digital', price: 2800, styleTags: ['Anime', 'Cyberpunk'], desc: 'A reimagined samurai character in a cyberpunk anime style.', pid: 115 },
  { title: 'Potion Master', category: 'Fan Art', medium: 'Digital', price: 2200, styleTags: ['Fantasy', 'Whimsical'], desc: 'A whimsical take on a beloved wizard character brewing potions.', pid: 116 },
  { title: 'Mech Evolution', category: 'Fan Art', medium: 'Digital', price: 3500, styleTags: ['Mecha', 'Anime'], desc: 'Classic mecha designs reimagined for the modern era.', pid: 117 },
  { title: 'Dragon Trainer', category: 'Fan Art', medium: 'Digital', price: 1900, styleTags: ['Fantasy', 'Adventure'], desc: 'A young adventurer befriending a baby dragon in a meadow.', pid: 118 },
  { title: 'Space Explorer', category: 'Fan Art', medium: 'Digital', price: 2600, styleTags: ['Sci-fi', 'Retro'], desc: 'A retro-styled space explorer discovering a new alien world.', pid: 119 },
];

// ── Seed function ────────────────────────────────────────────────────────────
const seed = async () => {
  try {
    await connectDB();
    console.log('🌱 Starting seed...\n');

    // Clear existing data
    await User.deleteMany({});
    await Artwork.deleteMany({});
    await Notification.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create admin
    const adminUser = await User.create(admin);
    console.log(`✅ Admin: ${adminUser.email} / ${admin.password}`);

    // Create artists
    const createdArtists = [];
    for (const a of artists) {
      const user = await User.create(a);
      createdArtists.push(user);
      console.log(`✅ Artist: ${user.email} / ${a.password}`);
    }

    // Create buyers
    const createdBuyers = [];
    for (const b of buyers) {
      const user = await User.create(b);
      createdBuyers.push(user);
      console.log(`✅ Buyer: ${user.email} / ${b.password}`);
    }

    // Add follow relationships
    for (const buyer of createdBuyers) {
      const followCount = Math.floor(Math.random() * 4) + 1;
      const shuffled = [...createdArtists].sort(() => 0.5 - Math.random());
      for (let i = 0; i < followCount; i++) {
        buyer.following.push(shuffled[i]._id);
        shuffled[i].followers.push(buyer._id);
      }
      await buyer.save();
    }
    for (const artist of createdArtists) {
      await artist.save();
    }
    console.log('✅ Follow relationships created');

    // Create artworks — distribute across artists
    let artworkCount = 0;
    for (let i = 0; i < artworkTemplates.length; i++) {
      const t = artworkTemplates[i];
      const artist = createdArtists[i % createdArtists.length];

      const isLimited = Math.random() > 0.8;
      const isAuction = Math.random() > 0.85;

      const artwork = await Artwork.create({
        title: t.title,
        description: t.desc,
        artist: artist._id,
        category: t.category,
        styleTags: t.styleTags,
        medium: t.medium,
        price: isAuction ? t.price : t.price,
        images: {
          preview: img(t.pid),
          thumbnail: thumb(t.pid),
          original: img(t.pid, 1600, 2000),
        },
        isLimitedEdition: isLimited,
        totalEditions: isLimited ? Math.floor(Math.random() * 15) + 3 : null,
        editionsSold: isLimited ? Math.floor(Math.random() * 3) : 0,
        saleType: isAuction ? 'auction' : 'fixed',
        auction: isAuction ? {
          startingBid: t.price,
          currentBid: t.price + Math.floor(Math.random() * 2000),
          endTime: new Date(Date.now() + (Math.random() * 7 + 1) * 24 * 60 * 60 * 1000),
          bidCount: Math.floor(Math.random() * 12),
        } : undefined,
        status: 'published',
        viewCount: Math.floor(Math.random() * 500) + 10,
        resaleRoyalty: Math.floor(Math.random() * 15) + 5,
      });
      artworkCount++;
    }
    console.log(`✅ Created ${artworkCount} artworks`);

    // Create welcome notifications
    for (const artist of createdArtists) {
      await Notification.create({
        recipient: artist._id,
        type: 'system',
        title: 'Welcome to ArtVault!',
        message: 'Start uploading your artworks and build your collector community.',
      });
    }
    for (const buyer of createdBuyers) {
      await Notification.create({
        recipient: buyer._id,
        type: 'system',
        title: 'Welcome to ArtVault!',
        message: 'Explore the marketplace and discover extraordinary digital art.',
      });
    }
    console.log('✅ Welcome notifications created');

    console.log('\n────────────────────────────────────');
    console.log(`  Total users: ${1 + artists.length + buyers.length}`);
    console.log(`  Total artworks: ${artworkCount}`);
    console.log('────────────────────────────────────');
    console.log('\n🎉 Seed complete!\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
};

seed();
