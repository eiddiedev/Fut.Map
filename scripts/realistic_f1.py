from pathlib import Path
import math

import bpy
import bmesh


ROOT = Path(__file__).resolve().parent.parent
BLENDER_DIR = ROOT / "blender"
RENDER_DIR = ROOT / "renders"
BLEND_PATH = BLENDER_DIR / "realistic_f1.blend"
RENDER_PATH = RENDER_DIR / "realistic_f1.png"


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


def add_bevel(obj, width=0.02, segments=3):
    mod = obj.modifiers.new(name="Bevel", type="BEVEL")
    mod.width = width
    mod.segments = segments
    mod.limit_method = "ANGLE"
    mod.harden_normals = True
    return mod


def add_subsurf(obj, levels=1, render_levels=2):
    mod = obj.modifiers.new(name="Subdivision", type="SUBSURF")
    mod.levels = levels
    mod.render_levels = render_levels
    return mod


def add_weighted_normal(obj):
    mod = obj.modifiers.new(name="WeightedNormal", type="WEIGHTED_NORMAL")
    mod.keep_sharp = True
    return mod


def assign_material(obj, material):
    if obj.data.materials:
        obj.data.materials[0] = material
    else:
        obj.data.materials.append(material)


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
    scene.view_settings.look = "AgX - Medium High Contrast"
    scene.view_settings.exposure = -0.78


def create_target():
    target = bpy.data.objects.new("Target", None)
    target.location = (0.7, 0.0, 0.4)
    bpy.context.collection.objects.link(target)
    return target


def track_to(obj, target):
    constraint = obj.constraints.new(type="TRACK_TO")
    constraint.target = target
    constraint.track_axis = "TRACK_NEGATIVE_Z"
    constraint.up_axis = "UP_Y"


def add_camera(target):
    bpy.ops.object.camera_add(location=(8.4, -6.0, 1.55))
    camera = bpy.context.active_object
    camera.data.lens = 82
    camera.data.sensor_width = 36
    camera.data.dof.use_dof = True
    camera.data.dof.focus_object = target
    camera.data.dof.aperture_fstop = 6.3
    track_to(camera, target)
    bpy.context.scene.camera = camera
    return camera


def add_lights(target):
    bpy.ops.object.light_add(type="AREA", location=(4.5, -4.7, 5.2))
    key = bpy.context.active_object
    key.data.energy = 2200
    key.data.shape = "RECTANGLE"
    key.data.size = 5.4
    key.data.size_y = 2.8
    track_to(key, target)

    bpy.ops.object.light_add(type="AREA", location=(-5.2, -3.8, 2.6))
    fill = bpy.context.active_object
    fill.data.energy = 480
    fill.data.shape = "RECTANGLE"
    fill.data.size = 5.2
    fill.data.size_y = 4.2
    track_to(fill, target)

    bpy.ops.object.light_add(type="AREA", location=(-2.4, 5.4, 3.4))
    rim = bpy.context.active_object
    rim.data.energy = 1450
    rim.data.shape = "RECTANGLE"
    rim.data.size = 4.2
    rim.data.size_y = 2.4
    track_to(rim, target)

    bpy.ops.object.light_add(type="POINT", location=(0.4, 0.0, 0.28))
    accent = bpy.context.active_object
    accent.data.energy = 40
    accent.data.color = (0.18, 0.28, 0.75)
    accent.data.shadow_soft_size = 1.4

    world = bpy.context.scene.world
    world.use_nodes = True
    bg = world.node_tree.nodes.get("Background")
    bg.inputs[0].default_value = (0.006, 0.008, 0.014, 1.0)
    bg.inputs[1].default_value = 0.12


