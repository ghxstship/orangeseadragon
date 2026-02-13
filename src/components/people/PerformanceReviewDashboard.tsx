'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Target, 
  Award, 
  MessageSquare,
  ChevronRight,
  Star,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

type ReviewStatus = 'not_started' | 'self_review' | 'manager_review' | 'calibration' | 'completed';
type GoalStatus = 'on_track' | 'at_risk' | 'behind' | 'completed';

interface ReviewCycle {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'upcoming' | 'completed';
  completionRate: number;
}

interface EmployeeReview {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeAvatar?: string;
  department: string;
  status: ReviewStatus;
  selfReviewComplete: boolean;
  managerReviewComplete: boolean;
  overallRating?: number;
  dueDate: Date;
}

interface Goal {
  id: string;
  title: string;
  description?: string;
  progress: number;
  status: GoalStatus;
  dueDate: Date;
  keyResults?: { title: string; progress: number }[];
}

interface PerformanceReviewDashboardProps {
  currentCycle?: ReviewCycle;
  reviews?: EmployeeReview[];
  goals?: Goal[];
  isManager?: boolean;
  onStartReview?: (reviewId: string) => void;
  onViewReview?: (reviewId: string) => void;
}

const STATUS_CONFIG: Record<ReviewStatus, { label: string; color: string; bgColor: string }> = {
  not_started: { label: 'Not Started', color: 'text-zinc-400', bgColor: 'bg-zinc-500/20' },
  self_review: { label: 'Self Review', color: 'text-semantic-info', bgColor: 'bg-semantic-info/20' },
  manager_review: { label: 'Manager Review', color: 'text-semantic-warning', bgColor: 'bg-semantic-warning/20' },
  calibration: { label: 'Calibration', color: 'text-semantic-purple', bgColor: 'bg-semantic-purple/20' },
  completed: { label: 'Completed', color: 'text-semantic-success', bgColor: 'bg-semantic-success/20' },
};

const GOAL_STATUS_CONFIG: Record<GoalStatus, { label: string; color: string }> = {
  on_track: { label: 'On Track', color: 'text-semantic-success' },
  at_risk: { label: 'At Risk', color: 'text-semantic-warning' },
  behind: { label: 'Behind', color: 'text-destructive' },
  completed: { label: 'Completed', color: 'text-semantic-info' },
};

const DEFAULT_CYCLE: ReviewCycle = {
  id: '',
  name: 'No Active Cycle',
  startDate: new Date(),
  endDate: new Date(),
  status: 'upcoming',
  completionRate: 0,
};

