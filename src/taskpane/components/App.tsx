import * as React from "react";
import Login from "./Login";
import Projects from "./Projects";
import Tasklists from "./Tasklists";
import Tasks from "./Tasks";
import axios, { AxiosResponse } from "axios";

const App = () => {
  const [page, setPage] = React.useState<string>("login");
  const [projectData, setProjectData] = React.useState<any>(null);
  const [userData, setUserData] = React.useState<any>(null);
  const [errorMsg, setErrorMsg] = React.useState<string>("");
  const [email, setEmail] = React.useState<string>("");
  const [apiKey, setApiKey] = React.useState<string>("");
  const [selectedProject, setSelectedProject] = React.useState<any>(null);
  const [selectedList, setSelectedList] = React.useState<any>(null);

  //Resets the selected list after the selected project changes
  React.useEffect(() => {
    setSelectedList(null);
  }, [selectedProject]);

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
    await getProjectData(email, apiKey);
    await getUserData(email, apiKey);
  };

  //Get functions call the freelo API and get all the required data (Current projects, tasklists, workers)
  const getProjectData = async (email, apiKey) => {
    try {
      const response = await axios.get(
        "https://corsproxy.io/?" + encodeURIComponent("https://api.freelo.io/v1/projects"),
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

      console.log("Login successful", response.data);
      setProjectData(response.data);
      setEmail(email);
      setApiKey(apiKey);

      return response.data;
    } catch (error) {
      console.error("Login failed", error.message);
      setErrorMsg(error.message);
      throw error;
    }
  };

  const getUserData = async (email: string, apiKey: string) => {
    try {
      const response: AxiosResponse = await axios.get(
        "https://corsproxy.io/?" + encodeURIComponent("https://api.freelo.io/v1/users"),
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
      setUserData(response.data.data.users);
      console.log(response.data.data.users);
      setErrorMsg("");
      setPage("projects");
    } catch (error) {
      setErrorMsg(error.message);
    }
  };

  //Handle functions create new projects, tasklists or tasks.
  const handleNewProject = async (projectName, projectCurrency) => {
    try {
      console.log("Creating new project", projectName, projectCurrency);
      const response = await axios.post(
        "https://corsproxy.io/?" + encodeURIComponent("https://api.freelo.io/v1/projects"),
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
        console.error("New project not found in updated project data");
        setErrorMsg("New project not found in updated project data");
      }
    } catch (error) {
      console.error("New project failed", error.message);
      setErrorMsg(error.message);
    }
  };
  const handleNewList = async (listName: string, listBudget: number) => {
    try {
      if (!listName || !selectedProject) return;

      const response: AxiosResponse = await axios.post(
        "https://corsproxy.io/?" +
          encodeURIComponent("https://api.freelo.io/v1/project/" + selectedProject.id + "/tasklists"),
        {
          name: listName,
          budget: {
            amount: listBudget,
            currency: selectedProject.cost.currency,
          },
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
      console.log("Creating new task", {
        name: taskName,
        comment: {
          content: taskDescription,
        },
        due_date: taskDeadline,
        worker: {
          id: JSON.parse(worker).id,
          fullname: JSON.parse(worker).fullname,
        },
      });
      const response: AxiosResponse = await axios.post(
        "https://corsproxy.io/?" +
          encodeURIComponent(
            "https://api.freelo.io/v1/project/" + selectedProject.id + "/tasklist/" + selectedList.id + "/tasks"
          ),
        {
          name: taskName,
          comment: {
            content: taskDescription,
          },
          due_date: taskDeadline,
          // worker: {
          //   id: JSON.parse(worker).id,
          //   fullname: JSON.parse(worker).fullname,
          // },
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
      console.log("New task created", response.data);
      setErrorMsg("");
    } catch (error) {
      console.error("New task failed", error.message);
      console.log("https://api.freelo.io/v1/project/" + selectedProject.id + "/tasklist/" + selectedList.id + "/tasks");
      setErrorMsg(error.message);
    }
  };

  //The pagination and htmx rendering are done here
  const renderPage = () => {
    switch (page) {
      case "login":
        return <Login onLoginSuccess={handleLoginSuccess} errorMsg={errorMsg} />;
      case "projects":
        return (
          <Projects
            projects={projectData}
            onProjectChange={handleProjectChange}
            selectedProject={null}
            onNewProject={handleNewProject}
            errorMsg={errorMsg}
          />
        );
      case "lists":
        return (
          <div>
            <Projects projects={projectData} onProjectChange={handleProjectChange} selectedProject={selectedProject} />
            <Tasklists
              taskLists={selectedProject.tasklists}
              onListChange={handleListChange}
              selectedList={selectedList}
              onNewList={handleNewList}
              errorMsg={errorMsg}
            />
          </div>
        );
      case "tasks":
        return (
          <div>
            <Projects projects={projectData} onProjectChange={handleProjectChange} selectedProject={selectedProject} />
            <Tasklists
              taskLists={selectedProject.tasklists}
              onListChange={handleListChange}
              selectedList={selectedList}
              onNewList={handleNewList}
            />
            <Tasks userData={userData} onNewTask={handleNewTask} errorMsg={errorMsg} />
          </div>
        );
      default:
        return <div>Page not found</div>;
    }
  };

  return <div>{renderPage()}</div>;
};

export default App;
