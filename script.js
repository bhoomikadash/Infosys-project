const container = document.querySelector('.container');
const registerBtn = document.querySelector('.register-btn');
const loginBtn = document.querySelector('.login-btn');

registerBtn.addEventListener('click', () => {
    container.classList.add('active');
});

loginBtn.addEventListener('click', () => {
    container.classList.remove('active');
});

// Subtle 3D tilt on container
let tiltRAF = null;
container.addEventListener('mousemove', (e) => {
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateY = ((x - centerX) / centerX) * 4; // -4 to 4
    const rotateX = -((y - centerY) / centerY) * 4; // -4 to 4
    if (tiltRAF) cancelAnimationFrame(tiltRAF);
    tiltRAF = requestAnimationFrame(() => {
        container.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
});

container.addEventListener('mouseleave', () => {
    container.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
});

document.getElementById('pin').addEventListener('input', function(e) {
    this.value = this.value.replace(/[^0-9]/g, '');
    if (this.value.length > 4) this.value = this.value.slice(0, 4);
});

document.getElementById('pinLogin').addEventListener('input', function(e) {
    this.value = this.value.replace(/[^0-9]/g, '');
    if (this.value.length > 4) this.value = this.value.slice(0, 4);
});

// Add real-time password matching validation
document.getElementById('confirmPassword').addEventListener('input', function(e) {
    const password = document.getElementById("password").value;
    const confirmPassword = this.value;
    const passwordError = document.getElementById("passwordError");
    
    if (confirmPassword.length > 0) {
        if (password !== confirmPassword) {
            passwordError.style.display = "block";
            passwordError.textContent = "Passwords do not match!";
        } else {
            passwordError.style.display = "none";
        }
    } else {
        passwordError.style.display = "none";
    }
});

// Also validate when password field changes
document.getElementById('password').addEventListener('input', function(e) {
    const confirmPassword = document.getElementById("confirmPassword").value;
    const passwordError = document.getElementById("passwordError");
    
    if (confirmPassword.length > 0) {
        if (this.value !== confirmPassword) {
            passwordError.style.display = "block";
            passwordError.textContent = "Passwords do not match!";
        } else {
            passwordError.style.display = "none";
        }
    }
});

document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const email = document.getElementById('emailLogin').value; // Using email field for Firebase Auth
    const password = document.getElementById('passwordLogin').value;
    const pin = document.getElementById('pinLogin').value;

    if (!email || !password || !pin) {
        const form = document.getElementById('loginForm');
        form.classList.add('shake');
        setTimeout(()=>form.classList.remove('shake'), 450);
        alert("Please fill in all fields (Email, Password, and PIN)!");
        return;
    }

    if (!/^[0-9]{4}$/.test(pin)) {
        document.getElementById('pinErrorLogin').style.display = "block";
        return;
    } else {
        document.getElementById('pinErrorLogin').style.display = "none";
    }

    try {
        // Add loading state to button
        const loginButton = document.querySelector('#loginForm .btn');
        loginButton.classList.add('loading');
        loginButton.textContent = 'Logging in...';
        
        // Sign in with Firebase Auth
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        
        // Get user data from Firestore
        const userDoc = await db.collection('users').doc(userCredential.user.uid).get();
        const userData = userDoc.data();
        
        // Verify PIN
        if (userData.pin !== pin) {
            const form = document.getElementById('loginForm');
            form.classList.add('shake');
            setTimeout(()=>form.classList.remove('shake'), 450);
            alert("Invalid PIN!");
            return;
        }
        
        // Show loading animation
        showLoginLoading();
        
        // Store user data for dashboard
        const firstName = userData.firstName || 'User';
        localStorage.setItem('userFirstName', firstName);
        localStorage.setItem('userEmail', userData.email || '');
        localStorage.setItem('userMobile', userData.mobile || '');
        localStorage.setItem('userCountryCode', userData.countryCode || '');
        localStorage.setItem('userLastName', userData.lastName || '');
        
        // Simulate a brief loading time for smooth transition
        setTimeout(() => {
            // Redirect to dashboard
            window.location.href = '../dashboard/dashboard.html';
        }, 1500);
        
    } catch (error) {
        console.error('Login Error:', error);
        
        let userMessage = "Invalid details! ";
        
        // Provide user-friendly error messages
        switch (error.code) {
            case 'auth/user-not-found':
                userMessage += "No account found with this email.";
                break;
            case 'auth/wrong-password':
                userMessage += "Incorrect password.";
                break;
            case 'auth/invalid-email':
                userMessage += "Please enter a valid email address.";
                break;
            case 'auth/too-many-requests':
                userMessage += "Too many failed attempts. Please try again later.";
                break;
            case 'auth/network-request-failed':
                userMessage += "Network error. Please check your internet connection.";
                break;
            default:
                userMessage += "Please check your email and password.";
        }
        
        alert(userMessage);
    }
});

