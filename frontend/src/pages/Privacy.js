import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-white">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="px-4 py-3 flex items-center max-w-md mx-auto">
          <Link to="/">
            <Button variant="ghost" size="icon" className="-ml-2">
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </Button>
          </Link>
          <h1 className="text-lg font-bold text-gray-900 ml-2">Confidentialité</h1>
        </div>
      </header>

      <div className="pt-16 pb-8 px-4 max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Politique de Confidentialité</h2>
        <p className="text-sm text-gray-600 mb-6">Conformé au RGPD</p>

        <div className="space-y-6 text-sm text-gray-700">
          <section>
            <h3 className="font-bold text-gray-900 mb-2">1. Données Collectées</h3>
            <p>Nous collectons les données suivantes :</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Clients :</strong> Nom, email, adresse, téléphone</li>
              <li><strong>Cordonniers :</strong> Pièces d'identité, CHE/KBIS, coordonnées bancaires</li>
              <li><strong>Commandes :</strong> Photos de chaussures, notes, historique</li>
              <li><strong>Géolocalisation :</strong> Pour attribution automatique</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-gray-900 mb-2">2. Utilisation des Données</h3>
            <p>Vos données sont utilisées pour :</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Traiter vos commandes</li>
              <li>Attribuer automatiquement au cordonnier le plus proche</li>
              <li>Effectuer les paiements via Stripe Connect</li>
              <li>Communiquer sur l'état de votre commande</li>
              <li>Améliorer nos services</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-gray-900 mb-2">3. Partage des Données</h3>
            <p>Vos données sont partagées uniquement avec :</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Le cordonnier assigné à votre commande</li>
              <li>Stripe (processeur de paiement sécurisé)</li>
              <li>Services de livraison</li>
            </ul>
            <p className="mt-2">Nous ne vendons jamais vos données à des tiers.</p>
          </section>

          <section>
            <h3 className="font-bold text-gray-900 mb-2">4. Sécurité</h3>
            <p>Nous mettons en œuvre des mesures techniques et organisationnelles pour protéger vos données :</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Chiffrement SSL/TLS</li>
              <li>Stockage sécurisé des mots de passe (bcrypt)</li>
              <li>Serveurs hébergés en Europe</li>
              <li>Accès restreint aux données</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-gray-900 mb-2">5. Vos Droits (RGPD)</h3>
            <p>Vous disposez des droits suivants :</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Accès :</strong> Consulter vos données</li>
              <li><strong>Rectification :</strong> Corriger vos données</li>
              <li><strong>Suppression :</strong> Demander l'effacement</li>
              <li><strong>Portabilité :</strong> Recevoir vos données</li>
              <li><strong>Opposition :</strong> Refuser le traitement</li>
            </ul>
            <p className="mt-2">Pour exercer vos droits : <a href="mailto:privacy@shoerepair.com" className="text-orange-700 underline">privacy@shoerepair.com</a></p>
          </section>

          <section>
            <h3 className="font-bold text-gray-900 mb-2">6. Cookies</h3>
            <p>Nous utilisons des cookies essentiels pour le fonctionnement de l'application (authentification, panier). Aucun cookie publicitaire.</p>
          </section>

          <section>
            <h3 className="font-bold text-gray-900 mb-2">7. Conservation des Données</h3>
            <p>Vos données sont conservées :</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Pendant la durée d'utilisation du service</li>
              <li>3 ans après la dernière activité</li>
              <li>Obligations légales : jusqu'à 10 ans (comptabilité)</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-gray-900 mb-2">8. Contact DPO</h3>
            <p>Délégué à la Protection des Données :<br/>
            Email : <a href="mailto:dpo@shoerepair.com" className="text-orange-700 underline">dpo@shoerepair.com</a></p>
          </section>
        </div>
      </div>
    </div>
  );
}
