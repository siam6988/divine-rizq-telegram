import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'screens/auth/login_screen.dart';
import 'screens/dashboard/dashboard_screen.dart';
import 'services/auth_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(options: FirebaseOptions(
    apiKey: "AIzaSyB_-PefTn0NVzSJpkAS0o71zfPCb5Yhkr4",
    authDomain: "divine-rizq.firebaseapp.com",
    projectId: "divine-rizq",
    storageBucket: "divine-rizq.firebasestorage.app",
    messagingSenderId: "864023029515",
    appId: "1:864023029515:web:9f1dc6e02d259910c6a40e",
  ));
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthService()),
      ],
      child: MaterialApp(
        title: 'Divine RizQ',
        theme: ThemeData(
          primaryColor: Color(0xFF10B981),
          backgroundColor: Colors.white,
          fontFamily: 'Hind Siliguri',
        ),
        home: AuthWrapper(),
      ),
    );
  }
}

class AuthWrapper extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final authService = Provider.of<AuthService>(context);
    
    if (authService.user == null) {
      return LoginScreen();
    }
    return DashboardScreen();
  }
}
