import React, { useState, useEffect } from "react";

interface Props {
  userData: any[];
  onNewTask: (taskName: string, taskDescription: string, taskDeadline: any, worker: any) => void;
  errorMsg?: string;
}

const Tasks: React.FC<Props> = ({ userData, onNewTask, errorMsg }) => {
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [deadlineDate, setDeadlineDate] = useState("");
  const [deadlineTime, setDeadlineTime] = useState("");
  const [worker, setWorker] = useState("");

  const handleNewTask = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onNewTask(emailSubject, emailBody, deadlineDate + "T" + deadlineTime + ":00+01:00", worker);
  };

  // This useEffect sets the email subject and content to its corresponding fields (Name, Desc)
  // useEffect(() => {
  //   const emailItem = Office.context.mailbox.item;

  //   if (emailItem.itemId) {
  //     setEmailSubject(emailItem.subject);
  //   } else {
  //     emailItem.subject.getAsync((result: Office.AsyncResult<string>) => {
  //       if (result.status === Office.AsyncResultStatus.Succeeded) {
  //         setEmailSubject(result.value);
  //       } else {
  //         console.error(result.error);
  //       }
  //     });
  //   }

  //   emailItem.body.getAsync("text", (result: Office.AsyncResult<string>) => {
  //     if (result.status === Office.AsyncResultStatus.Succeeded) {
  //       const body = result.value;
  //       setEmailBody(body);
  //     } else {
  //       console.error(result.error);
  //     }
  //   });
  // }, []);

  return (
    <div>
      <hr />
      <form onSubmit={handleNewTask}>
        <div className="flex justify-center flex-col w-full text-center px-10 mb-3">
          <h1 className="text-lg my-3">Nový úkol</h1>
          {errorMsg && <p className="text-red-500">{errorMsg}</p>}
          <label>
            <span className="mb-3">Termín</span>
            <input
              type="date"
              className="w-full border-b-2 border-gray-300 px-1 py-2 mb-2 focus:outline-none placeholder-gray-600"
              onChange={(e) => setDeadlineDate(e.target.value)}
            />
          </label>
          <input
            type="time"
            className="w-full border-b-2 border-gray-300 px-1 py-2 mb-2 focus:outline-none placeholder-gray-600"
            onChange={(e) => setDeadlineTime(e.target.value)}
          />
        </div>
        <hr />
        <div className="flex justify-center flex-col w-full text-center px-10">
          <input
            type="text"
            placeholder="Název úkolu"
            value={emailSubject}
            onChange={(e) => setEmailSubject(e.target.value)}
            className="w-full border-b-2 border-gray-300 px-1 py-2 my-1 focus:outline-none placeholder-gray-600"
          />
          <select
            className="w-full border-b-2 border-gray-300 py-2 my-1 text-gray-600 focus:outline-none"
            onChange={(e) => setWorker(e.target.value)}
          >
            <option value="" hidden>
              Řešitel
            </option>
            {userData?.map((user, index) => (
              <option key={index} value={JSON.stringify({ id: user.id, fullname: user.fullname })}>
                {user.fullname}
              </option>
            ))}
          </select>
          <textarea
            placeholder="Popis úkolu"
            value={emailBody}
            onChange={(e) => setEmailBody(e.target.value)}
            className="w-full border-2 border-gray-300 px-1 p-2 my-1 focus:outline-none placeholder-gray-600 rounded overflow-x-hidden"
          />
          <button type="submit" className="w-full my-2 rounded text-white p-2 bg-blue-500">
            Vytvořit
          </button>
        </div>
      </form>
    </div>
  );
};

export default Tasks;
