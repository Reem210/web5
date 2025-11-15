from pydantic import BaseModel
from typing import Optional

class ColumnFeatures(BaseModel):
    element_id: str
    base_z: float
    top_z: float
    centroid_z: float
    base_x: float
    base_y: float
    top_x: float
    top_y: float
    min_x: float
    min_y: float
    min_z: float
    max_x: float
    max_y: float
    max_z: float
    column_height_mm: float
    width_mm: float
    length_mm: float
    cross_section_area_mm2: float
    aspect_ratio: float
    height_to_width_ratio: float
    height_above_ground: float
    source_file: Optional[str] = None

class PredictionResponse(BaseModel):
    tilt_class: int
    tilt_ratio: float
    model_version: str
    element_id: str
    deviation_tolerance: float | None = None
    leaning_status: str | None = None