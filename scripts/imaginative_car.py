from pathlib import Path
import math

import bpy
import bmesh


ROOT = Path(__file__).resolve().parent.parent
BLENDER_DIR = ROOT / "blender"
RENDER_DIR = ROOT / "renders"
BLEND_PATH = BLENDER_DIR / "imaginative_car.blend"
RENDER_PATH = RENDER_DIR / "imaginative_car.png"


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
        bpy.data.cameras,
        bpy.data.images,
        bpy.data.node_groups,
        bpy.data.curves,
    ):
        for block in list(datablock):
            if block.users == 0:
                datablock.remove(block)


def activate(obj):
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj


def apply_transform(obj):
    activate(obj)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)


def apply_modifier(obj, modifier_name):
    activate(obj)
    bpy.ops.object.modifier_apply(modifier=modifier_name)


def shade_smooth(obj):
    activate(obj)
    bpy.ops.object.shade_smooth()
    obj.select_set(False)


def add_weighted_normal(obj):
    mod = obj.modifiers.new(name="WeightedNormal", type="WEIGHTED_NORMAL")
    mod.keep_sharp = True
    return mod


def add_bevel(obj, width=0.03, segments=3):
    mod = obj.modifiers.new(name="Bevel", type="BEVEL")
    mod.width = width
    mod.segments = segments
    mod.limit_method = "ANGLE"
    mod.harden_normals = True
    return mod


def set_render():
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.device = "CPU"
    scene.cycles.samples = 96
    scene.cycles.use_adaptive_sampling = True
    scene.cycles.use_denoising = True
    scene.render.resolution_x = 1600
    scene.render.resolution_y = 900
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.filepath = str(RENDER_PATH)
    scene.render.film_transparent = False
    scene.view_settings.look = "AgX - High Contrast"
    scene.view_settings.exposure = -0.7


def create_target():
    target = bpy.data.objects.new("Target", None)
    target.location = (0.55, 0.0, 0.82)
    bpy.context.collection.objects.link(target)
    return target


def track_to(obj, target):
    constraint = obj.constraints.new(type="TRACK_TO")
    constraint.target = target
    constraint.track_axis = "TRACK_NEGATIVE_Z"
    constraint.up_axis = "UP_Y"


def add_camera(target):
    bpy.ops.object.camera_add(location=(8.0, -7.2, 2.65))
    camera = bpy.context.active_object
    camera.data.lens = 68
    camera.data.sensor_width = 36
    camera.data.dof.use_dof = True
    camera.data.dof.focus_object = target
    camera.data.dof.aperture_fstop = 5.6
    track_to(camera, target)
    bpy.context.scene.camera = camera
    return camera


def add_lights(target):
    bpy.ops.object.light_add(type="AREA", location=(4.2, -5.8, 5.8))
    key = bpy.context.active_object
    key.data.energy = 2100
    key.data.shape = "RECTANGLE"
    key.data.size = 6.2
    key.data.size_y = 3.2
    track_to(key, target)

    bpy.ops.object.light_add(type="AREA", location=(-5.8, -4.2, 2.8))
    fill = bpy.context.active_object
    fill.data.energy = 420
    fill.data.shape = "RECTANGLE"
    fill.data.size = 5.5
    fill.data.size_y = 4.0
    track_to(fill, target)

    bpy.ops.object.light_add(type="AREA", location=(-1.8, 5.0, 3.8))
    rim = bpy.context.active_object
    rim.data.energy = 1500
    rim.data.shape = "RECTANGLE"
    rim.data.size = 4.0
    rim.data.size_y = 2.4
    track_to(rim, target)

    bpy.ops.object.light_add(type="POINT", location=(0.0, 0.0, 0.48))
    under = bpy.context.active_object
    under.data.energy = 60
    under.data.color = (0.12, 0.28, 0.75)
    under.data.shadow_soft_size = 1.2

    world = bpy.context.scene.world
    world.use_nodes = True
    bg = world.node_tree.nodes.get("Background")
    bg.inputs[0].default_value = (0.005, 0.008, 0.014, 1.0)
    bg.inputs[1].default_value = 0.14


