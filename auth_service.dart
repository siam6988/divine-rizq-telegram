import 'package:flutter/foundation.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

class AuthService with ChangeNotifier {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  User? _user;
  
  User? get user => _user;
  
  AuthService() {
    _checkAutoLogin();
  }
  
  // 🔐 Auto Login System
  Future<void> _checkAutoLogin() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final bool isLoggedIn = prefs.getBool('is_logged_in') ?? false;
      
      if (isLoggedIn) {
        _user = _auth.currentUser;
        if (_user != null) {
          await _updateUserData();
        }
      }
      notifyListeners();
    } catch (e) {
      print("Auto-login error: $e");
    }
  }
  
  // 📧 Email/Password Login
  Future<User?> loginWithEmail(String email, String password) async {
    try {
      final UserCredential userCredential = await _auth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );
      
      _user = userCredential.user;
      
      // Save login state
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool('is_logged_in', true);
      await prefs.setString('user_email', email);
      
      await _updateUserData();
      notifyListeners();
      return _user;
    } catch (e) {
      print("Login error: $e");
      return null;
    }
  }
  
  // 🔐 Google Sign In
  Future<User?> signInWithGoogle() async {
    try {
      final GoogleSignInAccount? googleUser = await GoogleSignIn().signIn();
      if (googleUser == null) return null;
      
      final GoogleSignInAuthentication googleAuth = await googleUser.authentication;
      final AuthCredential credential = GoogleAuthProvider.credential(
        accessToken: googleAuth.accessToken,
        idToken: googleAuth.idToken,
      );
      
      final UserCredential userCredential = await _auth.signInWithCredential(credential);
      _user = userCredential.user;
      
      // Save user to Firestore
      await _firestore.collection('users').doc(_user!.uid).set({
        'uid': _user!.uid,
        'email': _user!.email,
        'name': _user!.displayName ?? 'User',
        'balance': 0.0,
        'todayEarnings': 0.0,
        'totalTasks': 0,
        'referralCode': _generateReferralCode(),
        'createdAt': FieldValue.serverTimestamp(),
      }, SetOptions(merge: true));
      
      // Save login state
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool('is_logged_in', true);
      
      notifyListeners();
      return _user;
    } catch (e) {
      print("Google sign-in error: $e");
      return null;
    }
  }
  
  // 👤 Update User Data
  Future<void> _updateUserData() async {
    if (_user == null) return;
    
    await _firestore.collection('users').doc(_user!.uid).set({
      'lastLogin': FieldValue.serverTimestamp(),
    }, SetOptions(merge: true));
  }
  
  // 🔒 Logout
  Future<void> logout() async {
    await _auth.signOut();
    _user = null;
    
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('is_logged_in', false);
    await prefs.remove('user_email');
    
    notifyListeners();
  }
  
  // 📝 Generate Referral Code
  String _generateReferralCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    final random = Random();
    return String.fromCharCodes(Iterable.generate(
      8, (_) => chars.codeUnitAt(random.nextInt(chars.length))));
  }
}
