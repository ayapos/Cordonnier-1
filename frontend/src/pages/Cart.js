import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Wrench, ShoppingCart, Trash2, Plus, Minus, ArrowLeft } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function Cart({ user }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, getCartCount } = useCart();

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    navigate('/checkout');
  };

  if (cartItems.length === 0) {
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

        <div className="container mx-auto px-4 py-16 text-center">
          <ShoppingCart className="w-24 h-24 text-amber-300 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-amber-950 mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Votre panier est vide
          </h2>
          <p className="text-amber-700 mb-8">Découvrez nos services de réparation</p>
          <Link to="/services">
            <Button className="bg-amber-700 hover:bg-amber-800">
              Voir les services
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/70 border-b border-amber-100">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <Wrench className="w-8 h-8 text-amber-700" />
            <h1 className="text-2xl font-bold text-amber-900" style={{ fontFamily: 'Cormorant Garamond, serif' }}>ShoeRepair</h1>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/services">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Continuer mes achats
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h2 className="text-4xl font-bold text-amber-950 mb-8" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
          Mon Panier ({getCartCount()} {getCartCount() > 1 ? 'articles' : 'article'})
        </h2>

        <div className="space-y-6">
          {/* Cart Items */}
          <Card className="border-amber-200">
            <CardContent className="p-6">
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 border-b border-amber-100 pb-4 last:border-0 last:pb-0">
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-bold text-amber-950">{item.name}</h3>
                      <p className="text-sm text-amber-600">{item.description}</p>
                      <p className="text-sm text-amber-700 mt-1">Délai: {item.estimated_days} jours</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                        className="w-16 text-center"
                      />
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="text-right min-w-[100px]">
                      <p className="font-bold text-amber-700">{(item.price * item.quantity).toFixed(2)}CHF</p>
                      <p className="text-xs text-amber-600">{item.price}CHF × {item.quantity}</p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card className="border-amber-300 bg-amber-50">
            <CardHeader>
              <CardTitle>Récapitulatif</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-amber-800">
                <span>Sous-total ({getCartCount()} articles)</span>
                <span className="font-medium">{getCartTotal().toFixed(2)}CHF</span>
              </div>
              <div className="flex justify-between text-amber-800">
                <span>Livraison</span>
                <span className="font-medium">À calculer</span>
              </div>
              <div className="border-t border-amber-300 pt-3 mt-3">
                <div className="flex justify-between text-lg">
                  <span className="font-bold text-amber-950">Total estimé</span>
                  <span className="font-bold text-amber-700">{getCartTotal().toFixed(2)}CHF</span>
                </div>
                <p className="text-xs text-amber-600 mt-1">+ frais de livraison selon l'option choisie</p>
              </div>
              <Button
                onClick={handleCheckout}
                className="w-full bg-amber-700 hover:bg-amber-800 text-lg py-6 mt-4"
              >
                Passer la commande
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
