import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wrench, Users, Package, TrendingUp, LogOut, Plus, Edit, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import AdminSettings from './AdminSettings';

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

export default function AdminDashboard({ user }) {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [cobblers, setCobblers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [newService, setNewService] = useState({
    name: '',
    description: '',
    price: '',
    estimated_days: '',
    category: 'Réparation',
    gender: 'mixte',
    image_url: ''
  });
  const [createServiceOpen, setCreateServiceOpen] = useState(false);
  const [editService, setEditService] = useState(null);
  const [editServiceOpen, setEditServiceOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      toast.error('Accès réservé aux administrateurs');
      navigate('/dashboard');
      return;
    }
    fetchAllData();
  }, [user]);

  const fetchAllData = async () => {
    try {
      const [ordersRes, cobblersRes, statsRes, servicesRes] = await Promise.all([
        axios.get(`${API}/orders`),
        axios.get(`${API}/cobblers`),
        axios.get(`${API}/stats`),
        axios.get(`${API}/services`)
      ]);
      setOrders(ordersRes.data);
      setCobblers(cobblersRes.data);
      setStats(statsRes.data);
      setServices(servicesRes.data);
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

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.patch(`${API}/orders/${orderId}/status?status=${newStatus}`);
      toast.success('Statut mis à jour');
      fetchAllData();
    } catch (error) {
      toast.error('Erreur de mise à jour');
    }
  };

  const handleCreateService = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/services`, {
        ...newService,
        price: parseFloat(newService.price),
        estimated_days: parseInt(newService.estimated_days)
      });
      toast.success('Service créé avec succès !');
      setCreateServiceOpen(false);
      setNewService({
        name: '',
        description: '',
        price: '',
        estimated_days: '',
        category: 'Réparation',
        gender: 'mixte',
        image_url: ''
      });
      fetchAllData();
    } catch (error) {
      toast.error('Erreur de création du service');
    }
  };

  const handleEditService = (service) => {
    setEditService({
      id: service.id,
      name: service.name,
      description: service.description,
      price: service.price.toString(),
      estimated_days: service.estimated_days.toString(),
      category: service.category,
      gender: service.gender,
      image_url: service.image_url || ''
    });
    setEditServiceOpen(true);
  };

  const handleUpdateService = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API}/services/${editService.id}`, {
        name: editService.name,
        description: editService.description,
        price: parseFloat(editService.price),
        estimated_days: parseInt(editService.estimated_days),
        category: editService.category,
        gender: editService.gender,
        image_url: editService.image_url
      });
      toast.success('Service modifié avec succès !');
      setEditServiceOpen(false);
      setEditService(null);
      fetchAllData();
    } catch (error) {
      toast.error('Erreur de modification du service');
    }
  };

  const handleDeleteService = (service) => {
    setServiceToDelete(service);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!serviceToDelete) return;
    
    try {
      await axios.delete(`${API}/services/${serviceToDelete.id}`);
      toast.success('Service supprimé avec succès !');
      setDeleteConfirmOpen(false);
      setServiceToDelete(null);
      fetchAllData();
    } catch (error) {
      toast.error('Erreur de suppression du service');
      console.error('Delete error:', error);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.reference_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.service_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

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
          <div className="flex items-center gap-2">
            <Wrench className="w-8 h-8 text-amber-700" />
            <div>
              <h1 className="text-2xl font-bold text-amber-900" style={{ fontFamily: 'Cormorant Garamond, serif' }}>ShoeRepair Admin</h1>
              <p className="text-xs text-amber-600">Panneau d'administration</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-amber-800" data-testid="admin-name">👨‍💼 {user?.name}</span>
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

          <Card className="border-amber-200" data-testid="stat-cobblers">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cordonniers</CardTitle>
              <Users className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-900" data-testid="cobblers-count">{cobblers.length}</div>
            </CardContent>
          </Card>

          <Card className="border-amber-200" data-testid="stat-revenue">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenus Total</CardTitle>
              <TrendingUp className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-900" data-testid="revenue-value">{stats?.total_revenue?.toFixed(2) || 0}CHF</div>
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-amber-50" data-testid="stat-commission">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ma Commission (15%)</CardTitle>
              <TrendingUp className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-700" data-testid="commission-value">{stats?.total_commission?.toFixed(2) || 0}CHF</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl">
            <TabsTrigger value="orders" data-testid="orders-tab">Commandes</TabsTrigger>
            <TabsTrigger value="cobblers" data-testid="cobblers-tab">Cordonniers</TabsTrigger>
            <TabsTrigger value="services" data-testid="services-tab">Services</TabsTrigger>
            <TabsTrigger value="settings" data-testid="settings-tab">Paramètres</TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card className="border-amber-200">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Toutes les Commandes</CardTitle>
                  <div className="flex gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-amber-600" />
                      <Input
                        placeholder="Rechercher..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                        data-testid="search-orders"
                      />
                    </div>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-40" data-testid="filter-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous</SelectItem>
                        <SelectItem value="pending">En attente</SelectItem>
                        <SelectItem value="accepted">Accepté</SelectItem>
                        <SelectItem value="in_progress">En cours</SelectItem>
                        <SelectItem value="shipped">Expédié</SelectItem>
                        <SelectItem value="delivered">Livré</SelectItem>
                        <SelectItem value="cancelled">Annulé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredOrders.length === 0 ? (
                  <div className="text-center py-12" data-testid="no-orders">
                    <Package className="w-16 h-16 text-amber-300 mx-auto mb-4" />
                    <p className="text-amber-800">Aucune commande trouvée</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredOrders.map((order) => (
                      <div 
                        key={order.id} 
                        className="border border-amber-200 rounded-lg p-4"
                        data-testid={`admin-order-${order.id}`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-bold text-amber-950" data-testid={`order-ref-${order.id}`}>{order.reference_number}</h4>
                              <Badge className={statusColors[order.status]} data-testid={`order-status-${order.id}`}>
                                {statusLabels[order.status]}
                              </Badge>
                            </div>
                            <p className="text-sm text-amber-700" data-testid={`order-service-${order.id}`}>{order.service_name}</p>
                            <p className="text-xs text-amber-600 mt-1">
                              Client ID: {order.client_id.substring(0, 8)}... | 
                              {order.cobbler_id ? ` Cordonnier: ${order.cobbler_id.substring(0, 8)}...` : ' Pas encore assigné'}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-amber-700" data-testid={`order-amount-${order.id}`}>{order.total_amount.toFixed(2)}CHF</div>
                            <div className="text-xs text-green-600" data-testid={`order-commission-${order.id}`}>Commission: {order.commission.toFixed(2)}CHF</div>
                            <div className="text-xs text-amber-600 mt-1">{new Date(order.created_at).toLocaleDateString('fr-FR')}</div>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Select 
                            value={order.status} 
                            onValueChange={(newStatus) => handleUpdateOrderStatus(order.id, newStatus)}
                          >
                            <SelectTrigger className="w-48" data-testid={`change-status-${order.id}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">En attente</SelectItem>
                              <SelectItem value="accepted">Accepté</SelectItem>
                              <SelectItem value="in_progress">En cours</SelectItem>
                              <SelectItem value="shipped">Expédié</SelectItem>
                              <SelectItem value="delivered">Livré</SelectItem>
                              <SelectItem value="cancelled">Annulé</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => navigate(`/order/${order.id}`)}
                            data-testid={`view-order-${order.id}`}
                          >
                            Voir détails
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cobblers Tab */}
          <TabsContent value="cobblers">
            <Card className="border-amber-200">
              <CardHeader>
                <CardTitle>Cordonniers Inscrits</CardTitle>
              </CardHeader>
              <CardContent>
                {cobblers.length === 0 ? (
                  <div className="text-center py-12" data-testid="no-cobblers">
                    <Users className="w-16 h-16 text-amber-300 mx-auto mb-4" />
                    <p className="text-amber-800">Aucun cordonnier inscrit</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {cobblers.map((cobbler) => {
                      const cobblerOrders = orders.filter(o => o.cobbler_id === cobbler.id);
                      const completedOrders = cobblerOrders.filter(o => o.status === 'delivered');
                      const revenue = completedOrders.reduce((sum, o) => sum + o.service_price, 0);
                      
                      return (
                        <Card key={cobbler.id} className="border-amber-200" data-testid={`cobbler-card-${cobbler.id}`}>
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle className="text-lg" data-testid={`cobbler-name-${cobbler.id}`}>{cobbler.name}</CardTitle>
                                <p className="text-sm text-amber-600" data-testid={`cobbler-email-${cobbler.id}`}>{cobbler.email}</p>
                              </div>
                              <Badge className={cobbler.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                                {cobbler.status === 'approved' ? 'Actif' : cobbler.status === 'pending' ? 'En attente' : 'Rejeté'}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2 text-sm">
                              {cobbler.phone && (
                                <p className="text-amber-700" data-testid={`cobbler-phone-${cobbler.id}`}>
                                  📞 {cobbler.phone}
                                </p>
                              )}
                              {cobbler.address && (
                                <p className="text-amber-700" data-testid={`cobbler-address-${cobbler.id}`}>
                                  📍 {cobbler.address}
                                </p>
                              )}
                              {cobbler.terms_signed_at && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-2 mt-2">
                                  <p className="text-xs font-medium text-green-800">✓ CGU Partenaire signées</p>
                                  <p className="text-xs text-green-700">
                                    {new Date(cobbler.terms_signed_at).toLocaleString('fr-FR')}
                                  </p>
                                </div>
                              )}
                              <div className="pt-3 border-t border-amber-200 mt-3">
                                <div className="flex justify-between text-amber-800">
                                  <span>Commandes traitées:</span>
                                  <span className="font-bold" data-testid={`cobbler-orders-${cobbler.id}`}>{cobblerOrders.length}</span>
                                </div>
                                <div className="flex justify-between text-amber-800">
                                  <span>Complétées:</span>
                                  <span className="font-bold" data-testid={`cobbler-completed-${cobbler.id}`}>{completedOrders.length}</span>
                                </div>
                                <div className="flex justify-between text-amber-800">
                                  <span>Revenus générés:</span>
                                  <span className="font-bold text-amber-700" data-testid={`cobbler-revenue-${cobbler.id}`}>{revenue.toFixed(2)}CHF</span>
                                </div>
                              </div>
                              <p className="text-xs text-amber-600 mt-2">
                                Inscrit le {new Date(cobbler.created_at).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services">
            <Card className="border-amber-200">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Services de Réparation</CardTitle>
                  <Dialog open={createServiceOpen} onOpenChange={setCreateServiceOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-amber-700 hover:bg-amber-800" data-testid="create-service-btn">
                        <Plus className="w-4 h-4 mr-2" /> Créer un service
                      </Button>
                    </DialogTrigger>
                    <DialogContent data-testid="create-service-dialog">
                      <DialogHeader>
                        <DialogTitle>Nouveau Service</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleCreateService} className="space-y-4">
                        <div>
                          <Label htmlFor="service-name">Nom du service</Label>
                          <Input
                            id="service-name"
                            required
                            value={newService.name}
                            onChange={(e) => setNewService({...newService, name: e.target.value})}
                            data-testid="service-name-input"
                          />
                        </div>
                        <div>
                          <Label htmlFor="service-description">Description</Label>
                          <Input
                            id="service-description"
                            required
                            value={newService.description}
                            onChange={(e) => setNewService({...newService, description: e.target.value})}
                            data-testid="service-description-input"
                          />
                        </div>
                        <div>
                          <Label htmlFor="service-price">Prix (CHF)</Label>
                          <Input
                            id="service-price"
                            type="number"
                            step="0.01"
                            required
                            value={newService.price}
                            onChange={(e) => setNewService({...newService, price: e.target.value})}
                            data-testid="service-price-input"
                          />
                        </div>
                        <div>
                          <Label htmlFor="service-days">Délai (jours)</Label>
                          <Input
                            id="service-days"
                            type="number"
                            required
                            value={newService.estimated_days}
                            onChange={(e) => setNewService({...newService, estimated_days: e.target.value})}
                            data-testid="service-days-input"
                          />
                        </div>
                        <div>
                          <Label htmlFor="service-category">Catégorie</Label>
                          <Select 
                            value={newService.category} 
                            onValueChange={(value) => setNewService({...newService, category: value})}
                          >
                            <SelectTrigger data-testid="service-category-select">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Réparation">Réparation</SelectItem>
                              <SelectItem value="Entretien">Entretien</SelectItem>
                              <SelectItem value="Modification">Modification</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="service-gender">Genre</Label>
                          <Select 
                            value={newService.gender} 
                            onValueChange={(value) => setNewService({...newService, gender: value})}
                          >
                            <SelectTrigger data-testid="service-gender-select">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="femme">Femme</SelectItem>
                              <SelectItem value="homme">Homme</SelectItem>
                              <SelectItem value="mixte">Mixte</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="service-image">URL de l'image</Label>
                          <Input
                            id="service-image"
                            placeholder="https://exemple.com/image.jpg"
                            value={newService.image_url}
                            onChange={(e) => setNewService({...newService, image_url: e.target.value})}
                            data-testid="service-image-input"
                          />
                          <p className="text-xs text-gray-500 mt-1">URL d'une image Unsplash ou autre</p>
                        </div>
                        <Button type="submit" className="w-full bg-amber-700 hover:bg-amber-800" data-testid="submit-service-btn">
                          Créer le service
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                  
                  {/* Edit Service Dialog */}
                  <Dialog open={editServiceOpen} onOpenChange={setEditServiceOpen}>
                    <DialogContent data-testid="edit-service-dialog">
                      <DialogHeader>
                        <DialogTitle>Modifier le Service</DialogTitle>
                      </DialogHeader>
                      {editService && (
                        <form onSubmit={handleUpdateService} className="space-y-4">
                          <div>
                            <Label htmlFor="edit-service-name">Nom du service</Label>
                            <Input
                              id="edit-service-name"
                              required
                              value={editService.name}
                              onChange={(e) => setEditService({...editService, name: e.target.value})}
                              data-testid="edit-service-name-input"
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit-service-description">Description</Label>
                            <Input
                              id="edit-service-description"
                              required
                              value={editService.description}
                              onChange={(e) => setEditService({...editService, description: e.target.value})}
                              data-testid="edit-service-description-input"
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit-service-price">Prix (CHF)</Label>
                            <Input
                              id="edit-service-price"
                              type="number"
                              step="0.01"
                              required
                              value={editService.price}
                              onChange={(e) => setEditService({...editService, price: e.target.value})}
                              data-testid="edit-service-price-input"
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit-service-days">Délai (jours)</Label>
                            <Input
                              id="edit-service-days"
                              type="number"
                              required
                              value={editService.estimated_days}
                              onChange={(e) => setEditService({...editService, estimated_days: e.target.value})}
                              data-testid="edit-service-days-input"
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit-service-category">Catégorie</Label>
                            <Select 
                              value={editService.category} 
                              onValueChange={(value) => setEditService({...editService, category: value})}
                            >
                              <SelectTrigger data-testid="edit-service-category-select">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Réparation">Réparation</SelectItem>
                                <SelectItem value="Entretien">Entretien</SelectItem>
                                <SelectItem value="Modification">Modification</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="edit-service-gender">Genre</Label>
                            <Select 
                              value={editService.gender} 
                              onValueChange={(value) => setEditService({...editService, gender: value})}
                            >
                              <SelectTrigger data-testid="edit-service-gender-select">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="femme">Femme</SelectItem>
                                <SelectItem value="homme">Homme</SelectItem>
                                <SelectItem value="mixte">Mixte</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="edit-service-image">URL de l'image</Label>
                            <Input
                              id="edit-service-image"
                              placeholder="https://exemple.com/image.jpg"
                              value={editService.image_url}
                              onChange={(e) => setEditService({...editService, image_url: e.target.value})}
                              data-testid="edit-service-image-input"
                            />
                            <p className="text-xs text-gray-500 mt-1">URL d'une image Unsplash ou autre</p>
                          </div>
                          <Button type="submit" className="w-full bg-amber-700 hover:bg-amber-800" data-testid="submit-edit-service-btn">
                            Enregistrer les modifications
                          </Button>
                        </form>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {services.length === 0 ? (
                  <div className="text-center py-12" data-testid="no-services">
                    <Package className="w-16 h-16 text-amber-300 mx-auto mb-4" />
                    <p className="text-amber-800">Aucun service disponible</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {services.map((service) => (
                      <Card key={service.id} className="border-amber-200" data-testid={`service-card-${service.id}`}>
                        {service.image_url && (
                          <div className="w-full h-40 overflow-hidden rounded-t-lg">
                            <img 
                              src={service.image_url} 
                              alt={service.name}
                              className="w-full h-full object-cover"
                              data-testid={`service-image-${service.id}`}
                            />
                          </div>
                        )}
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <CardTitle className="text-base" data-testid={`service-name-${service.id}`}>{service.name}</CardTitle>
                              <Badge className="mt-2 bg-amber-100 text-amber-800" data-testid={`service-category-${service.id}`}>{service.category}</Badge>
                            </div>
                            <div className="text-xl font-bold text-amber-700" data-testid={`service-price-${service.id}`}>{service.price}CHF</div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-amber-700 mb-2" data-testid={`service-description-${service.id}`}>{service.description}</p>
                          <p className="text-xs text-amber-600 mb-3" data-testid={`service-days-${service.id}`}>Délai: {service.estimated_days} jours</p>
                          <div className="flex gap-2 mt-4">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1"
                              onClick={() => handleEditService(service)}
                              data-testid={`edit-service-${service.id}`}
                            >
                              <Edit className="w-4 h-4 mr-1" /> Éditer
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDeleteService(service)}
                              data-testid={`delete-service-${service.id}`}
                            >
                              <Trash2 className="w-4 h-4 mr-1" /> Supprimer
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <AdminSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
