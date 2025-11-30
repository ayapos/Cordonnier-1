import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Trash2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const categories = [
  { value: 'carousel', label: 'Carousel (Slides page d\'accueil)' },
  { value: 'services', label: 'Services (Images de services)' },
  { value: 'gallery', label: 'Galerie (Avant/Après)' },
  { value: 'other', label: 'Autre' }
];

export default function MediaManager() {
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('carousel');
  const [filterCategory, setFilterCategory] = useState('all');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [title, setTitle] = useState('');
  const [position, setPosition] = useState('');

  useEffect(() => {
    fetchMedia();
  }, [filterCategory]);

  const fetchMedia = async () => {
    try {
      const url = filterCategory === 'all' 
        ? `${API}/admin/media` 
        : `${API}/admin/media?category=${filterCategory}`;
      const response = await axios.get(url);
      setMediaList(response.data);
    } catch (error) {
      toast.error('Erreur lors du chargement des médias');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Veuillez sélectionner une image');
        return;
      }
      
      if (file.size > 50 * 1024 * 1024) {
        toast.error('L\'image ne doit pas dépasser 50 MB');
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Veuillez sélectionner un fichier');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('category', selectedCategory);
      if (title) formData.append('title', title);
      if (position) formData.append('position', position);

      await axios.post(`${API}/admin/media/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Image uploadée avec succès !');
      setSelectedFile(null);
      setPreviewUrl(null);
      setTitle('');
      setPosition('');
      fetchMedia();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (mediaId, filename) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette image ?')) {
      return;
    }

    try {
      await axios.delete(`${API}/admin/media/${mediaId}`);
      toast.success('Image supprimée');
      fetchMedia();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const groupedMedia = mediaList.reduce((acc, media) => {
    if (!acc[media.category]) {
      acc[media.category] = [];
    }
    acc[media.category].push(media);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Gestion des Médias</h2>
        <p className="text-gray-600">Gérez les images du carousel, services, galerie et autres</p>
      </div>

      {/* Upload Section */}
      <Card className="border-amber-200">
        <CardHeader>
          <CardTitle className="text-lg">Upload une nouvelle image</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Catégorie</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="file-upload">Sélectionner une image</Label>
              <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-orange-500 transition-colors mt-2">
                <Upload className="w-5 h-5 text-gray-600" />
                <span className="text-sm text-gray-600">
                  {selectedFile ? selectedFile.name : 'Cliquez pour sélectionner'}
                </span>
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Titre / Description (optionnel)</Label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Slide 1 - Escarpins"
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <Label htmlFor="position">Position (optionnel)</Label>
              <input
                id="position"
                type="number"
                min="1"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="Ex: 1 pour première position"
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Pour le carousel: 1, 2, 3...
              </p>
            </div>
          </div>

          {previewUrl && (
            <div className="mt-4">
              <Label>Aperçu :</Label>
              <div className="mt-2">
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="max-w-full h-48 object-cover rounded-lg border"
                />
              </div>
            </div>
          )}

          <Button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="w-full bg-amber-700 hover:bg-amber-800"
          >
            {uploading ? 'Upload en cours...' : 'Upload l\'image'}
          </Button>
        </CardContent>
      </Card>

      {/* Filter Section */}
      <div className="flex items-center gap-4">
        <Label>Filtrer par catégorie :</Label>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Media List */}
      {loading ? (
        <div className="text-center py-12">Chargement...</div>
      ) : mediaList.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">Aucune image uploadée</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedMedia).map(([category, medias]) => (
            <Card key={category} className="border-amber-200">
              <CardHeader>
                <CardTitle className="text-lg">
                  {categories.find(c => c.value === category)?.label || category}
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({medias.length} image{medias.length > 1 ? 's' : ''})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {medias
                    .sort((a, b) => (a.position || 999) - (b.position || 999))
                    .map((media) => (
                    <div key={media.id} className="relative group">
                      {media.position && (
                        <div className="absolute top-2 left-2 bg-orange-600 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
                          #{media.position}
                        </div>
                      )}
                      <img
                        src={`${BACKEND_URL}${media.url}`}
                        alt={media.title || media.original_name}
                        className="w-full h-40 object-cover rounded-lg border"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center">
                        <Button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDelete(media.id, media.filename);
                          }}
                          variant="destructive"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Supprimer
                        </Button>
                      </div>
                      {media.title && (
                        <p className="text-xs font-semibold text-gray-800 mt-1 truncate" title={media.title}>
                          {media.title}
                        </p>
                      )}
                      <p className="text-xs text-gray-600 truncate" title={media.original_name}>
                        {media.original_name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(media.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Info Box */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="text-sm text-gray-700">
            <p className="font-medium mb-2">💡 Comment utiliser les images :</p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Carousel :</strong> Pour changer les slides de la page d'accueil (3 images recommandées)</li>
              <li><strong>Services :</strong> Images pour illustrer vos services de réparation</li>
              <li><strong>Galerie :</strong> Photos avant/après des réparations</li>
              <li><strong>Formats acceptés :</strong> JPG, PNG, WEBP (max 50 MB)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
