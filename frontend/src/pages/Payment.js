import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wrench, ArrowLeft, CreditCard, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Stripe test publishable key
const stripePromise = loadStripe('pk_test_51QwQp5D7UUhz3svRLq3b7YPw5o4WoM5zqYZx5CqDPxfKq5FLfX5RZLtqXZQKVQVZQZQZQZ');

function PaymentForm({ order }) {
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const [success, setSuccess] = useState(false);
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    createPaymentIntent();
  }, []);

  const createPaymentIntent = async () => {
    try {
      const response = await axios.post(`${API}/orders/${order.id}/payment`);
      setClientSecret(response.data.client_secret);
      setDemoMode(response.data.demo_mode || false);
    } catch (error) {
      toast.error('Erreur de création du paiement');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setLoading(true);

    try {
      // DEMO MODE: Simulate payment without real Stripe
      if (demoMode) {
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate processing
        await axios.post(`${API}/orders/${order.id}/confirm`);
        setSuccess(true);
        toast.success('Paiement réussi ! (Mode démo)');
      } else {
        // Real Stripe payment
        if (!stripe || !elements || !clientSecret) {
          return;
        }

        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: elements.getElement(CardElement),
          },
        });

        if (error) {
          toast.error(error.message);
        } else if (paymentIntent.status === 'succeeded') {
          await axios.post(`${API}/orders/${order.id}/confirm`);
          setSuccess(true);
          toast.success('Paiement réussi !');
        }
      }
    } catch (error) {
      toast.error('Erreur de paiement');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4" data-testid="payment-success">
        <div className="text-center mb-8">
          <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-4" />
          <h3 className="text-3xl font-bold text-amber-950 mb-2">Commande Confirmée !</h3>
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
              <p className="text-4xl font-bold text-amber-950 tracking-wider mb-2" data-testid="reference-number">
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
                  <p className="font-medium text-amber-950">{order.service_name}</p>
                )}
              </div>
            </div>
            
            <div className="flex justify-between pb-3 border-b border-amber-100">
              <p className="text-sm text-amber-600">Adresse de livraison</p>
              <p className="font-medium text-amber-950 text-right max-w-xs">{order.delivery_address}</p>
            </div>
            
            <div className="flex justify-between pb-3 border-b border-amber-100">
              <p className="text-sm text-amber-600">Option de livraison</p>
              <p className="font-medium text-amber-950">{order.delivery_option === 'express' ? 'Express' : 'Standard'}</p>
            </div>
            
            <div className="flex justify-between pb-3 border-b border-amber-100">
              <p className="text-sm text-amber-600">Montant total</p>
              <p className="text-xl font-bold text-amber-950">{order.total_amount.toFixed(2)} CHF</p>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm font-medium text-green-800">✓ Paiement effectué avec succès</p>
            </div>
          </CardContent>
        </Card>

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
                <span>Un cordonnier qualifié vous sera assigné automatiquement</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-amber-700 text-white rounded-full flex items-center justify-center font-bold text-xs">4</span>
                <span>Suivez l'état de votre commande depuis votre tableau de bord</span>
              </li>
            </ol>
          </CardContent>
        </Card>

        {/* Email Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800 text-center">
            📧 Un email de confirmation sera envoyé prochainement avec tous les détails
          </p>
          <p className="text-xs text-blue-600 text-center mt-1">
            (Fonctionnalité email en cours de développement)
          </p>
        </div>

        <div className="flex gap-3">
          <Button 
            onClick={() => navigate('/dashboard')} 
            className="bg-amber-700 hover:bg-amber-800 flex-1"
            data-testid="go-to-dashboard-btn"
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
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" data-testid="payment-form">
      {demoMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4" data-testid="demo-mode-notice">
          <p className="text-blue-800 text-sm font-medium">🎭 Mode Démo Activé</p>
          <p className="text-blue-600 text-xs mt-1">Le paiement sera simulé sans Stripe réel. Cliquez simplement sur "Confirmer le paiement".</p>
        </div>
      )}

      {!demoMode && (
        <Card className="border-amber-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-amber-700" />
              Informations de paiement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 border border-amber-200 rounded-lg bg-white" data-testid="card-element">
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#78350f',
                      '::placeholder': {
                        color: '#d97706',
                      },
                    },
                  },
                }}
              />
            </div>
            <p className="text-xs text-amber-600 mt-3">
              Test: Utilisez 4242 4242 4242 4242, n'importe quelle date future et CVC
            </p>
          </CardContent>
        </Card>
      )}

      <Button 
        type="submit" 
        className="w-full bg-amber-700 hover:bg-amber-800 text-lg py-6" 
        disabled={loading}
        data-testid="pay-button"
      >
        {loading ? 'Traitement...' : demoMode ? 'Confirmer le paiement (Démo)' : `Payer ${order.total_amount.toFixed(2)}CHF`}
      </Button>
    </form>
  );
}

export default function Payment({ user }) {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchOrder();
  }, [user, orderId]);

  const fetchOrder = async () => {
    try {
      const response = await axios.get(`${API}/orders/${orderId}`);
      setOrder(response.data);
    } catch (error) {
      toast.error('Commande introuvable');
      navigate('/dashboard');
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

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h2 className="text-4xl font-bold text-amber-950 mb-8" style={{ fontFamily: 'Cormorant Garamond, serif' }} data-testid="payment-title">Paiement</h2>

        {order && (
          <>
            {/* Order Summary */}
            <Card className="border-amber-200 mb-6" data-testid="order-summary">
              <CardHeader>
                <CardTitle>Récapitulatif de la commande</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-amber-800">Service:</span>
                  <span className="font-medium text-amber-950" data-testid="order-service">{order.service_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-800">Prix service:</span>
                  <span className="font-medium text-amber-950" data-testid="order-service-price">{order.service_price.toFixed(2)}CHF</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-800">Livraison:</span>
                  <span className="font-medium text-amber-950" data-testid="order-delivery">{order.delivery_option === 'express' ? 'Express (72h)' : 'Standard (10j)'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-800">Frais de livraison:</span>
                  <span className="font-medium text-amber-950" data-testid="order-delivery-price">{order.delivery_price.toFixed(2)}CHF</span>
                </div>
                <div className="border-t border-amber-300 pt-3">
                  <div className="flex justify-between text-xl">
                    <span className="font-bold text-amber-950">Total:</span>
                    <span className="font-bold text-amber-700" data-testid="order-total">{order.total_amount.toFixed(2)}CHF</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Form */}
            <Elements stripe={stripePromise}>
              <PaymentForm order={order} />
            </Elements>
          </>
        )}
      </div>
    </div>
  );
}
