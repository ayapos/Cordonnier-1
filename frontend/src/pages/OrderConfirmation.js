import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wrench, ArrowLeft, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '@/context/CartContext';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function OrderConfirmation({ user }) {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { clearCart } = useCart();
  const [order, setOrder] = useState(null);
  const [cobbler, setCobbler] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Clear cart when arriving on confirmation page
    clearCart();
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await axios.get(`${API}/orders/${orderId}`);
      setOrder(response.data);
      
      // Fetch cobbler info if assigned
      if (response.data.cobbler_id) {
        try {
          const cobblerResponse = await axios.get(`${API}/cobbler/cobblers`);
          const assignedCobbler = cobblerResponse.data.find(c => c.id === response.data.cobbler_id);
          if (assignedCobbler) {
            setCobbler(assignedCobbler);
          }
        } catch (error) {
          console.error('Error fetching cobbler info:', error);
        }
      }
    } catch (error) {
      toast.error('Commande introuvable');
      if (user) {
        navigate('/dashboard');
      } else {
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-amber-700 border-t-transparent"></div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/70 border-b border-amber-100">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            {user ? (
              <Link to="/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
            ) : (
              <Link to="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
            )}
            <div className="flex items-center gap-2">
              <Wrench className="w-8 h-8 text-amber-700" />
              <h1 className="text-2xl font-bold text-amber-900" style={{ fontFamily: 'Cormorant Garamond, serif' }}>ShoeRepair</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Success Message */}
        <div className="text-center mb-8">
          <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-4" />
          <h3 className="text-3xl font-bold text-amber-950 mb-2" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Commande Confirmée !</h3>
          <p className="text-amber-700">Merci pour votre confiance. Votre commande a été enregistrée avec succès.</p>
        </div>

        {/* Reference Number - Important */}
        <Card className="border-2 border-amber-300 bg-amber-50 mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-center text-amber-950 flex items-center justify-center gap-2">
              📦 Numéro de Référence à Inscrire sur le Colis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-white rounded-lg p-6 text-center border border-amber-200">
              <p className="text-4xl font-bold text-amber-950 tracking-wider mb-2">
                {order.reference_number}
              </p>
              <p className="text-sm text-amber-600">
                ⚠️ Important : Inscrivez ce numéro sur votre colis avant l'envoi
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card className="border-amber-200 mb-6">
          <CardHeader>
            <CardTitle className="text-amber-950">Récapitulatif de la Commande</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-start pb-3 border-b border-amber-100">
              <div>
                <p className="text-sm text-amber-600">Service(s)</p>
                {order.items && order.items.length > 0 ? (
                  order.items.map((item, idx) => (
                    <p key={idx} className="font-medium text-amber-950">
                      {item.service_name} x {item.quantity}
                    </p>
                  ))
                ) : (
                  <p className="font-medium text-amber-950">{order.service_name || 'Services multiples'}</p>
                )}
              </div>
              <p className="font-bold text-amber-700">{order.service_price ? order.service_price.toFixed(2) : (order.total_amount - (order.delivery_price || 0)).toFixed(2)}CHF</p>
            </div>
            
            <div className="flex justify-between pb-3 border-b border-amber-100">
              <p className="text-sm text-amber-600">Adresse de livraison</p>
              <p className="font-medium text-amber-950 text-right max-w-xs">{order.delivery_address}</p>
            </div>
            
            <div className="flex justify-between pb-3 border-b border-amber-100">
              <p className="text-sm text-amber-600">Option de livraison</p>
              <p className="font-medium text-amber-950">
                {order.delivery_option === 'express' ? 'Express (72h)' : 'Standard (10 jours)'}
              </p>
            </div>

            <div className="flex justify-between pb-3 border-b border-amber-100">
              <p className="text-sm text-amber-600">Frais de livraison</p>
              <p className="font-medium text-amber-950">{order.delivery_price ? order.delivery_price.toFixed(2) : '0.00'}CHF</p>
            </div>
            
            <div className="flex justify-between pb-3">
              <p className="text-lg font-bold text-amber-950">Montant total</p>
              <p className="text-xl font-bold text-amber-950">{order.total_amount.toFixed(2)}CHF</p>
            </div>
            
            {order.status === 'pending' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-800">
                  💳 Paiement en mode démo - Commande confirmée
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cobbler Assignment Info */}
        {order.cobbler_id && (
          <Card className="border-green-200 bg-green-50 mb-6">
            <CardHeader>
              <CardTitle className="text-green-900 flex items-center gap-2">
                👨‍🔧 Partenaire Attribué
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-green-700">
                Un cordonnier qualifié a été automatiquement attribué à votre commande en fonction de votre localisation.
              </p>
              
              {cobbler && (
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs text-green-600 font-semibold uppercase">Nom du partenaire</span>
                      <p className="text-sm font-medium text-green-900">{cobbler.name}</p>
                    </div>
                    
                    {cobbler.workshop_address && (
                      <div>
                        <span className="text-xs text-green-600 font-semibold uppercase">Adresse de l'atelier</span>
                        <p className="text-sm text-green-800">{cobbler.workshop_address}</p>
                      </div>
                    )}
                    
                    {cobbler.phone && (
                      <div>
                        <span className="text-xs text-green-600 font-semibold uppercase">Téléphone</span>
                        <p className="text-sm text-green-800">{cobbler.phone}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <p className="text-xs text-green-600 italic">
                ℹ️ Ces informations vous sont également envoyées par email
              </p>
            </CardContent>
          </Card>
        )}

        {/* Next Steps */}
        <Card className="border-amber-200 mb-6">
          <CardHeader>
            <CardTitle className="text-amber-950">Prochaines Étapes</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3 text-sm text-amber-800">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-amber-700 text-white rounded-full flex items-center justify-center font-bold text-xs">1</span>
                <span>Inscrivez le numéro de référence <strong>{order.reference_number}</strong> sur votre colis</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-amber-700 text-white rounded-full flex items-center justify-center font-bold text-xs">2</span>
                <span>Emballez soigneusement vos chaussures</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-amber-700 text-white rounded-full flex items-center justify-center font-bold text-xs">3</span>
                <span>Envoyez votre colis avec le numéro de référence bien visible</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-amber-700 text-white rounded-full flex items-center justify-center font-bold text-xs">4</span>
                <span>{user ? 'Suivez l\'état de votre commande depuis votre tableau de bord' : 'Un cordonnier qualifié traitera votre commande'}</span>
              </li>
            </ol>
          </CardContent>
        </Card>

        {/* Contact Info if Guest */}
        {order.guest_email && (
          <Card className="border-amber-200 mb-6">
            <CardHeader>
              <CardTitle className="text-amber-950">Informations de contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-amber-600">Nom:</span>
                <span className="font-medium text-amber-950">{order.guest_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-600">Email:</span>
                <span className="font-medium text-amber-950">{order.guest_email}</span>
              </div>
              {order.guest_phone && (
                <div className="flex justify-between">
                  <span className="text-amber-600">Téléphone:</span>
                  <span className="font-medium text-amber-950">{order.guest_phone}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Email Notice */}
        <Card className="border-blue-200 bg-blue-50 mb-6">
          <CardHeader>
            <CardTitle className="text-blue-900 flex items-center gap-2 text-lg">
              📧 Confirmation par Email
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <p className="text-sm text-blue-800 font-medium mb-2">
                Un email de confirmation a été envoyé à:
              </p>
              <p className="text-base font-bold text-blue-900">
                {order.guest_email || user?.email || 'votre adresse email'}
              </p>
            </div>
            
            <div className="space-y-2 text-sm text-blue-700">
              <p className="font-semibold">📋 Cet email contient:</p>
              <ul className="space-y-1 ml-4">
                <li>✓ Numéro de référence de votre commande</li>
                <li>✓ Récapitulatif complet des services</li>
                <li>✓ Adresse de livraison</li>
                <li>✓ Informations du partenaire attribué</li>
                <li>✓ Montant total et détails du paiement</li>
                <li>✓ Instructions pour l'envoi</li>
              </ul>
            </div>
            
            <p className="text-xs text-blue-600 italic text-center pt-2 border-t border-blue-200">
              💡 Conservez cet email pour vos dossiers et le suivi de votre commande
            </p>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {user ? (
            <>
              <Button 
                onClick={() => navigate('/dashboard')} 
                className="bg-amber-700 hover:bg-amber-800 flex-1"
              >
                Voir mes commandes
              </Button>
              <Button 
                onClick={() => navigate('/services')} 
                variant="outline"
                className="border-amber-300 text-amber-700 hover:bg-amber-50 flex-1"
              >
                Nouvelle commande
              </Button>
            </>
          ) : (
            <>
              <Button 
                onClick={() => navigate('/auth')} 
                className="bg-amber-700 hover:bg-amber-800 flex-1"
              >
                Créer un compte
              </Button>
              <Button 
                onClick={() => navigate('/services')} 
                variant="outline"
                className="border-amber-300 text-amber-700 hover:bg-amber-50 flex-1"
              >
                Nouvelle commande
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