// Magnetic button hover effect
document.querySelectorAll('.btn').forEach(btn => {
    let raf;
    btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const mx = (x / rect.width - 0.5) * 6; // -3..3 deg
        const my = (y / rect.height - 0.5) * -6;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(()=>{
            btn.style.transform = `translateZ(0) rotateX(${my}deg) rotateY(${mx}deg)`;
        });
    });
    btn.addEventListener('mouseleave', ()=>{
        btn.style.transform = 'translateZ(0) rotateX(0deg) rotateY(0deg)';
    });
});

// Lightweight background particles
const canvas = document.getElementById('bgParticles');
if (canvas) {
    const ctx = canvas.getContext('2d');
    function resize(){ canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    resize();
    window.addEventListener('resize', resize);
    const particles = Array.from({length: 45}).map(()=>({
        x: Math.random()*canvas.width,
        y: Math.random()*canvas.height,
        r: Math.random()*1.8+0.4,
        vx: (Math.random()-0.5)*0.3,
        vy: (Math.random()-0.5)*0.3,
        a: Math.random()*0.6+0.2
    }));
    function tick(){
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        for (const p of particles){
            p.x += p.vx; p.y += p.vy;
            if (p.x<0||p.x>canvas.width) p.vx*=-1;
            if (p.y<0||p.y>canvas.height) p.vy*=-1;
            ctx.globalAlpha = p.a;
            ctx.beginPath();
            ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
            ctx.fill();
        }
        requestAnimationFrame(tick);
    }
    tick();
}

// Password strength meter and caps lock detection
const pwdInput = document.getElementById('passwordLogin');
const pwdBar = document.getElementById('pwdStrengthBar');
const capsWarning = document.getElementById('capsWarning');
const reqLen = document.getElementById('reqLen');
const reqNum = document.getElementById('reqNum');
const reqCase = document.getElementById('reqCase');
const reqSym = document.getElementById('reqSym');

function evaluateStrength(value) {
    let score = 0;
    const hasLen = value.length >= 8;
    const hasNum = /\d/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasUpper = /[A-Z]/.test(value);
    const hasCase = hasLower && hasUpper;
    const hasSym = /[^A-Za-z0-9]/.test(value);

    reqLen.classList.toggle('ok', hasLen);
    reqNum.classList.toggle('ok', hasNum);
    reqCase.classList.toggle('ok', hasCase);
    reqSym.classList.toggle('ok', hasSym);

    score += hasLen ? 1 : 0;
    score += hasNum ? 1 : 0;
    score += hasCase ? 1 : 0;
    score += hasSym ? 1 : 0;

    const widths = ['10%','35%','65%','100%'];
    pwdBar.style.width = widths[Math.max(0, score-1)];
}

if (pwdInput && pwdBar) {
    pwdInput.addEventListener('input', (e) => evaluateStrength(e.target.value));
    pwdInput.addEventListener('keydown', (e) => {
        if (e.getModifierState && e.getModifierState('CapsLock')) {
            capsWarning.style.display = 'block';
        } else {
            capsWarning.style.display = 'none';
        }
    });
}

// Remember me persistence
const rememberMe = document.getElementById('rememberMe');
if (rememberMe) {
    // Restore saved email
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
        const emailInput = document.getElementById('emailLogin');
        if (emailInput) emailInput.value = savedEmail;
        rememberMe.checked = true;
    }
    rememberMe.addEventListener('change', () => {
        const emailInput = document.getElementById('emailLogin');
        if (rememberMe.checked && emailInput && emailInput.value) {
            localStorage.setItem('rememberedEmail', emailInput.value);
        } else {
            localStorage.removeItem('rememberedEmail');
        }
    });
}

