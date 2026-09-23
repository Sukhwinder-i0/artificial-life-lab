import pytest
from analysis.report_generator import ResearchReportGenerator


def test_markdown_report_generation():
    md = ResearchReportGenerator.generate_markdown_report(
        title="Test Scientific Experiment Report",
        author="Unit Test Author",
        hypothesis="Test hypothesis for automated report generation",
        seed=12345,
    )
    assert "# Scientific Research Report: Test Scientific Experiment Report" in md
    assert "Unit Test Author" in md
    assert "12345" in md
    assert "Bootstrap 95% Confidence Interval" in md
    assert "Ablation Control Comparison" in md


def test_html_report_generation():
    md = "# Test Header\nSome content"
    html = ResearchReportGenerator.generate_html_report(md)
    assert "<!DOCTYPE html>" in html
    assert "Test Header" in html
    assert "Artificial Life Lab" in html


def test_json_export_payload():
    config = {"world": {"width": 50, "height": 50}}
    telemetry = {"final_population": 42}
    payload = ResearchReportGenerator.generate_json_export(config, telemetry, seed=99)
    assert payload["metadata"]["seed"] == 99
    assert payload["config"]["world"]["width"] == 50
    assert payload["telemetry"]["final_population"] == 42
