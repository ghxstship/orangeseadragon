export type HierarchyViewType = "tree" | "org-chart" | "graph" | "matrix" | "sunburst";

export interface NodeConfig {
  idField: string;
  parentField: string;
  labelField: string;
  subtitleField?: string;
  avatarField?: string;
  badgeField?: string;
  colorField?: string;
  iconField?: string;
}

export interface TreeConfig {
  expandable: boolean;
  defaultExpanded?: boolean | number;
  showLines?: boolean;
  indent?: number;
}

export interface OrgChartConfig {
  direction: "top-down" | "bottom-up" | "left-right" | "right-left";
  nodeWidth?: number;
  nodeHeight?: number;
  levelSeparation?: number;
  siblingSeparation?: number;
}

export interface GraphConfig {
  layout: "force" | "hierarchical" | "circular" | "grid";
  edgeField?: string;
  edgeLabelField?: string;
  physics?: boolean;
}

export interface MatrixConfig {
  rowField: string;
  columnField: string;
  valueField: string;
  colorScale?: string[];
}

export interface HierarchyPageConfig {
  id: string;
  title: string;
  description?: string;
  viewType: HierarchyViewType;
  node: NodeConfig;
  tree?: TreeConfig;
  orgChart?: OrgChartConfig;
  graph?: GraphConfig;
  matrix?: MatrixConfig;
  toolbar?: {
    search?: { enabled: boolean; placeholder?: string };
    expandAll?: boolean;
    collapseAll?: boolean;
    zoom?: boolean;
    fullscreen?: boolean;
    export?: { enabled: boolean; formats?: string[] };
  };
  actions?: {
    select?: boolean;
    edit?: boolean;
    add?: boolean;
    delete?: boolean;
    move?: boolean;
  };
  display?: {
    showRoot?: boolean;
    maxDepth?: number;
    animateTransitions?: boolean;
  };
}
