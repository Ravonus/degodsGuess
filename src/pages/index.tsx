import { useState, useEffect, use } from "react";
import Head from "next/head";
import Link from "next/link";
import { api, type RouterOutputs } from "~/utils/api";
import { useRouter } from "next/router";

import { type AppType } from "next/app";
import { ToastContainer, toast } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

import data from "~/../public/data.json";

//their name needs to be the record to the object

//change above to a record not interface

type UserVotes = Record<string, boolean>;

// add game modes
const gameModes = {
  TIMER: "TIMER",
  STREAK: "STREAK",
};

interface Data {
  image: string;
  username: string;
  rank: number;
  tokenID: number;
  name: string;
}

export default function Home() {
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

  const [multipleChoice, setMultipleChoice] = useState<Data[]>([]); // array of 4 random nfts to choose from

  const [azukiVotes, setAzukiVotes] = useState(0);
  const [elementalVotes, setElementalVotes] = useState(0);

  const [userVotes, setUserVotes] = useState<UserVotes>({});

  const [defaultCount, setDefaultCount] = useState(0);

  const [lastIncorrect, setLastIncorrect] = useState("");

  const [lastAnswers, setLastAnswers] = useState<Data[]>([]);

  const [azukiWidth, setAzukiWidth] = useState(100);
  const [elementalWidth, setElementalWidth] = useState(100);

  // const [socket, setSocket] = useState<Socket>();

  const router = useRouter();

  //see if ?begin is in the url

  const twitch = router.query.twitch ? router.query.twitch : false;

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

    // Connect to the Socket.IO server
    // setSocket(
    //   io(process.env.NEXT_PUBLIC_SOCKET as string, {
    //     query: { twitch: twitch },
    //   })
    // );

    // Handle the 'chat message' event

    // Disconnect when the component unmounts
    // return () => {
    //   socket?.disconnect();
    // };
  }, [twitch]);

  useEffect(() => {
    //first remvoe listener

    if (gameStatus !== "inProgress") return;

    //socket?.off(twitch as string);

    // socket?.on(twitch as string, (msg: { user: string; isAzuki: boolean }) => {
    //   //if user has already voted change it, if not add it
    //   //we need to check if userVotes[msg.user] exists (Not if its true or false)

    //   if (userVotes[msg.user] !== undefined) {
    //     if (userVotes[msg.user] === msg.isAzuki) {
    //       //if they voted the same, do nothing
    //       return;
    //     } else {
    //       //if they voted different, change it
    //       setUserVotes((prev) => ({ ...prev, [msg.user]: msg.isAzuki }));
    //       if (msg.isAzuki) {
    //         setAzukiVotes((prev) => prev + 1);
    //         setElementalVotes((prev) => prev - 1);
    //       } else {
    //         setAzukiVotes((prev) => prev - 1);
    //         setElementalVotes((prev) => prev + 1);
    //       }
    //     }
    //   } else {
    //     //if they haven't voted, add it
    //     setUserVotes((prev) => ({ ...prev, [msg.user]: msg.isAzuki }));
    //     if (msg.isAzuki) setAzukiVotes((prev) => prev + 1);
    //     else setElementalVotes((prev) => prev + 1);
    //   }

    //   toast.success(
    //     `${msg.user} voted for ${msg.isAzuki ? "Azuki" : "Elemental"}`
    //   );
    // });
  }, [userVotes, gameStatus]);

  useEffect(() => {
    if (gameStatus !== "inProgress") return;

    if (gameMode === gameModes.STREAK && !twitch) return;

    let countdownTimer: NodeJS.Timeout;

    if (countdown > 0 && shouldStartCountdown) {
      countdownTimer = setTimeout(() => {
        setCountdown((prevCountdown) => prevCountdown - 1);
      }, 1000);
    } else if (countdown < 1 && shouldStartCountdown && !roundInProgress) {
      // Timeout expired, request a new NFT

      setAnswers((prev) => ({ ...prev, incorrect: prev.incorrect + 1 }));

      requestNFT();
      setShouldStartCountdown(false); // Prevent the countdown from starting automatically
    }

    return () => {
      clearTimeout(countdownTimer);
    };
  }, [
    twitch,
    countdown,
    shouldStartCountdown,
    defaultCount,
    gameMode,
    roundInProgress,
  ]);

  // if (nft.isIdle && !nftData) {
  //   nft
  //     .mutateAsync()
  //     .then((data) => {
  //       setNftData(data);

  //       setTimeout(() => {
  //         // Only 5 seconds to guess
  //         //   setCountdown(defaultCount);
  //       }, 5000);
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //     });
  // }

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
  }, [currentRound]);

  useEffect(() => {
    if (restart) requestNFT();
    setRestart(false);
  }, [restart]);

  useEffect(() => {
    if (!nftData) return;
    setLastAnswers((prev) => [...prev, nftData]);
  }, [nftData]);

  const handleGuess = async (username: string) => {
    if (currentRound > 10 && gameMode === gameModes.TIMER) {
      setGameStatus("finished");
      setCountdown(0);
      setShouldStartCountdown(false);
      setCurrentRound(0);

      return;
    }
    if (!nftData) return;
    if (roundInProgress) return; // Prevent multiple guesses in the same round
    setRoundInProgress(true); // Start a round
    // if (nftData.contract === collection) {
    //   toast.success("Correct!", {
    //     autoClose: 500,
    //   });
    //   setAnswers((prev) => ({ ...prev, correct: prev.correct + 1 }));
    // } else {
    //   toast.error("Nope!", {
    //     autoClose: 500,
    //   });
    //   setAnswers((prev) => ({ ...prev, incorrect: prev.incorrect + 1 }));
    //   setLastIncorrect(nftData.image);

    //   // If game mode is STREAK and the answer is incorrect, finish the game
    //   if (gameMode === gameModes.STREAK) {
    //     setGameStatus("finished");
    //     setCountdown(0);
    //     toast.success("Game finished!");
    //     setNftData(undefined);
    //     return;
    //   }
    // }

    if (username === nftData.name) {
      toast.success("Correct!", {
        autoClose: 500,
      });

      setAnswers((prev) => ({ ...prev, correct: prev.correct + 1 }));
    } else {
      toast.error("Nope!", {
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

    setRoundInProgress(false);
    await new Promise((resolve) => setTimeout(resolve, 500)); // Wait 0.5 seconds before requesting a new NFT
    requestNFT();
  };

  async function randomDeGod(noCheck = false): Promise<Data> {
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
  }

  function requestNFT() {
    setCountdown(defaultCount);
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
  }

  function setDifficulty(diff: number) {
    setDefaultCount(diff);
  }

  const shareScoreOnTwitter = () => {
    const correct = `${answers.correct}`;
    const incorrect = `${answers.incorrect}`;

    const appLink = "https://decypher.world";

    const createdBy = "@R4vonus";

    const diff =
      defaultCount == 6 ? "Easy" : defaultCount > 3 ? "Medium" : "Hard";
    let scoreText = "";

    if (gameMode === gameModes.STREAK) {
      scoreText = `I scored a streak of ${correct} in DeCypher ${appLink}`;
    }
    if (gameMode === gameModes.TIMER) {
      scoreText = `I scored ${correct}/10 in Decypher ${appLink} on ${diff} difficulty!`;
    }

    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      scoreText + `\n\n Created by ${createdBy}\n`
    )}`;

    window.open(tweetUrl);
  };

  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <title>DeCypher</title>
        <meta name="title" content="DeGods" />
        <meta
          name="description"
          content="Can you guess the community members."
        />

        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://decypher.world" />
        <meta property="og:title" content="DeCypher" />
        <meta
          property="og:description"
          content="Can you guess the community members."
        />
        <meta property="og:image" content="https://decypher.world/pfp2.png" />

        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://decypher.world/" />
        <meta property="twitter:title" content="DeGods" />
        <meta
          property="twitter:description"
          content="Can you guess the community members."
        />
        <meta
          property="twitter:image"
          content="https://decypher.world/pfp2.png"
        />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://decypher.world/" />
        <meta name="twitter:title" content="DeCypher" />
        <meta
          name="twitter:description"
          content="Can you guess the community members."
        />
        <meta name="twitter:image" content="https://decypher.world/pfp2.png" />
      </Head>

      <main className=" flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#0009]  to-[#000]">
        <ToastContainer />
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-2 ">
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
            <>
              <img
                alt="NFT"
                src="/aore.png"
                className="rounded border-2 border-gray-500 shadow-xl transition duration-500 hover:scale-110 hover:border-gray-600"
              />
            </>
          ) : (
            <img
              alt="NFT"
              src={nftData?.image}
              className="rounded border-2 border-gray-500 shadow-xl transition duration-500 hover:scale-110 hover:border-gray-600"
            />
          )}
          {gameStatus === "finished" && (
            <button
              className="-mt-8 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
              onClick={shareScoreOnTwitter}
            >
              Share on Twitter
            </button>
          )}
          {(gameStatus === "notStarted" || gameStatus === "finished") && (
            <>
              <div className="mx-auto grid grid-cols-2 justify-items-center gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {lastAnswers.map((nft, i) => (
                  <img
                    src={nft?.image}
                    alt="NFT"
                    key={`${i}-${nft.name}`}
                    className="m-2 h-36 cursor-pointer rounded border-2 border-black font-bold text-white shadow-xl transition duration-500 hover:scale-110"
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

          {(gameStatus === "notStarted" || gameStatus === "finished") && (
            <select
              className="-mt-8 rounded bg-gray-600 px-4 py-2 font-bold text-white shadow-xl transition duration-500 hover:scale-110 hover:bg-gray-700"
              onChange={(e) => setGameMode(e.target.value)}
            >
              <option value={gameModes.TIMER}>Timer Mode</option>
              <option value={gameModes.STREAK}>Streak Mode</option>
            </select>
          )}

          {(gameStatus === "notStarted" || gameStatus === "finished") &&
            gameMode !== "STREAK" &&
            !twitch && (
              <select
                className="-mt-8 rounded bg-gray-600 px-4 py-2 font-bold text-white shadow-xl transition duration-500 hover:scale-110 hover:bg-gray-700"
                onChange={(e) => setDifficulty(parseInt(e.target.value))}
              >
                <>
                  <option value="8">Easy</option>
                  <option defaultChecked value="5" selected>
                    Medium
                  </option>
                  <option value="3">Hard</option>
                </>
              </select>
            )}

          <div className="item-justify-center item-center flex justify-center">
            <div className="mx-auto px-12">
              {gameStatus === "inProgress" && (
                <>
                  {multipleChoice.map((nft) => (
                    <button
                      key={nft.name}
                      className="mx-3 my-1  rounded bg-gray-600 p-1 text-center font-bold text-white shadow-xl transition duration-500 hover:scale-110 hover:bg-gray-700"
                      onClick={() => {
                        handleGuess(nft.name).catch(console.error);
                      }}
                    >
                      {nft.username}
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

          <div className="-mt-12 text-white md:mt-0">
            App created by{" "}
            <a
              href="https://twitter.com/R4vonus"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              @R4vonus
            </a>
          </div>
          <div className="-mt-12 text-gray-300/30">
            Donations <a>ravonus.eth</a>
          </div>
        </div>
      </main>
    </>
  );
}
