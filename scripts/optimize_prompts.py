"""
Luna AI Prompt Optimization Script
Uses Opik Optimizer SDK to improve symptom extraction and insight generation prompts.

Reference: opik/sdks/opik_optimizer/
"""

from opik.evaluation.metrics import LevenshteinRatio
from opik_optimizer import (
    MetaPromptOptimizer,
    HierarchicalReflectiveOptimizer,
    FewShotBayesianOptimizer,
    ChatPrompt,
)

# ============================================================================
# LUNA AI PROMPTS TO OPTIMIZE
# ============================================================================

SYMPTOM_EXTRACTOR_PROMPT = ChatPrompt(
    messages=[
        {
            "role": "system",
            "content": """You are Luna, a compassionate women's health AI scribe.
Your task is to extract structured health data from natural language input.

EXTRACT the following from the user's message:
- symptoms: Array of symptoms (use standardized terms: cramps, headache, fatigue, bloating, nausea, mood_swing, anxiety, irritability, breast_tenderness, acne, insomnia)
- severity: "low", "medium", or "high"
- mood: User's emotional state (happy, sad, anxious, irritable, calm, tired, energetic)
- energy: "low", "medium", or "high"
- notes: Additional context

RESPOND ONLY with valid JSON. No explanation."""
        },
        {
            "role": "user",
            "content": "{user_input}"
        }
    ]
)

INSIGHT_GENERATOR_PROMPT = ChatPrompt(
    messages=[
        {
            "role": "system",
            "content": """You are Luna, a warm and knowledgeable women's health companion.
Generate a personalized daily insight based on the user's cycle data.

Be warm, not clinical. Use "you" language. Never diagnose.
Generate 2-3 sentences that:
1. Acknowledge how they might be feeling
2. Explain WHY based on cycle phase (educational)
3. Offer one actionable tip"""
        },
        {
            "role": "user",
            "content": "Cycle Day: {cycle_day}, Phase: {phase}, Recent Symptoms: {symptoms}"
        }
    ]
)

HEALTH_ASSISTANT_PROMPT = ChatPrompt(
    messages=[
        {
            "role": "system",
            "content": """You are Luna, an empathetic AI health companion.

RULES:
- Be warm, supportive, and validating
- Provide educational information, NEVER diagnose
- If asked about serious symptoms, recommend consulting a healthcare provider
- Use simple language, avoid medical jargon"""
        },
        {
            "role": "user",
            "content": "{question}"
        }
    ]
)

# ============================================================================
# EVALUATION DATASETS
# ============================================================================

def load_dataset(filename):
    import json
    import os
    
    # Path relative to this script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(script_dir, "../server/data", filename)
    
    try:
        with open(data_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"⚠️ Failed to load {filename}: {e}")
        return []

# Load real data
MENSTRUAL_QA = load_dataset("menstrual_health_qa.json")
WOMEN_HEALTH_INSTRUCTIONS = load_dataset("women_health_sample.json")

# Prepare Symptom Extraction Dataset
# We'll use the Q&A pairs to create synthetic extraction tests
# or just use hardcoded ones if the real data doesn't map well to "symptom extraction" tasks directly
SYMPTOM_EXTRACTION_DATASET = [
    {
        "user_input": "I have cramps and feel really tired today",
        "expected": {"symptoms": ["cramps", "fatigue"], "severity": "high", "mood": "tired", "energy": "low"}
    },
    {
        "user_input": "Slight headache but otherwise okay",
        "expected": {"symptoms": ["headache"], "severity": "low", "mood": "calm", "energy": "medium"}
    },
    # Add mapped real data if relevant keywords exist
]

# Prepare Health Assistant Dataset from Menstrual QA
HEALTH_ASSISTANT_DATASET = []
for item in MENSTRUAL_QA[:20]:  # Use first 20 real examples
    if "Question" in item and "Answer" in item:
        HEALTH_ASSISTANT_DATASET.append({
            "question": item["Question"],
            "answer": item["Answer"]
        })
    elif "text" in item: # fallback if CSV structure differed
        parts = item["text"].split("Answer:")
        if len(parts) == 2:
            HEALTH_ASSISTANT_DATASET.append({
                "question": parts[0].replace("Question:", "").strip(),
                "answer": parts[1].strip()
            })

