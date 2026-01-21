"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { PageHeader, StatCard, StatGrid } from "@/components/common";
import {
  Search,
  BookOpen,
  Play,
  Clock,
  Award,
  CheckCircle,
  ListTodo,
} from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  lessons: number;
  completedLessons: number;
  status: "not_started" | "in_progress" | "completed";
  instructor: string;
  level: "beginner" | "intermediate" | "advanced";
}

const courses: Course[] = [
  {
    id: "1",
    title: "Event Planning Fundamentals",
    description: "Learn the basics of professional event planning",
    category: "Planning",
    duration: "4 hours",
    lessons: 12,
    completedLessons: 12,
    status: "completed",
    instructor: "Sarah Chen",
    level: "beginner",
  },
  {
    id: "2",
    title: "Advanced Audio Engineering",
    description: "Master sound systems for large-scale events",
    category: "Technical",
    duration: "6 hours",
    lessons: 18,
    completedLessons: 10,
    status: "in_progress",
    instructor: "Mike Johnson",
    level: "advanced",
  },
  {
    id: "3",
    title: "Vendor Management Best Practices",
    description: "Effective strategies for managing event vendors",
    category: "Management",
    duration: "3 hours",
    lessons: 8,
    completedLessons: 0,
    status: "not_started",
    instructor: "Emily Watson",
    level: "intermediate",
  },
  {
    id: "4",
    title: "Safety & Compliance Training",
    description: "Essential safety protocols for event professionals",
    category: "Compliance",
    duration: "2 hours",
    lessons: 6,
    completedLessons: 6,
    status: "completed",
    instructor: "David Park",
    level: "beginner",
  },
];

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  not_started: { label: "Not Started", color: "bg-gray-500", icon: Play },
  in_progress: { label: "In Progress", color: "bg-blue-500", icon: Clock },
  completed: { label: "Completed", color: "bg-green-500", icon: CheckCircle },
};

const levelConfig: Record<string, { color: string }> = {
  beginner: { color: "bg-green-500" },
  intermediate: { color: "bg-yellow-500" },
  advanced: { color: "bg-red-500" },
};

export default function LearningPage() {
  const completedCourses = courses.filter((c) => c.status === "completed").length;
  const inProgressCourses = courses.filter((c) => c.status === "in_progress").length;
  const totalLessons = courses.reduce((acc, c) => acc + c.lessons, 0);
  const completedLessons = courses.reduce((acc, c) => acc + c.completedLessons, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Learning"
        description="Training courses and certifications"
        actions={
          <Button>
            <BookOpen className="mr-2 h-4 w-4" />
            Browse Catalog
          </Button>
        }
      />

      <StatGrid columns={4}>
        <StatCard
          title="Total Courses"
          value={courses.length}
          icon={BookOpen}
        />
        <StatCard
          title="Completed"
          value={completedCourses}
          valueClassName="text-green-500"
          icon={CheckCircle}
        />
        <StatCard
          title="In Progress"
          value={inProgressCourses}
          valueClassName="text-blue-500"
          icon={Clock}
        />
        <StatCard
          title="Lessons Completed"
          value={`${completedLessons}/${totalLessons}`}
          icon={ListTodo}
        />
      </StatGrid>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search courses..." className="pl-9" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            My Courses
          </CardTitle>
          <CardDescription>Your enrolled courses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {courses.map((course) => {
              const status = statusConfig[course.status];
              const level = levelConfig[course.level];
              const StatusIcon = status.icon;
              const progress = (course.completedLessons / course.lessons) * 100;

              return (
                <div key={course.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{course.title}</h4>
                        <Badge className={`${status.color} text-white`}>
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {status.label}
                        </Badge>
                        <Badge className={`${level.color} text-white`}>{course.level}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{course.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <Badge variant="outline">{course.category}</Badge>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {course.duration}
                        </span>
                        <span>Instructor: {course.instructor}</span>
                      </div>
                      
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span>{course.completedLessons}/{course.lessons} lessons</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    </div>

                    <Button variant={course.status === "completed" ? "outline" : "default"} size="sm" className="ml-4">
                      {course.status === "completed" ? (
                        <>
                          <Award className="mr-2 h-4 w-4" />
                          Certificate
                        </>
                      ) : course.status === "in_progress" ? (
                        "Continue"
                      ) : (
                        "Start"
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
