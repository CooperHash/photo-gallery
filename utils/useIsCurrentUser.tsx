import { useRouter } from 'next/router';
import { useUser, useSupabaseClient, Session } from '@supabase/auth-helpers-react'
import { Database } from './database'
const useIsCurrentUser = async (): Promise<boolean> => {
  const supabase = useSupabaseClient<Database>()
  const router = useRouter();
  const { id } = router.query;
  const user = useUser();
  
  const isCurrentUser = async (): Promise<boolean> => {
    if (!user || !id) {
      return false;
    }
    
    const { data, error } = await supabase
      .from('user_galleries')
      .select('user_id')
      .eq('gallery_id', id)
      .limit(1);

    if (error) {
      console.error(error);
      return false;
    }
    
    return data?.length > 0 && data[0].user_id === user.id;
  };

  return await isCurrentUser();
};

export default useIsCurrentUser;
