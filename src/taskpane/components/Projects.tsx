import React, { useState, useContext } from "react";
import { LanguageContext } from "../languagecontext";

interface Props {
  projects: any[];
  onProjectChange: (selectedProject: string) => void;
  selectedProject?: any;
  onNewProject?: (projectName: string, projectCurrency: string) => void;
  errorMsg?: string;
  logout: () => void;
}

const Projects: React.FC<Props> = ({ projects, onProjectChange, selectedProject, onNewProject, errorMsg, logout }) => {
  const [newProjectName, setNewProjectName] = useState<string>("");
  const [newProjectCurrency, setNewProjectCurrency] = useState<string>("CZK");
  const { language } = useContext(LanguageContext);

  const handleProjectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedIndex = event.target.selectedIndex;
    const project = selectedIndex > 0 ? projects[selectedIndex - 1] : null;
    onProjectChange(project);
  };

  const handleNewProject = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onNewProject(newProjectName, newProjectCurrency);
  };

  return (
    <div>
      <a className="flex justify-center w-full pb-3 underline cursor-pointer" onClick={logout}>
        {language.signOutText}
      </a>
      <hr />
      <div className="flex justify-center flex-col w-full text-center px-10 mb-2">
        <select
          value={selectedProject?.name}
          onChange={handleProjectChange}
          className="w-full border-b-2 border-gray-300 px-1 py-2 my-1 text-gray-600 focus:outline-none"
          required
        >
          <option value="">{language.chooseProjectText}</option>
          {projects?.map((project, index) => (
            <option key={index} value={project.name}>
              {project.name}
            </option>
          ))}
        </select>
      </div>
      {!selectedProject?.name && (
        <div>
          <hr />
          <div className="flex justify-center flex-col w-full text-center px-10">
            <h1 className="text-lg my-3">{language.newProjectLabel}</h1>
            {errorMsg && <p className="text-red-500">{errorMsg}</p>}
            <form onSubmit={handleNewProject}>
              <input
                type="text"
                placeholder={language.projectName}
                className="w-full border-b-2 border-gray-300 px-1 py-2 my-1 focus:outline-none placeholder-gray-600"
                onChange={(e) => setNewProjectName(e.target.value)}
                required
              />
              <select
                className="w-full border-b-2 border-gray-300 px-1 py-2 my-1 text-gray-600 focus:outline-none"
                onChange={(e) => setNewProjectCurrency(e.target.value)}
                required
              >
                <option value="CZK">CZK</option>
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
              </select>
              <button type="submit" className="w-full my-2 rounded text-white p-2 bg-blue-500">
                {language.createProjectText}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
