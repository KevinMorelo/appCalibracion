from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional
from decimal import Decimal, getcontext
from math import sqrt
from scipy.stats import t as student_t

getcontext().prec = 28  # buena precisión decimal

app = FastAPI(title="Calib Calc Service", version="1.0.0")

class PuntoHR(BaseModel):
    hrPunto: Decimal
    lecturasIBC: List[Decimal]
    lecturaPatron: Decimal
    uPatron: Decimal
    correccionPatron: Decimal
    resolucionIBC: Decimal
    dofPatron: Optional[int] = None
    distribResIBC: Optional[str] = "RECTANGULAR"

class HRPayload(BaseModel):
    puntos: List[PuntoHR]
    version: Optional[str] = "v1.0.0"

def rss(vals: List[Decimal]) -> Decimal:
    s = Decimal(0)
    for v in vals:
        s += v * v
    return s.sqrt()

def k95(v_eff: float) -> float:
    if v_eff == float("inf"):
        return 1.96
    return float(student_t.ppf(0.975, v_eff))  # bilateral 95%

@app.get("/health")
def health():
    return {"ok": True, "engine": app.version}

@app.post("/calc/hr")
def calc_hr(payload: HRPayload):
    resultados = []
    for p in payload.puntos:
        n = max(len(p.lecturasIBC), 1)
        mean = sum(p.lecturasIBC) / Decimal(n)

        # s muestral
        var = sum((x - mean) ** 2 for x in p.lecturasIBC) / Decimal(max(n - 1, 1))
        s = var.sqrt()

        u_ind = s / Decimal(sqrt(n))
        u_res = p.resolucionIBC / (Decimal(12).sqrt()) if p.distribResIBC == "RECTANGULAR" else p.resolucionIBC
        u_cor = abs(p.correccionPatron)
        u_pat = p.uPatron

        comps = [(u_ind, max(n - 1, 1)), (Decimal(u_cor), None), (u_pat, p.dofPatron or None), (u_res, None)]

        Ucomb = rss([c[0] for c in comps])

        # Welch–Satterthwaite
        num = (Ucomb ** 4)
        den = Decimal(0)
        for (u, dof) in comps:
            if dof is None or dof <= 0:
                continue
            den += (u ** 4) / Decimal(dof)
        vEff = float(num / den) if den != 0 else float("inf")

        k = k95(vEff)
        Uexp = Decimal(str(k)) * Ucomb

        error = mean - p.lecturaPatron
        resultado = mean - p.correccionPatron

        resultados.append({
            "hrPunto": str(p.hrPunto),
            "meanIBC": str(mean),
            "s": str(s),
            "uIndicacion": str(u_ind),
            "uResol": str(u_res),
            "uCorreccion": str(Decimal(u_cor)),
            "uPatron": str(u_pat),
            "Ucomb": str(Ucomb),
            "vEff": vEff,
            "k": k,
            "Uexp": str(Uexp),
            "error": str(error),
            "resultado": str(resultado),
        })

    return {"engine": app.version, "resultados": resultados}
