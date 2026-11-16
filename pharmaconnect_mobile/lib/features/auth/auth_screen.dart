import 'package:flutter/material.dart';
import '../../core/services/pharma_store.dart';
import '../../core/theme/app_theme.dart';

class AuthScreen extends StatefulWidget {
  const AuthScreen({
    super.key,
    required this.store,
    required this.onAuthenticated,
    required this.onContinueGuest,
  });

  final PharmaStore store;
  final VoidCallback onAuthenticated;
  final VoidCallback onContinueGuest;

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  bool isRegister = false;
  bool obscure = true;
  bool submitting = false;
  String? errorText;

  final formKey = GlobalKey<FormState>();
  final name = TextEditingController();
  final email = TextEditingController();
  final password = TextEditingController();

  @override
  void dispose() {
    name.dispose();
    email.dispose();
    password.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!formKey.currentState!.validate()) return;
    setState(() {
      submitting = true;
      errorText = null;
    });
    try {
      if (isRegister) {
        await widget.store.registerVisitor(
          name: name.text,
          email: email.text,
          password: password.text,
        );
      } else {
        await widget.store.loginVisitor(
          email: email.text,
          password: password.text,
        );
      }
      if (!mounted) return;
      widget.onAuthenticated();
    } catch (e) {
      if (!mounted) return;
      setState(() => errorText = e.toString());
    } finally {
      if (mounted) setState(() => submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 440),
              child: Form(
                key: formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Align(
                      alignment: Alignment.centerLeft,
                      child: Container(
                        height: 76,
                        width: 76,
                        decoration: BoxDecoration(
                          color: AppColors.mint,
                          borderRadius: BorderRadius.circular(24),
                        ),
                        child: const Icon(
                          Icons.medical_services_rounded,
                          color: AppColors.green,
                          size: 42,
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),
                    const Text(
                      'PharmaConnect',
                      style: TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.w800,
                        color: AppColors.darkGreen,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      isRegister
                          ? 'Créez votre compte visiteur pour suivre vos messages.'
                          : 'Connectez-vous à votre espace visiteur.',
                      style: const TextStyle(color: AppColors.muted),
                    ),
                    const SizedBox(height: 26),
                    if (errorText != null) ...[
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFFF1EE),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: const Color(0xFFF2C8C3)),
                        ),
                        child: Text(
                          errorText!,
                          style: const TextStyle(
                            color: AppColors.danger,
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),
                    ],
                    if (isRegister) ...[
                      TextFormField(
                        controller: name,
                        decoration: const InputDecoration(
                          labelText: 'Nom et prénom',
                          prefixIcon: Icon(Icons.person_outline),
                        ),
                        validator: (v) => (v == null || v.trim().length < 2)
                            ? 'Saisissez au moins 2 caractères.'
                            : null,
                      ),
                      const SizedBox(height: 14),
                    ],
                    TextFormField(
                      controller: email,
                      keyboardType: TextInputType.emailAddress,
                      decoration: const InputDecoration(
                        labelText: 'Adresse e-mail',
                        prefixIcon: Icon(Icons.alternate_email),
                      ),
                      validator: (v) =>
                          (v == null || !v.contains('@'))
                              ? 'Saisissez une adresse e-mail valide.'
                              : null,
                    ),
                    const SizedBox(height: 14),
                    TextFormField(
                      controller: password,
                      obscureText: obscure,
                      decoration: InputDecoration(
                        labelText: 'Mot de passe',
                        prefixIcon: const Icon(Icons.lock_outline),
                        suffixIcon: IconButton(
                          onPressed: () => setState(() => obscure = !obscure),
                          icon: Icon(
                            obscure
                                ? Icons.visibility_outlined
                                : Icons.visibility_off_outlined,
                          ),
                        ),
                      ),
                      validator: (v) {
                        if (v == null || v.isEmpty) {
                          return 'Ce champ est obligatoire.';
                        }
                        if (isRegister && v.length < 8) {
                          return '8 caractères minimum (majuscule, minuscule, chiffre).';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 22),
                    FilledButton(
                      onPressed: submitting ? null : _submit,
                      child: Padding(
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        child: submitting
                            ? const SizedBox(
                                height: 18,
                                width: 18,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  color: Colors.white,
                                ),
                              )
                            : Text(
                                isRegister ? 'Créer mon compte' : 'Se connecter',
                              ),
                      ),
                    ),
                    const SizedBox(height: 8),
                    TextButton(
                      onPressed: submitting
                          ? null
                          : () => setState(() {
                                isRegister = !isRegister;
                                errorText = null;
                              }),
                      child: Text(
                        isRegister
                            ? 'J’ai déjà un compte · Se connecter'
                            : 'Nouveau sur PharmaConnect ? Créer un compte',
                      ),
                    ),
                    const SizedBox(height: 8),
                    OutlinedButton(
                      onPressed: submitting ? null : widget.onContinueGuest,
                      child: const Padding(
                        padding: EdgeInsets.symmetric(vertical: 12),
                        child: Text('Consulter sans compte (Visiteur)'),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
