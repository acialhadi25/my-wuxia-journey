import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Sword, Mail, Lock, User, ArrowLeft, Loader2 } from 'lucide-react';
import { z } from 'zod';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};
    
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }
    
    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.errors[0].message;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast({
              title: "Login Failed",
              description: "Invalid email or password. Please try again.",
              variant: "destructive"
            });
          } else {
            toast({
              title: "Login Failed",
              description: error.message,
              variant: "destructive"
            });
          }
        } else {
          toast({
            title: "Welcome Back, Cultivator",
            description: "Your journey continues..."
          });
          navigate('/');
        }
      } else {
        const { error } = await signUp(email, password, displayName || undefined);
        if (error) {
          if (error.message.includes('already registered')) {
            toast({
              title: "Account Exists",
              description: "This email is already registered. Please login instead.",
              variant: "destructive"
            });
            setIsLogin(true);
          } else {
            toast({
              title: "Signup Failed",
              description: error.message,
              variant: "destructive"
            });
          }
        } else {
          toast({
            title: "Welcome to the Jianghu",
            description: "Your cultivation journey begins now!"
          });
          navigate('/');
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: 'url(/assets/backgrounds/wuxia-dark-moon.jpg)',
        }}
      />
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
      
      {/* Animated mist effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-64 h-64 bg-gold/10 rounded-full blur-[100px] animate-mist" />
        <div className="absolute bottom-40 right-10 w-96 h-96 bg-jade/10 rounded-full blur-[120px] animate-mist" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6 text-white/60 hover:text-white hover:bg-white/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Title
        </Button>

        {/* Form Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-black/50 backdrop-blur-xl border border-white/10 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <Sword className="w-12 h-12 text-gold mx-auto mb-4 rotate-45" />
              <div className="absolute inset-0 w-12 h-12 bg-gold/30 blur-xl rounded-full mx-auto" />
            </div>
            <h1 className="font-display text-2xl sm:text-3xl text-gold-gradient mb-2">
              {isLogin ? 'Enter the Jianghu' : 'Begin Your Legend'}
            </h1>
            <p className="text-sm sm:text-base text-white/60">
              {isLogin ? 'Continue your cultivation journey' : 'Create your cultivator identity'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-sm text-white/70 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Dao Name (Optional)
                </label>
                <Input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your Dao name..."
                  className="bg-black/40 border-white/20 h-14 text-white placeholder:text-white/40 focus:border-gold/50 focus:ring-gold/20"
                  maxLength={30}
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm text-white/70 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors(prev => ({ ...prev, email: undefined }));
                }}
                placeholder="cultivator@jianghu.com"
                className={`bg-black/40 border-white/20 h-14 text-white placeholder:text-white/40 focus:border-gold/50 focus:ring-gold/20 ${errors.email ? 'border-red-500' : ''}`}
                required
              />
              {errors.email && (
                <p className="text-xs text-red-400">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm text-white/70 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors(prev => ({ ...prev, password: undefined }));
                }}
                placeholder="••••••••"
                className={`bg-black/40 border-white/20 h-14 text-white placeholder:text-white/40 focus:border-gold/50 focus:ring-gold/20 ${errors.password ? 'border-red-500' : ''}`}
                required
              />
              {errors.password && (
                <p className="text-xs text-red-400">{errors.password}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="golden"
              size="lg"
              className="w-full h-14 text-lg font-display shadow-lg hover:shadow-gold/30 transition-all duration-300 mt-6"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {isLogin ? 'Entering...' : 'Creating...'}
                </>
              ) : (
                isLogin ? 'Enter the Jianghu' : 'Begin Journey'
              )}
            </Button>
          </form>

          {/* Toggle */}
          <div className="mt-6 text-center">
            <p className="text-sm text-white/50">
              {isLogin ? "Don't have an account?" : "Already a cultivator?"}
            </p>
            <Button
              variant="link"
              onClick={() => {
                setIsLogin(!isLogin);
                setErrors({});
              }}
              className="text-gold hover:text-yellow-300"
            >
              {isLogin ? 'Create Account' : 'Login'}
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom vignette */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
    </div>
  );
}
