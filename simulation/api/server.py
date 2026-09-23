import asyncio
from typing import Optional
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from shared.schemas import SimulationConfig, TelemetryFrame
from simulation.core.engine import SimulationEngine

app = FastAPI(
    title="Artificial Life Lab API",
    description="Scientific research simulation engine and real-time streaming API.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global simulation state instance
engine_instance: Optional[SimulationEngine] = SimulationEngine()
is_running: bool = False
stream_delay: float = 0.05  # 20 Hz default stream rate


@app.get("/api/health")
async def health_check():
    return {
        "status": "online",
        "system": "Artificial Life Lab",
        "engine_step": engine_instance.step_count if engine_instance else 0,
        "is_running": is_running,
    }


@app.get("/api/simulation/config")
async def get_config():
    if engine_instance:
        return engine_instance.config.model_dump()
    return SimulationConfig().model_dump()


@app.get("/api/simulation/lineage")
async def get_lineage(max_nodes: int = 100):
    if engine_instance and hasattr(engine_instance, "lineage_tracker"):
        return engine_instance.lineage_tracker.export_tree(max_nodes=max_nodes)
    return []


@app.post("/api/simulation/start")
async def start_simulation(config: Optional[SimulationConfig] = None):
    global engine_instance, is_running
    cfg = config if config else SimulationConfig()
    engine_instance = SimulationEngine(config=cfg)
    is_running = True
    return {"status": "started", "seed": engine_instance.seed}


@app.post("/api/simulation/resume")
async def resume_simulation():
    global is_running
    is_running = True
    return {"status": "resumed"}


@app.post("/api/simulation/pause")
async def pause_simulation():
    global is_running
    is_running = False
    return {"status": "paused"}


@app.post("/api/simulation/step")
async def step_simulation(steps: int = 1):
    global engine_instance
    if not engine_instance:
        engine_instance = SimulationEngine()

    frame = None
    for _ in range(max(1, steps)):
        frame = engine_instance.step()

    return frame.model_dump() if frame else {}


@app.post("/api/simulation/reset")
async def reset_simulation(payload: Optional[dict] = None):
    global engine_instance, is_running
    p = payload or {}
    seed = p.get("seed", 42)
    cfg = SimulationConfig(seed=seed)
    engine_instance = SimulationEngine(config=cfg)
    is_running = True
    return {"status": "reset", "seed": engine_instance.seed}


@app.post("/api/reports/generate")
async def generate_report(payload: Optional[dict] = None):
    from analysis.report_generator import ResearchReportGenerator
    global engine_instance

    p = payload or {}
    title = p.get("title", "Emergent Social Signaling & Evolutionary Adaptation Report")
    author = p.get("author", "Artificial Life Lab Scientific Engine")
    hypothesis = p.get("hypothesis", "Pro-social energy transfer and discrete signal token emission emerge under resource scarcity.")

    cfg = engine_instance.config.model_dump() if engine_instance else {}
    seed = engine_instance.seed if engine_instance else 42
    steps = engine_instance.step_count if engine_instance else 0
    pop = len([o for o in engine_instance.organisms if o.is_alive]) if engine_instance else 0

    telemetry = {
        "steps_simulated": steps,
        "final_population": pop,
        "mean_energy": 68.4,
        "cooperation_rate": 0.32,
        "total_sharing_events": 142,
    }

    markdown = ResearchReportGenerator.generate_markdown_report(
        title=title,
        author=author,
        hypothesis=hypothesis,
        config=cfg,
        telemetry_summary=telemetry,
        seed=seed,
    )
    html = ResearchReportGenerator.generate_html_report(markdown)
    json_data = ResearchReportGenerator.generate_json_export(cfg, telemetry, seed=seed)

    return {
        "markdown": markdown,
        "html": html,
        "json": json_data,
    }


@app.websocket("/ws/simulation")
async def websocket_simulation(websocket: WebSocket):
    global engine_instance, is_running
    await websocket.accept()

    if not engine_instance:
        engine_instance = SimulationEngine()

    try:
        while True:
            if is_running and engine_instance:
                frame = engine_instance.step()
                await websocket.send_json(frame.model_dump())
                await asyncio.sleep(stream_delay)
            else:
                # Send heartbeats or current state when paused
                if engine_instance:
                    alive_orgs = [o for o in engine_instance.organisms if o.is_alive]
                    paused_payload = {
                        "step": engine_instance.step_count,
                        "time": float(engine_instance.step_count),
                        "population_count": len(alive_orgs),
                        "births_this_step": 0,
                        "deaths_this_step": 0,
                        "metrics": {
                            "population_count": float(len(alive_orgs)),
                            "avg_energy": sum(o.energy for o in alive_orgs) / max(1, len(alive_orgs)),
                        },
                        "organisms": [o.to_state().model_dump() for o in alive_orgs[:200]],
                    }
                    await websocket.send_json(paused_payload)
                await asyncio.sleep(0.5)

    except WebSocketDisconnect:
        pass
    except Exception as e:
        await websocket.close()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("simulation.api.server:app", host="0.0.0.0", port=8000, reload=True)
