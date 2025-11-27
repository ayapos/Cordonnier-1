import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wrench, Clock, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Services({ user }) {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/70 border-b border-amber-100">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon" data-testid="back-home-btn">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Wrench className="w-8 h-8 text-amber-700" />
              <h1 className="text-2xl font-bold text-amber-900" style={{ fontFamily: 'Cormorant Garamond, serif' }}>ShoeRepair</h1>
            </div>
          </div>
          <nav className="flex items-center gap-4">
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

      {/* Services Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-amber-950 mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }} data-testid="services-title">Nos Services</h2>
          <p className="text-lg text-amber-800">Choisissez le service de réparation adapté à vos besoins</p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-amber-700 border-t-transparent"></div>
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-20" data-testid="no-services">
            <p className="text-amber-800 text-lg">Aucun service disponible pour le moment.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <Card 
                key={service.id} 
                className="border-amber-200 hover:shadow-xl transition-all cursor-pointer group"
                data-testid={`service-card-${service.id}`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl text-amber-950" data-testid={`service-name-${service.id}`}>{service.name}</CardTitle>
                      <Badge className="mt-2 bg-amber-100 text-amber-800" data-testid={`service-category-${service.id}`}>{service.category}</Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-amber-700" data-testid={`service-price-${service.id}`}>{service.price}€</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base" data-testid={`service-description-${service.id}`}>{service.description}</CardDescription>
                  <div className="flex items-center gap-2 mt-4 text-amber-700">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm" data-testid={`service-days-${service.id}`}>{service.estimated_days} jours</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={() => handleSelectService(service.id)}
                    className="w-full bg-amber-700 hover:bg-amber-800 group-hover:bg-amber-800"
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
