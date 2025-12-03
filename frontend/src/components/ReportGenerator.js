import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, Calendar, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function ReportGenerator({ userRole }) {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [selectedMonth, setSelectedMonth] = useState(currentMonth.toString());
  const [reportType, setReportType] = useState('monthly');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = [
    { value: '1', label: 'Janvier' },
    { value: '2', label: 'Février' },
    { value: '3', label: 'Mars' },
    { value: '4', label: 'Avril' },
    { value: '5', label: 'Mai' },
    { value: '6', label: 'Juin' },
    { value: '7', label: 'Juillet' },
    { value: '8', label: 'Août' },
    { value: '9', label: 'Septembre' },
    { value: '10', label: 'Octobre' },
    { value: '11', label: 'Novembre' },
    { value: '12', label: 'Décembre' }
  ];

  const generateReport = async () => {
    setLoading(true);
    try {
      const params = {
        year: selectedYear,
        ...(reportType === 'monthly' && { month: selectedMonth })
      };

      const response = await axios.get(`${API}/reports/${reportType}`, { params });
      setReportData(response.data);
      toast.success('Rapport généré avec succès!');
    } catch (error) {
      toast.error('Erreur lors de la génération du rapport');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    if (!reportData) return;

    const csv = convertToCSV(reportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const filename = reportType === 'monthly' 
      ? `rapport_${selectedYear}_${selectedMonth.padStart(2, '0')}.csv`
      : `rapport_${selectedYear}.csv`;
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Rapport téléchargé!');
  };

  const convertToCSV = (data) => {
    const headers = Object.keys(data.summary || data).join(',');
    const values = Object.values(data.summary || data).join(',');
    
    let csv = 'Rapport de Comptabilité\n\n';
    csv += 'Période,' + (reportType === 'monthly' 
      ? `${months.find(m => m.value === selectedMonth)?.label} ${selectedYear}` 
      : selectedYear) + '\n\n';
    
    csv += headers + '\n';
    csv += values + '\n\n';
    
    if (data.orders && data.orders.length > 0) {
      csv += '\nDétail des Commandes\n';
      csv += 'Date,Référence,Montant,Commission,Statut\n';
      data.orders.forEach(order => {
        csv += `${order.date},${order.reference},${order.amount},${order.commission || 0},${order.status}\n`;
      });
    }
    
    return csv;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Rapports Comptables</h2>
        <p className="text-gray-600">Générez des rapports mensuels ou annuels pour votre comptabilité</p>
      </div>

      {/* Selection Panel */}
      <Card className="border-amber-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-950">
            <Calendar className="w-5 h-5" />
            Générer un Rapport
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Type de rapport */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Type de rapport
              </label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Mensuel</SelectItem>
                  <SelectItem value="yearly">Annuel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Année */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Année
              </label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map(year => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Mois */}
            {reportType === 'monthly' && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Mois
                </label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map(month => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <Button 
            onClick={generateReport} 
            disabled={loading}
            className="w-full bg-amber-700 hover:bg-amber-800"
          >
            <FileText className="w-4 h-4 mr-2" />
            {loading ? 'Génération...' : 'Générer le Rapport'}
          </Button>
        </CardContent>
      </Card>

      {/* Report Display */}
      {reportData && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-green-900">
                  Rapport {reportType === 'monthly' ? 'Mensuel' : 'Annuel'}
                </CardTitle>
                <p className="text-sm text-green-700 mt-1">
                  Période: {reportType === 'monthly' 
                    ? `${months.find(m => m.value === selectedMonth)?.label} ${selectedYear}`
                    : selectedYear
                  }
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={downloadCSV}
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                Télécharger CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Commandes</p>
                    <p className="text-2xl font-bold text-green-900">
                      {reportData.summary?.total_orders || 0}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Revenus Total</p>
                    <p className="text-2xl font-bold text-green-900">
                      {reportData.summary?.total_revenue?.toFixed(2) || '0.00'} CHF
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
              </div>

              {userRole === 'admin' && (
                <>
                  <div className="bg-white rounded-lg p-4 border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Commission (15%)</p>
                        <p className="text-2xl font-bold text-green-900">
                          {reportData.summary?.total_commission?.toFixed(2) || '0.00'} CHF
                        </p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-amber-600" />
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Versements Partenaires</p>
                        <p className="text-2xl font-bold text-green-900">
                          {reportData.summary?.cobbler_payments?.toFixed(2) || '0.00'} CHF
                        </p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-blue-600" />
                    </div>
                  </div>
                </>
              )}

              {userRole === 'cobbler' && (
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Vos Gains</p>
                      <p className="text-2xl font-bold text-green-900">
                        {reportData.summary?.cobbler_earnings?.toFixed(2) || '0.00'} CHF
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
              )}
            </div>

            {/* Orders Table */}
            {reportData.orders && reportData.orders.length > 0 && (
              <div className="bg-white rounded-lg border border-green-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-green-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-green-900 uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-green-900 uppercase">Référence</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-green-900 uppercase">Montant</th>
                        {userRole === 'admin' && (
                          <th className="px-4 py-3 text-right text-xs font-semibold text-green-900 uppercase">Commission</th>
                        )}
                        <th className="px-4 py-3 text-center text-xs font-semibold text-green-900 uppercase">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-green-100">
                      {reportData.orders.slice(0, 10).map((order, idx) => (
                        <tr key={idx} className="hover:bg-green-50">
                          <td className="px-4 py-3 text-sm text-gray-700">{order.date}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{order.reference}</td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">{order.amount.toFixed(2)} CHF</td>
                          {userRole === 'admin' && (
                            <td className="px-4 py-3 text-sm text-right text-amber-700">{order.commission?.toFixed(2) || '0.00'} CHF</td>
                          )}
                          <td className="px-4 py-3 text-center">
                            <span className="px-2 py-1 text-xs rounded-full bg-green-200 text-green-800">
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {reportData.orders.length > 10 && (
                  <div className="px-4 py-3 bg-green-50 text-sm text-green-700 text-center">
                    Affichage des 10 premières commandes sur {reportData.orders.length}. 
                    Téléchargez le CSV pour voir toutes les données.
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
