import { type FC } from "react";
import { type Data, gameModes } from "~/pages";

import crypto from "crypto";

import html2canvas from "html2canvas";

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
      scoreText = `I scored a streak of ${correct} DeGods influencers in PFPGuessr`;
    }
    if (gameMode === gameModes.TIMER) {
      scoreText = `I guessed ${correct}/10 CT DeGods in PFPGuessr on ${diff} difficulty!`;
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

    window.open(tweetUrl);
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
