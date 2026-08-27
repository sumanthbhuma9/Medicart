import fs from 'fs';
import path from 'path';
import readline from 'readline';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Medicine from './models/Medicine.js';

dotenv.config();

// Fast CSV line parser function
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// Fine-tuned medical categorization function
function deriveDetailedCategory(name, comp, desc, pack) {
  const text = `${name} ${comp} ${desc} ${pack}`.toLowerCase();
  
  if (text.includes('inj') || text.includes('injection') || text.includes('vial') || text.includes('ampoule')) {
    return 'Injections & Ampoules';
  }
  if (text.includes('spray') || text.includes('inhaler') || text.includes('rotacap') || text.includes('resples')) {
    return 'Sprays & Inhalers';
  }
  if (text.includes('cream') || text.includes('ointment') || text.includes('gel') || text.includes('lotion') || text.includes('topical')) {
    return 'Ointments & Creams';
  }
  if (text.includes('drop') || text.includes('drops') || text.includes('eye') || text.includes('ear') || text.includes('nasal')) {
    return 'Eye, Ear & Nasal Drops';
  }
  if (text.includes('metformin') || text.includes('glimepiride') || text.includes('teneligliptin') || text.includes('sitagliptin') || text.includes('vildagliptin') || text.includes('gliclazide') || text.includes('sugar') || text.includes('diabet')) {
    return 'Diabetes & Blood Sugar';
  }
  if (text.includes('atorvastatin') || text.includes('rosuvastatin') || text.includes('telmisartan') || text.includes('amlodipine') || text.includes('cilnidipine') || text.includes('metoprolol') || text.includes('ramipril') || text.includes('cholesterol') || text.includes('bp')) {
    return 'Cholesterol & Blood Pressure';
  }
  if (text.includes('paracetamol') || text.includes('dolo') || text.includes('crocin') || text.includes('aceclofenac') || text.includes('diclofenac') || text.includes('ibuprofen') || text.includes('pain') || text.includes('fever') || text.includes('combiflam')) {
    return 'Analgesic & Fever Relief';
  }
  if (text.includes('amoxycillin') || text.includes('azithromycin') || text.includes('ciprofloxacin') || text.includes('cefixime') || text.includes('ofloxacin') || text.includes('metronidazole') || text.includes('antibiotic') || text.includes('augmentin') || text.includes('azithral')) {
    return 'Antibiotics';
  }
  if (text.includes('fexofenadine') || text.includes('cetirizine') || text.includes('montelukast') || text.includes('pheniramine') || text.includes('allegra') || text.includes('avil') || text.includes('allergy')) {
    return 'Antihistamine & Allergy';
  }
  if (text.includes('syrup') || text.includes('suspension') || text.includes('ambroxol') || text.includes('salbutamol') || text.includes('cough') || text.includes('ascoril') || text.includes('alex')) {
    return 'Cough & Syrups';
  }
  if (text.includes('pantoprazole') || text.includes('rabeprazole') || text.includes('ranitidine') || text.includes('aciloc') || text.includes('omeprazole') || text.includes('digene') || text.includes('gelusil') || text.includes('acidity') || text.includes('antacid')) {
    return 'Gastrointestinal & Antacids';
  }
  if (text.includes('vitamin') || text.includes('supplement') || text.includes('calcium') || text.includes('zinc') || text.includes('becosules') || text.includes('neurobion') || text.includes('evion') || text.includes('shelcal')) {
    return 'Vitamins & Supplements';
  }
  
  return 'General Allopathy';
}

