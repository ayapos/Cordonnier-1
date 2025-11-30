import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function Legal() {
  return (
    <div className="min-h-screen bg-white">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="px-4 py-3 flex items-center max-w-md mx-auto">
          <Link to="/">
            <Button variant="ghost" size="icon" className="-ml-2">
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </Button>
          </Link>
          <h1 className="text-lg font-bold text-gray-900 ml-2">Mentions Légales</h1>
        </div>
      </header>

      <div className="pt-16 pb-8 px-4 max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Mentions Légales</h2>

        <div className="space-y-6 text-sm text-gray-700">
          <section>
            <h3 className="font-bold text-gray-900 mb-2">Éditeur</h3>
            <p>
              ShoeRepair<br/>
              [Adresse complète]<br/>
              [Code postal] [Ville]<br/>
              [Pays]
            </p>
            <p className="mt-2">
              Email : <a href="mailto:contact@shoerepair.com" className="text-orange-700 underline">contact@shoerepair.com</a><br/>
              Téléphone : [Numéro]
            </p>
          </section>

          <section>
            <h3 className="font-bold text-gray-900 mb-2">Directeur de Publication</h3>
            <p>[Nom du directeur]</p>
          </section>

          <section>
            <h3 className="font-bold text-gray-900 mb-2">Hébergement</h3>
            <p>
              [Nom de l'hébergeur]<br/>
              [Adresse]<br/>
              [Code postal] [Ville]<br/>
              Téléphone : [Numéro]
            </p>
          </section>

          <section>
            <h3 className="font-bold text-gray-900 mb-2">Numéro d'Identification</h3>
            <p>
              SIRET : [Numéro SIRET]<br/>
              TVA Intracommunautaire : [Numéro TVA]<br/>
              RCS : [Numéro RCS]
            </p>
          </section>

          <section>
            <h3 className="font-bold text-gray-900 mb-2">Propriété Intellectuelle</h3>
            <p>L'ensemble du contenu de cette application (textes, images, vidéos, logos) est protégé par le droit d'auteur. Toute reproduction non autorisée est interdite.</p>
          </section>

          <section>
            <h3 className="font-bold text-gray-900 mb-2">Crédits</h3>
            <p>
              Images : Unsplash, Pexels<br/>
              Icons : Lucide React<br/>
              Développement : ShoeRepair Team
            </p>
          </section>

          <section>
            <h3 className="font-bold text-gray-900 mb-2">Liens Hypertextes</h3>
            <p>Les liens hypertextes présents sur l'application peuvent renvoyer vers des sites tiers. Nous ne sommes pas responsables du contenu de ces sites.</p>
          </section>

          <section>
            <h3 className="font-bold text-gray-900 mb-2">Litiges</h3>
            <p>En cas de litige, les tribunaux français sont compétents. Droit applicable : Droit français.</p>
          </section>

          <section className="bg-orange-50 p-4 rounded-xl">
            <h3 className="font-bold text-gray-900 mb-2">Médiation</h3>
            <p>Conformément à l'article L. 612-1 du Code de la consommation, nous proposons un dispositif de médiation de la consommation.</p>
            <p className="mt-2">
              Médiateur : [Nom du médiateur]<br/>
              Site : [URL du médiateur]
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
