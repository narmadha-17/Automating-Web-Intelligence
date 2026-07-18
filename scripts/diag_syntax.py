import ast, sys
path = r"c:\Users\ASUS\Downloads\scrapient\Scrapient\Automating-Web-Intelligence\app\services\flow_service.py"
with open(path, encoding='utf-8', errors='replace') as f:
    src = f.read()
try:
    ast.parse(src, filename=path)
    print('OK: no syntax errors')
except SyntaxError as e:
    print('SyntaxError:', e.msg)
    print('File:', e.filename)
    print('Line:', e.lineno)
    print('Offset:', e.offset)
    lines = src.splitlines()
    if e.lineno and 1 <= e.lineno <= len(lines):
        print('>>', lines[e.lineno-1])
    sys.exit(1)
