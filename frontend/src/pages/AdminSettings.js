import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Save } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    delivery_standard_price: 8,
    delivery_express_price: 20,
    delivery_standard_days: 10,
    delivery_express_hours: 72,
    platform_commission: 15,
    currency: 'CHF',
    vat_rate: 7.7,
    email_notifications_enabled: true,
    support_email: 'contact@shoerepair.com'
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API}/settings`);
      setSettings(response.data);
    } catch (error) {
      toast.error('Erreur de chargement des paramètres');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(`${API}/settings`, settings);
      toast.success('Paramètres enregistrés avec succès !');
    } catch (error) {
      toast.error('Erreur d\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-orange-700 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Paramètres de l'Application</h2>
          <p className="text-gray-600">Configurez tous les paramètres de votre marketplace</p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="bg-orange-700 hover:bg-orange-800"
          data-testid="save-settings-btn"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
      </div>

      {/* Livraison */}
      <Card className="border-orange-200">
        <CardHeader>
          <CardTitle>Options de Livraison</CardTitle>
          <CardDescription>Configurez les prix et délais de livraison</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-bold text-gray-900 mb-4">🚚 Livraison Standard</h4>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="delivery_standard_price">Prix (CHF)</Label>
                  <Input
                    id="delivery_standard_price"
                    type="number"
                    step="0.5"
                    value={settings.delivery_standard_price}
                    onChange={(e) => setSettings({...settings, delivery_standard_price: parseFloat(e.target.value)})}
                    data-testid="standard-price"
                  />
                </div>
                <div>
                  <Label htmlFor="delivery_standard_days">Délai (jours)</Label>
                  <Input
                    id="delivery_standard_days"
                    type="number"
                    value={settings.delivery_standard_days}
                    onChange={(e) => setSettings({...settings, delivery_standard_days: parseInt(e.target.value)})}
                    data-testid="standard-days"
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-4">⚡ Livraison Express</h4>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="delivery_express_price">Prix (CHF)</Label>
                  <Input
                    id="delivery_express_price"
                    type="number"
                    step="0.5"
                    value={settings.delivery_express_price}
                    onChange={(e) => setSettings({...settings, delivery_express_price: parseFloat(e.target.value)})}
                    data-testid="express-price"
                  />
                </div>
                <div>
                  <Label htmlFor="delivery_express_hours">Délai (heures)</Label>
                  <Input
                    id="delivery_express_hours"
                    type="number"
                    value={settings.delivery_express_hours}
                    onChange={(e) => setSettings({...settings, delivery_express_hours: parseInt(e.target.value)})}
                    data-testid="express-hours"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-sm">
            <p className="text-gray-700">
              <strong>Aperçu :</strong> Les clients verront "Standard ({settings.delivery_standard_days}j) - {settings.delivery_standard_price} CHF" et "Express ({settings.delivery_express_hours}h) - {settings.delivery_express_price} CHF"
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Commission et Devise */}
      <Card className="border-orange-200">
        <CardHeader>
          <CardTitle>Commission et Devise</CardTitle>
          <CardDescription>Paramètres financiers de la plateforme</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="platform_commission">Commission Plateforme (%)</Label>
              <Input
                id="platform_commission"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={settings.platform_commission}
                onChange={(e) => setSettings({...settings, platform_commission: parseFloat(e.target.value)})}
                data-testid="commission"
              />
              <p className="text-xs text-gray-500 mt-1">Prélevée sur chaque commande</p>
            </div>

            <div>
              <Label htmlFor="currency">Devise</Label>
              <Input
                id="currency"
                value={settings.currency}
                onChange={(e) => setSettings({...settings, currency: e.target.value})}
                data-testid="currency"
              />
              <p className="text-xs text-gray-500 mt-1">Ex: CHF, EUR, USD</p>
            </div>

            <div>
              <Label htmlFor="vat_rate">Taux TVA (%)</Label>
              <Input
                id="vat_rate"
                type="number"
                step="0.1"
                value={settings.vat_rate}
                onChange={(e) => setSettings({...settings, vat_rate: parseFloat(e.target.value)})}
                data-testid="vat-rate"
              />
              <p className="text-xs text-gray-500 mt-1">TVA suisse: 7.7%</p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              <strong>Exemple de calcul :</strong> Service à 100 CHF<br/>
              - Cordonnier reçoit : {(100 - (100 * settings.platform_commission / 100)).toFixed(2)} CHF<br/>
              - Plateforme prélève : {(100 * settings.platform_commission / 100).toFixed(2)} CHF ({settings.platform_commission}%)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Emails */}
      <Card className="border-orange-200">
        <CardHeader>
          <CardTitle>Notifications Email</CardTitle>
          <CardDescription>Configuration des emails envoyés aux utilisateurs</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Notifications activées</p>
              <p className="text-sm text-gray-600">Envoyer des emails de confirmation, suivi, etc.</p>
            </div>
            <Switch
              checked={settings.email_notifications_enabled}
              onCheckedChange={(checked) => setSettings({...settings, email_notifications_enabled: checked})}
              data-testid="email-notifications-toggle"
            />
          </div>

          <div>
            <Label htmlFor="support_email">Email de Support</Label>
            <Input
              id="support_email"
              type="email"
              value={settings.support_email}
              onChange={(e) => setSettings({...settings, support_email: e.target.value})}
              data-testid="support-email"
            />
            <p className="text-xs text-gray-500 mt-1">Email affiché pour le support client</p>
          </div>
        </CardContent>
      </Card>

      {/* Textes personnalisables */}
      <Card className="border-orange-200">
        <CardHeader>
          <CardTitle>Textes de l'Application</CardTitle>
          <CardDescription>Personnalisez les textes affichés</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700">
            <p className="font-medium mb-2">💡 Fonctionnalité à venir</p>
            <ul className="space-y-1 text-xs">
              <li>• Personnaliser les messages de confirmation</li>
              <li>• Modifier les textes d'emails</li>
              <li>• Changer les mentions légales</li>
              <li>• Adapter les CGU dynamiquement</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Save button bottom */}
      <div className="flex justify-end pt-4">
        <Button 
          onClick={handleSave} 
          disabled={saving}
          size="lg"
          className="bg-orange-700 hover:bg-orange-800"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Enregistrement...' : 'Enregistrer tous les paramètres'}
        </Button>
      </div>
    </div>
  );
}