if not HEALTH_ASSISTANT_DATASET:
    # Fallback to hardcoded if parsing failed
    HEALTH_ASSISTANT_DATASET = [
        {"question": "Why do I have cramps?", "answer": "Cramps are caused by uterine contractions..."},
        {"question": "Is spotting normal?", "answer": "Spotting can happen during ovulation..."}
    ]

SYMPTOM_EXTRACTION_DATASET = [
    {
        "user_input": "I have cramps and feel really tired today",
        "expected": {"symptoms": ["cramps", "fatigue"], "severity": "high", "mood": "tired", "energy": "low"}
    },
    {
        "user_input": "Slight headache but otherwise okay",
        "expected": {"symptoms": ["headache"], "severity": "low", "mood": "calm", "energy": "medium"}
    },
    {
        "user_input": "PMSing hard, super irritable and bloated",
        "expected": {"symptoms": ["mood_swing", "bloating", "irritability"], "severity": "high", "mood": "irritable", "energy": "low"}
    },
    {
        "user_input": "My tummy hurts and I couldn't sleep last night",
        "expected": {"symptoms": ["cramps", "insomnia"], "severity": "medium", "mood": "tired", "energy": "low"}
    }
]

# ============================================================================
# CUSTOM METRICS
# ============================================================================

def symptom_extraction_accuracy(dataset_item, llm_output):
    """
    Measure F1 score of extracted symptoms vs expected.
    """
    import json
    try:
        predicted = json.loads(llm_output)
        expected = dataset_item["expected"]
        
        pred_symptoms = set(predicted.get("symptoms", []))
        exp_symptoms = set(expected.get("symptoms", []))
        
        if len(pred_symptoms) == 0 and len(exp_symptoms) == 0:
            return 1.0
        if len(pred_symptoms) == 0 or len(exp_symptoms) == 0:
            return 0.0
        
        intersection = pred_symptoms & exp_symptoms
        precision = len(intersection) / len(pred_symptoms)
        recall = len(intersection) / len(exp_symptoms)
        
        if precision + recall == 0:
            return 0.0
        
        f1 = 2 * (precision * recall) / (precision + recall)
        return f1
    except:
        return 0.0


def empathy_score(dataset_item, llm_output):
    """
    Score response for empathetic language.
    """
    empathy_indicators = [
        "understand", "feeling", "normal", "valid", "support",
        "you're not alone", "it's okay", "take care", "rest", "gentle"
    ]
    
    output_lower = llm_output.lower()
    matches = sum(1 for word in empathy_indicators if word in output_lower)
    return min(matches / 5, 1.0)  # Cap at 1.0


def safety_score(dataset_item, llm_output):
    """
    Ensure AI doesn't use diagnostic language.
    Returns 1.0 if safe, 0.0 if contains diagnostic terms.
    """
    diagnostic_terms = [
        "you have", "diagnosed", "you are suffering from",
        "this is definitely", "you need medication", "you should take"
    ]
    
    output_lower = llm_output.lower()
    for term in diagnostic_terms:
        if term in output_lower:
            return 0.0
    return 1.0


# ============================================================================
# OPTIMIZATION RUNNERS
# ============================================================================

def optimize_symptom_extraction():
    """
    Use MetaPromptOptimizer to improve symptom extraction prompt.
    """
    print("🔧 Optimizing Symptom Extraction Prompt...")
    
    import opik
    client = opik.Opik()
    dataset = client.get_or_create_dataset(name="luna-symptom-extraction-dataset")
    dataset.insert(SYMPTOM_EXTRACTION_DATASET)

    optimizer = MetaPromptOptimizer(
        model="gemini/gemini-1.5-flash",  # LiteLLM format
        name="luna-symptom-extraction",
        n_threads=4,
    )
    
    result = optimizer.optimize_prompt(
        prompt=SYMPTOM_EXTRACTOR_PROMPT,
        dataset=dataset,
        metric=symptom_extraction_accuracy,
        n_samples=len(SYMPTOM_EXTRACTION_DATASET),
    )
    
    print("\n✅ Optimization Complete!")
    result.display()
    return result


