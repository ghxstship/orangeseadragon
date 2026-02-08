/**
 * Mobile App Configuration (COMPVSS)
 * Configuration for the mobile companion app
 */

import {
  MobileAppConfig,
  MobileScreen,
  MobileNavigation,
} from "./types";

export const mobileScreens: MobileScreen[] = [
  {
    id: "home",
    name: "Home",
    path: "/",
    icon: "home",
    viewType: "dashboard",
    requiresAuth: true,
    offlineSupport: true,
    cacheStrategy: { type: "stale-while-revalidate", maxAge: 300 },
  },
  {
    id: "events",
    name: "Events",
    path: "/events",
    icon: "calendar",
    viewType: "list",
    requiresAuth: true,
    offlineSupport: true,
    cacheStrategy: { type: "network-first", maxAge: 60 },
  },
  {
    id: "event-detail",
    name: "Event Detail",
    path: "/events/:id",
    icon: "calendar",
    viewType: "detail",
    requiresAuth: true,
    offlineSupport: true,
    cacheStrategy: { type: "cache-first", maxAge: 300 },
  },
  {
    id: "tasks",
    name: "Tasks",
    path: "/tasks",
    icon: "check-square",
    viewType: "list",
    requiresAuth: true,
    offlineSupport: true,
    cacheStrategy: { type: "network-first", maxAge: 60 },
  },
  {
    id: "schedule",
    name: "Schedule",
    path: "/schedule",
    icon: "clock",
    viewType: "calendar",
    requiresAuth: true,
    offlineSupport: true,
    cacheStrategy: { type: "network-first", maxAge: 120 },
  },
  {
    id: "messages",
    name: "Messages",
    path: "/messages",
    icon: "message-circle",
    viewType: "chat",
    requiresAuth: true,
    offlineSupport: true,
    cacheStrategy: { type: "network-first", maxAge: 30 },
  },
  {
    id: "notifications",
    name: "Notifications",
    path: "/notifications",
    icon: "bell",
    viewType: "list",
    requiresAuth: true,
    offlineSupport: false,
  },
  {
    id: "profile",
    name: "Profile",
    path: "/profile",
    icon: "user",
    viewType: "detail",
    requiresAuth: true,
    offlineSupport: true,
    cacheStrategy: { type: "cache-first", maxAge: 3600 },
  },
  {
    id: "settings",
    name: "Settings",
    path: "/settings",
    icon: "settings",
    viewType: "list",
    requiresAuth: true,
    offlineSupport: true,
  },
  {
    id: "scanner",
    name: "Scanner",
    path: "/scanner",
    icon: "scan",
    viewType: "card",
    requiresAuth: true,
    offlineSupport: false,
  },
  {
    id: "check-in",
    name: "Check-In",
    path: "/check-in",
    icon: "user-check",
    viewType: "form",
    requiresAuth: true,
    offlineSupport: true,
    cacheStrategy: { type: "cache-first", maxAge: 3600 },
  },
  {
    id: "inventory",
    name: "Inventory",
    path: "/inventory",
    icon: "package",
    viewType: "list",
    requiresAuth: true,
    offlineSupport: true,
    cacheStrategy: { type: "network-first", maxAge: 300 },
  },
  {
    id: "map",
    name: "Map",
    path: "/map",
    icon: "map",
    viewType: "map",
    requiresAuth: true,
    offlineSupport: false,
  },
  {
    id: "reports",
    name: "Reports",
    path: "/reports",
    icon: "bar-chart",
    viewType: "dashboard",
    requiresAuth: true,
    offlineSupport: false,
  },
];

export const mobileNavigation: MobileNavigation = {
  type: "tabs",
  position: "bottom",
  items: [
    {
      id: "home",
      label: "Home",
      icon: "home",
      screen: "home",
    },
    {
      id: "events",
      label: "Events",
      icon: "calendar",
      screen: "events",
    },
    {
      id: "tasks",
      label: "Tasks",
      icon: "check-square",
      screen: "tasks",
    },
    {
      id: "messages",
      label: "Messages",
      icon: "message-circle",
      screen: "messages",
      badge: 3,
    },
    {
      id: "more",
      label: "More",
      icon: "menu",
      screen: "more",
      children: [
        { id: "schedule", label: "Schedule", icon: "clock", screen: "schedule" },
        { id: "inventory", label: "Inventory", icon: "package", screen: "inventory" },
        { id: "scanner", label: "Scanner", icon: "scan", screen: "scanner" },
        { id: "map", label: "Map", icon: "map", screen: "map" },
        { id: "reports", label: "Reports", icon: "bar-chart", screen: "reports" },
        { id: "profile", label: "Profile", icon: "user", screen: "profile" },
        { id: "settings", label: "Settings", icon: "settings", screen: "settings" },
      ],
    },
  ],
};

