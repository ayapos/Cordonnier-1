import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Upload, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function BecomePartner() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    id_recto: null,
    id_verso: null,
    che_kbis: null,
    bank_account: ''
  });

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, [field]: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API}/auth/register`, {
        ...formData,
        role: 'cobbler'
      });
      
      toast.success('Demande envoyée ! Nous examinerons vos documents.');
      setTimeout(() => navigate('/'), 2000);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur d\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="px-4 py-3 flex items-center max-w-md mx-auto">
          <Link to="/">
            <Button variant="ghost" size="icon" className="-ml-2">
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </Button>
          </Link>
          <h1 className="text-lg font-bold text-gray-900 ml-2">Devenir Partenaire</h1>
        </div>
      </header>

      <div className="pt-16 pb-8 px-4 max-w-md mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Rejoignez-nous</h2>
          <p className="text-gray-600">Inscrivez-vous comme artisan cordonnier</p>
        </div>

        {/* Avantages */}
        <div className="bg-orange-50 rounded-2xl p-6 mb-8">
          <h3 className="font-bold text-gray-900 mb-4">Pourquoi devenir partenaire ?</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-orange-700 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-gray-700">Clients automatiquement attribués selon votre localisation</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-orange-700 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-gray-700">Paiements sécurisés et automatiques via Stripe Connect</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-orange-700 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-gray-700">Commission plateforme : seulement 15%</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-orange-700 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-gray-700">Gestion simple via application mobile</span>
            </li>
          </ul>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-base">Informations personnelles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Nom complet *</Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  data-testid="partner-name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  data-testid="partner-email"
                />
              </div>
              <div>
                <Label htmlFor="password">Mot de passe *</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  data-testid="partner-password"
                />
              </div>
              <div>
                <Label htmlFor="phone">Téléphone *</Label>
                <Input
                  id="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  data-testid="partner-phone"
                />
              </div>
              <div>
                <Label htmlFor="address">Adresse de l'atelier *</Label>
                <Textarea
                  id="address"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={2}
                  data-testid="partner-address"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-base">Documents requis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="id_recto">Pièce d'identité (Recto) *</Label>
                <div className="mt-2">
                  <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-orange-500 transition-colors">
                    <Upload className="w-5 h-5 text-gray-600" />
                    <span className="text-sm text-gray-600">
                      {formData.id_recto ? 'Fichier sélectionné ✓' : 'Cliquez pour télécharger'}
                    </span>
                    <input
                      id="id_recto"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileChange(e, 'id_recto')}
                      required
                    />
                  </label>
                </div>
              </div>

              <div>
                <Label htmlFor="id_verso">Pièce d'identité (Verso) *</Label>
                <div className="mt-2">
                  <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-orange-500 transition-colors">
                    <Upload className="w-5 h-5 text-gray-600" />
                    <span className="text-sm text-gray-600">
                      {formData.id_verso ? 'Fichier sélectionné ✓' : 'Cliquez pour télécharger'}
                    </span>
                    <input
                      id="id_verso"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileChange(e, 'id_verso')}
                      required
                    />
                  </label>
                </div>
              </div>

              <div>
                <Label htmlFor="che_kbis">Numéro CHE ou KBIS *</Label>
                <div className="mt-2">
                  <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-orange-500 transition-colors">
                    <Upload className="w-5 h-5 text-gray-600" />
                    <span className="text-sm text-gray-600">
                      {formData.che_kbis ? 'Document sélectionné ✓' : 'Cliquez pour télécharger'}
                    </span>
                    <input
                      id="che_kbis"
                      type="file"
                      accept="image/*,application/pdf"
                      className="hidden"
                      onChange={(e) => handleFileChange(e, 'che_kbis')}
                      required
                    />
                  </label>
                </div>
              </div>

              <div>
                <Label htmlFor="bank_account">Coordonnées bancaires (IBAN) *</Label>
                <Input
                  id="bank_account"
                  required
                  placeholder="CH00 0000 0000 0000 0000 0"
                  value={formData.bank_account}
                  onChange={(e) => setFormData({ ...formData, bank_account: e.target.value })}
                  data-testid="partner-bank"
                />
                <p className="text-xs text-gray-500 mt-1">Pour les versements automatiques</p>
              </div>
            </CardContent>
          </Card>

          <div className="bg-blue-50 rounded-xl p-4 text-sm text-gray-700">
            <p className="font-medium mb-2">📋 Validation :</p>
            <p>Votre demande sera examinée sous 48h. Nous vérifierons vos documents et vous contacterons par email.</p>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full bg-orange-700 hover:bg-orange-800 text-white"
            disabled={loading}
            data-testid="submit-partner-btn"
          >
            {loading ? 'Envoi en cours...' : 'Envoyer ma demande'}
          </Button>
        </form>
      </div>
    </div>
  );
}
