import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import axios from 'axios';
import { Wrench } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Auth({ setUser }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'client',
    phone: '',
    address: ''
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API}/auth/login`, {
        email: formData.email,
        password: formData.password
      });
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      toast.success('Connexion réussie !');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API}/auth/register`, formData);
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      toast.success('Inscription réussie !');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur d\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Wrench className="w-10 h-10 text-amber-700" />
            <h1 className="text-3xl font-bold text-amber-900" style={{ fontFamily: 'Cormorant Garamond, serif' }}>ShoeRepair</h1>
          </div>
          <p className="text-amber-700">Marketplace de réparation de chaussures</p>
        </div>

        <Card className="border-amber-200 shadow-xl" data-testid="auth-card">
          <CardHeader>
            <CardTitle>Bienvenue</CardTitle>
            <CardDescription>Connectez-vous ou créez un compte</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login" data-testid="login-tab">Connexion</TabsTrigger>
                <TabsTrigger value="register" data-testid="register-tab">Inscription</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4" data-testid="login-form">
                  <div>
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      data-testid="login-email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="login-password">Mot de passe</Label>
                    <Input
                      id="login-password"
                      data-testid="login-password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-amber-700 hover:bg-amber-800" 
                    disabled={loading}
                    data-testid="login-submit-btn"
                  >
                    {loading ? 'Connexion...' : 'Se connecter'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4" data-testid="register-form">
                  <div>
                    <Label htmlFor="register-name">Nom complet</Label>
                    <Input
                      id="register-name"
                      data-testid="register-name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      data-testid="register-email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="register-password">Mot de passe</Label>
                    <Input
                      id="register-password"
                      data-testid="register-password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="register-phone">Téléphone (optionnel)</Label>
                    <Input
                      id="register-phone"
                      data-testid="register-phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="register-address">Adresse (optionnel)</Label>
                    <Input
                      id="register-address"
                      data-testid="register-address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-amber-700 hover:bg-amber-800" 
                    disabled={loading}
                    data-testid="register-submit-btn"
                  >
                    {loading ? 'Inscription...' : 'S\'inscrire'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
