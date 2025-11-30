import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle, XCircle, Eye, FileText } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function PartnerManagement() {
  const [pendingPartners, setPendingPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [viewDocumentOpen, setViewDocumentOpen] = useState(false);
  const [documentToView, setDocumentToView] = useState(null);

  useEffect(() => {
    fetchPendingPartners();
  }, []);

  const fetchPendingPartners = async () => {
    try {
      const response = await axios.get(`${API}/admin/partners/pending`);
      setPendingPartners(response.data);
    } catch (error) {
      toast.error('Erreur lors du chargement des demandes');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (partnerId) => {
    try {
      await axios.post(`${API}/admin/partners/${partnerId}/approve`);
      toast.success('Partenaire approuvé avec succès !');
      fetchPendingPartners();
      setSelectedPartner(null);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur lors de l\'approbation');
    }
  };

  const handleReject = async (partnerId, reason = '') => {
    try {
      await axios.post(`${API}/admin/partners/${partnerId}/reject?reason=${encodeURIComponent(reason)}`);
      toast.success('Demande rejetée');
      fetchPendingPartners();
      setSelectedPartner(null);
    } catch (error) {
      toast.error('Erreur lors du rejet');
    }
  };

  const viewDocument = async (partner, docType) => {
    try {
      let docName = '';
      if (docType === 'id_recto') {
        docName = 'Pièce d\'identité (Recto)';
      } else if (docType === 'id_verso') {
        docName = 'Pièce d\'identité (Verso)';
      } else if (docType === 'che_kbis') {
        docName = 'CHE/KBIS';
      }

      // Load document on-demand from API
      const response = await axios.get(`${API}/admin/partners/${partner.id}/document/${docType}`);
      setDocumentToView({ data: response.data.document, name: docName });
      setViewDocumentOpen(true);
    } catch (error) {
      toast.error('Erreur lors du chargement du document');
    }
  };

  if (loading) {
    return <div className="text-center py-12">Chargement...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Demandes de partenariat en attente</h2>
        <p className="text-gray-600">Examinez et validez les demandes des cordonniers</p>
      </div>

      {pendingPartners.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <p className="text-gray-600">Aucune demande en attente</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {pendingPartners.map((partner) => (
            <Card key={partner.id} className="border-amber-200">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{partner.name}</CardTitle>
                    <p className="text-sm text-gray-600">{partner.email}</p>
                    <p className="text-sm text-gray-600">{partner.phone}</p>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Adresse de l'atelier :</p>
                    <p className="text-sm text-gray-600">{partner.address}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700">IBAN :</p>
                    <p className="text-sm text-gray-600">{partner.bank_account}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Documents :</p>
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => viewDocument(partner, 'id_recto')}
                        className="text-xs"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        ID Recto
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => viewDocument(partner, 'id_verso')}
                        className="text-xs"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        ID Verso
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => viewDocument(partner, 'che_kbis')}
                        className="text-xs"
                      >
                        <FileText className="w-3 h-3 mr-1" />
                        CHE/KBIS
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      onClick={() => handleApprove(partner.id)}
                      className="bg-green-600 hover:bg-green-700 text-white flex-1"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approuver
                    </Button>
                    <Button
                      onClick={() => handleReject(partner.id, 'Documents non conformes')}
                      variant="destructive"
                      className="flex-1"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Rejeter
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Document Viewer Dialog */}
      <Dialog open={viewDocumentOpen} onOpenChange={setViewDocumentOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{documentToView?.name}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {documentToView?.data && (
              <img
                src={`data:image/jpeg;base64,${documentToView.data}`}
                alt={documentToView.name}
                className="w-full h-auto max-h-[70vh] object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
