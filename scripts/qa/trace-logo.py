"""205×21 PNG logoyu SVG'ye izler: bicubic ×K büyütme → 0,5 eşiğinde marching squares → Douglas-Peucker."""
import numpy as np
from PIL import Image, ImageDraw
import sys

K = 16
import sys as _s
SIGMA = float(_s.argv[2]) if len(_s.argv) > 2 else 0.0
src = np.asarray(Image.open('dark.png').convert('RGBA')).astype(np.float64) / 255
rgb, a = src[..., :3], src[..., 3]
NAVY = np.array([41, 69, 90]) / 255
TURQ = np.array([26, 169, 158]) / 255
dn = np.linalg.norm(rgb - NAVY, axis=2)
dt = np.linalg.norm(rgb - TURQ, axis=2)
isT = (dt < dn).astype(np.float64)
fields = {'navy': a * (1 - isT), 'turq': a * isT}
H, W = a.shape


def up(f):
    # kenara 2 px boşluk: kontur kapalı kalsın
    f = np.pad(f, 2)
    im = Image.fromarray(f.astype(np.float32), 'F')
    U = np.asarray(im.resize((f.shape[1] * K, f.shape[0] * K), Image.BICUBIC), dtype=np.float64)
    if SIGMA > 0:
        r = int(SIGMA * K * 3)
        x = np.arange(-r, r + 1)
        g = np.exp(-(x / (SIGMA * K)) ** 2 / 2); g /= g.sum()
        U = np.apply_along_axis(lambda v: np.convolve(v, g, 'same'), 0, U)
        U = np.apply_along_axis(lambda v: np.convolve(v, g, 'same'), 1, U)
    return U


def march(F, lv=0.5):
    h, w = F.shape
    b = F > lv
    tl, tr, br, bl = b[:-1, :-1], b[:-1, 1:], b[1:, 1:], b[1:, :-1]
    code = tl * 8 + tr * 4 + br * 2 + bl * 1
    ys, xs = np.nonzero((code > 0) & (code < 15))
    def interp(p, q):
        (y0, x0), (y1, x1) = p, q
        v0, v1 = F[y0, x0], F[y1, x1]
        t = (lv - v0) / (v1 - v0) if v1 != v0 else 0.5
        return (x0 + t * (x1 - x0), y0 + t * (y1 - y0))
    # kenar anahtarları: ('h', y, x) üst kenar (y,x)-(y,x+1); ('v', y, x) sol kenar (y,x)-(y+1,x)
    nxt = {}
    pts = {}
    def E(kind, y, x):
        k = (kind, y, x)
        if k not in pts:
            pts[k] = interp((y, x), (y, x + 1)) if kind == 'h' else interp((y, x), (y + 1, x))
        return k
    for y, x in zip(ys, xs):
        c = code[y, x]
        T, R, B, L = E('h', y, x), E('v', y, x + 1), E('h', y + 1, x), E('v', y, x)
        # dolu bölge solda kalacak şekilde yönlü segmentler
        segs = {
            1: [(B, L)], 2: [(R, B)], 3: [(R, L)], 4: [(T, R)], 6: [(T, B)], 7: [(T, L)],
            8: [(L, T)], 9: [(B, T)], 11: [(R, T)], 12: [(L, R)], 13: [(B, R)], 14: [(L, B)],
        }.get(c)
        if segs is None:  # eyer: 5 veya 10
            center = (F[y, x] + F[y, x + 1] + F[y + 1, x] + F[y + 1, x + 1]) / 4 > lv
            if c == 5:
                segs = [(T, L), (B, R)] if center else [(T, R), (B, L)]
            else:
                segs = [(L, T), (R, B)] if center else [(L, B), (R, T)]
        for s, e in segs:
            nxt[s] = e
    loops = []
    seen = set()
    for s in list(nxt):
        if s in seen:
            continue
        loop = []
        k = s
        while k not in seen:
            seen.add(k)
            loop.append(pts[k])
            k = nxt.get(k)
            if k is None:
                break
        if len(loop) > 2:
            loops.append(np.array(loop))
    return loops


