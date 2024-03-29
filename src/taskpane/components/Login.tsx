import React, { useState, FormEvent, useContext } from "react";
import { LanguageContext } from "../languagecontext";

interface LoginProps {
  onLoginSuccess: (email: string, apiKey: string) => void;
  errorMsg?: string;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess, errorMsg }) => {
  const [email, setEmail] = useState<string>("");
  const [apiKey, setApiKey] = useState<string>("");
  const { language } = useContext(LanguageContext);

  const handleLogin = (event: FormEvent) => {
    event.preventDefault();
    onLoginSuccess(email, apiKey);
  };

  return (
    <div className="w-full">
      <div className="flex justify-center flex-col w-full text-center">
        <a
          href="https://help.freelo.io/help/api-klic/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gray underline"
        >
          {language.apiKeyLink}
        </a>

        <form onSubmit={handleLogin} className="px-10 my-2">
          <input
            type="text"
            placeholder="Freelo e-mail"
            className="w-full border-b-2 border-gray-300 px-1 py-2 my-1 focus:outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder={language.apiKeyText}
            className="w-full border-b-2 border-gray-300 px-1 py-2 focus:outline-none"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            required
          />
          <button type="submit" className="w-full my-2 rounded text-white p-2 bg-blue-500">
            {language.loginText}
          </button>
          {errorMsg && <p className="text-red-500">{errorMsg}</p>}
        </form>
      </div>
    </div>
  );
};

export default Login;
