"""
Generate PNGs from the SVG logo.
Usage:
  python scripts/generate_logos.py --sizes 256 512

This script uses cairosvg to convert SVG -> PNG. Install with:
  pip install cairosvg

Outputs are written to the same folder as the SVG (`icons/`) as `logo-elder-256.png`, `logo-elder-512.png`, etc.
"""
import os
import sys
import argparse
import shutil
import subprocess

SVG_PATH = os.path.join(os.path.dirname(__file__), '..', 'icons', 'logo-elder.svg')
SVG_PATH = os.path.normpath(SVG_PATH)

def generate(sizes):
    use_cairosvg = False
    try:
        import cairosvg  # type: ignore
        use_cairosvg = True
    except Exception:
        # cairosvg or its native cairo dependency is not available.
        # We'll try to fall back to Inkscape CLI (if installed) to render PNGs.
        print('cairosvg not available or missing native Cairo. Will try Inkscape CLI fallback if present.')

    # Helper to call Inkscape if available. Accepts optional explicit path via env or argument.
    def inkscape_render(svg_path, out_path, size, explicit_path=None):
        # Inkscape command differs by version: newer versions use --export-filename
        candidates = []
        if explicit_path:
            candidates.append(explicit_path)
        # check environment variable
        env_path = os.environ.get('INKSCAPE_PATH')
        if env_path:
            candidates.append(env_path)
        # common executable names
        candidates.extend([shutil.which('inkscape'), shutil.which('inkscape.com'), shutil.which('inkscape.exe')])
        # Common Windows install locations
        candidates.extend([
            r'C:\Program Files\Inkscape\bin\inkscape.exe',
            r'C:\Program Files\Inkscape\inkscape.exe',
            r'C:\Program Files (x86)\Inkscape\bin\inkscape.exe',
            r'C:\Program Files (x86)\Inkscape\inkscape.exe'
        ])
        # Filter out None and duplicates
        seen = set()
        candidates = [c for c in candidates if c and not (c in seen or seen.add(c))]

        inkscape_cmd = None
        for c in candidates:
            if c and os.path.isfile(c):
                inkscape_cmd = c
                break
            # if candidate is just an executable name found by shutil.which, accept it
            if c and os.path.isabs(c) and os.path.exists(c):
                inkscape_cmd = c
                break
        if not inkscape_cmd:
            return False, 'Inkscape not found in PATH or common locations. Provide --inkscape-path or add to PATH.'
        # Build command
        # Try --export-filename (modern) then fallback to --export-png
        cmd_modern = [inkscape_cmd, svg_path, '--export-filename=' + out_path, '--export-width=' + str(size), '--export-height=' + str(size)]
        cmd_legacy = [inkscape_cmd, '--export-png=' + out_path, '--export-width=' + str(size), '--export-height=' + str(size), svg_path]
        try:
            res = subprocess.run(cmd_modern, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            return True, None
        except Exception:
            try:
                res = subprocess.run(cmd_legacy, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
                return True, None
            except Exception as e:
                return False, str(e)

    if not os.path.isfile(SVG_PATH):
        print('SVG not found at:', SVG_PATH)
        sys.exit(1)

    with open(SVG_PATH, 'rb') as f:
        svg_bytes = f.read()

    out_dir = os.path.dirname(SVG_PATH)
    for s in sizes:
        out_name = f'logo-elder-{s}.png'
        out_path = os.path.join(out_dir, out_name)
        if use_cairosvg:
            try:
                cairosvg.svg2png(bytestring=svg_bytes, write_to=out_path, output_width=s, output_height=s)
                print('Wrote', out_path)
                continue
            except Exception as e:
                print('cairosvg failed for size', s, '->', e)

        # Try inkscape fallback
        ok, err = inkscape_render(SVG_PATH, out_path, s)
        if ok:
            print('Wrote (inkscape)', out_path)
        else:
            print('Failed to render', s, '->', err)

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--sizes', nargs='+', type=int, default=[256,512], help='Sizes to generate (px)')
    args = parser.parse_args()
    generate(args.sizes)
