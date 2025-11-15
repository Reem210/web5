from fastapi import FastAPI, UploadFile, File, Form
import re
from fastapi.middleware.cors import CORSMiddleware
import joblib, numpy as np
import tempfile, os

from api.ifc_extract_lib import extract_ifc_parameters
from schemas import ColumnFeatures, PredictionResponse

app = FastAPI(title="Column QA Model API", version="v1.0.0")

# --- CORS setup ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Load both models ---
CLASSIFIER_PATH = os.path.join(os.path.dirname(__file__), "random_forest_classifier.pkl")
REGRESSOR_PATH = os.path.join(os.path.dirname(__file__), "random_forest_regressor.pkl")

classifier = joblib.load(CLASSIFIER_PATH)
regressor = joblib.load(REGRESSOR_PATH)

# --- Helpers ---
def parse_tolerance_mm(value: str | None) -> float | None:
    if not value:
        return None
    s = value.strip().lower().replace("±", "")
    m = re.search(r"([0-9]+(?:\.[0-9]+)?)", s)
    if not m:
        return None
    num = float(m.group(1))
    if "cm" in s:
        num *= 10.0
    elif "mm" in s:
        num *= 1.0
    elif " m" in s or s.endswith("m"):
        if "mm" not in s:
            num *= 1000.0
    return num

@app.get("/health")
def health():
    return {"status": "ok", "classifier_loaded": True, "regressor_loaded": True, "version": app.version}

@app.get("/model_info")
def model_info():
    return {
        "version": app.version,
        "classifier_features": getattr(classifier, "n_features_in_", None),
        "regressor_features": getattr(regressor, "n_features_in_", None),
    }

@app.post("/predict", response_model=PredictionResponse)
def predict(features: ColumnFeatures):
    feature_values = [
        features.base_z, features.top_z, features.centroid_z,
        features.base_x, features.base_y, features.top_x, features.top_y,
        features.min_x, features.min_y, features.min_z,
        features.max_x, features.max_y, features.max_z,
        features.column_height_mm, features.width_mm, features.length_mm,
        features.cross_section_area_mm2, features.aspect_ratio,
        features.height_to_width_ratio, features.height_above_ground,
    ]

    expected = getattr(classifier, "n_features_in_", len(feature_values))
    if len(feature_values) < expected:
        feature_values += [0.0] * (expected - len(feature_values))
    elif len(feature_values) > expected:
        feature_values = feature_values[:expected]

    X = np.array([feature_values], dtype=float)

    tilt_class = int(classifier.predict(X)[0])
    tilt_ratio = 0.0 if tilt_class == 0 else float(regressor.predict(X)[0])

    return PredictionResponse(
        tilt_class=tilt_class,
        tilt_ratio=tilt_ratio,
        model_version=app.version,
        element_id=features.element_id
    )

@app.post("/extract_and_predict")
async def extract_and_predict(
    file: UploadFile = File(...),
    deviation_tolerance: str | None = Form(None),
):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".ifc") as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    rows = extract_ifc_parameters(tmp_path)
    os.remove(tmp_path)

    tol = parse_tolerance_mm(deviation_tolerance)

    preds = []
    for row in rows:
        feature_values = [
            row.get("base_z"), row.get("top_z"), row.get("centroid_z"),
            row.get("base_x"), row.get("base_y"), row.get("top_x"), row.get("top_y"),
            row.get("min_x"), row.get("min_y"), row.get("min_z"),
            row.get("max_x"), row.get("max_y"), row.get("max_z"),
            row.get("column_height_mm"), row.get("width_mm"), row.get("length_mm"),
            row.get("cross_section_area_mm2"), row.get("aspect_ratio"),
            row.get("height_to_width_ratio"), row.get("height_above_ground"),
        ]

        expected = getattr(classifier, "n_features_in_", len(feature_values))
        if len(feature_values) < expected:
            feature_values += [0.0] * (expected - len(feature_values))
        elif len(feature_values) > expected:
            feature_values = feature_values[:expected]

        X = np.array([feature_values], dtype=float)

        tilt_class = int(classifier.predict(X)[0])
        tilt_ratio = 0.0 if tilt_class == 0 else float(regressor.predict(X)[0])

        if tol is not None:
            if abs(tilt_ratio) <= tol:
                tilt_status = "within tolerance"
            else:
                tilt_status = "leaning too much"
        else:
            tilt_status = "no tolerance provided"

        item = {
            **row,
            "tilt_class": tilt_class,
            "tilt_ratio": tilt_ratio,
            "model_version": app.version,
            "deviation_tolerance": tol,
            "leaning_status": tilt_status,
        }
        preds.append(item)

    return {
        "results": preds,
        "count": len(preds),
        "parameters": {"deviation_tolerance": tol},
    }