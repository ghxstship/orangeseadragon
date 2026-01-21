import type { HierarchyPageConfig } from "./hierarchy-types";

export const peopleOrgChartPageConfig: HierarchyPageConfig = {
  id: "people-org-chart",
  title: "Organization Chart",
  description: "Company structure visualization",
  viewType: "org-chart",

  node: {
    idField: "id",
    parentField: "parentId",
    labelField: "name",
    subtitleField: "title",
    avatarField: "avatar",
  },

  orgChart: {
    direction: "top-down",
    nodeWidth: 180,
    nodeHeight: 80,
    levelSeparation: 60,
    siblingSeparation: 30,
  },

  toolbar: {
    search: { enabled: true, placeholder: "Search people..." },
    expandAll: true,
    collapseAll: true,
    zoom: true,
    fullscreen: true,
    export: { enabled: true, formats: ["png", "pdf"] },
  },

  actions: {
    select: true,
    edit: false,
  },

  display: {
    showRoot: true,
    animateTransitions: true,
  },
};