// Magic link mock (UI only)
const magicLinkTrigger = document.getElementById('magicLinkTrigger');
if (magicLinkTrigger) {
    magicLinkTrigger.addEventListener('click', (e) => {
        e.preventDefault();
        const email = document.getElementById('emailLogin').value;
        if (!email) {
            alert('Enter your email to receive a magic link.');
            return;
        }
        const section = document.getElementById('magicLinkSection');
        if (section) section.style.display = 'block';
    });
}

// Show loading animation during login
function showLoginLoading() {
    // Create loading overlay
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'login-loading-overlay';
    loadingOverlay.innerHTML = `
        <div class="login-loading-content">
            <div class="login-spinner"></div>
            <h3>Welcome to Fraud Transaction Detection!</h3>
            <p>Setting up your secure dashboard...</p>
            <div class="loading-progress">
                <div class="progress-bar"></div>
            </div>
        </div>
    `;
    
    document.body.appendChild(loadingOverlay);
    
    // Animate progress bar
    const progressBar = loadingOverlay.querySelector('.progress-bar');
    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += 2;
        progressBar.style.width = progress + '%';
        if (progress >= 100) {
            clearInterval(progressInterval);
        }
    }, 30);
}

// Button ripple effect
document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function (e) {
        const rect = this.getBoundingClientRect();
        const ripple = document.createElement('span');
        const size = Math.max(rect.width, rect.height);
        ripple.style.position = 'absolute';
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = e.clientX - rect.left - size / 2 + 'px';
        ripple.style.top = e.clientY - rect.top - size / 2 + 'px';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'rgba(16, 185, 129, 0.35)';
        ripple.style.pointerEvents = 'none';
        ripple.style.transform = 'scale(0)';
        ripple.style.transition = 'transform 500ms ease, opacity 600ms ease';
        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(ripple);
        requestAnimationFrame(() => {
            ripple.style.transform = 'scale(2)';
            ripple.style.opacity = '0';
        });
        setTimeout(() => ripple.remove(), 650);
    });
});

