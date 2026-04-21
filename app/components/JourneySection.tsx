"use client";

import React, { useState, useEffect, useRef, forwardRef } from "react";
import { 
  ArrowRight, 
  Link as LinkIcon, 
  Zap, 
  Calendar, 
  Code, 
  FileText, 
  User, 
  Clock,
  MapPin
} from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";

// --- UTILITIES ---
function cn(...inputs: (string | undefined | null | boolean | Record<string, boolean>)[]) {
  return inputs
    .flatMap((input) => {
      if (!input) return [];
      if (typeof input === "string") return input.split(" ");
      return Object.entries(input)
        .filter(([_, value]) => value)
        .map(([key]) => key);
    })
    .join(" ");
}

// --- SHADCN COMPONENTS (Integrated) ---

// Badge Component
const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-white text-black hover:bg-white/80",
        secondary: "border-transparent bg-zinc-800 text-zinc-100 hover:bg-zinc-800/80",
        destructive: "border-transparent bg-red-900 text-red-100 hover:bg-red-900/80",
        outline: "text-zinc-100 border-zinc-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}
function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

// Button Component
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-white text-black hover:bg-white/90",
        destructive: "bg-red-600 text-white hover:bg-red-600/90",
        outline: "border border-zinc-800 bg-transparent hover:bg-zinc-900 hover:text-white",
        secondary: "bg-zinc-800 text-zinc-100 hover:bg-zinc-800/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-white underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}
const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
});
Button.displayName = "Button";

// Card Component
const Card = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("rounded-lg border border-zinc-800 bg-black text-white shadow-sm", className)} {...props} />
));
Card.displayName = "Card";

const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
));
CardHeader.displayName = "CardHeader";

const CardTitle = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(({ className, ...props }, ref) => (
  <h3 ref={ref} className={cn("text-2xl font-semibold leading-none tracking-tight", className)} {...props} />
));
CardTitle.displayName = "CardTitle";

const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

// --- MAIN RADIAL ORBITAL TIMELINE COMPONENT ---

interface TimelineItem {
  id: number;
  title: string;
  date: string;
  content: string;
  category: string;
  icon: React.ElementType;
  relatedIds: number[];
  status: "completed" | "in-progress" | "pending";
  energy: number;
}

interface RadialOrbitalTimelineProps {
  timelineData: TimelineItem[];
}

