import { type FC } from "react";
import { gameModes } from "../pages/index";

import { Dialog } from "@headlessui/react";
import Link from "next/link";

interface SideInfoProps {
  diffculty: number;
  twitch: string | false | string[];
  gameStatus: string;
  setGameMode: (gameMode: string) => void;
  setDifficulty: (difficulty: number) => void;
  mayc: boolean;
  bayc: boolean;
  setMayc: (mayc: boolean) => void;
  setBayc: (bayc: boolean) => void;
}

const communties = ["Bored Apes", "DeGods"];

const SideInfo: FC<SideInfoProps> = ({
  gameStatus,
  diffculty,
  setGameMode,
  twitch,
  setDifficulty,
  mayc,
  bayc,
  setMayc,
  setBayc,
}) => {
  const currentPage = window.location.pathname;
  const isHome = currentPage === "/";

  const currentCommunity = window.location.hostname.split(".")[0];



  return (
    <>
      <div className="flex-col px-4 sm:px-6">
        <Dialog.Title className="text-center text-base font-semibold leading-6 text-gray-900">
          Settings
        </Dialog.Title>
      </div>
      <div className="m-2 flex h-screen items-center justify-center">
        <div className=" mt-6 block px-4 sm:px-6">
          {/* button to go to influencer mode (/) */}

          <Link href="https://pfpguessr.com">
            <button className="m-1 block w-36 cursor-pointer rounded bg-gray-600 px-4 py-2 font-bold text-white shadow-xl transition duration-500 hover:bg-gray-700">
              Influencer Guess
            </button>
          </Link>

          {/* //loop through communities and create a dropdown to go to each one */}
          <select
            className="m-1 block w-36 cursor-pointer rounded bg-gray-600 px-4 py-2 font-bold text-white shadow-xl transition duration-500 hover:bg-gray-700"
            onChange={(select) => {
              const community = select.target;
              let communityName = community.value.toLowerCase();
              if (communityName !== currentCommunity?.toLowerCase()) {
                if (communityName === "bored apes") communityName = "apes";
                window.location.href = `https://${communityName}.pfpguessr.com/`;
              }
            }}
          >
            <option defaultValue="default">Community</option>
            {communties.map((community) => (
              <option key={community} value={community}>
                {community}
              </option>
            ))}
          </select>

          {(gameStatus === "notStarted" || gameStatus === "finished") && (
            <select
              className="m-1 w-36 cursor-pointer rounded bg-gray-600 px-4 py-2 font-bold text-white shadow-xl transition duration-500 hover:bg-gray-700"
              onChange={(e) => setGameMode(e.target.value)}
            >
              <option value={gameModes.TIMER}>Timer Mode</option>
              <option value={gameModes.STREAK}>Streak Mode</option>
            </select>
          )}

          {(gameStatus === "notStarted" || gameStatus === "finished") &&
            !twitch && (
              <>
                <select
                  defaultChecked
                  value={diffculty}
                  className="m-1 block w-36 cursor-pointer rounded bg-gray-600 px-4 py-2 font-bold text-white shadow-xl transition duration-500 hover:bg-gray-700"
                  onChange={(e) => setDifficulty(parseInt(e.target.value))}
                >
                  <>
                    <option value="30">Noob</option>
                    <option value="8">Easy</option>
                    <option defaultChecked value="5">
                      Medium
                    </option>
                    <option value="3">Hard</option>
                  </>
                </select>
                <div className="flex flex-row justify-center m-1">
                  <input
                    type="checkbox"
                    className="m-1 cursor-pointer rounded bg-gray-600 px-4 py-2 font-bold text-white shadow-xl transition duration-500 hover:bg-gray-700 m-1"
                    checked={mayc}
                    onChange={() => setMayc(!mayc)}
                  />
                  <label className="text-white m-1">MAYC</label>

                  <input
                    type="checkbox"
                    className="m-1 cursor-pointer rounded bg-gray-600 px-4 py-2 font-bold text-white shadow-xl transition duration-500 hover:bg-gray-700 m-1"
                    checked={bayc}
                    onChange={() => setBayc(!bayc)}
                  />
                  <label className="text-white m-1">BAYC</label>
                </div>
              </>
            )}
        </div>
      </div>
    </>
  );
};

export default SideInfo;