def deform_monocoque(mesh):
    bm = bmesh.new()
    bm.from_mesh(mesh)

    for vert in bm.verts:
        x, y, z = vert.co
        y_sign = 1.0 if y >= 0.0 else -1.0
        y_abs = abs(y)

        if x > -0.2:
            vert.co.y = y_sign * (y_abs * (0.88 - 0.18 * min(1.0, (x + 0.2) / 2.8)))
            if z > 0.0:
                vert.co.z -= 0.12 * min(1.0, (x + 0.2) / 2.8)

        if x < -0.1:
            vert.co.y = y_sign * (y_abs * (0.98 + 0.12 * min(1.0, abs(x + 0.1) / 1.6)))
            if z > 0.0:
                vert.co.z += 0.08 * min(1.0, abs(x + 0.1) / 1.6)

        if -0.9 < x < 0.5 and z > 0:
            vert.co.z += 0.06 * (1.0 - abs(x + 0.2))

    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(mesh)
    bm.free()


def deform_nose(mesh):
    bm = bmesh.new()
    bm.from_mesh(mesh)

    for vert in bm.verts:
        x, y, z = vert.co
        y_sign = 1.0 if y >= 0.0 else -1.0
        y_abs = abs(y)

        factor = min(1.0, max(0.0, (x + 0.95) / 3.0))
        vert.co.y = y_sign * (y_abs * (1.0 - 0.55 * factor))
        if z > 0:
            vert.co.z -= 0.1 * factor
        else:
            vert.co.z += 0.03 * factor

        if x > 1.4:
            vert.co.z -= 0.05 * (x - 1.4)

    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(mesh)
    bm.free()


def deform_sidepod(mesh, side):
    bm = bmesh.new()
    bm.from_mesh(mesh)

    for vert in bm.verts:
        x, y, z = vert.co
        y_abs = abs(y)
        if x > -0.2:
            vert.co.y = math.copysign(y_abs * (0.92 - 0.12 * min(1.0, (x + 0.2) / 1.8)), side)
            if z > 0:
                vert.co.z -= 0.08 * min(1.0, (x + 0.2) / 1.8)
        if x < -0.4:
            vert.co.z += 0.06 * min(1.0, abs(x + 0.4) / 1.2)

    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(mesh)
    bm.free()


def deform_engine_cover(mesh):
    bm = bmesh.new()
    bm.from_mesh(mesh)

    for vert in bm.verts:
        x, y, z = vert.co
        y_sign = 1.0 if y >= 0.0 else -1.0
        y_abs = abs(y)

        if z > 0:
            vert.co.y = y_sign * (y_abs * (0.8 - 0.12 * min(1.0, abs(x + 0.55) / 1.6)))
            if x < 0:
                vert.co.z += 0.14 * min(1.0, abs(x) / 1.2)
            if x > 0:
                vert.co.z -= 0.08 * min(1.0, x / 1.4)

    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(mesh)
    bm.free()


def create_floor():
    bpy.ops.mesh.primitive_cube_add(location=(0.0, 0.0, 0.12))
    floor = bpy.context.active_object
    floor.name = "Floor"
    floor.scale = (2.9, 0.68, 0.05)
    apply_transform(floor)
    add_bevel(floor, width=0.012, segments=2)
    add_weighted_normal(floor)
    shade_smooth(floor)
    return floor


def create_monocoque():
    bpy.ops.mesh.primitive_cube_add(location=(-0.15, 0.0, 0.44))
    mono = bpy.context.active_object
    mono.name = "Monocoque"
    mono.scale = (1.75, 0.52, 0.34)
    apply_transform(mono)
    deform_monocoque(mono.data)
    add_subsurf(mono, levels=1, render_levels=2)
    add_bevel(mono, width=0.03, segments=3)
    add_weighted_normal(mono)
    shade_smooth(mono)
    return mono


def create_nose():
    bpy.ops.mesh.primitive_cube_add(location=(1.85, 0.0, 0.31))
    nose = bpy.context.active_object
    nose.name = "Nose"
    nose.scale = (1.55, 0.22, 0.12)
    apply_transform(nose)
    deform_nose(nose.data)
    add_subsurf(nose, levels=1, render_levels=2)
    add_bevel(nose, width=0.02, segments=3)
    add_weighted_normal(nose)
    shade_smooth(nose)
    return nose


