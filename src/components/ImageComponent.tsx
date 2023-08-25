import React, { useState, useEffect } from "react";
import axios from "axios";
import { getImageUrlById } from '~/pages/[imageId]';

function ImageComponent({ imageId }: { imageId?: string }) {
  const [imageUrl, setImageUrl] = useState("/aore.png"); // Default to error image

  useEffect(() => {
    async function checkImageValid() {
      if (!imageId) return;

      const url = getImageUrlById(imageId);

      try {
        const res = await axios.get(url);
        if (res.status === 200) {
          setImageUrl(url);
        }
      } catch (err) {
        // You can handle/log the error here if necessary
      }
    }

    checkImageValid().catch((err) => console.log(err));
  }, [imageId]); // This effect will run whenever imageId changes

  return (
    <img
      alt="NFT"
      src={imageUrl}
      className="rounded border-2 border-gray-500 shadow-xl transition duration-500 hover:scale-110 hover:border-gray-600"
    />
  );
}


export default ImageComponent;
