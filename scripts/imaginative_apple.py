from pathlib import Path
import math
import random

import bpy
import bmesh
from mathutils import Vector


random.seed(7)

ROOT = Path(__file__).resolve().parent.parent
BLENDER_DIR = ROOT / "blender"
RENDER_DIR = ROOT / "renders"
BLEND_PATH = BLENDER_DIR / "imaginative_apple.blend"
RENDER_PATH = RENDER_DIR / "imaginative_apple.png"


def ensure_dirs():
    BLENDER_DIR.mkdir(parents=True, exist_ok=True)
    RENDER_DIR.mkdir(parents=True, exist_ok=True)


def clear_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)

    for datablock in (
        bpy.data.meshes,
        bpy.data.materials,
        bpy.data.lights,
        bpy.data.curves,
        bpy.data.cameras,
        bpy.data.images,
        bpy.data.node_groups,
    ):
        for block in list(datablock):
            if block.users == 0:
                datablock.remove(block)


def set_render():
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.device = "CPU"
    scene.cycles.samples = 80
    scene.cycles.use_adaptive_sampling = True
    scene.cycles.use_denoising = True
    scene.render.resolution_x = 1200
    scene.render.resolution_y = 1350
    scene.render.resolution_percentage = 100
    scene.render.film_transparent = False
    scene.render.image_settings.file_format = "PNG"
    scene.render.filepath = str(RENDER_PATH)
    scene.view_settings.look = "AgX - Medium High Contrast"
    scene.view_settings.exposure = -0.85
    scene.render.use_persistent_data = False


def add_camera():
    bpy.ops.object.camera_add(location=(0.0, -7.8, 2.15), rotation=(math.radians(76), 0.0, 0.0))
    camera = bpy.context.active_object
    camera.data.lens = 72
    camera.data.dof.use_dof = True
    camera.data.dof.focus_distance = 7.6
    camera.data.dof.aperture_fstop = 3.5
    bpy.context.scene.camera = camera
    return camera


def add_lights():
    bpy.ops.object.light_add(type="AREA", location=(2.6, -2.2, 4.8))
    key = bpy.context.active_object
    key.data.energy = 1800
    key.data.shape = "RECTANGLE"
    key.data.size = 2.8
    key.data.size_y = 2.1
    key.rotation_euler = (math.radians(56), 0.0, math.radians(34))

    bpy.ops.object.light_add(type="AREA", location=(-3.6, -3.2, 2.2))
    fill = bpy.context.active_object
    fill.data.energy = 420
    fill.data.shape = "RECTANGLE"
    fill.data.size = 4.5
    fill.data.size_y = 4.5
    fill.rotation_euler = (math.radians(78), 0.0, math.radians(-38))

    bpy.ops.object.light_add(type="AREA", location=(-1.6, 2.6, 3.5))
    rim = bpy.context.active_object
    rim.data.energy = 1100
    rim.data.shape = "RECTANGLE"
    rim.data.size = 2.0
    rim.data.size_y = 2.0
    rim.rotation_euler = (math.radians(-42), 0.0, math.radians(180))

    world = bpy.context.scene.world
    world.use_nodes = True
    nodes = world.node_tree.nodes
    bg = nodes.get("Background")
    bg.inputs[0].default_value = (0.006, 0.007, 0.012, 1.0)
    bg.inputs[1].default_value = 0.18


def shade_smooth(obj):
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.shade_smooth()
    obj.select_set(False)


def add_subsurf(obj, levels=2, render_levels=3):
    mod = obj.modifiers.new(name="Subdivision", type="SUBSURF")
    mod.levels = levels
    mod.render_levels = render_levels
    return mod


def add_weighted_normal(obj):
    mod = obj.modifiers.new(name="WeightedNormal", type="WEIGHTED_NORMAL")
    mod.keep_sharp = True
    return mod