def create_sidepod(side):
    bpy.ops.mesh.primitive_cube_add(location=(-0.2, side * 0.77, 0.34))
    pod = bpy.context.active_object
    pod.name = f"Sidepod_{side:+d}"
    pod.scale = (1.55, 0.42, 0.22)
    apply_transform(pod)
    deform_sidepod(pod.data, side)
    add_subsurf(pod, levels=1, render_levels=2)
    add_bevel(pod, width=0.02, segments=3)
    add_weighted_normal(pod)
    shade_smooth(pod)
    return pod


def create_engine_cover():
    bpy.ops.mesh.primitive_cube_add(location=(-1.2, 0.0, 0.72))
    cover = bpy.context.active_object
    cover.name = "EngineCover"
    cover.scale = (1.35, 0.34, 0.32)
    apply_transform(cover)
    deform_engine_cover(cover.data)
    add_subsurf(cover, levels=1, render_levels=2)
    add_bevel(cover, width=0.025, segments=3)
    add_weighted_normal(cover)
    shade_smooth(cover)
    return cover


def create_cockpit_lip():
    bpy.ops.mesh.primitive_torus_add(
        major_segments=56,
        minor_segments=18,
        major_radius=0.28,
        minor_radius=0.03,
        location=(-0.32, 0.0, 0.64),
        rotation=(math.radians(90), 0.0, 0.0),
    )
    lip = bpy.context.active_object
    lip.name = "CockpitLip"
    lip.scale = (1.42, 0.8, 0.75)
    apply_transform(lip)
    shade_smooth(lip)
    return lip


def create_airbox():
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.11, depth=0.42, location=(-1.38, 0.0, 1.07), rotation=(math.radians(90), 0.0, 0.0))
    airbox = bpy.context.active_object
    airbox.name = "Airbox"
    add_bevel(airbox, width=0.008, segments=2)
    shade_smooth(airbox)
    return airbox


def create_front_wing():
    pieces = []
    for z, scale_y, x_loc in ((0.11, 1.0, 2.92), (0.17, 0.92, 2.84), (0.23, 0.82, 2.74)):
        bpy.ops.mesh.primitive_cube_add(location=(x_loc, 0.0, z))
        plane = bpy.context.active_object
        plane.name = f"FrontWing_{z:.2f}"
        plane.scale = (0.42, 0.86 * scale_y, 0.018)
        apply_transform(plane)
        add_bevel(plane, width=0.008, segments=2)
        add_weighted_normal(plane)
        shade_smooth(plane)
        pieces.append(plane)

    for side in (-1, 1):
        bpy.ops.mesh.primitive_cube_add(location=(2.86, side * 0.93, 0.2))
        plate = bpy.context.active_object
        plate.name = f"FrontEndplate_{side:+d}"
        plate.scale = (0.12, 0.016, 0.21)
        apply_transform(plate)
        add_bevel(plate, width=0.005, segments=2)
        shade_smooth(plate)
        pieces.append(plate)

    bpy.ops.mesh.primitive_cube_add(location=(2.25, 0.0, 0.17))
    pylon = bpy.context.active_object
    pylon.name = "FrontWingPylon"
    pylon.scale = (0.13, 0.09, 0.11)
    apply_transform(pylon)
    add_bevel(pylon, width=0.008, segments=2)
    shade_smooth(pylon)
    pieces.append(pylon)
    return pieces


def create_rear_wing():
    pieces = []

    bpy.ops.mesh.primitive_cube_add(location=(-2.78, 0.0, 1.12))
    main_plane = bpy.context.active_object
    main_plane.name = "RearWingMain"
    main_plane.scale = (0.34, 0.62, 0.04)
    apply_transform(main_plane)
    add_bevel(main_plane, width=0.01, segments=2)
    add_weighted_normal(main_plane)
    shade_smooth(main_plane)
    pieces.append(main_plane)

    bpy.ops.mesh.primitive_cube_add(location=(-2.66, 0.0, 1.27))
    flap = bpy.context.active_object
    flap.name = "RearWingFlap"
    flap.scale = (0.28, 0.58, 0.03)
    apply_transform(flap)
    add_bevel(flap, width=0.01, segments=2)
    shade_smooth(flap)
    pieces.append(flap)

    for side in (-1, 1):
        bpy.ops.mesh.primitive_cube_add(location=(-2.76, side * 0.67, 1.15))
        endplate = bpy.context.active_object
        endplate.name = f"RearEndplate_{side:+d}"
        endplate.scale = (0.13, 0.016, 0.26)
        apply_transform(endplate)
        add_bevel(endplate, width=0.005, segments=2)
        shade_smooth(endplate)
        pieces.append(endplate)

    for side in (-1, 1):
        bpy.ops.mesh.primitive_cube_add(location=(-2.32, side * 0.16, 0.75))
        support = bpy.context.active_object
        support.name = f"RearWingSupport_{side:+d}"
        support.scale = (0.08, 0.02, 0.36)
        apply_transform(support)
        add_bevel(support, width=0.004, segments=2)
        shade_smooth(support)
        pieces.append(support)

    return pieces


