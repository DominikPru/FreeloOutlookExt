import React, { useState, useContext } from "react";
import { LanguageContext } from "../languagecontext";

interface Props {
  taskLists: any[];
  onListChange: (selectedList: string) => void;
  selectedList?: any;
  onNewList?: (listName: string, listBudget: number) => void;
  errorMsg?: string;
}

const Tasklists: React.FC<Props> = ({ taskLists, onListChange, selectedList, onNewList, errorMsg }) => {
  const [newListName, setNewListName] = useState<string>("");
  const [newListBudget, setNewListBudget] = useState<number>(0);
  const { language } = useContext(LanguageContext);

  const handleListChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedIndex = event.target.selectedIndex;
    const list = selectedIndex > 0 ? taskLists[selectedIndex - 1] : null;
    onListChange(list);
  };

  const handleNewList = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onNewList(newListName, newListBudget);
  };

  return (
    <div>
      <div className="flex justify-center flex-col w-full text-center px-10 mb-5">
        <select
          value={selectedList?.name}
          onChange={handleListChange}
          className="w-full border-b-2 border-gray-300 px-1 py-2 my-1 text-gray-600 focus:outline-none"
          required
        >
          <option value="">{language.chooseTasklistText}</option>
          {Array.isArray(taskLists) &&
            taskLists.map((list, index) => (
              <option key={index} value={list.name}>
                {list.name}
              </option>
            ))}
        </select>
      </div>

      {!selectedList && (
        <div>
          <hr />
          <div className="flex justify-center flex-col w-full text-center px-10">
            <h1 className="text-lg my-3">{language.newTasklistLabel}</h1>
            {errorMsg && <p className="text-red-500">{errorMsg}</p>}
            <form onSubmit={handleNewList}>
              <input
                type="text"
                placeholder={language.tasklistName}
                className="w-full border-b-2 border-gray-300 px-1 py-2 my-1 focus:outline-none placeholder-gray-600"
                onChange={(e) => setNewListName(e.target.value)}
                required
              />
              <input
                type="number"
                placeholder={language.tasklistBudget}
                className="w-full border-b-2 border-gray-300 px-1 py-2 my-1 focus:outline-none placeholder-gray-600"
                onChange={(e) => setNewListBudget(Number(e.target.value))}
              />
              <button type="submit" className="w-full my-2 rounded text-white p-2 bg-blue-500">
                {language.createTasklistText}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasklists;
