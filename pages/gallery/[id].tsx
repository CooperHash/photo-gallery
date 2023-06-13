import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Button, ButtonGroup } from '@chakra-ui/react'
import { Session, User, useSupabaseClient, useUser, useSession } from '@supabase/auth-helpers-react'
import { Database } from '../../utils/database'
import { v4 as uuidv4 } from 'uuid';
import Image from 'next/image';


const Gallery = () => {
  const supabase = useSupabaseClient<Database>()
  const router = useRouter();
  const { id } = router.query;
  const [images, setImages] = useState<string[]>([]);
  const [isCurrentUser, setIsCurrentUser] = useState<boolean>(false);

  const [uploading, setUploading] = useState(false)
  const [image, setImage] = useState('')
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    // 根据图库ID获取所有的图像数据
    iCurrentUser()
    if (id) {
      fetchImages();
    }
  }, [id]);

  if (!id) {
    return null;
  }

  async function iCurrentUser() {
    const userid = localStorage.getItem('id')
    const { data, error } = await supabase
      .from('user_galleries')
      .select('user_id')
      .eq('gallery_id', id)
      .limit(1);
      console.log('user_id',data)
      
      

    if (error) {
      console.error(error);
      return false;
    }

    setIsCurrentUser(data?.length > 0 && data[0].user_id === userid);
  }

  const fetchImages = async () => {
    // 发起请求获取图像数据，并更新状态
    // ...
    try {
      const { data, error } = await supabase
        .from('images')
        .select('url')
        .eq('gallery_id', id);

      if (error) {
        console.error(error);
        return;
      }
      const imageUrls = data.map(item => item.url);
      console.log(imageUrls);

      setImages(imageUrls);

    } catch (error) {
      console.error(error);
    }

  };


  const uploadAvatar: React.ChangeEventHandler<HTMLInputElement> = async (event) => {
    try {
      setUploading(true)

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.')
      }
      const randomString = Math.random().toString(36).substring(2, 8);
      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const fileName = `${id}_${randomString}.${fileExt}`;
      const filePath = `${fileName}`

      let { error: uploadError } = await supabase.storage
        .from('galleryimage')
        .upload(filePath, file, { upsert: true })

      if (uploadError) {
        throw uploadError
      }

      const imageId = uuidv4()
      const imageUrl = await supabase.storage
        .from('galleryimage')
        .getPublicUrl(filePath)

      console.log(imageUrl.data.publicUrl)


      const { data: insertedImage, error: insertError } = await supabase
        .from('images')
        .insert([{ id: imageId, gallery_id: String(id), url: imageUrl.data.publicUrl }])

      // onUpload(filePath)
      updateGallery()
      fetchImages()
    } catch (error) {
      alert('Error uploading avatar!')
      console.log(error)
    } finally {
      setUploading(false)
    }
  }

  const handleMouseEnter = (index: number) => {
    setHoveredIndex(index);
    setTimeout(() => {
      console.log('enter', index, hoveredIndex);

    }, 500)
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
    setTimeout(() => {
      console.log('enter', hoveredIndex);

    }, 500)
  };



  const save = async (url: string) => {
    try {
      const defaultGalleryId = localStorage.getItem('userId');

      if (!defaultGalleryId) {
        throw new Error('Default gallery ID not found in local storage.');
      }

      const imageId = uuidv4();

      // 将图片保存到指定的图库中
      const { data: insertedImage, error: insertError } = await supabase
        .from('images')
        .insert([{ id: imageId, gallery_id: defaultGalleryId, url: url }]);

      if (insertError) {
        throw insertError;
      }

      // 更新成功后进行其他操作或显示提示信息
      console.log('Image saved successfully!');
    } catch (error) {
      console.error('Error saving image:', error);
    }
  };

  const updateGallery = async () => {
  }



  return (
    <div>
      <h1>Gallery ID: {id}</h1>
      <div style={{ width: '100px' }}>
        <label className="button primary block" htmlFor="single">
          {uploading ? 'Uploading ...' : 'Upload'}
        </label>
        <input
          style={{
            visibility: 'hidden',
            position: 'absolute',
          }}
          type="file"
          id="single"
          accept="image/*"
          onChange={uploadAvatar}
          disabled={uploading}
        />
      </div>
      {/* 渲染图像列表 */}
      {images ? (
        <div className="grid grid-cols-4 gap-4">
          {images.map((url, index) => (
            <div key={index} className="aspect-w-16 aspect-h-9 flex flex-col" onMouseEnter={() => handleMouseEnter(index)}
              onMouseLeave={handleMouseLeave}>
              <Image src={url} alt="Gallery Image" width={390} height={200} objectFit="cover" />
              {!isCurrentUser && (
                <Button colorScheme='blue' onClick={() => save(url)}>save</Button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div>nothing</div>
      )}
    </div>
  );
};

export default Gallery;
