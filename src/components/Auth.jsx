import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Globe, Info, Lock } from 'lucide-react';

const Auth = ({ language = 'en', setLanguage, translations = {} }) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedRole, setSelectedRole] = useState('worker');
  const [inviteCode, setInviteCode] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showLanguages, setShowLanguages] = useState(false);
  const [showRoleInfo, setShowRoleInfo] = useState(false);
  const passwordsMatch = password && confirmPassword && password === confirmPassword;


  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'pt', name: 'Português', flag: '🇧🇷' },
  ];

  const roles = [
    {
      value: 'worker',
      label: { en: 'Worker', pt: 'Trabalhador' },
      description: { 
        en: 'Submit work reports and track payments',
        pt: 'Enviar relatórios de trabalho e rastrear pagamentos'
      },
      icon: '👷',
      color: 'blue',
      requiresInvite: false
    },
    {
      value: 'manager',
      label: { en: 'Manager', pt: 'Gerente' },
      description: { 
        en: 'Review jobs, manage workers, and generate reports',
        pt: 'Revisar trabalhos, gerenciar trabalhadores e gerar relatórios'
      },
      icon: '👔',
      color: 'purple',
      requiresInvite: true
    },
    {
      value: 'admin',
      label: { en: 'Admin', pt: 'Administrador' },
      description: { 
        en: 'Full system access - manage everything',
        pt: 'Acesso total ao sistema - gerenciar tudo'
      },
      icon: '⚙️',
      color: 'red',
      requiresInvite: true
    }
  ];

  const selectedRoleData = roles.find(r => r.value === selectedRole);

  // VALIDATE INVITE CODE FROM SUPABASE
  const validateInviteCode = async (role, code) => {
    if (role === 'worker') return true; // Workers don't need codes
	console.log('?? VALIDATING:', { role, code: code.trim() });
    
    try {
      // Call the Supabase function to validate and use the code
      const { data, error } = await supabase.rpc('use_invite_code', {
        p_code: code.trim(),
        p_role: role
      });
	  console.log('RESULT:', { data, error });

      if (error) {
        console.error('Invite code validation error:', error);
        return false;
      }

      return data === true;
    } catch (error) {
      console.error('Error validating invite code:', error);
      return false;
    }
  };

  // LOG INVITE CODE USAGE (for audit trail)
  const logInviteCodeUsage = async (code, userId, email, role, success) => {
    try {
      await supabase.rpc('log_invite_code_usage', {
        p_code: code.trim(),
        p_user_id: userId,
        p_email: email,
        p_role: role,
        p_success: success
      });
    } catch (error) {
      console.error('Error logging invite code usage:', error);
      // Don't throw - logging failure shouldn't stop signup
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      if (isSignUp) {
        // Validate full name
        if (!fullName.trim()) {
          throw new Error('Please enter your full name');
        }

        // Validate invite code for manager/admin roles
        if (selectedRole !== 'worker') {
          if (!inviteCode.trim()) {
            throw new Error(
              language === 'en' 
                ? 'Invite code is required for Manager/Admin roles' 
                : 'Código de convite necessário para Gerente/Admin'
            );
          }

          // Validate code against Supabase
          const isValid = await validateInviteCode(selectedRole, inviteCode);
          
          if (!isValid) {
            // Log failed attempt
            await logInviteCodeUsage(inviteCode, null, email, selectedRole, false);
            
            throw new Error(
              language === 'en' 
                ? 'Invalid or expired invite code. Please contact your administrator.' 
                : 'Código de convite inválido ou expirado. Contate o administrador.'
            );
          }
        }
		if (password !== confirmPassword) {
		  throw new Error(
			language === 'en'
			  ? 'Passwords do not match'
			  : 'As senhas não coincidem'
		  );
		}
        // Create the user
        const { data: authData, error: signUpError } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              full_name: fullName,
              role: selectedRole
            }
          }
        });

        if (signUpError) throw signUpError;

        if (authData.user) {
          // Log successful code usage
          if (selectedRole !== 'worker') {
            await logInviteCodeUsage(inviteCode, authData.user.id, email, selectedRole, true);
          }

          // Create profile with role
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: authData.user.id,
              role: selectedRole,
              created_at: new Date().toISOString()
            }, {
              onConflict: 'id'
            });

          if (profileError) {
            console.error('Profile creation error:', profileError);
          }

          setMessage({ 
            type: 'success', 
            text: language === 'en' 
              ? 'Account created! Check your email for confirmation.' 
              : 'Conta criada! Verifique seu email para confirmação.'
          });
          
          // Clear form
          setEmail('');
          setPassword('');
          setFullName('');
          setInviteCode('');
        }
      } else {
        // Sign In
        const { error } = await supabase.auth.signInWithPassword({ 
          email, 
          password 
        });
        
        if (error) throw error;

        setMessage({ 
          type: 'success', 
          text: language === 'en' 
            ? 'Signed in successfully!' 
            : 'Login realizado com sucesso!'
        });
      }
    } catch (error) {
      console.error('Auth error:', error);
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (color) => {
    const colors = {
      blue: 'border-blue-200 bg-blue-50 hover:border-blue-400',
      purple: 'border-purple-200 bg-purple-50 hover:border-purple-400',
      red: 'border-red-200 bg-red-50 hover:border-red-400'
    };
    return colors[color] || colors.blue;
  };

  const getRoleSelectedColor = (color) => {
    const colors = {
      blue: 'border-blue-500 bg-blue-100 ring-2 ring-blue-500',
      purple: 'border-purple-500 bg-purple-100 ring-2 ring-purple-500',
      red: 'border-red-500 bg-red-100 ring-2 ring-red-500'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Language Selector */}
        <div className="flex justify-end mb-6">
          <div className="relative">
            <button
              onClick={() => setShowLanguages(!showLanguages)}
              className="p-2 bg-white hover:bg-gray-50 rounded-lg border border-gray-200 text-gray-600 transition-all flex items-center shadow-sm"
            >
              <Globe className="w-5 h-5" />
            </button>
            
            {showLanguages && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setShowLanguages(false);
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center ${
                      language === lang.code ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                    }`}
                  >
                    <span className="mr-2">{lang.flag}</span>
                    <span className="text-sm">{lang.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-white rounded-2xl shadow-sm border border-gray-200 mb-4">
            <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {language === 'en' ? 'Construction Business Management' : 'Gestão de Negócios de Construção'}
          </h1>
          <p className="text-gray-600 text-sm">
            {language === 'en' ? 'Project management designed for teams' : 'Gestão de projetos para equipes'}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              {isSignUp 
                ? (language === 'en' ? 'Create your account' : 'Criar sua conta')
                : (language === 'en' ? 'Welcome back' : 'Bem-vindo de volta')
              }
            </h2>

            <form onSubmit={handleAuth} className="space-y-4">
              {message.text && (
                <div className={`p-3 rounded-lg text-sm ${
                  message.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-green-50 text-green-800 border border-green-200'
                }`}>
                  {message.text}
                </div>
              )}

              {isSignUp && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'en' ? 'Full Name' : 'Nome Completo'}
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={language === 'en' ? 'John Doe' : 'João Silva'}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  {/* Role Selection */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-medium text-gray-700">
                        {language === 'en' ? 'Select Your Role' : 'Selecione Seu Papel'}
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowRoleInfo(!showRoleInfo)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {showRoleInfo && (
                      <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
                        {language === 'en' 
                          ? 'Worker role is open to all. Manager and Admin roles require an invite code from the database.' 
                          : 'Papel de Trabalhador é aberto. Gerente e Admin requerem código de convite.'}
                      </div>
                    )}

                    <div className="space-y-2">
                      {roles.map((role) => (
                        <button
                          key={role.value}
                          type="button"
                          onClick={() => setSelectedRole(role.value)}
                          className={`w-full p-4 border-2 rounded-lg transition-all text-left ${
                            selectedRole === role.value 
                              ? getRoleSelectedColor(role.color)
                              : getRoleColor(role.color)
                          }`}
                        >
                          <div className="flex items-start">
                            <span className="text-2xl mr-3">{role.icon}</span>
                            <div className="flex-1">
                              <div className="flex items-center">
                                <span className="font-semibold text-gray-900">
                                  {role.label[language] || role.label.en}
                                </span>
                                {role.requiresInvite && (
                                  <Lock className="w-3 h-3 ml-2 text-gray-500" />
                                )}
                              </div>
                              <div className="text-xs text-gray-600 mt-1">
                                {role.description[language] || role.description.en}
                              </div>
                              {role.requiresInvite && (
                                <div className="text-xs text-orange-600 mt-1 font-medium">
                                  {language === 'en' ? '🔒 Requires invite code' : '🔒 Requer código de convite'}
                                </div>
                              )}
                            </div>
                            {selectedRole === role.value && (
                              <div className="ml-2">
                                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Invite Code Field */}
                  {selectedRoleData?.requiresInvite && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <Lock className="w-4 h-4 mr-2 text-orange-600" />
                        {language === 'en' ? 'Invite Code' : 'Código de Convite'}
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        type="text"
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value)}
                        placeholder={language === 'en' ? 'Enter invite code' : 'Digite o código'}
                        className="w-full px-4 py-3 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        required
                      />
                      <p className="text-xs text-gray-600 mt-2">
                        {language === 'en' 
                          ? 'Contact your administrator to get an invite code for this role.' 
                          : 'Contate o administrador para obter o código de convite.'}
                      </p>
                    </div>
                  )}
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'en' ? 'Email' : 'E-mail'}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'en' ? 'Password' : 'Senha'}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="•••••••�?
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  minLength={6}
                />
              </div>
			{isSignUp && (
			  <div>
				<label className="block text-sm font-medium text-gray-700 mb-2">
				  {language === 'en' ? 'Confirm Password' : 'Confirmar Senha'}
				</label>
				<input
				  type="password"
				  value={confirmPassword}
				  onChange={(e) => setConfirmPassword(e.target.value)}
				  placeholder="•••••••�?
				  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-blue-500 transition-colors ${
					confirmPassword
					  ? passwordsMatch
						? 'border-green-400 focus:ring-green-500'
						: 'border-red-400 focus:ring-red-500'
					  : 'border-gray-300'
				  }`}
				  required
				  minLength={6}
				/>
				{confirmPassword && (
				  <p
					className={`text-sm mt-1 ${
					  passwordsMatch ? 'text-green-600' : 'text-red-600'
					}`}
				  >
					{passwordsMatch
					  ? language === 'en'
						? '�?Passwords match'
						: '�?As senhas coincidem'
					  : language === 'en'
						? '�?Passwords do not match'
						: '�?As senhas não coincidem'}
				  </p>
				)}
			  </div>
			)}
			<button
			  type="submit"
			  disabled={
				loading ||
				(isSignUp && (!passwordsMatch || !confirmPassword))
			  }
			  className={`w-full py-3 rounded-lg font-medium transition-colors
				${loading || (isSignUp && (!passwordsMatch || !confirmPassword))
				  ? 'bg-gray-400 text-white cursor-not-allowed'
				  : 'bg-gray-900 text-white hover:bg-gray-800'}
			  `}
			>
			  {loading 
				? (language === 'en' ? 'Loading...' : 'Carregando...')
				: isSignUp 
				  ? (language === 'en' ? 'Create account' : 'Criar conta')
				  : (language === 'en' ? 'Continue with email' : 'Continuar com e-mail')
			  }
			</button>

            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {isSignUp 
                  ? (language === 'en' ? 'Already have an account? ' : 'Já tem uma conta? ')
                  : (language === 'en' ? "Don't have an account yet? " : 'Ainda não tem uma conta? ')
                }
                <button
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setMessage({ type: '', text: '' });
                    setSelectedRole('worker');
                    setInviteCode('');
                  }}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  {isSignUp 
                    ? (language === 'en' ? 'Sign in' : 'Entrar')
                    : (language === 'en' ? 'Sign up' : 'Cadastrar')
                  }
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;