import json
def ch(prefix, items, start):
    return [{"id":f"{prefix}-c{start+i:02d}","n":f"c{start+i:02d}","title":t} for i,t in enumerate(items)]
mm3=["Calculus of Exponential and Logarithmic Functions","Calculus of Trigonometric Functions","Differentiation Rules","The Second Derivative and Applications of Differentiation","Anti-differentiation","General Discrete Random Variables","Bernoulli and Binomial Distributions"]
mm4=["Further Integration","Cosine and Sine Rules","General Continuous Random Variables","Normal Distributions","Sampling Proportions and Interval Estimates"]
ms3=["Further Complex Numbers","Mathematical Induction and Trigonometric Proofs","Vectors in Two and Three Dimensions","Vector Calculus","Further Matrices"]
ph3=["Projectile Motion","Inclined Planes and Friction","Circular Motion","Gravitational Fields","Electric Fields","Magnetic Fields and Forces","Electromagnetic Induction","Transformers and Power Transmission"]
ph4=["Special Relativity","Quantum Theory","The Standard Model"]
ms4=["Integration Techniques","Applications of Integral Calculus","Rates of Change and Differential Equations","Applications of First-Order Differential Equations","Modelling Motion","Statistical Inference"]
def subj(i,name,hue,u3=[],u4=[]): return {"id":i,"name":name,"hue":hue,"units":{"3":u3,"4":u4}}
state={"v":1,"subjects":[
 subj("mm","Math Methods","#d9b878",ch("mm3",mm3,1),ch("mm4",mm4,8)),
 subj("ms","Math Specialist","#a9a4c9",ch("ms3",ms3,1),ch("ms4",ms4,6)),
 subj("ph","Physics","#8fa8c8",ch("ph3",ph3,1),ch("ph4",ph4,9)),
 dict(subj("bu","Business","#86bfa6"),hidden=True),
 dict(subj("le","Legal Studies","#c98585"),hidden=True),
 dict(subj("en","English General","#c9b98a"),hidden=True)],
 "progress":{},"mistakes":[],"log":[],"flash":None}
s=json.dumps(state,separators=(",",":")).replace("<","\\u003c")
t=open("template.html").read().replace("__STATE__",s)
open("state.json","w").write(json.dumps(state))
print(len(t))
