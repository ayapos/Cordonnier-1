import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wrench, Package, TrendingUp, Clock, LogOut, Plus } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/components/LanguageSwitcher';

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

export default function Dashboard({ user }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [ordersRes, statsRes] = await Promise.all([
        axios.get(`${API}/orders`),
        axios.get(`${API}/stats`)
      ]);
      setOrders(ordersRes.data);
      setStats(statsRes.data);
    } catch (error) {
      toast.error('Erreur de chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.success('Déconnexion réussie');
    navigate('/');
  };

  const handleAcceptOrder = async (orderId) => {
    try {
      await axios.post(`${API}/orders/${orderId}/accept`);
      toast.success('Commande acceptée !');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur');
    }
  };

  const handleUpdateStatus = async (orderId, status) => {
    try {
      await axios.patch(`${API}/orders/${orderId}/status?status=${status}`);
      toast.success('Statut mis à jour');
      fetchData();
    } catch (error) {
      toast.error('Erreur de mise à jour');
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
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Wrench className="w-8 h-8 text-amber-700" />
            <h1 className="text-2xl font-bold text-amber-900" style={{ fontFamily: 'Cormorant Garamond, serif' }}>ShoeRepair</h1>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/services">
              <Button variant="outline" className="bg-amber-700 text-white hover:bg-amber-800">
                <Plus className="w-4 h-4 mr-2" /> Nouvelle commande
              </Button>
            </Link>
            <span className="text-amber-800" data-testid="user-name">Bonjour, {user?.name}</span>
            <Button variant="outline" onClick={handleLogout} data-testid="logout-btn">
              <LogOut className="w-4 h-4 mr-2" /> Déconnexion
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-amber-200" data-testid="stat-total-orders">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Commandes</CardTitle>
              <Package className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-900" data-testid="total-orders-value">{stats?.total_orders || 0}</div>
            </CardContent>
          </Card>

          <Card className="border-amber-200" data-testid="stat-pending-orders">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En cours</CardTitle>
              <Clock className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-900" data-testid="pending-orders-value">{stats?.pending_orders || 0}</div>
            </CardContent>
          </Card>

          <Card className="border-amber-200" data-testid="stat-completed-orders">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Terminées</CardTitle>
              <TrendingUp className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-900" data-testid="completed-orders-value">{stats?.completed_orders || 0}</div>
            </CardContent>
          </Card>

          <Card className="border-amber-200" data-testid="stat-revenue">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {user?.role === 'admin' ? 'Commission' : 'Revenus'}
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-900" data-testid="revenue-value">
                {user?.role === 'admin' ? `${stats?.total_commission?.toFixed(2) || 0}CHF` : `${stats?.total_revenue?.toFixed(2) || 0}CHF`}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        {user?.role === 'client' && (
          <div className="mb-6">
            <Link to="/order/new">
              <Button className="bg-amber-700 hover:bg-amber-800" data-testid="new-order-btn">
                <Plus className="w-4 h-4 mr-2" /> Nouvelle commande
              </Button>
            </Link>
          </div>
        )}

        {/* Orders List */}
        <Card className="border-amber-200">
          <CardHeader>
            <CardTitle>Mes Commandes</CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-center py-12" data-testid="no-orders">
                <Package className="w-16 h-16 text-amber-300 mx-auto mb-4" />
                <p className="text-amber-800">Aucune commande pour le moment</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div 
                    key={order.id} 
                    className="border border-amber-200 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer"
                    onClick={() => navigate(`/order/${order.id}`)}
                    data-testid={`order-item-${order.id}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-amber-950" data-testid={`order-ref-${order.id}`}>{order.reference_number}</h4>
                        <p className="text-sm text-amber-700" data-testid={`order-service-${order.id}`}>{order.service_name}</p>
                      </div>
                      <Badge className={statusColors[order.status]} data-testid={`order-status-${order.id}`}>
                        {statusLabels[order.status]}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center mt-3 text-sm">
                      <span className="text-amber-700" data-testid={`order-amount-${order.id}`}>{order.total_amount.toFixed(2)}CHF</span>
                      <span className="text-amber-600" data-testid={`order-date-${order.id}`}>
                        {new Date(order.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    {user?.role === 'cobbler' && order.status === 'accepted' && !order.cobbler_id && (
                      <Button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAcceptOrder(order.id);
                        }}
                        size="sm"
                        className="mt-3 bg-amber-700 hover:bg-amber-800"
                        data-testid={`accept-order-btn-${order.id}`}
                      >
                        Accepter la commande
                      </Button>
                    )}
                    {user?.role === 'cobbler' && order.cobbler_id === user.id && order.status === 'in_progress' && (
                      <Button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateStatus(order.id, 'shipped');
                        }}
                        size="sm"
                        className="mt-3 bg-amber-700 hover:bg-amber-800"
                        data-testid={`ship-order-btn-${order.id}`}
                      >
                        Marquer comme expédié
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
