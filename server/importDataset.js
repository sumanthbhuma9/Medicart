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

// Derive category from name, composition, and description
function deriveCategory(name, comp, desc) {
  const text = `${name} ${comp} ${desc}`.toLowerCase();
  if (text.includes('amoxycillin') || text.includes('azithromycin') || text.includes('ciprofloxacin') || text.includes('cefixime') || text.includes('antibiotic')) {
    return 'Antibiotics';
  }
  if (text.includes('fexofenadine') || text.includes('cetirizine') || text.includes('montelukast') || text.includes('pheniramine') || text.includes('allergy')) {
    return 'Antihistamine & Anti-Allergy';
  }
  if (text.includes('syrup') || text.includes('suspension') || text.includes('ambroxol') || text.includes('salbutamol') || text.includes('cough')) {
    return 'Cough & Syrups';
  }
  if (text.includes('paracetamol') || text.includes('aceclofenac') || text.includes('diclofenac') || text.includes('ibuprofen') || text.includes('pain') || text.includes('gel')) {
    return 'Analgesic & Pain Relief';
  }
  if (text.includes('pantoprazole') || text.includes('rabeprazole') || text.includes('ranitidine') || text.includes('aciloc') || text.includes('omeprazole') || text.includes('antacid')) {
    return 'Gastrointestinal & Antacids';
  }
  if (text.includes('vitamin') || text.includes('supplement') || text.includes('calcium') || text.includes('zinc') || text.includes('ascorbic')) {
    return 'Vitamins & Supplements';
  }
  return 'General Allopathy';
}

// Generate SVG placeholder for medicine
function generateMedicineImage(name, category) {
  let color = '%2310b981'; // Green default
  if (category.includes('Antibiotics')) color = '%23ef4444'; // Red
  else if (category.includes('Antihistamine')) color = '%233b82f6'; // Blue
  else if (category.includes('Syrups')) color = '%23f59e0b'; // Amber
  else if (category.includes('Analgesic')) color = '%238b5cf6'; // Purple
  else if (category.includes('Gastrointestinal')) color = '%2306b6d4'; // Cyan
  else if (category.includes('Vitamins')) color = '%23f97316'; // Orange

  const label = (name || 'Medicine').slice(0, 14).replace(/'/g, "");

  return `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' width='100' height='100'><rect width='100' height='100' fill='%23f8fafc'/><circle cx='50' cy='45' r='28' fill='${color}'/><rect x='45' y='27' width='10' height='36' fill='white'/><rect x='32' y='40' width='36' height='10' fill='white'/><text x='50' y='88' font-family='sans-serif' font-size='8' font-weight='bold' fill='%23334155' text-anchor='middle'>${label}</text></svg>`;
}

// Fisher-Yates shuffle helper
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

async function importRandom300Medicines() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB Atlas!');

    const csvFilePath = path.resolve('../../dataset/DATA/updated_indian_medicine_data.csv');
    if (!fs.existsSync(csvFilePath)) {
      console.error(`Dataset file not found at: ${csvFilePath}`);
      process.exit(1);
    }

    console.log(`Reading entire dataset to collect medicines across A-Z...`);

    const fileStream = fs.createReadStream(csvFilePath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    const allValidMedicines = [];
    let isHeader = true;

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
      const category = deriveCategory(name, parts[7] || '', parts[10] || '');
      const description = parts[10] && parts[10].length > 10 
        ? parts[10].replace(/"/g, '').trim() 
        : `High-quality ${category} medicine manufactured by ${manufacturer}. Pack size: ${parts[6] || 'standard'}.`;

      allValidMedicines.push({
        rawName: name,
        category,
        price,
        description: description.slice(0, 350) + (description.length > 350 ? '...' : '')
      });
    }

    console.log(`Total valid non-discontinued medicines found in dataset: ${allValidMedicines.length}`);

    console.log('Shuffling medicines to select a random, diverse 300 medicines across letters A to Z...');
    const shuffled = shuffleArray(allValidMedicines);
    const selected300 = shuffled.slice(0, 300);

    const finalProducts = selected300.map((item, index) => {
      return {
        numId: index + 1,
        name: item.rawName,
        category: item.category,
        price: item.price,
        stock: Math.floor(Math.random() * 150) + 50,
        description: item.description,
        image: generateMedicineImage(item.rawName, item.category)
      };
    });

    console.log('Clearing existing medicines in MongoDB Atlas...');
    await Medicine.deleteMany({});

    console.log('Inserting 300 random diverse medicines into MongoDB Atlas...');
    await Medicine.insertMany(finalProducts);

    console.log('🎉 SUCCESS: Cleared old items and inserted 300 random diverse medicines across A-Z into MongoDB Atlas!');
    process.exit(0);
  } catch (error) {
    console.error('Import failed:', error);
    process.exit(1);
  }
}

importRandom300Medicines();
