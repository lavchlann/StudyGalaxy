import urllib.parse
YT='https://www.youtube.com/watch?v='
B_E=YT+'m2MIpDrF7Es'; B_CH=YT+'YG15m2VwSjA'; B_BIN=YT+'8idr1WZ1A7Q'; B_EUL=YT+'mvmuCPvRoWQ'; B_DET=YT+'Ip3X9LOh2dk'; B_INV=YT+'uQhTuRlWMxw'
V={
'mm3-c01':{'1.2':('limits and differentiation from first principles',('3Blue1Brown: The paradox of the derivative','s:3Blue1Brown The paradox of the derivative')),
 '1.3':('exponential functions and graphs',('3Blue1Brown: What is special about Euler\'s number e',B_E)),
 '1.4':('differentiating e^x',('3Blue1Brown: What is special about Euler\'s number e',B_E)),
 '1.5':('logarithm laws and the natural logarithm',None),'1.6':('solving exponential and logarithmic equations',None),
 '1.7':('differentiating ln x',None),'1.8':('exponential growth and decay modelling',None)},
'mm3-c02':{'2.2':('radians and the unit circle exact values',None),'2.3':('trigonometric graphs amplitude period',None),
 '2.4':('differentiating sin and cos',('3Blue1Brown: Derivative formulas through geometry','s:3Blue1Brown Derivative formulas through geometry')),'2.5':('trigonometric modelling tides',None)},
'mm3-c03':{'3.2':('chain rule',('3Blue1Brown: Visualizing the chain rule and product rule',B_CH)),'3.3':('product rule',('3Blue1Brown: Visualizing the chain rule and product rule',B_CH)),
 '3.4':('quotient rule',None),'3.5':('tangents normals and optimisation',None)},
'mm3-c04':{'4.2':('second derivative',('3Blue1Brown: Higher order derivatives','s:3Blue1Brown Higher order derivatives')),'4.3':('concavity and points of inflection',None),'4.4':('curve sketching with calculus',None),'4.5':('optimisation problems calculus',None)},
'mm3-c05':{'5.2':('anti-differentiation powers of x',None),'5.3':('integrating e^x',None),'5.4':('integrating 1/x and f prime over f',None),'5.5':('integrating sin and cos',None),
 '5.6':('definite integrals and area',('3Blue1Brown: Integration and the fundamental theorem of calculus','s:3Blue1Brown Integration and the fundamental theorem of calculus')),'5.7':('integration kinematics velocity to position',None)},
'mm3-c06':{'6.2':('discrete random variables probability distribution',None),'6.3':('expected value discrete random variable',None),'6.4':('variance and standard deviation discrete random variable',None),'6.5':('expected value decisions and fair games',None)},
'mm3-c07':{'7.2':('Bernoulli distribution',None),'7.3':('binomial distribution',('3Blue1Brown: Binomial distributions',B_BIN)),'7.4':('mean and variance of the binomial',None),'7.5':('binomial modelling',None)},
'ms3-c01':{'1.2':('complex numbers review',None),'1.3':('complex numbers polar form cis',None),'1.4':('De Moivre theorem and roots of complex numbers',('3Blue1Brown: Euler\'s formula with introductory group theory',B_EUL)),'1.5':('factorising polynomials complex roots conjugate root theorem',None)},
'ms3-c02':{'2.2':('mathematical induction',None),'2.3':('induction divisibility proofs',None),'2.4':('De Moivre trig identities',None)},
'ms3-c03':{'3.2':('vectors in three dimensions',('3Blue1Brown: Vectors, what even are they','s:3Blue1Brown Vectors what even are they essence of linear algebra')),'3.3':('dot product of vectors',('3Blue1Brown: Dot products and duality','s:3Blue1Brown Dot products and duality')),
 '3.4':('vector proofs in geometry',None),'3.5':('vector equation of a line in 3D',None),'3.6':('cross product',('3Blue1Brown: Cross products','s:3Blue1Brown Cross products essence of linear algebra')),'3.7':('vector equation of a plane',None)},
'ms3-c04':{'4.2':('position vector parametric equations',None),'4.3':('vectors collision',None),'4.4':('differentiating and integrating vectors',None),'4.5':('rectilinear motion calculus',None),'4.6':('projectile motion with vectors',None)},
'ms3-c05':{'5.2':('matrix inverse and determinant',('3Blue1Brown: The determinant',B_DET)),'5.3':('Gaussian elimination',None),'5.4':('systems of equations number of solutions parameter',('3Blue1Brown: Inverse matrices, column space and null space',B_INV)),'5.5':('Leslie matrices',None),'5.6':('Markov chains transition matrix',None)},
}
HOURS={'mm3-c01':5,'mm3-c02':4,'mm3-c03':4,'mm3-c04':4.5,'mm3-c05':4.5,'mm3-c06':3.5,'mm3-c07':3,'ms3-c01':5.5,'ms3-c02':3,'ms3-c03':5,'ms3-c04':4,'ms3-c05':4}
HOURS.update({'ph3-c01':3.5,'ph3-c02':3,'ph3-c03':4,'ph3-c04':4.5,'ph3-c05':4,'ph3-c06':4.5,'ph3-c07':4,'ph3-c08':3.5})
PH={'ph3-c01':['projectile motion components independence','horizontal projectile launch','projectile motion angled launch level ground','projectile launched from a height'],
'ph3-c02':['free body diagrams Newton laws','forces on an inclined plane','friction coefficient physics','pulleys Atwood machine connected objects'],
'ph3-c03':['uniform circular motion','centripetal force','banked curves circular motion','vertical circle circular motion'],
'ph3-c04':['Newton law of gravitation','gravitational field strength','Kepler laws orbits satellites','geostationary satellite weightlessness'],
'ph3-c05':['Coulomb law electric charge','electric field strength','charged particle in uniform electric field'],
'ph3-c06':['magnetic fields and field lines','force on a current carrying wire magnetic field','force on a moving charge magnetic field','electric motor physics'],
'ph3-c07':['magnetic flux','Faraday law Lenz law','moving conductor in a magnetic field emf','AC generator physics'],
'ph3-c08':['ideal transformer','transformer energy losses','power transmission transformers']}
for cid,ts in PH.items():
    V[cid]={'%s.%d'%(cid[-1],i+1):(t,None) for i,t in enumerate(ts)}
def items(topic,extra,cid=''):
    ph=cid.startswith('ph')
    s,nm=('F','Flipping Physics') if ph else ('J','Joel Speranza')
    out=[{'src':s,'title':nm+': '+topic,'url':'https://www.youtube.com/results?search_query='+urllib.parse.quote_plus(nm+' '+topic),'kind':'search'}]
    if extra:
        t,u=extra
        if u.startswith('s:'): out.append({'src':'B','title':t,'url':'https://www.youtube.com/results?search_query='+urllib.parse.quote_plus(u[2:]),'kind':'search'})
        else: out.append({'src':'B','title':t,'url':u,'kind':'video'})
    return out
