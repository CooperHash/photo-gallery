import React, { useState, ChangeEvent, KeyboardEvent } from 'react';
import { useUser, useSupabaseClient, Session } from '@supabase/auth-helpers-react'
import { Database } from '../utils/database'
import { Button, ButtonGroup } from '@chakra-ui/react'
interface AddCategoryProps {
  categories: string[];
  setCategories: (categories: string[]) => void;
  galleryId: string;
}

const AddCategory: React.FC<AddCategoryProps> = ({ categories, setCategories, galleryId }) => {
  
  const [inputValue, setInputValue] = useState('');
  const supabase = useSupabaseClient<Database>();

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      updateCategory();
    }
  };

  const updateCategory = async () => {
    // 执行更新操作，例如向后端发送请求更新数据库
    try {
      // 假设你使用 supabase 客户端进行更新操作      
      setCategories([...categories, '，',inputValue.trim()]);
      console.log([...categories, '，',inputValue.trim()]);
      

      const { data, error } = await supabase
        .from('galleries')
        .update({ category: [...categories, '，',inputValue.trim()].join('') })
        .eq('id', galleryId);

      if (error) {
        throw error;
      }

      // 更新成功后更新状态或执行其他操作
      
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className=' flex flex-row h-[20px]'>
      <div className='flex space-x-1'>
        {categories.map((category, index) => (
          <div key={index} className="category bg-blue-200 justify-center items-center">
            {category}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={inputValue}
        className='border-[1px] border-black ml-1'
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
      />
      <Button colorScheme='blue' className='bg-blue-100'>save</Button>
    </div>
  );
};

export default AddCategory;