def create_halo():
    halo_parts = []

    bpy.ops.mesh.primitive_torus_add(
        major_segments=48,
        minor_segments=16,
        major_radius=0.38,
        minor_radius=0.02,
        location=(-0.38, 0.0, 0.79),
        rotation=(math.radians(90), 0.0, 0.0),
    )
    hoop = bpy.context.active_object
    hoop.name = "HaloHoop"
    hoop.scale = (1.0, 0.78, 1.0)
    apply_transform(hoop)
    shade_smooth(hoop)
    halo_parts.append(hoop)

    for x, z in ((-0.78, 0.66), (-0.15, 0.62), (0.14, 0.59)):
        bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.022, depth=0.26, location=(x, 0.0, z))
        pillar = bpy.context.active_object
        pillar.name = f"HaloPillar_{x:.2f}"
        pillar.rotation_euler = (math.radians(90), 0.0, 0.0)
        shade_smooth(pillar)
        halo_parts.append(pillar)

    return halo_parts


def create_suspension():
    parts = []
    arms = [
        ((1.12, 0.28, 0.31), (1.52, 0.86, 0.33)),
        ((1.12, -0.28, 0.31), (1.52, -0.86, 0.33)),
        ((1.02, 0.26, 0.18), (1.52, 0.86, 0.25)),
        ((1.02, -0.26, 0.18), (1.52, -0.86, 0.25)),
        ((-1.48, 0.32, 0.36), (-1.80, 0.92, 0.36)),
        ((-1.48, -0.32, 0.36), (-1.80, -0.92, 0.36)),
        ((-1.30, 0.32, 0.22), (-1.80, 0.92, 0.28)),
        ((-1.30, -0.32, 0.22), (-1.80, -0.92, 0.28)),
    ]

    for start, end in arms:
        mid = tuple((a + b) * 0.5 for a, b in zip(start, end))
        dx = end[0] - start[0]
        dy = end[1] - start[1]
        dz = end[2] - start[2]
        length = math.sqrt(dx * dx + dy * dy + dz * dz)

        bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=0.014, depth=length, location=mid)
        arm = bpy.context.active_object
        arm.name = f"Suspension_{start[0]:+.2f}_{start[1]:+.2f}"
        arm.rotation_euler = (
            math.atan2(dy, dz),
            0.0,
            -math.atan2(dx, math.sqrt(dy * dy + dz * dz)),
        )
        shade_smooth(arm)
        parts.append(arm)

    return parts


def create_axles():
    axles = []
    for x in (1.54, -1.82):
        bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.04, depth=1.68, location=(x, 0.0, 0.23), rotation=(math.radians(90), 0.0, 0.0))
        axle = bpy.context.active_object
        axle.name = f"Axle_{x:.2f}"
        shade_smooth(axle)
        axles.append(axle)
    return axles


