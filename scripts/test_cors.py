import httpx
url='http://127.0.0.1:8000/flow/generate'
headers={'Origin':'http://localhost:5173','Content-Type':'application/json'}
try:
    r = httpx.post(url, json={'prompt':'find ai news'}, headers=headers, timeout=10.0)
    print('status', r.status_code)
    for k, v in r.headers.items():
        if 'access-control' in k.lower() or k.lower() in ('content-type','content-length'):
            print(f'{k}: {v}')
    print('body sample:', r.text[:400])
except Exception as e:
    print('error', e)
