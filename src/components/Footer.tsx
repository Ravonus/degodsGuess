import { type FC } from "react";

const Footer: FC = () => {
  return (
    <>
      {" "}
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
      <div className="text-gray-300/30">
        If any communities would like to be added to the game, please DM me on
        Twitter
      </div>
    </>
  );
};

export default Footer;
