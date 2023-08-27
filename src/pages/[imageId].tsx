import { type GetServerSideProps } from "next";
import Head from "next/head";

import { ReactElement, useCallback, useEffect, useState } from "react";
import Footer from "~/components/Footer";

import dataM from "~/../public/data_mayc.json";
import dataB from "~/../public/data_bayc.json";

import { type Data, gameModes, type UserVotes } from "~/pages";

import { ToastContainer, toast } from "react-toastify";
import { CogIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/router";

import TwitterShare from "~/components/TwitterShare";
import axios from "axios";
import ImageComponent from "~/components/ImageComponent";
import Sidebar from "~/components/Sidebar";
import SideInfo from "~/components/SideInfo";

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

const ImagePage: React.FC<ImagePageProps> = ({ imageUrl }) => {
  const [nftData, setNftData] = useState<Data>();
  const [answers, setAnswers] = useState({
    correct: 0,
    incorrect: 0,
  });
  const [countdown, setCountdown] = useState(5);
  const [gameStatus, setGameStatus] = useState("notStarted"); // or "inProgress" or "finished"
  const [currentRound, setCurrentRound] = useState(0);
  const [roundInProgress, setRoundInProgress] = useState(false);
  const [shouldStartCountdown, setShouldStartCountdown] = useState(false);
  const [restart, setRestart] = useState(false);
  const [gameMode, setGameMode] = useState(gameModes.TIMER); // new state to set game mode, default is TIMER
  const [open, setOpen] = useState<boolean>(false);
  const [multipleChoice, setMultipleChoice] = useState<Data[]>([]); // array of 4 random nfts to choose from

  const [azukiVotes, setAzukiVotes] = useState(0);
  const [elementalVotes, setElementalVotes] = useState(0);

  const [userVotes, setUserVotes] = useState<UserVotes>({});

  const [defaultCount, setDefaultCount] = useState(0);

  const [lastIncorrect, setLastIncorrect] = useState("");

  const [lastAnswers, setLastAnswers] = useState<Data[]>([]);

  const [azukiWidth, setAzukiWidth] = useState(100);
  const [elementalWidth, setElementalWidth] = useState(100);
  const [bayc, setBayc] = useState(true);
  const [mayc, setMayc] = useState(true);

  const [imageLoaded, setImageLoaded] = useState(false);

  //get id of image (url param)

  const splitUrl = imageUrl.split("/");
  const imageId = splitUrl[splitUrl.length - 1];

  const router = useRouter();

  const twitch = router.query.twitch ? router.query.twitch : false;
  
  const requestNFT = useCallback(() => {
    //setCountdown(defaultCount);

    // if (roundInProgress) return;
    // setRoundInProgress(true);
    setImageLoaded(false);
    if (gameStatus !== "inProgress") return;

    setShouldStartCountdown(false);
    if (
      (currentRound < 10 && gameMode === gameModes.TIMER) ||
      gameMode === gameModes.STREAK
    ) {
      setCurrentRound((prevRound) => prevRound + 1);
    } else if (gameMode === gameModes.TIMER) {
      setGameStatus("finished");
      setCountdown(0);
      toast.success("Game finished!");
      setShouldStartCountdown(false);
      setRoundInProgress(false);

      //set nftData.data undefined

      setNftData(undefined);
    }
  }, [
    currentRound,
    gameMode,
    gameStatus,
    roundInProgress,
    twitch,
    defaultCount,
    lastIncorrect,
    lastAnswers,
    multipleChoice,
    answers,
    userVotes,
    azukiVotes,
    elementalVotes,
    bayc,
    mayc,
    azukiWidth,
    elementalWidth,
    imageLoaded,
    nftData,
  ]);
  // async function randomDeGod(noCheck = false): Promise<Data> {
  const randomDeGod = useCallback(
    async (noCheck = false): Promise<Data> => {
      let count: number | undefined;

      switch (defaultCount) {
        case 3:
          count = undefined;
          break;
        case 5:
          count = 150;
          break;
        default:
          count = 75;
          break;
      }

      let data: Data[] = [];

      if (bayc && mayc) {
        //we gotta combine them one at a time so the ranking of each collection is still orders so loop through each one picking a new one from each > until one is empty adn then add the rest of the other one

        let i = 0;
        let j = 0;

        while (i < dataB.length && j < dataM.length) {
          data.push(dataB[i] as unknown as Data);
          data.push(dataM[j] as unknown as Data);
          i++;
          j++;
        }

        while (i < dataB.length) {
          data.push(dataB[i] as unknown as Data);
          i++;
        }

        while (j < dataM.length) {
          data.push(dataM[j] as unknown as Data);
          j++;
        }
      } else if (bayc) {
        data = [...dataB];
      } else if (mayc) {
        data = [...dataM];
      }

      const num = count !== undefined ? Number(count) : data.length;

      let god: Data;
      if (!noCheck) {
        let foundGod: boolean;
        do {
          god = data[Math.floor(Math.random() * num)] as unknown as Data;
          foundGod = lastAnswers.some((answer) => answer.name === god.name);

          if (foundGod) {
            await new Promise((resolve) => setTimeout(resolve, 0)); // wait for next event loop
          }
        } while (foundGod);
      } else {
        god = data[Math.floor(Math.random() * num)] as unknown as Data;
      }

      return god;
    },

    [bayc, defaultCount, lastAnswers, mayc]
  );

  useEffect(() => {
    const totalVotes = azukiVotes + elementalVotes;
    setAzukiWidth(totalVotes > 0 ? (azukiVotes / totalVotes) * 100 : 0);
    setElementalWidth(totalVotes > 0 ? (elementalVotes / totalVotes) * 100 : 0);
  }, [azukiVotes, elementalVotes]);

  useEffect(() => {
    if (twitch) return;
    setDefaultCount(5);
    setCountdown(5);
    setShouldStartCountdown(true);
    setGameStatus("notStarted");
  }, [gameMode, twitch]);

  useEffect(() => {
    if (!twitch) {
      setCountdown(5);
      setDefaultCount(5);
    } else {
      setCountdown(20);
      setDefaultCount(20);
    }
    setShouldStartCountdown(true);
  }, [twitch]);

  useEffect(() => {
    //first remvoe listener

    if (gameStatus !== "inProgress") return;
  }, [userVotes, gameStatus]);

  useEffect(() => {
    let countdownTimer: NodeJS.Timeout;
    if (
      gameStatus === "inProgress" &&
      !twitch &&
      gameMode !== gameModes.STREAK
    ) {
      countdownTimer = setInterval(() => {
        setRoundInProgress(true);
        setCountdown((prevCountdown) => {
          if (prevCountdown === 0) {
            clearInterval(countdownTimer);
            return 0;
          }
          return prevCountdown - 1;
        });
      }, 1000);
    }
    return () => {
      clearInterval(countdownTimer);
    };
  }, [gameMode, gameStatus, twitch]);

  useEffect(() => {
    if (gameStatus !== "inProgress") return;

    if (countdown < 1 && shouldStartCountdown && roundInProgress) {
      setAnswers((prev) => ({ ...prev, incorrect: prev.incorrect + 1 }));
      setShouldStartCountdown(false);
      setRoundInProgress(false);
      requestNFT();
    }
  }, [
    gameStatus,
    countdown,
    shouldStartCountdown,
    roundInProgress,
    requestNFT,
  ]);

  useEffect(() => {
    if (currentRound === 0) {
      //   setLastAnswers([]);
      return;
    }
    (async () => {
      setShouldStartCountdown(true);

      // Get random gods for multiple choice without checking previous answers
      const godOne = await randomDeGod(true);
      const godTwo = await randomDeGod(true);
      const godThree = await randomDeGod(true);
      const godFour = await randomDeGod(true);

      let randomGods: Data[] = [];
      switch (defaultCount) {
        case 3:
          randomGods = [godOne, godTwo, godThree, godFour];
          break;
        case 5:
          randomGods = [godOne, godTwo, godThree];
          break;
        default:
          randomGods = [godOne, godTwo];
          break;
      }

      setMultipleChoice(randomGods);

      // Get a distinct right answer, ensuring it's not already present in multiple choice
      let selectedGod: Data;
      do {
        selectedGod = await randomDeGod();
      } while (randomGods.some((god) => god.name === selectedGod.name));

      // Shuffle randomGods and replace one random element with the right answer
      const selectedIndex = Math.floor(Math.random() * randomGods.length);
      randomGods[selectedIndex] = selectedGod;

      setMultipleChoice(randomGods); // Update the multiple choice with shuffled options
      setNftData(selectedGod); // Set the correct answer
    })().catch(console.error);
  }, [currentRound, defaultCount, randomDeGod]);

  useEffect(() => {
    if (restart) requestNFT();
    setRestart(false);
  }, [restart, requestNFT]);

  useEffect(() => {
      setCountdown(defaultCount);
  }, [imageLoaded, defaultCount]);

  const handleGuess = (username: string) => {
    console.log("handle guess", currentRound, gameMode);
    if (currentRound > 10 && gameMode === gameModes.TIMER) {
      setGameStatus("finished");
      setCountdown(0);
      setShouldStartCountdown(false);
      setCurrentRound(0);

      return;
    }
    if (!nftData) return;

    setRoundInProgress(true); // Start a round

    const nftAnswer = {
      ...nftData,
      correct: false,
    };

    if (username === nftData.name) {
      nftAnswer.correct = true;
      toast.success(`Correct - ${nftData.name}`, {
        autoClose: 500,
      });

      setAnswers((prev) => ({ ...prev, correct: prev.correct + 1 }));
    } else {
      toast.error(nftData.name, {
        autoClose: 500,
      });

      setAnswers((prev) => ({ ...prev, incorrect: prev.incorrect + 1 }));

      setLastIncorrect(nftData.image);

      // If game mode is STREAK and the answer is incorrect, finish the game
      if (gameMode === gameModes.STREAK) {
        setGameStatus("finished");
        setCountdown(0);
        toast.success("Game finished!");
        setNftData(undefined);
        return;
      }
    }
    setLastAnswers((prev) => [...prev, nftAnswer]);
    setRoundInProgress(false);
    setShouldStartCountdown(false);
    setCurrentRound((prev) => prev + 1);
    setCountdown(0);
    setImageLoaded(false);
   // setCountdown(defaultCount);
    /// await new Promise((resolve) => setTimeout(resolve, 500)); // Wait 0.5 seconds before requesting a new NFT
    // requestNFT();
  };

  function setDifficulty(diff: number) {
    setDefaultCount(diff);
  }



  return (
    <div>
      <Head>
        <title>PFPGuessr</title>
        <meta name="description" content="Can you guess popular CT PFPs." />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={imageUrl} />
        <meta name="twitter:url" content="https://pfpguessr.com" />
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
      <a
        id="twitterShareLink"
        href="#"
        target="_blank"
        style={{ display: "none" }}
      ></a>
      <Sidebar setOpen={setOpen} open={open}>
        <SideInfo
          mayc={mayc}
          bayc={bayc}
          setMayc={setMayc}
          setBayc={setBayc}
          diffculty={defaultCount}
          gameStatus={gameStatus}
          setDifficulty={setDifficulty}
          setGameMode={setGameMode}
          twitch={twitch}
        />
      </Sidebar>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#313131]  to-[#000]">
        <ToastContainer />

        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-2 ">
          <div className="absolute right-0 top-0 m-8 flex cursor-pointer flex-row justify-end gap-4">
            <CogIcon
              className="h-12 w-12 transform text-white transition duration-500 ease-in-out hover:scale-110 hover:text-gray-400"
              onClick={() => setOpen(true)}
            />
          </div>

          <div className="flex flex-col items-center justify-center gap-4">
            {twitch && (
              <div className="text-white">
                <div style={{ display: "flex", width: "35vw", height: "20px" }}>
                  <div
                    style={{
                      backgroundColor: "red",
                      width: `${azukiWidth}%`,
                      display: "flex",
                      justifyContent: "center", // Centers text horizontally
                      alignItems: "center", // Centers text vertically
                    }}
                  >
                    {azukiWidth > 0 && <span>Azuki</span>}
                  </div>
                  <div
                    style={{
                      backgroundColor: "blue",
                      width: `${elementalWidth}%`,
                      display: "flex",
                      justifyContent: "center", // Centers text horizontally
                      alignItems: "center", // Centers text vertically
                    }}
                  >
                    {elementalWidth > 0 && <span>Elemental</span>}
                  </div>
                </div>
              </div>
            )}

            <h2
              id="score"
              className=" text-2xl font-extrabold tracking-tight text-white sm:text-[2.5rem]"
            >
              Score
            </h2>
            <div className=" flex gap-8">
              <div className="mx-10 flex flex-col items-center justify-center gap-2">
                <span className="text-xl font-extrabold tracking-tight text-white sm:text-[1.5rem]">
                  Correct
                </span>
                <span className="text-4xl font-extrabold tracking-tight text-white sm:text-[4rem]">
                  {answers.correct}
                </span>
              </div>
              <div className="mx-10 flex flex-col items-center justify-center gap-2">
                <span className="text-xl font-extrabold tracking-tight text-white sm:text-[1.5rem]">
                  Incorrect
                </span>
                <span className="text-4xl font-extrabold tracking-tight text-white sm:text-[4rem]">
                  {answers.incorrect}
                </span>
              </div>
            </div>
          </div>
          {!nftData?.image ? (
            <ImageComponent imageId={imageId} />
          ) : (
            <img
              onLoad={() => setImageLoaded(true)}
              style={{ height: "400px", width: "400px" }}
              alt="NFT"
              src={nftData?.image}
              className="rounded rounded-full border-2 border-gray-500 shadow-xl transition duration-500 hover:scale-110 hover:border-gray-600"
            />
          )}

          {gameStatus === "notStarted" && (
            <>
              <button
                className="rounded bg-gray-600 px-4 py-2 font-bold text-white shadow-xl transition duration-500 hover:scale-110 hover:bg-gray-700"
                onClick={() => {
                  setLastAnswers([]);
                  setGameStatus("inProgress");
                  setCurrentRound(0);
                  setAnswers({ correct: 0, incorrect: 0 });
                  setRoundInProgress(false);
                  setRestart(true);
                  setCountdown(defaultCount);
                  //  requestNFT();
                  //smooth scroll to id scroll and 5 px more

                  const scroll = document.getElementById("score");
                  const offset = -24;

                  const bodyRect = document.body.getBoundingClientRect().top;

                  const elementRect = scroll?.getBoundingClientRect().top;

                  const elementPosition = elementRect
                    ? elementRect - bodyRect
                    : 0;

                  const offsetPosition = elementPosition - offset;

                  window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth",
                  });
                }}
              >
                Start
              </button>
            </>
          )}

          {gameStatus === "finished" && (
            <button
              className="-mt-4 rounded bg-gray-600 px-4 py-2 font-bold text-white shadow-xl transition duration-500 hover:scale-110 hover:bg-gray-700"
              onClick={() => {
                setLastAnswers([]);
                setGameStatus("inProgress");
                setCurrentRound(0);
                setAnswers({ correct: 0, incorrect: 0 });
                setRoundInProgress(false);
                setRestart(true);
                setCountdown(defaultCount);
                const scroll = document.getElementById("score");
                const offset = -24;

                const bodyRect = document.body.getBoundingClientRect().top;

                const elementRect = scroll?.getBoundingClientRect().top;

                const elementPosition = elementRect
                  ? elementRect - bodyRect
                  : 0;

                const offsetPosition = elementPosition - offset;

                window.scrollTo({
                  top: offsetPosition,
                  behavior: "smooth",
                });
              }}
            >
              Restart
            </button>
          )}

          <div className="item-justify-center item-center flex justify-center">
            <div className="mx-auto px-12">
              {gameStatus === "inProgress" && (
                <>
                  {multipleChoice.map((nft) => (
                    <button
                      key={nft.name}
                      className="mx-3 my-1  rounded bg-gray-600 p-1 text-center font-bold text-white shadow-xl transition duration-500 hover:scale-110 hover:bg-gray-700"
                      onClick={() => {   if (countdown > 0 && imageLoaded) handleGuess(nft.name);
                      }}
                    >
                      {nft.name}
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>
          {(gameMode === "TIMER" || twitch) && (
            <>
              {gameStatus === "inProgress" && (
                <div className="-mt-8 text-3xl text-white">
                  Time Remaining: {countdown}
                </div>
              )}
              {gameStatus === "notStarted" && (
                <div className="-mt-8 text-3xl text-white">
                  {defaultCount} seconds per guess
                </div>
              )}
            </>
          )}
          {gameStatus === "finished" && (
            <TwitterShare
              answers={answers}
              gameMode={gameMode}
              defaultCount={defaultCount}
              lastAnswers={lastAnswers}
            />
          )}
          {(gameStatus === "notStarted" || gameStatus === "finished") && (
            <>
              {lastAnswers.length > 0 && (
                <span className="text-white ">
                  {`#ApeFollowApe - Didn't recognize a fellow Ape. Just click on the image below to go to their X Profile.`}{" "}
                </span>
              )}
              <div
                id="lastAnswers"
                className="mx-auto grid grid-cols-2 justify-items-center gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
              >
                {lastAnswers.map((nft, i) => (
                  <img
                    src={nft?.image}
                    alt="NFT"
                    key={`${i}-${nft.name}`}
                    className={`m-2 h-36 cursor-pointer rounded-lg border-2 font-bold text-white shadow-xl transition duration-500 hover:scale-110 ${
                      nft?.correct ? "border-green-500" : "border-red-500"
                    }`}
                    onClick={() => {
                      window.open(
                        `https://twitter.com/${nft.username}`,
                        "_blank"
                      );
                    }}
                  />
                ))}
              </div>
            </>
          )}
          <Footer />
        </div>
      </main>
    </div>
  );
};

export default ImagePage;

export const getImageUrlById = (imageId: string): string => {
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