export const mobileAppConfig: MobileAppConfig = {
  name: "Unified Ops",
  version: "1.0.0",
  buildNumber: 1,
  bundleId: "com.example.unifiedops",
  navigation: mobileNavigation,
  screens: mobileScreens,
  offline: {
    enabled: true,
    syncStrategy: "auto",
    conflictResolution: "server-wins",
    maxOfflineItems: 1000,
    syncInterval: 300000, // 5 minutes
  },
  pushNotifications: {
    enabled: true,
    channels: [
      {
        id: "events",
        name: "Events",
        description: "Event reminders and updates",
        importance: "high",
      },
      {
        id: "tasks",
        name: "Tasks",
        description: "Task assignments and deadlines",
        importance: "high",
      },
      {
        id: "messages",
        name: "Messages",
        description: "New messages and chat notifications",
        importance: "default",
      },
      {
        id: "system",
        name: "System",
        description: "System updates and announcements",
        importance: "low",
      },
    ],
    defaultSound: true,
    defaultVibrate: true,
  },
  biometric: {
    enabled: true,
    types: ["fingerprint", "face"],
    fallbackToPin: true,
    timeout: 300000, // 5 minutes
  },
  deepLinking: {
    scheme: "unifiedops",
    host: "app.example.com",
    routes: [
      { path: "/events/:id", screen: "event-detail", params: ["id"] },
      { path: "/tasks/:id", screen: "task-detail", params: ["id"] },
      { path: "/messages/:id", screen: "chat", params: ["id"] },
      { path: "/check-in/:eventId", screen: "check-in", params: ["eventId"] },
    ],
  },
  analytics: {
    enabled: true,
    providers: ["firebase"],
    trackScreenViews: true,
    trackUserActions: true,
    anonymizeIp: true,
  },
};

export const mobileListConfigs = {
  events: {
    itemHeight: "auto" as const,
    pullToRefresh: true,
    infiniteScroll: true,
    swipeActions: [
      {
        id: "edit",
        label: "Edit",
        icon: "edit",
        color: "hsl(var(--primary))",
        position: "right" as const,
        handler: "editEvent",
      },
      {
        id: "delete",
        label: "Delete",
        icon: "trash",
        color: "hsl(var(--destructive))",
        position: "right" as const,
        destructive: true,
        handler: "deleteEvent",
      },
    ],
    emptyState: {
      icon: "calendar",
      title: "No Events",
      message: "You don't have any events yet",
      action: {
        label: "Create Event",
        handler: "createEvent",
      },
    },
    searchable: true,
    filterable: true,
    sortable: true,
  },
  tasks: {
    itemHeight: 72,
    pullToRefresh: true,
    infiniteScroll: true,
    swipeActions: [
      {
        id: "complete",
        label: "Complete",
        icon: "check",
        color: "hsl(var(--chart-income))",
        position: "left" as const,
        handler: "completeTask",
      },
      {
        id: "delete",
        label: "Delete",
        icon: "trash",
        color: "hsl(var(--destructive))",
        position: "right" as const,
        destructive: true,
        handler: "deleteTask",
      },
    ],
    emptyState: {
      icon: "check-square",
      title: "No Tasks",
      message: "All caught up! No tasks pending",
      action: {
        label: "Add Task",
        handler: "createTask",
      },
    },
    searchable: true,
    filterable: true,
    sortable: true,
  },
};

export const mobileFormConfigs = {
  checkIn: {
    sections: [
      {
        id: "attendee",
        title: "Attendee Information",
        fields: [
          {
            id: "name",
            name: "name",
            label: "Full Name",
            type: "text" as const,
            required: true,
            validation: [{ type: "required" as const, message: "Name is required" }],
          },
          {
            id: "email",
            name: "email",
            label: "Email",
            type: "email" as const,
            required: true,
            validation: [
              { type: "required" as const, message: "Email is required" },
              { type: "email" as const, message: "Invalid email format" },
            ],
          },
          {
            id: "phone",
            name: "phone",
            label: "Phone",
            type: "phone" as const,
            required: false,
          },
        ],
      },
      {
        id: "verification",
        title: "Verification",
        fields: [
          {
            id: "ticketCode",
            name: "ticketCode",
            label: "Ticket Code",
            type: "text" as const,
            placeholder: "Scan or enter ticket code",
            required: true,
          },
          {
            id: "signature",
            name: "signature",
            label: "Signature",
            type: "signature" as const,
            required: false,
          },
        ],
      },
    ],
    submitLabel: "Check In",
    cancelLabel: "Cancel",
    validation: "onSubmit" as const,
    autoSave: false,
  },
};