// Generate SVG placeholder for medicine category
function generateMedicineImage(name, category) {
  let color = '%2310b981'; // Green
  if (category.includes('Injections')) color = '%23dc2626'; // Bright Red
  else if (category.includes('Sprays')) color = '%230284c7'; // Sky Blue
  else if (category.includes('Ointments')) color = '%23d97706'; // Gold/Amber
  else if (category.includes('Diabetes')) color = '%237c3aed'; // Deep Purple
  else if (category.includes('Cholesterol')) color = '%23e11d48'; // Rose
  else if (category.includes('Analgesic')) color = '%239333ea'; // Purple
  else if (category.includes('Antibiotics')) color = '%23b91c1c'; // Dark Red
  else if (category.includes('Antihistamine')) color = '%232563eb'; // Blue
  else if (category.includes('Syrups')) color = '%23ea580c'; // Orange
  else if (category.includes('Gastrointestinal')) color = '%230d9488'; // Teal
  else if (category.includes('Vitamins')) color = '%23f97316'; // Vivid Orange

  const label = (name || 'Medicine').slice(0, 14).replace(/'/g, "");

  return `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' width='100' height='100'><rect width='100' height='100' fill='%23f8fafc'/><circle cx='50' cy='45' r='28' fill='${color}'/><rect x='45' y='27' width='10' height='36' fill='white'/><rect x='32' y='40' width='36' height='10' fill='white'/><text x='50' y='88' font-family='sans-serif' font-size='8' font-weight='bold' fill='%23334155' text-anchor='middle'>${label}</text></svg>`;
}

async function import1500CuratedMedicines() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB Atlas!');

    const csvFilePath = path.resolve('../../dataset/DATA/updated_indian_medicine_data.csv');
    if (!fs.existsSync(csvFilePath)) {
      console.error(`Dataset file not found at: ${csvFilePath}`);
      process.exit(1);
    }

    console.log('Reading entire dataset to curate 1,500+ most essential & diverse medicines across A-Z...');

    const fileStream = fs.createReadStream(csvFilePath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    const categoryBuckets = {
      'Injections & Ampoules': [],
      'Sprays & Inhalers': [],
      'Ointments & Creams': [],
      'Eye, Ear & Nasal Drops': [],
      'Diabetes & Blood Sugar': [],
      'Cholesterol & Blood Pressure': [],
      'Analgesic & Fever Relief': [],
      'Antibiotics': [],
      'Antihistamine & Allergy': [],
      'Cough & Syrups': [],
      'Gastrointestinal & Antacids': [],
      'Vitamins & Supplements': [],
      'General Allopathy': []
    };

    let isHeader = true;
    let totalParsed = 0;

    for await (const line of rl) {
      if (isHeader) {
        isHeader = false;
        continue;
      }

      if (!line || line.trim().length === 0) continue;

      const parts = parseCSVLine(line);
      if (parts.length < 4) continue;

      const name = parts[1];
      const priceRaw = parts[2];
      const isDiscontinued = parts[3];
      const manufacturer = parts[4] || 'Indian Pharma';

      if (isDiscontinued === 'TRUE' || !name || !priceRaw || name.length < 2) continue;

      const price = parseFloat(priceRaw) || 50.00;
      const category = deriveDetailedCategory(name, parts[7] || '', parts[10] || '', parts[6] || '');
      const description = parts[10] && parts[10].length > 10 
        ? parts[10].replace(/"/g, '').trim() 
        : `High-quality ${category} medicine manufactured by ${manufacturer}. Pack size: ${parts[6] || 'standard'}.`;

      totalParsed++;

      const item = {
        name,
        category,
        price,
        description: description.slice(0, 350) + (description.length > 350 ? '...' : '')
      };

      if (categoryBuckets[category]) {
        categoryBuckets[category].push(item);
      } else {
        categoryBuckets['General Allopathy'].push(item);
      }
    }

    console.log(`Parsed total ${totalParsed} medicines from dataset.`);
    console.log('Category distribution:');
    Object.keys(categoryBuckets).forEach(cat => {
      console.log(` - ${cat}: ${categoryBuckets[cat].length} medicines`);
    });

    // Curate 1,550 medicines ensuring rich coverage across all specific requested categories & A-Z
    const selectedMedicines = [];

    // Target per category allocation
    const targets = {
      'Analgesic & Fever Relief': 150,
      'Diabetes & Blood Sugar': 150,
      'Cholesterol & Blood Pressure': 150,
      'Ointments & Creams': 150,
      'Sprays & Inhalers': 100,
      'Injections & Ampoules': 120,
      'Antihistamine & Allergy': 150,
      'Gastrointestinal & Antacids': 150,
      'Vitamins & Supplements': 130,
      'Antibiotics': 150,
      'Eye, Ear & Nasal Drops': 80,
      'General Allopathy': 170
    };

    for (const [cat, targetCount] of Object.entries(targets)) {
      const items = categoryBuckets[cat] || [];
      // Evenly sample across the bucket to cover A-Z
      const step = Math.max(1, Math.floor(items.length / targetCount));
      let added = 0;
      for (let i = 0; i < items.length && added < targetCount; i += step) {
        selectedMedicines.push(items[i]);
        added++;
      }
    }

    console.log(`Total curated medicines selected: ${selectedMedicines.length}`);

    const finalProducts = selectedMedicines.map((item, index) => {
      return {
        numId: index + 1,
        name: item.name,
        category: item.category,
        price: item.price,
        stock: Math.floor(Math.random() * 150) + 50,
        description: item.description,
        image: generateMedicineImage(item.name, item.category)
      };
    });

    console.log('Clearing existing medicines in MongoDB Atlas...');
    await Medicine.deleteMany({});

    console.log(`Inserting ${finalProducts.length} curated medicines into MongoDB Atlas...`);
    await Medicine.insertMany(finalProducts);

    console.log(`🎉 SUCCESS: Re-seeded MongoDB Atlas with ${finalProducts.length} category-wise medicines (A-Z, Fever, Diabetes, Cholesterol, Ointments, Sprays, Injections)!`);
    process.exit(0);
  } catch (error) {
    console.error('Import failed:', error);
    process.exit(1);
  }
}

import1500CuratedMedicines();
