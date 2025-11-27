import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wrench, Upload, ArrowLeft, Truck, Zap } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function CreateOrder({ user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(location.state?.serviceId || '');
  const [deliveryOption, setDeliveryOption] = useState('standard');
  const [notes, setNotes] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [service, setService] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchServices();
  }, [user]);

  useEffect(() => {
    if (selectedService) {
      const srv = services.find(s => s.id === selectedService);
      setService(srv);
    }
  }, [selectedService, services]);

  const fetchServices = async () => {
    try {
      const response = await axios.get(`${API}/services`);
      setServices(response.data);
    } catch (error) {
      toast.error('Erreur de chargement des services');
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      toast.error('Maximum 5 images autorisées');
      return;
    }
    setImages([...images, ...files]);
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    if (!service) return 0;
    const deliveryPrice = deliveryOption === 'express' ? 15 : 5;
    return service.price + deliveryPrice;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (images.length === 0) {
      toast.error('Veuillez ajouter au moins une photo');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('service_id', selectedService);
      formData.append('delivery_option', deliveryOption);
      if (notes) formData.append('notes', notes);
      images.forEach((image) => {
        formData.append('images', image);
      });

      const response = await axios.post(`${API}/orders`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Commande créée avec succès !');
      navigate(`/payment/${response.data.order_id}`);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur de création');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/70 border-b border-amber-100">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon" data-testid="back-dashboard-btn">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Wrench className="w-8 h-8 text-amber-700" />
              <h1 className="text-2xl font-bold text-amber-900" style={{ fontFamily: 'Cormorant Garamond, serif' }}>ShoeRepair</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h2 className="text-4xl font-bold text-amber-950 mb-8" style={{ fontFamily: 'Cormorant Garamond, serif' }} data-testid="create-order-title">Nouvelle Commande</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Service Selection */}
          <Card className="border-amber-200" data-testid="service-selection-card">
            <CardHeader>
              <CardTitle>Sélectionnez un service</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedService} onValueChange={setSelectedService} required>
                <SelectTrigger data-testid="service-select">
                  <SelectValue placeholder="Choisir un service" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((srv) => (
                    <SelectItem key={srv.id} value={srv.id} data-testid={`service-option-${srv.id}`}>
                      {srv.name} - {srv.price}€
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {service && (
                <div className="mt-4 p-4 bg-amber-50 rounded-lg" data-testid="service-details">
                  <p className="text-amber-900 font-medium">{service.name}</p>
                  <p className="text-sm text-amber-700 mt-1">{service.description}</p>
                  <p className="text-sm text-amber-600 mt-2">Délai estimé: {service.estimated_days} jours</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Images Upload */}
          <Card className="border-amber-200" data-testid="images-upload-card">
            <CardHeader>
              <CardTitle>Photos de vos chaussures</CardTitle>
              <CardDescription>Ajoutez jusqu'à 5 photos (requis)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Label htmlFor="images" className="cursor-pointer">
                  <div className="border-2 border-dashed border-amber-300 rounded-lg p-8 text-center hover:border-amber-500 transition-colors" data-testid="upload-area">
                    <Upload className="w-12 h-12 text-amber-600 mx-auto mb-2" />
                    <p className="text-amber-700">Cliquez pour ajouter des photos</p>
                    <p className="text-sm text-amber-600 mt-1">{images.length}/5 photos</p>
                  </div>
                  <Input
                    id="images"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                    data-testid="image-input"
                  />
                </Label>
                {images.length > 0 && (
                  <div className="grid grid-cols-3 gap-4" data-testid="images-preview">
                    {images.map((image, index) => (
                      <div key={index} className="relative" data-testid={`image-preview-${index}`}>
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Preview ${index}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          className="absolute top-2 right-2"
                          onClick={() => removeImage(index)}
                          data-testid={`remove-image-${index}`}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Delivery Options */}
          <Card className="border-amber-200" data-testid="delivery-options-card">
            <CardHeader>
              <CardTitle>Options de livraison</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={deliveryOption} onValueChange={setDeliveryOption}>
                <div className="flex items-center space-x-2 p-4 border border-amber-200 rounded-lg mb-3 hover:bg-amber-50 transition-colors" data-testid="delivery-standard">
                  <RadioGroupItem value="standard" id="standard" />
                  <Label htmlFor="standard" className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Truck className="w-5 h-5 text-amber-700" />
                        <div>
                          <p className="font-medium text-amber-950">Standard</p>
                          <p className="text-sm text-amber-600">10 jours maximum</p>
                        </div>
                      </div>
                      <span className="font-bold text-amber-700">5€</span>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-4 border border-amber-200 rounded-lg hover:bg-amber-50 transition-colors" data-testid="delivery-express">
                  <RadioGroupItem value="express" id="express" />
                  <Label htmlFor="express" className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-amber-700" />
                        <div>
                          <p className="font-medium text-amber-950">Express</p>
                          <p className="text-sm text-amber-600">72 heures</p>
                        </div>
                      </div>
                      <span className="font-bold text-amber-700">15€</span>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="border-amber-200" data-testid="notes-card">
            <CardHeader>
              <CardTitle>Notes (optionnel)</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Ajoutez des instructions spéciales..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                data-testid="notes-textarea"
              />
            </CardContent>
          </Card>

          {/* Summary */}
          {service && (
            <Card className="border-amber-300 bg-amber-50" data-testid="order-summary">
              <CardHeader>
                <CardTitle>Récapitulatif</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-amber-800">Service:</span>
                  <span className="font-medium text-amber-950" data-testid="summary-service-price">{service.price}€</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-800">Livraison:</span>
                  <span className="font-medium text-amber-950" data-testid="summary-delivery-price">{deliveryOption === 'express' ? '15' : '5'}€</span>
                </div>
                <div className="border-t border-amber-300 pt-2 mt-2">
                  <div className="flex justify-between text-lg">
                    <span className="font-bold text-amber-950">Total:</span>
                    <span className="font-bold text-amber-700" data-testid="summary-total">{calculateTotal()}€</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Button 
            type="submit" 
            className="w-full bg-amber-700 hover:bg-amber-800 text-lg py-6" 
            disabled={loading || !selectedService || images.length === 0}
            data-testid="submit-order-btn"
          >
            {loading ? 'Création...' : 'Créer la commande'}
          </Button>
        </form>
      </div>
    </div>
  );
}
