import { type FC } from "react";
import { type Data, gameModes } from "~/pages";

import crypto from "crypto";

import html2canvas from "html2canvas";
import { toast } from 'react-toastify';

interface TwitterShareProps {
  answers: {
    correct: number;
    incorrect: number;
  };
  gameMode: string;
  defaultCount: number;
  lastAnswers: Data[];
}

const TwitterShare: FC<TwitterShareProps> = ({
  answers,
  gameMode,
  defaultCount,
  lastAnswers,
}) => {
  const convertDivToPNG = async () => {
    const divElement = document.querySelector("#lastAnswers") as HTMLElement;

    //add gradient bg

    if (!divElement) return;

    divElement?.classList.add(
      "bg-gradient-to-b",
      "from-[#313131]",
      "to-[#000]"
    );

    // Convert div to canvas
    const canvas = await html2canvas(divElement, {
      useCORS: true,
      scale: 1,
    });

    // Convert canvas to PNG and download it
    const link = document.createElement("a");
    const src = canvas.toDataURL("image/png");

    const id = await handleUploadToCloudinary(src).catch((err) =>
      console.log(err)
    );
    return id;
  };

  const handleUploadToCloudinary = async (simplifiedImageSrc: string) => {
    if (!simplifiedImageSrc) return; // Ensure the source is available

    const formData = new FormData();
    const hash = generateHash(simplifiedImageSrc);
    formData.append("file", simplifiedImageSrc);
    formData.append("upload_preset", "jvddav02");
    formData.append("public_id", hash);
    //generate filename based on hash of image

    try {
      const response = await fetch(
        "https://api.cloudinary.com/v1_1/doaxhxkmq/image/upload",
        { method: "POST", body: formData }
      );

      const data = (await response.json()) as {
        secure_url: string;
        public_id: string;
      };
      const public_id = data.public_id;

      return public_id;

      // You can use the secureUrl here, such as saving it to your server or updating the state
    } catch (error) {
      console.error("Failed to upload image", error);
    }
  };

  function generateHash(data: string) {
    return crypto.createHash("sha256").update(data).digest("hex");
  }

  function isInAppBrowser() {
    const ua = window.navigator.userAgent;

    // Facebook in-app browser detection
    const isFacebookApp = ua.indexOf("FBAN") > -1 || ua.indexOf("FBAV") > -1;

    // Instagram in-app browser detection
    const isInstagramApp = ua.indexOf("Instagram") > -1;

    // Twitter in-app browser detection
    const isTwitterApp = ua.indexOf("Twitter") > -1;

    // Snapchat in-app browser detection
    const isSnapchatApp = ua.indexOf("Snapchat") > -1;

    return isFacebookApp || isInstagramApp || isTwitterApp || isSnapchatApp;
  }

  function isIOS() {
    const ua = window.navigator.userAgent;
    return /iPad|iPhone|iPod/.test(ua);
  }

  const shareScoreOnTwitter = async () => {
    const id = await convertDivToPNG().catch((err) => console.log(err));

    console.log();

    const correct = `${answers.correct}`;
    const incorrect = `${answers.incorrect}`;

    const appLink = `https://pfpguessr.com/${id || ""}`;

    const createdBy = "@R4vonus";

    const diff =
      defaultCount === 30
        ? "Noob"
        : defaultCount === 8
        ? "Easy"
        : defaultCount === 5
        ? "Medium"
        : "Hard";
    let scoreText = "";

    if (gameMode === gameModes.STREAK) {
      scoreText = `I scored a streak of ${correct} CT influencers in PFPGuessr`;
    }
    if (gameMode === gameModes.TIMER) {
      scoreText = `I guessed ${correct}/10 CT influencers in PFPGuessr on ${diff} difficulty!`;
    }

    //find one incorrect answer
    let found = false;
    lastAnswers.forEach((answer) => {
      if (found) return;
      if (answer.correct === false) {
        found = true;
        scoreText += `\n\n I couldn't even get @${answer.username} correct. `;
        return;
      }
    });

    const tweetUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(
      scoreText + `\n\n Created by ${createdBy}\n ${appLink}`
    )}`;

    const twitterLink = document.getElementById(
      "twitterShareLink"
    ) as HTMLAnchorElement;
    twitterLink.href = tweetUrl;
    if (isIOS() && isInAppBrowser()) {
      //need to copy to clipboard and tell user to paste (or open in safari)
      navigator.clipboard.writeText(tweetUrl).catch((err) => console.log(err));
      toast("Can't open browser, either open site in native browser. Link copied to clipboard.");
    } else if (
      (window.navigator as unknown as { standalone: string }).standalone
    ) {
      window.open(tweetUrl, "_blank");
    } else twitterLink.click();
  };

  return (
    <button
      className="-mt-8 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
      onClick={() => {
        shareScoreOnTwitter().catch((err) => console.log(err));
      }}
    >
      Share on Twitter
    </button>
  );
};

export default TwitterShare;
