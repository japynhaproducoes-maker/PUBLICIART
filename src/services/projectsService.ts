import { projectsApi } from "@/lib/api";

export const projectsService = {
  getProjects: projectsApi.listForUser.bind(projectsApi),
  getAllProjects: projectsApi.listAll.bind(projectsApi),
  getProject: projectsApi.get.bind(projectsApi),
  createProject: projectsApi.create.bind(projectsApi),
  updateProject: projectsApi.update.bind(projectsApi),
  deleteProject: projectsApi.remove.bind(projectsApi),
};