async function validateAndSubmitForm(event) {
    event.preventDefault();
    
    console.log("=== REGISTRATION FUNCTION CALLED ===");
    
    // Get form values using getElementById (more reliable)
    const firstName = document.getElementById('firstName') ? document.getElementById('firstName').value : '';
    const lastName = document.getElementById('lastName') ? document.getElementById('lastName').value : '';
    const email = document.getElementById('email') ? document.getElementById('email').value : '';
    const mobile = document.getElementById('mobile') ? document.getElementById('mobile').value : '';
    const countryCode = document.getElementById('countryCode') ? document.getElementById('countryCode').value : '';
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const pin = document.getElementById("pin").value;
    
    console.log('Form values:', { firstName, lastName, email, mobile, countryCode, password: password.length, pin });
    
    // Check if Firebase is loaded
    if (typeof firebase === 'undefined') {
        alert("Firebase is not loaded! Please refresh the page.");
        return false;
    }

    // Check if auth and db objects exist
    if (typeof auth === 'undefined' || typeof db === 'undefined') {
        alert("Firebase services not initialized! Please refresh the page.");
        return false;
    }

    // Validate password match
    if (password !== confirmPassword) {
        document.getElementById("passwordError").style.display = "block";
        document.getElementById("passwordError").textContent = "Passwords do not match!";
        return false;
    } else {
        document.getElementById("passwordError").style.display = "none";
    }

    // Validate PIN
    if (!/^[0-9]{4}$/.test(pin)) {
        alert("PIN must be exactly 4 digits!");
        return false;
    }

    // Check if email is empty
    if (!email || email.trim() === '') {
        alert("Email is required!");
        return false;
    }

    try {
        console.log('Creating user with email:', email);
        
        // Create user with Firebase Auth
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        console.log('User created successfully:', userCredential.user.uid);
        
        // Store additional user data in Firestore
        await db.collection('users').doc(userCredential.user.uid).set({
            firstName: firstName,
            lastName: lastName,
            email: email,
            mobile: mobile,
            countryCode: countryCode,
            pin: pin,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        console.log('User data stored in Firestore successfully');
        alert("Registration successful! You can now log in.");
        container.classList.remove('active');
        
    } catch (error) {
        console.error('Firebase Registration Error:', error);
        
        let userMessage = "Registration failed: ";
        switch (error.code) {
            case 'auth/email-already-in-use':
                userMessage += "This email is already registered. Please use a different email or try logging in.";
                break;
            case 'auth/invalid-email':
                userMessage += "Please enter a valid email address.";
                break;
            case 'auth/weak-password':
                userMessage += "Password is too weak. Please use at least 6 characters.";
                break;
            case 'auth/network-request-failed':
                userMessage += "Network error. Please check your internet connection.";
                break;
            default:
                userMessage += error.message;
        }
        
        alert(userMessage);
    }
}

function togglePasswordVisibility(passwordId, eyeIcon) {
    let passwordField = document.getElementById(passwordId);
    if (passwordField.type === "password") {
        passwordField.type = "text";
        eyeIcon.textContent = "🚫";
    } else {
        passwordField.type = "password";
        eyeIcon.textContent = "👁";
    }
}

function togglePinVisibility(pinId, eyeIcon) {
    let pinField = document.getElementById(pinId);
    if (pinField.type === "password") {
        pinField.type = "text";
        eyeIcon.textContent = "🚫";
    } else {
        pinField.type = "password";
        eyeIcon.textContent = "👁";
    }
}

// Google Sign-In Function
async function signInWithGoogle() {
    try {
        // Check if Firebase is loaded
        if (typeof firebase === 'undefined') {
            alert("Firebase is not loaded! Please refresh the page.");
            return;
        }

        // Check if auth object exists
        if (typeof auth === 'undefined') {
            alert("Firebase services not initialized! Please refresh the page.");
            return;
        }

        // Create Google provider
        const provider = new firebase.auth.GoogleAuthProvider();
        
        // Add scopes if needed (optional)
        provider.addScope('email');
        provider.addScope('profile');
        
        // Sign in with popup
        const result = await auth.signInWithPopup(provider);
        
        // Get user info
        const user = result.user;
        console.log('Google sign-in successful:', user);
        
        // Check if user already exists in Firestore
        const userDoc = await db.collection('users').doc(user.uid).get();
        
        if (!userDoc.exists) {
            // New user - create profile in Firestore
            await db.collection('users').doc(user.uid).set({
                firstName: user.displayName ? user.displayName.split(' ')[0] : '',
                lastName: user.displayName ? user.displayName.split(' ').slice(1).join(' ') : '',
                email: user.email,
                mobile: '',
                countryCode: '+1',
                pin: '0000', // Default PIN for Google users
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                provider: 'google',
                googleId: user.uid
            });
            
            console.log('New Google user profile created in Firestore');
            alert("Google sign-in successful! Welcome to Fraud Detection System.");
        } else {
            // Existing user
            console.log('Existing Google user signed in');
            alert("Welcome back! Google sign-in successful.");
        }
        
        // Store user's first name for dashboard
        const firstName = user.displayName ? user.displayName.split(' ')[0] : 'User';
        localStorage.setItem('userFirstName', firstName);
        
        // Redirect to dashboard
        window.location.href = '../dashboard/dashboard.html';
        
    } catch (error) {
        console.error('Google Sign-In Error:', error);
        
        let userMessage = "Google sign-in failed: ";
        
        switch (error.code) {
            case 'auth/popup-closed-by-user':
                userMessage += "Sign-in was cancelled.";
                break;
            case 'auth/popup-blocked':
                userMessage += "Pop-up was blocked. Please allow pop-ups for this site.";
                break;
            case 'auth/account-exists-with-different-credential':
                userMessage += "An account already exists with the same email but different sign-in credentials.";
                break;
            case 'auth/network-request-failed':
                userMessage += "Network error. Please check your internet connection.";
                break;
            default:
                userMessage += error.message;
        }
        
        alert(userMessage);
    }
}

// Forgot Password/PIN Modal Functionality
const modal = document.getElementById('forgotModal');
const closeBtn = document.querySelector('.close');
const forgotLink = document.querySelector('.forgot-link a');

// Open modal when "Forgot PIN/Password?" is clicked
forgotLink.addEventListener('click', function(e) {
    e.preventDefault();
    modal.style.display = 'block';
    // Reset form
    document.getElementById('forgotForm').reset();
    document.getElementById('pinResetSection').style.display = 'none';
    clearMessages();
});

// Close modal when X is clicked
closeBtn.addEventListener('click', function() {
    modal.style.display = 'none';
    clearMessages();
});

// Close modal when clicking outside
window.addEventListener('click', function(e) {
    if (e.target === modal) {
        modal.style.display = 'none';
        clearMessages();
    }
});

// Handle forgot form submission
document.getElementById('forgotForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('forgotEmail').value;
    const resetPassword = document.getElementById('resetPassword').checked;
    const resetPIN = document.getElementById('resetPIN').checked;
    
    if (!email) {
        showMessage('Please enter your email address.', 'error');
        return;
    }
    
    if (!resetPassword && !resetPIN) {
        showMessage('Please select at least one option to reset.', 'error');
        return;
    }
    
    try {
        // Reset Password using Firebase Auth
        if (resetPassword) {
            await auth.sendPasswordResetEmail(email);
            showMessage('Password reset email sent! Check your inbox.', 'success');
        }
        
        // Reset PIN using custom implementation
        if (resetPIN) {
            await sendPINResetCode(email);
            showMessage('PIN reset code sent! Check your email.', 'success');
        }
        
        // Close modal after 3 seconds
        setTimeout(() => {
            modal.style.display = 'none';
            clearMessages();
        }, 3000);
        
    } catch (error) {
        console.error('Reset Error:', error);
        let message = 'Reset failed: ';
        
        switch (error.code) {
            case 'auth/user-not-found':
                message += 'No account found with this email.';
                break;
            case 'auth/invalid-email':
                message += 'Please enter a valid email address.';
                break;
            case 'auth/too-many-requests':
                message += 'Too many requests. Please try again later.';
                break;
            default:
                message += error.message;
        }
        
        showMessage(message, 'error');
    }
});

// Send PIN reset code
async function sendPINResetCode(email) {
    try {
        // Generate a 6-digit reset code
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        // For demo purposes, we'll store the code in localStorage instead of Firestore
        // This avoids the permission issues with Firestore
        const resetData = {
            email: email,
            resetCode: resetCode,
            expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes
            used: false
        };
        
        // Store in localStorage (temporary solution)
        localStorage.setItem('pinResetCode', JSON.stringify(resetData));
        
        // In a real application, you would send this code via email
        // For demo purposes, we'll show it in an alert
        alert(`PIN Reset Code: ${resetCode}\n\nThis code will expire in 15 minutes.\nIn a real app, this would be sent to your email.`);
        
    } catch (error) {
        console.error('PIN Reset Error:', error);
        throw new Error('Failed to send PIN reset code');
    }
}



// Helper functions
function showMessage(message, type) {
    clearMessages();
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    const modalContent = document.querySelector('.modal-content');
    modalContent.insertBefore(messageDiv, modalContent.firstChild);
}

function clearMessages() {
    const messages = document.querySelectorAll('.message');
    messages.forEach(msg => msg.remove());
}