def distort_apple(mesh):
    bm = bmesh.new()
    bm.from_mesh(mesh)

    for vert in bm.verts:
        x, y, z = vert.co
        radius = math.sqrt(x * x + y * y)
        theta = math.atan2(y, x)

        waist = 1.0 + 0.12 * math.cos(z * math.pi * 1.2)
        vertical_taper = 1.0 - 0.12 * (z - 0.15) ** 2
        asymmetry = 1.0 + 0.05 * math.sin(theta * 3.0 + z * 4.0)
        vert.co.x *= waist * vertical_taper * asymmetry
        vert.co.y *= waist * vertical_taper * (1.0 - 0.04 * math.cos(theta * 2.0 - z * 2.0))

        top_indent = math.exp(-((z - 0.96) ** 2) / 0.02)
        bottom_indent = math.exp(-((z + 0.98) ** 2) / 0.012)
        pinch = 0.28 * top_indent + 0.2 * bottom_indent
        vert.co.xy *= max(0.62, 1.0 - pinch)

        if z > 0.55:
            vert.co.z -= 0.08 * top_indent
        if z < -0.55:
            vert.co.z += 0.06 * bottom_indent

        wobble = 0.014 * math.sin(theta * 7.0 + z * 9.0)
        vert.co += Vector((x, y, z)).normalized() * wobble

        if radius < 0.16 and z > 0.72:
            vert.co.z -= 0.11 * (1.0 - radius / 0.16)

    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(mesh)
    bm.free()


def create_apple():
    bpy.ops.mesh.primitive_uv_sphere_add(segments=64, ring_count=40, radius=1.08, location=(0.0, 0.0, 0.18))
    apple = bpy.context.active_object
    apple.name = "Apple"
    distort_apple(apple.data)
    shade_smooth(apple)
    add_subsurf(apple, levels=2, render_levels=2)
    return apple


def create_stem():
    curve_data = bpy.data.curves.new("StemCurve", type="CURVE")
    curve_data.dimensions = "3D"
    curve_data.resolution_u = 32
    curve_data.bevel_depth = 0.036
    curve_data.bevel_resolution = 10

    spline = curve_data.splines.new("BEZIER")
    spline.bezier_points.add(3)

    points = [
        (0.0, 0.0, 1.0),
        (0.04, 0.03, 1.18),
        (0.08, -0.03, 1.34),
        (0.1, -0.06, 1.48),
    ]
    for point, coords in zip(spline.bezier_points, points):
        point.co = coords
        point.handle_left_type = "AUTO"
        point.handle_right_type = "AUTO"

    stem = bpy.data.objects.new("Stem", curve_data)
    bpy.context.collection.objects.link(stem)
    stem.rotation_euler = (math.radians(8), math.radians(-8), math.radians(-22))
    return stem


def make_leaf_mesh():
    mesh = bpy.data.meshes.new("LeafMesh")
    bm = bmesh.new()

    verts = [
        (-0.03, 0.0, 0.0),
        (-0.22, 0.12, 0.02),
        (-0.44, 0.0, 0.04),
        (-0.22, -0.12, 0.02),
        (0.18, 0.0, -0.01),
    ]
    bm_verts = [bm.verts.new(v) for v in verts]
    bm.faces.new(bm_verts)
    bmesh.ops.subdivide_edges(
        bm,
        edges=bm.edges[:],
        cuts=4,
        use_grid_fill=True,
        smooth=0.2,
    )

    for vert in bm.verts:
        factor = (vert.co.x + 0.44) / 0.62
        arch = math.sin(max(0.0, min(1.0, factor)) * math.pi) * 0.06
        vert.co.z += arch
        vert.co.y *= 0.88 + 0.2 * factor

    bm.normal_update()
    bm.to_mesh(mesh)
    bm.free()
    return mesh


def create_leaf():
    leaf_obj = bpy.data.objects.new("Leaf", make_leaf_mesh())
    bpy.context.collection.objects.link(leaf_obj)
    leaf_obj.location = (0.11, -0.04, 1.27)
    leaf_obj.rotation_euler = (math.radians(34), math.radians(-18), math.radians(22))
    leaf_obj.scale = (1.2, 1.1, 1.0)
    shade_smooth(leaf_obj)
    add_subsurf(leaf_obj, levels=2, render_levels=2)
    return leaf_obj


def create_ground():
    bpy.ops.mesh.primitive_plane_add(size=14, location=(0.0, 0.0, -1.18))
    ground = bpy.context.active_object
    ground.name = "Backdrop"
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.subdivide(number_cuts=20)
    bpy.ops.object.mode_set(mode="OBJECT")

    mesh = ground.data
    for vert in mesh.vertices:
        x, y, _ = vert.co
        vert.co.z = -0.08 * math.exp(-((x * x + y * y) / 22.0))

    shade_smooth(ground)
    add_subsurf(ground, levels=1, render_levels=2)
    add_weighted_normal(ground)
    return ground


