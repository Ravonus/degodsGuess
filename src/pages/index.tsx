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

    if (currentRound === 0) return;
    setShouldStartCountdown(true);
    const godOne = randomDeGod();
    const godTwo = randomDeGod();
    const godThree = randomDeGod();
    const godFour = randomDeGod();

    const randomGods = [godOne, godTwo, godThree, godFour];
    setMultipleChoice(randomGods);

    setNftData(randomGods[Math.floor(Math.random() * randomGods.length)] as unknown as Data);
  }, [currentRound]);

  useEffect(() => {
    if (restart) requestNFT();
    setRestart(false);
  }, [restart]);

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


    if (username === nftData.username) {
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

  function randomDeGod() {
    return data[Math.floor(Math.random() * data.length)] as unknown as Data;
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

    const appLink = "https://pfpguessr.com";

    const createdBy = "@R4vonus";

    const hashtag = "#AzukiVsElemental";

    const diff =
      defaultCount == 6 ? "Easy" : defaultCount > 3 ? "Medium" : "Hard";
    let scoreText = "";

    if (gameMode === gameModes.STREAK) {
      scoreText = `I scored a streak of ${correct} in Azuki VS Elemental ${appLink}`;
    }
    if (gameMode === gameModes.TIMER) {
      scoreText = `I scored ${correct}/10 in Azuki VS Elemental ${appLink} on ${diff} difficulty!`;
    }

    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      scoreText + `\n\n Created by ${createdBy}\n ${hashtag}`
    )}`;

    window.open(tweetUrl);
  };

  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <title>DeGods</title>
        <meta name="title" content="DeGods" />
        <meta
          name="description"
          content="Can you guess the community."
        />

        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://pfpguessr.com/" />
        <meta property="og:title" content="DeGods" />
        <meta
          property="og:description"
          content="Can you guess the community."
        />
        <meta property="og:image" content="https://pfpguessr.com/pfp.png" />

        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://pfpguessr.com/" />
        <meta property="twitter:title" content="DeGods" />
        <meta
          property="twitter:description"
          content="Can you guess the community."
        />
        <meta
          property="twitter:image"
          content="https://pfpguessr.com/pfp.png"
        />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://pfpguessr.com/" />
        <meta name="twitter:title" content="DeGods" />
        <meta
          name="twitter:description"
          content="Can you guess the community."
        />
        <meta name="twitter:image" content="https://pfpguessr.com/pfp.png" />
      </Head>

      <main className=" flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e021d] to-[#15162c]">
        <ToastContainer />
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-2 md:-mt-32">
          <div className="mt-5 flex flex-col items-center justify-center gap-4">
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
            <img
              alt="NFT"
              src="/aore.png"
              className="rounded border-2 border-purple-500 shadow-xl transition duration-500 hover:scale-110 hover:border-purple-600"
            />
          ) : (
            <img
              alt="NFT"
              src={nftData?.image}
              className="rounded border-2 border-purple-500 shadow-xl transition duration-500 hover:scale-110 hover:border-purple-600"
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
          {gameStatus === "notStarted" && (
            <>
              <button
                className="rounded bg-purple-600 px-4 py-2 font-bold text-white shadow-xl transition duration-500 hover:scale-110 hover:bg-purple-700"
                onClick={() => {
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
              className="-mt-4 rounded bg-purple-600 px-4 py-2 font-bold text-white shadow-xl transition duration-500 hover:scale-110 hover:bg-purple-700"
              onClick={() => {
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
              className="-mt-8 rounded bg-purple-600 px-4 py-2 font-bold text-white shadow-xl transition duration-500 hover:scale-110 hover:bg-purple-700"
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
                className="-mt-8 rounded bg-purple-600 px-4 py-2 font-bold text-white shadow-xl transition duration-500 hover:scale-110 hover:bg-purple-700"
                onChange={(e) => setDifficulty(parseInt(e.target.value))}
              >
                <>
                  <option value="8">Easy</option>
                  <option defaultChecked value="5" selected>
                    Medium
                  </option>
                  <option value="1">Hard</option>
                </>
              </select>
            )}

          <div className="-mt-4 flex justify-center gap-4 text-white">
            {gameStatus === "inProgress" && (
              <>
                {multipleChoice.map((nft) => (
                  <button
                      key={nft.username}
                      className="rounded bg-purple-600 px-4 py-2 font-bold text-white shadow-xl transition duration-500 hover:scale-110 hover:bg-purple-700"
                    onClick={() => { handleGuess(nft.username).catch(console.error) }}
                    >
                      {nft.username}
                    </button>
                ))}
              </>
            )}
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
        </div>
      </main>
    </>
  );
}