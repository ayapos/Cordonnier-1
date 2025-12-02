import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wrench, ArrowLeft, CreditCard, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function StripeCheckout({ user }) {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [pollingPayment, setPollingPayment] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    // If returning from Stripe with session_id, poll for payment status
    if (sessionId) {
      pollPaymentStatus(sessionId);
    } else {
      fetchOrder();
    }
  }, [user, orderId, sessionId]);

  const fetchOrder = async () => {
    try {
      const response = await axios.get(`${API}/orders/${orderId}`);
      setOrder(response.data);
      
      // Check if already paid
      if (response.data.payment_status === 'paid') {
        toast.success('Cette commande est déjà payée!');
        navigate(`/order-confirmation/${orderId}`);
      }
    } catch (error) {
      toast.error('Commande introuvable');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const pollPaymentStatus = async (sessionId, attempts = 0) => {
    const maxAttempts = 5;
    const pollInterval = 2000; // 2 seconds

    if (attempts >= maxAttempts) {
      toast.error('Vérification du paiement expirée. Veuillez vérifier votre email.');
      setPollingPayment(false);
      return;
    }

    setPollingPayment(true);

    try {
      const response = await axios.get(`${API}/payments/checkout-status/${sessionId}`);
      
      if (response.data.payment_status === 'paid') {
        toast.success('Paiement réussi!');
        setPollingPayment(false);
        // Redirect to order confirmation
        setTimeout(() => {
          navigate(`/order-confirmation/${response.data.order_id}`);
        }, 1000);
        return;
      } else if (response.data.status === 'expired') {
        toast.error('Session de paiement expirée. Veuillez réessayer.');
        setPollingPayment(false);
        navigate(`/order-confirmation/${response.data.order_id}`);
        return;
      }

      // Continue polling
      setTimeout(() => pollPaymentStatus(sessionId, attempts + 1), pollInterval);
    } catch (error) {
      console.error('Error checking payment status:', error);
      toast.error('Erreur lors de la vérification du paiement');
      setPollingPayment(false);
    }
  };

  const handlePayNow = async () => {
    setProcessingPayment(true);
    try {
      // Get current origin for success/cancel URLs
      const originUrl = window.location.origin;
      
      const response = await axios.post(`${API}/payments/create-checkout-session`, {
        order_id: orderId,
        origin_url: originUrl
      });

      // Redirect to Stripe Checkout
      if (response.data.checkout_url) {
        window.location.href = response.data.checkout_url;
      } else {
        throw new Error('URL de paiement non reçue');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.response?.data?.detail || 'Erreur lors de la création du paiement');
      setProcessingPayment(false);
    }
  };

  if (loading || pollingPayment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-amber-700 border-t-transparent mb-4"></div>
          <p className="text-amber-700 font-medium">
            {pollingPayment ? 'Vérification du paiement...' : 'Chargement...'}
          </p>
        </div>
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
            <Link to="/dashboard">
              <Button variant="ghost" size="icon">
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
        <h2 className="text-4xl font-bold text-amber-950 mb-8" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
          Paiement Sécurisé
        </h2>

        {/* Order Summary */}
        <Card className="border-amber-200 mb-6">
          <CardHeader>
            <CardTitle className="text-amber-950">Récapitulatif de la commande</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-amber-800">Référence:</span>
              <span className="font-bold text-amber-950">{order.reference_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-amber-800">Service(s):</span>
              <span className="font-medium text-amber-950">
                {order.items && order.items.length > 0 
                  ? `${order.items.length} service(s)` 
                  : order.service_name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-amber-800">Livraison:</span>
              <span className="font-medium text-amber-950">
                {order.delivery_option === 'express' ? 'Express (72h)' : 'Standard (10j)'}
              </span>
            </div>
            <div className="border-t border-amber-300 pt-3">
              <div className="flex justify-between text-xl">
                <span className="font-bold text-amber-950">Total à payer:</span>
                <span className="font-bold text-amber-700">{order.total_amount.toFixed(2)} CHF</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Info */}
        <Card className="border-amber-200 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-amber-700" />
              Paiement par Stripe
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800">
                🔒 <strong>Paiement 100% sécurisé</strong> via Stripe
              </p>
              <p className="text-xs text-blue-600 mt-2">
                Vos informations de paiement sont protégées et cryptées
              </p>
            </div>
            
            <div className="space-y-2 text-sm text-amber-700">
              <p>✓ Cartes de crédit et débit acceptées</p>
              <p>✓ Paiement instantané</p>
              <p>✓ Confirmation immédiate</p>
            </div>
          </CardContent>
        </Card>

        {/* Pay Button */}
        <Button 
          onClick={handlePayNow}
          disabled={processingPayment}
          className="w-full bg-amber-700 hover:bg-amber-800 text-lg py-6"
        >
          {processingPayment ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Redirection vers Stripe...
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5 mr-2" />
              Payer {order.total_amount.toFixed(2)} CHF
            </>
          )}
        </Button>

        <p className="text-xs text-center text-amber-600 mt-4">
          En cliquant sur "Payer", vous serez redirigé vers Stripe pour finaliser votre paiement
        </p>
      </div>
    </div>
  );
}
