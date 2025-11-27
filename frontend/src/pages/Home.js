import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Wrench, Clock, Shield, Star, ArrowRight } from 'lucide-react';

export default function Home({ user }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/70 border-b border-amber-100">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Wrench className="w-8 h-8 text-amber-700" />
            <h1 className="text-2xl font-bold text-amber-900" style={{ fontFamily: 'Cormorant Garamond, serif' }}>ShoeRepair</h1>
          </div>
          <nav className="flex items-center gap-4">
            <Link to="/services">
              <Button variant="ghost" data-testid="services-nav-btn">Nos Services</Button>
            </Link>
            {user ? (
              <Link to="/dashboard">
                <Button data-testid="dashboard-nav-btn" className="bg-amber-700 hover:bg-amber-800">Tableau de bord</Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button data-testid="auth-nav-btn" className="bg-amber-700 hover:bg-amber-800">Connexion</Button>
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 text-center">
        <h2 
          className="text-5xl sm:text-6xl lg:text-7xl font-bold text-amber-950 mb-6" 
          style={{ fontFamily: 'Cormorant Garamond, serif' }}
          data-testid="hero-title"
        >
          Redonnez vie à vos chaussures
        </h2>
        <p className="text-lg sm:text-xl text-amber-800 mb-8 max-w-2xl mx-auto">
          Connectez-vous avec les meilleurs cordonniers. Envoyez vos chaussures, recevez-les réparées directement chez vous.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link to="/services">
            <Button 
              size="lg" 
              className="bg-amber-700 hover:bg-amber-800 text-lg px-8"
              data-testid="get-started-btn"
            >
              Commencer <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Link to="/auth">
            <Button 
              size="lg" 
              variant="outline" 
              className="border-amber-700 text-amber-700 hover:bg-amber-50 text-lg px-8"
              data-testid="join-cobbler-btn"
            >
              Devenir Cordonnier
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white/60 backdrop-blur p-8 rounded-2xl border border-amber-200 shadow-sm hover:shadow-lg transition-all" data-testid="feature-easy">
            <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mb-4">
              <Wrench className="w-7 h-7 text-amber-700" />
            </div>
            <h3 className="text-xl font-bold text-amber-950 mb-3" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Service Professionnel</h3>
            <p className="text-amber-800">Nos cordonniers experts prennent soin de vos chaussures avec passion et savoir-faire.</p>
          </div>

          <div className="bg-white/60 backdrop-blur p-8 rounded-2xl border border-amber-200 shadow-sm hover:shadow-lg transition-all" data-testid="feature-fast">
            <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mb-4">
              <Clock className="w-7 h-7 text-amber-700" />
            </div>
            <h3 className="text-xl font-bold text-amber-950 mb-3" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Livraison Rapide</h3>
            <p className="text-amber-800">Choisissez entre livraison standard (10 jours) ou express (72h) selon vos besoins.</p>
          </div>

          <div className="bg-white/60 backdrop-blur p-8 rounded-2xl border border-amber-200 shadow-sm hover:shadow-lg transition-all" data-testid="feature-secure">
            <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-7 h-7 text-amber-700" />
            </div>
            <h3 className="text-xl font-bold text-amber-950 mb-3" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Paiement Sécurisé</h3>
            <p className="text-amber-800">Transactions sécurisées via Stripe. Payez en toute confiance.</p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="container mx-auto px-4 py-20 bg-white/40 backdrop-blur rounded-3xl my-12">
        <h2 className="text-4xl font-bold text-center text-amber-950 mb-16" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Comment ça marche ?</h2>
        <div className="grid md:grid-cols-4 gap-8">
          {[
            { num: '1', title: 'Choisissez', desc: 'Sélectionnez le service de réparation adapté' },
            { num: '2', title: 'Envoyez', desc: 'Envoyez vos chaussures avec le numéro de référence' },
            { num: '3', title: 'Réparation', desc: 'Un cordonnier expert prend en charge votre commande' },
            { num: '4', title: 'Recevez', desc: 'Recevez vos chaussures réparées chez vous' }
          ].map((step, idx) => (
            <div key={idx} className="text-center" data-testid={`step-${step.num}`}>
              <div className="w-16 h-16 bg-amber-700 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                {step.num}
              </div>
              <h4 className="text-lg font-bold text-amber-950 mb-2">{step.title}</h4>
              <p className="text-amber-800 text-sm">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-amber-900 text-amber-50 py-12 mt-20">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Wrench className="w-6 h-6" />
            <span className="text-xl font-bold" style={{ fontFamily: 'Cormorant Garamond, serif' }}>ShoeRepair</span>
          </div>
          <p className="text-amber-200">© 2025 ShoeRepair. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