def dp(P, eps):
    # kapalı çokgen: en uzak iki noktadan böl
    def rdp(Q):
        if len(Q) < 3:
            return Q
        a_, b_ = Q[0], Q[-1]
        d = b_ - a_
        n = np.hypot(*d)
        if n == 0:
            dist = np.hypot(*(Q - a_).T)
        else:
            dist = np.abs(d[0] * (Q[:, 1] - a_[1]) - d[1] * (Q[:, 0] - a_[0])) / n
        i = int(np.argmax(dist))
        if dist[i] > eps:
            return np.vstack([rdp(Q[: i + 1])[:-1], rdp(Q[i:])])
        return np.vstack([a_, b_])
    i0 = 0
    i1 = int(np.argmax(np.hypot(*(P - P[0]).T)))
    A = rdp(np.vstack([P[i0 : i1 + 1]]))
    B = rdp(np.vstack([P[i1:], P[:1]]))
    return np.vstack([A[:-1], B[:-1]])


def area(P):
    x, y = P[:, 0], P[:, 1]
    return 0.5 * np.sum(x * np.roll(y, -1) - np.roll(x, -1) * y)


EPS = float(sys.argv[1]) if len(sys.argv) > 1 else 0.07  # orijinal piksel
SIGMA = float(sys.argv[2]) if len(sys.argv) > 2 else 0.0
out = {}
for name, f in fields.items():
    F = up(f)
    loops = march(F)
    res = []
    for L in loops:
        P = (L + 0.5) / K - 2 - 0.5 / K  # büyütülmüş piksel merkezi → orijinal koordinat
        # bicubic resize piksel merkezlerini hizalar: büyük (i+0.5)/K = küçük koordinat
        P = (L + 0.5) / K - 2
        if abs(area(P)) < 0.15:
            continue
        res.append(dp(P, EPS))
    out[name] = res
    print(name, len(res), 'döngü,', sum(len(r) for r in res), 'nokta', file=sys.stderr)


def path(loops):
    s = []
    for P in loops:
        s.append('M' + ' '.join(f'{x:.2f} {y:.2f}'.replace('.00', '') for x, y in P) + 'Z')
    return ''.join(s)

TAG = sys.argv[3] if len(sys.argv) > 3 else ''
np.save('loops'+TAG+'.npy', np.array([out['navy'], out['turq']], dtype=object), allow_pickle=True)
d_navy, d_turq = path(out['navy']), path(out['turq'])
for fn, c1 in [('ozteknik-logo'+TAG+'.svg', '#29455A'), ('ozteknik-logo-white'+TAG+'.svg', '#FFFFFF')]:
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 205 21" width="205" height="21" role="img" aria-label="Özteknik">'
           f'<path fill="{c1}" fill-rule="evenodd" d="{d_navy}"/>'
           f'<path fill="#1AA99E" fill-rule="evenodd" d="{d_turq}"/></svg>\n')
    open(fn, 'w').write(svg)
    print(fn, len(svg), 'bayt', file=sys.stderr)

# doğrulama: çokgenleri 16× çiz (evenodd), 205×21'e küçült, alfa ile karşılaştır
def raster(loops, S=16):
    m = np.zeros((H * S, W * S), bool)
    for P in loops:
        im = Image.new('1', (W * S, H * S), 0)
        ImageDraw.Draw(im).polygon([(x * S, y * S) for x, y in P], fill=1)
        m ^= np.asarray(im, bool)
    return m.reshape(H, S, W, S).mean(axis=(1, 3))
rn, rt = raster(out['navy']), raster(out['turq'])
for nm, r, f in [('navy', rn, fields['navy']), ('turq', rt, fields['turq'])]:
    e = np.abs(r - f)
    print(f'{nm}: ortalama fark {e.mean()*255:.2f}/255, en büyük {e.max()*255:.0f}/255, >64 olan piksel {(e>0.25).sum()}', file=sys.stderr)
Image.fromarray((np.clip(rn + rt, 0, 1) * 255).astype(np.uint8)).resize((W * 8, H * 8), Image.NEAREST).save('check-trace.png')
Image.fromarray((a * 255).astype(np.uint8)).resize((W * 8, H * 8), Image.NEAREST).save('check-orig.png')
