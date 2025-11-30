import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, ArrowLeft, Filter, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '@/context/CartContext';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const categoryImages = {
  'Talons & Escarpins': 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&q=80',
  'Chaussures de ville': 'https://images.unsplash.com/photo-1638609348722-aa2a3a67db26?w=600&q=80',
  'Bottes & Bottines': 'https://images.unsplash.com/photo-1605812860427-4024433a70fd?w=600&q=80',
  'Sneakers & Baskets': 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80',
  'Sandales': 'https://images.unsplash.com/photo-1581101767113-1677fc2beaa8?w=600&q=80',
  'Entretien & Rénovation': 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600&q=80',
  'Ajustements': 'https://images.unsplash.com/photo-1616406432452-07bc5938759d?w=600&q=80'
};

export default function Services({ user }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { addToCart, getCartCount } = useCart();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGender, setSelectedGender] = useState('femme');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await axios.get(`${API}/services`);
      setServices(response.data);
    } catch (error) {
      toast.error('Erreur de chargement des services');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (service) => {
    addToCart(service);
  };

  const handleSelectService = (serviceId) => {
    if (!user) {
      toast.error('Veuillez vous connecter pour commander');
      navigate('/auth');
      return;
    }
    navigate('/order/new', { state: { serviceId } });
  };

  const categories = [...new Set(services.map(s => s.category))];
  
  const filteredServices = services.filter(service => {
    const matchesGender = service.gender === selectedGender || service.gender === 'mixte';
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    return matchesGender && matchesCategory;
  });

  const groupedServices = categories.reduce((acc, category) => {
    const categoryServices = filteredServices.filter(s => s.category === category);
    if (categoryServices.length > 0) {
      acc[category] = categoryServices;
    }
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-white">
      {/* Fixed Mobile Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="px-4 py-3 flex justify-between items-center max-w-md mx-auto">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="icon" data-testid="back-home-btn" className="-ml-2">
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-bold text-gray-900">{t('services')}</h1>
              <p className="text-xs text-gray-500">{filteredServices.length} {t('availableServices')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
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
            {user && (
              <Link to="/dashboard">
                <Button size="sm" className="bg-orange-700 text-white">Dashboard</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="pt-16 pb-6">
        {/* Gender Tabs - Sticky */}
        <div className="sticky top-16 bg-white border-b border-gray-200 z-40">
          <div className="px-4 py-3 max-w-md mx-auto">
            <Tabs value={selectedGender} onValueChange={setSelectedGender}>
              <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-xl">
                <TabsTrigger 
                  value="femme" 
                  className="data-[state=active]:bg-orange-700 data-[state=active]:text-white rounded-lg" 
                  data-testid="femme-tab"
                >
                  Femme
                </TabsTrigger>
                <TabsTrigger 
                  value="homme" 
                  className="data-[state=active]:bg-orange-700 data-[state=active]:text-white rounded-lg" 
                  data-testid="homme-tab"
                >
                  Homme
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Category Filter */}
        <div className="px-4 py-4 max-w-md mx-auto overflow-x-auto">
          <div className="flex gap-2 pb-2">
            <Button
              size="sm"
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('all')}
              className={selectedCategory === 'all' ? 'bg-orange-700 text-white' : 'border-gray-300 text-gray-700'}
              data-testid="category-all"
            >
              Tous
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                size="sm"
                variant={selectedCategory === category ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category)}
                className={selectedCategory === category ? 'bg-orange-700 text-white whitespace-nowrap' : 'border-gray-300 text-gray-700 whitespace-nowrap'}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-orange-700 border-t-transparent"></div>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-20 px-4" data-testid="no-services">
            <p className="text-gray-600">Aucun service disponible</p>
          </div>
        ) : (
          <div className="px-4 max-w-md mx-auto space-y-8 pb-8">
            {Object.entries(groupedServices).map(([category, categoryServices]) => (
              <div key={category}>
                {/* Category Header with Image */}
                <div className="relative rounded-2xl overflow-hidden mb-4 h-32">
                  <img 
                    src={categoryImages[category] || 'https://images.unsplash.com/photo-1605812860427-4024433a70fd?w=600&q=80'} 
                    alt={category}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="text-xl font-bold">{category}</h3>
                    <p className="text-sm text-gray-200">{categoryServices.length} services</p>
                  </div>
                </div>

                {/* Services List */}
                <div className="space-y-3">
                  {categoryServices.map((service) => (
                    <div 
                      key={service.id} 
                      className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm"
                      data-testid={`service-card-${service.id}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 mb-1" data-testid={`service-name-${service.id}`}>{service.name}</h4>
                          <p className="text-sm text-gray-600 mb-2" data-testid={`service-description-${service.id}`}>{service.description}</p>
                        </div>
                        <div className="text-2xl font-bold text-orange-700 ml-4" data-testid={`service-price-${service.id}`}>
                          {service.price}CHF
                        </div>
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm" data-testid={`service-days-${service.id}`}>{service.estimated_days}{t('day')}</span>
                        </div>
                        {service.gender !== 'mixte' && (
                          <Badge className="bg-gray-100 text-gray-700 border-0">
                            {service.gender === 'femme' ? '♀' : '♂'} {service.gender}
                          </Badge>
                        )}
                      </div>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(service);
                        }}
                        className="w-full bg-amber-700 hover:bg-amber-800"
                        data-testid={`add-to-cart-${service.id}`}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        {t('addToCart')}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
