import argparse
import json
from datetime import date
from pathlib import Path


def clean_str(value):
    if not isinstance(value, str):
        return None
    s = value.strip()
    return s or None


def parse_date_iso(value):
    s = clean_str(value)
    if not s:
        return None
    try:
        date.fromisoformat(s)
        return s
    except ValueError:
        return None


def clean_int(value):
    if isinstance(value, bool):
        return None
    if isinstance(value, int):
        return value
    if isinstance(value, str):
        v = value.strip()
        if not v:
            return None
        try:
            return int(v)
        except ValueError:
            return None
    return None


def clean_viatura(value):
    if not isinstance(value, dict):
        return None
    marca = clean_str(value.get("marca"))
    modelo = clean_str(value.get("modelo"))
    matricula = clean_str(value.get("matricula"))
    if not (marca and modelo and matricula):
        return None
    return {"marca": marca, "modelo": modelo, "matricula": matricula}


def clean_intervencoes(value):
    if not isinstance(value, list):
        return []

    cleaned = []
    seen = set()

    for item in value:
        if not isinstance(item, dict):
            continue

        codigo = clean_str(item.get("codigo"))
        nome = clean_str(item.get("nome"))
        descricao = clean_str(item.get("descricao"))
        if not (codigo and nome and descricao):
            continue

        key = (codigo, nome, descricao)
        if key in seen:
            continue
        seen.add(key)

        cleaned.append({"codigo": codigo, "nome": nome, "descricao": descricao})

    return cleaned


def clean_repair(raw):
    if not isinstance(raw, dict):
        return None

    nome = clean_str(raw.get("nome"))
    nif = clean_int(raw.get("nif"))
    data_iso = parse_date_iso(raw.get("data"))
    viatura = clean_viatura(raw.get("viatura"))
    intervencoes = clean_intervencoes(raw.get("intervencoes"))

    if not (nome and nif is not None and data_iso and viatura):
        return None

    return {
        "nome": nome,
        "nif": nif,
        "data": data_iso,
        "viatura": viatura,
        "intervencoes": intervencoes,
        "nr_intervencoes": len(intervencoes),
    }


def iter_repairs(data):
    if isinstance(data, dict) and isinstance(data.get("reparacoes"), list):
        return data["reparacoes"]
    if isinstance(data, list):
        return data
    return []


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("input", nargs="?", default="dataset_reparacoes.json")
    parser.add_argument("--out", default="dataset_reparacoes_fixed.json")
    args = parser.parse_args()

    input_path = Path(args.input)
    out_json_path = Path(args.out)

    with input_path.open("r", encoding="utf-8") as f:
        data = json.load(f)

    cleaned_repairs = []
    for raw in iter_repairs(data):
        cleaned = clean_repair(raw)
        if cleaned is not None:
            cleaned_repairs.append(cleaned)

    with out_json_path.open("w", encoding="utf-8") as f:
        json.dump(cleaned_repairs, f, ensure_ascii=False, indent=2)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
