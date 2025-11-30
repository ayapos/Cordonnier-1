import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function BeforeAfterCarousel({ t }) {
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
    }, 5000);
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
