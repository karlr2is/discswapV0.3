import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { t, translateCategoryName } from '../utils/translations';
import { ArrowLeft, Upload, X } from 'lucide-react';

type CreateListingPageProps = {
  onBack: () => void;
  onSuccess: () => void;
  editListingId?: string;
};

type Category = {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
};

const CONDITIONS = [
  { value: 'New', labelKey: 'conditionNew', score: 10 },
  { value: 'Like New', labelKey: 'conditionLikeNew', score: 9 },
  { value: 'Excellent', labelKey: 'conditionExcellent', score: 8 },
  { value: 'Very Good', labelKey: 'conditionVeryGood', score: 7 },
  { value: 'Good', labelKey: 'conditionGood', score: 6 },
  { value: 'Fair', labelKey: 'conditionFair', score: 5 },
  { value: 'Used', labelKey: 'conditionUsed', score: 4 },
  { value: 'Heavily Used', labelKey: 'conditionHeavilyUsed', score: 3 },
];

export function CreateListingPage({ onBack, onSuccess, editListingId }: CreateListingPageProps) {
  const { user } = useAuth();
  const { language } = useSettings();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [listingType, setListingType] = useState<'for_sale' | 'wanted'>('for_sale');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category_id: '',
    condition: '',
    condition_score: '',
    location: '',
    images: [] as string[],
  });

  const [uploadingImages, setUploadingImages] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  useEffect(() => {
    fetchCategories();
    if (editListingId) {
      fetchExistingListing();
    } else {
      // Reset form when opening create listing
      setFormData({
        title: '',
        description: '',
        price: '',
        category_id: '',
        condition: '',
        condition_score: '',
        location: '',
        images: [],
      });
      setImageFiles([]);
      setListingType('for_sale');
    }
  }, [editListingId]);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .not('parent_id', 'is', null)
      .order('name');
    if (data) setCategories(data);
  };

  const fetchExistingListing = async () => {
    if (!editListingId) return;
    const { data } = await supabase
      .from('listings').select('*').eq('id', editListingId).maybeSingle();
    if (data) {
      setListingType(data.listing_type);
      setFormData({
        title:          data.title || '',
        description:    data.description || '',
        price:          data.price != null ? String(data.price) : '',
        category_id:    data.category_id || '',
        condition:      data.condition || '',
        condition_score: data.condition_score != null ? String(data.condition_score) : '',
        location:       data.location || '',
        images:         data.images || [],
      });
    }
  };

  const handleConditionChange = (value: string) => {
    const condition = CONDITIONS.find(c => c.value === value);
    setFormData({
      ...formData,
      condition: value,
      condition_score: condition ? condition.score.toString() : '',
    });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setImageFiles([...imageFiles, ...newFiles]);
    }
  };

  const handleImageRemove = (index: number) => {
    setImageFiles(imageFiles.filter((_, i) => i !== index));
  };

  const uploadImages = async (): Promise<string[]> => {
    if (imageFiles.length === 0) return [];

    setUploadingImages(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of imageFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `listings/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('listing-images')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          continue;
        }

        const { data } = supabase.storage
          .from('listing-images')
          .getPublicUrl(filePath);

        uploadedUrls.push(data.publicUrl);
      }
    } finally {
      setUploadingImages(false);
    }

    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    const imageUrls = await uploadImages();

    const payload = {
      title:           formData.title,
      description:     formData.description || null,
      price:           formData.price ? parseFloat(formData.price) : null,
      category_id:     formData.category_id || null,
      condition:       formData.condition || null,
      condition_score: formData.condition_score ? parseInt(formData.condition_score) : null,
      location:        formData.location || null,
      listing_type:    listingType,
      images:          imageUrls.length > 0 ? imageUrls : (formData.images || []),
    };

    let error;
    if (editListingId) {
      ({ error } = await supabase.from('listings').update(payload).eq('id', editListingId));
    } else {
      ({ error } = await supabase.from('listings').insert({ ...payload, user_id: user.id, status: 'active' }));
    }

    setLoading(false);

    if (!error) {
      // Reset form after successful submission
      setFormData({
        title: '',
        description: '',
        price: '',
        category_id: '',
        condition: '',
        condition_score: '',
        location: '',
        images: [],
      });
      setImageFiles([]);
      setListingType('for_sale');
      onSuccess();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 dark:text-white" />
          </button>
          <h1 className="text-lg font-semibold dark:text-white">
            {editListingId ? t('editListing', language) : t('createListing', language)}
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 pb-20">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('listingType', language)}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setListingType('for_sale')}
                className={`py-3 px-4 rounded-lg border-2 font-medium transition-colors ${
                  listingType === 'for_sale'
                    ? 'border-blue-600 bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
                    : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                {t('forSale', language)}
              </button>
              <button
                type="button"
                onClick={() => setListingType('wanted')}
                className={`py-3 px-4 rounded-lg border-2 font-medium transition-colors ${
                  listingType === 'wanted'
                    ? 'border-blue-600 bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
                    : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                {t('wanted', language)}
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('title', language)}
              </label>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('description', language)}
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('category', language)}
              </label>
              <select
                id="category"
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">{t('selectCategory', language)}</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {translateCategoryName(cat.name, language)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="condition" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('condition', language)}
              </label>
              <select
                id="condition"
                value={formData.condition}
                onChange={(e) => handleConditionChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">{t('selectCondition', language)}</option>
                {CONDITIONS.map((cond) => (
                  <option key={cond.value} value={cond.value}>
                    {t(cond.labelKey, language)} ({cond.score}/10)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('price', language)}
              </label>
              <input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t('pricePlaceholder', language)}
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('location', language)}
              </label>
              <input
                id="location"
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t('locationPlaceholder', language)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('images', language)}
              </label>
              <div className="space-y-3">
                {imageFiles.length > 0 && (
                  <div className="grid grid-cols-3 gap-3">
                    {imageFiles.map((file, index) => (
                      <div key={index} className="relative bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center" style={{aspectRatio: '1'}}>
                        <img
                          src={URL.createObjectURL(file)}
                          alt=""
                          className="w-full h-full object-contain rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => handleImageRemove(index)}
                          className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <label className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 cursor-pointer">
                  <Upload className="w-5 h-5" />
                  <span>{t('images', language)}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    multiple
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || uploadingImages || !formData.title}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading || uploadingImages
                ? t('creating', language)
                : editListingId ? t('saveChanges', language) : t('createListing', language)}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
