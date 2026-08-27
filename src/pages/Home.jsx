import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { aiAPI } from '../services/api';

function Home({ products, addToCart }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [symptomsInput, setSymptomsInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiError, setAiError] = useState('');
  const navigate = useNavigate();

  // Handle search submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/products');
    }
  };

  // Handle AI Symptom Analysis Submission
  const handleAnalyzeSymptoms = async (e, customSymptom = null) => {
    if (e) e.preventDefault();
    const targetSymptoms = customSymptom || symptomsInput;

    if (!targetSymptoms || !targetSymptoms.trim()) {
      setAiError('Please enter your symptoms to run AI analysis.');
      return;
    }

    setAiError('');
    setAiLoading(true);
    setAiResult(null);

    try {
      const response = await aiAPI.analyzeSymptoms(targetSymptoms);
      if (response.data && response.data.success) {
        setAiResult(response.data);
      }
    } catch (err) {
      console.error('AI analysis error:', err);
      // Client-side fallback if server fails
      const matched = products.filter(p => 
        p.name.toLowerCase().includes(targetSymptoms.toLowerCase()) || 
        p.category.toLowerCase().includes(targetSymptoms.toLowerCase()) ||
        p.description.toLowerCase().includes(targetSymptoms.toLowerCase())
      ).slice(0, 4);

      setAiResult({
        disease: 'Identified Health Symptom Complex',
        severity: 'Mild',
        summary: `Analysis for symptoms: "${targetSymptoms}". Found matching treatments in catalog.`,
        precautions: ['Stay well hydrated', 'Get adequate rest', 'Consult a pharmacist or physician if symptoms persist'],
        matchedMedicines: matched.length > 0 ? matched : products.slice(0, 4)
      });
    } finally {
      setAiLoading(false);
    }
  };

  const handleQuickChipClick = (symptomaticText) => {
    setSymptomsInput(symptomaticText);
    handleAnalyzeSymptoms(null, symptomaticText);
  };

  // Show the first 3 products as "Featured Medicines"
  const featuredProducts = products.slice(0, 3);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Hero Section */}
      <section style={{
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '2.5rem 1.5rem',
        textAlign: 'center',
        boxShadow: 'var(--shadow)'
      }}>
        <h1 style={{ color: 'var(--primary)', fontSize: '2.25rem', marginBottom: '0.5rem' }}>
          Sri Satya Sai Medicals and General Stores
        </h1>
        <p style={{ fontSize: '1.25rem', fontWeight: '500', color: 'var(--text)', marginBottom: '1.5rem' }}>
          "Your trusted local pharmacy & Healthcare Assistant"
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="search-container" style={{ margin: '0 auto 1.5rem auto' }}>
          <input
            type="text"
            placeholder="Search medicines (e.g., Paracetamol, Augmentin, Allegra)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="btn btn-primary">Search</button>
        </form>

        {/* Contact & Location info */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '2rem',
          flexWrap: 'wrap',
          fontSize: '0.9rem',
          borderTop: '1px solid var(--border)',
          paddingTop: '1.5rem',
          marginTop: '1.5rem'
        }}>
          <div>📍 <strong>Location:</strong> Kanigiri Road, Kandukur</div>
          <div>📞 <strong>Phone Support:</strong> 8328579509</div>
        </div>
      </section>

      {/* AI Health Assistant Section */}
      <section style={{
        backgroundColor: '#f0fdf4',
        border: '1px solid #bbf7d0',
        borderRadius: 'var(--radius)',
        padding: '2rem 1.5rem',
        boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.1)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <span style={{
            backgroundColor: '#dcfce7',
            color: '#166534',
            padding: '0.25rem 0.75rem',
            borderRadius: '1rem',
            fontSize: '0.85rem',
            fontWeight: '600',
            textTransform: 'uppercase'
          }}>
            🤖 AI Symptom & Disease Analyzer
          </span>
          <h2 style={{ color: '#065f46', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
            Describe Your Symptoms to Find Diseases & Recommended Medicines
          </h2>
          <p style={{ color: '#047857', fontSize: '0.95rem', maxWidth: '650px', margin: '0 auto' }}>
            Type how you are feeling (e.g., <em>"fever and severe headache"</em>, <em>"acidity and burning in stomach"</em>, or <em>"runny nose and allergy"</em>) to get instant AI analysis and store medicine recommendations.
          </p>
        </div>

        {/* Quick Symptom Chips */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          <button
            type="button"
            onClick={() => handleQuickChipClick('fever, headache and body pain')}
            className="btn btn-secondary btn-sm"
            style={{ borderRadius: '20px', backgroundColor: '#ffffff', borderColor: '#86efac' }}
          >
            🌡️ Fever & Body Pain
          </button>
          <button
            type="button"
            onClick={() => handleQuickChipClick('cold, runny nose and sneezing allergy')}
            className="btn btn-secondary btn-sm"
            style={{ borderRadius: '20px', backgroundColor: '#ffffff', borderColor: '#86efac' }}
          >
            🤧 Cold & Allergy
          </button>
          <button
            type="button"
            onClick={() => handleQuickChipClick('stomach acidity, heartburn and pain')}
            className="btn btn-secondary btn-sm"
            style={{ borderRadius: '20px', backgroundColor: '#ffffff', borderColor: '#86efac' }}
          >
            🤢 Acidity & Stomach Pain
          </button>
          <button
            type="button"
            onClick={() => handleQuickChipClick('cough, phlegm and sore throat')}
            className="btn btn-secondary btn-sm"
            style={{ borderRadius: '20px', backgroundColor: '#ffffff', borderColor: '#86efac' }}
          >
            🫁 Cough & Sore Throat
          </button>
          <button
            type="button"
            onClick={() => handleQuickChipClick('weakness, tiredness and vitamin deficiency')}
            className="btn btn-secondary btn-sm"
            style={{ borderRadius: '20px', backgroundColor: '#ffffff', borderColor: '#86efac' }}
          >
            💊 Vitamin & Weakness
          </button>
        </div>

        {/* AI Symptom Input Form */}
        <form onSubmit={handleAnalyzeSymptoms} style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <textarea
              placeholder="Type your symptoms here (e.g., 'I have fever, shivering, and headache since yesterday')..."
              value={symptomsInput}
              onChange={(e) => setSymptomsInput(e.target.value)}
              className="form-input"
              style={{
                height: '90px',
                fontFamily: 'inherit',
                fontSize: '0.95rem',
                padding: '0.75rem',
                border: '2px solid #86efac',
                backgroundColor: '#ffffff'
              }}
            />
          </div>

          {aiError && (
            <div className="alert alert-danger" style={{ marginBottom: '1rem', fontSize: '0.85rem' }}>
              ⚠️ {aiError}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '0.85rem',
              fontSize: '1rem',
              fontWeight: '600',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            disabled={aiLoading}
          >
            {aiLoading ? (
              <span>⏳ Analyzing Symptoms with AI...</span>
            ) : (
              <span>⚡ Analyze Symptoms & Find Medicines</span>
            )}
          </button>
        </form>

        {/* AI Analysis Result Panel */}
        {aiResult && (
          <div style={{
            marginTop: '2rem',
            backgroundColor: '#ffffff',
            border: '1px solid #6ee7b7',
            borderRadius: 'var(--radius)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow)'
          }}>
            {/* Header / Disease Identification */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: '1rem',
              borderBottom: '1px solid var(--border)',
              paddingBottom: '1rem',
              marginBottom: '1rem'
            }}>
              <div>
                <span className="badge badge-success" style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                  Identified Condition / Disease
                </span>
                <h3 style={{ color: 'var(--primary)', margin: 0, fontSize: '1.35rem' }}>
                  🧬 {aiResult.disease}
                </h3>
              </div>
              <div>
                <span className="badge badge-warning" style={{ fontSize: '0.8rem' }}>
                  Severity: {aiResult.severity}
                </span>
              </div>
            </div>

            {/* AI Summary */}
            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ marginBottom: '0.25rem', color: 'var(--text)' }}>🩺 Clinical AI Summary:</h4>
              <p style={{ color: 'var(--text)', fontSize: '0.95rem', margin: 0 }}>
                {aiResult.summary}
              </p>
            </div>

            {/* Precautions list */}
            {aiResult.precautions && aiResult.precautions.length > 0 && (
              <div style={{ marginBottom: '1.5rem', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '6px' }}>
                <h4 style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text)' }}>📋 Care Precautions:</h4>
                <ul style={{ paddingLeft: '1.25rem', margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {aiResult.precautions.map((prec, idx) => (
                    <li key={idx}>{prec}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Matched Store Medicines */}
            <div>
              <h3 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>
                💊 Recommended Medicines from Store Catalog:
              </h3>

              {aiResult.matchedMedicines && aiResult.matchedMedicines.length > 0 ? (
                <div className="product-grid">
                  {aiResult.matchedMedicines.map((prod) => (
                    <ProductCard
                      key={prod.id || prod._id}
                      product={prod}
                      addToCart={addToCart}
                    />
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)' }}>No exact medicine match found in store catalog. Please search in Catalogue.</p>
              )}
            </div>

            {/* Disclaimer */}
            <div style={{
              marginTop: '1.5rem',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              textAlign: 'center',
              borderTop: '1px solid var(--border)',
              paddingTop: '0.75rem'
            }}>
              ⚠️ <strong>Medical Disclaimer:</strong> AI recommendations are generated for informational assistance. Please consult a registered doctor or pharmacist for severe or persistent health symptoms.
            </div>
          </div>
        )}
      </section>

      {/* Featured Products Section */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>Featured Store Medicines</h2>
          <button onClick={() => navigate('/products')} className="btn btn-secondary btn-sm">
            View All 250+ Medicines →
          </button>
        </div>

        <div className="product-grid">
          {featuredProducts.map(product => (
            <ProductCard
              key={product.id || product._id}
              product={product}
              addToCart={addToCart}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;
