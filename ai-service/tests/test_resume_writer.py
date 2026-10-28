import asyncio

from app.services.resume_writer import ResumeWriter


def _write(payload):
    return asyncio.run(ResumeWriter(api_key="").generate(payload))


def test_builds_from_the_candidates_own_facts_without_ai():
    result = _write({
        "full_name": "Ada Lovelace",
        "role": "Backend Developer",
        "skills": "Java, Spring Boot, SQL, Java",
        "summary": "",
        "experience": [{
            "title": "Backend Engineer",
            "company": "Analytical Engines",
            "period": "2023 - 2025",
            "description": "Built REST APIs in Spring Boot. Reduced p95 latency by 40%.",
        }],
        "education": [{"degree": "B.Tech Computer Science", "school": "SCE", "period": "2019 - 2023"}],
        "projects": [],
    })

    assert result["mode"] == "template"
    assert "Backend Developer" in result["summary"]
    assert "Java" in result["summary"]
    assert result["skills"] == ["Java", "Spring Boot", "SQL"]
    assert result["experience"][0]["company"] == "Analytical Engines"
    assert len(result["experience"][0]["bullets"]) == 2
    assert result["education"][0]["degree"] == "B.Tech Computer Science"


def test_does_not_invent_an_employer_or_a_section():
    result = _write({
        "full_name": "Ada Lovelace",
        "role": "Backend Developer",
        "skills": "Java",
        "experience": [],
        "education": [],
        "projects": [],
    })

    assert result["experience"] == []
    assert result["education"] == []
    assert result["projects"] == []
    assert "Google" not in result["summary"]