export function PerformanceReviewDashboard({
  currentCycle = DEFAULT_CYCLE,
  reviews = [],
  goals = [],
  isManager = true,
  onStartReview,
  onViewReview,
}: PerformanceReviewDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const completedReviews = reviews.filter(r => r.status === 'completed').length;
  const pendingReviews = reviews.filter(r => r.status !== 'completed' && r.status !== 'not_started').length;
  const notStartedReviews = reviews.filter(r => r.status === 'not_started').length;

  const daysRemaining = Math.ceil((currentCycle.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              "w-4 h-4",
              star <= Math.floor(rating) 
                ? "fill-semantic-warning text-semantic-warning" 
                : star - 0.5 <= rating 
                  ? "fill-semantic-warning/50 text-semantic-warning" 
                  : "text-zinc-600"
            )}
          />
        ))}
        <span className="ml-1 text-sm text-zinc-400">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-6 h-6" />
            Performance Reviews
          </h2>
          <p className="text-sm text-zinc-400 mt-1">{currentCycle.name}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className={cn(
            daysRemaining <= 7 ? "border-destructive/50 text-destructive" : "border-semantic-warning/50 text-semantic-warning"
          )}>
            <Clock className="w-3 h-3 mr-1" />
            {daysRemaining} days remaining
          </Badge>
          {!isManager && (
            <Button onClick={() => onStartReview?.('self')}>
              Start Self Review
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-zinc-900/60 border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Cycle Progress</p>
                <p className="text-3xl font-bold text-white">{currentCycle.completionRate}%</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
            </div>
            <Progress value={currentCycle.completionRate} className="mt-3 h-2" />
          </CardContent>
        </Card>

        <Card className="bg-semantic-success/10 border-semantic-success/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-semantic-success/70">Completed</p>
                <p className="text-3xl font-bold text-semantic-success">{completedReviews}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-semantic-success/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-semantic-warning/10 border-semantic-warning/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-semantic-warning/70">In Progress</p>
                <p className="text-3xl font-bold text-semantic-warning">{pendingReviews}</p>
              </div>
              <Clock className="w-8 h-8 text-semantic-warning/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-800/50 border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Not Started</p>
                <p className="text-3xl font-bold text-zinc-300">{notStartedReviews}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-zinc-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-zinc-800/50">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="goals">Goals & OKRs</TabsTrigger>
          {isManager && <TabsTrigger value="team">Team Reviews</TabsTrigger>}
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          {/* My Review Status (for non-managers or self) */}
          <Card className="bg-zinc-900/60 border-border">
            <CardHeader>
              <CardTitle className="text-lg text-zinc-300">My Review Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      reviews[0]?.selfReviewComplete ? "bg-semantic-success/20" : "bg-semantic-warning/20"
                    )}>
                      {reviews[0]?.selfReviewComplete ? (
                        <CheckCircle2 className="w-5 h-5 text-semantic-success" />
                      ) : (
                        <Clock className="w-5 h-5 text-semantic-warning" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-white">Self Review</p>
                      <p className="text-sm text-zinc-500">
                        {reviews[0]?.selfReviewComplete ? 'Completed' : 'Pending'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      reviews[0]?.managerReviewComplete ? "bg-semantic-success/20" : "bg-zinc-700"
                    )}>
                      {reviews[0]?.managerReviewComplete ? (
                        <CheckCircle2 className="w-5 h-5 text-semantic-success" />
                      ) : (
                        <Users className="w-5 h-5 text-zinc-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-white">Manager Review</p>
                      <p className="text-sm text-zinc-500">
                        {reviews[0]?.managerReviewComplete ? 'Completed' : 'Awaiting'}
                      </p>
                    </div>
                  </div>
                </div>
                {reviews[0]?.overallRating && (
                  <div className="text-center p-6 bg-zinc-800/50 rounded-xl">
                    <p className="text-sm text-zinc-400 mb-2">Overall Rating</p>
                    {renderStars(reviews[0].overallRating)}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 bg-zinc-800/50 border-border">
              <Target className="w-6 h-6 text-blue-400" />
              <span>Update Goals</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 bg-zinc-800/50 border-border">
              <MessageSquare className="w-6 h-6 text-purple-400" />
              <span>Request Feedback</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 bg-zinc-800/50 border-border">
              <Award className="w-6 h-6 text-semantic-warning" />
              <span>View Achievements</span>
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="goals" className="mt-6">
          <Card className="bg-zinc-900/60 border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg text-zinc-300">Goals & Key Results</CardTitle>
              <Button size="sm">Add Goal</Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {goals.map((goal, index) => {
                const statusConfig = GOAL_STATUS_CONFIG[goal.status];
                return (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 rounded-lg bg-zinc-800/30 border border-border"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-zinc-500" />
                          <h4 className="font-medium text-white">{goal.title}</h4>
                        </div>
                        <p className="text-xs text-zinc-500 mt-1">
                          Due {goal.dueDate.toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="outline" className={cn("text-xs", statusConfig.color)}>
                        {statusConfig.label}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-400">Progress</span>
                        <span className="text-white font-medium">{goal.progress}%</span>
                      </div>
                      <Progress value={goal.progress} className="h-2" />
                    </div>
                    {goal.keyResults && goal.keyResults.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-border space-y-2">
                        {goal.keyResults.map((kr, i) => (
                          <div key={i} className="flex items-center justify-between text-sm">
                            <span className="text-zinc-500">{kr.title}</span>
                            <span className="text-zinc-400">{kr.progress}%</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {isManager && (
          <TabsContent value="team" className="mt-6">
            <Card className="bg-zinc-900/60 border-border">
              <CardHeader>
                <CardTitle className="text-lg text-zinc-300">Team Reviews</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {reviews.map((review, index) => {
                  const statusConfig = STATUS_CONFIG[review.status];
                  return (
                    <motion.div
                      key={review.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-4 p-4 rounded-lg bg-zinc-800/30 border border-border hover:bg-zinc-800/50 cursor-pointer transition-colors"
                      onClick={() => onViewReview?.(review.id)}
                    >
                      <Avatar className="h-10 w-10">
                        {review.employeeAvatar ? (
                          <AvatarImage src={review.employeeAvatar} />
                        ) : (
                          <AvatarFallback className="bg-zinc-700">
                            {review.employeeName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white">{review.employeeName}</p>
                        <p className="text-sm text-zinc-500">{review.department}</p>
                      </div>
                      <Badge variant="outline" className={cn("text-xs", statusConfig.color, statusConfig.bgColor)}>
                        {statusConfig.label}
                      </Badge>
                      {review.overallRating && renderStars(review.overallRating)}
                      <ChevronRight className="w-5 h-5 text-zinc-600" />
                    </motion.div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
