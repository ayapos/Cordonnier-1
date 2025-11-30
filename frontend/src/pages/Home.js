import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, Shield, Star, ArrowRight, Sparkles } from 'lucide-react';

export default function Home({ user }) {
  return (
    <div className="min-h-screen bg-white">
      {/* Fixed Mobile Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="px-4 py-3 flex justify-between items-center max-w-md mx-auto">
          <div>
            <h1 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Inter, sans-serif' }}>ShoeRepair</h1>
            <p className="text-xs text-gray-500">Réparation à domicile</p>
          </div>
          <nav className="flex items-center gap-2">
            {user ? (
              <Link to="/dashboard">
                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white" data-testid="dashboard-nav-btn">Dashboard</Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white" data-testid="auth-nav-btn">Connexion</Button>
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Hero avec grande image */}
      <section className="pt-16 pb-8">
        <div className="relative h-[60vh] overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1605812860427-4024433a70fd?w=800&q=80" 
            alt="Chaussures premium"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h2 className="text-4xl font-bold mb-3" style={{ fontFamily: 'Inter, sans-serif' }} data-testid="hero-title">
              Réparez vos<br />chaussures préférées
            </h2>
            <p className="text-lg mb-4 text-gray-200">Cordonnier le plus proche • Livraison incluse</p>
            <Link to="/services">
              <Button 
                size="lg" 
                className="bg-indigo-600 hover:bg-indigo-700 text-white w-full"
                data-testid="get-started-btn"
              >
                Voir les services <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Grid de services visuels */}
      <section className="px-4 py-8 max-w-md mx-auto">
        <h3 className="text-2xl font-bold mb-6 text-gray-900">Nos services</h3>
        <div className="grid grid-cols-2 gap-4">
          {[
            { img: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&q=80', title: 'Talons & Escarpins', count: '4 services' },
            { img: 'https://images.unsplash.com/photo-1638609348722-aa2a3a67db26?w=400&q=80', title: 'Chaussures de ville', count: '3 services' },
            { img: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&q=80', title: 'Sneakers', count: '3 services' },
            { img: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=400&q=80', title: 'Bottes', count: '3 services' }
          ].map((service, idx) => (
            <Link to="/services" key={idx} className="group">
              <div className="relative rounded-2xl overflow-hidden shadow-md mb-2">
                <img src={service.img} alt={service.title} className="w-full h-40 object-cover group-hover:scale-105 transition-transform" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h4 className="font-bold text-sm">{service.title}</h4>
                  <p className="text-xs text-gray-200">{service.count}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-8 bg-gray-50">
        <div className="max-w-md mx-auto space-y-4">
          <div className="flex items-start gap-4 p-4 bg-white rounded-2xl shadow-sm" data-testid="feature-auto">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <MapPin className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-1">Attribution automatique</h4>
              <p className="text-sm text-gray-600">Votre commande est assignée au cordonnier le plus proche automatiquement</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-white rounded-2xl shadow-sm" data-testid="feature-fast">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Clock className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-1">Rapide et pratique</h4>
              <p className="text-sm text-gray-600">Envoi et retour inclus. Standard 10j ou Express 72h</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-white rounded-2xl shadow-sm" data-testid="feature-secure">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-1">Paiement sécurisé</h4>
              <p className="text-sm text-gray-600">Stripe Connect. Versement automatique aux cordonniers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="px-4 py-12 max-w-md mx-auto">
        <h3 className="text-2xl font-bold mb-8 text-gray-900">Comment ça marche ?</h3>
        <div className="space-y-6">
          {[
            { num: '1', title: 'Choisissez votre service', desc: 'Parcourez nos services et sélectionnez ce dont vous avez besoin' },
            { num: '2', title: 'Uploadez des photos', desc: 'Prenez des photos de vos chaussures à réparer' },
            { num: '3', title: 'Payez en ligne', desc: 'Paiement sécurisé - Cordonnier assigné automatiquement' },
            { num: '4', title: 'Envoyez vos chaussures', desc: 'Utilisez votre numéro de référence pour l\'envoi' },
            { num: '5', title: 'Recevez-les réparées', desc: 'Livraison à domicile incluse' }
          ].map((step) => (
            <div key={step.num} className="flex gap-4" data-testid={`step-${step.num}`}>
              <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                {step.num}
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-1">{step.title}</h4>
                <p className="text-sm text-gray-600">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Galerie visuelle */}
      <section className="px-4 py-8 bg-gray-50">
        <div className="max-w-md mx-auto">
          <h3 className="text-2xl font-bold mb-6 text-gray-900">Galerie</h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              'https://images.unsplash.com/photo-1581101767113-1677fc2beaa8?w=300&q=80',
              'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=300&q=80',
              'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=300&q=80',
              'https://images.unsplash.com/photo-1519226719127-9e805abb99b1?w=300&q=80',
              'https://images.unsplash.com/photo-1616406432452-07bc5938759d?w=300&q=80',
              'https://images.unsplash.com/photo-1608667508764-33cf0726b13a?w=300&q=80'
            ].map((img, idx) => (
              <div key={idx} className="aspect-square rounded-xl overflow-hidden shadow-md">
                <img src={img} alt={`Galerie ${idx + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="px-4 py-12 max-w-md mx-auto text-center">
        <h3 className="text-3xl font-bold mb-4 text-gray-900">Prêt à commencer ?</h3>
        <p className="text-gray-600 mb-6">Sublimez vos chaussures avec nos artisans qualifiés</p>
        <Link to="/services">
          <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white w-full">
            Découvrir nos services
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-12">
        <div className="max-w-md mx-auto px-4 text-center">
          <h4 className="font-bold text-lg mb-2">ShoeRepair</h4>
          <p className="text-gray-400 text-sm">© 2025 ShoeRepair. Réparation professionnelle.</p>
        </div>
      </footer>
    </div>
  );
}
