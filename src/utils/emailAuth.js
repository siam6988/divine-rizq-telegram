// Email Authentication System
async function handleEmailSignUp(email, password, name) {
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Update user profile
        await user.updateProfile({
            displayName: name
        });
        
        console.log('Email user signed up successfully');
        return { success: true, user };
    } catch (error) {
        console.error('Email sign up error:', error);
        return { success: false, error: error.message };
    }
}

async function handleEmailSignIn(email, password) {
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        console.log('Email user signed in successfully');
        return { success: true, user: userCredential.user };
    } catch (error) {
        console.error('Email sign in error:', error);
        return { success: false, error: error.message };
    }
}

async function handlePasswordReset(email) {
    try {
        await auth.sendPasswordResetEmail(email);
        return { success: true };
    } catch (error) {
        console.error('Password reset error:', error);
        return { success: false, error: error.message };
    }
}

function signOut() {
    auth.signOut().then(() => {
        console.log('User signed out');
        showLoginPage();
    }).catch((error) => {
        console.error('Sign out error:', error);
    });
}
