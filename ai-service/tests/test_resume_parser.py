from app.services.resume_parser import ResumeParser


def test_reads_years_of_experience_phrase():
    parsed = ResumeParser().parse("Backend engineer with 6 years of experience.")
    assert parsed["experience"][0]["total_years"] == 6


def test_reads_shorthand_years():
    parsed = ResumeParser().parse("Ada Lovelace\nBackend engineer, 6 years\nJava, Spring Boot.")
    assert parsed["experience"][0]["total_years"] == 6
