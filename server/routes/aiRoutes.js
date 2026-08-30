import express from 'express';
import mongoose from 'mongoose';
import Medicine from '../models/Medicine.js';
import { memoryStore } from '../store/memoryStore.js';

const router = express.Router();

// AI Symptom Analysis Knowledge Base Rule Engine
const SYMPTOM_RULES = [
  {
    keywords: ['fever', 'temperature', 'pyrexia', 'chills', 'body ache', 'headache', 'joint pain', 'pain'],
    disease: 'Acute Pyrexia & Mild Inflammatory Pain (Fever / Body Ache)',
    severity: 'Mild to Moderate',
    summary: 'Symptoms indicate possible viral fever, tension headache, or systemic body pain requiring antipyretics and analgesics.',
    searchTerms: ['Paracetamol', 'Analgesic', 'Aceclofenac', 'Pain Relief', 'Ibuprofen'],
    precautions: ['Drink plenty of fluids', 'Rest adequately', 'Consult a doctor if fever exceeds 102°F or lasts > 3 days']
  },
  {
    keywords: ['cold', 'runny nose', 'sneezing', 'allergy', 'itching', 'hives', 'watery eyes', 'allergic', 'rhinitis'],
    disease: 'Allergic Rhinitis & Upper Respiratory Allergy',
    severity: 'Mild',
    summary: 'Symptoms correspond to histamine release causing nasal congestion, sneezing, itching, or skin allergy.',
    searchTerms: ['Allegra', 'Cetirizine', 'Avil', 'Antihistamine', 'Montelukast', 'Fexofenadine'],
    precautions: ['Avoid known allergen triggers', 'Keep surroundings dust-free', 'Do not drive if feeling drowsy']
  },
  {
    keywords: ['cough', 'phlegm', 'mucus', 'chest congestion', 'sore throat', 'throat', 'bronchial', 'wheezing'],
    disease: 'Bronchial Congestion & Wet/Dry Cough',
    severity: 'Mild to Moderate',
    summary: 'Airway irritation and mucus production causing persistent coughing and throat discomfort.',
    searchTerms: ['Syrup', 'Ascoril', 'Alex', 'Asthakind', 'Ambroxol', 'Salbutamol'],
    precautions: ['Stay hydrated with warm water', 'Avoid cold drinks & smoking', 'Use steam inhalation']
  },
  {
    keywords: ['acidity', 'gas', 'heartburn', 'stomach pain', 'gastric', 'reflux', 'bloating', 'indigestion', 'ulcer', 'vomiting', 'nausea'],
    disease: 'Acid Peptic Disease & Dyspepsia (Gastritis / Acidity)',
    severity: 'Mild to Moderate',
    summary: 'Excess gastric acid secretion causing stomach pain, heart burn, nausea, or abdominal discomfort.',
    searchTerms: ['Aciloc', 'Pantoprazole', 'Rabeprazole', 'Gastrointestinal', 'Ranitidine', 'Antacid'],
    precautions: ['Avoid spicy, oily, and acidic foods', 'Eat small frequent meals', 'Avoid lying down immediately after eating']
  },
  {
    keywords: ['infection', 'bacterial', 'pus', 'severe throat', 'swelling', 'pneumonia', 'urinary', 'wound'],
    disease: 'Suspected Bacterial Infection (Respiratory / Soft Tissue)',
    severity: 'Moderate',
    summary: 'Clinical presentation aligns with bacterial infection requiring broad-spectrum antibiotic intervention under medical supervision.',
    searchTerms: ['Augmentin', 'Azithral', 'Amoxyclav', 'Azee', 'Antibiotics', 'Amoxycillin'],
    precautions: ['Complete the full antibiotic course as prescribed', 'Take with meals to prevent stomach upset', 'Consult a physician']
  },
  {
    keywords: ['weakness', 'fatigue', 'tired', 'vitamin', 'immunity', 'energy', 'dizziness', 'deficiency'],
    disease: 'General Fatigue & Nutritional Deficiency',
    severity: 'Mild',
    summary: 'Low energy levels and micronutrient depletion requiring nutritional and vitamin supplementation.',
    searchTerms: ['Vitamin', 'Supplements', 'Ascorbic', 'Calcium', 'Zinc'],
    precautions: ['Maintain a balanced diet rich in greens and protein', 'Stay well hydrated', 'Get 7-8 hours of restful sleep']
  }
];

// @route   POST /api/ai/analyze-symptoms
// @desc    AI Symptom Analyzer - Identifies potential diseases and queries matching Indian medicines
// @access  Public
router.post('/analyze-symptoms', async (req, res) => {
  try {
    const { symptoms } = req.body;

    if (!symptoms || typeof symptoms !== 'string' || !symptoms.trim()) {
      return res.status(400).json({ message: 'Please describe your symptoms.' });
    }

    const text = symptoms.toLowerCase().trim();

    // Match best symptom rule based on keyword overlap count
    let bestMatch = null;
    let maxMatches = 0;

    for (const rule of SYMPTOM_RULES) {
      let matches = 0;
      for (const kw of rule.keywords) {
        if (text.includes(kw)) {
          matches += 2;
        }
      }
      if (matches > maxMatches) {
        maxMatches = matches;
        bestMatch = rule;
      }
    }

    // Default fallback if no specific rule matched strongly
    if (!bestMatch || maxMatches === 0) {
      bestMatch = {
        disease: 'General Health Discomfort & Mild Symptom Complex',
        severity: 'Mild',
        summary: 'Your described symptoms correspond to general health discomfort. A healthcare evaluation is recommended if symptoms persist.',
        searchTerms: ['Paracetamol', 'Vitamin', 'Syrup', 'General Allopathy'],
        precautions: ['Stay well hydrated', 'Rest and monitor symptoms closely', 'Consult a certified medical doctor']
      };
    }

    let matchedMedicines = [];

    if (mongoose.connection.readyState === 1) {
      const regexQueries = bestMatch.searchTerms.map(term => new RegExp(term, 'i'));
      matchedMedicines = await Medicine.find({
        $or: [
          { name: { $in: regexQueries } },
          { category: { $in: regexQueries } },
          { description: { $in: regexQueries } }
        ]
      }).limit(6);
    } else {
      // In-memory matching
      const all = memoryStore.getAllProducts();
      matchedMedicines = all.filter(p => {
        return bestMatch.searchTerms.some(term => {
          const t = term.toLowerCase();
          return (p.name && p.name.toLowerCase().includes(t)) ||
                 (p.category && p.category.toLowerCase().includes(t)) ||
                 (p.description && p.description.toLowerCase().includes(t));
        });
      }).slice(0, 6);
    }

    res.json({
      success: true,
      query: symptoms,
      disease: bestMatch.disease,
      severity: bestMatch.severity,
      summary: bestMatch.summary,
      precautions: bestMatch.precautions,
      matchedMedicines
    });
  } catch (error) {
    console.error('AI symptom analysis error:', error);
    res.status(500).json({ message: error.message || 'Error analyzing symptoms' });
  }
});

export default router;