def distort_body(mesh):
    bm = bmesh.new()
    bm.from_mesh(mesh)

    for vert in bm.verts:
        x, y, z = vert.co
        y_sign = 1.0 if y >= 0.0 else -1.0
        y_abs = abs(y)

        if z > 0.0:
            if x > 0.5:
                vert.co.z -= 0.10 * (x - 0.5)
                vert.co.y *= 0.96
            if x > 1.85:
                vert.co.z -= 0.12 * (x - 1.85)
                vert.co.x -= 0.06 * (x - 1.85)
            if x < -1.55:
                vert.co.z += 0.06 * (-1.55 - x)
                vert.co.y *= 1.03
            if -0.2 < x < 0.9:
                vert.co.z += 0.03 * (1.0 - abs(x - 0.35))

        if z < 0.0:
            if x > 1.45:
                vert.co.z += 0.06 * (x - 1.45)
            if x < -1.6:
                vert.co.z += 0.05 * (-1.6 - x)

        if x > 0.8:
            vert.co.y = y_sign * (y_abs * (0.92 + 0.08 * (2.4 - min(x, 2.4))))
        if x < -1.0:
            vert.co.y = y_sign * (y_abs * 1.02)

        if z > 0.12 and y_abs > 0.7:
            vert.co.y = y_sign * (y_abs + 0.03)

    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(mesh)
    bm.free()


def distort_canopy(mesh):
    bm = bmesh.new()
    bm.from_mesh(mesh)

    for vert in bm.verts:
        x, y, z = vert.co
        y_sign = 1.0 if y >= 0.0 else -1.0
        y_abs = abs(y)

        if z > 0:
            if x > 0.0:
                vert.co.x -= 0.48 * min(1.0, x / 1.15)
                vert.co.z += 0.03
            else:
                vert.co.x += 0.10 * min(1.0, abs(x) / 1.1)
            vert.co.y = y_sign * (y_abs * 0.76)

        if z < 0:
            if x > 0.2:
                vert.co.x -= 0.30 * min(1.0, x / 1.0)
            if x < -0.4:
                vert.co.x += 0.05
            vert.co.y = y_sign * (y_abs * 0.92)

    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(mesh)
    bm.free()


def distort_wedge(mesh, front_bias=1.0):
    bm = bmesh.new()
    bm.from_mesh(mesh)

    for vert in bm.verts:
        x, y, z = vert.co
        y_sign = 1.0 if y >= 0.0 else -1.0
        y_abs = abs(y)

        if z > 0.0:
            vert.co.z -= 0.17 * (x * front_bias)
            vert.co.y = y_sign * (y_abs * (0.9 - 0.08 * max(0.0, x)))
        else:
            vert.co.z += 0.04 * max(0.0, x)

    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(mesh)
    bm.free()


def create_body():
    bpy.ops.mesh.primitive_cube_add(location=(-0.05, 0.0, 0.70))
    body = bpy.context.active_object
    body.name = "Body"
    body.scale = (2.15, 0.98, 0.26)
    apply_transform(body)
    distort_body(body.data)

    for x_pos in (-1.45, 1.42):
        bpy.ops.mesh.primitive_cylinder_add(
            vertices=64,
            radius=0.54,
            depth=2.6,
            location=(x_pos, 0.0, 0.47),
            rotation=(math.radians(90), 0.0, 0.0),
        )
        cutter = bpy.context.active_object
        cutter.name = f"ArchCutter_{x_pos:+.2f}"
        boolean = body.modifiers.new(name=f"WheelArch_{x_pos:+.2f}", type="BOOLEAN")
        boolean.operation = "DIFFERENCE"
        boolean.solver = "EXACT"
        boolean.object = cutter
        apply_modifier(body, boolean.name)
        activate(cutter)
        bpy.ops.object.delete(use_global=False)

    add_bevel(body, width=0.04, segments=4)
    add_weighted_normal(body)
    shade_smooth(body)
    return body