def create_wheel(location, is_front):
    parts = []
    radius = 0.35 if is_front else 0.38
    minor = 0.15 if is_front else 0.165
    rim_radius = 0.22 if is_front else 0.24

    bpy.ops.mesh.primitive_torus_add(
        major_segments=72,
        minor_segments=28,
        major_radius=radius,
        minor_radius=minor,
        location=location,
        rotation=(math.radians(90), 0.0, 0.0),
    )
    tire = bpy.context.active_object
    tire.name = f"Tire_{location[0]:+.2f}_{location[1]:+.2f}"
    shade_smooth(tire)
    parts.append(tire)

    bpy.ops.mesh.primitive_cylinder_add(
        vertices=48,
        radius=rim_radius,
        depth=0.30,
        location=location,
        rotation=(math.radians(90), 0.0, 0.0),
    )
    rim = bpy.context.active_object
    rim.name = f"Rim_{location[0]:+.2f}_{location[1]:+.2f}"
    add_bevel(rim, width=0.01, segments=2)
    add_weighted_normal(rim)
    shade_smooth(rim)
    parts.append(rim)

    bpy.ops.mesh.primitive_cylinder_add(
        vertices=24,
        radius=0.07,
        depth=0.34,
        location=location,
        rotation=(math.radians(90), 0.0, 0.0),
    )
    hub = bpy.context.active_object
    hub.name = f"Hub_{location[0]:+.2f}_{location[1]:+.2f}"
    add_bevel(hub, width=0.008, segments=2)
    shade_smooth(hub)
    parts.append(hub)

    return parts


def create_ground():
    bpy.ops.mesh.primitive_plane_add(size=40, location=(0.0, 0.0, 0.0))
    ground = bpy.context.active_object
    ground.name = "Ground"
    shade_smooth(ground)
    return ground


def paint_material():
    mat = bpy.data.materials.new(name="Paint")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    output = nodes.new("ShaderNodeOutputMaterial")
    output.location = (820, 0)

    bsdf = nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.location = (540, 0)
    bsdf.inputs["Base Color"].default_value = (0.64, 0.03, 0.025, 1.0)
    bsdf.inputs["Metallic"].default_value = 0.2
    bsdf.inputs["Roughness"].default_value = 0.22
    bsdf.inputs["Specular IOR Level"].default_value = 0.55
    bsdf.inputs["Coat Weight"].default_value = 0.25
    bsdf.inputs["Coat Roughness"].default_value = 0.07

    tex_coord = nodes.new("ShaderNodeTexCoord")
    tex_coord.location = (-960, 0)

    mapping = nodes.new("ShaderNodeMapping")
    mapping.location = (-750, 0)
    mapping.inputs["Scale"].default_value = (1.2, 1.6, 1.0)

    noise = nodes.new("ShaderNodeTexNoise")
    noise.location = (-520, 100)
    noise.inputs["Scale"].default_value = 7.0
    noise.inputs["Detail"].default_value = 10.0
    noise.inputs["Roughness"].default_value = 0.45

    noise_small = nodes.new("ShaderNodeTexNoise")
    noise_small.location = (-520, -110)
    noise_small.inputs["Scale"].default_value = 26.0
    noise_small.inputs["Detail"].default_value = 5.0

    ramp = nodes.new("ShaderNodeValToRGB")
    ramp.location = (-280, 100)
    ramp.color_ramp.elements[0].position = 0.18
    ramp.color_ramp.elements[0].color = (0.22, 0.015, 0.015, 1.0)
    ramp.color_ramp.elements[1].position = 0.88
    ramp.color_ramp.elements[1].color = (0.74, 0.06, 0.04, 1.0)

    bump = nodes.new("ShaderNodeBump")
    bump.location = (260, -120)
    bump.inputs["Strength"].default_value = 0.01

    rough_ramp = nodes.new("ShaderNodeValToRGB")
    rough_ramp.location = (-280, -110)
    rough_ramp.color_ramp.elements[0].position = 0.25
    rough_ramp.color_ramp.elements[0].color = (0.09, 0.09, 0.09, 1.0)
    rough_ramp.color_ramp.elements[1].position = 0.82
    rough_ramp.color_ramp.elements[1].color = (0.28, 0.28, 0.28, 1.0)

    links.new(tex_coord.outputs["Object"], mapping.inputs["Vector"])
    links.new(mapping.outputs["Vector"], noise.inputs["Vector"])
    links.new(mapping.outputs["Vector"], noise_small.inputs["Vector"])
    links.new(noise.outputs["Fac"], ramp.inputs["Fac"])
    links.new(noise_small.outputs["Fac"], rough_ramp.inputs["Fac"])
    links.new(noise_small.outputs["Fac"], bump.inputs["Height"])
    links.new(ramp.outputs["Color"], bsdf.inputs["Base Color"])
    links.new(rough_ramp.outputs["Color"], bsdf.inputs["Roughness"])
    links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])
    links.new(bsdf.outputs["BSDF"], output.inputs["Surface"])
    return mat


