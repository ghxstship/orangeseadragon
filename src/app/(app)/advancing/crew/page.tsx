'use client';

import { useState } from 'react';
import { 
  Users, 
  Plus, 
  Search,
  Filter,
  Download,
  Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CrewScheduler } from '@/components/modules/advancing';

export default function CrewSchedulingPage() {
  const [view, setView] = useState<'calendar' | 'list'>('calendar');

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" />
            Crew Scheduling
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage crew assignments and availability
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Crew Member
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search crew members..." 
            className="pl-10"
          />
        </div>
        
        <Select defaultValue="all">
          <SelectTrigger className="w-[150px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="on_leave">On Leave</SelectItem>
          </SelectContent>
        </Select>

        <Select defaultValue="all">
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            <SelectItem value="audio">Audio</SelectItem>
            <SelectItem value="lighting">Lighting</SelectItem>
            <SelectItem value="video">Video</SelectItem>
            <SelectItem value="stage">Stage</SelectItem>
            <SelectItem value="production">Production</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center border rounded-lg p-1">
          <Button 
            variant={view === 'calendar' ? 'secondary' : 'ghost'} 
            size="sm"
            onClick={() => setView('calendar')}
          >
            Calendar
          </Button>
          <Button 
            variant={view === 'list' ? 'secondary' : 'ghost'} 
            size="sm"
            onClick={() => setView('list')}
          >
            List
          </Button>
        </div>
      </div>

      {/* Main Content */}
      {view === 'calendar' ? (
        <CrewScheduler />
      ) : (
        <div className="border rounded-lg p-8 text-center text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>List view coming soon</p>
        </div>
      )}
    </div>
  );
}
