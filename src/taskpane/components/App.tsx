import React from "react";
import Login from "./Login";
import Projects from "./Projects";
import Tasklists from "./Tasklists";
import Tasks from "./Tasks";
import Success from "./Success";
import axios, { AxiosResponse } from "axios";
import { en, cz, sk } from "../translations";
import { LanguageContext } from "../languagecontext";

const App = () => {
  const [page, setPage] = React.useState<string>("login");
  const [projectData, setProjectData] = React.useState<any>(null);
  const [userData, setUserData] = React.useState<any>(null);
  const [errorMsg, setErrorMsg] = React.useState<string>("");
  const [email, setEmail] = React.useState<string>("");
  const [apiKey, setApiKey] = React.useState<string>("");
  const [selectedProject, setSelectedProject] = React.useState<any>(null);
  const [selectedList, setSelectedList] = React.useState<any>(null);
  const [selectedTask, setSelectedTask] = React.useState<any>(null);
  const [language, setLanguage] = React.useState(en);

  const changeLanguage = (lang: string) => {
    const languageCode = lang.split("-")[0];
    switch (languageCode) {
      case "cs":
        setLanguage(cz);
        break;
      case "en":
        setLanguage(en);
        break;
      case "sk":
        setLanguage(sk);
        break;
      default:
        setLanguage(en);
    }
  };

  React.useEffect(() => {
    Office.onReady(() => {
      changeLanguage(Office.context.displayLanguage);
      const email = Office.context.roamingSettings.get("email");
      const key = Office.context.roamingSettings.get("key");
      if (email && key) {
        setEmail(email);
        setApiKey(key);
        setPage("projects");
        getProjectData(email, key);
      } else {
        console.log("Email or password is not available");
      }
    });
  }, []);

  //Resets the selected list after the selected project changes
  React.useEffect(() => {
    setSelectedList(null);
  }, [selectedProject]);

  //Gets the assignable users for the selected list / project
  React.useEffect(() => {
    if (page === "tasks" && selectedProject && selectedList) {
      getUserData(email, apiKey);
    }
  }, [page]);

  //Handle Change functions set selected projects, lists and pages
  const handleProjectChange = (selectedProject: any) => {
    setSelectedProject(selectedProject);
    if (selectedProject === null || undefined) {
      setPage("projects");
      setSelectedList(null);
      return;
    }
    console.log("Selected project", selectedProject);
    setPage("lists");
  };

  const handleListChange = (selectedList: any) => {
    setSelectedList(selectedList);
    if (selectedList === null) {
      setPage("lists");
      return;
    }
    console.log("Selected list", selectedList);
    setPage("tasks");
  };

  const handleLoginSuccess = async (email: string, apiKey: string) => {
    setApiKey(apiKey);
    setEmail(email);
    Office.context.roamingSettings.set("email", email);
    Office.context.roamingSettings.set("key", apiKey);
    Office.context.roamingSettings.saveAsync(function (asyncResult) {
      if (asyncResult.status === Office.AsyncResultStatus.Failed) {
        console.log("Failed to save settings. Error: " + asyncResult.error.message);
        setErrorMsg(asyncResult.error.message);
      }
    });
    getProjectData(email, apiKey);
  };

  const handleLogout = () => {
    Office.context.roamingSettings.remove("email");
    Office.context.roamingSettings.remove("key");
    Office.context.roamingSettings.saveAsync(function (asyncResult) {
      if (asyncResult.status === Office.AsyncResultStatus.Failed) {
        console.log("Failed to save settings. Error: " + asyncResult.error.message);
      }
    });
    setEmail("");
    setApiKey("");
    setPage("login");
  };

  //Get functions call the freelo API and get all the required data (Current projects, tasklists, workers)
  const getProjectData = async (email, apiKey) => {
    try {
      const response = await axios.get("https://api.freelo.io/v1/projects", {
        auth: {
          username: email,
          password: apiKey,
        },
        headers: {
          "User-Agent": "Freelo Outlook Add-in",
        },
      });
      setProjectData(response.data);
      setEmail(email);
      setApiKey(apiKey);
      setPage("projects");
      setErrorMsg("");
      return response.data;
    } catch (error) {
      console.error("Login failed", error.message);
      setErrorMsg(language.signInErrorMessage);
      throw error;
    }
  };

  const getUserData = async (email: string, apiKey: string) => {
    try {
      const response: AxiosResponse = await axios.get(
        "https://api.freelo.io/v1/project/" +
          selectedProject.id +
          "/tasklist/" +
          selectedList.id +
          "/assignable-workers",
        {
          auth: {
            username: email,
            password: apiKey,
          },
          headers: {
            "User-Agent": "Freelo Outlook Add-in",
          },
        }
      );
      setUserData(response.data);
      setErrorMsg("");
    } catch (error) {
      setErrorMsg(error.message);
    }
  };

  //Handle functions create new projects, tasklists or tasks.
  const handleNewProject = async (projectName, projectCurrency) => {
    try {
      console.log("Creating new project", projectName, projectCurrency);
      const response = await axios.post(
        "https://api.freelo.io/v1/projects",
        {
          name: projectName,
          currency_iso: projectCurrency,
        },
        {
          auth: {
            username: email,
            password: apiKey,
          },
          headers: {
            "User-Agent": "Freelo Outlook Add-in",
          },
        }
      );

      console.log("New project created", response.data);
      const updatedProjectData = await getProjectData(email, apiKey);
      console.log(updatedProjectData);
      const newProject = updatedProjectData.find((prj) => prj.id === response.data.id);
      if (newProject) {
        handleProjectChange(newProject);
        setErrorMsg("");
      } else {
        setErrorMsg("New project not found in updated project data");
      }
    } catch (error) {
      setErrorMsg(error.message);
    }
  };

  const handleNewList = async (listName: string, listBudget: number) => {
    try {
      if (!listName || !selectedProject) return;

      const response: AxiosResponse = await axios.post(
        "https://api.freelo.io/v1/project/" + selectedProject.id + "/tasklists",
        {
          name: listName,
          budget: listBudget * 100,
        },
        {
          auth: {
            username: email,
            password: apiKey,
          },
          headers: {
            "User-Agent": "Freelo Outlook Add-in",
          },
        }
      );
      console.log("Budget: ", listBudget);
      console.log("New list created", response.data);
      await getProjectData(email, apiKey);
      selectedProject.tasklists.unshift(response.data);
      handleListChange(selectedProject.tasklists[0]);
      console.log("New list selected", selectedList);
      setErrorMsg("");
    } catch (error) {
      console.error("New list failed", error.message);
      setErrorMsg(error.message);
    }
  };

  const handleNewTask = async (taskName: string, taskDescription: string, taskDeadline: string, worker: string) => {
    try {
      if (!selectedProject || !selectedList) return;
      const response: AxiosResponse = await axios.post(
        "https://api.freelo.io/v1/project/" + selectedProject.id + "/tasklist/" + selectedList.id + "/tasks",
        {
          name: taskName,
          comment: {
            content: taskDescription,
          },
          due_date: taskDeadline,
          worker: JSON.parse(worker).id,
        },
        {
          auth: {
            username: email,
            password: apiKey,
          },
          headers: {
            "User-Agent": "Freelo Outlook Add-in",
          },
        }
      );
      setSelectedTask(response.data.id);
      setPage("taskCreated");
    } catch (error) {
      setErrorMsg(error.message);
    }
  };

  const handleFileUpload = async (
    attachments: any[],
    taskName: string,
    taskDescription: string,
    taskDeadline: string,
    worker: string
  ) => {
    try {
      let files = [];
      for (const attachment of attachments) {
        const fileContent = await new Promise<string>((resolve, reject) => {
          Office.context.mailbox.item.getAttachmentContentAsync(
            attachment.id,
            { asyncContext: null },
            (asyncResult) => {
              if (asyncResult.status === Office.AsyncResultStatus.Succeeded) {
                resolve(asyncResult.value.content);
              } else {
                reject(new Error("Failed to get attachment content"));
              }
            }
          );
        });

        const byteCharacters = atob(fileContent);
        const byteNumbers = new Array(byteCharacters.length);

        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray]);
        const formData = new FormData();
        formData.append("file", blob);

        const response: AxiosResponse = await axios.post("https://api.freelo.io/v1/file/upload", formData, {
          auth: {
            username: email,
            password: apiKey,
          },
          headers: {
            "User-Agent": "Freelo Outlook Add-in",
          },
        });
        files.push({ uuid: response.data.uuid, name: attachment.name });
      }
      for (const file of files) {
        taskDescription += "<a data-freelo-uuid=" + file.uuid + ">" + file.name + "</a>";
      }
      handleNewTask(taskName, taskDescription, taskDeadline, worker);
    } catch (error) {
      setErrorMsg(error.message);
    }
  };

  //The pagination and htmx rendering are done here
  const renderPage = () => {
    switch (page) {
      case "login":
        return (
          <LanguageContext.Provider value={{ language, setLanguage }}>
            <Login onLoginSuccess={handleLoginSuccess} errorMsg={errorMsg} />
          </LanguageContext.Provider>
        );
      case "projects":
        return (
          <LanguageContext.Provider value={{ language, setLanguage }}>
            <Projects
              projects={projectData}
              onProjectChange={handleProjectChange}
              selectedProject={null}
              onNewProject={handleNewProject}
              errorMsg={errorMsg}
              logout={handleLogout}
            />
          </LanguageContext.Provider>
        );
      case "lists":
        return (
          <LanguageContext.Provider value={{ language, setLanguage }}>
            <Projects
              projects={projectData}
              onProjectChange={handleProjectChange}
              selectedProject={selectedProject}
              logout={handleLogout}
            />
            <Tasklists
              taskLists={selectedProject.tasklists}
              onListChange={handleListChange}
              selectedList={selectedList}
              onNewList={handleNewList}
              errorMsg={errorMsg}
            />
          </LanguageContext.Provider>
        );
      case "tasks":
        return (
          <LanguageContext.Provider value={{ language, setLanguage }}>
            <Projects
              projects={projectData}
              onProjectChange={handleProjectChange}
              selectedProject={selectedProject}
              logout={handleLogout}
            />
            <Tasklists
              taskLists={selectedProject.tasklists}
              onListChange={handleListChange}
              selectedList={selectedList}
              onNewList={handleNewList}
            />
            {userData ? (
              <Tasks userData={userData} onNewTask={handleFileUpload} errorMsg={errorMsg} />
            ) : (
              <div className="flex justify-center w-full">Loading...</div>
            )}
          </LanguageContext.Provider>
        );
      case "taskCreated":
        return (
          <LanguageContext.Provider value={{ language, setLanguage }}>
            <Success
              freeloLink={"https://app.freelo.io/task/" + selectedTask}
              returnHome={() => {
                setPage("tasks");
              }}
            />
          </LanguageContext.Provider>
        );
      case "loading":
        return (
          <LanguageContext.Provider value={{ language, setLanguage }}>
            <div className="flex justify-center w-full">Loading...</div>
          </LanguageContext.Provider>
        );
      default:
        return <div>Page not found</div>;
    }
  };

  return <div>{renderPage()}</div>;
};

export default App;
