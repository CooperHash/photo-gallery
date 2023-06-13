import { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid';
import { useUser, useSupabaseClient, Session } from '@supabase/auth-helpers-react'
import { Database } from '../utils/database'
import { Button, ButtonGroup } from '@chakra-ui/react'
import Link from 'next/link';
import { useBoolean } from '@chakra-ui/react'
import AddCategory from '../components/AddCategory'
type Galleries = Database['public']['Tables']['galleries']['Row'];
type UserGalleries = Database['public']['Tables']['user_galleries']['Row'];
type Images = Database['public']['Tables']['images']['Row'];
type Profiles = Database['public']['Tables']['profiles']['Row']

const MeGallery = () => {
  const [flag, setFlag] = useBoolean()
  const [targetIndex, setTargetIndex] = useState<number>(-1)
  const supabase = useSupabaseClient<Database>()
  const [list, setList] = useState<Galleries[]>([])
  const [userid, setUserid] = useState<Profiles['id']>('')
  const user = useUser()!
  const [categories, setCategories] = useState<string[]>([]);
  async function getAllGallery(userId: string) {
    try {
      // 获取所有的gallery_id
      const { data: userGalleries, error: userGalleriesError } = await supabase
        .from('user_galleries')
        .select('gallery_id')
        .eq('user_id', userId);
      if (userGalleriesError) {
        throw userGalleriesError;
      }

      // 获取所有的图库信息
      const { data: galleries, error: galleriesError } = await supabase
        .from('galleries')
        .select('*')
        .in('id', userGalleries.map(ug => ug.gallery_id));
      if (galleriesError) {
        throw galleriesError;
      }
      if (galleries) {
        setList(galleries)
      }
      console.log('fetch allgallery');

      console.log(galleries);
    } catch (error) {
      console.log(error);
    }
  }

  const addGallery = async () => {
    const galleryId = uuidv4()
    try {
      const { data, error } = await supabase
        .from('galleries') // 这里假设你有一个 Gallery 类型定义
        .insert([{ id: galleryId, name: 'new gallery', category: 'new category' }])
      if (error) {
        throw error
      }
      await supabase
        .from('user_galleries') // 这里假设你有一个 UserGallery 类型定义
        .insert([{ id: uuidv4(), user_id: user.id, gallery_id: galleryId }])
      getAllGallery(user.id)
    } catch (error) {
      console.log(error);
    }
  }

  const editCategory = (index: number, category: string) => {
    setCategories(category.split(','))
    console.log(categories);

    setFlag.off()
    setTargetIndex(index)
  }


  useEffect(() => {
    setFlag.on()
    getAllGallery(user.id)
  }, [user.id])


  return (
    <>
      <div className='flex'>
        <div className='w-[120px]'>
          <Button colorScheme='blue' size='lg' onClick={addGallery} className='bg-blue-200 w-full'>
            add
          </Button>
        </div>
        <div className='grid grid-cols-4 gap-4 w-[1000px]'>
          {list ? list.map((item, index) => {
            return (
              <Link key={index} href={`/gallery/${item.id}`}>
                <div className='bg-red-200 w-[200px] h-[300px] hover:cursor-pointer rounded-xl p-4'>
                  <div className='mb-2 tracking-wide text-lg'>{item.name}</div>
                  {index != targetIndex && <span
                    className=' p-2 hover:cursor-pointer'
                    onClick={(event) => {
                      event.stopPropagation(); // 停止事件冒泡
                      editCategory(index, item.category);
                    }}
                  >
                    {item.category.split('，').map((category, index) => (
                      <span key={index} className='mr-2 bg-orange-50'>
                        {category}
                      </span>
                    ))}
                  </span>}
                  {index === targetIndex && <div onClick={(event) => event.stopPropagation()}>
                    <AddCategory categories={categories} setCategories={setCategories} galleryId={item.id} />
                  </div>}
                </div>
              </Link>
            )
          }) : <div>nothing</div>}
        </div>
      </div>
    </>
  )
}

export default MeGallery