function RadialOrbitalTimeline({ timelineData }: RadialOrbitalTimelineProps) {
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({});
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [pulseEffect, setPulseEffect] = useState<Record<number, boolean>>({});
  const [activeNodeId, setActiveNodeId] = useState<number | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const handleContainerClick = (e: React.MouseEvent) => {
    if (e.target === containerRef.current || e.target === orbitRef.current) {
      setExpandedItems({});
      setActiveNodeId(null);
      setPulseEffect({});
      setAutoRotate(true);
    }
  };

  const toggleItem = (id: number) => {
    setExpandedItems((prev) => {
      const newState = { ...prev };
      Object.keys(newState).forEach((key) => {
        if (parseInt(key) !== id) newState[parseInt(key)] = false;
      });

      newState[id] = !prev[id];

      if (!prev[id]) {
        setActiveNodeId(id);
        setAutoRotate(false);
        const current = timelineData.find(i => i.id === id);
        const newPulseEffect: Record<number, boolean> = {};
        current?.relatedIds.forEach((relId) => { newPulseEffect[relId] = true; });
        setPulseEffect(newPulseEffect);
        centerViewOnNode(id);
      } else {
        setActiveNodeId(null);
        setAutoRotate(true);
        setPulseEffect({});
      }
      return newState;
    });
  };

  useEffect(() => {
    let rotationTimer: NodeJS.Timeout | null = null;
    if (autoRotate) {
      rotationTimer = setInterval(() => {
        setRotationAngle((prev) => (prev + 0.15) % 360);
      }, 50);
    }
    return () => {
      if (rotationTimer) clearInterval(rotationTimer);
    };
  }, [autoRotate]);

  const centerViewOnNode = (nodeId: number) => {
    const nodeIndex = timelineData.findIndex((item) => item.id === nodeId);
    const totalNodes = timelineData.length;
    const targetAngle = (nodeIndex / totalNodes) * 360;
    setRotationAngle(270 - targetAngle);
  };

  const calculateNodePosition = (index: number, total: number) => {
    const angle = ((index / total) * 360 + rotationAngle) % 360;
    const radius = 180; 
    const radian = (angle * Math.PI) / 180;
    const x = radius * Math.cos(radian);
    const y = radius * Math.sin(radian);
    const zIndex = Math.round(100 + 50 * Math.cos(radian));
    const opacity = Math.max(0.3, Math.min(1, 0.4 + 0.6 * ((1 + Math.sin(radian)) / 2)));
    return { x, y, angle, zIndex, opacity };
  };

  const getStatusStyles = (status: TimelineItem["status"]): string => {
    switch (status) {
      case "completed": return "text-white bg-black border-white";
      case "in-progress": return "text-black bg-white border-black";
      default: return "text-zinc-500 bg-zinc-900 border-zinc-800";
    }
  };

  return (
    <div
      className="w-full h-full min-h-[400px] md:min-h-[600px] flex flex-col items-center justify-center bg-black overflow-hidden relative"
      ref={containerRef}
      onClick={handleContainerClick}
    >
      <div className="relative w-full max-w-4xl h-[400px] md:h-[600px] flex items-center justify-center">
        
        {/* ORBITAL BACKGROUND DECOR */}
        <div className="absolute w-[280px] h-[280px] md:w-[360px] md:h-[360px] rounded-full border border-white/5 pointer-events-none"></div>
        <div className="absolute w-[400px] h-[400px] md:w-[500px] md:h-[500px] rounded-full border border-white/[0.02] pointer-events-none hidden md:block"></div>
        
        {/* CENTRAL ORB */}
        <div className="absolute w-10 h-10 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 animate-pulse flex items-center justify-center z-0 pointer-events-none shadow-[0_0_50px_rgba(59,130,246,0.3)]">
          <div className="absolute w-16 h-16 md:w-20 md:h-20 rounded-full border border-white/10 animate-ping opacity-30"></div>
          <div className="w-5 h-5 md:w-8 md:h-8 rounded-full bg-white/90 backdrop-blur-md"></div>
        </div>

        {/* NODES */}
        <div className="absolute inset-0 flex items-center justify-center z-10" ref={orbitRef} style={{ perspective: "1200px" }}>
          {timelineData.map((item, index) => {
            const pos = calculateNodePosition(index, timelineData.length);
            const isExpanded = expandedItems[item.id];
            const isRelated = (activeNodeId !== null && item.relatedIds.includes(activeNodeId)) || pulseEffect[item.id];
            const Icon = item.icon;

            return (
              <div
                key={item.id}
                ref={(el) => { nodeRefs.current[item.id] = el; }}
                className="absolute transition-all duration-700 cursor-pointer"
                style={{
                  transform: `translate(${pos.x}px, ${pos.y}px)`,
                  zIndex: isExpanded ? 500 : pos.zIndex,
                  opacity: isExpanded ? 1 : pos.opacity,
                }}
                onClick={(e) => { e.stopPropagation(); toggleItem(item.id); }}
              >
                {/* Energy Pulse Background */}
                <div
                  className={cn("absolute rounded-full -inset-4 transition-opacity", isRelated ? "animate-pulse opacity-40" : "opacity-0")}
                  style={{
                    background: `radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)`,
                    width: `${item.energy * 0.4 + 50}px`,
                    height: `${item.energy * 0.4 + 50}px`,
                    transform: 'translate(-25%, -25%)'
                  }}
                ></div>

                {/* Node Icon */}
                <div
                  className={cn(
                    "w-8 h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500 transform",
                    isExpanded ? "bg-white text-black border-white scale-125 shadow-[0_0_20px_rgba(255,255,255,0.4)]" : 
                    isRelated ? "bg-zinc-800 text-white border-blue-500" : "bg-black text-zinc-400 border-zinc-800"
                  )}
                >
                  <Icon size={isExpanded ? 18 : 14} />
                </div>

                {/* Node Title */}
                <div className={cn(
                    "absolute top-10 md:top-14 left-1/2 -translate-x-1/2 whitespace-nowrap text-[8px] md:text-xs font-bold tracking-widest transition-all",
                    isExpanded ? "text-white scale-110" : "text-zinc-600"
                )}>
                  {item.title}
                </div>

                {/* Card Content Overlay */}
                {isExpanded && (
                  <Card className="absolute top-16 md:top-20 left-1/2 -translate-x-1/2 w-56 md:w-72 bg-zinc-950/95 backdrop-blur-xl border-zinc-800 shadow-2xl z-[1000] animate-in fade-in zoom-in duration-300">
                    <CardHeader className="p-3 md:p-4 pb-1 md:pb-2">
                      <div className="flex justify-between items-center mb-1 md:mb-2">
                        <Badge variant="outline" className={cn("text-[8px] md:text-[10px]", getStatusStyles(item.status))}>
                          {item.status.toUpperCase()}
                        </Badge>
                        <span className="text-[8px] md:text-[10px] font-mono text-zinc-500">{item.date}</span>
                      </div>
                      <CardTitle className="text-sm md:text-base">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 md:p-4 pt-0">
                      <p className="text-[10px] md:text-xs text-zinc-400 leading-relaxed mb-3 md:mb-4">{item.content}</p>

                      <div className="space-y-2 md:space-y-3">
                        <div className="flex justify-between items-center text-[8px] md:text-[10px] text-zinc-500 uppercase tracking-tighter">
                          <span className="flex items-center gap-1"><Zap size={10} /> Impact Score</span>
                          <span>{item.energy}%</span>
                        </div>
                        <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500" style={{ width: `${item.energy}%` }}></div>
                        </div>

                        {item.relatedIds.length > 0 && (
                          <div className="pt-2 border-t border-zinc-900">
                            <h4 className="text-[8px] md:text-[10px] text-zinc-600 uppercase mb-1 md:mb-2">Connected Milestones</h4>
                            <div className="flex flex-wrap gap-1">
                              {item.relatedIds.map(rid => {
                                const rItem = timelineData.find(i => i.id === rid);
                                return (
                                  <Button 
                                    key={rid} 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-5 md:h-6 px-1.5 md:px-2 text-[7px] md:text-[9px] border-zinc-800 hover:bg-zinc-900"
                                    onClick={(e) => { e.stopPropagation(); toggleItem(rid); }}
                                  >
                                    {rItem?.title} <ArrowRight size={8} className="ml-1 opacity-50" />
                                  </Button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// --- DATA ---

const timelineData: TimelineItem[] = [
  {
    id: 1,
    title: "B.TECH START",
    date: "Aug 2024",
    content: "Commenced B.Tech in CSE (AI & ML) at UEM Jaipur. Exploring the fundamentals of computing.",
    category: "Education",
    icon: Calendar,
    relatedIds: [2],
    status: "completed",
    energy: 100,
  },
  {
    id: 2,
    title: "ACM CHAPTER",
    date: "Jan 2025",
    content: "Joined the ACM Student Chapter as an active member, focusing on community and technical growth.",
    category: "Community",
    icon: User,
    relatedIds: [1, 3],
    status: "in-progress",
    energy: 85,
  },
  {
    id: 3,
    title: "WEB DEV CORE",
    date: "Feb 2025",
    content: "Mastering the MERN stack with a focus on scalable architecture and AI API integrations.",
    category: "Development",
    icon: Code,
    relatedIds: [2, 4],
    status: "in-progress",
    energy: 90,
  },
  {
    id: 4,
    title: "AI RESEARCH",
    date: "May 2025",
    content: "Beginning research into Generative AI workflows and LLM fine-tuning for personal projects.",
    category: "AI/ML",
    icon: FileText,
    relatedIds: [3, 5],
    status: "pending",
    energy: 70,
  },
  {
    id: 5,
    title: "GRADUATION",
    date: "May 2028",
    content: "Targeted graduation date with a specialized degree in Artificial Intelligence.",
    category: "Milestone",
    icon: Clock,
    relatedIds: [4],
    status: "pending",
    energy: 50,
  },
];

export default function JourneySection() {
  return (
    <section id="journey" className="relative min-h-screen bg-black text-white selection:bg-white selection:text-black py-20 md:py-32 w-full flex flex-col items-center">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/5 blur-[120px] rounded-full"></div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-6 relative z-10 flex flex-col items-center">
        {/* Header Section - Explicitly Centered */}
        <header className="mb-16 md:mb-24 text-center w-full flex flex-col items-center">
          <div className="inline-flex items-center justify-center gap-2 px-3 py-1 rounded-full border border-zinc-800 text-[10px] uppercase tracking-widest text-zinc-500 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
            Interactive Visualisation
          </div>
          
          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.85] uppercase flex flex-col items-center mb-10 w-full">
            <span className="text-zinc-800">MY CAREER</span>
            <span className="flex items-center justify-center">
              <span className="text-zinc-700 mr-2 md:mr-6">&</span>
              <span className="text-white drop-shadow-[0_0_25px_rgba(255,255,255,0.05)]">EXPERIENCE</span>
            </span>
          </h1>

          <div className="flex flex-col items-center max-w-2xl mx-auto w-full text-center">
             <p className="text-zinc-500 text-lg md:text-2xl italic leading-relaxed w-full">
                Explore the orbital nodes to trace my path through AI engineering, full-stack development, and technical leadership.
             </p>
          </div>
        </header>

        {/* ORBITAL TIMELINE COMPONENT - Centered */}
        <div className="w-full h-[500px] md:h-[700px] rounded-[2rem] md:rounded-[3rem] border border-zinc-900 bg-zinc-950/40 relative overflow-hidden group shadow-2xl backdrop-blur-sm flex items-center justify-center">
            <div className="absolute top-8 left-8 text-[10px] font-mono text-zinc-700 tracking-tighter select-none hidden sm:block">
                COORD_01 // ORBITAL_PATH
            </div>
            <div className="absolute bottom-8 right-8 text-[10px] font-mono text-zinc-700 tracking-tighter select-none hidden sm:block">
                TIMESTAMP // 2024_2028
            </div>
            
            <RadialOrbitalTimeline timelineData={timelineData} />
        </div>

        {/* Footer Info - Centered Grid */}
        <footer className="w-full mt-20 md:mt-32 grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-20 border-t border-zinc-900 pt-20 text-center">
            <div className="flex flex-col items-center">
                <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm border-b border-zinc-800 pb-2 w-fit">Vision</h4>
                <p className="text-zinc-500 text-base leading-relaxed max-w-xs">Pioneering the next wave of AI-driven interfaces where technical precision meets artistic expression.</p>
            </div>
            <div className="flex flex-col items-center">
                <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm border-b border-zinc-800 pb-2 w-fit">Focus</h4>
                <p className="text-zinc-500 text-base leading-relaxed max-w-xs">Developing scalable neural architectures and high-performance web ecosystems for the future of SaaS.</p>
            </div>
            <div className="flex flex-col items-center">
                <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm border-b border-zinc-800 pb-2 w-fit">Status</h4>
                <div className="flex flex-col gap-4 items-center">
                    <span className="text-zinc-300 text-sm flex items-center gap-3">
                        <MapPin size={16} className="text-blue-500" /> Jaipur, India
                    </span>
                    <span className="text-zinc-300 text-sm flex items-center gap-3">
                        <Calendar size={16} className="text-purple-500" /> Year II @ UEM
                    </span>
                </div>
            </div>
        </footer>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        body::-webkit-scrollbar {
          width: 6px;
        }
        body::-webkit-scrollbar-track {
          background: #000;
        }
        body::-webkit-scrollbar-thumb {
          background: #222;
          border-radius: 10px;
        }
        body::-webkit-scrollbar-thumb:hover {
          background: #333;
        }
      `}</style>
    </section>
  );
}