def white_paint_material():
    mat = bpy.data.materials.new(name="WhitePaint")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    output = nodes.new("ShaderNodeOutputMaterial")
    output.location = (360, 0)
    bsdf = nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.location = (120, 0)
    bsdf.inputs["Base Color"].default_value = (0.83, 0.84, 0.86, 1.0)
    bsdf.inputs["Roughness"].default_value = 0.26
    bsdf.inputs["Coat Weight"].default_value = 0.2
    bsdf.inputs["Coat Roughness"].default_value = 0.07
    links.new(bsdf.outputs["BSDF"], output.inputs["Surface"])
    return mat


def carbon_material():
    mat = bpy.data.materials.new(name="Carbon")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    output = nodes.new("ShaderNodeOutputMaterial")
    output.location = (760, 0)

    bsdf = nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.location = (500, 0)
    bsdf.inputs["Base Color"].default_value = (0.018, 0.02, 0.024, 1.0)
    bsdf.inputs["Metallic"].default_value = 0.0
    bsdf.inputs["Roughness"].default_value = 0.24
    bsdf.inputs["Coat Weight"].default_value = 0.08

    tex_coord = nodes.new("ShaderNodeTexCoord")
    tex_coord.location = (-780, 0)

    mapping = nodes.new("ShaderNodeMapping")
    mapping.location = (-580, 0)
    mapping.inputs["Scale"].default_value = (22.0, 8.0, 1.0)

    wave_x = nodes.new("ShaderNodeTexWave")
    wave_x.location = (-360, 90)
    wave_x.wave_type = "BANDS"
    wave_x.bands_direction = "X"
    wave_x.inputs["Scale"].default_value = 7.0

    wave_y = nodes.new("ShaderNodeTexWave")
    wave_y.location = (-360, -90)
    wave_y.wave_type = "BANDS"
    wave_y.bands_direction = "Y"
    wave_y.inputs["Scale"].default_value = 7.0

    mix = nodes.new("ShaderNodeMix")
    mix.location = (-100, 0)
    mix.data_type = "RGBA"
    mix.blend_type = "MULTIPLY"
    mix.inputs["Factor"].default_value = 0.35

    bump = nodes.new("ShaderNodeBump")
    bump.location = (250, -120)
    bump.inputs["Strength"].default_value = 0.03

    links.new(tex_coord.outputs["Object"], mapping.inputs["Vector"])
    links.new(mapping.outputs["Vector"], wave_x.inputs["Vector"])
    links.new(mapping.outputs["Vector"], wave_y.inputs["Vector"])
    links.new(wave_x.outputs["Color"], mix.inputs["A"])
    links.new(wave_y.outputs["Color"], mix.inputs["B"])
    links.new(mix.outputs["Result"], bsdf.inputs["Base Color"])
    links.new(mix.outputs["Result"], bump.inputs["Height"])
    links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])
    links.new(bsdf.outputs["BSDF"], output.inputs["Surface"])
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
    bsdf.location = (220, 0)
    bsdf.inputs["Base Color"].default_value = (0.015, 0.015, 0.018, 1.0)
    bsdf.inputs["Roughness"].default_value = 0.9

    noise = nodes.new("ShaderNodeTexNoise")
    noise.location = (-20, 0)
    noise.inputs["Scale"].default_value = 18.0
    noise.inputs["Detail"].default_value = 4.0

    bump = nodes.new("ShaderNodeBump")
    bump.location = (120, -120)
    bump.inputs["Strength"].default_value = 0.06

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
    output.location = (360, 0)
    bsdf = nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.location = (120, 0)
    bsdf.inputs["Base Color"].default_value = (0.15, 0.16, 0.18, 1.0)
    bsdf.inputs["Metallic"].default_value = 1.0
    bsdf.inputs["Roughness"].default_value = 0.18
    links.new(bsdf.outputs["BSDF"], output.inputs["Surface"])
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
    bsdf.inputs["Base Color"].default_value = (0.045, 0.05, 0.055, 1.0)
    bsdf.inputs["Roughness"].default_value = 0.62

    tex_coord = nodes.new("ShaderNodeTexCoord")
    tex_coord.location = (-720, 0)

    mapping = nodes.new("ShaderNodeMapping")
    mapping.location = (-520, 0)
    mapping.inputs["Scale"].default_value = (0.24, 0.24, 0.24)

    noise = nodes.new("ShaderNodeTexNoise")
    noise.location = (-300, 0)
    noise.inputs["Scale"].default_value = 3.4
    noise.inputs["Detail"].default_value = 9.0

    ramp = nodes.new("ShaderNodeValToRGB")
    ramp.location = (-60, 0)
    ramp.color_ramp.elements[0].position = 0.08
    ramp.color_ramp.elements[0].color = (0.03, 0.035, 0.04, 1.0)
    ramp.color_ramp.elements[1].position = 0.9
    ramp.color_ramp.elements[1].color = (0.14, 0.15, 0.16, 1.0)

    bump = nodes.new("ShaderNodeBump")
    bump.location = (170, -110)
    bump.inputs["Strength"].default_value = 0.03

    links.new(tex_coord.outputs["Object"], mapping.inputs["Vector"])
    links.new(mapping.outputs["Vector"], noise.inputs["Vector"])
    links.new(noise.outputs["Fac"], ramp.inputs["Fac"])
    links.new(noise.outputs["Fac"], bump.inputs["Height"])
    links.new(ramp.outputs["Color"], bsdf.inputs["Base Color"])
    links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])
    links.new(bsdf.outputs["BSDF"], output.inputs["Surface"])
    return mat