def create_canopy():
    bpy.ops.mesh.primitive_cube_add(location=(-0.1, 0.0, 1.02))
    canopy = bpy.context.active_object
    canopy.name = "Canopy"
    canopy.scale = (0.95, 0.64, 0.25)
    apply_transform(canopy)
    distort_canopy(canopy.data)
    add_bevel(canopy, width=0.03, segments=3)
    add_weighted_normal(canopy)
    shade_smooth(canopy)
    return canopy


def create_hood():
    bpy.ops.mesh.primitive_cube_add(location=(1.20, 0.0, 0.83))
    hood = bpy.context.active_object
    hood.name = "Hood"
    hood.scale = (1.05, 0.94, 0.15)
    apply_transform(hood)
    distort_wedge(hood.data, front_bias=1.0)
    add_bevel(hood, width=0.035, segments=3)
    add_weighted_normal(hood)
    shade_smooth(hood)
    return hood


def create_rear_deck():
    bpy.ops.mesh.primitive_cube_add(location=(-1.55, 0.0, 0.82))
    deck = bpy.context.active_object
    deck.name = "RearDeck"
    deck.scale = (0.88, 0.94, 0.17)
    apply_transform(deck)
    distort_wedge(deck.data, front_bias=-0.7)
    add_bevel(deck, width=0.03, segments=3)
    add_weighted_normal(deck)
    shade_smooth(deck)
    return deck


def create_front_splitter():
    bpy.ops.mesh.primitive_cube_add(location=(2.22, 0.0, 0.21))
    splitter = bpy.context.active_object
    splitter.name = "FrontSplitter"
    splitter.scale = (0.42, 0.90, 0.03)
    apply_transform(splitter)
    add_bevel(splitter, width=0.012, segments=2)
    add_weighted_normal(splitter)
    shade_smooth(splitter)
    return splitter


def create_diffuser():
    bpy.ops.mesh.primitive_cube_add(location=(-2.08, 0.0, 0.23))
    diffuser = bpy.context.active_object
    diffuser.name = "RearDiffuser"
    diffuser.scale = (0.28, 0.86, 0.04)
    apply_transform(diffuser)
    add_bevel(diffuser, width=0.012, segments=2)
    add_weighted_normal(diffuser)
    shade_smooth(diffuser)
    return diffuser


def create_side_blades():
    blades = []
    for side in (-1, 1):
        bpy.ops.mesh.primitive_cube_add(location=(0.05, side * 0.98, 0.43))
        blade = bpy.context.active_object
        blade.name = f"SideBlade_{side:+d}"
        blade.scale = (1.72, 0.06, 0.06)
        apply_transform(blade)
        add_bevel(blade, width=0.014, segments=2)
        add_weighted_normal(blade)
        shade_smooth(blade)
        blades.append(blade)
    return blades


def create_headlights():
    lights = []
    for side in (-1, 1):
        bpy.ops.mesh.primitive_cube_add(location=(2.18, side * 0.55, 0.63))
        headlight = bpy.context.active_object
        headlight.name = f"Headlight_{side:+d}"
        headlight.scale = (0.05, 0.20, 0.03)
        apply_transform(headlight)
        add_bevel(headlight, width=0.01, segments=2)
        shade_smooth(headlight)
        lights.append(headlight)
    return lights


def create_taillight():
    bpy.ops.mesh.primitive_cube_add(location=(-2.18, 0.0, 0.66))
    light_bar = bpy.context.active_object
    light_bar.name = "Taillight"
    light_bar.scale = (0.04, 0.72, 0.03)
    apply_transform(light_bar)
    add_bevel(light_bar, width=0.01, segments=2)
    shade_smooth(light_bar)
    return light_bar


