import re
import PyPDF2
import numpy as np
import spacy
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Load NLP model
nlp = spacy.load("en_core_web_sm")

# Define categories for scoring
categories = ["Education", "Projects", "Work Experience", "Technical Skills", "Achievements", "Publications", "Online Presence"]

def extract_text_from_pdf(pdf_path):
    """Extract text from a given PDF file."""
    text = ""
    with open(pdf_path, "rb") as file:
        reader = PyPDF2.PdfReader(file)
        for page in reader.pages:
            text += page.extract_text() + " "
    return text.strip()

def categorize_resume(text):
    """Categorize the resume text into predefined sections."""
    sections = {category: "" for category in categories}
    lines = text.split("\n")
    current_category = None
    for line in lines:
        line = line.strip()
        if not line:
            continue
        for category in categories:
            if re.search(category, line, re.IGNORECASE):
                current_category = category
                break
        if current_category:
            sections[current_category] += line + " "
    return sections

def compute_similarity(text1, text2):
    """Compute the similarity between two text documents."""
    vectorizer = TfidfVectorizer()
    vectors = vectorizer.fit_transform([text1, text2])
    return cosine_similarity(vectors[0], vectors[1])[0][0] * 100

def evaluate_resume(uploaded_resume_text, sample_resume_text):
    """Evaluate the uploaded resume based on the sample resume."""
    uploaded_sections = categorize_resume(uploaded_resume_text)
    sample_sections = categorize_resume(sample_resume_text)
    scores = {category: compute_similarity(uploaded_sections[category], sample_sections[category])
              for category in categories}
    overall_score = np.mean(list(scores.values()))
    return scores, overall_score
