import struct
import json
import sys
import os

def make_glb_unlit(input_path, output_path=None):
    if output_path is None:
        output_path = input_path

    with open(input_path, 'rb') as f:
        data = f.read()

    # GLB Header: magic (4), version (4), length (4)
    magic, version, length = struct.unpack_from('<4sII', data, 0)
    assert magic == b'glTF', 'Not a GLB file'

    # Chunk 0: JSON
    chunk0_len, chunk0_type = struct.unpack_from('<II', data, 12)
    assert chunk0_type == 0x4E4F534A, 'Chunk 0 is not JSON'
    json_bytes = data[20:20 + chunk0_len]

    # Chunk 1: BIN (if present)
    bin_start = 20 + chunk0_len
    bin_chunk = data[bin_start:]

    gltf = json.loads(json_bytes.decode('utf-8'))

    # Add KHR_materials_unlit
    if 'extensionsUsed' not in gltf:
        gltf['extensionsUsed'] = []
    if 'KHR_materials_unlit' not in gltf['extensionsUsed']:
        gltf['extensionsUsed'].append('KHR_materials_unlit')

    # Apply to all materials
    for mat in gltf.get('materials', []):
        if 'extensions' not in mat:
            mat['extensions'] = {}
        mat['extensions']['KHR_materials_unlit'] = {}

    # Pack new JSON chunk
    new_json_bytes = json.dumps(gltf, separators=(',', ':')).encode('utf-8')
    # Pad to 4-byte boundary with spaces
    padding_len = (4 - (len(new_json_bytes) % 4)) % 4
    new_json_bytes += b' ' * padding_len

    new_chunk0_len = len(new_json_bytes)
    new_total_len = 12 + 8 + new_chunk0_len + len(bin_chunk)

    new_header = struct.pack('<4sII', b'glTF', version, new_total_len)
    new_chunk0_header = struct.pack('<II', new_chunk0_len, 0x4E4F534A)

    with open(output_path, 'wb') as f:
        f.write(new_header)
        f.write(new_chunk0_header)
        f.write(new_json_bytes)
        f.write(bin_chunk)

    print(f'✔ Successfully converted {input_path} to UNLIT: saved to {output_path} ({new_total_len} bytes)')

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print('Usage: python3 make_unlit_glb.py <input.glb> [output.glb]')
        sys.exit(1)
    in_file = sys.argv[1]
    out_file = sys.argv[2] if len(sys.argv) > 2 else in_file
    make_glb_unlit(in_file, out_file)