def set_material(obj, material):
    if obj.data.materials:
        obj.data.materials[0] = material
    else:
        obj.data.materials.append(material)


def apple_material():
    mat = bpy.data.materials.new(name="AppleSkin")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    output = nodes.new("ShaderNodeOutputMaterial")
    output.location = (950, 0)

    bsdf = nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.location = (700, 0)
    bsdf.inputs["Base Color"].default_value = (0.42, 0.015, 0.01, 1.0)
    bsdf.inputs["Subsurface Weight"].default_value = 0.08
    bsdf.inputs["Subsurface Radius"].default_value = (1.0, 0.35, 0.2)
    bsdf.inputs["Roughness"].default_value = 0.36
    bsdf.inputs["Specular IOR Level"].default_value = 0.36
    bsdf.inputs["Coat Weight"].default_value = 0.18
    bsdf.inputs["Coat Roughness"].default_value = 0.12

    tex_coord = nodes.new("ShaderNodeTexCoord")
    tex_coord.location = (-1100, 180)

    mapping = nodes.new("ShaderNodeMapping")
    mapping.location = (-900, 180)
    mapping.inputs["Scale"].default_value = (1.1, 1.1, 1.5)

    noise_large = nodes.new("ShaderNodeTexNoise")
    noise_large.location = (-660, 220)
    noise_large.inputs["Scale"].default_value = 2.4
    noise_large.inputs["Detail"].default_value = 12.0
    noise_large.inputs["Roughness"].default_value = 0.52

    noise_small = nodes.new("ShaderNodeTexNoise")
    noise_small.location = (-660, -100)
    noise_small.inputs["Scale"].default_value = 16.0
    noise_small.inputs["Detail"].default_value = 8.0
    noise_small.inputs["Roughness"].default_value = 0.63

    voronoi = nodes.new("ShaderNodeTexVoronoi")
    voronoi.location = (-650, 20)
    voronoi.feature = "SMOOTH_F1"
    voronoi.inputs["Scale"].default_value = 8.6

    color_ramp = nodes.new("ShaderNodeValToRGB")
    color_ramp.location = (-410, 220)
    color_ramp.color_ramp.elements[0].position = 0.18
    color_ramp.color_ramp.elements[0].color = (0.17, 0.015, 0.012, 1.0)
    color_ramp.color_ramp.elements[1].position = 0.87
    color_ramp.color_ramp.elements[1].color = (0.68, 0.06, 0.025, 1.0)

    speckle_ramp = nodes.new("ShaderNodeValToRGB")
    speckle_ramp.location = (-410, 20)
    speckle_ramp.color_ramp.elements[0].position = 0.36
    speckle_ramp.color_ramp.elements[0].color = (0.0, 0.0, 0.0, 1.0)
    speckle_ramp.color_ramp.elements[1].position = 0.64
    speckle_ramp.color_ramp.elements[1].color = (1.0, 0.75, 0.35, 1.0)

    mix_color = nodes.new("ShaderNodeMix")
    mix_color.location = (120, 120)
    mix_color.data_type = "RGBA"
    mix_color.blend_type = "MIX"
    mix_color.inputs["Factor"].default_value = 0.14

    multiply_speckles = nodes.new("ShaderNodeMix")
    multiply_speckles.location = (360, 140)
    multiply_speckles.data_type = "RGBA"
    multiply_speckles.blend_type = "MULTIPLY"
    multiply_speckles.inputs["Factor"].default_value = 0.08

    gradient = nodes.new("ShaderNodeTexGradient")
    gradient.location = (-650, 430)
    gradient.gradient_type = "SPHERICAL"

    gradient_map = nodes.new("ShaderNodeMapping")
    gradient_map.location = (-890, 430)
    gradient_map.inputs["Scale"].default_value = (0.8, 0.8, 1.8)

    top_glow_ramp = nodes.new("ShaderNodeValToRGB")
    top_glow_ramp.location = (-410, 420)
    top_glow_ramp.color_ramp.elements[0].position = 0.18
    top_glow_ramp.color_ramp.elements[0].color = (0.0, 0.0, 0.0, 1.0)
    top_glow_ramp.color_ramp.elements[1].position = 0.78
    top_glow_ramp.color_ramp.elements[1].color = (0.42, 0.18, 0.03, 1.0)

    add_top_color = nodes.new("ShaderNodeMix")
    add_top_color.location = (560, 240)
    add_top_color.data_type = "RGBA"
    add_top_color.blend_type = "ADD"
    add_top_color.inputs["Factor"].default_value = 0.07

    bump = nodes.new("ShaderNodeBump")
    bump.location = (440, -160)
    bump.inputs["Strength"].default_value = 0.045
    bump.inputs["Distance"].default_value = 0.3

    roughness_ramp = nodes.new("ShaderNodeValToRGB")
    roughness_ramp.location = (-400, -120)
    roughness_ramp.color_ramp.elements[0].position = 0.24
    roughness_ramp.color_ramp.elements[0].color = (0.12, 0.12, 0.12, 1.0)
    roughness_ramp.color_ramp.elements[1].position = 0.82
    roughness_ramp.color_ramp.elements[1].color = (0.46, 0.46, 0.46, 1.0)

    links.new(tex_coord.outputs["Object"], mapping.inputs["Vector"])
    links.new(mapping.outputs["Vector"], noise_large.inputs["Vector"])
    links.new(mapping.outputs["Vector"], noise_small.inputs["Vector"])
    links.new(mapping.outputs["Vector"], voronoi.inputs["Vector"])
    links.new(tex_coord.outputs["Object"], gradient_map.inputs["Vector"])
    links.new(gradient_map.outputs["Vector"], gradient.inputs["Vector"])

    links.new(noise_large.outputs["Fac"], color_ramp.inputs["Fac"])
    links.new(voronoi.outputs["Distance"], speckle_ramp.inputs["Fac"])
    links.new(color_ramp.outputs["Color"], mix_color.inputs["A"])
    mix_color.inputs["B"].default_value = (0.52, 0.05, 0.02, 1.0)
    links.new(mix_color.outputs["Result"], multiply_speckles.inputs["A"])
    links.new(speckle_ramp.outputs["Color"], multiply_speckles.inputs["B"])
    links.new(gradient.outputs["Fac"], top_glow_ramp.inputs["Fac"])
    links.new(multiply_speckles.outputs["Result"], add_top_color.inputs["A"])
    links.new(top_glow_ramp.outputs["Color"], add_top_color.inputs["B"])

    links.new(noise_small.outputs["Fac"], bump.inputs["Height"])
    links.new(noise_large.outputs["Fac"], roughness_ramp.inputs["Fac"])

    links.new(add_top_color.outputs["Result"], bsdf.inputs["Base Color"])
    links.new(roughness_ramp.outputs["Color"], bsdf.inputs["Roughness"])
    links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])
    links.new(bsdf.outputs["BSDF"], output.inputs["Surface"])
    return mat


