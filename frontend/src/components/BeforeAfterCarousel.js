import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function BeforeAfterCarousel({ t }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [galleryImages, setGalleryImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGalleryImages();
  }, []);

  const fetchGalleryImages = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/media/gallery`);
      const images = response.data;
      
      // Group images into before/after pairs based on position
      const pairs = [];
      const sortedImages = images.sort((a, b) => (a.position || 999) - (b.position || 999));
      
      // Group every 2 consecutive images as before/after
      for (let i = 0; i < sortedImages.length; i += 2) {
        if (sortedImages[i] && sortedImages[i + 1]) {
          pairs.push({
            before: `${BACKEND_URL}${sortedImages[i].url}`,
            after: `${BACKEND_URL}${sortedImages[i + 1].url}`,
            title: sortedImages[i].title || sortedImages[i + 1].title || t('renovation')
          });
        }
      }
      
      setGalleryImages(pairs);
    } catch (error) {
      console.error('Error fetching gallery images:', error);
      // Fallback to placeholder images
      setGalleryImages([
        {
          before: 'https://images.unsplash.com/photo-1608667508764-33cf0726b13a?w=500&q=80',
          after: 'https://images.unsplash.com/photo-1529953717281-81a40b131119?w=500&q=80',
          title: t('bootResole')
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const beforeAfterImages = galleryImages.length > 0 ? galleryImages : [
    {
      before: 'https://images.unsplash.com/photo-1608667508764-33cf0726b13a?w=500&q=80',
      after: 'https://images.unsplash.com/photo-1529953717281-81a40b131119?w=500&q=80',
      title: t('bootResole')
    }
  ];

  useEffect(() => {
    if (beforeAfterImages.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % beforeAfterImages.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [beforeAfterImages.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % beforeAfterImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + beforeAfterImages.length) % beforeAfterImages.length);
  };

  if (loading) {
    return (
      <section className="px-4 py-12 max-w-md mx-auto">
        <h3 className="text-3xl font-bold mb-3 text-gray-900 text-center">{t('beforeAfterGallery')}</h3>
        <p className="text-center text-gray-600 mb-8">{t('repairResults')}</p>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
        </div>
      </section>
    );
  }

  if (beforeAfterImages.length === 0) {
    return (
      <section className="px-4 py-12 max-w-md mx-auto">
        <h3 className="text-3xl font-bold mb-3 text-gray-900 text-center">{t('beforeAfterGallery')}</h3>
        <p className="text-center text-gray-600 mb-8">{t('repairResults')}</p>
        <div className="text-center py-12 text-gray-500">
          Aucune image disponible pour le moment
        </div>
      </section>
    );
  }

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
