import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, Shield, ArrowRight, ChevronLeft, ChevronRight, Star, ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import CurrencySwitcher from '@/components/CurrencySwitcher';
import { useCurrency } from '@/context/CurrencyContext';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Fallback carousel images if no images uploaded
const getFallbackCarouselImages = (t) => [
  {
    url: 'https://images.unsplash.com/photo-1621996659490-3275b4d0d951?w=800&q=80',
    title: t('pumpsHeels'),
    subtitle: t('expertRepair')
  },
  {
    url: 'https://images.unsplash.com/photo-1643968704781-df3b260df6a7?w=800&q=80',
    title: t('qualifiedCraftsmen'),
    subtitle: t('traditionalKnowHow')
  },
  {
    url: 'https://images.unsplash.com/photo-1658837407083-308b902ee99d?w=800&q=80',
    title: t('mensShoes'),
    subtitle: t('premiumRenovation')
  }
];

// Before/After Carousel Component
function BeforeAfterCarousel({ t }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const beforeAfterImages = [
    {
      before: 'https://images.unsplash.com/photo-1608667508764-33cf0726b13a?w=500&q=80',
      after: 'https://images.unsplash.com/photo-1529953717281-81a40b131119?w=500&q=80',
      title: t('bootResole')
    },
    {
      before: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=500&q=80',
      after: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=500&q=80',
      title: t('sneakersCleaning')
    },
    {
      before: 'https://images.unsplash.com/photo-1519226719127-9e805abb99b1?w=500&q=80',
      after: 'https://images.unsplash.com/photo-1638609348722-aa2a3a67db26?w=500&q=80',
      title: t('leatherRenovation')
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % beforeAfterImages.length);
    }, 5000); // Change every 5 seconds
    return () => clearInterval(timer);
  }, [beforeAfterImages.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % beforeAfterImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + beforeAfterImages.length) % beforeAfterImages.length);
  };

  return (
    <section className="px-4 py-12 max-w-md mx-auto">
      <h3 className="text-3xl font-bold mb-3 text-gray-900 text-center">{t('beforeAfterGallery')}</h3>
      <p className="text-center text-gray-600 mb-8">{t('repairResults')}</p>
      
      <div className="relative">
        {/* Carousel Container */}
        <div className="relative overflow-hidden rounded-2xl bg-white shadow-lg">
          <div 
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {beforeAfterImages.map((item, idx) => (
              <div key={idx} className="w-full flex-shrink-0 p-6">
                <h4 className="font-bold text-gray-900 mb-4 text-center text-lg">{item.title}</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="relative rounded-xl overflow-hidden">
                      <img src={item.before} alt="Avant" className="w-full h-56 object-cover" />
                      <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        AVANT
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="relative rounded-xl overflow-hidden">
                      <img src={item.after} alt="Après" className="w-full h-56 object-cover" />
                      <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        APRÈS
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all"
            aria-label="Précédent"
          >
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all"
            aria-label="Suivant"
          >
            <ChevronRight className="w-6 h-6 text-gray-800" />
          </button>

          {/* Indicators */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
            {beforeAfterImages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentSlide ? 'bg-orange-600 w-8' : 'bg-gray-300'
                }`}
                aria-label={`Aller à la slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home({ user }) {
  const { getCartCount } = useCart();
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [carouselImages, setCarouselImages] = useState([]);
  const [isLoadingImages, setIsLoadingImages] = useState(true);

  // Load carousel images from API FIRST
  useEffect(() => {
    const loadCarouselImages = async () => {
      try {
        const response = await axios.get(`${API}/media/carousel`);
        if (response.data && response.data.length > 0) {
          // Sort by position
          const sortedImages = response.data.sort((a, b) => (a.position || 999) - (b.position || 999));
          // Map to carousel format
          const mappedImages = sortedImages.map(img => ({
            url: `${BACKEND_URL}${img.url}`,
            title: img.title || t('carousel'),
            subtitle: '' // Admin can set this in future
          }));
          setCarouselImages(mappedImages);
        } else {
          // No uploaded images, use fallback
          setCarouselImages(getFallbackCarouselImages(t));
        }
      } catch (error) {
        console.log('API error, using fallback carousel images');
        // Use fallback images if API fails
        setCarouselImages(getFallbackCarouselImages(t));
      } finally {
        setIsLoadingImages(false);
      }
    };
    loadCarouselImages();
  }, [t]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [carouselImages.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Fixed Mobile Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="px-4 py-3 flex justify-between items-center max-w-md mx-auto">
          <div>
            <h1 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Inter, sans-serif' }}>{t('appTitle')}</h1>
            <p className="text-xs text-gray-500">{t('appSubtitle')}</p>
          </div>
          <nav className="flex items-center gap-2">
            <LanguageSwitcher />
            <CurrencySwitcher />
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="w-5 h-5 text-amber-700" />
                {getCartCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-700 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {getCartCount()}
                  </span>
                )}
              </Button>
            </Link>
            {user ? (
              <Link to="/dashboard">
                <Button size="sm" className="bg-orange-700 hover:bg-orange-800 text-white" data-testid="dashboard-nav-btn">Dashboard</Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button size="sm" className="bg-orange-700 hover:bg-orange-800 text-white" data-testid="auth-nav-btn">{t('login')}</Button>
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Carousel */}
      <section className="pt-16 pb-8">
        <div className="relative h-[65vh] overflow-hidden">
          {/* Loading state */}
          {isLoadingImages && (
            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-700 mx-auto mb-4"></div>
                <p className="text-gray-600">Chargement...</p>
              </div>
            </div>
          )}
          
          {/* Images */}
          {!isLoadingImages && carouselImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-700 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img 
                src={image.url}
                alt={image.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
              <div className="absolute bottom-20 left-0 right-0 px-6 text-white text-center">
                <h3 className="text-3xl font-bold mb-2">{image.title}</h3>
                <p className="text-lg text-gray-200">{image.subtitle}</p>
              </div>
            </div>
          ))}

          {/* Navigation Arrows */}
          <button 
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center hover:bg-white/30 transition-colors z-10"
            aria-label="Précédent"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <button 
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center hover:bg-white/30 transition-colors z-10"
            aria-label="Suivant"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-28 left-0 right-0 flex justify-center gap-2 z-10">
            {carouselImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentSlide ? 'bg-white w-8' : 'bg-white/50'
                }`}
                aria-label={`Slide ${index + 1}`}
              />
            ))}
          </div>

          {/* CTA */}
          <div className="absolute bottom-6 left-6 right-6 z-10">
            <Link to="/services">
              <Button 
                size="lg" 
                className="bg-orange-600 hover:bg-orange-700 text-white w-full shadow-xl"
                data-testid="get-started-btn"
              >
                {t('viewServices')} <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Comment ça marche - Horizontal */}
      <section className="px-4 py-8 max-w-md mx-auto bg-orange-50">
        <h3 className="text-2xl font-bold mb-2 text-gray-900 text-center">{t('howItWorks')}</h3>
        <p className="text-center text-gray-600 text-sm mb-6">{t('simpleAndFast')}</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { num: '1', title: t('step1Title'), desc: t('step1Desc') },
            { num: '2', title: t('step2Title'), desc: t('step2Desc') },
            { num: '3', title: t('step3Title'), desc: t('step3Desc') },
            { num: '4', title: t('step4Title'), desc: t('step4Desc') }
          ].map((step) => (
            <div key={step.num} className="bg-white p-3 rounded-xl shadow-sm text-center" data-testid={`step-${step.num}`}>
              <div className="w-10 h-10 bg-orange-700 text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-2">
                {step.num}
              </div>
              <h4 className="font-bold text-gray-900 text-sm mb-1">{step.title}</h4>
              <p className="text-xs text-gray-600">{step.desc}</p>
            </div>
          ))}
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
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <MapPin className="w-6 h-6 text-orange-700" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-1">{t('autoAssignmentTitle')}</h4>
              <p className="text-sm text-gray-600">{t('autoAssignmentDesc')}</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-white rounded-2xl shadow-sm" data-testid="feature-fast">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Clock className="w-6 h-6 text-orange-700" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-1">{t('fastAndConvenientTitle')}</h4>
              <p className="text-sm text-gray-600">{t('fastAndConvenientDesc')}</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-white rounded-2xl shadow-sm" data-testid="feature-secure">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-orange-700" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-1">{t('securePaymentTitle')}</h4>
              <p className="text-sm text-gray-600">{t('securePaymentDesc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Avant-Après Galerie - Carousel */}
      <BeforeAfterCarousel t={t} />

      {/* CTA Final */}
      <section className="px-4 py-12 max-w-md mx-auto text-center">
        <h3 className="text-3xl font-bold mb-4 text-gray-900">Prêt à commencer ?</h3>
        <p className="text-gray-600 mb-6">Sublimez vos chaussures avec nos artisans qualifiés</p>
        <Link to="/services">
          <Button size="lg" className="bg-orange-700 hover:bg-orange-800 text-white w-full">
            Découvrir nos services
          </Button>
        </Link>
      </section>

      {/* Avis Clients */}
      <section className="px-4 py-12 bg-gray-50">
        <div className="max-w-md mx-auto">
          <h3 className="text-3xl font-bold mb-3 text-gray-900 text-center">{t('customerReviews')}</h3>
          <p className="text-center text-gray-600 mb-8">{t('whatTheySay')}</p>
          <div className="space-y-4">
            {[
              {
                name: 'Sophie Martin',
                rating: 5,
                comment: 'Service impeccable ! Mes escarpins préférés ont retrouvé une seconde vie. Le cordonnier a fait un travail remarquable.',
                date: 'Il y a 2 jours'
              },
              {
                name: 'Thomas Dupont',
                rating: 5,
                comment: 'Très professionnel. Attribution automatique au cordonnier le plus proche, super pratique. Livraison rapide en 3 jours.',
                date: 'Il y a 1 semaine'
              },
              {
                name: 'Marie Leclerc',
                rating: 5,
                comment: 'Mes bottes en cuir sont comme neuves ! Le rapport qualité-prix est excellent. Je recommande vivement cette application.',
                date: 'Il y a 2 semaines'
              },
              {
                name: 'Alexandre Bernard',
                rating: 5,
                comment: 'Application facile à utiliser. Upload des photos, paiement sécurisé et suivi en temps réel. Top !',
                date: 'Il y a 3 semaines'
              },
              {
                name: 'Isabelle Rousseau',
                rating: 5,
                comment: 'J\'adore le concept ! Mes chaussures sont revenues magnifiquement réparées. Le cordonnier a même ajouté une touche personnelle.',
                date: 'Il y a 1 mois'
              }
            ].map((review, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-bold text-gray-900">{review.name}</h4>
                    <p className="text-xs text-gray-500">{review.date}</p>
                  </div>
                  <div className="flex gap-1">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-orange-500 text-orange-500" />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-4 py-12 bg-orange-700">
        <div className="max-w-md mx-auto">
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">8</div>
              <p className="text-orange-100 text-sm">{t('countries')}</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">17k+</div>
              <p className="text-orange-100 text-sm">{t('happyClients')}</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">250+</div>
              <p className="text-orange-100 text-sm">{t('craftsmen')}</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">45k+</div>
              <p className="text-orange-100 text-sm">{t('repairedShoes')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-12">
        <div className="max-w-md mx-auto px-4">
          <div className="text-center mb-6">
            <h4 className="font-bold text-lg mb-2">ShoeRepair</h4>
            <p className="text-gray-400 text-sm">Réparation professionnelle de chaussures</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm mb-6">
            <div>
              <h5 className="font-bold mb-2 text-orange-400">Services</h5>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/services" className="hover:text-white">Nos Services</Link></li>
                <li><Link to="/services" className="hover:text-white">Tarifs</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold mb-2 text-orange-400">Partenaires</h5>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/become-partner" className="hover:text-white">Devenir Partenaire</Link></li>
                <li><Link to="/auth" className="hover:text-white">Espace Cordonnier</Link></li>
              </ul>
              {/* Nos Pays - ligne discrète */}
              <div className="mt-3 pt-3 border-t border-gray-700">
                <p className="text-xs text-gray-500 mb-1">{t('ourCountries')}</p>
                <div className="flex gap-1 flex-wrap">
                  <span title={t('switzerland')} className="text-base">🇨🇭</span>
                  <span title={t('france')} className="text-base">🇫🇷</span>
                  <span title={t('germany')} className="text-base">🇩🇪</span>
                  <span title={t('italy')} className="text-base">🇮🇹</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-4 text-center text-xs text-gray-400">
            <div className="flex justify-center gap-4 mb-3">
              <Link to="/terms" className="hover:text-white">CGU</Link>
              <span>•</span>
              <Link to="/privacy" className="hover:text-white">Confidentialité</Link>
              <span>•</span>
              <Link to="/legal" className="hover:text-white">Mentions Légales</Link>
            </div>
            <p>© 2025 ShoeRepair. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
