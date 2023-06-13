import type { NextPage } from 'next'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import Account from '../components/Account'
import Head from 'next/head'
import Image from 'next/image'
import MeGallery from '../components/MeGallery'
import PlayGround from './playground'
import Link from 'next/link'
import { useEffect } from 'react'
import { AuthSession } from '@supabase/supabase-js'
import { useUser} from '@supabase/auth-helpers-react'
import { v4 as uuidv4 } from 'uuid';
import AddCategory from '../components/AddCategory'
import { useState } from 'react'


const Home: NextPage = () => {
  const session = useSession()!
  const user = useUser()!
  const supabase = useSupabaseClient()
  const [categories, setCategories] = useState<string[]>([]);


  useEffect(() => {
    // 用户注册成功后执行以下逻辑

    const handleRegistration = async (session: AuthSession) => {
      if (session.user?.id) {
        const defaultGalleryName = '收藏';

        try {
          // 查询当前用户的 user_galleries 表，获取所有的 gallery_id
          const { data: userGalleries, error: userGalleriesError } = await supabase
            .from('user_galleries')
            .select('gallery_id')
            .eq('user_id', session.user.id);

          if (userGalleriesError) {
            throw userGalleriesError;
          }

          // 判断是否存在名为 "收藏" 的默认图库
          const { data: galleriesWithDefault, error: galleriesError } = await supabase
            .from('galleries')
            .select('id')
            .eq('name', defaultGalleryName)

          // 将 gallery_id 数组和默认图库 id 数组进行比对
          // 提取 galleriesWithDefault 数组中的 id
          const galleriesWithDefaultIds = galleriesWithDefault?.map(item => item.id) || [];

          // 判断是否存在名为 "收藏" 的默认图库
          const hasDefaultGallery = userGalleries.some(gallery => galleriesWithDefaultIds.includes(gallery.gallery_id));


          if (!hasDefaultGallery) {
            const galleryId = uuidv4();

            const { error: insertError } = await supabase
              .from('galleries')
              .insert([{ id: galleryId, name: defaultGalleryName, category: '各种各样' }]);

            if (insertError) {
              throw insertError;
            }

            await supabase
              .from('user_galleries')
              .insert([{ id: uuidv4(), user_id: session.user.id, gallery_id: galleryId }]);
          }
        } catch (error) {
          console.log(error);
        }
      }
    };

    if (session) {
      handleRegistration(session);
    }


  })
  return (
    <div className="container mx-auto mt-12" >
      {!session ? (
        <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} />
      ) : (
        <div>
          <div>
            <Link href="/playground" className='bg-blue-200'>
              <a>Playground</a>
            </Link>
          </div>
          <div className='flex'>
            <Account session={session} />
            <MeGallery />
          </div>
        </div>
      )}
    </div>
  )
}

export default Home
