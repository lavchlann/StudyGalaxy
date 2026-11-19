import re, json, glob, urllib.parse, sys
def parse(path,out=None):
    chap=None; sec=None; cur=None; deep=False; ins=[None]
    out={} if out is None else out
    def add(b):
        if ins[0] is None: sec['blocks'].append(b)
        else: sec['blocks'].insert(ins[0],b); ins[0]+=1
    def flush():
        nonlocal cur
        cur=None
    for raw in open(path,encoding='utf8').read().split('\n'):
        l=raw.rstrip()
        if not l.strip(): continue
        if l.startswith('===') and (l.rstrip().endswith('append') or l.rstrip().endswith('deepen')):
            chap=out[re.match(r'===\s*(\S+)',l).group(1)]; sec=None; cur=None; deep=l.rstrip().endswith('deepen'); continue
        if l.startswith('==='):
            m=re.match(r'===\s*(\S+)\s*\|\s*interactive:\s*(\S+)',l)
            chap={'id':m.group(1),'interactive':m.group(2),'summary':'','videos':[],'sections':[],'quiz':[],'comets':[]}
            out[chap['id']]=chap; sec=None; cur=None; continue
        if l.startswith('## '):
            if '|' not in l:
                code=l[3:].strip(); sec=[x for x in chap['sections'] if x['code']==code][0]; cur=None
                ins[0]=next((i for i,b in enumerate(sec['blocks']) if b['t']=='tb'),None) if deep else None; continue
            code,title=[x.strip() for x in l[3:].split('|',1)]
            sec={'id':chap['id']+'-s%d'%(len(chap['sections'])+1),'code':code,'title':title,'blocks':[]}
            chap['sections'].append(sec); cur=None; continue
        m=re.match(r'@(\w+)\s?(.*)',l)
        if m:
            k,rest=m.group(1),m.group(2); cur=None
            if k=='summary': chap['summary']=rest
            elif k=='video':
                src,title,url=[x.strip() for x in rest.split(' | ')]
                if url.startswith('search:'):
                    q=url[7:]; 
                    q={'J':'Joel Speranza ','F':'Flipping Physics ','K':'Khan Academy ','V':''}.get(src,'')+q
                    url='https://www.youtube.com/results?search_query='+urllib.parse.quote_plus(q); kind='search'
                else: kind='video'
                chap['videos'].append({'src':src,'title':title,'url':url,'kind':kind})
            elif k in('p','key','warn'): add({'t':k,'x':rest})
            elif k=='ex':
                cur={'t':'ex','title':rest,'q':'','s':[],'a':''}; add(cur)
            elif k=='fc':
                typ,body=[x.strip() for x in rest.split('|',1)];f,bk=[x.strip().replace('\\n','\n') for x in body.split('||',1)]
                chap.setdefault('cards',[]).append({'type':typ,'topic':sec['title'] if sec else 'General','f':f,'b':bk})
            elif k=='int':
                n,cap=[x.strip() for x in rest.split('|',1)]; sec['blocks'].append({'t':'int','name':n,'cap':cap})
            elif k=='tb':
                mm=re.match(r'rec=(\S*)\s+ext=(\S*)\s*\|\s*(.*)',rest)
                sec['blocks'].append({'t':'tb','rec':mm.group(1),'ext':mm.group(2),'x':mm.group(3),'code':sec['code']})
            elif k in('quiz','comet'):
                topic,q=[x.strip() for x in rest.split(' | ',1)]
                cur={'topic':topic,'q':q,'a':'','alt':[],'ad':'','sol':'','h':[]}
                chap['quiz' if k=='quiz' else 'comets'].append(cur)
            else: raise Exception('unknown '+k+' '+l)
            continue
        if cur is None: raise Exception('orphan line: '+l)
        if cur.get('t')=='ex':
            if l.startswith('Q:'): cur['q']=l[2:].strip()
            elif l.startswith('S:'): cur['s'].append(l[2:].strip())
            elif l.startswith('A:'): cur['a']=l[2:].strip()
            else: raise Exception('bad ex line '+l)
        else:
            if l.startswith('ALT:'): cur['alt']=[x.strip() for x in l[4:].split('||') if x.strip()]
            elif l.startswith('AD:'): cur['ad']=l[3:].strip()
            elif l.startswith('A:'): cur['a']=l[2:].strip()
            elif l.startswith('SOL:'): cur['sol']=l[4:].strip()
            elif l.startswith('H:'): cur['h']=[x.strip() for x in l[2:].split('||')]
            else: raise Exception('bad q line '+l)
    return out
allc={}
import sys; sys.path.insert(0,'/home/claude/galaxy-src')
import vids
allc={}
for f in sorted(glob.glob('/tmp/work/content/*.txt')):
    if '/x-' not in f and '/y-' not in f: parse(f,allc)
for f in sorted(glob.glob('/tmp/work/content/x-*.txt')): parse(f,allc)
for f in sorted(glob.glob('/tmp/work/content/y-*.txt')): parse(f,allc)
for cid,c in allc.items():
    c['hours']=vids.HOURS[cid]
    for sec in c['sections']:
        v=vids.V.get(cid,{}).get(sec['code'])
        if v and not any(b['t']=='vid' for b in sec['blocks']): sec['blocks'].insert(0,{'t':'vid','items':vids.items(*v,cid)})
bad=0
for cid,c in allc.items():
    for k in('quiz','comets'):
        for q in c[k]:
            if not(q['a'] and q['ad'] and q['sol'] and len(q['h'])==3):
                print('BAD',cid,q['q'][:60],len(q['h']),bool(q['a']),bool(q['ad'])); bad+=1
    print(cid,len(c.get('cards',[])),'cards',sum(len(x['blocks']) for x in c['sections']),'blocks',len(c['sections']),'secs',len(c['quiz']),'quiz',len(c['comets']),'comets',len(c['videos']),'vids')
json.dump(allc,open('/tmp/work/content.json','w'),separators=(',',':'))
print('bad',bad)
