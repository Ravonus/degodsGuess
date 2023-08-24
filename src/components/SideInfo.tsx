import { type FC } from "react";
import { gameModes } from "../pages/index";

import { Dialog } from "@headlessui/react";
import Link from "next/link";

interface SideInfoProps {
  twitch: string | false | string[];
  gameStatus: string;
  gameMode: string;
  setGameMode: (gameMode: string) => void;
  setDifficulty: (difficulty: number) => void;
}

const communties = ["DeGods"];

const SideInfo: FC<SideInfoProps> = ({
  gameStatus,
  gameMode,
  setGameMode,
  twitch,
  setDifficulty,
}) => {
  const currentPage = window.location.pathname;
  const isHome = currentPage === "/";

  const linkSplit = currentPage.split("/");
  const currentCommunity = linkSplit[linkSplit.length - 1];

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
          {!isHome && (
            //loop through communities

            <Link href="/">
              <button className="m-1 block w-36 cursor-pointer rounded bg-gray-600 px-4 py-2 font-bold text-white shadow-xl transition duration-500 hover:bg-gray-700">
                Influencer Guess
              </button>
            </Link>
          )}
          {/* //loop through communities and create a dropdown to go to each one */}
          <select
            className="m-1 block w-36 cursor-pointer rounded bg-gray-600 px-4 py-2 font-bold text-white shadow-xl transition duration-500 hover:bg-gray-700"
            onChange={(select) => {
              const community = select.target;
              const communityName = community.value.toLowerCase();
              if (communityName !== currentCommunity?.toLowerCase()) {
                window.location.href = `/${communityName}`;
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
              <select
                className="m-1 block w-36 cursor-pointer rounded bg-gray-600 px-4 py-2 font-bold text-white shadow-xl transition duration-500 hover:bg-gray-700"
                onChange={(e) => setDifficulty(parseInt(e.target.value))}
              >
                <>
                  <option value="8">Easy</option>
                  <option defaultChecked value="5">
                    Medium
                  </option>
                  <option value="3">Hard</option>
                </>
              </select>
            )}
        </div>
      </div>
    </>
  );
};

export default SideInfo;
