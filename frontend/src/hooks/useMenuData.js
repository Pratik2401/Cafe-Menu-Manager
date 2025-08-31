import { useState, useEffect, useCallback } from 'react';
import { 
  getAllCategories, 
  getAllSubCategories, 
  getAllItems, 
  getAllSizes, 
  getAllVariations, 
  getFoodCategories, 
  getCafeSettings, 
  getAllEvents, 
  getAllImageUploads 
} from '../api/customer';

export const useMenuData = () => {
  const [data, setData] = useState({
    categories: [],
    subCategories: [],
    items: [],
    sizes: [],
    variations: [],
    foodCategories: [],
    cafeSettings: null,
    events: [],
    imageUploads: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch all data in parallel
      const [
        categoriesRes,
        subCategoriesRes,
        itemsRes,
        sizesRes,
        variationsRes,
        foodCategoriesRes,
        cafeSettingsRes,
        eventsRes,
        imageUploadsRes
      ] = await Promise.all([
        getAllCategories(),
        getAllSubCategories(),
        getAllItems(),
        getAllSizes(),
        getAllVariations().catch(() => ({ data: [] })), // Handle if variations endpoint fails
        getFoodCategories(),
        getCafeSettings(),
        getAllEvents({ active: true }).catch(() => ({ data: [] })),
        getAllImageUploads().catch(() => ({ data: [] }))
      ]);

      // Process and normalize data
      const categories = Array.isArray(categoriesRes.data) 
        ? categoriesRes.data 
        : (categoriesRes.data?.categories || []);
      
      const subCategories = subCategoriesRes.data || [];
      const items = Array.isArray(itemsRes.data) ? itemsRes.data : [];
      const sizes = Array.isArray(sizesRes.data) ? sizesRes.data : (sizesRes.data?.data || []);
      const variations = Array.isArray(variationsRes.data) ? variationsRes.data : (variationsRes.data?.data || []);
      const foodCategories = foodCategoriesRes.data || [];
      const cafeSettings = cafeSettingsRes.data;
      
      // Filter active events with valid images
      const now = new Date();
      const activeEvents = (eventsRes.data || []).filter(event => {
        const endDate = new Date(event.endDate);
        const hasValidImage = event.promotionalImageUrl && event.promotionalImageUrl.trim() !== '';
        return event.isActive && now <= endDate && hasValidImage;
      });

      const imageUploads = imageUploadsRes.data || [];

      // Group subcategories by category for easy lookup
      const subCategoriesGrouped = {};
      subCategories.forEach(subCategory => {
        const categoryId = subCategory.category?.serialId || subCategory.categoryId;
        if (categoryId !== undefined) {
          if (!subCategoriesGrouped[categoryId]) {
            subCategoriesGrouped[categoryId] = [];
          }
          subCategoriesGrouped[categoryId].push(subCategory);
        }
      });

      setData({
        categories,
        subCategories,
        subCategoriesGrouped,
        items,
        sizes,
        variations,
        foodCategories,
        cafeSettings,
        events: activeEvents,
        imageUploads
      });
    } catch (err) {
      console.error('Error fetching menu data:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  return { data, loading, error, refetch: fetchAllData };
};