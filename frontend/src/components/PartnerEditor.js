import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Edit, MapPin, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function PartnerEditor() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPartner, setEditingPartner] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      const response = await axios.get(`${API}/cobbler/cobblers`);
      // Filter only approved partners
      const approved = response.data.filter(p => p.status === 'approved');
      setPartners(approved);
    } catch (error) {
      toast.error('Erreur lors du chargement des partenaires');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (partner) => {
    setEditingPartner({
      id: partner.id,
      name: partner.name || '',
      email: partner.email || '',
      phone: partner.phone || '',
      address: partner.address || '',
      workshop_address: partner.workshop_address || partner.address || '',
      bank_account: partner.bank_account || '',
      latitude: partner.latitude || '',
      longitude: partner.longitude || ''
    });
    setEditDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingPartner) return;

    setSaving(true);
    try {
      // Update partner info via admin endpoint
      await axios.put(`${API}/admin/partners/${editingPartner.id}`, {
        name: editingPartner.name,
        phone: editingPartner.phone,
        address: editingPartner.address,
        workshop_address: editingPartner.workshop_address,
        bank_account: editingPartner.bank_account
      });

      toast.success('Informations mises à jour avec succès!');
      setEditDialogOpen(false);
      setEditingPartner(null);
      fetchPartners();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Chargement...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Gestion des Partenaires</h2>
        <p className="text-gray-600">Modifier les informations des cordonniers approuvés</p>
      </div>

      <div className="grid gap-4">
        {partners.map((partner) => (
          <Card key={partner.id} className="border-amber-200">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg text-amber-950">{partner.name}</CardTitle>
                  <p className="text-sm text-gray-600">{partner.email}</p>
                  <p className="text-sm text-gray-600">{partner.phone}</p>
                </div>
                <Button
                  onClick={() => handleEdit(partner)}
                  size="sm"
                  variant="outline"
                  className="gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Modifier
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-semibold">Adresse personnelle:</span> {partner.address || 'Non renseignée'}
                </div>
                <div>
                  <span className="font-semibold">Adresse d'atelier:</span> {partner.workshop_address || partner.address || 'Non renseignée'}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  {partner.latitude && partner.longitude ? (
                    <span className="text-green-600">
                      GPS: {partner.latitude.toFixed(4)}, {partner.longitude.toFixed(4)}
                    </span>
                  ) : (
                    <span className="text-red-600">⚠️ Pas de coordonnées GPS</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier les informations du partenaire</DialogTitle>
          </DialogHeader>

          {editingPartner && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nom complet *</Label>
                  <Input
                    id="name"
                    value={editingPartner.name}
                    onChange={(e) => setEditingPartner({...editingPartner, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    value={editingPartner.phone}
                    onChange={(e) => setEditingPartner({...editingPartner, phone: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email (lecture seule)</Label>
                <Input
                  id="email"
                  value={editingPartner.email}
                  disabled
                  className="bg-gray-100"
                />
              </div>

              <div>
                <Label htmlFor="address">Adresse personnelle</Label>
                <Input
                  id="address"
                  value={editingPartner.address}
                  onChange={(e) => setEditingPartner({...editingPartner, address: e.target.value})}
                  placeholder="Rue, ville, code postal"
                />
              </div>

              <div>
                <Label htmlFor="workshop_address">Adresse d'atelier *</Label>
                <Input
                  id="workshop_address"
                  value={editingPartner.workshop_address}
                  onChange={(e) => setEditingPartner({...editingPartner, workshop_address: e.target.value})}
                  placeholder="Adresse complète de l'atelier"
                />
                <p className="text-xs text-gray-500 mt-1">
                  ⚠️ Important: Cette adresse sera automatiquement géocodée pour calculer les distances. 
                  Incluez le code postal et la ville.
                </p>
              </div>

              <div>
                <Label htmlFor="bank_account">Compte bancaire (IBAN)</Label>
                <Input
                  id="bank_account"
                  value={editingPartner.bank_account}
                  onChange={(e) => setEditingPartner({...editingPartner, bank_account: e.target.value})}
                  placeholder="CH00 0000 0000 0000 0000 0"
                />
              </div>

              {editingPartner.latitude && editingPartner.longitude && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-sm text-green-700">
                    <MapPin className="w-4 h-4" />
                    <span>
                      Coordonnées GPS actuelles: {editingPartner.latitude}, {editingPartner.longitude}
                    </span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    Les coordonnées seront mises à jour automatiquement si vous changez l'adresse d'atelier.
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              disabled={saving}
            >
              <X className="w-4 h-4 mr-2" />
              Annuler
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-amber-700 hover:bg-amber-800"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
