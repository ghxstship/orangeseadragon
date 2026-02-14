'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Download, 
  Search,
  ChevronDown,
  ChevronRight,
  Building2,
  Users
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface OrgNode {
  id: string;
  name: string;
  title: string;
  department?: string;
  avatarUrl?: string;
  email?: string;
  children?: OrgNode[];
  isExpanded?: boolean;
}

interface OrgChartProps {
  data?: OrgNode;
  onNodeClick?: (node: OrgNode) => void;
  onExport?: () => void;
}

const DEFAULT_ORG_DATA: OrgNode = {
  id: '1',
  name: 'Alex Thompson',
  title: 'Chief Executive Officer',
  department: 'Executive',
  isExpanded: true,
  children: [
    {
      id: '2',
      name: 'Sarah Chen',
      title: 'Chief Technology Officer',
      department: 'Engineering',
      isExpanded: true,
      children: [
        {
          id: '5',
          name: 'Tom Wilson',
          title: 'Engineering Manager',
          department: 'Engineering',
          isExpanded: false,
          children: [
            { id: '9', name: 'Dev Team A', title: '5 Engineers', department: 'Engineering' },
            { id: '10', name: 'Dev Team B', title: '4 Engineers', department: 'Engineering' },
          ]
        },
        {
          id: '6',
          name: 'Jane Martinez',
          title: 'Design Lead',
          department: 'Design',
          children: [
            { id: '11', name: 'UX Team', title: '3 Designers', department: 'Design' },
          ]
        },
      ]
    },
    {
      id: '3',
      name: 'Mike Roberts',
      title: 'Chief Financial Officer',
      department: 'Finance',
      isExpanded: false,
      children: [
        { id: '7', name: 'Finance Team', title: '6 Members', department: 'Finance' },
      ]
    },
    {
      id: '4',
      name: 'Lisa Anderson',
      title: 'Chief Operations Officer',
      department: 'Operations',
      isExpanded: true,
      children: [
        {
          id: '8',
          name: 'Chris Taylor',
          title: 'Operations Manager',
          department: 'Operations',
          children: [
            { id: '12', name: 'Ops Team', title: '8 Members', department: 'Operations' },
          ]
        },
        {
          id: '13',
          name: 'Pat Johnson',
          title: 'HR Director',
          department: 'Human Resources',
          children: [
            { id: '14', name: 'HR Team', title: '4 Members', department: 'Human Resources' },
          ]
        },
      ]
    },
  ]
};

const DEPARTMENT_COLORS: Record<string, string> = {
  'Executive': 'border-semantic-purple/50 bg-semantic-purple/10',
  'Engineering': 'border-semantic-info/50 bg-semantic-info/10',
  'Design': 'border-semantic-accent/50 bg-semantic-accent/10',
  'Finance': 'border-semantic-success/50 bg-semantic-success/10',
  'Operations': 'border-semantic-warning/50 bg-semantic-warning/10',
  'Human Resources': 'border-destructive/50 bg-destructive/10',
};

function OrgNodeCard({ 
  node, 
  onToggle, 
  onClick,
  level = 0 
}: { 
  node: OrgNode; 
  onToggle: (id: string) => void;
  onClick: (node: OrgNode) => void;
  level?: number;
}) {
  const hasChildren = node.children && node.children.length > 0;
  const departmentColor = DEPARTMENT_COLORS[node.department || ''] || 'border-muted-foreground/50 bg-muted/40';

  return (
    <div className="flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: level * 0.05 }}
        className={cn(
          "relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200",
          "hover:shadow-lg hover:scale-105",
          "bg-card/80 backdrop-blur-sm",
          departmentColor
        )}
        onClick={() => onClick(node)}
      >
        <div className="flex items-center gap-3 min-w-[180px]">
          <Avatar className="h-10 w-10 border border-border">
            {node.avatarUrl ? (
              <AvatarImage src={node.avatarUrl} alt={node.name} />
            ) : (
              <AvatarFallback className="bg-muted text-muted-foreground">
                {node.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-white text-sm truncate">{node.name}</p>
            <p className="text-xs text-muted-foreground truncate">{node.title}</p>
          </div>
        </div>
        
        {node.department && (
          <Badge 
            variant="outline" 
            className="mt-2 text-xs w-full justify-center border-border"
          >
            {node.department}
          </Badge>
        )}

        {hasChildren && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onToggle(node.id);
            }}
            className={cn(
              "absolute -bottom-3 left-1/2 -translate-x-1/2",
              "w-6 h-6 rounded-full bg-muted border border-border",
              "hover:bg-accent transition-colors"
            )}
          >
            {node.isExpanded ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
          </Button>
        )}
      </motion.div>

      {hasChildren && node.isExpanded && (
        <>
          <div className="w-px h-6 bg-muted" />
          <div className="relative flex gap-8">
            {node.children!.length > 1 && (
              <div className="absolute top-0 left-1/2 h-px w-[calc(100%-180px)] -translate-x-1/2 bg-muted" />
            )}
            {node.children!.map((child) => (
              <div key={child.id} className="flex flex-col items-center">
                <div className="w-px h-6 bg-muted" />
                <OrgNodeCard 
                  node={child} 
                  onToggle={onToggle} 
                  onClick={onClick}
                  level={level + 1}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function OrgChart({
  data = DEFAULT_ORG_DATA,
  onNodeClick,
  onExport,
}: OrgChartProps) {
  const [orgData, setOrgData] = useState<OrgNode>(data);
  const [zoom, setZoom] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleNode = useCallback((id: string) => {
    const toggleInTree = (node: OrgNode): OrgNode => {
      if (node.id === id) {
        return { ...node, isExpanded: !node.isExpanded };
      }
      if (node.children) {
        return { ...node, children: node.children.map(toggleInTree) };
      }
      return node;
    };
    setOrgData(prev => toggleInTree(prev));
  }, []);

  const handleNodeClick = useCallback((node: OrgNode) => {
    onNodeClick?.(node);
  }, [onNodeClick]);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5));
  const handleFit = () => setZoom(1);

  const totalNodes = useMemo(() => {
    const count = (node: OrgNode): number => {
      let total = 1;
      if (node.children) {
        node.children.forEach(child => {
          total += count(child);
        });
      }
      return total;
    };
    return count(orgData);
  }, [orgData]);

  return (
    <Card className="bg-card/80 border-border overflow-hidden">
      <CardHeader className="border-b border-border">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-foreground flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Organization Chart
            <Badge variant="secondary" className="ml-2">
              <Users className="w-3 h-3 mr-1" />
              {totalNodes} members
            </Badge>
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-48 h-8 bg-card/70 border-border"
              />
            </div>
            
            <div className="flex items-center gap-1 border-l border-border pl-2 ml-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={handleZoomOut}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-xs text-muted-foreground w-12 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={handleZoomIn}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={handleFit}
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>

            <Button 
              variant="outline" 
              size="sm"
              onClick={onExport}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-8 overflow-auto">
        <motion.div 
          initial={false}
          animate={{ scale: zoom }}
          transition={{ duration: 0.2 }}
          className="flex min-w-max justify-center origin-top"
        >
          <OrgNodeCard 
            node={orgData} 
            onToggle={toggleNode}
            onClick={handleNodeClick}
          />
        </motion.div>
      </CardContent>
    </Card>
  );
}