def stem_material():
    mat = bpy.data.materials.new(name="StemBark")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    output = nodes.new("ShaderNodeOutputMaterial")
    output.location = (500, 0)

    bsdf = nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.location = (220, 0)
    bsdf.inputs["Base Color"].default_value = (0.18, 0.1, 0.04, 1.0)
    bsdf.inputs["Roughness"].default_value = 0.78

    noise = nodes.new("ShaderNodeTexNoise")
    noise.location = (-260, 40)
    noise.inputs["Scale"].default_value = 9.0
    noise.inputs["Detail"].default_value = 6.0

    bump = nodes.new("ShaderNodeBump")
    bump.location = (-20, -100)
    bump.inputs["Strength"].default_value = 0.18

    links.new(noise.outputs["Fac"], bump.inputs["Height"])
    links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])
    links.new(bsdf.outputs["BSDF"], output.inputs["Surface"])
    return mat


def leaf_material():
    mat = bpy.data.materials.new(name="Leaf")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    output = nodes.new("ShaderNodeOutputMaterial")
    output.location = (660, 0)

    bsdf = nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.location = (340, 0)
    bsdf.inputs["Base Color"].default_value = (0.08, 0.32, 0.06, 1.0)
    bsdf.inputs["Subsurface Weight"].default_value = 0.04
    bsdf.inputs["Subsurface Radius"].default_value = (0.3, 0.8, 0.15)
    bsdf.inputs["Roughness"].default_value = 0.4

    tex_coord = nodes.new("ShaderNodeTexCoord")
    tex_coord.location = (-760, 120)

    mapping = nodes.new("ShaderNodeMapping")
    mapping.location = (-560, 120)
    mapping.inputs["Scale"].default_value = (6.0, 3.0, 1.0)

    wave = nodes.new("ShaderNodeTexWave")
    wave.location = (-360, 120)
    wave.wave_type = "BANDS"
    wave.bands_direction = "X"
    wave.inputs["Scale"].default_value = 7.2
    wave.inputs["Distortion"].default_value = 4.0
    wave.inputs["Detail"].default_value = 3.0

    noise = nodes.new("ShaderNodeTexNoise")
    noise.location = (-360, -80)
    noise.inputs["Scale"].default_value = 14.0
    noise.inputs["Detail"].default_value = 5.0

    color_ramp = nodes.new("ShaderNodeValToRGB")
    color_ramp.location = (-120, 100)
    color_ramp.color_ramp.elements[0].position = 0.28
    color_ramp.color_ramp.elements[0].color = (0.06, 0.22, 0.05, 1.0)
    color_ramp.color_ramp.elements[1].position = 0.82
    color_ramp.color_ramp.elements[1].color = (0.38, 0.62, 0.12, 1.0)

    bump = nodes.new("ShaderNodeBump")
    bump.location = (120, -120)
    bump.inputs["Strength"].default_value = 0.08

    links.new(tex_coord.outputs["Object"], mapping.inputs["Vector"])
    links.new(mapping.outputs["Vector"], wave.inputs["Vector"])
    links.new(mapping.outputs["Vector"], noise.inputs["Vector"])
    links.new(wave.outputs["Color"], color_ramp.inputs["Fac"])
    links.new(noise.outputs["Fac"], bump.inputs["Height"])
    links.new(color_ramp.outputs["Color"], bsdf.inputs["Base Color"])
    links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])
    links.new(bsdf.outputs["BSDF"], output.inputs["Surface"])
    return mat


