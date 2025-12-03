import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, ExternalLink, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function StripeConnectSetup() {
  const [loading, setLoading] = useState(false);
  const [accountStatus, setAccountStatus] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAccountStatus();
    
    // Check if returning from Stripe onboarding
    const urlParams = new URLSearchParams(window.location.search);
    const stripeComplete = urlParams.get('stripe_complete');
    const stripeRefresh = urlParams.get('stripe_refresh');
    
    if (stripeComplete === 'true') {
      toast.success('Configuration Stripe complétée! Vérification en cours...');
      setTimeout(() => {
        fetchAccountStatus();
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }, 2000);
    } else if (stripeRefresh === 'true') {
      toast.info('Veuillez compléter la configuration Stripe');
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const fetchAccountStatus = async () => {
    setRefreshing(true);
    try {
      const response = await axios.get(`${API}/stripe/connect/status`);
      setAccountStatus(response.data);
    } catch (error) {
      console.error('Error fetching account status:', error);
      if (error.response?.status !== 404) {
        toast.error('Erreur lors du chargement du statut');
      }
    } finally {
      setRefreshing(false);
    }
  };

  const createConnectedAccount = async () => {
    setLoading(true);
    try {
      await axios.post(`${API}/stripe/connect/account`);
      toast.success('Compte Stripe créé!');
      await fetchAccountStatus();
    } catch (error) {
      console.error('Error creating account:', error);
      toast.error(error.response?.data?.detail || 'Erreur lors de la création du compte');
    } finally {
      setLoading(false);
    }
  };

  const startOnboarding = async () => {
    setLoading(true);
    try {
      // Create account if doesn't exist
      if (!accountStatus?.has_account) {
        await createConnectedAccount();
      }
      
      // Get onboarding link
      const response = await axios.post(`${API}/stripe/connect/onboard`);
      
      // Redirect to Stripe onboarding
      window.location.href = response.data.url;
    } catch (error) {
      console.error('Error starting onboarding:', error);
      toast.error(error.response?.data?.detail || 'Erreur lors du démarrage');
      setLoading(false);
    }
  };

  const getStatusInfo = () => {
    if (!accountStatus) {
      return {
        color: 'bg-gray-100 text-gray-800',
        icon: <AlertCircle className="w-4 h-4" />,
        text: 'Non configuré',
        description: 'Vous devez configurer votre compte Stripe pour recevoir des paiements'
      };
    }

    if (!accountStatus.has_account) {
      return {
        color: 'bg-gray-100 text-gray-800',
        icon: <AlertCircle className="w-4 h-4" />,
        text: 'Compte non créé',
        description: 'Créez votre compte Stripe Connect pour commencer'
      };
    }

    if (!accountStatus.details_submitted) {
      return {
        color: 'bg-yellow-100 text-yellow-800',
        icon: <AlertCircle className="w-4 h-4" />,
        text: 'Configuration incomplète',
        description: 'Complétez votre profil Stripe pour recevoir des paiements'
      };
    }

    if (!accountStatus.charges_enabled || !accountStatus.payouts_enabled) {
      return {
        color: 'bg-orange-100 text-orange-800',
        icon: <AlertCircle className="w-4 h-4" />,
        text: 'En attente de validation',
        description: 'Stripe vérifie vos informations. Cela peut prendre quelques heures.'
      };
    }

    return {
      color: 'bg-green-100 text-green-800',
      icon: <CheckCircle className="w-4 h-4" />,
      text: 'Actif',
      description: 'Votre compte Stripe est configuré et vous pouvez recevoir des paiements'
    };
  };

  const statusInfo = getStatusInfo();
  const canReceivePayments = accountStatus?.charges_enabled && accountStatus?.payouts_enabled;
  const needsAction = accountStatus?.requirements?.currently_due?.length > 0;

  return (
    <Card className="border-amber-200">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              💳 Configuration Stripe Connect
            </CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              Configurez votre compte pour recevoir vos paiements (85% du montant après commission de 15%)
            </p>
          </div>
          {refreshing ? (
            <Loader2 className="w-5 h-5 animate-spin text-amber-600" />
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchAccountStatus}
              disabled={loading}
            >
              Rafraîchir
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Badge */}
        <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
          <Badge className={`${statusInfo.color} flex items-center gap-1`}>
            {statusInfo.icon}
            {statusInfo.text}
          </Badge>
          <p className="text-sm text-amber-800 flex-1">
            {statusInfo.description}
          </p>
        </div>

        {/* Payment Status Info */}
        {accountStatus?.has_account && (
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-xs text-gray-600">Accepter des paiements</p>
              <p className={`text-sm font-medium ${accountStatus.charges_enabled ? 'text-green-600' : 'text-gray-400'}`}>
                {accountStatus.charges_enabled ? '✓ Activé' : '✗ Désactivé'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Recevoir des virements</p>
              <p className={`text-sm font-medium ${accountStatus.payouts_enabled ? 'text-green-600' : 'text-gray-400'}`}>
                {accountStatus.payouts_enabled ? '✓ Activé' : '✗ Désactivé'}
              </p>
            </div>
          </div>
        )}

        {/* Action needed alert */}
        {needsAction && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900">Action requise</p>
                <p className="text-xs text-red-700 mt-1">
                  Stripe a besoin d'informations supplémentaires. Veuillez compléter votre profil.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2">
          {!canReceivePayments ? (
            <Button 
              onClick={startOnboarding}
              disabled={loading}
              className="w-full bg-amber-700 hover:bg-amber-800"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Redirection...
                </>
              ) : (
                <>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  {accountStatus?.has_account && accountStatus?.details_submitted
                    ? 'Mettre à jour mes informations'
                    : 'Configurer mon compte Stripe'}
                </>
              )}
            </Button>
          ) : (
            <div className="text-center py-4">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-green-900">
                Configuration terminée!
              </p>
              <p className="text-xs text-green-700 mt-1">
                Vous êtes prêt à recevoir des paiements
              </p>
              {accountStatus?.account_id && (
                <p className="text-xs text-gray-500 mt-2">
                  ID: {accountStatus.account_id.substring(0, 20)}...
                </p>
              )}
            </div>
          )}
        </div>

        {/* Info box */}
        <div className="text-xs text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="font-medium text-blue-900 mb-1">💡 À propos des paiements</p>
          <ul className="space-y-1 list-disc list-inside text-blue-800">
            <li>Vous recevez 85% du montant de chaque réparation</li>
            <li>La plateforme prend une commission de 15%</li>
            <li>Les virements sont effectués automatiquement par Stripe</li>
            <li>Vous pouvez suivre vos gains dans l'onglet "Rapports"</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