def create_wheel(location):
    wheel_objects = []

    bpy.ops.mesh.primitive_torus_add(
        major_segments=64,
        minor_segments=28,
        major_radius=0.39,
        minor_radius=0.14,
        location=location,
        rotation=(math.radians(90), 0.0, 0.0),
    )
    tire = bpy.context.active_object
    tire.name = f"Tire_{location[0]:+.2f}_{location[1]:+.2f}"
    shade_smooth(tire)
    wheel_objects.append(tire)

    bpy.ops.mesh.primitive_cylinder_add(
        vertices=48,
        radius=0.28,
        depth=0.20,
        location=location,
        rotation=(math.radians(90), 0.0, 0.0),
    )
    rim = bpy.context.active_object
    rim.name = f"Rim_{location[0]:+.2f}_{location[1]:+.2f}"
    add_bevel(rim, width=0.015, segments=2)
    add_weighted_normal(rim)
    shade_smooth(rim)
    wheel_objects.append(rim)

    bpy.ops.mesh.primitive_cylinder_add(
        vertices=36,
        radius=0.09,
        depth=0.24,
        location=location,
        rotation=(math.radians(90), 0.0, 0.0),
    )
    hub = bpy.context.active_object
    hub.name = f"Hub_{location[0]:+.2f}_{location[1]:+.2f}"
    add_bevel(hub, width=0.01, segments=2)
    shade_smooth(hub)
    wheel_objects.append(hub)

    return wheel_objects


def create_ground():
    bpy.ops.mesh.primitive_plane_add(size=36, location=(0.0, 0.0, 0.0))
    ground = bpy.context.active_object
    ground.name = "Ground"
    shade_smooth(ground)
    return ground


def assign_material(obj, material):
    if obj.data.materials:
        obj.data.materials[0] = material
    else:
        obj.data.materials.append(material)


def car_paint_material():
    mat = bpy.data.materials.new(name="CarPaint")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    output = nodes.new("ShaderNodeOutputMaterial")
    output.location = (880, 0)

    bsdf = nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.location = (620, 0)
    bsdf.inputs["Base Color"].default_value = (0.54, 0.18, 0.03, 1.0)
    bsdf.inputs["Metallic"].default_value = 0.7
    bsdf.inputs["Roughness"].default_value = 0.24
    bsdf.inputs["Specular IOR Level"].default_value = 0.45
    bsdf.inputs["Coat Weight"].default_value = 0.32
    bsdf.inputs["Coat Roughness"].default_value = 0.07

    tex_coord = nodes.new("ShaderNodeTexCoord")
    tex_coord.location = (-1000, 0)

    mapping = nodes.new("ShaderNodeMapping")
    mapping.location = (-790, 0)
    mapping.inputs["Scale"].default_value = (1.1, 1.8, 1.3)

    noise = nodes.new("ShaderNodeTexNoise")
    noise.location = (-560, 100)
    noise.inputs["Scale"].default_value = 6.5
    noise.inputs["Detail"].default_value = 12.0
    noise.inputs["Roughness"].default_value = 0.55

    noise2 = nodes.new("ShaderNodeTexNoise")
    noise2.location = (-560, -120)
    noise2.inputs["Scale"].default_value = 28.0
    noise2.inputs["Detail"].default_value = 6.0
    noise2.inputs["Roughness"].default_value = 0.42

    ramp = nodes.new("ShaderNodeValToRGB")
    ramp.location = (-320, 100)
    ramp.color_ramp.elements[0].position = 0.12
    ramp.color_ramp.elements[0].color = (0.11, 0.02, 0.01, 1.0)
    ramp.color_ramp.elements[1].position = 0.9
    ramp.color_ramp.elements[1].color = (0.78, 0.24, 0.04, 1.0)

    mix = nodes.new("ShaderNodeMix")
    mix.location = (-60, 60)
    mix.data_type = "RGBA"
    mix.blend_type = "MIX"
    mix.inputs["Factor"].default_value = 0.18
    mix.inputs["B"].default_value = (0.62, 0.19, 0.03, 1.0)

    rough_ramp = nodes.new("ShaderNodeValToRGB")
    rough_ramp.location = (-320, -120)
    rough_ramp.color_ramp.elements[0].position = 0.3
    rough_ramp.color_ramp.elements[0].color = (0.1, 0.1, 0.1, 1.0)
    rough_ramp.color_ramp.elements[1].position = 0.88
    rough_ramp.color_ramp.elements[1].color = (0.38, 0.38, 0.38, 1.0)

    bump = nodes.new("ShaderNodeBump")
    bump.location = (180, -140)
    bump.inputs["Strength"].default_value = 0.015
    bump.inputs["Distance"].default_value = 0.1

    links.new(tex_coord.outputs["Object"], mapping.inputs["Vector"])
    links.new(mapping.outputs["Vector"], noise.inputs["Vector"])
    links.new(mapping.outputs["Vector"], noise2.inputs["Vector"])
    links.new(noise.outputs["Fac"], ramp.inputs["Fac"])
    links.new(ramp.outputs["Color"], mix.inputs["A"])
    links.new(noise2.outputs["Fac"], rough_ramp.inputs["Fac"])
    links.new(noise2.outputs["Fac"], bump.inputs["Height"])
    links.new(mix.outputs["Result"], bsdf.inputs["Base Color"])
    links.new(rough_ramp.outputs["Color"], bsdf.inputs["Roughness"])
    links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])
    links.new(bsdf.outputs["BSDF"], output.inputs["Surface"])
    return mat