def backdrop_material():
    mat = bpy.data.materials.new(name="Backdrop")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    output = nodes.new("ShaderNodeOutputMaterial")
    output.location = (660, 0)

    bsdf = nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.location = (360, 0)
    bsdf.inputs["Base Color"].default_value = (0.07, 0.075, 0.085, 1.0)
    bsdf.inputs["Roughness"].default_value = 0.92

    tex_coord = nodes.new("ShaderNodeTexCoord")
    tex_coord.location = (-760, 0)

    mapping = nodes.new("ShaderNodeMapping")
    mapping.location = (-560, 0)
    mapping.inputs["Scale"].default_value = (0.35, 0.35, 0.35)

    noise = nodes.new("ShaderNodeTexNoise")
    noise.location = (-340, 0)
    noise.inputs["Scale"].default_value = 2.2
    noise.inputs["Detail"].default_value = 8.0

    ramp = nodes.new("ShaderNodeValToRGB")
    ramp.location = (-80, 0)
    ramp.color_ramp.elements[0].position = 0.1
    ramp.color_ramp.elements[0].color = (0.035, 0.04, 0.05, 1.0)
    ramp.color_ramp.elements[1].position = 0.94
    ramp.color_ramp.elements[1].color = (0.14, 0.15, 0.16, 1.0)

    links.new(tex_coord.outputs["Object"], mapping.inputs["Vector"])
    links.new(mapping.outputs["Vector"], noise.inputs["Vector"])
    links.new(noise.outputs["Fac"], ramp.inputs["Fac"])
    links.new(ramp.outputs["Color"], bsdf.inputs["Base Color"])
    links.new(bsdf.outputs["BSDF"], output.inputs["Surface"])
    return mat


def arrange_scene():
    apple = create_apple()
    stem = create_stem()
    leaf = create_leaf()
    ground = create_ground()

    set_material(apple, apple_material())
    set_material(stem, stem_material())
    set_material(leaf, leaf_material())
    set_material(ground, backdrop_material())

    empty = bpy.data.objects.new("FocusTarget", None)
    empty.location = (0.0, 0.0, 0.35)
    bpy.context.collection.objects.link(empty)

    return {
        "apple": apple,
        "stem": stem,
        "leaf": leaf,
        "ground": ground,
        "focus": empty,
    }


def save_blend():
    bpy.ops.wm.save_as_mainfile(filepath=str(BLEND_PATH))


def render():
    bpy.ops.render.render(write_still=True)


def main():
    ensure_dirs()
    clear_scene()
    set_render()
    add_camera()
    add_lights()
    arrange_scene()
    save_blend()
    render()


if __name__ == "__main__":
    main()
