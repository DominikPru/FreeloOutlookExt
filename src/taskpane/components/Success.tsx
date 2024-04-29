import React, { useContext } from "react";
import { LanguageContext } from "../languagecontext";

interface SuccessProps {
  freeloLink: string | URL;
  returnHome: () => void;
}

const Success: React.FC<SuccessProps> = ({ freeloLink, returnHome }) => {
  const { language } = useContext(LanguageContext);

  return (
    <div className="flex justify-center w-full flex-col text-center px-5">
      <h1 className="mb-2">{language.successText}</h1>
      <button
        onClick={() => window && window.open(freeloLink.toString(), "_blank")}
        className="w-full my-2 rounded text-white p-2 bg-blue-500"
      >
        {language.showInFreeloText}
      </button>{" "}
      <button onClick={returnHome} className="w-full my-2 rounded text-white p-2 bg-blue-500">
        {language.createAnotherTaskText}
      </button>
    </div>
  );
};

export default Success;
