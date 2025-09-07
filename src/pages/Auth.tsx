import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { Brain, Shield, Zap, Star, ArrowLeft } from 'lucide-react';
import logo from '@/assets/logo.png';

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [signInData, setSignInData] = useState({ email: '', password: '' });
  const [signUpData, setSignUpData] = useState({ email: '', password: '', fullName: '' });
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { error } = await signIn(signInData.email, signInData.password);
    
    if (!error) {
      navigate('/dashboard');
    }
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { error } = await signUp(signUpData.email, signUpData.password, signUpData.fullName);
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse-glow"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse-glow" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-secondary/10 rounded-full blur-3xl animate-pulse-glow" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Back to Home Button */}
      {/* <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="hover-scale group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Button>
      </div> */}

      <div className="min-h-screen flex flex-col lg:flex-row relative z-10">
        {/* Left Side - Marketing Content (Hidden on mobile) */}
        <div className="hidden lg:flex lg:w-1/2 p-8 xl:p-12 flex-col justify-center">
          <div className="max-w-lg mx-auto space-y-8">
            <div className="text-center lg:text-left">
              {/* <div className="mb-6 flex justify-center lg:justify-start">
                <img src={logo} alt="AI Resume Screening Logo" className="w-16 h-16 animate-pulse-glow" />
              </div>
              
              <Badge variant="secondary" className="mb-4">
                <Star className="w-3 h-3 mr-1" />
                Trusted by Leading Companies
              </Badge> */}
              
              <h1 className="text-3xl xl:text-4xl font-bold mb-4">
                Transform Your Hiring with{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text">
                  AI Intelligence
                </span>
              </h1>
              
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                Join thousands of companies revolutionizing their recruitment process 
                with 100% accurate AI-powered resume screening and intelligent job matching.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Brain className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">100% Accurate Analysis</h3>
                  <p className="text-muted-foreground">
                    Advanced AI ensures perfect extraction and analysis of resume data
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Lightning Fast Processing</h3>
                  <p className="text-muted-foreground">
                    Process hundreds of resumes in seconds with instant results
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Enterprise Security</h3>
                  <p className="text-muted-foreground">
                    Bank-level security with complete data privacy and protection
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-muted/30 p-6 rounded-xl border">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary mb-1">100%</div>
                  <div className="text-sm text-muted-foreground">Accuracy</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary mb-1">10x</div>
                  <div className="text-sm text-muted-foreground">Faster</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary mb-1">24/7</div>
                  <div className="text-sm text-muted-foreground">Processing</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Forms */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              {/* <img src={logo} alt="AI Resume Screening Logo" className="w-16 h-16 mx-auto mb-4 animate-pulse-glow" /> */}
              <h2 className="text-2xl font-bold mb-2">Welcome Back</h2>
              <p className="text-muted-foreground">Sign in to your AI-powered recruitment platform</p>
            </div>

            <Card className="bg-background/80 backdrop-blur-sm border-2 hover:border-primary/20 transition-all duration-300 shadow-xl hover:shadow-2xl">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text">
                  Resume Matchmaker
                </CardTitle>
                <CardDescription className="text-base sm:text-lg">
                  AI-powered resume screening and job matching platform
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-0">
                <Tabs defaultValue="signin" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-2 bg-muted/30">
                    <TabsTrigger value="signin" className="text-sm sm:text-base py-3">Sign In</TabsTrigger>
                    <TabsTrigger value="signup" className="text-sm sm:text-base py-3">Sign Up</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="signin" className="space-y-5">
                    <form onSubmit={handleSignIn} className="space-y-5">
                      <div className="space-y-2">
                        <Label htmlFor="signin-email" className="text-sm sm:text-base font-medium">Email Address</Label>
                        <Input
                          id="signin-email"
                          type="email"
                          placeholder="Enter your email address"
                          value={signInData.email}
                          onChange={(e) => setSignInData({...signInData, email: e.target.value})}
                          required
                          className="h-12 text-base border-2 focus:border-primary/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signin-password" className="text-sm sm:text-base font-medium">Password</Label>
                        <Input
                          id="signin-password"
                          type="password"
                          placeholder="Enter your password"
                          value={signInData.password}
                          onChange={(e) => setSignInData({...signInData, password: e.target.value})}
                          required
                          className="h-12 text-base border-2 focus:border-primary/50"
                        />
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full h-12 text-base font-medium hover-scale bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300" 
                        disabled={isLoading}
                      >
                        {isLoading ? 'Signing In...' : 'Sign In to Dashboard'}
                      </Button>
                    </form>
                  </TabsContent>
                  
                  <TabsContent value="signup" className="space-y-5">
                    <form onSubmit={handleSignUp} className="space-y-5">
                      <div className="space-y-2">
                        <Label htmlFor="signup-name" className="text-sm sm:text-base font-medium">Full Name</Label>
                        <Input
                          id="signup-name"
                          type="text"
                          placeholder="Enter your full name"
                          value={signUpData.fullName}
                          onChange={(e) => setSignUpData({...signUpData, fullName: e.target.value})}
                          required
                          className="h-12 text-base border-2 focus:border-primary/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-email" className="text-sm sm:text-base font-medium">Email Address</Label>
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="Enter your email address"
                          value={signUpData.email}
                          onChange={(e) => setSignUpData({...signUpData, email: e.target.value})}
                          required
                          className="h-12 text-base border-2 focus:border-primary/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-password" className="text-sm sm:text-base font-medium">Password</Label>
                        <Input
                          id="signup-password"
                          type="password"
                          placeholder="Create a secure password"
                          value={signUpData.password}
                          onChange={(e) => setSignUpData({...signUpData, password: e.target.value})}
                          required
                          className="h-12 text-base border-2 focus:border-primary/50"
                        />
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full h-12 text-base font-medium hover-scale bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300" 
                        disabled={isLoading}
                      >
                        {isLoading ? 'Creating Account...' : 'Sign In to Dashboard'}
                      </Button>
                    </form>
                    
                    {/* <div className="text-center pt-4">
                      <p className="text-sm text-muted-foreground">
                        By signing up, you agree to our Terms of Service and Privacy Policy
                      </p>
                    </div> */}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Mobile Features */}
            <div className="lg:hidden mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-background/50 rounded-lg border">
                <div className="text-xl font-bold text-primary mb-1">100%</div>
                <div className="text-xs text-muted-foreground">Accuracy</div>
              </div>
              <div className="p-4 bg-background/50 rounded-lg border">
                <div className="text-xl font-bold text-primary mb-1">10x</div>
                <div className="text-xs text-muted-foreground">Faster</div>
              </div>
              <div className="p-4 bg-background/50 rounded-lg border">
                <div className="text-xl font-bold text-primary mb-1">24/7</div>
                <div className="text-xs text-muted-foreground">Processing</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;