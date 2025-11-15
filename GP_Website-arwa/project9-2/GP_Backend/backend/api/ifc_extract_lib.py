import ifcopenshell
import ifcopenshell.geom
import numpy as np

# ---------- Unit detection ----------
def detect_ifc_unit(ifc):
    for u in ifc.by_type("IfcUnitAssignment"):
        for unit in u.Units:
            if unit.is_a("IfcSIUnit") and unit.UnitType == "LENGTHUNIT":
                if unit.Prefix == "MILLI":
                    return "MILLIMETRE"
                if unit.Name == "METRE":
                    return "METRE"
            if unit.is_a("IfcConversionBasedUnit") and unit.UnitType == "LENGTHUNIT":
                if "FOOT" in unit.Name.upper():
                    return "FOOT"
    return "MILLIMETRE"

# ---------- Unified unit conversion ----------
def convert_to_mm(value, unit_str: str, from_geom: bool = False) -> float:
    if value is None:
        return None
    if from_geom:
        return float(value) * 1000.0
    unit_str = unit_str.upper()
    if "MILLIMETRE" in unit_str or unit_str == "MM":
        return float(value)
    if "METRE" in unit_str or unit_str == "M":
        return float(value) * 1000.0
    if "FOOT" in unit_str or "FEET" in unit_str:
        return float(value) * 304.8
    return float(value)

# ---------- Geometry extraction ----------
def compute_extents_and_xy(settings, element, unit_str):
    try:
        shape = ifcopenshell.geom.create_shape(settings, element)
        verts = shape.geometry.verts
        if not verts or len(verts) < 3:
            return (None,) * 7

        xs = np.array(verts[0::3])
        ys = np.array(verts[1::3])
        zs = np.array(verts[2::3])

        base_z = float(zs.min())
        top_z = float(zs.max())
        centroid_z = (base_z + top_z) / 2.0
        tol = (top_z - base_z) * 0.01
        base_mask = np.isclose(zs, base_z, atol=tol)
        top_mask = np.isclose(zs, top_z, atol=tol)

        base_x = float(xs[base_mask].mean()) if base_mask.any() else np.nan
        base_y = float(ys[base_mask].mean()) if base_mask.any() else np.nan
        top_x  = float(xs[top_mask].mean())  if top_mask.any()  else np.nan
        top_y  = float(ys[top_mask].mean())  if top_mask.any()  else np.nan

        # Convert to mm
        base_z     = convert_to_mm(base_z, unit_str, from_geom=True)
        top_z      = convert_to_mm(top_z, unit_str, from_geom=True)
        centroid_z = convert_to_mm(centroid_z, unit_str, from_geom=True)
        base_x     = convert_to_mm(base_x, unit_str, from_geom=True)
        base_y     = convert_to_mm(base_y, unit_str, from_geom=True)
        top_x      = convert_to_mm(top_x, unit_str, from_geom=True)
        top_y      = convert_to_mm(top_y, unit_str, from_geom=True)

        return base_z, top_z, centroid_z, base_x, base_y, top_x, top_y
    except Exception:
        return (None,) * 7

# ---------- Main extraction ----------
def extract_ifc_parameters(ifc_path, structural_types=("IfcColumn",)):
    ifc = ifcopenshell.open(ifc_path)
    settings = ifcopenshell.geom.settings()
    settings.set(settings.USE_WORLD_COORDS, True)

    unit_str = detect_ifc_unit(ifc)
    results = []

    for t in structural_types:
        try:
            elements = ifc.by_type(t)
        except RuntimeError:
            continue

        for elem in elements:
            element_id = getattr(elem, "GlobalId", None)
            base_z, top_z, centroid_z, base_x, base_y, top_x, top_y = compute_extents_and_xy(settings, elem, unit_str)

            column_height_mm = None
            if base_z is not None and top_z is not None:
                column_height_mm = top_z - base_z

            width_mm = length_mm = None
            min_x = min_y = min_z = max_x = max_y = max_z = None

            try:
                shape = ifcopenshell.geom.create_shape(settings, elem)
                verts = np.array(shape.geometry.verts, dtype=float).reshape(-1, 3)
                min_xyz = verts.min(axis=0)
                max_xyz = verts.max(axis=0)
                bbox = max_xyz - min_xyz

                min_x = convert_to_mm(min_xyz[0], unit_str, from_geom=True)
                min_y = convert_to_mm(min_xyz[1], unit_str, from_geom=True)
                min_z = convert_to_mm(min_xyz[2], unit_str, from_geom=True)
                max_x = convert_to_mm(max_xyz[0], unit_str, from_geom=True)
                max_y = convert_to_mm(max_xyz[1], unit_str, from_geom=True)
                max_z = convert_to_mm(max_xyz[2], unit_str, from_geom=True)

                if bbox[0] > bbox[1]:
                    width_mm  = convert_to_mm(bbox[1], unit_str, from_geom=True)
                    length_mm = convert_to_mm(bbox[0], unit_str, from_geom=True)
                else:
                    width_mm  = convert_to_mm(bbox[0], unit_str, from_geom=True)
                    length_mm = convert_to_mm(bbox[1], unit_str, from_geom=True)
            except Exception:
                pass

            # Derived values
            cross_section_area_mm2 = (width_mm * length_mm) if width_mm and length_mm else None
            aspect_ratio = (length_mm / width_mm) if width_mm else None
            height_to_width_ratio = (column_height_mm / width_mm) if width_mm else None
            height_above_ground = base_z

            results.append({
                "element_id": element_id,
                "base_z": base_z,
                "top_z": top_z,
                "centroid_z": centroid_z,
                "base_x": base_x,
                "base_y": base_y,
                "top_x": top_x,
                "top_y": top_y,
                "min_x": min_x,
                "min_y": min_y,
                "min_z": min_z,
                "max_x": max_x,
                "max_y": max_y,
                "max_z": max_z,
                "column_height_mm": column_height_mm,
                "width_mm": width_mm,
                "length_mm": length_mm,
                "cross_section_area_mm2": cross_section_area_mm2,
                "aspect_ratio": aspect_ratio,
                "height_to_width_ratio": height_to_width_ratio,
                "height_above_ground": height_above_ground,
                "source_file": ifc_path
            })

    return results