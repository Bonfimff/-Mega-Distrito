import sys

path = r'c:\Users\Felipe Flausino\Documents\Projetos\Ideias\Nova pasta\HTML\gerenciamento.html'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# -- Fix 2: re-indent schedule section + card-mode --
# Find the OLD block (3-tab indented schedule inside the form)
old_marker_start = '\t\t\t\t\t\t\t\t\t</div>\n\t\t\t<section class="gm-builder-block" aria-label="Horário de funcionamento">'
old_marker_end   = '\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t<section class="gm-builder-block" aria-label="Filtros do app">'

# Locate exact start
idx_start = content.find('\t\t\t\t\t\t\t\t\t</div>\n\t\t\t<section class="gm-builder-block" aria-label="Horário de funcionamento">')
if idx_start == -1:
    print("START NOT FOUND - checking alternate...")
    idx_start = content.find('\t\t\t<section class="gm-builder-block" aria-label="Horário de funcionamento">')
    if idx_start == -1:
        # Search without tabs
        idx_start = content.find('<section class="gm-builder-block" aria-label="Horário de funcionamento">')
        print(f"No-tab idx: {idx_start}")
        snippet = content[idx_start-80:idx_start+100]
        print(repr(snippet))
        sys.exit(1)

print(f"Start at index: {idx_start}")
# Close at gm-preview-card-mode closing </div>
# Find the closing </div> after card-mode select
# Look for the card-mode group
idx_card_close = content.find('</div>', content.find('gm-preview-card-mode'))
print(f"Card-mode closing div at: {idx_card_close}")
snippet_before = content[idx_start-5:idx_start+50]
snippet_after  = content[idx_card_close-10:idx_card_close+40]
print("Before:", repr(snippet_before))
print("After:", repr(snippet_after))
