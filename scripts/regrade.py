"""Regrado de color de las imagenes de servicio y dos portadas de blog.

Fuente: _originales/ (solo lectura). Sobrescribe en public/ los WebP y regenera los -og.jpg.
Uso: python scripts/regrade.py <dir_copia_commiteada> <salida_csv>
"""
import csv
import glob
import os
import shutil
import sys

import numpy as np
from PIL import Image, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ORIG = os.path.join(ROOT, "_originales")
PUB = os.path.join(ROOT, "public")


def srgb_to_lin(x): return np.where(x<=0.04045, x/12.92, ((x+0.055)/1.055)**2.4)
def lin_to_srgb(x): return np.where(x<=0.0031308, x*12.92, 1.055*np.power(np.clip(x,0,None),1/2.4)-0.055)

WB, OBJETIVO, SAT = 0.55, 0.47, 1.16

def regrade(path):
    im = Image.open(path).convert('RGB')
    a = np.asarray(im).astype(np.float32)/255.0
    lin = srgb_to_lin(a)

    # balance de blancos suave, calculado sobre los MEDIOS
    lum_lin = 0.2126*lin[...,0]+0.7152*lin[...,1]+0.0722*lin[...,2]
    lo, hi = np.percentile(lum_lin, [25, 85])
    m = (lum_lin>=lo) & (lum_lin<=hi)
    if m.sum() < 1000: m = np.ones_like(lum_lin, bool)
    medios = np.maximum(lin[m].mean(axis=0), 1e-4)
    lin = lin * (1.0 + (medios.mean()/medios - 1.0)*WB)

    # exposicion
    s = lin_to_srgb(np.clip(lin,0,1))
    lum = 0.2126*s[...,0]+0.7152*s[...,1]+0.0722*s[...,2]
    cur = float(lum.mean())
    s = np.clip(s,0,1) ** (np.log(max(OBJETIVO,1e-3))/np.log(max(cur,1e-3)))

    # saturacion preservando luminancia
    lum2 = (0.2126*s[...,0]+0.7152*s[...,1]+0.0722*s[...,2])[...,None]
    s = lum2 + (s-lum2)*SAT

    return Image.fromarray((np.clip(s,0,1)*255).round().astype(np.uint8)), cur


# ---- medicion ----

def stats(path):
    a = np.asarray(Image.open(path).convert("RGB")).astype(np.float32) / 255.0
    lum = float((0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2]).mean())
    m = a.reshape(-1, 3).mean(axis=0)
    return lum, float(m[2] - m[0])  # luminancia media, sesgo azul (B - R medios)


def mse(a, b):
    return float(((np.asarray(a, np.float32) - np.asarray(b, np.float32)) ** 2).mean())


def og_centering(bloque_path, og_path):
    """Encuentra el centrado vertical con que se recorto el og actual a partir del bloque 1."""
    im = Image.open(bloque_path).convert("RGB")
    og = Image.open(og_path).convert("RGB")
    best = min(
        (mse(ImageOps.fit(im, og.size, Image.LANCZOS, centering=(0.5, cy)), og), cy)
        for cy in np.round(np.linspace(0, 1, 201), 3)
    )
    return best[1]


def save_webp(im, dest):
    im.save(dest, "WEBP", quality=82, method=6)


def main():
    backup, out_csv = sys.argv[1], sys.argv[2]

    jobs = []  # (origen, destino_publico)
    for dest in sorted(glob.glob(os.path.join(PUB, "servicios", "*", "*-bloque-*.webp"))):
        stem = os.path.splitext(os.path.basename(dest))[0]
        src = [p for p in glob.glob(os.path.join(ORIG, stem + ".*"))]
        assert len(src) == 1, (stem, src)
        jobs.append((src[0], dest))
    jobs.append((os.path.join(ORIG, "flat-rack-cover.png"),
                 os.path.join(PUB, "blog", "que-es-un-flat-rack-y-cuando-conviene", "cover.webp")))
    jobs.append((os.path.join(ORIG, "lcl-cover.png"),
                 os.path.join(PUB, "blog", "carga-consolidada-maritima-lcl", "cover.webp")))

    ogs = sorted(glob.glob(os.path.join(PUB, "servicios", "*", "*-og.jpg")))

    # ref = copia del estado commiteado (solo lectura): medidas, "antes" y centrado de los og
    def ref(p):
        r = os.path.join(backup, os.path.relpath(p, PUB))
        if not os.path.exists(r):
            os.makedirs(os.path.dirname(r), exist_ok=True)
            shutil.copy2(p, r)
        return r

    # centrado de cada og, medido contra el bloque 1 actual antes de sobrescribir
    og_info = {}
    for og in ogs:
        slug = os.path.basename(os.path.dirname(og))
        b1 = os.path.join(os.path.dirname(og), f"{slug}-bloque-1.webp")
        r = Image.open(ref(og))
        og_info[og] = dict(cy=og_centering(ref(b1), ref(og)), size=r.size, qtables=r.quantization, b1=b1)

    rows = []
    for src, dest in jobs:
        lum_a, blue_a = stats(ref(dest))
        size_a = os.path.getsize(ref(dest))
        target = Image.open(ref(dest)).size
        img, _ = regrade(src)
        if os.path.basename(dest) == "cover.webp":
            img = ImageOps.fit(img, target, Image.LANCZOS)
        else:
            img = img.resize(target, Image.LANCZOS)
        save_webp(img, dest)
        lum_d, blue_d = stats(dest)
        rows.append([os.path.relpath(dest, ROOT), lum_a, lum_d, blue_a, blue_d, size_a, os.path.getsize(dest)])

    for og in ogs:
        info = og_info[og]
        size_a = os.path.getsize(ref(og))
        lum_a, blue_a = stats(ref(og))
        im = Image.open(info["b1"]).convert("RGB")
        im = ImageOps.fit(im, info["size"], Image.LANCZOS, centering=(0.5, info["cy"]))
        im.save(og, "JPEG", qtables=info["qtables"], subsampling=2, progressive=True, optimize=True)
        lum_d, blue_d = stats(og)
        rows.append([os.path.relpath(og, ROOT), lum_a, lum_d, blue_a, blue_d, size_a, os.path.getsize(og)])

    with open(out_csv, "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["archivo", "lum_antes", "lum_despues", "azul_antes", "azul_despues", "peso_antes", "peso_despues"])
        w.writerows(rows)


if __name__ == "__main__":
    main()
