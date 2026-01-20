import numpy as np

def char_func_CIR(u, t, y, kappa, eta, lda):
    
    ''' 
    Characteristic function for the CIR model 
    '''
    gm = np.sqrt(kappa**2 - 2.*(lda**2)*u*1j)
    bbn = 2.*(np.exp(gm*t) - 1)*(1j*u)
    bbd = gm - kappa + np.exp(gm*t)*(gm + kappa)
    bb = bbn/bbd
    aau = 2.*gm * np.exp(0.5*(gm + kappa)*t)
    aad = gm - kappa + np.exp(gm*t)*(gm + kappa)
    aa = (kappa*eta*2./(lda**2))*np.log(aau/aad)
    z = np.exp(aa + bb*y)
    return z

def log_char_func_VG(u, sig, nu, theta):
    
    '''
    log-characteristic functon for the VG model 
    '''
    z = -np.log(1.0 - 1j*nu*theta*u + 0.5*sig*sig*nu*u*u) / nu
    return z

def generic_CF(model, u, S0, r, q, T, params):
    
    ''' 
    Computes the characteristic function for different models (BMS, Heston, VG, ...). 
    
    ''' 
    
    if model == 'GBM':
        # unpack parameters
        sig = params[0]
        # characteristic function
        mu = np.log(S0) + (r-q-sig**2/2)*T
        a = sig*np.sqrt(T)
        phi = np.exp(1j*mu*u-(a*u)**2/2)        
    elif model == 'Heston': 
        
        # unpack parameters
        kappa  = params[0]
        theta  = params[1]
        sigma  = params[2]
        rho    = params[3]
        v0     = params[4]
        # characteristic function
        tmp = (kappa-1j*rho*sigma*u)
        g = np.sqrt((sigma**2)*(u**2+1j*u)+tmp**2)        
        pow1 = 2*kappa*theta/(sigma**2)
        numer1 = (kappa*theta*T*tmp)/(sigma**2) + 1j*u*T*r + 1j*u*np.log(S0)
        log_denum1 = pow1 * np.log(np.cosh(g*T/2)+(tmp/g)*np.sinh(g*T/2))
        tmp2 = ((u*u+1j*u)*v0)/(g/np.tanh(g*T/2)+tmp)
        log_phi = numer1 - log_denum1 - tmp2
        phi = np.exp(log_phi)
    elif model == 'VG':
        # unpack parameters
        sigma  = params[0];
        nu     = params[1];
        theta  = params[2];
        # characteristic function
        if nu == 0:
            mu = np.log(S0) + (r-q - theta -0.5*sigma**2)*T
            phi  = np.exp(1j*u*mu) * np.exp((1j*theta*u-0.5*sigma**2*u**2)*T)
        else:
            mu  = np.log(S0) + (r-q + np.log(1-theta*nu-0.5*sigma**2*nu)/nu)*T
            phi = np.exp(1j*u*mu)*((1-1j*nu*theta*u+0.5*nu*sigma**2*u**2)**(-T/nu))           
    elif model == 'VGSA':
        # unpack parameters
        sig = params[0]
        nu = params[1]
        theta = params[2]
        kappa = params[3]
        eta = params[4]
        lda = params[5]
        # characteristic function
        tmp = 1j*(np.log(S0) + (r - q)*T)*u
        u1 = -1j*log_char_func_VG(u, sig, nu, theta)
        u2 = -1j*log_char_func_VG(-1j, sig, nu, theta)   
        numer = char_func_CIR(u1, T, 1.0/nu, kappa, eta, lda)
        denom = char_func_CIR(u2, T, 1.0/nu, kappa, eta, lda)      
        phi = np.exp(tmp) * numer / np.power(denom, 1j*u)
    return phi

def generic_fft(model, eta, alpha, N, S0, K, r, q, T, params):
    
    ''' 
    Model-free option pricing using FFT
    Set alpha > 0 for calls and alpha < 0 for puts. 
    Removed the 'for' loops to make code faster. 
    
    This is a pretty generic setup!
    
    '''
    
    # step-size in log strike space
    lda = (2*np.pi/N)/eta 
    
    # choice of beta
    #beta = np.log(S0) - N*lda/2 # the log strike we want is in the middle of the array
    beta = np.log(K) # the log strike we want is the first element of the array
    
    # forming vector x and strikes km for m=1,...,N
    km = np.zeros(N)
    xX = np.zeros(N) 
    
    # discount factor
    df = np.exp(-r*T)    
    nuJ = np.arange(N)*eta
    psi_nuJ = generic_CF(model, nuJ - (alpha + 1)*1j, S0, r, q, T, params)/((alpha + 1j*nuJ)*(alpha+1+1j*nuJ))   
    km = beta + lda*np.arange(N)
    w = eta*np.ones(N)
    w[0] = eta/2
    xX = np.exp(-1j*beta*nuJ)*df*psi_nuJ*w     
    yY = np.fft.fft(xX)
    cT_km = np.zeros(N) 
    multiplier = np.exp(-alpha*km)/np.pi
    cT_km = multiplier*np.real(yY)    
    return cT_km[0]