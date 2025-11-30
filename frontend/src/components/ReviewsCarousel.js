import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

export default function ReviewsCarousel({ t }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const reviews = [
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
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % reviews.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [reviews.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % reviews.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  return (
    <section className="px-4 py-12 bg-gray-50">
      <div className="max-w-md mx-auto">
        <h3 className="text-3xl font-bold mb-3 text-gray-900 text-center">{t('customerReviews')}</h3>
        <p className="text-center text-gray-600 mb-8">{t('whatTheySay')}</p>
        
        <div className="relative">
          <div className="relative overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {reviews.map((review, idx) => (
                <div key={idx} className="w-full flex-shrink-0 px-2">
                  <div className="bg-white rounded-2xl p-6 shadow-lg min-h-[200px]">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg">{review.name}</h4>
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
                </div>
              ))}
            </div>

            <button
              onClick={prevSlide}
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-white hover:bg-gray-50 rounded-full p-2 shadow-lg transition-all z-10"
              aria-label="Avis précédent"
            >
              <ChevronLeft className="w-5 h-5 text-gray-800" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-white hover:bg-gray-50 rounded-full p-2 shadow-lg transition-all z-10"
              aria-label="Avis suivant"
            >
              <ChevronRight className="w-5 h-5 text-gray-800" />
            </button>
          </div>

          <div className="flex justify-center gap-2 mt-6">
            {reviews.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentSlide ? 'bg-orange-600 w-8' : 'bg-gray-300'
                }`}
                aria-label={`Aller à l'avis ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