def optimize_with_hrpo():
    """
    Use HRPO for root-cause analysis of failures.
    """
    print("🔧 Running HRPO on Symptom Extraction...")
    
    import opik
    client = opik.Opik()
    dataset = client.get_or_create_dataset(name="luna-symptom-extraction-dataset")
    # Dataset items already inserted in previous step if run sequentially, but safe to insert again (deduplicated)
    dataset.insert(SYMPTOM_EXTRACTION_DATASET)
    
    optimizer = HierarchicalReflectiveOptimizer(
        model="gemini/gemini-1.5-flash",
        name="luna-hrpo-optimization",
        n_threads=4,
    )
    
    result = optimizer.optimize_prompt(
        prompt=SYMPTOM_EXTRACTOR_PROMPT,
        dataset=dataset,
        metric=symptom_extraction_accuracy,
        n_samples=len(SYMPTOM_EXTRACTION_DATASET),
    )
    
    print("\n✅ HRPO Optimization Complete!")
    result.display()
    return result


def optimize_health_assistant():
    """
    Use FewShotBayesian to optimize health assistant responses.
    """
    print("🔧 Optimizing Health Assistant Prompt...")
    
    import opik
    client = opik.Opik()
    dataset = client.get_or_create_dataset(name="luna-health-assistant-dataset")
    dataset.insert(HEALTH_ASSISTANT_DATASET)

    # Sample Q&A dataset
    health_qa_dataset = [
        {"question": "Why do I have cramps?", "answer": "Cramps during your cycle are caused by..."},
        {"question": "Is my mood swing normal?", "answer": "Mood changes are very common during..."},
    ]
    
    optimizer = FewShotBayesianOptimizer(
        model="gemini/gemini-1.5-flash",
        name="luna-health-assistant",
        min_examples=2,
        max_examples=5,
        n_threads=4,
    )
    
    print(f"   Evaluated on {len(HEALTH_ASSISTANT_DATASET)} real health questions")
    
    result = optimizer.optimize_prompt(
        prompt=HEALTH_ASSISTANT_PROMPT,
        dataset=dataset,
        metric=empathy_score,
        n_samples=len(HEALTH_ASSISTANT_DATASET),
    )
    
    print("\n✅ Health Assistant Optimization Complete!")
    result.display()
    return result


# ============================================================================
# MAIN
# ============================================================================

if __name__ == "__main__":
    import os
    from dotenv import load_dotenv
    
    # Load environment variables from server/.env
    load_dotenv(os.path.join(os.path.dirname(__file__), "../server/.env"))
    
    # Ensure GOOGLE_API_KEY is set for litellm if GEMINI_API_KEY is present
    if not os.getenv("GOOGLE_API_KEY") and os.getenv("GEMINI_API_KEY"):
        os.environ["GOOGLE_API_KEY"] = os.getenv("GEMINI_API_KEY")
    
    # Check for API keys
    if not os.getenv("GEMINI_API_KEY") and not os.getenv("GOOGLE_API_KEY"):
        print("⚠️  Warning: GEMINI_API_KEY or GOOGLE_API_KEY not set")
        print("   Set one of these to run optimizations")
        # Don't exit, allow dry run if we had a mock optimizer, but here we likely need it
        # exit(1) 
    
    if not os.getenv("OPIK_API_KEY"):
        print("⚠️  Warning: OPIK_API_KEY not set")
        print("   Results won't be logged to Comet")
    
    print("=" * 60)
    print("🌙 Luna AI Prompt Optimization")
    print("=" * 60)
    
    # Run optimizations
    # 1. Symptom Extraction (MetaPrompt)
    symptom_result = optimize_symptom_extraction()
    
    # 2. Health Assistant (FewShotBayesian with Real Data)
    qa_result = optimize_health_assistant()

    print("\n" + "=" * 60)
    print("📊 Optimized Symptom Extraction Prompt:")
    print("=" * 60)
    print(symptom_result.best_prompt)
    
    print("\n" + "=" * 60)
    print("📊 Optimized Health Assistant Prompt:")
    print("=" * 60)
    print(qa_result.best_prompt)
