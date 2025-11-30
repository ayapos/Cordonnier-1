import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wrench, Truck, Zap, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '@/context/CartContext';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Checkout({ user }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { cartItems, getCartTotal, clearCart, getCartCount } = useCart();
  const [checkoutMode, setCheckoutMode] = useState(user ? 'user' : 'guest');
  const [loading, setLoading] = useState(false);

  // Guest info
  const [guestInfo, setGuestInfo] = useState({
    name: '',
    email: '',
    phone: '',
  });

  // Delivery info
  const [deliveryAddress, setDeliveryAddress] = useState(user?.address || '');
  const [deliveryOption, setDeliveryOption] = useState('standard');
  const [notes, setNotes] = useState('');
  const [images, setImages] = useState([]);
  const [createAccount, setCreateAccount] = useState(false);
  const [password, setPassword] = useState('');

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

  const calculateDeliveryPrice = () => {
    return deliveryOption === 'express' ? 15 : 5;
  };

  const calculateTotal = () => {
    return getCartTotal() + calculateDeliveryPrice();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // VALIDATION 1: Panier non vide
    if (cartItems.length === 0) {
      toast.error('Votre panier est vide');
      navigate('/cart');
      return;
    }

    // Photos are optional - no validation needed

    // VALIDATION 3: Adresse de livraison
    if (!deliveryAddress.trim()) {
      toast.error('Veuillez fournir une adresse de livraison');
      return;
    }

    // VALIDATION 4: Informations invité
    if (checkoutMode === 'guest') {
      if (!guestInfo.name || !guestInfo.email || !guestInfo.phone) {
        toast.error('Veuillez remplir toutes les informations');
        return;
      }
      if (createAccount && !password) {
        toast.error('Veuillez fournir un mot de passe pour créer le compte');
        return;
      }
    }

    setLoading(true);
    try {
      const formData = new FormData();
      
      // Add service items as JSON string
      formData.append('service_items', JSON.stringify(cartItems));
      
      formData.append('delivery_option', deliveryOption);
      formData.append('delivery_address', deliveryAddress);
      if (notes) formData.append('notes', notes);
      
      // IMPORTANT: Add images (required)
      images.forEach((image) => {
        formData.append('images', image);
      });

      // Add guest info if guest mode
      if (checkoutMode === 'guest') {
        formData.append('guest_name', guestInfo.name);
        formData.append('guest_email', guestInfo.email);
        formData.append('guest_phone', guestInfo.phone);
        formData.append('create_account', createAccount);
        if (createAccount && password) {
          formData.append('password', password);
        }
      }

      const endpoint = checkoutMode === 'guest' ? `${API}/orders/guest` : `${API}/orders/bulk`;
      const response = await axios.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Commande créée avec succès !');
      clearCart();
      
      // Redirect to payment
      navigate(`/payment/${response.data.order_id}`);
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error.response?.data?.detail || 'Erreur lors de la commande');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/70 border-b border-amber-100">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <Wrench className="w-8 h-8 text-amber-700" />
            <h1 className="text-2xl font-bold text-amber-900" style={{ fontFamily: 'Cormorant Garamond, serif' }}>{t('appTitle')}</h1>
          </Link>
          <LanguageSwitcher />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h2 className="text-4xl font-bold text-amber-950 mb-8" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
          {t('finalizeOrder')}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Login or Guest */}
          {!user && (
            <Card className="border-amber-200">
              <CardHeader>
                <CardTitle>{t('howToContinue')}</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={checkoutMode} onValueChange={setCheckoutMode}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="guest">{t('guest')}</TabsTrigger>
                    <TabsTrigger value="login">{t('signIn')}</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="guest" className="space-y-4">
                    <div>
                      <Label htmlFor="guest-name">Nom complet *</Label>
                      <Input
                        id="guest-name"
                        required
                        value={guestInfo.name}
                        onChange={(e) => setGuestInfo({...guestInfo, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="guest-email">Email *</Label>
                      <Input
                        id="guest-email"
                        type="email"
                        required
                        value={guestInfo.email}
                        onChange={(e) => setGuestInfo({...guestInfo, email: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="guest-phone">Téléphone *</Label>
                      <Input
                        id="guest-phone"
                        type="tel"
                        required
                        value={guestInfo.phone}
                        onChange={(e) => setGuestInfo({...guestInfo, phone: e.target.value})}
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="checkbox"
                        id="create-account"
                        checked={createAccount}
                        onChange={(e) => setCreateAccount(e.target.checked)}
                        className="w-4 h-4"
                      />
                      <Label htmlFor="create-account" className="cursor-pointer">
                        Créer un compte pour suivre mes commandes
                      </Label>
                    </div>
                    {createAccount && (
                      <div>
                        <Label htmlFor="password">Mot de passe *</Label>
                        <Input
                          id="password"
                          type="password"
                          required={createAccount}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="login">
                    <div className="text-center py-8">
                      <p className="text-amber-700 mb-4">Connectez-vous pour accéder à votre historique</p>
                      <Link to="/auth">
                        <Button type="button" className="bg-amber-700 hover:bg-amber-800">
                          Se connecter
                        </Button>
                      </Link>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}

          {/* Images Upload */}
          <Card className="border-amber-200">
            <CardHeader>
              <CardTitle>Photos de vos chaussures (optionnel)</CardTitle>
              <CardDescription>Ajoutez jusqu'à 5 photos pour aider le cordonnier</CardDescription>
            </CardHeader>
            <CardContent>
              <Label htmlFor="images" className="cursor-pointer">
                <div className="border-2 border-dashed border-amber-300 rounded-lg p-8 text-center hover:border-amber-500 transition-colors">
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
                />
              </Label>
              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-4 mt-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative">
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
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Delivery Address */}
          <Card className="border-amber-200">
            <CardHeader>
              <CardTitle>Adresse de livraison *</CardTitle>
              <CardDescription>Le cordonnier le plus proche sera assigné automatiquement</CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="Ex: Rue du Commerce 5, 1003 Lausanne"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                required
              />
            </CardContent>
          </Card>

          {/* Delivery Options */}
          <Card className="border-amber-200">
            <CardHeader>
              <CardTitle>Options de livraison</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={deliveryOption} onValueChange={setDeliveryOption}>
                <div className="flex items-center space-x-2 p-4 border border-amber-200 rounded-lg mb-3 hover:bg-amber-50 transition-colors">
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
                      <span className="font-bold text-amber-700">5CHF</span>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-4 border border-amber-200 rounded-lg hover:bg-amber-50 transition-colors">
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
                      <span className="font-bold text-amber-700">15CHF</span>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="border-amber-200">
            <CardHeader>
              <CardTitle>Notes (optionnel)</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Instructions spéciales..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Summary */}
          <Card className="border-amber-300 bg-amber-50">
            <CardHeader>
              <CardTitle>Récapitulatif de la commande</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-amber-800">{item.name} × {item.quantity}</span>
                    <span className="font-medium text-amber-950">{(item.price * item.quantity).toFixed(2)}CHF</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-amber-300 pt-2">
                <div className="flex justify-between text-amber-800">
                  <span>Sous-total ({getCartCount()} articles)</span>
                  <span className="font-medium">{getCartTotal().toFixed(2)}CHF</span>
                </div>
                <div className="flex justify-between text-amber-800 mt-2">
                  <span>Livraison</span>
                  <span className="font-medium">{calculateDeliveryPrice()}CHF</span>
                </div>
              </div>
              <div className="border-t border-amber-300 pt-3 mt-3">
                <div className="flex justify-between text-lg">
                  <span className="font-bold text-amber-950">Total</span>
                  <span className="font-bold text-amber-700">{calculateTotal().toFixed(2)}CHF</span>
                </div>
              </div>
              <Button
                type="submit"
                disabled={
                  loading || 
                  (checkoutMode === 'guest' && (!guestInfo.name || !guestInfo.email || !guestInfo.phone))
                }
                className="w-full bg-amber-700 hover:bg-amber-800 text-lg py-6 mt-4"
              >
                {loading ? 'Traitement...' : 'Confirmer et payer'}
              </Button>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
