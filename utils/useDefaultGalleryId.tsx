import { useEffect, useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '../utils/database';

export const useDefaultGalleryId = (userId: string): string | null => {
  const supabase = useSupabaseClient<Database>();
  const [defaultGalleryId, setDefaultGalleryId] = useState<string | null>(null);

  useEffect(() => {
    const fetchDefaultGalleryId = async () => {
      try {
        // 尝试从LocalStorage获取默认图库ID
        const storedDefaultGalleryId = localStorage.getItem(userId);

        if (storedDefaultGalleryId) {
          setDefaultGalleryId(storedDefaultGalleryId);
          return;
        }

        // 获取当前用户的所有图库ID
        const { data: userGalleries, error: userGalleriesError } = await supabase
          .from('user_galleries')
          .select('gallery_id')
          .eq('user_id', userId);

        if (userGalleriesError) {
          throw userGalleriesError;
        }

        // 在"galleries"数据表中筛选名称为"收藏"的图库ID
        const { data: galleriesWithDefault, error: galleriesError } = await supabase
          .from('galleries')
          .select('id')
          .eq('name', '收藏');

        if (galleriesError) {
          throw galleriesError;
        }

        // 将图库ID数组转换为字符串集合
        const galleryIdsWithDefault = galleriesWithDefault.map((gallery) => gallery.id);
        const userGalleryIds = userGalleries.map((userGallery) => userGallery.gallery_id);

        // 通过比较用户图库ID和具有"收藏"名称的图库ID，找到匹配的图库ID
        const matchedGalleryId = userGalleryIds.find((galleryId) =>
          galleryIdsWithDefault.includes(galleryId)
        );

        const defaultGalleryId = matchedGalleryId || null;

        

        setDefaultGalleryId(defaultGalleryId);
      } catch (error) {
        console.error('Error fetching default gallery ID:', error);
      }
    };

    if (userId) {
      fetchDefaultGalleryId();
    }
  }, [supabase, userId]);

  return defaultGalleryId;
};
