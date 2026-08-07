"""Geocodificação de endereços via Nominatim (OpenStreetMap) — gratuito, sem chave.

Respeita a política de uso do Nominatim (nominatim.org/release-docs/latest/api/Search/):
no máximo 1 requisição por vez, com User-Agent identificando a aplicação. Só é chamado
ao criar/atualizar um endereço ou loja (baixo volume), nunca em loop nem por requisição
de leitura. Falha de geocodificação nunca é fatal: quem chama recebe (None, None) e o
endereço fica sem coordenadas — o front cai no fallback de abrir o endereço em texto
no Google Maps/Waze externo (ver JS/entregador.js).
"""

import requests

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
USER_AGENT = "MegaDistrito/1.0 (contato.felipeflausino@gmail.com)"


def geocodificar_endereco(rua, bairro=None, cidade=None):
    """Retorna (lat, lng) como float, ou (None, None) se não encontrar/der erro."""
    partes = [p for p in (rua, bairro, cidade) if p]
    if not partes:
        return None, None

    try:
        resp = requests.get(
            NOMINATIM_URL,
            params={"q": ", ".join(partes), "format": "json", "limit": 1, "countrycodes": "br"},
            headers={"User-Agent": USER_AGENT},
            timeout=5,
        )
        resultados = resp.json()
        if not resultados:
            return None, None
        return float(resultados[0]["lat"]), float(resultados[0]["lon"])
    except (requests.RequestException, ValueError, KeyError, IndexError) as erro:
        print(f"[geocoding] Falha ao geocodificar '{', '.join(partes)}': {erro}")
        return None, None
