import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, FileSearch, Users, Zap, CheckCircle, ArrowRight, Star, Sparkles, TrendingUp, Shield, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";

const Index = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/auth');
  };

  const handleSignIn = () => {
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 overflow-x-hidden">
      {/* Enhanced Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-96 h-96 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full blur-3xl animate-pulse-glow"></div>
        <div className="absolute bottom-10 right-10 w-[30rem] h-[30rem] bg-gradient-to-tl from-accent/20 to-blue-500/20 rounded-full blur-3xl animate-pulse-glow" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-500/15 to-primary/15 rounded-full blur-3xl animate-pulse-glow" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-gradient-to-br from-blue-500/15 to-accent/15 rounded-full blur-3xl animate-pulse-glow" style={{animationDelay: '3s'}}></div>
      </div>

      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-16 relative z-10">
          <div className="text-center">
            
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-8 animate-fade-in leading-tight">
              <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text">
                AI-Powered Resume
              </span>
              <br />
              <span className="bg-gradient-to-r from-accent via-primary to-primary bg-clip-text">
                Screening Platform
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground mb-12 max-w-5xl mx-auto animate-fade-in leading-relaxed">
              Transform your hiring process with revolutionary AI technology. 100% accurate resume analysis, intelligent matching, and comprehensive candidate evaluation in seconds.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-in">
              <Button 
                onClick={handleGetStarted}
                size="lg" 
                className="group hover-scale bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 text-lg px-8 py-6"
              >
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                onClick={handleSignIn}
                variant="outline" 
                size="lg"
                className="hover-scale border-2 text-lg px-8 py-6 bg-background/50 backdrop-blur-sm hover:bg-background/80 transition-all duration-300"
              >
                Sign In
              </Button>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8 mb-16">
              <div className="animate-fade-in hover-scale">
                <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary mb-2 bg-gradient-to-b from-primary to-primary/70 bg-clip-text text-transparent">100%</div>
                <div className="text-muted-foreground text-sm sm:text-base">Accuracy Rate</div>
              </div>
              <div className="animate-fade-in hover-scale" style={{animationDelay: '0.2s'}}>
                <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary mb-2 bg-gradient-to-b from-primary to-primary/70 bg-clip-text text-transparent">10x</div>
                <div className="text-muted-foreground text-sm sm:text-base">Faster Processing</div>
              </div>
              <div className="animate-fade-in hover-scale" style={{animationDelay: '0.4s'}}>
                <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary mb-2 bg-gradient-to-b from-primary to-primary/70 bg-clip-text text-transparent">50+</div>
                <div className="text-muted-foreground text-sm sm:text-base">Skills Detected</div>
              </div>
              <div className="animate-fade-in hover-scale" style={{animationDelay: '0.6s'}}>
                <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary mb-2 bg-gradient-to-b from-primary to-primary/70 bg-clip-text text-transparent">24/7</div>
                <div className="text-muted-foreground text-sm sm:text-base">AI Processing</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-muted/20 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-black animate-fade-in">
              <Sparkles className="w-3 h-3 mr-1" />
              Advanced Features
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 animate-fade-in">
              Revolutionizing Recruitment with{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text">
                Intelligent AI
              </span>
            </h2>
            <p className="text-muted-foreground text-lg lg:text-xl max-w-3xl mx-auto animate-fade-in">
              Experience the next generation of hiring technology with our comprehensive AI-powered platform
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <Card className="hover-scale group border-2 hover:border-primary/30 transition-all duration-300 bg-background/50 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <div className="mb-6 flex justify-center">
                  <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/20 rounded-2xl group-hover:from-primary/20 group-hover:to-primary/30 transition-all duration-300">
                    <Brain className="w-10 h-10 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl lg:text-2xl font-semibold mb-4">Smart Resume Analysis</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Advanced AI extracts key information, skills, and qualifications with 
                  <span className="text-primary font-medium"> 100% accuracy</span>
                </p>
              </CardContent>
            </Card>

            <Card className="hover-scale group border-2 hover:border-primary/30 transition-all duration-300 bg-background/50 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <div className="mb-6 flex justify-center">
                  <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/20 rounded-2xl group-hover:from-primary/20 group-hover:to-primary/30 transition-all duration-300">
                    <FileSearch className="w-10 h-10 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl lg:text-2xl font-semibold mb-4">Intelligent Matching</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Precision algorithms connect perfect candidates with ideal opportunities using 
                  <span className="text-primary font-medium"> advanced semantic analysis</span>
                </p>
              </CardContent>
            </Card>

            <Card className="hover-scale group border-2 hover:border-primary/30 transition-all duration-300 bg-background/50 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <div className="mb-6 flex justify-center">
                  <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/20 rounded-2xl group-hover:from-primary/20 group-hover:to-primary/30 transition-all duration-300">
                    <Users className="w-10 h-10 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl lg:text-2xl font-semibold mb-4">Comprehensive Screening</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Detailed candidate profiles with skills assessment and 
                  <span className="text-primary font-medium"> job fit analysis</span>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-20 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div>
                <Badge variant="outline" className="mb-4 border-black">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Performance Benefits
                </Badge>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
                  Why Leading Companies Choose{" "}
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text ">
                    Our Platform
                  </span>
                </h2>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4 animate-fade-in hover-scale">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg lg:text-xl mb-2">Unmatched Accuracy</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Our AI ensures perfect extraction and analysis of resume data with zero errors, 
                      guaranteeing reliable candidate assessments every time.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4 animate-fade-in hover-scale">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg lg:text-xl mb-2">Lightning-Fast Processing</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Process hundreds of resumes in seconds, not hours. Our optimized AI delivers 
                      instant results without compromising quality.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4 animate-fade-in hover-scale">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg lg:text-xl mb-2">Intelligent Candidate Matching</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Find the perfect candidates based on skills, experience, and cultural fit using 
                      advanced machine learning algorithms.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 animate-fade-in hover-scale">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg lg:text-xl mb-2">24/7 Automated Processing</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Continuous AI processing means your recruitment never stops, with real-time 
                      analysis and instant candidate recommendations.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center items-center">
              <Card className="p-8 lg:p-12 text-center hover-scale bg-gradient-to-br from-background to-muted/30 border-2 border-primary/20 shadow-2xl">
                <div className="mb-6">
                  <div className="text-4xl lg:text-5xl font-bold text-primary mb-4 bg-gradient-to-b from-primary to-primary/70 bg-clip-text">
                    Ready to Transform Your Hiring?
                  </div>
                  <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
                    Join thousands of companies revolutionizing their recruitment process with AI
                  </p>
                </div>
                <div className="space-y-4">
                  <Button 
                    onClick={handleGetStarted}
                    size="lg" 
                    className="w-full group bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 text-lg py-6"
                  >
                    Start Free Trial Now
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  {/* <p className="text-sm text-muted-foreground">
                    No credit card required
                  </p> */}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 border-t border-border bg-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-muted-foreground flex flex-col sm:flex-row items-center justify-center gap-4">
            <p>This is done by Karthikeya</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/about')}
              className="hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              Contact me
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;