import { create } from 'zustand';

export interface OrganismData {
  id: string;
  parent_id?: string;
  second_parent_id?: string;
  generation: number;
  birth_time: number;
  age: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  energy: number;
  health: number;
  genome: Record<string, number>;
  current_action: string;
  cause_of_death?: string;
}

export interface MetricFrame {
  step: number;
  time: number;
  population_count: number;
  avg_energy: number;
  avg_fitness: number;
  cooperation_rate: number;
  avg_speed: number;
  avg_vision: number;
}

export interface ResourcePatchData {
  x: number;
  y: number;
  amount: number;
}

export interface TelemetryData {
  step: number;
  time: number;
  population_count: number;
  births_this_step: number;
  deaths_this_step: number;
  metrics: Record<string, number>;
  organisms: OrganismData[];
  resources?: ResourcePatchData[];
}

interface SimulationStoreState {
  // Navigation
  activeTab: 'Overview' | 'Simulation' | 'Organisms' | 'Evolution' | 'Speciation' | 'Experiments' | 'Analysis' | 'Settings';
  setActiveTab: (tab: 'Overview' | 'Simulation' | 'Organisms' | 'Evolution' | 'Speciation' | 'Experiments' | 'Analysis' | 'Settings') => void;

  // Connection & Control
  isConnected: boolean;
  isRunning: boolean;
  speed: number;
  selectedOrganismId: string | null;

  // Live Telemetry
  latestFrame: TelemetryData | null;
  metricHistory: MetricFrame[];

  // Actions
  setSpeed: (speed: number) => void;
  setSelectedOrganismId: (id: string | null) => void;
  togglePlayback: () => Promise<void>;
  stepSimulation: () => Promise<void>;
  resetSimulation: (seed?: number) => Promise<void>;
  processFrame: (frame: TelemetryData) => void;
}

export const useSimulationStore = create<SimulationStoreState>((set, get) => ({
  activeTab: 'Simulation',
  setActiveTab: (tab) => set({ activeTab: tab }),

  isConnected: false,
  isRunning: false,
  speed: 1.0,
  selectedOrganismId: null,

  latestFrame: null,
  metricHistory: [],

  setSpeed: (speed) => set({ speed }),
  setSelectedOrganismId: (id) => set({ selectedOrganismId: id }),

  togglePlayback: async () => {
    const currentlyRunning = get().isRunning;
    const endpoint = currentlyRunning ? '/api/simulation/pause' : '/api/simulation/resume';
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    try {
      const res = await fetch(`${baseUrl}${endpoint}`, { method: 'POST' });
      if (res.ok) {
        set({ isRunning: !currentlyRunning });
      }
    } catch (e) {
      console.error('Failed to toggle simulation state', e);
    }
  },

  stepSimulation: async () => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    try {
      const res = await fetch(`${baseUrl}/api/simulation/step`, { method: 'POST' });
      if (res.ok) {
        const frame: TelemetryData = await res.json();
        get().processFrame(frame);
      }
    } catch (e) {
      console.error('Failed to step simulation', e);
    }
  },

  resetSimulation: async (seed = 42) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    try {
      const res = await fetch(`${baseUrl}/api/simulation/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seed }),
      });
      if (res.ok) {
        set({ latestFrame: null, metricHistory: [], selectedOrganismId: null, isRunning: true });
      }
    } catch (e) {
      console.error('Failed to reset simulation', e);
    }
  },

  processFrame: (frame) => {
    const history = get().metricHistory;
    const newMetric: MetricFrame = {
      step: frame.step,
      time: frame.time,
      population_count: frame.population_count,
      avg_energy: frame.metrics.avg_energy || 0,
      avg_fitness: frame.metrics.avg_generation || 0,
      cooperation_rate: frame.metrics.cooperation_rate || 0,
      avg_speed: frame.metrics.gene_speed_mean || 1.0,
      avg_vision: frame.metrics.gene_vision_range_mean || 15.0,
    };

    // Keep up to 100 historical frames for smooth plotting
    const updatedHistory = [...history, newMetric].slice(-100);

    set({
      latestFrame: frame,
      metricHistory: updatedHistory,
      isConnected: true,
    });
  },
}));
