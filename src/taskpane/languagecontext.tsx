import * as React from "react";
import { en, cz, sk } from "./translations";

type LanguageContextType = {
  language: typeof en | typeof cz | typeof sk;
  setLanguage: (language: typeof en | typeof cz | typeof sk) => void;
};

export const LanguageContext = React.createContext<LanguageContextType>({
  language: en,
  setLanguage: () => {},
});
