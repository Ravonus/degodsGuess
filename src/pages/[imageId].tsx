import { type GetServerSideProps } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import Footer from "~/components/Footer";
import axios from "axios";

import { api } from "~/utils/api";

interface ImagePageProps {
  imageUrl: string;
}

interface MyData {
  tokens: {
    token: {
      tokenId: string;
      image: string;
      contract: string;
      collection: {
        name: string;
      };
    };
  }[];
  continuation?: string;
}

interface MyResponse {
  data: MyData;
}

const ImagePage: React.FC<ImagePageProps> = ({
  imageUrl
}) => {
  const [newSrc, setNewSrc] = useState<string | undefined>(undefined);

  // const NFT = api.nft.getNFT.useQuery({
  //   address: contract,
  //   tokenId,
  //   isMatic: matic === "true",
  // });

  //use effect to set body gradient color
  useEffect(() => {
    const body = document.querySelector("body");
    if (body) {
      body.classList.add("bg-gradient-to-b", "from-[#313131]", "to-[#000]");
      body.style.backgroundImage = "none";
      body.style.backgroundColor = "#000";
    }
  }, []);


  useEffect(() => {
    //redirect to home page
    const redirect = () => {
      window.location.href = "/";
    };
    redirect();
  }
  , []);



  return (
    <div>
      <Head>
        <title>PFPGuessr</title>
        <meta name="description" content="Can you guess popular CT PFPs." />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={imageUrl} />
        <meta
          name="twitter:url"
          content="https://main--fabulous-heliotrope-b6df16.netlify.app/"
        />
        <meta name="twitter:title" content={`Can you guess popular CT PFPs.`} />
        <meta
          name="twitter:description"
          content={`A fun game to guess Crypto Twitter PFPs.`}
        />
        <meta property="og:image" content={`${imageUrl}.png`} />
        <meta property="og:url" content="https://pfpguessr.com" />
        <meta property="og:title" content={`Can you guess popular CT PFPs.`} />
        <meta
          property="og:description"
          content={`A fun game to guess Crypto Twitter PFPs.`}
        />

        {/* Other meta tags as needed */}
      </Head>
      <main className="sm:h-100 h-min-screen flex  flex-col items-center bg-gradient-to-b from-[#313131] to-[#000]">

      </main>
    </div>
  );
};

export default ImagePage;

// Your logic to get the image URL by ID
const getImageUrlById = (imageId: string): string => {
  // Replace with the actual logic to get the image URL
  return `https://res.cloudinary.com/doaxhxkmq/image/upload/v1692002576/${imageId}`;
};

export const getServerSideProps: GetServerSideProps<ImagePageProps> = async (
  context
) => {
  const imageId = context.params?.imageId as string;

  const imageUrl = getImageUrlById(imageId);



  return Promise.resolve({
    props: {
      imageUrl,
    },
  });
};
