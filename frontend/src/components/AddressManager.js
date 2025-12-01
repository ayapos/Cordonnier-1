import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, Save } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AddressManager({ user, onAddressUpdated }) {
  const [address, setAddress] = useState(user?.address || '');
  const [loading, setLoading] = useState(false);

  const handleUpdateAddress = async () => {
    if (!address.trim()) {
      toast.error('Veuillez saisir une adresse');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.put(`${API}/cobbler/address`, { address });
      
      if (response.data.geocoded) {
        toast.success('Adresse mise à jour et localisée avec succès !');
      } else {
        toast.warning('Adresse enregistrée sans géolocalisation', {
          description: response.data.warning || 'Impossible de localiser précisément cette adresse.',
          duration: 6000
        });
      }
      
      // Pass complete user object to parent
      if (onAddressUpdated && response.data.user) {
        onAddressUpdated(response.data.user);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Erreur lors de la mise à jour';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-amber-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-amber-700" />
          Mon adresse d'atelier
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="workshop-address">Adresse complète</Label>
          <Textarea
            id="workshop-address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Exemple: Rue du Commerce 5, 1003 Lausanne, Suisse"
            rows={3}
            className="mt-2"
          />
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
            <p className="text-xs font-medium text-blue-800 mb-1">💡 Format recommandé :</p>
            <p className="text-xs text-blue-700">
              Rue et numéro, Code postal, Ville, Pays<br />
              Exemples valides :<br />
              • Rue de Genève 10, 1003 Lausanne, Switzerland<br />
              • Avenue de la Gare 15, 1000 Lausanne, Suisse<br />
              • Lausanne, Switzerland
            </p>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Cette adresse est utilisée pour vous attribuer automatiquement les commandes les plus proches.
          </p>
        </div>

        {user?.latitude && user?.longitude && (
          <div className="bg-green-50 rounded-lg p-3">
            <p className="text-sm font-medium text-green-800">📍 Position actuelle :</p>
            <p className="text-xs text-green-700 mt-1">
              Lat: {user.latitude.toFixed(6)}, Lon: {user.longitude.toFixed(6)}
            </p>
          </div>
        )}

        <Button
          onClick={handleUpdateAddress}
          disabled={loading}
          className="w-full bg-amber-700 hover:bg-amber-800"
        >
          <Save className="w-4 h-4 mr-2" />
          {loading ? 'Mise à jour...' : 'Mettre à jour mon adresse'}
        </Button>
      </CardContent>
    </Card>
  );
}
