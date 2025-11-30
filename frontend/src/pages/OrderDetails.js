import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wrench, ArrowLeft, Package, Truck, Clock, Star } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-purple-100 text-purple-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
};

const statusLabels = {
  pending: 'En attente',
  accepted: 'Accepté',
  in_progress: 'En cours',
  shipped: 'Expédié',
  delivered: 'Livré',
  cancelled: 'Annulé'
};

export default function OrderDetails({ user }) {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchOrder();
  }, [user, orderId]);

  const [cobbler, setCobbler] = useState(null);

  const fetchOrder = async () => {
    try {
      const response = await axios.get(`${API}/orders/${orderId}`);
      setOrder(response.data);
      
      // Fetch cobbler info if assigned
      if (response.data.cobbler_id) {
        try {
          const cobblerResponse = await axios.get(`${API}/auth/users/${response.data.cobbler_id}`);
          setCobbler(cobblerResponse.data);
        } catch (err) {
          console.error('Could not fetch cobbler info');
        }
      }
    } catch (error) {
      toast.error('Commande introuvable');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    try {
      await axios.post(`${API}/reviews`, {
        order_id: orderId,
        rating,
        comment
      });
      toast.success('Avis envoyé avec succès !');
      setReviewDialogOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur');
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

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-4xl font-bold text-amber-950" style={{ fontFamily: 'Cormorant Garamond, serif' }} data-testid="order-details-title">Détails de la commande</h2>
          {order && (
            <Badge className={`${statusColors[order.status]} text-lg px-4 py-2`} data-testid="order-status">
              {statusLabels[order.status]}
            </Badge>
          )}
        </div>

        {order && (
          <div className="space-y-6">
            {/* Reference */}
            <Card className="border-amber-200" data-testid="reference-card">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-amber-700 mb-2">Numéro de référence</p>
                  <p className="text-3xl font-bold text-amber-950" data-testid="order-reference">{order.reference_number}</p>
                  <p className="text-xs text-amber-600 mt-2">À indiquer lors de l&apos;envoi</p>
                </div>
              </CardContent>
            </Card>

            {/* Cobbler Info */}
            {cobbler && (
              <Card className="border-orange-300 bg-orange-50" data-testid="cobbler-info-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span>Votre Cordonnier</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Nom</p>
                    <p className="font-bold text-gray-900" data-testid="cobbler-name">{cobbler.name}</p>
                  </div>
                  {cobbler.phone && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Téléphone</p>
                      <a href={`tel:${cobbler.phone}`} className="font-medium text-orange-700 hover:underline" data-testid="cobbler-phone">
                        📞 {cobbler.phone}
                      </a>
                    </div>
                  )}
                  {cobbler.email && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Email</p>
                      <a href={`mailto:${cobbler.email}`} className="font-medium text-orange-700 hover:underline" data-testid="cobbler-email">
                        ✉️ {cobbler.email}
                      </a>
                    </div>
                  )}
                  {cobbler.address && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Atelier</p>
                      <p className="text-sm text-gray-700" data-testid="cobbler-address">📍 {cobbler.address}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Service Details */}
            <Card className="border-amber-200" data-testid="service-details-card">
              <CardHeader>
                <CardTitle>Service</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-amber-800">Service:</span>
                  <span className="font-medium text-amber-950" data-testid="service-name">{order.service_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-800">Prix:</span>
                  <span className="font-medium text-amber-950" data-testid="service-price">{order.service_price.toFixed(2)}CHF</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-800">Livraison:</span>
                  <span className="font-medium text-amber-950" data-testid="delivery-option">
                    {order.delivery_option === 'express' ? 'Express (72h)' : 'Standard (10j)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-800">Frais de livraison:</span>
                  <span className="font-medium text-amber-950" data-testid="delivery-price">{order.delivery_price.toFixed(2)}CHF</span>
                </div>
                <div className="border-t border-amber-200 pt-3">
                  <div className="flex justify-between text-lg">
                    <span className="font-bold text-amber-950">Total:</span>
                    <span className="font-bold text-amber-700" data-testid="total-amount">{order.total_amount.toFixed(2)}CHF</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Images */}
            {order.shoe_images && order.shoe_images.length > 0 && (
              <Card className="border-amber-200" data-testid="images-card">
                <CardHeader>
                  <CardTitle>Photos des chaussures</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {order.shoe_images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Shoe ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg border border-amber-200"
                        data-testid={`shoe-image-${index}`}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            {order.notes && (
              <Card className="border-amber-200" data-testid="notes-card">
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-amber-800" data-testid="order-notes">{order.notes}</p>
                </CardContent>
              </Card>
            )}

            {/* Timeline */}
            <Card className="border-amber-200" data-testid="timeline-card">
              <CardHeader>
                <CardTitle>Suivi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4" data-testid="timeline-created">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                      <Package className="w-5 h-5 text-amber-700" />
                    </div>
                    <div>
                      <p className="font-medium text-amber-950">Commande créée</p>
                      <p className="text-sm text-amber-600">
                        {new Date(order.created_at).toLocaleString('fr-FR')}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Review Button */}
            {user?.role === 'client' && order.status === 'delivered' && (
              <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full bg-amber-700 hover:bg-amber-800" data-testid="leave-review-btn">
                    <Star className="w-4 h-4 mr-2" /> Laisser un avis
                  </Button>
                </DialogTrigger>
                <DialogContent data-testid="review-dialog">
                  <DialogHeader>
                    <DialogTitle>Évaluer le service</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Note (1-5 étoiles)</Label>
                      <div className="flex gap-2 mt-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className="focus:outline-none"
                            data-testid={`star-${star}`}
                          >
                            <Star
                              className={`w-8 h-8 ${star <= rating ? 'fill-amber-500 text-amber-500' : 'text-amber-300'}`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="comment">Commentaire</Label>
                      <Textarea
                        id="comment"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={4}
                        placeholder="Partagez votre expérience..."
                        data-testid="review-comment"
                      />
                    </div>
                    <Button
                      onClick={handleSubmitReview}
                      className="w-full bg-amber-700 hover:bg-amber-800"
                      data-testid="submit-review-btn"
                    >
                      Envoyer l&apos;avis
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
