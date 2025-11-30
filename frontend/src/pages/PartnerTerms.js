import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function PartnerTerms() {
  return (
    <div className="min-h-screen bg-white">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="px-4 py-3 flex items-center max-w-md mx-auto">
          <Link to="/become-partner">
            <Button variant="ghost" size="icon" className="-ml-2">
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </Button>
          </Link>
          <h1 className="text-lg font-bold text-gray-900 ml-2">CGU Partenaires</h1>
        </div>
      </header>

      <div className="pt-16 pb-8 px-4 max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Conditions Générales Partenaires</h2>
        <p className="text-sm text-gray-600 mb-6">Dernière mise à jour : Janvier 2025</p>

        <div className="space-y-6 text-sm text-gray-700">
          <section>
            <h3 className="font-bold text-gray-900 mb-2">1. Objet du Partenariat</h3>
            <p>Les présentes Conditions Générales régissent la relation entre ShoeRepair et les artisans cordonniers partenaires. En vous inscrivant, vous acceptez de fournir des services de réparation de chaussures de qualité professionnelle.</p>
          </section>

          <section>
            <h3 className="font-bold text-gray-900 mb-2">2. Conditions d'Inscription</h3>
            <p>Pour devenir partenaire, vous devez :</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Être un professionnel enregistré (CHE ou KBIS)</li>
              <li>Fournir une pièce d'identité valide (recto/verso)</li>
              <li>Disposer d'un compte bancaire professionnel (IBAN)</li>
              <li>Avoir une adresse d'atelier fixe pour la géolocalisation</li>
              <li>Accepter les présentes conditions</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-gray-900 mb-2">3. Validation du Compte</h3>
            <p>Votre demande sera examinée sous 48h ouvrées. Nous vérifions :</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>L'authenticité des documents fournis</li>
              <li>La validité du numéro CHE/KBIS</li>
              <li>Les coordonnées bancaires</li>
              <li>Votre expérience professionnelle</li>
            </ul>
            <p className="mt-2">Nous nous réservons le droit de refuser toute demande sans justification.</p>
          </section>

          <section>
            <h3 className="font-bold text-gray-900 mb-2">4. Attribution Automatique</h3>
            <p>Les commandes vous sont attribuées automatiquement selon :</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Votre localisation géographique (proximité client)</li>
              <li>Votre disponibilité</li>
              <li>Votre taux d'acceptation des commandes</li>
              <li>Vos évaluations clients</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-gray-900 mb-2">5. Obligations du Partenaire</h3>
            <p>Vous vous engagez à :</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Accepter ou refuser les commandes dans les 24h</li>
              <li>Respecter les délais indiqués (Standard 10j / Express 72h)</li>
              <li>Effectuer un travail de qualité professionnelle</li>
              <li>Communiquer avec les clients si nécessaire</li>
              <li>Signaler tout problème ou retard</li>
              <li>Retourner les chaussures réparées dans les délais</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-gray-900 mb-2">6. Rémunération</h3>
            <p><strong>Commission plateforme : 15%</strong></p>
            <p className="mt-2">Exemple : Service à 50€</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Client paie : 50€ + frais livraison</li>
              <li>Vous recevez : 42,50€ (50€ - 15%)</li>
              <li>ShoeRepair prélève : 7,50€</li>
            </ul>
            <p className="mt-2"><strong>Paiement :</strong> Virement automatique tous les lundis via Stripe Connect pour les commandes livrées la semaine précédente.</p>
          </section>

          <section>
            <h3 className="font-bold text-gray-900 mb-2">7. Frais de Livraison</h3>
            <p>Les frais de livraison sont supportés par le client :</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Standard (10j) : 5€</li>
              <li>Express (72h) : 15€</li>
            </ul>
            <p className="mt-2">Vous devez expédier les chaussures réparées via le service de livraison indiqué.</p>
          </section>

          <section>
            <h3 className="font-bold text-gray-900 mb-2">8. Qualité et Garantie</h3>
            <p>Vous garantissez :</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Un travail conforme aux standards professionnels</li>
              <li>L'utilisation de matériaux de qualité</li>
              <li>Une garantie de 6 mois sur vos réparations</li>
            </ul>
            <p className="mt-2">En cas de malfagon, vous devez refaire la réparation gratuitement.</p>
          </section>

          <section>
            <h3 className="font-bold text-gray-900 mb-2">9. Évaluations</h3>
            <p>Les clients peuvent noter votre travail (1-5 étoiles). Une note moyenne inférieure à 3/5 peut entraîner la suspension de votre compte.</p>
          </section>

          <section>
            <h3 className="font-bold text-gray-900 mb-2">10. Suspension et Résiliation</h3>
            <p>Nous pouvons suspendre ou résilier votre compte en cas de :</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Non-respect des délais répété</li>
              <li>Mauvaises évaluations clients</li>
              <li>Travail de mauvaise qualité</li>
              <li>Non-respect des présentes conditions</li>
              <li>Fraude ou fausse déclaration</li>
            </ul>
            <p className="mt-2">Vous pouvez résilier votre partenariat à tout moment avec un préavis de 30 jours.</p>
          </section>

          <section>
            <h3 className="font-bold text-gray-900 mb-2">11. Assurance</h3>
            <p>Vous devez disposer d'une assurance responsabilité civile professionnelle couvrant vos activités de réparation.</p>
          </section>

          <section>
            <h3 className="font-bold text-gray-900 mb-2">12. Confidentialité</h3>
            <p>Vous vous engagez à :</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Ne pas utiliser les données clients à d'autres fins</li>
              <li>Respecter le RGPD</li>
              <li>Ne pas contacter les clients en dehors de la plateforme</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-gray-900 mb-2">13. Modifications</h3>
            <p>ShoeRepair se réserve le droit de modifier les présentes conditions. Vous serez informé par email 30 jours avant toute modification.</p>
          </section>

          <section>
            <h3 className="font-bold text-gray-900 mb-2">14. Contact</h3>
            <p>Pour toute question : <a href="mailto:partners@shoerepair.com" className="text-orange-700 underline">partners@shoerepair.com</a></p>
          </section>

          <div className="bg-orange-50 p-4 rounded-xl mt-6">
            <p className="font-bold text-gray-900 mb-2">⚠️ Important</p>
            <p className="text-sm">En cochant la case "J'accepte les CGU Partenaires" lors de votre inscription, vous reconnaissez avoir lu, compris et accepté l'intégralité de ces conditions. Votre signature électronique sera enregistrée avec horodatage.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
