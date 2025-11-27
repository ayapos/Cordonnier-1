import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Clock, ArrowLeft, Heart } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Services({ user }) {
  const navigate = useNavigate();
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 border-b border-pink-200 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon" data-testid="back-home-btn" className="hover:bg-pink-100">
                <ArrowLeft className="w-5 h-5 text-pink-700" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-pink-400 to-purple-500 p-2 rounded-2xl shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent" style={{ fontFamily: 'Playfair Display, serif' }}>ShoeRepair</h1>
                <p className="text-xs text-pink-600">L'élégance à portée de main</p>
              </div>
            </div>
          </div>
          <nav className="flex items-center gap-4">
            {user ? (
              <Link to="/dashboard">
                <Button data-testid="dashboard-nav-btn" className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white">Tableau de bord</Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button data-testid="auth-nav-btn" className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white">Connexion</Button>
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Services Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }} data-testid="services-title">
            <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">Nos Services</span>
          </h2>
          <p className="text-lg text-gray-700">Des prestations sur mesure pour sublimer vos chaussures</p>
        </div>

        {/* Gender Tabs */}
        <Tabs value={selectedGender} onValueChange={setSelectedGender} className="mb-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 bg-white/60 backdrop-blur border border-pink-200 p-1 rounded-2xl">
            <TabsTrigger value="femme" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-xl" data-testid="femme-tab">
              <Heart className="w-4 h-4 mr-2" /> Femme
            </TabsTrigger>
            <TabsTrigger value="homme" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-xl" data-testid="homme-tab">
              Homme
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('all')}
            className={selectedCategory === 'all' ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white' : 'border-pink-300 text-pink-700 hover:bg-pink-50'}
            data-testid="category-all"
          >
            Tous
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category)}
              className={selectedCategory === category ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white' : 'border-pink-300 text-pink-700 hover:bg-pink-50'}
              data-testid={`category-${category}`}
            >
              {category}
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"></div>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-20" data-testid="no-services">
            <p className="text-gray-700 text-lg">Aucun service disponible dans cette catégorie.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <Card 
                key={service.id} 
                className="border-pink-200 hover:shadow-2xl transition-all cursor-pointer group bg-white/70 backdrop-blur rounded-3xl overflow-hidden"
                data-testid={`service-card-${service.id}`}
              >
                <CardHeader className="bg-gradient-to-br from-pink-50 to-purple-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl text-gray-800 mb-2" data-testid={`service-name-${service.id}`}>{service.name}</CardTitle>
                      <div className="flex gap-2">
                        <Badge className="bg-gradient-to-r from-pink-400 to-purple-400 text-white border-0" data-testid={`service-category-${service.id}`}>{service.category}</Badge>
                        {service.gender !== 'mixte' && (
                          <Badge className="bg-white text-pink-700 border border-pink-300" data-testid={`service-gender-${service.id}`}>
                            {service.gender === 'femme' ? '♀ Femme' : '♂ Homme'}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent" data-testid={`service-price-${service.id}`}>{service.price}€</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <CardDescription className="text-base text-gray-700 mb-4" data-testid={`service-description-${service.id}`}>{service.description}</CardDescription>
                  <div className="flex items-center gap-2 text-pink-700">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium" data-testid={`service-days-${service.id}`}>{service.estimated_days} jours</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={() => handleSelectService(service.id)}
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white group-hover:shadow-lg transition-all"
                    data-testid={`select-service-btn-${service.id}`}
                  >
                    Choisir ce service
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
