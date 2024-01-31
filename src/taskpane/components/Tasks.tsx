import React, { useState, useEffect, useContext } from "react";
import { LanguageContext } from "../languagecontext";

interface Props {
  userData: any[];
  onNewTask: (attachments: any, taskName: string, taskDescription: string, taskDeadline: any, worker: any) => void;
  errorMsg?: string;
}

const Tasks: React.FC<Props> = ({ userData, onNewTask, errorMsg }) => {
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [deadlineDate, setDeadlineDate] = useState("");
  const [deadlineTime, setDeadlineTime] = useState("");
  const [worker, setWorker] = useState("");
  const [attachments, setAttachments] = useState([]);
  const { language } = useContext(LanguageContext);

  const handleNewTask = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onNewTask(attachments, emailSubject, emailBody, deadlineDate + "T" + deadlineTime + ":00+01:00", worker);
  };

  // This useEffect sets the email subject and content to its corresponding fields (Name, Desc), and gets the email attachments
  useEffect(() => {
    const emailItem = Office.context.mailbox.item;

    const emailAttachments = emailItem.attachments;
    setAttachments(emailAttachments);

    if (emailItem.itemId) {
      setEmailSubject(emailItem.subject);
    } else {
      emailItem.subject.getAsync((result: Office.AsyncResult<string>) => {
        if (result.status === Office.AsyncResultStatus.Succeeded) {
          setEmailSubject(result.value);
        } else {
          console.error(result.error);
        }
      });
    }

    emailItem.body.getAsync("text", (result: Office.AsyncResult<string>) => {
      if (result.status === Office.AsyncResultStatus.Succeeded) {
        const body = result.value;
        setEmailBody(body);
      } else {
        console.error(result.error);
      }
    });
  }, []);

  return (
    <div>
      <hr />
      <form onSubmit={handleNewTask}>
        <div className="flex justify-center flex-col w-full text-center px-10 mb-3">
          <h1 className="text-lg my-3">{language.newTaskLabel}</h1>
          {errorMsg && <p className="text-red-500">{errorMsg}</p>}
          <label>
            <span className="mb-3">{language.dueTimeText}</span>
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
            placeholder={language.taskName}
            value={emailSubject}
            onChange={(e) => setEmailSubject(e.target.value)}
            className="w-full border-b-2 border-gray-300 px-1 py-2 my-1 focus:outline-none placeholder-gray-600"
          />
          <select
            className="w-full border-b-2 border-gray-300 py-2 my-1 text-gray-600 focus:outline-none"
            onChange={(e) => setWorker(e.target.value)}
          >
            <option value="" hidden>
              {language.workerText}
            </option>
            {userData?.map((user, index) => (
              <option key={index} value={JSON.stringify({ id: user.id, fullname: user.fullname })}>
                {user.fullname}
              </option>
            ))}
          </select>
          <textarea
            placeholder={language.taskText}
            value={emailBody}
            onChange={(e) => setEmailBody(e.target.value)}
            className="w-full border-2 border-gray-300 px-1 p-2 my-1 focus:outline-none placeholder-gray-600 rounded overflow-x-hidden"
          />
          <button type="submit" className="w-full my-2 rounded text-white p-2 bg-blue-500">
            {language.createTaskText}
          </button>
          {attachments.map((attachment, index) => (
            <div
              key={index}
              className="flex w-full text-start flex-col overflow-hidden p-2 border-gray-300 border-2 rounded drop-shadow my-2"
            >
              <div className="whitespace-nowrap flex justify-between w-full">
                {attachment.name.length > 20 ? attachment.name.substring(0, 20) + "..." : attachment.name}
                <span
                  className="ml-1 cursor-pointer"
                  onClick={() => {
                    const newAttachments = [...attachments];
                    newAttachments.splice(index, 1);
                    setAttachments(newAttachments);
                  }}
                >
                  ✖
                </span>
              </div>
            </div>
          ))}
        </div>
      </form>
    </div>
  );
};

export default Tasks;
