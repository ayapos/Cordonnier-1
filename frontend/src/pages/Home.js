import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Wrench, Clock, Shield, Star, ArrowRight, Sparkles, Heart } from 'lucide-react';

export default function Home({ user }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 border-b border-pink-200 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-pink-400 to-purple-500 p-2 rounded-2xl shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent" style={{ fontFamily: 'Playfair Display, serif' }}>ShoeRepair</h1>
              <p className="text-xs text-pink-600">L'élégance à portée de main</p>
            </div>
          </div>
          <nav className="flex items-center gap-4">
            <Link to="/services">
              <Button variant="ghost" className="text-pink-700 hover:text-pink-800 hover:bg-pink-100" data-testid="services-nav-btn">Nos Services</Button>
            </Link>
            {user ? (
              <Link to="/dashboard">
                <Button data-testid="dashboard-nav-btn" className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow-md">Tableau de bord</Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button data-testid="auth-nav-btn" className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow-md">Connexion</Button>
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section with Images */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-64 h-64 bg-pink-300/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-purple-300/30 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text Content */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur rounded-full border border-pink-200 mb-6">
                <Heart className="w-4 h-4 text-pink-500" />
                <span className="text-sm text-pink-700 font-medium">Votre beauté mérite le meilleur</span>
              </div>
              
              <h2 
                className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6" 
                style={{ fontFamily: 'Playfair Display, serif' }}
                data-testid="hero-title"
              >
                <span className="bg-gradient-to-r from-pink-600 via-rose-500 to-purple-600 bg-clip-text text-transparent">
                  Sublimez
                </span>
                <br />
                <span className="text-gray-800">vos chaussures</span>
              </h2>
              
              <p className="text-lg sm:text-xl text-gray-700 mb-8 max-w-xl">
                Des artisans passionnés redonnent vie à vos chaussures préférées. Service premium, livraison soignée.
              </p>
              
              <div className="flex gap-4 flex-wrap">
                <Link to="/services">
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white text-lg px-8 shadow-lg hover:shadow-xl transition-all"
                    data-testid="get-started-btn"
                  >
                    Découvrir <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-2 border-pink-300 text-pink-700 hover:bg-pink-50 text-lg px-8"
                    data-testid="join-cobbler-btn"
                  >
                    Devenir Artisan
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right: Image Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white transform hover:scale-105 transition-all duration-300">
                  <img 
                    src="https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&q=80" 
                    alt="Escarpins élégants" 
                    className="w-full h-64 object-cover"
                  />
                </div>
                <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white transform hover:scale-105 transition-all duration-300">
                  <img 
                    src="https://images.unsplash.com/photo-1553808373-b2c5b7ddb117?w=600&q=80" 
                    alt="Chaussures en cuir" 
                    className="w-full h-48 object-cover"
                  />
                </div>
              </div>
              <div className="space-y-4 pt-12">
                <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white transform hover:scale-105 transition-all duration-300">
                  <img 
                    src="https://images.unsplash.com/photo-1515347619252-60a4bf4fff4f?w=600&q=80" 
                    alt="Réparation artisanale" 
                    className="w-full h-48 object-cover"
                  />
                </div>
                <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white transform hover:scale-105 transition-all duration-300">
                  <img 
                    src="https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?w=600&q=80" 
                    alt="Talons hauts" 
                    className="w-full h-64 object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <h3 className="text-4xl font-bold text-center mb-12" style={{ fontFamily: 'Playfair Display, serif' }}>
          <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">Pourquoi nous choisir ?</span>
        </h3>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white/70 backdrop-blur p-8 rounded-3xl border border-pink-200 shadow-lg hover:shadow-2xl transition-all" data-testid="feature-easy">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>Artisanat d'Excellence</h3>
            <p className="text-gray-700">Nos artisans experts subliment vos chaussures avec passion et savoir-faire traditionnel.</p>
          </div>

          <div className="bg-white/70 backdrop-blur p-8 rounded-3xl border border-pink-200 shadow-lg hover:shadow-2xl transition-all" data-testid="feature-fast">
            <div className="w-16 h-16 bg-gradient-to-br from-rose-400 to-pink-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <Clock className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>Livraison Express</h3>
            <p className="text-gray-700">Choisissez entre livraison standard ou express 72h pour récupérer vos chaussures rapidement.</p>
          </div>

          <div className="bg-white/70 backdrop-blur p-8 rounded-3xl border border-pink-200 shadow-lg hover:shadow-2xl transition-all" data-testid="feature-secure">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>Paiement Sécurisé</h3>
            <p className="text-gray-700">Transactions sécurisées. Vos données sont protégées.</p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-white/60 backdrop-blur rounded-3xl p-12 border border-pink-200 shadow-xl">
          <h2 className="text-4xl font-bold text-center mb-16" style={{ fontFamily: 'Playfair Display, serif' }}>
            <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">Comment ça marche ?</span>
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { num: '1', title: 'Choisissez', desc: 'Sélectionnez le service adapté à vos besoins', icon: '✨' },
              { num: '2', title: 'Envoyez', desc: 'Envoyez vos chaussures avec votre numéro de référence', icon: '📦' },
              { num: '3', title: 'Magie', desc: 'Nos artisans subliment vos chaussures', icon: '💫' },
              { num: '4', title: 'Recevez', desc: 'Récupérez vos chaussures comme neuves', icon: '🎁' }
            ].map((step, idx) => (
              <div key={idx} className="text-center" data-testid={`step-${step.num}`}>
                <div className="w-20 h-20 bg-gradient-to-br from-pink-400 to-purple-500 text-white rounded-3xl flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
                  {step.icon}
                </div>
                <h4 className="text-lg font-bold text-gray-800 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>{step.title}</h4>
                <p className="text-gray-600 text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-12" style={{ fontFamily: 'Playfair Display, serif' }}>
          <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">Elles nous font confiance</span>
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name: 'Sophie M.', text: 'Mes escarpins préférés ont retrouvé une seconde jeunesse ! Service impeccable.', rating: 5 },
            { name: 'Marine L.', text: 'Réparation rapide et soignée. Je recommande vivement pour vos chaussures de luxe.', rating: 5 },
            { name: 'Claire D.', text: 'Un travail d\'artisan exceptionnel. Mes bottes sont magnifiques !', rating: 5 }
          ].map((testimonial, idx) => (
            <div key={idx} className="bg-white/70 backdrop-blur p-6 rounded-3xl border border-pink-200 shadow-lg">
              <div className="flex gap-1 mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-pink-500 text-pink-500" />
                ))}
              </div>
              <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>
              <p className="font-bold text-pink-700" style={{ fontFamily: 'Playfair Display, serif' }}>{testimonial.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-pink-600 to-purple-600 text-white py-12 mt-20">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-white/20 p-2 rounded-2xl">
              <Sparkles className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>ShoeRepair</span>
          </div>
          <p className="text-pink-100">© 2025 ShoeRepair. L'élégance à portée de main.</p>
        </div>
      </footer>
    </div>
  );
}
