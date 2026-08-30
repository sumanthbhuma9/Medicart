import bcrypt from 'bcryptjs';

function generateMedicineImage(name, category) {
  let color = '%2310b981'; // Green default
  if (category.includes('Injections')) color = '%23dc2626';
  else if (category.includes('Sprays') || category.includes('Inhaler')) color = '%230284c7';
  else if (category.includes('Ointments') || category.includes('Cream')) color = '%23d97706';
  else if (category.includes('Diabetes')) color = '%237c3aed';
  else if (category.includes('Cholesterol') || category.includes('Pressure')) color = '%23e11d48';
  else if (category.includes('Analgesic') || category.includes('Fever') || category.includes('Pain')) color = '%239333ea';
  else if (category.includes('Antibiotics')) color = '%23b91c1c';
  else if (category.includes('Antihistamine') || category.includes('Allergy')) color = '%232563eb';
  else if (category.includes('Syrup') || category.includes('Cough')) color = '%23ea580c';
  else if (category.includes('Gastrointestinal') || category.includes('Antacid')) color = '%230d9488';
  else if (category.includes('Vitamins') || category.includes('Supplement')) color = '%23f97316';
  else if (category.includes('Drop')) color = '%2306b6d4';

  const label = (name || 'Medicine').slice(0, 14).replace(/'/g, '');

  return `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' width='100' height='100'><rect width='100' height='100' fill='%23f8fafc'/><circle cx='50' cy='45' r='28' fill='${color}'/><rect x='45' y='27' width='10' height='36' fill='white'/><rect x='32' y='40' width='36' height='10' fill='white'/><text x='50' y='88' font-family='sans-serif' font-size='8' font-weight='bold' fill='%23334155' text-anchor='middle'>${label}</text></svg>`;
}

const RAW_PRODUCTS = [
  // Analgesic & Fever Relief
  { name: 'Dolo 650mg Tablet', category: 'Analgesic & Fever Relief', price: 34.00, stock: 150, description: 'Paracetamol 650mg for relief from high fever, body aches, headache, and postoperative mild to moderate pain.' },
  { name: 'Crocin 500mg Advance', category: 'Analgesic & Fever Relief', price: 28.50, stock: 120, description: 'Fast-release paracetamol tablet for prompt fever and headache relief with Optizorb technology.' },
  { name: 'Combiflam Tablet', category: 'Analgesic & Fever Relief', price: 42.00, stock: 95, description: 'Combination of Ibuprofen (400mg) and Paracetamol (325mg) for acute inflammatory and muscular pain relief.' },
  { name: 'Zerodol-SP Tablet', category: 'Analgesic & Fever Relief', price: 115.00, stock: 80, description: 'Aceclofenac, Paracetamol & Serratiopeptidase combination for severe pain, joint swelling, and post-surgery inflammation.' },
  { name: 'Meftal-Spas Tablet', category: 'Analgesic & Fever Relief', price: 52.00, stock: 110, description: 'Mefenamic Acid & Dicyclomine for spasmodic menstrual cramps, intestinal colic, and abdominal pain.' },
  { name: 'Saridon Headache Relief', category: 'Analgesic & Fever Relief', price: 45.00, stock: 140, description: 'Triple active formula (Paracetamol, Propyphenazone, Caffeine) for targeted 30-minute headache relief.' },
  { name: 'Brufen 400mg Tablet', category: 'Analgesic & Fever Relief', price: 32.00, stock: 75, description: 'Ibuprofen 400mg NSAID for backache, osteoarthritis stiffness, and toothache relief.' },

  // Antibiotics
  { name: 'Augmentin 625 Duo Tablet', category: 'Antibiotics', price: 215.00, stock: 90, description: 'Amoxycillin (500mg) + Potassium Clavulanate (125mg) broad-spectrum antibiotic for respiratory, ear, sinus and skin infections.' },
  { name: 'Azithral 500mg Tablet', category: 'Antibiotics', price: 135.00, stock: 85, description: 'Azithromycin 500mg macrolide antibiotic for bacterial throat infections, bronchitis, tonsillitis, and typhoid.' },
  { name: 'Taxim-O 200mg Tablet', category: 'Antibiotics', price: 178.00, stock: 70, description: 'Cefixime 200mg third-generation cephalosporin for urinary tract, typhoid, and middle ear bacterial infections.' },
  { name: 'Cifran 500mg Tablet', category: 'Antibiotics', price: 82.00, stock: 65, description: 'Ciprofloxacin 500mg fluoroquinolone for severe bacterial diarrhea, bone, and urinary infections.' },
  { name: 'Mox 500mg Capsule', category: 'Antibiotics', price: 74.00, stock: 80, description: 'Amoxicillin 500mg for chest, throat, dental and genitourinary tract bacterial conditions.' },
  { name: 'Flagyl 400mg Tablet', category: 'Antibiotics', price: 26.00, stock: 120, description: 'Metronidazole 400mg for amoebiasis, giardiasis, dental abscesses, and anaerobic bacterial conditions.' },
  { name: 'Ceftum 500mg Tablet', category: 'Antibiotics', price: 490.00, stock: 40, description: 'Cefuroxime Axetil 500mg high-potency antibiotic for severe lung, skin, and urinary bacterial infections.' },

  // Antihistamine & Allergy
  { name: 'Allegra 120mg Tablet', category: 'Antihistamine & Allergy', price: 198.00, stock: 85, description: 'Fexofenadine non-drowsy 24-hour antihistamine for seasonal allergic rhinitis, watery eyes, and hives.' },
  { name: 'Cetirizine 10mg Tablet', category: 'Antihistamine & Allergy', price: 25.00, stock: 200, description: 'Fast relief from sneezing, runny nose, dust allergies, itching, and insect bites.' },
  { name: 'Montair-LC Tablet', category: 'Antihistamine & Allergy', price: 185.00, stock: 95, description: 'Montelukast (10mg) + Levocetirizine (5mg) for nocturnal allergic asthma, wheezing, and allergic rhinitis.' },
  { name: 'Avil 25mg Tablet', category: 'Antihistamine & Allergy', price: 18.00, stock: 160, description: 'Pheniramine maleate classic antihistamine for acute skin rashes, drug allergy reactions, and travel sickness.' },
  { name: 'Atarax 25mg Tablet', category: 'Antihistamine & Allergy', price: 88.00, stock: 50, description: 'Hydroxyzine 25mg for severe skin pruritus, urticaria, dermatographism, and mild allergy-related anxiety.' },

  // Cough & Syrups
  { name: 'Ascoril-D Plus Syrup 100ml', category: 'Cough & Syrups', price: 128.00, stock: 65, description: 'Dextromethorphan + Phenylephrine + Chlorpheniramine for dry hacking cough, blocked nose, and throat tickle.' },
  { name: 'Alex Syrup 100ml', category: 'Cough & Syrups', price: 132.00, stock: 60, description: 'Sugar-free dry cough syrup providing quick suppressive action against dry allergic coughs.' },
  { name: 'Benadryl Cough Formula 150ml', category: 'Cough & Syrups', price: 145.00, stock: 80, description: 'Diphenhydramine + Ammonium Chloride for soothing sore throat, loosening phlegm, and restful sleep.' },
  { name: 'Asthakind-DX Syrup 100ml', category: 'Cough & Syrups', price: 110.00, stock: 75, description: 'Triple action formula for cold, cough, and nasal congestion relief with soothing mint taste.' },
  { name: 'Grilinctus-L Syrup 100ml', category: 'Cough & Syrups', price: 120.00, stock: 70, description: 'Levocloperastine cough suppressant for dry non-productive irritating cough without central sedation.' },

  // Gastrointestinal & Antacids
  { name: 'Pan 40mg Tablet', category: 'Gastrointestinal & Antacids', price: 155.00, stock: 130, description: 'Pantoprazole 40mg daily proton pump inhibitor for hyperacidity, peptic ulcer healing, and GERD.' },
  { name: 'Aciloc 150mg Tablet', category: 'Gastrointestinal & Antacids', price: 42.00, stock: 180, description: 'Ranitidine 150mg H2 blocker for instant heartburn relief, acidity reduction, and indigestion.' },
  { name: 'Omez 20mg Capsule', category: 'Gastrointestinal & Antacids', price: 68.00, stock: 140, description: 'Omeprazole 20mg for acid reflux, sour burps, gastric erosions, and stomach discomfort.' },
  { name: 'Digene Mint Gel 200ml', category: 'Gastrointestinal & Antacids', price: 148.00, stock: 90, description: 'Magnesium Hydroxide + Aluminium Hydroxide + Simethicone for fast liquid acid neutralizing and anti-gas action.' },
  { name: 'Gelusil MPS Liquid 200ml', category: 'Gastrointestinal & Antacids', price: 136.00, stock: 85, description: 'Quick-acting antacid syrup for heartburn relief, flatulence, gas pain, and gastritis.' },
  { name: 'Eno Regular Sachet 5g (Pack of 6)', category: 'Gastrointestinal & Antacids', price: 54.00, stock: 250, description: 'Effervescent fruit salt formula works in 6 seconds against sudden acidity and heavy bloated stomach.' },
  { name: 'Cremaffin Plus Syrup 225ml', category: 'Gastrointestinal & Antacids', price: 260.00, stock: 45, description: 'Liquid paraffin + Milk of Magnesia emulsion for gentle overnight relief from chronic constipation.' },

  // Diabetes & Blood Sugar
  { name: 'Glycomet 500mg Tablet', category: 'Diabetes & Blood Sugar', price: 28.00, stock: 200, description: 'Metformin Hydrochloride 500mg baseline therapy for type-2 diabetes and insulin resistance management.' },
  { name: 'Glycomet GP 1 Tablet', category: 'Diabetes & Blood Sugar', price: 110.00, stock: 120, description: 'Glimepiride (1mg) + Metformin (500mg) extended-release dual oral hypoglycemic agent.' },
  { name: 'Januvia 100mg Tablet', category: 'Diabetes & Blood Sugar', price: 345.00, stock: 40, description: 'Sitagliptin 100mg DPP-4 inhibitor for smooth post-prandial blood sugar control without hypoglycemia.' },
  { name: 'Galvus Met 50/500 Tablet', category: 'Diabetes & Blood Sugar', price: 295.00, stock: 55, description: 'Vildagliptin + Metformin combination for comprehensive fasting and post-meal HbA1c lowering.' },
  { name: 'Teneligliptin 20mg Tablet', category: 'Diabetes & Blood Sugar', price: 95.00, stock: 80, description: 'Cost-effective DPP-4 inhibitor for type 2 diabetes management with once-daily dosing.' },

  // Cholesterol & Blood Pressure
  { name: 'Atorva 10mg Tablet', category: 'Cholesterol & Blood Pressure', price: 85.00, stock: 110, description: 'Atorvastatin 10mg for lowering LDL bad cholesterol, raising HDL, and cardiovascular risk reduction.' },
  { name: 'Telma 40mg Tablet', category: 'Cholesterol & Blood Pressure', price: 125.00, stock: 140, description: 'Telmisartan 40mg angiotensin receptor blocker for high blood pressure control and organ protection.' },
  { name: 'Amlong 5mg Tablet', category: 'Cholesterol & Blood Pressure', price: 42.00, stock: 160, description: 'Amlodipine 5mg calcium channel blocker for arterial vasodilation and hypertensive crisis prevention.' },
  { name: 'Rosuvas 10mg Tablet', category: 'Cholesterol & Blood Pressure', price: 175.00, stock: 75, description: 'Rosuvastatin 10mg high-potency statin for hyperlipidemia and cardiovascular arterial plaque stabilization.' },
  { name: 'Cilacar 10mg Tablet', category: 'Cholesterol & Blood Pressure', price: 112.00, stock: 90, description: 'Cilnidipine 10mg dual L/N-type calcium channel blocker gentle on kidneys and pedal edema prevention.' },
  { name: 'Metolar XR 50mg Tablet', category: 'Cholesterol & Blood Pressure', price: 145.00, stock: 65, description: 'Metoprolol Succinate extended release beta-blocker for hypertension, angina pectoris, and arrhythmia.' },

  // Vitamins & Supplements
  { name: 'Becosules Z Capsule', category: 'Vitamins & Supplements', price: 48.00, stock: 220, description: 'Vitamin B-Complex with Vitamin C & Zinc for mouth ulcers, fatigue, metabolic health, and tissue repair.' },
  { name: 'Neurobion Forte Tablet', category: 'Vitamins & Supplements', price: 38.50, stock: 190, description: 'Vitamin B1, B2, B3, B5, B6 & B12 for nerve health, tingling sensations, numbness, and vitality.' },
  { name: 'Shelcal 500mg Tablet', category: 'Vitamins & Supplements', price: 132.00, stock: 150, description: 'Calcium 500mg + Vitamin D3 250 IU for bone mineral density, osteoporosis prevention, and joint support.' },
  { name: 'Evion 400mg Capsule', category: 'Vitamins & Supplements', price: 37.00, stock: 250, description: 'Vitamin E 400mg antioxidant for skin glowing, cellular health, muscle cramps, and hair nourishment.' },
  { name: 'Limcee 500mg Chewable', category: 'Vitamins & Supplements', price: 26.00, stock: 300, description: 'Ascorbic Acid (Vitamin C) 500mg orange chewable tablets for daily immunity boosting against infections.' },
  { name: 'Zincovit Tablet', category: 'Vitamins & Supplements', price: 110.00, stock: 130, description: 'Multivitamin & Multimineral with grape seed extract for immune defense, post-illness recovery, and stamina.' },
  { name: 'ORS Oral Rehydration Salts 21g', category: 'Vitamins & Supplements', price: 22.00, stock: 200, description: 'WHO formula glucose-electrolyte solution to rapidly treat dehydration caused by loose motions or heat exhaustion.' },

  // Eye, Ear & Nasal Drops
  { name: 'Otrivin Oxy Fast Relief 10ml', category: 'Eye, Ear & Nasal Drops', price: 98.00, stock: 80, description: 'Oxymetazoline nasal spray for rapid 25-second relief from severe sinus and cold nasal congestion.' },
  { name: 'Ciplox Eye/Ear Drops 10ml', category: 'Eye, Ear & Nasal Drops', price: 19.50, stock: 140, description: 'Ciprofloxacin 0.3% antibacterial solution for conjunctivitis, pink eye, corneal ulcers, and outer ear canal infections.' },
  { name: 'Refresh Tears Eye Drops 10ml', category: 'Eye, Ear & Nasal Drops', price: 165.00, stock: 70, description: 'Carboxymethylcellulose 0.5% lubricant eye drops for computer screen dry eyes, burning, and irritation.' },

  // Ointments & Creams
  { name: 'Volini Pain Relief Gel 50g', category: 'Ointments & Creams', price: 155.00, stock: 100, description: 'Diclofenac + Linseed Oil + Methyl Salicylate quick-absorbing gel for neck stiffness, sprains, and back pain.' },
  { name: 'Betadine 10% Ointment 20g', category: 'Ointments & Creams', price: 125.00, stock: 90, description: 'Povidone Iodine microbicidal water-soluble ointment for cuts, abrasions, minor burns, and wound prevention.' },
  { name: 'Soframycin Skin Cream 30g', category: 'Ointments & Creams', price: 62.00, stock: 110, description: 'Framycetin sulphate topical antibacterial cream for boils, folliculitis, scalds, and infected cuts.' },
  { name: 'Candid B Cream 20g', category: 'Ointments & Creams', price: 142.00, stock: 75, description: 'Clotrimazole + Beclomethasone dual antifungal-antiinflammatory cream for ringworm, jock itch, and skin fungal infections.' },
  { name: 'Moov Pain Relief Balm 25g', category: 'Ointments & Creams', price: 85.00, stock: 130, description: 'Ayurvedic warmth-generating formula with nilgiri oil for quick backache, muscle spasm, and joint relief.' },

  // Sprays & Inhalers
  { name: 'Asthalin Inhaler 100mcg', category: 'Sprays & Inhalers', price: 165.00, stock: 60, description: 'Salbutamol 100mcg 200 metered doses bronchodilator rescue inhaler for instant asthma attack breathlessness relief.' },
  { name: 'Budecort 200 Inhaler', category: 'Sprays & Inhalers', price: 345.00, stock: 45, description: 'Budesonide 200mcg corticosteroid preventive inhaler for reducing airway inflammation in chronic asthma and COPD.' },
  { name: 'Foracort 200 Synchrobreathe', category: 'Sprays & Inhalers', price: 470.00, stock: 35, description: 'Formoterol + Budesonide breath-actuated inhaler for long-term bronchial maintenance and symptom control.' },
  { name: 'Relispray Pain Relief Spray 75g', category: 'Sprays & Inhalers', price: 160.00, stock: 85, description: 'Fast penetrating aerosol spray for sports injuries, muscle cramps, and joint sprains without hand rubbing.' }
];

export const INITIAL_PRODUCTS = RAW_PRODUCTS.map((item, idx) => ({
  _id: `prod_${idx + 1}`,
  numId: idx + 1,
  name: item.name,
  category: item.category,
  price: item.price,
  stock: item.stock,
  description: item.description,
  image: generateMedicineImage(item.name, item.category),
  createdAt: new Date(Date.now() - (RAW_PRODUCTS.length - idx) * 3600000).toISOString(),
}));

export const INITIAL_USERS = [
  {
    _id: 'user_1',
    name: 'Admin Owner',
    email: 'admin@sai.com',
    password: 'admin123',
    phone: '8328579509',
    role: 'admin',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'user_2',
    name: 'Sai Kumar',
    email: 'customer@sai.com',
    password: 'customer123',
    phone: '8328579509',
    role: 'customer',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'user_3',
    name: 'Vijay Anand',
    email: 'vijay@sai.com',
    password: 'vijay123',
    phone: '9988776655',
    role: 'customer',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'user_4',
    name: 'Deepa Raj',
    email: 'deepa@sai.com',
    password: 'deepa123',
    phone: '8877665544',
    role: 'customer',
    createdAt: new Date().toISOString(),
  },
];

export const INITIAL_ORDERS = [
  {
    _id: 'order_1',
    numId: 1001,
    customerEmail: 'customer@sai.com',
    items: [
      {
        product: {
          id: 1,
          _id: 'prod_1',
          name: 'Dolo 650mg Tablet',
          category: 'Analgesic & Fever Relief',
          price: 34.00,
        },
        quantity: 2,
      },
    ],
    total: 68.00,
    status: 'Pending',
    date: '2026-08-25',
    createdAt: new Date('2026-08-25').toISOString(),
  },
  {
    _id: 'order_2',
    numId: 1002,
    customerEmail: 'vijay@sai.com',
    items: [
      {
        product: {
          id: 2,
          _id: 'prod_2',
          name: 'Crocin 500mg Advance',
          category: 'Analgesic & Fever Relief',
          price: 28.50,
        },
        quantity: 1,
      },
    ],
    total: 28.50,
    status: 'Delivered',
    date: '2026-08-24',
    createdAt: new Date('2026-08-24').toISOString(),
  },
];

class MemoryStore {
  constructor() {
    this.products = JSON.parse(JSON.stringify(INITIAL_PRODUCTS));
    this.users = JSON.parse(JSON.stringify(INITIAL_USERS));
    this.orders = JSON.parse(JSON.stringify(INITIAL_ORDERS));
  }

  // --- Users ---
  async verifyUserPassword(user, plainPassword) {
    if (!user) return false;
    if (user.password === plainPassword) return true;
    try {
      return await bcrypt.compare(plainPassword, user.password);
    } catch {
      return false;
    }
  }

  findUserByEmail(email) {
    if (!email) return null;
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  findUserById(id) {
    if (!id) return null;
    return this.users.find(u => String(u._id) === String(id) || String(u.id) === String(id)) || null;
  }

  async createUser(userData) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);
    const newUser = {
      _id: 'user_' + Date.now(),
      name: userData.name,
      email: userData.email.toLowerCase(),
      phone: userData.phone || '8328579509',
      password: hashedPassword,
      role: userData.role === 'admin' ? 'admin' : 'customer',
      createdAt: new Date().toISOString(),
    };
    this.users.push(newUser);
    return newUser;
  }

  deleteUserByEmail(email) {
    const initialLen = this.users.length;
    this.users = this.users.filter(u => u.email.toLowerCase() !== email.toLowerCase());
    return this.users.length < initialLen;
  }

  getAllUsers() {
    return this.users.map(({ password, ...rest }) => rest);
  }

  // --- Products ---
  getAllProducts({ search, limit } = {}) {
    let list = [...this.products];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q))
      );
    }
    list.sort((a, b) => (a.numId || 0) - (b.numId || 0));
    if (limit) {
      list = list.slice(0, parseInt(limit));
    }
    return list;
  }

  findProductById(id) {
    return this.products.find(p => String(p._id) === String(id) || String(p.numId) === String(id)) || null;
  }

  createProduct(productData) {
    const maxNum = this.products.reduce((max, p) => Math.max(max, p.numId || 0), 0);
    const newProd = {
      _id: 'prod_' + Date.now(),
      numId: maxNum + 1,
      name: productData.name,
      category: productData.category,
      price: parseFloat(productData.price) || 0,
      stock: parseInt(productData.stock) || 0,
      description: productData.description || '',
      image: productData.image || generateMedicineImage(productData.name, productData.category || 'General Allopathy'),
      createdAt: new Date().toISOString(),
    };
    this.products.unshift(newProd);
    return newProd;
  }

  updateProduct(id, updates) {
    const idx = this.products.findIndex(p => String(p._id) === String(id) || String(p.numId) === String(id));
    if (idx === -1) return null;
    const curr = this.products[idx];
    this.products[idx] = {
      ...curr,
      name: updates.name || curr.name,
      category: updates.category || curr.category,
      price: updates.price !== undefined ? parseFloat(updates.price) : curr.price,
      stock: updates.stock !== undefined ? parseInt(updates.stock) : curr.stock,
      description: updates.description !== undefined ? updates.description : curr.description,
      image: updates.image !== undefined ? updates.image : curr.image,
    };
    return this.products[idx];
  }

  deleteProduct(id) {
    const initialLen = this.products.length;
    this.products = this.products.filter(p => String(p._id) !== String(id) && String(p.numId) !== String(id));
    return this.products.length < initialLen;
  }

  deductStock(id, qty) {
    const p = this.findProductById(id);
    if (p) {
      p.stock = Math.max(0, (p.stock || 0) - (qty || 1));
    }
  }

  // --- Orders ---
  getAllOrders(user) {
    let list = [...this.orders];
    if (user && user.role === 'admin') {
      // return all
    } else if (user && user.email) {
      list = list.filter(o => o.customerEmail.toLowerCase() === user.email.toLowerCase());
    }
    return list.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
  }

  createOrder({ items, customerEmail, user }) {
    const maxNum = this.orders.reduce((max, o) => Math.max(max, o.numId || 0), 1000);
    let total = 0;
    const orderItems = [];

    for (const item of items) {
      const prod = item.product;
      const qty = item.quantity || 1;
      total += (prod.price || 0) * qty;

      orderItems.push({
        product: {
          id: prod.id || prod._id,
          _id: prod._id || prod.id,
          name: prod.name,
          category: prod.category,
          price: prod.price,
          description: prod.description,
          image: prod.image,
          stock: prod.stock,
        },
        quantity: qty,
      });

      this.deductStock(prod._id || prod.id, qty);
    }

    const newOrder = {
      _id: 'order_' + Date.now(),
      numId: maxNum + 1,
      customerEmail: (user?.email || customerEmail || '').toLowerCase(),
      user: user?._id || null,
      items: orderItems,
      total,
      status: 'Pending',
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };

    this.orders.unshift(newOrder);
    return newOrder;
  }

  updateOrderStatus(id, status) {
    const order = this.orders.find(o => String(o._id) === String(id) || String(o.numId) === String(id));
    if (!order) return null;
    order.status = status;
    return order;
  }
}

export const memoryStore = new MemoryStore();