def trim_material():
    mat = bpy.data.materials.new(name="Trim")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    output = nodes.new("ShaderNodeOutputMaterial")
    output.location = (420, 0)
    bsdf = nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.location = (160, 0)
    bsdf.inputs["Base Color"].default_value = (0.03, 0.035, 0.04, 1.0)
    bsdf.inputs["Metallic"].default_value = 0.12
    bsdf.inputs["Roughness"].default_value = 0.32

    links.new(bsdf.outputs["BSDF"], output.inputs["Surface"])
    return mat


def glass_material():
    mat = bpy.data.materials.new(name="Glass")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    output = nodes.new("ShaderNodeOutputMaterial")
    output.location = (620, 0)

    glass = nodes.new("ShaderNodeBsdfGlass")
    glass.location = (120, 70)
    glass.inputs["Color"].default_value = (0.15, 0.22, 0.30, 1.0)
    glass.inputs["Roughness"].default_value = 0.03
    glass.inputs["IOR"].default_value = 1.45

    glossy = nodes.new("ShaderNodeBsdfGlossy")
    glossy.location = (120, -90)
    glossy.inputs["Color"].default_value = (0.02, 0.03, 0.05, 1.0)
    glossy.inputs["Roughness"].default_value = 0.14

    mix = nodes.new("ShaderNodeMixShader")
    mix.location = (360, 0)
    mix.inputs["Fac"].default_value = 0.72

    links.new(glass.outputs["BSDF"], mix.inputs[1])
    links.new(glossy.outputs["BSDF"], mix.inputs[2])
    links.new(mix.outputs["Shader"], output.inputs["Surface"])
    return mat


def tire_material():
    mat = bpy.data.materials.new(name="Tire")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    output = nodes.new("ShaderNodeOutputMaterial")
    output.location = (500, 0)

    bsdf = nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.location = (180, 0)
    bsdf.inputs["Base Color"].default_value = (0.012, 0.012, 0.014, 1.0)
    bsdf.inputs["Roughness"].default_value = 0.88

    noise = nodes.new("ShaderNodeTexNoise")
    noise.location = (-100, 0)
    noise.inputs["Scale"].default_value = 18.0
    noise.inputs["Detail"].default_value = 4.0

    bump = nodes.new("ShaderNodeBump")
    bump.location = (60, -120)
    bump.inputs["Strength"].default_value = 0.08

    links.new(noise.outputs["Fac"], bump.inputs["Height"])
    links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])
    links.new(bsdf.outputs["BSDF"], output.inputs["Surface"])
    return mat


def rim_material():
    mat = bpy.data.materials.new(name="Rim")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    output = nodes.new("ShaderNodeOutputMaterial")
    output.location = (420, 0)
    bsdf = nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.location = (180, 0)
    bsdf.inputs["Base Color"].default_value = (0.32, 0.34, 0.38, 1.0)
    bsdf.inputs["Metallic"].default_value = 1.0
    bsdf.inputs["Roughness"].default_value = 0.18

    links.new(bsdf.outputs["BSDF"], output.inputs["Surface"])
    return mat


def emissive_material(name, color, strength):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    output = nodes.new("ShaderNodeOutputMaterial")
    output.location = (360, 0)

    emission = nodes.new("ShaderNodeEmission")
    emission.location = (120, 0)
    emission.inputs["Color"].default_value = (*color, 1.0)
    emission.inputs["Strength"].default_value = strength

    links.new(emission.outputs["Emission"], output.inputs["Surface"])
    return mat


