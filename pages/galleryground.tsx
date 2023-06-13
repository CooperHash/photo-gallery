import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSupabaseClient} from "@supabase/auth-helpers-react";
import { Database } from "../utils/database";
import Link from "next/link";


const GalleryGround = () => {
  const supabase = useSupabaseClient<Database>();
  const router = useRouter();
  const { id } = router.query;
  const [galleries, setGalleries] = useState<Database["public"]["Tables"]["galleries"]["Row"][]>([]);

  useEffect(() => {
    const fetchGalleries = async () => {
      try {
        // Fetch the gallery IDs for the specific user
        const { data: userGalleries, error: userGalleriesError } = await supabase
          .from("user_galleries")
          .select("gallery_id")
          .eq("user_id", id);

        if (userGalleriesError) {
          throw userGalleriesError;
        }

        if (userGalleries) {
          // Extract the gallery IDs from the result
          const galleryIds = userGalleries.map((row) => row.gallery_id);

          // Fetch the gallery data using the IDs
          const { data: galleries, error: galleriesError } = await supabase
            .from("galleries")
            .select("*")
            .in("id", galleryIds);

          if (galleriesError) {
            throw galleriesError;
          }

          if (galleries) {
            setGalleries(galleries);
          }
        }
      } catch (error) {
        console.error(error);
      }
    };

    if (id) {
      fetchGalleries();
    }
  }, [id]);


  return (
    <div className="grid grid-cols-4 gap-4">
      {galleries.map((gallery) => (
        <Link key={gallery.id} href={`/gallery/${gallery.id}`}>
          <div className="bg-red-200 w-[260px] h-[420px] hover:cursor-pointer">
            <div>{gallery.name}</div>
            <div>{gallery.category}</div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default GalleryGround;
