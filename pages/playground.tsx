import { useState, useEffect } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { Database } from "../utils/database";
import Image from 'next/image';
import Link from 'next/link';

const PlayGround = () => {
  const [storageUrl, setStorageUrl] = useState("");
  const supabase = useSupabaseClient<Database>();
  const [profileList, setProfileList] = useState<Database["public"]["Tables"]["profiles"]["Row"][]>([]);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const { data, error } = await supabase.from("profiles").select("*");
        if (error) {
          throw error;
        }
        if (data) {
          console.log(data);
          const res = data.map((item,index) => {
            return {
              ...item,
              avatar_url: `https://iqzjxazfvgomsvoydbyf.supabase.co/storage/v1/object/public/avatars/${String(item.avatar_url)}`
            }
          })
          setProfileList(res);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchProfiles();
  }, []);



  return (
    <>
      {/* Render the profile list */}
      {profileList.map((profile) => (
        <div key={profile.id} className="bg-blue-200 mt-4 w-[200px] flex">
          <Link href={`/galleryground?id=${profile.id}`}>
            <a>
              <Image src={String(profile.avatar_url)} alt="avatar" className="rounded-full" width={50} height={50}/>
              <p>{profile.username}</p>
            </a>
          </Link>
        </div>
      ))}
    </>
  );
};
//https://iqzjxazfvgomsvoydbyf.supabase.co/storage/v1/object/public/galleryimage/
export default PlayGround;