def ground_material():
    mat = bpy.data.materials.new(name="Ground")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    output = nodes.new("ShaderNodeOutputMaterial")
    output.location = (700, 0)

    bsdf = nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.location = (420, 0)
    bsdf.inputs["Base Color"].default_value = (0.05, 0.055, 0.06, 1.0)
    bsdf.inputs["Roughness"].default_value = 0.62
    bsdf.inputs["Metallic"].default_value = 0.0

    tex_coord = nodes.new("ShaderNodeTexCoord")
    tex_coord.location = (-720, 0)

    mapping = nodes.new("ShaderNodeMapping")
    mapping.location = (-520, 0)
    mapping.inputs["Scale"].default_value = (0.25, 0.25, 0.25)

    noise = nodes.new("ShaderNodeTexNoise")
    noise.location = (-300, 0)
    noise.inputs["Scale"].default_value = 3.0
    noise.inputs["Detail"].default_value = 10.0

    ramp = nodes.new("ShaderNodeValToRGB")
    ramp.location = (-60, 0)
    ramp.color_ramp.elements[0].position = 0.06
    ramp.color_ramp.elements[0].color = (0.03, 0.035, 0.04, 1.0)
    ramp.color_ramp.elements[1].position = 0.92
    ramp.color_ramp.elements[1].color = (0.14, 0.15, 0.16, 1.0)

    bump = nodes.new("ShaderNodeBump")
    bump.location = (180, -120)
    bump.inputs["Strength"].default_value = 0.03

    links.new(tex_coord.outputs["Object"], mapping.inputs["Vector"])
    links.new(mapping.outputs["Vector"], noise.inputs["Vector"])
    links.new(noise.outputs["Fac"], ramp.inputs["Fac"])
    links.new(noise.outputs["Fac"], bump.inputs["Height"])
    links.new(ramp.outputs["Color"], bsdf.inputs["Base Color"])
    links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])
    links.new(bsdf.outputs["BSDF"], output.inputs["Surface"])
    return mat


def build_car():
    materials = {
        "paint": car_paint_material(),
        "trim": trim_material(),
        "glass": glass_material(),
        "tire": tire_material(),
        "rim": rim_material(),
        "headlight": emissive_material("Headlight", (0.75, 0.92, 1.0), 6.0),
        "taillight": emissive_material("Taillight", (1.0, 0.12, 0.05), 5.5),
        "ground": ground_material(),
    }

    body = create_body()
    canopy = create_canopy()
    hood = create_hood()
    rear_deck = create_rear_deck()
    splitter = create_front_splitter()
    diffuser = create_diffuser()
    blades = create_side_blades()
    headlights = create_headlights()
    taillight = create_taillight()
    ground = create_ground()

    assign_material(body, materials["paint"])
    assign_material(canopy, materials["glass"])
    assign_material(hood, materials["paint"])
    assign_material(rear_deck, materials["paint"])
    assign_material(splitter, materials["trim"])
    assign_material(diffuser, materials["trim"])
    assign_material(taillight, materials["taillight"])
    assign_material(ground, materials["ground"])

    for blade in blades:
        assign_material(blade, materials["trim"])

    for headlight in headlights:
        assign_material(headlight, materials["headlight"])

    wheel_positions = [
        (1.42, 1.06, 0.45),
        (1.42, -1.06, 0.45),
        (-1.45, 1.06, 0.45),
        (-1.45, -1.06, 0.45),
    ]
    for position in wheel_positions:
        tire, rim, hub = create_wheel(position)
        assign_material(tire, materials["tire"])
        assign_material(rim, materials["rim"])
        assign_material(hub, materials["trim"])


def save_blend():
    bpy.ops.wm.save_as_mainfile(filepath=str(BLEND_PATH))


def render():
    bpy.ops.render.render(write_still=True)


def main():
    ensure_dirs()
    clear_scene()
    set_render()
    target = create_target()
    add_camera(target)
    add_lights(target)
    build_car()
    save_blend()
    render()


if __name__ == "__main__":
    main()