def build_f1():
    mats = {
        "paint": paint_material(),
        "white": white_paint_material(),
        "carbon": carbon_material(),
        "tire": tire_material(),
        "rim": rim_material(),
        "ground": ground_material(),
    }

    floor = create_floor()
    monocoque = create_monocoque()
    nose = create_nose()
    engine_cover = create_engine_cover()
    cockpit_lip = create_cockpit_lip()
    airbox = create_airbox()
    front_wing = create_front_wing()
    rear_wing = create_rear_wing()
    halo = create_halo()
    axles = create_axles()
    suspension = create_suspension()
    ground = create_ground()

    assign_material(floor, mats["carbon"])
    assign_material(monocoque, mats["paint"])
    assign_material(nose, mats["white"])
    assign_material(engine_cover, mats["paint"])
    assign_material(cockpit_lip, mats["carbon"])
    assign_material(airbox, mats["carbon"])
    assign_material(ground, mats["ground"])

    sidepods = []
    for side in (-1, 1):
        pod = create_sidepod(side)
        assign_material(pod, mats["paint"])
        sidepods.append(pod)

    for obj in front_wing:
        assign_material(obj, mats["carbon"])

    for obj in rear_wing:
        assign_material(obj, mats["carbon"])

    for obj in halo:
        assign_material(obj, mats["carbon"])

    for obj in axles:
        assign_material(obj, mats["carbon"])

    for obj in suspension:
        assign_material(obj, mats["carbon"])

    wheel_positions = [
        ((1.54, 0.95, 0.36), True),
        ((1.54, -0.95, 0.36), True),
        ((-1.82, 1.02, 0.39), False),
        ((-1.82, -1.02, 0.39), False),
    ]
    for location, is_front in wheel_positions:
        tire, rim, hub = create_wheel(location, is_front)
        assign_material(tire, mats["tire"])
        assign_material(rim, mats["rim"])
        assign_material(hub, mats["carbon"])


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
    build_f1()
    save_blend()
    render()


if __name__ == "__main__":
    main()
