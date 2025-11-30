import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function Terms() {
  return (
    <div className="min-h-screen bg-white">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="px-4 py-3 flex items-center max-w-md mx-auto">
          <Link to="/">
            <Button variant="ghost" size="icon" className="-ml-2">
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </Button>
          </Link>
          <h1 className="text-lg font-bold text-gray-900 ml-2">CGU</h1>
        </div>
      </header>

      <div className="pt-16 pb-8 px-4 max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Conditions Générales d'Utilisation</h2>
        <p className="text-sm text-gray-600 mb-6">Dernière mise à jour : Janvier 2025</p>

        <div className="space-y-6 text-sm text-gray-700">
          <section>
            <h3 className="font-bold text-gray-900 mb-2">1. Objet</h3>
            <p>Les présentes Conditions Générales d'Utilisation (CGU) régissent l'utilisation de la plateforme ShoeRepair, un service de mise en relation entre clients et cordonniers professionnels.</p>
          </section>

          <section>
            <h3 className="font-bold text-gray-900 mb-2">2. Services Proposés</h3>
            <p>ShoeRepair permet aux clients de commander des services de réparation de chaussures et assure l'attribution automatique au cordonnier le plus proche. Les services incluent :</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Réparation et ressemelage</li>
              <li>Entretien et rénovation</li>
              <li>Ajustements et modifications</li>
              <li>Livraison à domicile (standard ou express)</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-gray-900 mb-2">3. Inscription et Compte</h3>
            <p>Pour utiliser nos services, vous devez créer un compte en fournissant des informations exactes et complètes. Vous êtes responsable de la confidentialité de vos identifiants.</p>
          </section>

          <section>
            <h3 className="font-bold text-gray-900 mb-2">4. Commandes et Paiement</h3>
            <p>Les commandes sont confirmées après paiement sécurisé via Stripe. Le prix affiché inclut :</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Le coût du service de réparation</li>
              <li>Les frais de livraison (selon l'option choisie)</li>
              <li>La TVA applicable</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-gray-900 mb-2">5. Attribution Automatique</h3>
            <p>Votre commande est automatiquement assignée au cordonnier le plus proche de votre adresse. L'attribution est basée sur la géolocalisation et la disponibilité.</p>
          </section>

          <section>
            <h3 className="font-bold text-gray-900 mb-2">6. Livraison</h3>
            <p><strong>Standard :</strong> 10 jours ouvrables maximum (5€)<br/>
            <strong>Express :</strong> 72 heures (15€)</p>
            <p className="mt-2">Les délais sont indicatifs et dépendent de la complexité de la réparation.</p>
          </section>

          <section>
            <h3 className="font-bold text-gray-900 mb-2">7. Annulation et Remboursement</h3>
            <p>Vous pouvez annuler une commande avant que le cordonnier ne l'accepte. Une fois la réparation commencée, aucun remboursement n'est possible sauf en cas de vice du service.</p>
          </section>

          <section>
            <h3 className="font-bold text-gray-900 mb-2">8. Responsabilités</h3>
            <p>ShoeRepair agit en qualité d'intermédiaire. Nous ne sommes pas responsables de la qualité des réparations effectuées par les cordonniers, mais nous garantissons leur sélection rigoureuse et leur professionnalisme.</p>
          </section>

          <section>
            <h3 className="font-bold text-gray-900 mb-2">9. Données Personnelles</h3>
            <p>Vos données sont traitées conformément à notre Politique de Confidentialité et au RGPD.</p>
          </section>

          <section>
            <h3 className="font-bold text-gray-900 mb-2">10. Modification des CGU</h3>
            <p>Nous nous réservons le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés par email.</p>
          </section>

          <section>
            <h3 className="font-bold text-gray-900 mb-2">11. Contact</h3>
            <p>Pour toute question : <a href="mailto:contact@shoerepair.com" className="text-orange-700 underline">contact@shoerepair.com</a></p>
          </section>
        </div>
      </div>
    </div>
  );
}
